const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class PricingRule extends BaseModel {
  static get tableName() {
    return 'pricing_rules';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'rule_type', 'conditions', 'actions'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        
        // Type de règle
        rule_type: { 
          type: 'string', 
          enum: ['rate_selection', 'discount', 'surcharge', 'validation', 'approval'] 
        },
        
        // Conditions d'application (JSON)
        conditions: {
          type: 'object',
          properties: {
            // Conditions géographiques
            origin_countries: { type: 'array', items: { type: 'string' } },
            destination_countries: { type: 'array', items: { type: 'string' } },
            origin_zones: { type: 'array', items: { type: 'string' } },
            destination_zones: { type: 'array', items: { type: 'string' } },
            
            // Conditions de transport
            transport_modes: { 
              type: 'array', 
              items: { 
                type: 'string', 
                enum: ['road', 'sea', 'air', 'rail', 'multimodal'] 
              } 
            },
            service_types: { type: 'array', items: { type: 'string' } },
            
            // Conditions de marchandise
            min_weight: { type: 'number', minimum: 0 },
            max_weight: { type: 'number', minimum: 0 },
            min_volume: { type: 'number', minimum: 0 },
            max_volume: { type: 'number', minimum: 0 },
            min_value: { type: 'number', minimum: 0 },
            max_value: { type: 'number', minimum: 0 },
            
            // Conditions temporelles
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            days_of_week: { 
              type: 'array', 
              items: { 
                type: 'string', 
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
              } 
            },
            start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
            end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
            
            // Conditions de partenaire
            customer_types: { type: 'array', items: { type: 'string' } },
            customer_ids: { type: 'array', items: { type: 'integer' } },
            carrier_types: { type: 'array', items: { type: 'string' } },
            carrier_ids: { type: 'array', items: { type: 'integer' } },
            
            // Conditions de volume d'affaires
            min_monthly_volume: { type: 'number', minimum: 0 },
            min_annual_volume: { type: 'number', minimum: 0 },
            
            // Conditions personnalisées
            custom_conditions: { type: 'object' }
          }
        },
        
        // Actions à exécuter (JSON)
        actions: {
          type: 'object',
          properties: {
            // Actions de tarification
            rate_adjustments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  adjustment_type: { 
                    type: 'string', 
                    enum: ['percentage_discount', 'percentage_markup', 'fixed_discount', 'fixed_markup', 'set_rate'] 
                  },
                  value: { type: 'number' },
                  applies_to: { 
                    type: 'string', 
                    enum: ['base_rate', 'total_cost', 'specific_service'] 
                  },
                  service_type: { type: 'string' }
                }
              }
            },
            
            // Actions de surcharge
            surcharge_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action_type: { 
                    type: 'string', 
                    enum: ['add_surcharge', 'remove_surcharge', 'modify_surcharge'] 
                  },
                  surcharge_id: { type: 'integer' },
                  surcharge_name: { type: 'string' },
                  value: { type: 'number' },
                  calculation_method: { type: 'string' }
                }
              }
            },
            
            // Actions de validation
            validation_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  validation_type: { 
                    type: 'string', 
                    enum: ['require_approval', 'block_quote', 'warning_message', 'auto_approve'] 
                  },
                  message: { type: 'string' },
                  approval_level: { type: 'string' }
                }
              }
            },
            
            // Actions personnalisées
            custom_actions: { type: 'object' }
          }
        },
        
        // Priorité d'exécution
        priority: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
        
        // Conditions d'activation
        is_active: { type: 'boolean', default: true },
        effective_date: { type: 'string', format: 'date' },
        expiry_date: { type: 'string', format: 'date' },
        
        // Statistiques d'utilisation
        usage_count: { type: 'integer', minimum: 0, default: 0 },
        last_used_at: { type: 'string', format: 'date-time' },
        
        // Relations
        tenant_id: { type: 'integer' },
        
        // Audit
        created_by: { type: 'integer' },
        updated_by: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'pricing_rules.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'pricing_rules.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'pricing_rules.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  // Méthodes utilitaires
  isValidForDate(date = new Date()) {
    const checkDate = new Date(date);
    const effectiveDate = this.effective_date ? new Date(this.effective_date) : null;
    const expiryDate = this.expiry_date ? new Date(this.expiry_date) : null;
    
    if (effectiveDate && checkDate < effectiveDate) return false;
    if (expiryDate && checkDate > expiryDate) return false;
    return true;
  }

  evaluateConditions(context) {
    if (!this.conditions) return false;
    
    const conditions = this.conditions;
    
    // Vérification des conditions géographiques
    if (conditions.origin_countries && conditions.origin_countries.length > 0) {
      if (!conditions.origin_countries.includes(context.origin_country)) return false;
    }
    
    if (conditions.destination_countries && conditions.destination_countries.length > 0) {
      if (!conditions.destination_countries.includes(context.destination_country)) return false;
    }
    
    if (conditions.origin_zones && conditions.origin_zones.length > 0) {
      if (!conditions.origin_zones.includes(context.origin_zone)) return false;
    }
    
    if (conditions.destination_zones && conditions.destination_zones.length > 0) {
      if (!conditions.destination_zones.includes(context.destination_zone)) return false;
    }
    
    // Vérification des conditions de transport
    if (conditions.transport_modes && conditions.transport_modes.length > 0) {
      if (!conditions.transport_modes.includes(context.transport_mode)) return false;
    }
    
    // Vérification des conditions de marchandise
    if (conditions.min_weight && context.weight < conditions.min_weight) return false;
    if (conditions.max_weight && context.weight > conditions.max_weight) return false;
    if (conditions.min_volume && context.volume < conditions.min_volume) return false;
    if (conditions.max_volume && context.volume > conditions.max_volume) return false;
    if (conditions.min_value && context.value < conditions.min_value) return false;
    if (conditions.max_value && context.value > conditions.max_value) return false;
    
    // Vérification des conditions temporelles
    const currentDate = new Date();
    
    if (conditions.start_date && currentDate < new Date(conditions.start_date)) return false;
    if (conditions.end_date && currentDate > new Date(conditions.end_date)) return false;
    
    if (conditions.days_of_week && conditions.days_of_week.length > 0) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = dayNames[currentDate.getDay()];
      if (!conditions.days_of_week.includes(currentDay)) return false;
    }
    
    if (conditions.start_time || conditions.end_time) {
      const currentTime = currentDate.toTimeString().substring(0, 5);
      if (conditions.start_time && currentTime < conditions.start_time) return false;
      if (conditions.end_time && currentTime > conditions.end_time) return false;
    }
    
    // Vérification des conditions de partenaire
    if (conditions.customer_ids && conditions.customer_ids.length > 0) {
      if (!conditions.customer_ids.includes(context.customer_id)) return false;
    }
    
    if (conditions.carrier_ids && conditions.carrier_ids.length > 0) {
      if (!conditions.carrier_ids.includes(context.carrier_id)) return false;
    }
    
    // Vérification des conditions de volume d'affaires
    if (conditions.min_monthly_volume && context.monthly_volume < conditions.min_monthly_volume) return false;
    if (conditions.min_annual_volume && context.annual_volume < conditions.min_annual_volume) return false;
    
    return true;
  }

  executeActions(context) {
    if (!this.actions) return [];
    
    const results = [];
    const actions = this.actions;
    
    // Exécution des ajustements de tarifs
    if (actions.rate_adjustments) {
      actions.rate_adjustments.forEach(adjustment => {
        results.push({
          type: 'rate_adjustment',
          adjustment_type: adjustment.adjustment_type,
          value: adjustment.value,
          applies_to: adjustment.applies_to,
          service_type: adjustment.service_type
        });
      });
    }
    
    // Exécution des actions de surcharge
    if (actions.surcharge_actions) {
      actions.surcharge_actions.forEach(action => {
        results.push({
          type: 'surcharge_action',
          action_type: action.action_type,
          surcharge_id: action.surcharge_id,
          surcharge_name: action.surcharge_name,
          value: action.value,
          calculation_method: action.calculation_method
        });
      });
    }
    
    // Exécution des actions de validation
    if (actions.validation_actions) {
      actions.validation_actions.forEach(action => {
        results.push({
          type: 'validation_action',
          validation_type: action.validation_type,
          message: action.message,
          approval_level: action.approval_level
        });
      });
    }
    
    // Mise à jour des statistiques d'utilisation
    this.usage_count = (this.usage_count || 0) + 1;
    this.last_used_at = new Date().toISOString();
    
    return results;
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = PricingRule;

