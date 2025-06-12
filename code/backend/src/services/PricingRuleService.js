const PricingRule = require('../models/PricingRule');

class PricingRuleService {
  // Créer une nouvelle règle de tarification
  async createPricingRule(ruleData, userId, tenantId) {
    try {
      // Validation des données de la règle
      const validation = await this.validatePricingRule(ruleData);
      if (!validation.is_valid) {
        throw new Error(`Données de règle invalides: ${validation.errors.join(', ')}`);
      }

      const rule = await PricingRule.query().insert({
        ...ruleData,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      });

      return await this.getPricingRuleById(rule.id);
    } catch (error) {
      throw new Error(`Erreur lors de la création de la règle de tarification: ${error.message}`);
    }
  }

  // Obtenir une règle de tarification par ID
  async getPricingRuleById(ruleId) {
    try {
      const rule = await PricingRule.query()
        .findById(ruleId)
        .withGraphFetched('[createdBy, updatedBy]');

      if (!rule) {
        throw new Error('Règle de tarification non trouvée');
      }

      return rule;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la règle: ${error.message}`);
    }
  }

  // Obtenir toutes les règles de tarification avec filtres et pagination
  async getPricingRules(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = PricingRule.query()
        .withGraphFetched('[createdBy, updatedBy]')
        .orderBy('priority', 'desc')
        .orderBy('created_at', 'desc');

      // Application des filtres
      if (filters.tenant_id) {
        query = query.where('tenant_id', filters.tenant_id);
      }

      if (filters.rule_type) {
        query = query.where('rule_type', filters.rule_type);
      }

      if (filters.is_active !== undefined) {
        query = query.where('is_active', filters.is_active);
      }

      if (filters.effective_date) {
        query = query.where(builder => {
          builder.whereNull('effective_date')
            .orWhere('effective_date', '<=', filters.effective_date);
        });
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
      const rules = await query.page(page - 1, limit);

      return {
        data: rules.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des règles: ${error.message}`);
    }
  }

  // Mettre à jour une règle de tarification
  async updatePricingRule(ruleId, updateData, userId) {
    try {
      const rule = await PricingRule.query().findById(ruleId);
      if (!rule) {
        throw new Error('Règle de tarification non trouvée');
      }

      // Validation des données mises à jour
      const validation = await this.validatePricingRule(updateData);
      if (!validation.is_valid) {
        throw new Error(`Données de règle invalides: ${validation.errors.join(', ')}`);
      }

      const updatedRule = await PricingRule.query()
        .patchAndFetchById(ruleId, {
          ...updateData,
          updated_by: userId
        });

      return await this.getPricingRuleById(updatedRule.id);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la règle: ${error.message}`);
    }
  }

  // Supprimer une règle de tarification
  async deletePricingRule(ruleId) {
    try {
      const rule = await PricingRule.query().findById(ruleId);
      if (!rule) {
        throw new Error('Règle de tarification non trouvée');
      }

      await PricingRule.query().deleteById(ruleId);
      return { message: 'Règle de tarification supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la règle: ${error.message}`);
    }
  }

  // Évaluer et appliquer les règles de tarification pour une expédition
  async evaluateRulesForShipment(shipmentContext, tenantId) {
    try {
      // Récupérer toutes les règles actives
      const activeRules = await PricingRule.query()
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .where(builder => {
          builder.whereNull('effective_date')
            .orWhere('effective_date', '<=', shipmentContext.shipment_date || new Date());
        })
        .where(builder => {
          builder.whereNull('expiry_date')
            .orWhere('expiry_date', '>=', shipmentContext.shipment_date || new Date());
        })
        .orderBy('priority', 'desc');

      const applicableRules = [];
      const ruleResults = [];

      // Évaluer chaque règle
      for (const rule of activeRules) {
        if (rule.evaluateConditions(shipmentContext)) {
          applicableRules.push(rule);
          
          const actions = rule.executeActions(shipmentContext);
          ruleResults.push({
            rule_id: rule.id,
            rule_name: rule.name,
            rule_type: rule.rule_type,
            priority: rule.priority,
            actions: actions
          });

          // Mettre à jour les statistiques d'utilisation
          await rule.$query().patch({
            usage_count: (rule.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
          });
        }
      }

      return {
        shipment_context: shipmentContext,
        applicable_rules: applicableRules.length,
        rule_results: ruleResults
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'évaluation des règles: ${error.message}`);
    }
  }

  // Appliquer les ajustements de tarification basés sur les règles
  async applyRuleAdjustments(baseCalculation, ruleResults) {
    try {
      let adjustedCalculation = { ...baseCalculation };
      const appliedAdjustments = [];

      for (const ruleResult of ruleResults) {
        for (const action of ruleResult.actions) {
          if (action.type === 'rate_adjustment') {
            const adjustment = this.calculateRateAdjustment(
              adjustedCalculation,
              action
            );

            if (adjustment.amount !== 0) {
              adjustedCalculation.total_cost += adjustment.amount;
              appliedAdjustments.push({
                rule_id: ruleResult.rule_id,
                rule_name: ruleResult.rule_name,
                adjustment_type: action.adjustment_type,
                original_amount: adjustment.original_amount,
                adjustment_amount: adjustment.amount,
                new_amount: adjustedCalculation.total_cost
              });
            }
          }
        }
      }

      return {
        original_calculation: baseCalculation,
        adjusted_calculation: adjustedCalculation,
        applied_adjustments: appliedAdjustments
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'application des ajustements: ${error.message}`);
    }
  }

  // Calculer un ajustement de tarif spécifique
  calculateRateAdjustment(calculation, action) {
    const originalAmount = calculation.total_cost;
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

  // Tester une règle avec des données d'exemple
  async testPricingRule(ruleId, testContext) {
    try {
      const rule = await this.getPricingRuleById(ruleId);
      
      const conditionsResult = rule.evaluateConditions(testContext);
      let actionsResult = [];

      if (conditionsResult) {
        actionsResult = rule.executeActions(testContext);
      }

      return {
        rule_id: rule.id,
        rule_name: rule.name,
        test_context: testContext,
        conditions_met: conditionsResult,
        actions_executed: actionsResult,
        test_timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Erreur lors du test de la règle: ${error.message}`);
    }
  }

  // Dupliquer une règle de tarification
  async duplicatePricingRule(ruleId, userId) {
    try {
      const originalRule = await this.getPricingRuleById(ruleId);
      
      const duplicateData = {
        ...originalRule,
        name: `${originalRule.name} (Copie)`,
        is_active: false, // Désactiver la copie par défaut
        usage_count: 0,
        last_used_at: null,
        id: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      return await this.createPricingRule(duplicateData, userId, originalRule.tenant_id);
    } catch (error) {
      throw new Error(`Erreur lors de la duplication de la règle: ${error.message}`);
    }
  }

  // Obtenir les statistiques des règles de tarification
  async getPricingRuleStatistics(tenantId, filters = {}) {
    try {
      let query = PricingRule.query().where('tenant_id', tenantId);

      if (filters.start_date) {
        query = query.where('created_at', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('created_at', '<=', filters.end_date);
      }

      const statsByType = await query
        .select('rule_type')
        .count('* as count')
        .groupBy('rule_type');

      const totalRules = await PricingRule.query()
        .where('tenant_id', tenantId)
        .count('* as count')
        .first();

      const activeRules = await PricingRule.query()
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .count('* as count')
        .first();

      const usageStats = await PricingRule.query()
        .where('tenant_id', tenantId)
        .select('id', 'name', 'usage_count', 'last_used_at')
        .orderBy('usage_count', 'desc')
        .limit(10);

      return {
        total_rules: parseInt(totalRules.count),
        active_rules: parseInt(activeRules.count),
        by_type: statsByType.map(stat => ({
          rule_type: stat.rule_type,
          count: parseInt(stat.count)
        })),
        most_used_rules: usageStats.map(rule => ({
          id: rule.id,
          name: rule.name,
          usage_count: rule.usage_count || 0,
          last_used_at: rule.last_used_at
        }))
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Valider une règle de tarification
  async validatePricingRule(ruleData) {
    try {
      const errors = [];

      // Validation des champs requis
      if (!ruleData.name || ruleData.name.trim().length === 0) {
        errors.push('Le nom de la règle est requis');
      }

      if (!ruleData.rule_type) {
        errors.push('Le type de règle est requis');
      }

      if (!ruleData.conditions || Object.keys(ruleData.conditions).length === 0) {
        errors.push('Au moins une condition doit être définie');
      }

      if (!ruleData.actions || Object.keys(ruleData.actions).length === 0) {
        errors.push('Au moins une action doit être définie');
      }

      // Validation des dates
      if (ruleData.effective_date && ruleData.expiry_date) {
        if (new Date(ruleData.effective_date) >= new Date(ruleData.expiry_date)) {
          errors.push('La date d\'expiration doit être postérieure à la date d\'effet');
        }
      }

      // Validation de la priorité
      if (ruleData.priority && (ruleData.priority < 1 || ruleData.priority > 100)) {
        errors.push('La priorité doit être comprise entre 1 et 100');
      }

      // Validation des conditions
      if (ruleData.conditions) {
        const conditions = ruleData.conditions;

        // Validation des conditions de poids
        if (conditions.min_weight && conditions.max_weight) {
          if (conditions.min_weight >= conditions.max_weight) {
            errors.push('Le poids maximum doit être supérieur au poids minimum');
          }
        }

        // Validation des conditions de volume
        if (conditions.min_volume && conditions.max_volume) {
          if (conditions.min_volume >= conditions.max_volume) {
            errors.push('Le volume maximum doit être supérieur au volume minimum');
          }
        }

        // Validation des conditions de valeur
        if (conditions.min_value && conditions.max_value) {
          if (conditions.min_value >= conditions.max_value) {
            errors.push('La valeur maximum doit être supérieure à la valeur minimum');
          }
        }

        // Validation des heures
        if (conditions.start_time && conditions.end_time) {
          if (conditions.start_time >= conditions.end_time) {
            errors.push('L\'heure de fin doit être postérieure à l\'heure de début');
          }
        }
      }

      // Validation des actions
      if (ruleData.actions) {
        const actions = ruleData.actions;

        // Validation des ajustements de tarif
        if (actions.rate_adjustments) {
          for (const adjustment of actions.rate_adjustments) {
            if (!adjustment.adjustment_type) {
              errors.push('Le type d\'ajustement est requis');
            }
            if (adjustment.value === undefined || adjustment.value === null) {
              errors.push('La valeur d\'ajustement est requise');
            }
            if (adjustment.adjustment_type === 'percentage_discount' && adjustment.value > 100) {
              errors.push('La remise en pourcentage ne peut pas dépasser 100%');
            }
          }
        }
      }

      return {
        is_valid: errors.length === 0,
        errors
      };
    } catch (error) {
      throw new Error(`Erreur lors de la validation de la règle: ${error.message}`);
    }
  }

  // Activer/désactiver une règle
  async toggleRuleStatus(ruleId, isActive, userId) {
    try {
      const rule = await PricingRule.query().findById(ruleId);
      if (!rule) {
        throw new Error('Règle de tarification non trouvée');
      }

      const updatedRule = await PricingRule.query()
        .patchAndFetchById(ruleId, {
          is_active: isActive,
          updated_by: userId
        });

      return updatedRule;
    } catch (error) {
      throw new Error(`Erreur lors du changement de statut de la règle: ${error.message}`);
    }
  }

  // Obtenir les règles par type
  async getRulesByType(ruleType, tenantId) {
    try {
      const rules = await PricingRule.query()
        .where('rule_type', ruleType)
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .orderBy('priority', 'desc')
        .orderBy('name');

      return rules;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des règles par type: ${error.message}`);
    }
  }
}

module.exports = new PricingRuleService();

