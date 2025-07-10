/**
 * Driver model for managing carrier drivers in the TMS system
 * 
 * This model represents drivers associated with carrier partners.
 */

const { Model } = require('objection');

class Driver extends Model {
  static get tableName() {
    return 'drivers';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'first_name', 'last_name'],
      
      properties: {
        id: { type: 'string' },
        partner_id: { type: 'string' },
        first_name: { type: 'string', maxLength: 100 },
        last_name: { type: 'string', maxLength: 100 },
        license_number: { type: ['string', 'null'], maxLength: 50 },
        license_type: { type: ['string', 'null'], maxLength: 50 },
        license_expiry: { type: ['string', 'null'], format: 'date' },
        phone: { type: ['string', 'null'], maxLength: 20 },
        email: { type: ['string', 'null'], format: 'email', maxLength: 255 },
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'on_leave', 'suspended'],
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
          from: 'drivers.partner_id',
          to: 'partners.id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'drivers.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'drivers.updated_by',
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
  
  // Get full name
  getFullName() {
    return `${this.first_name} ${this.last_name}`;
  }
  
  // Check if license is expired
  isLicenseExpired() {
    if (!this.license_expiry) return false;
    
    const today = new Date();
    const expiryDate = new Date(this.license_expiry);
    
    return expiryDate < today;
  }
  
  // Check if license is about to expire (within 30 days)
  isLicenseAboutToExpire() {
    if (!this.license_expiry) return false;
    
    const today = new Date();
    const expiryDate = new Date(this.license_expiry);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return expiryDate < thirtyDaysFromNow && expiryDate >= today;
  }
}

module.exports = Driver;
