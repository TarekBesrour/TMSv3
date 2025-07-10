/**
 * Role model for user role management
 * 
 * This model represents roles in the TMS system that can be assigned to users
 * and contain sets of permissions.
 */

const { Model } = require('objection');

class Role extends Model {
  static get tableName() {
    return 'roles';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'description'],
      
      properties: {
        id: { type: 'string' },
        tenant_id: { type: ['integer','string', 'null'] },
        name: { type: 'string', maxLength: 50 },
        description: { type: 'string', maxLength: 255 },
        is_system_role: { type: 'boolean', default: false },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: 'string' },
        updated_by: { type: 'string' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const Permission = require('./Permission');
    const UserRole = require('./UserRole');
    const RolePermission = require('./RolePermission');
    const Tenant = require('./Tenant');

    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'roles.id',
          through: {
            from: 'user_roles.role_id',
            to: 'user_roles.user_id'
          },
          to: 'users.id'
        }
      },
      
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: Permission,
        join: {
          from: 'roles.id',
          through: {
            from: 'role_permissions.role_id',
            to: 'role_permissions.permission_id'
          },
          to: 'permissions.id'
        }
      },
      
      userRoles: {
        relation: Model.HasManyRelation,
        modelClass: UserRole,
        join: {
          from: 'roles.id',
          to: 'user_roles.role_id'
        }
      },
      
      rolePermissions: {
        relation: Model.HasManyRelation,
        modelClass: RolePermission,
        join: {
          from: 'roles.id',
          to: 'role_permissions.role_id'
        }
      },
      
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'roles.tenant_id',
          to: 'tenants.id'
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

module.exports = Role;
