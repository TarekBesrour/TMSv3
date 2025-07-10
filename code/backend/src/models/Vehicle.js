/**
 * Vehicle model for managing carrier vehicles in the TMS system
 * 
 * This model represents vehicles associated with carrier partners.
 */

const { Model } = require('objection');

class Vehicle extends Model {
  static get tableName() {
    return 'vehicles';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'registration_number', 'type'],
      
      properties: {
        id: { type: 'string' },
        partner_id: { type: 'string' },
        registration_number: { type: 'string', maxLength: 50 },
        type: { 
          type: 'string', 
          enum: ['TRUCK', 'VAN', 'TRAILER', 'CONTAINER', 'OTHER'],
        },
        brand: { type: ['string', 'null'], maxLength: 50 },
        model: { type: ['string', 'null'], maxLength: 50 },
        year: { type: ['integer', 'null'] },
        capacity_volume: { type: ['number', 'null'] },
        capacity_weight: { type: ['number', 'null'] },
        length: { type: ['number', 'null'] },
        width: { type: ['number', 'null'] },
        height: { type: ['number', 'null'] },
        fuel_type: { type: ['string', 'null'], maxLength: 50 },
        emissions_class: { type: ['string', 'null'], maxLength: 50 },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'maintenance', 'out_of_service'],
          default: 'active'
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: 'string' },
        updated_by: { type: 'string' }
      }
    };
  }

  static get relationMappings() {
    const Partner = require('./Partner');
    const User = require('./User');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'vehicles.partner_id',
          to: 'partners.id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'vehicles.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'vehicles.updated_by',
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
  
  // Calculate volume in cubic meters
  getVolumeInCubicMeters() {
    if (this.length && this.width && this.height) {
      return (this.length * this.width * this.height) / 1000000; // Convert from cm³ to m³
    }
    return this.capacity_volume;
  }
}

module.exports = Vehicle;
