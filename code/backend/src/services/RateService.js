const Rate = require('../models/Rate');
const Surcharge = require('../models/Surcharge');
const PricingRule = require('../models/PricingRule');

class RateService {
  // Créer un nouveau tarif
  async createRate(rateData, userId, tenantId) {
    try {
      const rate = await Rate.query().insert({
        ...rateData,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      });

      return await this.getRateById(rate.id);
    } catch (error) {
      throw new Error(`Erreur lors de la création du tarif: ${error.message}`);
    }
  }

  // Obtenir un tarif par ID
  async getRateById(rateId) {
    try {
      const rate = await Rate.query()
        .findById(rateId)
        .withGraphFetched('[partner, contract, surcharges, createdBy, updatedBy]');

      if (!rate) {
        throw new Error('Tarif non trouvé');
      }

      return rate;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du tarif: ${error.message}`);
    }
  }

  // Obtenir tous les tarifs avec filtres et pagination
  async getRates(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = Rate.query()
        .withGraphFetched('[partner, contract, surcharges]')
        .orderBy('created_at', 'desc');

      // Application des filtres
      if (filters.tenant_id) {
        query = query.where('tenant_id', filters.tenant_id);
      }

      if (filters.transport_mode) {
        query = query.where('transport_mode', filters.transport_mode);
      }

      if (filters.rate_type) {
        query = query.where('rate_type', filters.rate_type);
      }

      if (filters.partner_id) {
        query = query.where('partner_id', filters.partner_id);
      }

      if (filters.contract_id) {
        query = query.where('contract_id', filters.contract_id);
      }

      if (filters.origin_country) {
        query = query.where('origin_country', filters.origin_country);
      }

      if (filters.destination_country) {
        query = query.where('destination_country', filters.destination_country);
      }

      if (filters.currency) {
        query = query.where('currency', filters.currency);
      }

      if (filters.is_active !== undefined) {
        query = query.where('is_active', filters.is_active);
      }

      if (filters.effective_date) {
        query = query.where('effective_date', '<=', filters.effective_date);
      }

      if (filters.expiry_date) {
        query = query.where(builder => {
          builder.whereNull('expiry_date')
            .orWhere('expiry_date', '>=', filters.expiry_date);
        });
      }

      if (filters.search) {
        query = query.where(builder => {
          builder.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
        });
      }

      // Pagination
      const total = await query.resultSize();
      const rates = await query.page(page - 1, limit);

      return {
        data: rates.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tarifs: ${error.message}`);
    }
  }

  // Mettre à jour un tarif
  async updateRate(rateId, updateData, userId) {
    try {
      const rate = await Rate.query().findById(rateId);
      if (!rate) {
        throw new Error('Tarif non trouvé');
      }

      const updatedRate = await Rate.query()
        .patchAndFetchById(rateId, {
          ...updateData,
          updated_by: userId
        });

      return await this.getRateById(updatedRate.id);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du tarif: ${error.message}`);
    }
  }

  // Supprimer un tarif
  async deleteRate(rateId) {
    try {
      const rate = await Rate.query().findById(rateId);
      if (!rate) {
        throw new Error('Tarif non trouvé');
      }

      await Rate.query().deleteById(rateId);
      return { message: 'Tarif supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du tarif: ${error.message}`);
    }
  }

  // Rechercher des tarifs applicables pour une expédition
  async findApplicableRates(shipmentParams) {
    try {
      const {
        origin_country,
        destination_country,
        origin_zone,
        destination_zone,
        transport_mode,
        weight,
        volume,
        distance,
        partner_id,
        contract_id,
        shipment_date = new Date()
      } = shipmentParams;

      let query = Rate.query()
        .withGraphFetched('[partner, contract, surcharges]')
        .where('is_active', true)
        .where('effective_date', '<=', shipment_date)
        .where(builder => {
          builder.whereNull('expiry_date')
            .orWhere('expiry_date', '>=', shipment_date);
        });

      // Filtres géographiques
      if (origin_country) {
        query = query.where(builder => {
          builder.whereNull('origin_country')
            .orWhere('origin_country', origin_country);
        });
      }

      if (destination_country) {
        query = query.where(builder => {
          builder.whereNull('destination_country')
            .orWhere('destination_country', destination_country);
        });
      }

      if (origin_zone) {
        query = query.where(builder => {
          builder.whereNull('origin_zone')
            .orWhere('origin_zone', origin_zone);
        });
      }

      if (destination_zone) {
        query = query.where(builder => {
          builder.whereNull('destination_zone')
            .orWhere('destination_zone', destination_zone);
        });
      }

      // Filtre mode de transport
      if (transport_mode) {
        query = query.where(builder => {
          builder.where('transport_mode', transport_mode)
            .orWhere('transport_mode', 'multimodal');
        });
      }

      // Filtre partenaire
      if (partner_id) {
        query = query.where(builder => {
          builder.whereNull('partner_id')
            .orWhere('partner_id', partner_id);
        });
      }

      // Filtre contrat
      if (contract_id) {
        query = query.where(builder => {
          builder.whereNull('contract_id')
            .orWhere('contract_id', contract_id);
        });
      }

      const rates = await query.orderBy('priority', 'desc');

      // Filtrer par conditions de poids, volume et distance
      const applicableRates = rates.filter(rate => {
        if (weight && !rate.isValidForWeight(weight)) return false;
        if (volume && !rate.isValidForVolume(volume)) return false;
        if (distance && !rate.isValidForDistance(distance)) return false;
        return true;
      });

      return applicableRates;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des tarifs applicables: ${error.message}`);
    }
  }

  // Calculer le coût total pour une expédition
  async calculateShipmentCost(shipmentParams) {
    try {
      const applicableRates = await this.findApplicableRates(shipmentParams);
      
      if (applicableRates.length === 0) {
        throw new Error('Aucun tarif applicable trouvé pour cette expédition');
      }

      const calculations = [];

      for (const rate of applicableRates) {
        const calculation = {
          rate_id: rate.id,
          rate_name: rate.name,
          transport_mode: rate.transport_mode,
          rate_type: rate.rate_type,
          currency: rate.currency,
          base_cost: 0,
          surcharges: [],
          total_cost: 0
        };

        // Calcul du coût de base
        const quantity = this.getQuantityForRateType(rate.rate_type, shipmentParams);
        calculation.base_cost = rate.calculateRate(quantity, shipmentParams);

        // Calcul des surcharges applicables
        if (rate.surcharges && rate.surcharges.length > 0) {
          for (const surcharge of rate.surcharges) {
            if (surcharge.is_active && surcharge.isValidForDate(shipmentParams.shipment_date)) {
              const surchargeAmount = surcharge.calculateSurcharge(calculation.base_cost, shipmentParams);
              
              if (surchargeAmount > 0) {
                calculation.surcharges.push({
                  surcharge_id: surcharge.id,
                  name: surcharge.name,
                  type: surcharge.surcharge_type,
                  amount: surchargeAmount,
                  currency: surcharge.currency
                });
              }
            }
          }
        }

        // Calcul du coût total
        const totalSurcharges = calculation.surcharges.reduce((sum, s) => sum + s.amount, 0);
        calculation.total_cost = calculation.base_cost + totalSurcharges;

        calculations.push(calculation);
      }

      // Trier par coût total croissant
      calculations.sort((a, b) => a.total_cost - b.total_cost);

      return {
        shipment_params: shipmentParams,
        calculations,
        recommended_rate: calculations[0] || null
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul du coût d'expédition: ${error.message}`);
    }
  }

  // Appliquer les règles de tarification
  async applyPricingRules(shipmentParams, calculations) {
    try {
      const pricingRules = await PricingRule.query()
        .where('is_active', true)
        .where(builder => {
          builder.whereNull('effective_date')
            .orWhere('effective_date', '<=', shipmentParams.shipment_date || new Date());
        })
        .where(builder => {
          builder.whereNull('expiry_date')
            .orWhere('expiry_date', '>=', shipmentParams.shipment_date || new Date());
        })
        .orderBy('priority', 'desc');

      const modifiedCalculations = [...calculations];
      const appliedRules = [];

      for (const rule of pricingRules) {
        if (rule.evaluateConditions(shipmentParams)) {
          const actions = rule.executeActions(shipmentParams);
          
          for (const action of actions) {
            if (action.type === 'rate_adjustment') {
              // Appliquer les ajustements de tarif
              modifiedCalculations.forEach(calc => {
                if (action.applies_to === 'base_rate' || action.applies_to === 'total_cost') {
                  const targetAmount = action.applies_to === 'base_rate' ? calc.base_cost : calc.total_cost;
                  
                  switch (action.adjustment_type) {
                    case 'percentage_discount':
                      calc.total_cost = calc.total_cost * (1 - action.value / 100);
                      break;
                    case 'percentage_markup':
                      calc.total_cost = calc.total_cost * (1 + action.value / 100);
                      break;
                    case 'fixed_discount':
                      calc.total_cost = Math.max(0, calc.total_cost - action.value);
                      break;
                    case 'fixed_markup':
                      calc.total_cost = calc.total_cost + action.value;
                      break;
                    case 'set_rate':
                      calc.total_cost = action.value;
                      break;
                  }
                }
              });
            }
          }

          appliedRules.push({
            rule_id: rule.id,
            rule_name: rule.name,
            actions
          });

          // Sauvegarder l'utilisation de la règle
          await rule.$query().patch({
            usage_count: rule.usage_count + 1,
            last_used_at: new Date().toISOString()
          });
        }
      }

      return {
        calculations: modifiedCalculations,
        applied_rules: appliedRules
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'application des règles de tarification: ${error.message}`);
    }
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

  // Dupliquer un tarif
  async duplicateRate(rateId, userId) {
    try {
      const originalRate = await this.getRateById(rateId);
      
      const duplicateData = {
        ...originalRate,
        name: `${originalRate.name} (Copie)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      return await this.createRate(duplicateData, userId, originalRate.tenant_id);
    } catch (error) {
      throw new Error(`Erreur lors de la duplication du tarif: ${error.message}`);
    }
  }

  // Obtenir les statistiques des tarifs
  async getRateStatistics(tenantId, filters = {}) {
    try {
      let query = Rate.query().where('tenant_id', tenantId);

      if (filters.start_date) {
        query = query.where('created_at', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('created_at', '<=', filters.end_date);
      }

      const stats = await query
        .select('transport_mode')
        .count('* as count')
        .groupBy('transport_mode');

      const totalRates = await Rate.query()
        .where('tenant_id', tenantId)
        .count('* as count')
        .first();

      const activeRates = await Rate.query()
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .count('* as count')
        .first();

      return {
        total_rates: parseInt(totalRates.count),
        active_rates: parseInt(activeRates.count),
        by_transport_mode: stats.map(stat => ({
          transport_mode: stat.transport_mode,
          count: parseInt(stat.count)
        }))
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
}

module.exports = new RateService();

