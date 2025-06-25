const { Model } = require('objection');

class SystemConfiguration extends Model {
  static get tableName() {
    return 'system_configurations';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'config_key', 'config_value'],
      properties: {
        id: { type: 'integer' },
        tenant_id: { type: 'integer' },
        
        // Configuration key and value
        config_key: { type: 'string', maxLength: 255 },
        config_value: { type: ['string', 'null'] },
        config_type: { 
          type: 'string', 
          enum: ['string', 'number', 'boolean', 'json', 'array'],
          default: 'string'
        },
        
        // Metadata
        category: { type: 'string', maxLength: 100 },
        description: { type: ['string', 'null'] },
        is_system: { type: 'boolean', default: false },
        is_encrypted: { type: 'boolean', default: false },
        
        // Validation
        validation_rules: { type: ['string', 'null'] },
        default_value: { type: ['string', 'null'] },
        
        // Audit
        created_by: { type: 'integer' },
        updated_by: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'system_configurations.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'system_configurations.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Méthodes utilitaires
  getParsedValue() {
    if (!this.config_value) return null;

    switch (this.config_type) {
      case 'number':
        return parseFloat(this.config_value);
      case 'boolean':
        return this.config_value.toLowerCase() === 'true';
      case 'json':
        try {
          return JSON.parse(this.config_value);
        } catch (e) {
          return null;
        }
      case 'array':
        try {
          return JSON.parse(this.config_value);
        } catch (e) {
          return this.config_value.split(',').map(item => item.trim());
        }
      default:
        return this.config_value;
    }
  }

  static formatValue(value, type) {
    switch (type) {
      case 'number':
        return value.toString();
      case 'boolean':
        return value ? 'true' : 'false';
      case 'json':
      case 'array':
        return JSON.stringify(value);
      default:
        return value.toString();
    }
  }

  // Validation métier
  static async validateConfiguration(configData) {
    const errors = [];

    // Vérifier la clé de configuration
    if (!configData.config_key || configData.config_key.trim() === '') {
      errors.push('Configuration key is required');
    }

    // Vérifier le type de configuration
    const validTypes = ['string', 'number', 'boolean', 'json', 'array'];
    if (configData.config_type && !validTypes.includes(configData.config_type)) {
      errors.push('Invalid configuration type');
    }

    // Vérifier la valeur selon le type
    if (configData.config_value && configData.config_type) {
      switch (configData.config_type) {
        case 'number':
          if (isNaN(parseFloat(configData.config_value))) {
            errors.push('Configuration value must be a valid number');
          }
          break;
        case 'boolean':
          if (!['true', 'false'].includes(configData.config_value.toLowerCase())) {
            errors.push('Configuration value must be true or false');
          }
          break;
        case 'json':
        case 'array':
          try {
            JSON.parse(configData.config_value);
          } catch (e) {
            errors.push('Configuration value must be valid JSON');
          }
          break;
      }
    }

    return errors;
  }
}

module.exports = SystemConfiguration;

