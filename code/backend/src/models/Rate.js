const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class Rate extends BaseModel {
  static get tableName() {
    return 'rates';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'transport_mode', 'rate_type', 'base_rate', 'currency', 'effective_date'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        transport_mode: { 
          type: 'string', 
          enum: ['road', 'sea', 'air', 'rail', 'multimodal'] 
        },
        rate_type: { 
          type: 'string', 
          enum: ['per_km', 'per_kg', 'per_m3', 'per_pallet', 'per_container', 'flat_rate', 'per_hour'] 
        },
        base_rate: { type: 'number', minimum: 0 },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        
        // Zones géographiques
        origin_zone: { type: 'string' },
        destination_zone: { type: 'string' },
        origin_country: { type: 'string' },
        destination_country: { type: 'string' },
        
        // Conditions d'application
        min_weight: { type: 'number', minimum: 0 },
        max_weight: { type: 'number', minimum: 0 },
        min_volume: { type: 'number', minimum: 0 },
        max_volume: { type: 'number', minimum: 0 },
        min_distance: { type: 'number', minimum: 0 },
        max_distance: { type: 'number', minimum: 0 },
        
        // Dates de validité
        effective_date: { type: 'string', format: 'date' },
        expiry_date: { type: 'string', format: 'date' },
        
        // Paramètres spécifiques
        fuel_surcharge_applicable: { type: 'boolean', default: false },
        toll_applicable: { type: 'boolean', default: false },
        insurance_rate: { type: 'number', minimum: 0 },
        
        // Tarification par paliers
        tier_rates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              min_quantity: { type: 'number', minimum: 0 },
              max_quantity: { type: 'number', minimum: 0 },
              rate: { type: 'number', minimum: 0 }
            }
          }
        },
        
        // Métadonnées
        is_active: { type: 'boolean', default: true },
        priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
        
        // Relations
        partner_id: { type: 'integer' },
        contract_id: { type: 'integer' },
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
    const Partner = require('./Partner');
    const Contract = require('./Contract');
    const Tenant = require('./Tenant');
    const User = require('./User');
    const Surcharge = require('./Surcharge');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'rates.partner_id',
          to: 'partners.id'
        }
      },
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        join: {
          from: 'rates.contract_id',
          to: 'contracts.id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'rates.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'rates.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'rates.updated_by',
          to: 'users.id'
        }
      },
      surcharges: {
        relation: Model.HasManyRelation,
        modelClass: Surcharge,
        join: {
          from: 'rates.id',
          to: 'surcharges.rate_id'
        }
      }
    };
  }

  // Méthodes utilitaires
  isValidForDate(date = new Date()) {
    const checkDate = new Date(date);
    const effectiveDate = new Date(this.effective_date);
    const expiryDate = this.expiry_date ? new Date(this.expiry_date) : null;
    
    return checkDate >= effectiveDate && (!expiryDate || checkDate <= expiryDate);
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
    let rate = this.base_rate;
    
    // Tarification par paliers
    if (this.tier_rates && this.tier_rates.length > 0) {
      const applicableTier = this.tier_rates.find(tier => 
        quantity >= tier.min_quantity && 
        (!tier.max_quantity || quantity <= tier.max_quantity)
      );
      
      if (applicableTier) {
        rate = applicableTier.rate;
      }
    }
    
    // Calcul selon le type de tarif
    switch (this.rate_type) {
      case 'per_km':
        return rate * (additionalParams.distance || 0);
      case 'per_kg':
        return rate * (additionalParams.weight || 0);
      case 'per_m3':
        return rate * (additionalParams.volume || 0);
      case 'per_pallet':
        return rate * (additionalParams.pallets || 0);
      case 'per_container':
        return rate * (additionalParams.containers || 0);
      case 'per_hour':
        return rate * (additionalParams.hours || 0);
      case 'flat_rate':
      default:
        return rate;
    }
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = Rate;

