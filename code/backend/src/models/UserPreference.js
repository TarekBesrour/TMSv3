/**
 * UserPreference model for storing user-specific settings
 * 
 * This model represents user preferences and settings in the TMS system,
 * allowing for personalization of the user experience.
 */

const { Model } = require('objection');

class UserPreference extends Model {
  static get tableName() {
    return 'user_preferences';
  }

  static get idColumn() {
    return 'user_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id'],
      
      properties: {
        user_id: { type: ['integer','string'] },
        language: { type: 'string', maxLength: 10, default: 'fr' },
        theme: { type: 'string', maxLength: 20, default: 'light' },
        timezone: { type: 'string', maxLength: 50, default: 'Europe/Paris' },
        date_format: { type: 'string', maxLength: 20, default: 'DD/MM/YYYY' },
        time_format: { type: 'string', maxLength: 20, default: 'HH:mm' },
        start_page: { type: 'string', maxLength: 50, default: 'dashboard' },
        notifications_enabled: { type: 'boolean', default: true },
        email_notifications: { type: 'boolean', default: true },
        push_notifications: { type: 'boolean', default: false },
        items_per_page: { type: 'integer', default: 25 },
        preferences: { type: 'object' }, // JSON field for additional preferences
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'user_preferences.user_id',
          to: 'users.id'
        }
      }
    };
  }

  // Hooks
  $beforeInsert() {
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}

module.exports = UserPreference;
