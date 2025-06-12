const CostCalculationService = require('../services/CostCalculationService');
const { validationResult } = require('express-validator');

class CostCalculationController {
  // Calculer le coût total d'une commande
  async calculateOrderCost(req, res) {
    try {
      const { id } = req.params;
      const options = req.body || {};

      const calculation = await CostCalculationService.calculateOrderCost(id, options);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le coût d'une expédition
  async calculateShipmentCost(req, res) {
    try {
      const { id } = req.params;
      const options = req.body || {};

      const calculation = await CostCalculationService.calculateShipmentCost(id, options);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le coût d'un segment de transport
  async calculateSegmentCost(req, res) {
    try {
      const { id } = req.params;
      const options = req.body || {};

      // Récupérer le segment
      const TransportSegment = require('../models/TransportSegment');
      const segment = await TransportSegment.query()
        .findById(id)
        .withGraphFetched('[origin, destination]');

      if (!segment) {
        return res.status(404).json({
          success: false,
          message: 'Segment de transport non trouvé'
        });
      }

      const calculation = await CostCalculationService.calculateSegmentCost(segment, options);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le coût basé sur des paramètres d'expédition
  async calculateCostFromParams(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de validation invalides',
          errors: errors.array()
        });
      }

      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      // Créer une expédition temporaire pour le calcul
      const tempShipment = {
        id: 'temp',
        reference: 'TEMP-CALC',
        transport_mode: shipmentParams.transport_mode,
        origin_country: shipmentParams.origin_country,
        destination_country: shipmentParams.destination_country,
        origin_zone: shipmentParams.origin_zone,
        destination_zone: shipmentParams.destination_zone,
        total_weight: shipmentParams.weight,
        total_volume: shipmentParams.volume,
        total_distance: shipmentParams.distance,
        total_pallets: shipmentParams.pallets,
        total_containers: shipmentParams.containers,
        planned_pickup_date: shipmentParams.shipment_date,
        carrier_id: shipmentParams.carrier_id,
        contract_id: shipmentParams.contract_id,
        currency: shipmentParams.currency,
        tenant_id: req.user.tenant_id
      };

      const calculation = await CostCalculationService.calculateDirectShipmentCost(tempShipment);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Comparer plusieurs options de transport
  async compareTransportOptions(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de validation invalides',
          errors: errors.array()
        });
      }

      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const comparison = await CostCalculationService.compareTransportOptions(shipmentParams);

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Générer un devis détaillé
  async generateDetailedQuote(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de validation invalides',
          errors: errors.array()
        });
      }

      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const quote = await CostCalculationService.generateDetailedQuote(shipmentParams);

      res.json({
        success: true,
        data: quote
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le coût basé sur un contrat spécifique
  async calculateContractBasedCost(req, res) {
    try {
      const { contract_id } = req.params;
      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const calculation = await CostCalculationService.calculateContractBasedCost(
        contract_id,
        shipmentParams
      );

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Simuler différents scénarios de coût
  async simulateCostScenarios(req, res) {
    try {
      const { base_params, scenarios } = req.body;
      
      const baseParams = {
        ...base_params,
        tenant_id: req.user.tenant_id
      };

      const simulations = [];

      // Calculer le coût de base
      const baseCalculation = await CostCalculationService.compareTransportOptions(baseParams);
      simulations.push({
        scenario: 'base',
        description: 'Scénario de base',
        params: baseParams,
        calculation: baseCalculation
      });

      // Calculer les scénarios alternatifs
      for (const scenario of scenarios || []) {
        const scenarioParams = {
          ...baseParams,
          ...scenario.params
        };

        const scenarioCalculation = await CostCalculationService.compareTransportOptions(scenarioParams);
        
        simulations.push({
          scenario: scenario.name,
          description: scenario.description,
          params: scenarioParams,
          calculation: scenarioCalculation
        });
      }

      // Analyser les différences
      const analysis = this.analyzeScenarios(simulations);

      res.json({
        success: true,
        data: {
          simulations,
          analysis
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer les économies potentielles
  async calculatePotentialSavings(req, res) {
    try {
      const { current_cost, shipment_params } = req.body;
      
      const params = {
        ...shipment_params,
        tenant_id: req.user.tenant_id
      };

      const comparison = await CostCalculationService.compareTransportOptions(params);
      
      const bestOption = comparison.recommended_option;
      const savings = current_cost - (bestOption?.total_cost || 0);
      const savingsPercentage = current_cost > 0 ? (savings / current_cost) * 100 : 0;

      res.json({
        success: true,
        data: {
          current_cost,
          optimized_cost: bestOption?.total_cost || 0,
          potential_savings: Math.max(0, savings),
          savings_percentage: Math.max(0, savingsPercentage),
          best_option: bestOption,
          all_options: comparison.options
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir l'historique des calculs de coût
  async getCostCalculationHistory(req, res) {
    try {
      const { order_id, shipment_id, limit = 10 } = req.query;

      // Cette fonctionnalité nécessiterait un modèle pour stocker l'historique
      // Pour l'instant, retourner une structure d'exemple
      const history = {
        calculations: [],
        total_count: 0,
        message: 'Fonctionnalité d\'historique à implémenter avec un modèle de stockage'
      };

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Valider les paramètres de calcul de coût
  async validateCostParameters(req, res) {
    try {
      const params = req.body;
      const errors = [];

      // Validation des champs requis
      const requiredFields = ['origin_country', 'destination_country', 'transport_mode', 'weight'];
      const missingFields = requiredFields.filter(field => !params[field]);
      
      if (missingFields.length > 0) {
        errors.push(`Champs requis manquants: ${missingFields.join(', ')}`);
      }

      // Validation des valeurs numériques
      if (params.weight && params.weight <= 0) {
        errors.push('Le poids doit être supérieur à 0');
      }

      if (params.volume && params.volume <= 0) {
        errors.push('Le volume doit être supérieur à 0');
      }

      if (params.distance && params.distance <= 0) {
        errors.push('La distance doit être supérieure à 0');
      }

      // Validation des modes de transport
      const validModes = ['road', 'sea', 'air', 'rail', 'multimodal'];
      if (params.transport_mode && !validModes.includes(params.transport_mode)) {
        errors.push('Mode de transport invalide');
      }

      // Validation des dates
      if (params.shipment_date && new Date(params.shipment_date) < new Date()) {
        errors.push('La date d\'expédition ne peut pas être dans le passé');
      }

      res.json({
        success: true,
        is_valid: errors.length === 0,
        errors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Estimer le temps de transit
  async estimateTransitTime(req, res) {
    try {
      const { transport_mode, distance, origin_country, destination_country } = req.body;

      const estimation = CostCalculationService.estimateTransitTime(transport_mode, distance);
      
      // Ajouter des informations supplémentaires pour le transport international
      if (origin_country !== destination_country) {
        estimation.customs_clearance_time = {
          hours: 24,
          description: 'Temps estimé pour le dédouanement'
        };
        estimation.total_hours = estimation.hours + 24;
        estimation.total_days = Math.ceil(estimation.total_hours / 24);
      }

      res.json({
        success: true,
        data: estimation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Méthode utilitaire pour analyser les scénarios
  analyzeScenarios(simulations) {
    const analysis = {
      best_scenario: null,
      worst_scenario: null,
      cost_differences: [],
      recommendations: []
    };

    if (simulations.length === 0) return analysis;

    // Trouver le meilleur et le pire scénario
    let bestCost = Infinity;
    let worstCost = 0;

    simulations.forEach(sim => {
      const cost = sim.calculation.recommended_option?.total_cost || 0;
      
      if (cost < bestCost) {
        bestCost = cost;
        analysis.best_scenario = sim.scenario;
      }
      
      if (cost > worstCost) {
        worstCost = cost;
        analysis.worst_scenario = sim.scenario;
      }
    });

    // Calculer les différences de coût
    const baseCost = simulations[0]?.calculation.recommended_option?.total_cost || 0;
    
    simulations.forEach(sim => {
      const cost = sim.calculation.recommended_option?.total_cost || 0;
      const difference = cost - baseCost;
      const percentage = baseCost > 0 ? (difference / baseCost) * 100 : 0;
      
      analysis.cost_differences.push({
        scenario: sim.scenario,
        cost_difference: difference,
        percentage_difference: percentage
      });
    });

    // Générer des recommandations
    if (bestCost < baseCost) {
      analysis.recommendations.push(
        `Le scénario "${analysis.best_scenario}" permet d'économiser ${(baseCost - bestCost).toFixed(2)} EUR`
      );
    }

    return analysis;
  }
}

module.exports = new CostCalculationController();

