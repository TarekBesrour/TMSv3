/**
 * AuditLog model for tracking user actions
 * 
 * This model represents audit logs in the TMS system, recording user actions
 * for security, compliance, and troubleshooting purposes.
 */

const { Model } = require('objection');

class AuditLog extends Model {
  static get tableName() {
    return 'audit_logs';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['action', 'entity_type', 'action_timestamp'],
      
      properties: {
        id: { type: 'string' },
        tenant_id: { type: ['integer', 'string', 'null'] },
        user_id: { type: ['integer', 'string', 'null'] },
        action: { type: 'string', maxLength: 50 }, // CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.
        entity_type: { type: 'string', maxLength: 50 }, // User, Role, Order, etc.
        entity_id: { type: ['integer', 'string', 'null'] },
        description: { type: ['string', 'null'], maxLength: 255 },
        ip_address: { type: ['string', 'null'], maxLength: 45 },
        user_agent: { type: ['string', 'null'], maxLength: 255 },
        previous_state: { type: ['object', 'null'] }, // JSON field for previous state
        new_state: { type: ['object', 'null'] }, // JSON field for new state
        action_timestamp: { type: 'string', format: 'date-time' },
        additional_data: { type: ['object', 'null'] } // JSON field for additional data
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const Tenant = require('./Tenant');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'audit_logs.user_id',
          to: 'users.id'
        }
      },
      
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'audit_logs.tenant_id',
          to: 'tenants.id'
        }
      }
    };
  }
}

module.exports = AuditLog;
