const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class ContractLine extends BaseModel {
  static get tableName() {
    return 'contract_lines';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['contract_id', 'service_type', 'rate_type', 'rate_value', 'currency'],
      properties: {
        id: { type: ['integer','string'] },
        contract_id: { type: ['integer','string'] },
        
        // Type de service
        service_type: { 
          type: 'string', 
          enum: ['transport', 'handling', 'storage', 'customs', 'insurance', 'other'] 
        },
        service_description: { type: 'string' },
        
        // Tarification
        rate_type: { 
          type: 'string', 
          enum: ['per_km', 'per_kg', 'per_m3', 'per_pallet', 'per_container', 'flat_rate', 'per_hour', 'percentage'] 
        },
        rate_value: { type: 'number', minimum: 0 },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        
        // Conditions d'application
        transport_mode: { 
          type: 'string', 
          enum: ['road', 'sea', 'air', 'rail', 'multimodal'] 
        },
        origin_zone: { type: 'string' },
        destination_zone: { type: 'string' },
        origin_country: { type: 'string' },
        destination_country: { type: 'string' },
        
        // Limites et conditions
        min_quantity: { type: 'number', minimum: 0 },
        max_quantity: { type: 'number', minimum: 0 },
        min_weight: { type: 'number', minimum: 0 },
        max_weight: { type: 'number', minimum: 0 },
        min_volume: { type: 'number', minimum: 0 },
        max_volume: { type: 'number', minimum: 0 },
        min_distance: { type: 'number', minimum: 0 },
        max_distance: { type: 'number', minimum: 0 },
        
        // Remises et majorations
        discount_percentage: { type: 'number', minimum: 0, maximum: 100 },
        markup_percentage: { type: 'number', minimum: 0 },
        
        // Conditions spéciales
        fuel_surcharge_applicable: { type: 'boolean', default: false },
        toll_applicable: { type: 'boolean', default: false },
        insurance_applicable: { type: 'boolean', default: false },
        
        // Tarification par paliers
        tier_pricing: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              min_quantity: { type: 'number', minimum: 0 },
              max_quantity: { type: 'number', minimum: 0 },
              rate: { type: 'number', minimum: 0 },
              discount_percentage: { type: 'number', minimum: 0, maximum: 100 }
            }
          }
        },
        
        // Dates de validité
        effective_date: { type: 'string', format: 'date' },
        expiry_date: { type: 'string', format: 'date' },
        
        // Métadonnées
        is_active: { type: 'boolean', default: true },
        priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
        notes: { type: 'string' },
        
        // Relations
        tenant_id: { type: ['integer','string'] },
        
        // Audit
        created_by: { type: ['integer','string'] },
        updated_by: { type: ['integer','string'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Contract = require('./Contract');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        join: {
          from: 'contract_lines.contract_id',
          to: 'contracts.id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'contract_lines.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contract_lines.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contract_lines.updated_by',
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

  isValidForQuantity(quantity) {
    if (this.min_quantity && quantity < this.min_quantity) return false;
    if (this.max_quantity && quantity > this.max_quantity) return false;
    return true;
  }

  isValidForWeight(weight) {
    if (this.min_weight && weight < this.min_weight) return false;
    if (this.max_weight && weight > this.max_weight) return false;
    return true;
  }

  isValidForVolume(volume) {
    if (this.min_volume && volume < this.min_volume) return false;
    if (this.max_volume && volume > this.max_volume) return false;
    return true;
  }

  isValidForDistance(distance) {
    if (this.min_distance && distance < this.min_distance) return false;
    if (this.max_distance && distance > this.max_distance) return false;
    return true;
  }

  calculateRate(quantity, additionalParams = {}) {
    let baseRate = this.rate_value;
    
    // Tarification par paliers
    if (this.tier_pricing && this.tier_pricing.length > 0) {
      const applicableTier = this.tier_pricing.find(tier => 
        quantity >= tier.min_quantity && 
        (!tier.max_quantity || quantity <= tier.max_quantity)
      );
      
      if (applicableTier) {
        baseRate = applicableTier.rate;
        
        // Application de la remise du palier
        if (applicableTier.discount_percentage) {
          baseRate = baseRate * (1 - applicableTier.discount_percentage / 100);
        }
      }
    }
    
    // Application de la remise générale
    if (this.discount_percentage) {
      baseRate = baseRate * (1 - this.discount_percentage / 100);
    }
    
    // Application de la majoration
    if (this.markup_percentage) {
      baseRate = baseRate * (1 + this.markup_percentage / 100);
    }
    
    // Calcul selon le type de tarif
    let totalRate = 0;
    
    switch (this.rate_type) {
      case 'per_km':
        totalRate = baseRate * (additionalParams.distance || 0);
        break;
      case 'per_kg':
        totalRate = baseRate * (additionalParams.weight || 0);
        break;
      case 'per_m3':
        totalRate = baseRate * (additionalParams.volume || 0);
        break;
      case 'per_pallet':
        totalRate = baseRate * (additionalParams.pallets || 0);
        break;
      case 'per_container':
        totalRate = baseRate * (additionalParams.containers || 0);
        break;
      case 'per_hour':
        totalRate = baseRate * (additionalParams.hours || 0);
        break;
      case 'percentage':
        totalRate = (additionalParams.baseAmount || 0) * (baseRate / 100);
        break;
      case 'flat_rate':
      default:
        totalRate = baseRate;
        break;
    }
    
    return totalRate;
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = ContractLine;

