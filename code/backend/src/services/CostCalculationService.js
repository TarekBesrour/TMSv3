const RateService = require('./RateService');
const SurchargeService = require('./SurchargeService');
const PricingRuleService = require('./PricingRuleService');
const ContractService = require('./ContractService');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const TransportSegment = require('../models/TransportSegment');

class CostCalculationService {
  // Calculer le coût total d'une commande
  async calculateOrderCost(orderId, options = {}) {
    try {
      const order = await Order.query()
        .findById(orderId)
        .withGraphFetched('[orderLines, customer, shipments.[segments]]');

      if (!order) {
        throw new Error('Commande non trouvée');
      }

      const calculation = {
        order_id: orderId,
        order_reference: order.reference,
        customer: order.customer?.name,
        calculation_date: new Date().toISOString(),
        shipments: [],
        total_cost: 0,
        currency: order.currency || 'EUR',
        breakdown: {
          transport_cost: 0,
          surcharges: 0,
          taxes: 0,
          total: 0
        }
      };

      // Calculer le coût de chaque expédition
      for (const shipment of order.shipments || []) {
        const shipmentCost = await this.calculateShipmentCost(shipment.id, options);
        calculation.shipments.push(shipmentCost);
        calculation.total_cost += shipmentCost.total_cost;
      }

      // Mise à jour du breakdown
      calculation.breakdown.transport_cost = calculation.shipments.reduce(
        (sum, s) => sum + s.breakdown.transport_cost, 0
      );
      calculation.breakdown.surcharges = calculation.shipments.reduce(
        (sum, s) => sum + s.breakdown.surcharges, 0
      );
      calculation.breakdown.taxes = calculation.shipments.reduce(
        (sum, s) => sum + s.breakdown.taxes, 0
      );
      calculation.breakdown.total = calculation.total_cost;

      return calculation;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût de la commande: ${error.message}`);
    }
  }

  // Calculer le coût d'une expédition
  async calculateShipmentCost(shipmentId, options = {}) {
    try {
      const shipment = await Shipment.query()
        .findById(shipmentId)
        .withGraphFetched('[order, segments.[origin, destination], transportUnits]');

      if (!shipment) {
        throw new Error('Expédition non trouvée');
      }

      const calculation = {
        shipment_id: shipmentId,
        shipment_reference: shipment.reference,
        transport_mode: shipment.transport_mode,
        calculation_date: new Date().toISOString(),
        segments: [],
        total_cost: 0,
        currency: shipment.currency || 'EUR',
        breakdown: {
          transport_cost: 0,
          surcharges: 0,
          taxes: 0,
          total: 0
        }
      };

      // Calculer le coût de chaque segment
      for (const segment of shipment.segments || []) {
        const segmentCost = await this.calculateSegmentCost(segment, options);
        calculation.segments.push(segmentCost);
        calculation.total_cost += segmentCost.total_cost;
      }

      // Si pas de segments, calculer comme expédition directe
      if (!shipment.segments || shipment.segments.length === 0) {
        const directCost = await this.calculateDirectShipmentCost(shipment, options);
        calculation.segments.push(directCost);
        calculation.total_cost = directCost.total_cost;
      }

      // Appliquer les règles de tarification au niveau expédition
      if (options.apply_pricing_rules !== false) {
        const ruleResult = await this.applyShipmentPricingRules(shipment, calculation);
        calculation.applied_rules = ruleResult.applied_rules;
        calculation.total_cost = ruleResult.adjusted_total;
      }

      // Mise à jour du breakdown
      calculation.breakdown.transport_cost = calculation.segments.reduce(
        (sum, s) => sum + s.breakdown.transport_cost, 0
      );
      calculation.breakdown.surcharges = calculation.segments.reduce(
        (sum, s) => sum + s.breakdown.surcharges, 0
      );
      calculation.breakdown.taxes = calculation.segments.reduce(
        (sum, s) => sum + s.breakdown.taxes, 0
      );
      calculation.breakdown.total = calculation.total_cost;

      return calculation;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût de l'expédition: ${error.message}`);
    }
  }

  // Calculer le coût d'un segment de transport
  async calculateSegmentCost(segment, options = {}) {
    try {
      const segmentParams = {
        origin_country: segment.origin?.country,
        destination_country: segment.destination?.country,
        origin_zone: segment.origin?.zone,
        destination_zone: segment.destination?.zone,
        transport_mode: segment.transport_mode,
        weight: segment.weight || 0,
        volume: segment.volume || 0,
        distance: segment.distance || 0,
        pallets: segment.pallets || 0,
        containers: segment.containers || 0,
        shipment_date: segment.planned_pickup_date || new Date(),
        partner_id: segment.carrier_id,
        contract_id: segment.contract_id
      };

      const calculation = {
        segment_id: segment.id,
        segment_sequence: segment.sequence_number,
        transport_mode: segment.transport_mode,
        origin: segment.origin?.name,
        destination: segment.destination?.name,
        distance: segment.distance,
        weight: segment.weight,
        volume: segment.volume,
        base_cost: 0,
        surcharges: [],
        total_cost: 0,
        currency: segment.currency || 'EUR',
        breakdown: {
          transport_cost: 0,
          surcharges: 0,
          taxes: 0,
          total: 0
        }
      };

      // Rechercher les tarifs applicables
      const applicableRates = await RateService.findApplicableRates(segmentParams);
      
      if (applicableRates.length === 0) {
        throw new Error(`Aucun tarif applicable trouvé pour le segment ${segment.id}`);
      }

      // Utiliser le meilleur tarif (premier dans la liste triée)
      const bestRate = applicableRates[0];
      const quantity = this.getQuantityForRateType(bestRate.rate_type, segmentParams);
      calculation.base_cost = bestRate.calculateRate(quantity, segmentParams);
      calculation.rate_used = {
        id: bestRate.id,
        name: bestRate.name,
        rate_type: bestRate.rate_type,
        base_rate: bestRate.base_rate
      };

      // Calculer les surcharges applicables
      const surchargeResult = await SurchargeService.calculateSurchargesForShipment(
        calculation.base_cost,
        segmentParams
      );

      calculation.surcharges = surchargeResult.surcharges;
      calculation.total_cost = surchargeResult.final_amount;

      // Calculer les taxes si applicable
      const taxes = this.calculateTaxes(calculation.total_cost, segmentParams);
      calculation.taxes = taxes;
      calculation.total_cost += taxes.total_amount;

      // Mise à jour du breakdown
      calculation.breakdown.transport_cost = calculation.base_cost;
      calculation.breakdown.surcharges = surchargeResult.total_surcharges;
      calculation.breakdown.taxes = taxes.total_amount;
      calculation.breakdown.total = calculation.total_cost;

      return calculation;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût du segment: ${error.message}`);
    }
  }

  // Calculer le coût d'une expédition directe (sans segments)
  async calculateDirectShipmentCost(shipment, options = {}) {
    try {
      const shipmentParams = {
        origin_country: shipment.origin_country,
        destination_country: shipment.destination_country,
        origin_zone: shipment.origin_zone,
        destination_zone: shipment.destination_zone,
        transport_mode: shipment.transport_mode,
        weight: shipment.total_weight || 0,
        volume: shipment.total_volume || 0,
        distance: shipment.total_distance || 0,
        pallets: shipment.total_pallets || 0,
        containers: shipment.total_containers || 0,
        shipment_date: shipment.planned_pickup_date || new Date(),
        partner_id: shipment.carrier_id,
        contract_id: shipment.contract_id
      };

      const calculation = {
        segment_id: 'direct',
        segment_sequence: 1,
        transport_mode: shipment.transport_mode,
        origin: shipment.origin_address,
        destination: shipment.destination_address,
        distance: shipment.total_distance,
        weight: shipment.total_weight,
        volume: shipment.total_volume,
        base_cost: 0,
        surcharges: [],
        total_cost: 0,
        currency: shipment.currency || 'EUR',
        breakdown: {
          transport_cost: 0,
          surcharges: 0,
          taxes: 0,
          total: 0
        }
      };

      // Si un contrat est spécifié, utiliser les tarifs du contrat
      if (shipment.contract_id) {
        const contractCost = await this.calculateContractBasedCost(shipment.contract_id, shipmentParams);
        calculation.base_cost = contractCost.total_cost;
        calculation.contract_used = contractCost.contract_reference;
        calculation.contract_lines = contractCost.line_calculations;
      } else {
        // Sinon, utiliser les tarifs généraux
        const rateResult = await RateService.calculateShipmentCost(shipmentParams);
        if (rateResult.recommended_rate) {
          calculation.base_cost = rateResult.recommended_rate.total_cost;
          calculation.rate_used = {
            id: rateResult.recommended_rate.rate_id,
            name: rateResult.recommended_rate.rate_name,
            rate_type: rateResult.recommended_rate.rate_type
          };
        }
      }

      // Calculer les surcharges applicables
      const surchargeResult = await SurchargeService.calculateSurchargesForShipment(
        calculation.base_cost,
        shipmentParams
      );

      calculation.surcharges = surchargeResult.surcharges;
      calculation.total_cost = surchargeResult.final_amount;

      // Calculer les taxes si applicable
      const taxes = this.calculateTaxes(calculation.total_cost, shipmentParams);
      calculation.taxes = taxes;
      calculation.total_cost += taxes.total_amount;

      // Mise à jour du breakdown
      calculation.breakdown.transport_cost = calculation.base_cost;
      calculation.breakdown.surcharges = surchargeResult.total_surcharges;
      calculation.breakdown.taxes = taxes.total_amount;
      calculation.breakdown.total = calculation.total_cost;

      return calculation;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût de l'expédition directe: ${error.message}`);
    }
  }

  // Calculer le coût basé sur un contrat
  async calculateContractBasedCost(contractId, shipmentParams) {
    try {
      const contract = await ContractService.getContractById(contractId);
      const contractLines = await ContractService.getContractLines(contractId);

      const calculation = {
        contract_id: contractId,
        contract_reference: contract.reference,
        line_calculations: [],
        total_cost: 0,
        currency: contract.currency || 'EUR'
      };

      for (const line of contractLines) {
        if (line.isValidForDate(shipmentParams.shipment_date) &&
            line.isValidForWeight(shipmentParams.weight) &&
            line.isValidForVolume(shipmentParams.volume) &&
            line.isValidForDistance(shipmentParams.distance)) {
          
          const quantity = this.getQuantityForRateType(line.rate_type, shipmentParams);
          const cost = line.calculateRate(quantity, shipmentParams);

          calculation.line_calculations.push({
            line_id: line.id,
            service_type: line.service_type,
            service_description: line.service_description,
            rate_type: line.rate_type,
            rate_value: line.rate_value,
            quantity,
            cost,
            currency: line.currency
          });

          calculation.total_cost += cost;
        }
      }

      return calculation;
    } catch (error) {
      throw new Error(`Erreur lors du calcul basé sur le contrat: ${error.message}`);
    }
  }

  // Appliquer les règles de tarification au niveau expédition
  async applyShipmentPricingRules(shipment, calculation) {
    try {
      const shipmentContext = {
        shipment_id: shipment.id,
        order_id: shipment.order_id,
        customer_id: shipment.customer_id,
        carrier_id: shipment.carrier_id,
        transport_mode: shipment.transport_mode,
        origin_country: shipment.origin_country,
        destination_country: shipment.destination_country,
        origin_zone: shipment.origin_zone,
        destination_zone: shipment.destination_zone,
        weight: shipment.total_weight,
        volume: shipment.total_volume,
        value: shipment.total_value,
        distance: shipment.total_distance,
        shipment_date: shipment.planned_pickup_date || new Date(),
        shipment_type: shipment.shipment_type,
        service_level: shipment.service_level
      };

      const ruleEvaluation = await PricingRuleService.evaluateRulesForShipment(
        shipmentContext,
        shipment.tenant_id
      );

      let adjustedTotal = calculation.total_cost;
      const appliedRules = [];

      for (const ruleResult of ruleEvaluation.rule_results) {
        for (const action of ruleResult.actions) {
          if (action.type === 'rate_adjustment') {
            const adjustment = this.calculateRateAdjustment(adjustedTotal, action);
            adjustedTotal += adjustment.amount;
            
            appliedRules.push({
              rule_id: ruleResult.rule_id,
              rule_name: ruleResult.rule_name,
              adjustment_type: action.adjustment_type,
              original_amount: adjustment.original_amount,
              adjustment_amount: adjustment.amount,
              new_amount: adjustedTotal
            });
          }
        }
      }

      return {
        applied_rules: appliedRules,
        original_total: calculation.total_cost,
        adjusted_total: adjustedTotal
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'application des règles de tarification: ${error.message}`);
    }
  }

  // Calculer les taxes applicables
  calculateTaxes(baseAmount, params) {
    const taxes = {
      items: [],
      total_amount: 0
    };

    // TVA pour transport national
    if (params.origin_country === params.destination_country) {
      const vatRate = this.getVATRate(params.origin_country);
      if (vatRate > 0) {
        const vatAmount = baseAmount * (vatRate / 100);
        taxes.items.push({
          type: 'VAT',
          rate: vatRate,
          amount: vatAmount,
          description: `TVA ${vatRate}%`
        });
        taxes.total_amount += vatAmount;
      }
    }

    // Taxes spécifiques au transport international
    if (params.origin_country !== params.destination_country) {
      // Taxe d'exportation (exemple)
      if (params.transport_mode === 'sea' || params.transport_mode === 'air') {
        const exportTax = baseAmount * 0.005; // 0.5%
        taxes.items.push({
          type: 'EXPORT_TAX',
          rate: 0.5,
          amount: exportTax,
          description: 'Taxe d\'exportation'
        });
        taxes.total_amount += exportTax;
      }
    }

    return taxes;
  }

  // Obtenir le taux de TVA par pays
  getVATRate(country) {
    const vatRates = {
      'FR': 20,
      'DE': 19,
      'ES': 21,
      'IT': 22,
      'BE': 21,
      'NL': 21,
      'GB': 20,
      'US': 0,
      'CA': 5
    };

    return vatRates[country] || 0;
  }

  // Calculer un ajustement de tarif
  calculateRateAdjustment(originalAmount, action) {
    let adjustmentAmount = 0;

        switch (action.adjustment_type) {
      case 'percentage_discount':
        adjustmentAmount = -(originalAmount * action.value / 100);
        break;
      case 'percentage_markup':
        adjustmentAmount = originalAmount * action.value / 100;
        break;
      case 'fixed_discount':
        adjustmentAmount = -Math.min(action.value, originalAmount);
        break;
      case 'fixed_markup':
        adjustmentAmount = action.value;
        break;
      case 'set_rate':
        adjustmentAmount = action.value - originalAmount;
        break;
      default:
        adjustmentAmount = 0;
    }

    return {
      original_amount: originalAmount,
      amount: adjustmentAmount
    };
  }

  // Méthode utilitaire pour obtenir la quantité selon le type de tarif
  getQuantityForRateType(rateType, params) {
    switch (rateType) {
      case 'per_km':
        return params.distance || 0;
      case 'per_kg':
        return params.weight || 0;
      case 'per_m3':
        return params.volume || 0;
      case 'per_pallet':
        return params.pallets || 0;
      case 'per_container':
        return params.containers || 0;
      case 'per_hour':
        return params.hours || 0;
      case 'flat_rate':
      default:
        return 1;
    }
  }

  // Comparer plusieurs options de transport
  async compareTransportOptions(shipmentParams, options = {}) {
    try {
      const comparisons = [];

      // Obtenir tous les tarifs applicables
      const applicableRates = await RateService.findApplicableRates(shipmentParams);

      for (const rate of applicableRates) {
        const calculation = await this.calculateOptionCost(rate, shipmentParams);
        comparisons.push(calculation);
      }

      // Trier par coût total croissant
      comparisons.sort((a, b) => a.total_cost - b.total_cost);

      return {
        shipment_params: shipmentParams,
        options: comparisons,
        recommended_option: comparisons[0] || null,
        comparison_date: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Erreur lors de la comparaison des options: ${error.message}`);
    }
  }

  // Calculer le coût d'une option spécifique
  async calculateOptionCost(rate, shipmentParams) {
    try {
      const quantity = this.getQuantityForRateType(rate.rate_type, shipmentParams);
      const baseCost = rate.calculateRate(quantity, shipmentParams);

      const calculation = {
        rate_id: rate.id,
        rate_name: rate.name,
        transport_mode: rate.transport_mode,
        carrier: rate.partner?.name,
        base_cost: baseCost,
        surcharges: [],
        taxes: [],
        total_cost: baseCost,
        currency: rate.currency,
        estimated_transit_time: this.estimateTransitTime(rate.transport_mode, shipmentParams.distance),
        service_level: rate.service_level || 'standard'
      };

      // Calculer les surcharges
      const surchargeResult = await SurchargeService.calculateSurchargesForShipment(
        baseCost,
        { ...shipmentParams, rate_id: rate.id, partner_id: rate.partner_id }
      );

      calculation.surcharges = surchargeResult.surcharges;
      calculation.total_cost = surchargeResult.final_amount;

      // Calculer les taxes
      const taxes = this.calculateTaxes(calculation.total_cost, shipmentParams);
      calculation.taxes = taxes.items;
      calculation.total_cost += taxes.total_amount;

      return calculation;
    } catch (error) {
      throw new Error(`Erreur lors du calcul de l'option: ${error.message}`);
    }
  }

  // Estimer le temps de transit
  estimateTransitTime(transportMode, distance) {
    const speeds = {
      'road': 80, // km/h moyenne
      'rail': 60,
      'sea': 25,
      'air': 800,
      'multimodal': 50
    };

    const speed = speeds[transportMode] || 50;
    const transitHours = distance / speed;

    // Ajouter du temps pour les opérations de chargement/déchargement
    const handlingTime = {
      'road': 4,
      'rail': 8,
      'sea': 24,
      'air': 6,
      'multimodal': 12
    };

    const totalHours = transitHours + (handlingTime[transportMode] || 8);
    
    return {
      hours: Math.round(totalHours),
      days: Math.ceil(totalHours / 24),
      estimated_delivery: new Date(Date.now() + totalHours * 60 * 60 * 1000).toISOString()
    };
  }

  // Obtenir un devis détaillé
  async generateDetailedQuote(shipmentParams, options = {}) {
    try {
      const quote = {
        quote_id: `QUO-${Date.now()}`,
        quote_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        shipment_details: shipmentParams,
        transport_options: [],
        recommended_option: null,
        total_savings: 0,
        currency: shipmentParams.currency || 'EUR'
      };

      // Comparer les options de transport
      const comparison = await this.compareTransportOptions(shipmentParams, options);
      quote.transport_options = comparison.options;
      quote.recommended_option = comparison.recommended_option;

      // Calculer les économies potentielles
      if (quote.transport_options.length > 1) {
        const mostExpensive = Math.max(...quote.transport_options.map(o => o.total_cost));
        const cheapest = Math.min(...quote.transport_options.map(o => o.total_cost));
        quote.total_savings = mostExpensive - cheapest;
      }

      return quote;
    } catch (error) {
      throw new Error(`Erreur lors de la génération du devis: ${error.message}`);
    }
  }
}

module.exports = new CostCalculationService();

