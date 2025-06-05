/**
 * UserRole model for the many-to-many relationship between users and roles
 * 
 * This model represents the association between users and roles in the TMS system,
 * allowing users to have multiple roles and roles to be assigned to multiple users.
 */

const { Model } = require('objection');

class UserRole extends Model {
  static get tableName() {
    return 'user_roles';
  }

  static get idColumn() {
    return ['user_id', 'role_id'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'role_id'],
      
      properties: {
        user_id: { type: 'integer' },
        role_id: { type: 'integer' },
        assigned_at: { type: 'string', format: 'date-time' },
        assigned_by: { type: ['integer', 'null'] },
        tenant_id: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const Role = require('./Role');
    const Tenant = require('./Tenant');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'user_roles.user_id',
          to: 'users.id'
        }
      },
      
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: 'user_roles.role_id',
          to: 'roles.id'
        }
      },
      
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'user_roles.tenant_id',
          to: 'tenants.id'
        }
      }
    };
  }

  // Hooks
  $beforeInsert() {
    this.assigned_at = new Date().toISOString();
  }
}

module.exports = UserRole;
