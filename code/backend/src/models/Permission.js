/**
 * Permission model for role-based access control
 * 
 * This model represents granular permissions that can be assigned to roles
 * to control access to specific features and actions in the TMS system.
 */

const { Model } = require('objection');

class Permission extends Model {
  static get tableName() {
    return 'permissions';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'code', 'module'],
      
      properties: {
        id: { type: 'string' },
        name: { type: 'string', maxLength: 100 },
        code: { type: 'string', maxLength: 100 },
        module: { type: 'string', maxLength: 50 },
        description: { type: ['string', 'null'], maxLength: 255 },
        is_system_permission: { type: 'boolean', default: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Role = require('./Role');
    const RolePermission = require('./RolePermission');

    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'permissions.id',
          through: {
            from: 'role_permissions.permission_id',
            to: 'role_permissions.role_id'
          },
          to: 'roles.id'
        }
      },
      
      rolePermissions: {
        relation: Model.HasManyRelation,
        modelClass: RolePermission,
        join: {
          from: 'permissions.id',
          to: 'role_permissions.permission_id'
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

module.exports = Permission;
