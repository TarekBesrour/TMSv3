const PricingRuleService = require('../services/PricingRuleService');
const { validationResult } = require('express-validator');

class PricingRuleController {
  // Créer une nouvelle règle de tarification
  async createPricingRule(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: errors.array()
        });
      }

      const rule = await PricingRuleService.createPricingRule(
        req.body,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Règle de tarification créée avec succès',
        data: rule
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir une règle de tarification par ID
  async getPricingRuleById(req, res) {
    try {
      const { id } = req.params;
      const rule = await PricingRuleService.getPricingRuleById(id);

      res.json({
        success: true,
        data: rule
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

  // Obtenir toutes les règles de tarification avec filtres et pagination
  async getPricingRules(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await PricingRuleService.getPricingRules(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mettre à jour une règle de tarification
  async updatePricingRule(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const rule = await PricingRuleService.updatePricingRule(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Règle de tarification mise à jour avec succès',
        data: rule
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

  // Supprimer une règle de tarification
  async deletePricingRule(req, res) {
    try {
      const { id } = req.params;
      const result = await PricingRuleService.deletePricingRule(id);

      res.json({
        success: true,
        message: result.message
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

  // Évaluer et appliquer les règles de tarification pour une expédition
  async evaluateRulesForShipment(req, res) {
    try {
      const shipmentContext = req.body;
      
      const result = await PricingRuleService.evaluateRulesForShipment(
        shipmentContext,
        req.user.tenant_id
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Appliquer les ajustements de tarification basés sur les règles
  async applyRuleAdjustments(req, res) {
    try {
      const { base_calculation, rule_results } = req.body;
      
      const result = await PricingRuleService.applyRuleAdjustments(
        base_calculation,
        rule_results
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Tester une règle avec des données d'exemple
  async testPricingRule(req, res) {
    try {
      const { id } = req.params;
      const testContext = req.body;

      const result = await PricingRuleService.testPricingRule(id, testContext);

      res.json({
        success: true,
        data: result
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

  // Dupliquer une règle de tarification
  async duplicatePricingRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await PricingRuleService.duplicatePricingRule(id, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Règle de tarification dupliquée avec succès',
        data: rule
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

  // Obtenir les statistiques des règles de tarification
  async getPricingRuleStatistics(req, res) {
    try {
      const filters = req.query;
      const stats = await PricingRuleService.getPricingRuleStatistics(req.user.tenant_id, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Valider une règle de tarification
  async validatePricingRule(req, res) {
    try {
      const ruleData = req.body;
      const validation = await PricingRuleService.validatePricingRule(ruleData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Activer/désactiver une règle
  async toggleRuleStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const rule = await PricingRuleService.toggleRuleStatus(id, is_active, req.user.id);

      res.json({
        success: true,
        message: `Règle ${is_active ? 'activée' : 'désactivée'} avec succès`,
        data: rule
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

  // Obtenir les règles par type
  async getRulesByType(req, res) {
    try {
      const { type } = req.params;
      const rules = await PricingRuleService.getRulesByType(type, req.user.tenant_id);

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les règles actives
  async getActiveRules(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        is_active: true
      };

      const result = await PricingRuleService.getPricingRules(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les règles les plus utilisées
  async getMostUsedRules(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        is_active: true
      };

      const result = await PricingRuleService.getPricingRules(filters, { page: 1, limit: parseInt(limit) });
      
      // Trier par usage_count décroissant
      const sortedRules = result.data.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

      res.json({
        success: true,
        data: sortedRules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Simuler l'application d'une règle
  async simulateRuleApplication(req, res) {
    try {
      const { id } = req.params;
      const { shipment_context, base_calculation } = req.body;

      const rule = await PricingRuleService.getPricingRuleById(id);
      
      // Évaluer les conditions
      const conditionsResult = rule.evaluateConditions(shipment_context);
      
      let simulation = {
        rule_id: rule.id,
        rule_name: rule.name,
        rule_type: rule.rule_type,
        conditions_met: conditionsResult,
        original_calculation: base_calculation,
        modified_calculation: base_calculation,
        actions_executed: []
      };

      if (conditionsResult) {
        // Exécuter les actions
        const actions = rule.executeActions(shipment_context);
        simulation.actions_executed = actions;

        // Appliquer les ajustements si fournis
        if (base_calculation) {
          const adjustmentResult = await PricingRuleService.applyRuleAdjustments(
            base_calculation,
            [{ rule_id: rule.id, rule_name: rule.name, actions }]
          );
          simulation.modified_calculation = adjustmentResult.adjusted_calculation;
        }
      }

      res.json({
        success: true,
        data: simulation
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

  // Exporter les règles de tarification
  async exportPricingRules(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const result = await PricingRuleService.getPricingRules(filters, { page: 1, limit: 10000 });

      // Formatage des données pour l'export
      const exportData = result.data.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        rule_type: rule.rule_type,
        priority: rule.priority,
        is_active: rule.is_active,
        effective_date: rule.effective_date,
        expiry_date: rule.expiry_date,
        usage_count: rule.usage_count || 0,
        last_used_at: rule.last_used_at,
        conditions: JSON.stringify(rule.conditions),
        actions: JSON.stringify(rule.actions),
        created_at: rule.created_at
      }));

      res.json({
        success: true,
        data: exportData,
        count: exportData.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir un aperçu des conditions d'une règle
  async getRuleConditionsPreview(req, res) {
    try {
      const { id } = req.params;
      const rule = await PricingRuleService.getPricingRuleById(id);

      const conditions = rule.conditions || {};
      const preview = {
        rule_id: rule.id,
        rule_name: rule.name,
        rule_type: rule.rule_type,
        conditions_summary: {
          geographical: {
            origin_countries: conditions.origin_countries || [],
            destination_countries: conditions.destination_countries || [],
            origin_zones: conditions.origin_zones || [],
            destination_zones: conditions.destination_zones || []
          },
          transport: {
            transport_modes: conditions.transport_modes || [],
            service_types: conditions.service_types || []
          },
          cargo: {
            weight_range: {
              min: conditions.min_weight,
              max: conditions.max_weight
            },
            volume_range: {
              min: conditions.min_volume,
              max: conditions.max_volume
            },
            value_range: {
              min: conditions.min_value,
              max: conditions.max_value
            }
          },
          temporal: {
            date_range: {
              start: conditions.start_date,
              end: conditions.end_date
            },
            days_of_week: conditions.days_of_week || [],
            time_range: {
              start: conditions.start_time,
              end: conditions.end_time
            }
          },
          partners: {
            customer_types: conditions.customer_types || [],
            customer_ids: conditions.customer_ids || [],
            carrier_types: conditions.carrier_types || [],
            carrier_ids: conditions.carrier_ids || []
          }
        }
      };

      res.json({
        success: true,
        data: preview
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
}

module.exports = new PricingRuleController();

