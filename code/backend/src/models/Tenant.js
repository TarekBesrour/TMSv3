/**
 * Tenant model for multi-tenant functionality
 * 
 * This model represents tenants in the TMS system, enabling multi-tenant
 * architecture where each client organization has isolated data.
 */

const { Model } = require('objection');

class Tenant extends Model {
  static get tableName() {
    return 'tenants';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'schema_name', 'status'],
      
      properties: {
        id: { type: ['integer', 'string'] },
        name: { type: 'string', maxLength: 100 },
        schema_name: { type: 'string', maxLength: 50 },
        domain: { type: ['string', 'null'], maxLength: 255 },
        logo_url: { type: ['string', 'null'], maxLength: 255 },
        primary_color: { type: ['string', 'null'], maxLength: 20 },
        secondary_color: { type: ['string', 'null'], maxLength: 20 },
        contact_email: { type: ['string', 'null'], format: 'email', maxLength: 255 },
        contact_phone: { type: ['string', 'null'], maxLength: 20 },
        address: { type: ['string', 'null'], maxLength: 255 },
        city: { type: ['string', 'null'], maxLength: 100 },
        postal_code: { type: ['string', 'null'], maxLength: 20 },
        country: { type: ['string', 'null'], maxLength: 100 },
        subscription_plan: { type: ['string', 'null'], maxLength: 50 },
        subscription_status: { type: ['string', 'null'], maxLength: 50 },
        subscription_start_date: { type: ['string', 'null'], format: 'date-time' },
        subscription_end_date: { type: ['string', 'null'], format: 'date-time' },
        max_users: { type: ['integer', 'null'] },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'pending', 'suspended'],
          default: 'pending'
        },
        settings: { type: ['object', 'null'] }, // JSON field for tenant-specific settings
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const Role = require('./Role');

    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tenants.id',
          to: 'users.tenant_id'
        }
      },
      
      roles: {
        relation: Model.HasManyRelation,
        modelClass: Role,
        join: {
          from: 'tenants.id',
          to: 'roles.tenant_id'
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

module.exports = Tenant;
