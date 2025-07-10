/**
 * Site model for managing physical locations in the TMS system
 * 
 * This model represents sites such as warehouses, factories, stores, etc.
 */

const { Model } = require('objection');

class Site extends Model {
  static get tableName() {
    return 'sites';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'address_id', 'name', 'type'],
      
      properties: {
        id: { type: 'string' },
        partner_id: { type: 'string' },
        address_id: { type: 'string' },
        name: { type: 'string', maxLength: 100 },
        type: { 
          type: 'string', 
          enum: ['WAREHOUSE', 'FACTORY', 'STORE', 'DISTRIBUTION_CENTER', 'CROSS_DOCK', 'OTHER'],
        },
        code: { type: ['string', 'null'], maxLength: 50 },
        opening_hours: { type: ['string', 'null'], maxLength: 255 },
        contact_id: { type: ['integer', 'string','null'] },
        capacity: { type: ['number', 'null'] },
        surface_area: { type: ['number', 'null'] },
        loading_docks: { type: ['integer', 'null'] },
        notes: { type: ['string', 'null'] },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'maintenance', 'closed'],
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
    const Address = require('./Address');
    const Contact = require('./Contact');
    const User = require('./User');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'sites.partner_id',
          to: 'partners.id'
        }
      },
      
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'sites.address_id',
          to: 'addresses.id'
        }
      },
      
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contact,
        join: {
          from: 'sites.contact_id',
          to: 'contacts.id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'sites.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'sites.updated_by',
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
}

module.exports = Site;
