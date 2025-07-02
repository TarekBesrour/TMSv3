const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class Surcharge extends BaseModel {
  static get tableName() {
    return 'surcharges';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'surcharge_type', 'calculation_method', 'value', 'currency'],
      properties: {
        id: { type: ['integer','string'] },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        
        // Type de surcharge
        surcharge_type: { 
          type: 'string', 
          enum: ['fuel', 'toll', 'security', 'customs', 'handling', 'storage', 'insurance', 'currency', 'peak_season', 'other'] 
        },
        
        // Méthode de calcul
        calculation_method: { 
          type: 'string', 
          enum: ['percentage', 'fixed_amount', 'per_km', 'per_kg', 'per_m3', 'per_pallet', 'per_container', 'per_hour'] 
        },
        
        // Valeur de la surcharge
        value: { type: 'number', minimum: 0 },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        
        // Conditions d'application
        transport_mode: { 
          type: 'string', 
          enum: ['road', 'sea', 'air', 'rail', 'multimodal', 'all'] 
        },
        origin_zone: { type: 'string' },
        destination_zone: { type: 'string' },
        origin_country: { type: 'string' },
        destination_country: { type: 'string' },
        
        // Conditions de poids et volume
        min_weight: { type: 'number', minimum: 0 },
        max_weight: { type: 'number', minimum: 0 },
        min_volume: { type: 'number', minimum: 0 },
        max_volume: { type: 'number', minimum: 0 },
        
        // Conditions temporelles
        effective_date: { type: 'string', format: 'date' },
        expiry_date: { type: 'string', format: 'date' },
        
        // Jours de la semaine (pour surcharges spécifiques)
        applicable_days: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          }
        },
        
        // Heures d'application (pour surcharges horaires)
        start_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
        end_time: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
        
        // Valeurs minimales et maximales
        min_amount: { type: 'number', minimum: 0 },
        max_amount: { type: 'number', minimum: 0 },
        
        // Tarification par paliers
        tier_values: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              min_quantity: { type: 'number', minimum: 0 },
              max_quantity: { type: 'number', minimum: 0 },
              value: { type: 'number', minimum: 0 }
            }
          }
        },
        
        // Paramètres spéciaux pour carburant
        fuel_base_price: { type: 'number', minimum: 0 },
        fuel_threshold: { type: 'number', minimum: 0 },
        fuel_adjustment_factor: { type: 'number', minimum: 0 },
        
        // Métadonnées
        is_active: { type: 'boolean', default: true },
        is_mandatory: { type: 'boolean', default: false },
        priority: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
        
        // Relations
        rate_id: { type: ['integer','string'] },
        contract_id: { type: ['integer','string'] },
        partner_id: { type: ['integer','string'] },
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
    const Rate = require('./Rate');
    const Contract = require('./Contract');
    const Partner = require('./Partner');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      rate: {
        relation: Model.BelongsToOneRelation,
        modelClass: Rate,
        join: {
          from: 'surcharges.rate_id',
          to: 'rates.id'
        }
      },
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        join: {
          from: 'surcharges.contract_id',
          to: 'contracts.id'
        }
      },
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'surcharges.partner_id',
          to: 'partners.id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'surcharges.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'surcharges.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'surcharges.updated_by',
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

  isValidForDay(date = new Date()) {
    if (!this.applicable_days || this.applicable_days.length === 0) return true;
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    
    return this.applicable_days.includes(dayName);
  }

  isValidForTime(time = new Date()) {
    if (!this.start_time || !this.end_time) return true;
    
    const timeString = time.toTimeString().substring(0, 5); // HH:MM format
    return timeString >= this.start_time && timeString <= this.end_time;
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

  calculateSurcharge(baseAmount, additionalParams = {}) {
    let surchargeAmount = 0;
    let calculationValue = this.value;
    
    // Tarification par paliers
    if (this.tier_values && this.tier_values.length > 0) {
      const quantity = additionalParams.quantity || 0;
      const applicableTier = this.tier_values.find(tier => 
        quantity >= tier.min_quantity && 
        (!tier.max_quantity || quantity <= tier.max_quantity)
      );
      
      if (applicableTier) {
        calculationValue = applicableTier.value;
      }
    }
    
    // Calcul spécial pour surcharge carburant
    if (this.surcharge_type === 'fuel' && this.fuel_base_price && this.fuel_threshold) {
      const currentFuelPrice = additionalParams.currentFuelPrice || this.fuel_base_price;
      if (currentFuelPrice > this.fuel_threshold) {
        const fuelDifference = currentFuelPrice - this.fuel_threshold;
        calculationValue = fuelDifference * (this.fuel_adjustment_factor || 1);
      } else {
        return 0; // Pas de surcharge si le prix est en dessous du seuil
      }
    }
    
    // Calcul selon la méthode
    switch (this.calculation_method) {
      case 'percentage':
        surchargeAmount = baseAmount * (calculationValue / 100);
        break;
      case 'per_km':
        surchargeAmount = calculationValue * (additionalParams.distance || 0);
        break;
      case 'per_kg':
        surchargeAmount = calculationValue * (additionalParams.weight || 0);
        break;
      case 'per_m3':
        surchargeAmount = calculationValue * (additionalParams.volume || 0);
        break;
      case 'per_pallet':
        surchargeAmount = calculationValue * (additionalParams.pallets || 0);
        break;
      case 'per_container':
        surchargeAmount = calculationValue * (additionalParams.containers || 0);
        break;
      case 'per_hour':
        surchargeAmount = calculationValue * (additionalParams.hours || 0);
        break;
      case 'fixed_amount':
      default:
        surchargeAmount = calculationValue;
        break;
    }
    
    // Application des limites min/max
    if (this.min_amount && surchargeAmount < this.min_amount) {
      surchargeAmount = this.min_amount;
    }
    if (this.max_amount && surchargeAmount > this.max_amount) {
      surchargeAmount = this.max_amount;
    }
    
    return surchargeAmount;
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = Surcharge;

