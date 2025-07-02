/**
 * User model for authentication and user management
 * 
 * This model represents users in the TMS system with authentication
 * and profile information.
 */

const { Model } = require('objection');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password_hash', 'first_name', 'last_name'],
      
      properties: {
        id: { type: ['integer', 'string'] },
        tenant_id: { type: ['integer','string', 'null'] },
        email: { type: 'string', format: 'email', maxLength: 255 },
        password_hash: { type: 'string', maxLength: 255 },
        first_name: { type: 'string', maxLength: 100 },
        last_name: { type: 'string', maxLength: 100 },
        phone: { type: ['string', 'null'], maxLength: 20 },
        job_title: { type: ['string', 'null'], maxLength: 100 },
        profile_image_url: { type: ['string', 'null'], maxLength: 255 },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'pending', 'locked'],
          default: 'pending'
        },
        failed_login_attempts: { type: 'integer', default: 0 },
        last_login_at: { type: ['string', 'null'], format: 'date-time' },
        password_reset_token: { type: ['string', 'null'] },
        password_reset_expires_at: { type: ['string', 'null'], format: 'date-time' },
        email_verified_at: { type: ['string', 'null'], format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: ['integer','string', 'null'] },
        updated_by: { type: ['integer','string', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Role = require('./Role');
    const UserRole = require('./UserRole');
    const UserPreference = require('./UserPreference');
    const AuditLog = require('./AuditLog');
    const Tenant = require('./Tenant');

    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'users.id',
          through: {
            from: 'user_roles.user_id',
            to: 'user_roles.role_id'
          },
          to: 'roles.id'
        }
      },
      
      userRoles: {
        relation: Model.HasManyRelation,
        modelClass: UserRole,
        join: {
          from: 'users.id',
          to: 'user_roles.user_id'
        }
      },
      
      preferences: {
        relation: Model.HasOneRelation,
        modelClass: UserPreference,
        join: {
          from: 'users.id',
          to: 'user_preferences.user_id'
        }
      },
      
      auditLogs: {
        relation: Model.HasManyRelation,
        modelClass: AuditLog,
        join: {
          from: 'users.id',
          to: 'audit_logs.user_id'
        }
      },
      
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'users.tenant_id',
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

  // Instance methods
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  // Remove sensitive data when serializing to JSON
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.password_hash;
    delete json.password_reset_token;
    delete json.password_reset_expires_at;
    return json;
  }

  // Static methods
  static async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}

module.exports = User;
