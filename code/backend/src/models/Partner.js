/**
 * Partner model for managing business partners in the TMS system
 * 
 * This model represents partners such as clients, carriers, suppliers, etc.
 */

const { Model } = require('objection');

class Partner extends Model {
  static get tableName() {
    return 'partners';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'type'],
      
      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string', 'null'] },
        name: { type: 'string', maxLength: 255 },
        type: { 
          type: 'string', 
          enum: ['CLIENT', 'CARRIER', 'SUPPLIER', 'OTHER'],
        },
        legal_form: { type: ['string', 'null'], maxLength: 50 },
        registration_number: { type: ['string', 'null'], maxLength: 50 },
        vat_number: { type: ['string', 'null'], maxLength: 50 },
        website: { type: ['string', 'null'], maxLength: 255 },
        logo_url: { type: ['string', 'null'], maxLength: 255 },
        notes: { type: ['string', 'null'] },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'pending', 'blocked'],
          default: 'active'
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Contact = require('./Contact');
    const Address = require('./Address');
    const Site = require('./Site');
    const Vehicle = require('./Vehicle');
    const Driver = require('./Driver');
    const Contract = require('./Contract');
    const PartnerDocument = require('./PartnerDocument');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      contacts: {
        relation: Model.HasManyRelation,
        modelClass: Contact,
        join: {
          from: 'partners.id',
          to: 'contacts.partner_id'
        }
      },
      
      addresses: {
        relation: Model.HasManyRelation,
        modelClass: Address,
        join: {
          from: 'partners.id',
          to: 'addresses.partner_id'
        }
      },
      
      sites: {
        relation: Model.HasManyRelation,
        modelClass: Site,
        join: {
          from: 'partners.id',
          to: 'sites.partner_id'
        }
      },
      
      vehicles: {
        relation: Model.HasManyRelation,
        modelClass: Vehicle,
        join: {
          from: 'partners.id',
          to: 'vehicles.partner_id'
        }
      },
      
      drivers: {
        relation: Model.HasManyRelation,
        modelClass: Driver,
        join: {
          from: 'partners.id',
          to: 'drivers.partner_id'
        }
      },
      
      contracts: {
        relation: Model.HasManyRelation,
        modelClass: Contract,
        join: {
          from: 'partners.id',
          to: 'contracts.partner_id'
        }
      },
      
      documents: {
        relation: Model.HasManyRelation,
        modelClass: PartnerDocument,
        join: {
          from: 'partners.id',
          to: 'partner_documents.partner_id'
        }
      },
      
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'partners.tenant_id',
          to: 'tenants.id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'partners.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'partners.updated_by',
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

module.exports = Partner;
