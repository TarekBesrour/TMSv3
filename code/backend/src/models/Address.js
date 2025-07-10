/**
 * Address model for managing partner addresses in the TMS system
 * 
 * This model represents physical addresses associated with business partners.
 */

const { Model } = require('objection');

class Address extends Model {
  static get tableName() {
    return 'addresses';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'street_line1', 'city', 'postal_code', 'country'],
      
      properties: {
        id: { type: 'string' },
        partner_id: { type: 'string' },
        name: { type: ['string', 'null'], maxLength: 100 },
        street_line1: { type: 'string', maxLength: 255 },
        street_line2: { type: ['string', 'null'], maxLength: 255 },
        city: { type: 'string', maxLength: 100 },
        postal_code: { type: 'string', maxLength: 20 },
        state: { type: ['string', 'null'], maxLength: 100 },
        country: { type: 'string', maxLength: 100 },
        latitude: { type: ['number', 'null'] },
        longitude: { type: ['number', 'null'] },
        is_headquarters: { type: 'boolean', default: false },
        is_billing: { type: 'boolean', default: false },
        is_shipping: { type: 'boolean', default: false },
        is_operational: { type: 'boolean', default: false },
        notes: { type: ['string', 'null'] },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive'],
          default: 'active'
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: 'string' },
        updated_by: { type: 'string' }
      }
    };
  }

  static get relationMappings() {
    const Partner = require('./Partner');
    const Site = require('./Site');
    const User = require('./User');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'addresses.partner_id',
          to: 'partners.id'
        }
      },
      
      sites: {
        relation: Model.HasManyRelation,
        modelClass: Site,
        join: {
          from: 'addresses.id',
          to: 'sites.address_id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'addresses.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'addresses.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  // Hooks
  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
  
  // Format full address as a string
  getFullAddress() {
    let parts = [this.street_line1];
    
    if (this.street_line2) {
      parts.push(this.street_line2);
    }
    
    parts.push(`${this.postal_code} ${this.city}`);
    
    if (this.state) {
      parts.push(this.state);
    }
    
    parts.push(this.country);
    
    return parts.join(', ');
  }
}

module.exports = Address;
