/**
 * RolePermission model for the many-to-many relationship between roles and permissions
 * 
 * This model represents the association between roles and permissions in the TMS system,
 * allowing roles to have multiple permissions and permissions to be assigned to multiple roles.
 */

const { Model } = require('objection');

class RolePermission extends Model {
  static get tableName() {
    return 'role_permissions';
  }

  static get idColumn() {
    return ['role_id', 'permission_id'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['role_id', 'permission_id'],
      
      properties: {
        role_id: { type: 'string' },
        permission_id: { type: 'string' },
        granted_at: { type: 'string', format: 'date-time' },
        granted_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Role = require('./Role');
    const Permission = require('./Permission');

    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: 'role_permissions.role_id',
          to: 'roles.id'
        }
      },
      
      permission: {
        relation: Model.BelongsToOneRelation,
        modelClass: Permission,
        join: {
          from: 'role_permissions.permission_id',
          to: 'permissions.id'
        }
      }
    };
  }

  // Hooks
  $beforeInsert() {
    this.granted_at = new Date().toISOString();
  }
}

module.exports = RolePermission;
