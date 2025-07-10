/**
 * Contact model for managing partner contacts in the TMS system
 * 
 * This model represents people associated with business partners.
 */

const { Model } = require('objection');

class Contact extends Model {
  static get tableName() {
    return 'contacts';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'first_name', 'last_name'],
      
      properties: {
        id: { type: 'string' },
        partner_id: { type: 'string' },
        first_name: { type: 'string', maxLength: 100 },
        last_name: { type: 'string', maxLength: 100 },
        position: { type: ['string', 'null'], maxLength: 100 },
        email: { type: ['string', 'null'], format: 'email', maxLength: 255 },
        phone: { type: ['string', 'null'], maxLength: 20 },
        mobile: { type: ['string', 'null'], maxLength: 20 },
        is_primary: { type: 'boolean', default: false },
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
          from: 'contacts.partner_id',
          to: 'partners.id'
        }
      },
      
      sites: {
        relation: Model.HasManyRelation,
        modelClass: Site,
        join: {
          from: 'contacts.id',
          to: 'sites.contact_id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contacts.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contacts.updated_by',
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

module.exports = Contact;
