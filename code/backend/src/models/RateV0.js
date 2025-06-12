/**
 * Rate model for managing tariff rates in the TMS
 * Supports different transport modes, origins/destinations, and pricing units
 */
const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class Rate extends BaseModel {
  static get tableName() {
    return 'rates';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['rate_type', 'transport_mode', 'pricing_unit', 'base_amount', 'currency', 'valid_from'],
      properties: {
        id: { type: 'integer' },
        tenant_id: { type: 'integer' },
        rate_type: { 
          type: 'string',
          enum: ['standard', 'client_specific', 'carrier_specific']
        },
        transport_mode: { 
          type: 'string',
          enum: ['road', 'sea', 'air', 'rail', 'multimodal']
        },
        origin_country: { type: 'string', minLength: 2, maxLength: 2 },
        origin_region: { type: ['string', 'null'], maxLength: 100 },
        origin_city: { type: ['string', 'null'], maxLength: 100 },
        origin_postal_code: { type: ['string', 'null'], maxLength: 20 },
        destination_country: { type: 'string', minLength: 2, maxLength: 2 },
        destination_region: { type: ['string', 'null'], maxLength: 100 },
        destination_city: { type: ['string', 'null'], maxLength: 100 },
        destination_postal_code: { type: ['string', 'null'], maxLength: 20 },
        pricing_unit: { 
          type: 'string',
          enum: ['per_km', 'per_ton', 'per_pallet', 'per_container', 'per_cbm', 'per_shipment', 'per_kg', 'per_lb']
        },
        base_amount: { type: 'number' },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        valid_from: { type: 'string', format: 'date-time' },
        valid_to: { type: ['string', 'null'], format: 'date-time' },
        min_weight: { type: ['number', 'null'] },
        max_weight: { type: ['number', 'null'] },
        min_volume: { type: ['number', 'null'] },
        max_volume: { type: ['number', 'null'] },
        min_distance: { type: ['number', 'null'] },
        max_distance: { type: ['number', 'null'] },
        partner_id: { type: ['integer', 'null'] },
        description: { type: ['string', 'null'], maxLength: 500 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] },
        is_active: { type: 'boolean', default: true }
      }
    };
  }

  static get relationMappings() {
    const Partner = require('./Partner');
    const Surcharge = require('./Surcharge');
    const RateSurcharge = require('./RateSurcharge');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'rates.partner_id',
          to: 'partners.id'
        }
      },
      surcharges: {
        relation: Model.ManyToManyRelation,
        modelClass: Surcharge,
        join: {
          from: 'rates.id',
          through: {
            from: 'rate_surcharges.rate_id',
            to: 'rate_surcharges.surcharge_id',
            extra: ['is_applicable', 'conditions']
          },
          to: 'surcharges.id'
        }
      }
    };
  }

  /**
   * Check if rate is applicable for given parameters
   * @param {Object} params - Parameters to check against
   * @returns {Boolean} - Whether the rate is applicable
   */
  isApplicable(params) {
    // Check if rate is active and within validity period
    const now = new Date();
    const validFrom = new Date(this.valid_from);
    const validTo = this.valid_to ? new Date(this.valid_to) : null;
    
    if (!this.is_active || validFrom > now || (validTo && validTo < now)) {
      return false;
    }
    
    // Check transport mode
    if (params.transport_mode && this.transport_mode !== params.transport_mode && this.transport_mode !== 'multimodal') {
      return false;
    }
    
    // Check origin/destination
    if (params.origin_country && this.origin_country && params.origin_country !== this.origin_country) {
      return false;
    }
    
    if (params.destination_country && this.destination_country && params.destination_country !== this.destination_country) {
      return false;
    }
    
    // Check weight constraints
    if (params.weight) {
      if ((this.min_weight !== null && params.weight < this.min_weight) || 
          (this.max_weight !== null && params.weight > this.max_weight)) {
        return false;
      }
    }
    
    // Check volume constraints
    if (params.volume) {
      if ((this.min_volume !== null && params.volume < this.min_volume) || 
          (this.max_volume !== null && params.volume > this.max_volume)) {
        return false;
      }
    }
    
    // Check distance constraints
    if (params.distance) {
      if ((this.min_distance !== null && params.distance < this.min_distance) || 
          (this.max_distance !== null && params.distance > this.max_distance)) {
        return false;
      }
    }
    
    // Check partner specificity
    if (this.rate_type === 'client_specific' && params.client_id && this.partner_id !== params.client_id) {
      return false;
    }
    
    if (this.rate_type === 'carrier_specific' && params.carrier_id && this.partner_id !== params.carrier_id) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate price based on rate and parameters
   * @param {Object} params - Parameters for calculation
   * @returns {Object} - Calculated price details
   */
  calculatePrice(params) {
    if (!this.isApplicable(params)) {
      throw new Error('Rate is not applicable for the given parameters');
    }
    
    let basePrice = this.base_amount;
    
    // Apply multiplier based on pricing unit
    switch (this.pricing_unit) {
      case 'per_km':
        basePrice *= (params.distance || 0);
        break;
      case 'per_ton':
        basePrice *= (params.weight || 0) / 1000; // Convert kg to tons
        break;
      case 'per_kg':
        basePrice *= (params.weight || 0);
        break;
      case 'per_lb':
        basePrice *= (params.weight || 0) * 2.20462; // Convert kg to lbs
        break;
      case 'per_pallet':
        basePrice *= (params.pallets || 0);
        break;
      case 'per_container':
        basePrice *= (params.containers || 0);
        break;
      case 'per_cbm':
        basePrice *= (params.volume || 0);
        break;
      case 'per_shipment':
        // Base price is already per shipment
        break;
      default:
        throw new Error(`Unsupported pricing unit: ${this.pricing_unit}`);
    }
    
    return {
      base_price: basePrice,
      currency: this.currency,
      rate_id: this.id,
      pricing_unit: this.pricing_unit
    };
  }
}

module.exports = Rate;
