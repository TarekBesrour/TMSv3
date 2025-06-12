/**
 * Contract model for managing partner contracts in the TMS system
 * 
 * This model represents contracts between the company and its partners.
 */

const { Model } = require('objection');

class Contract extends Model {
  static get tableName() {
    return 'contracts';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'reference', 'type', 'start_date'],
      
      properties: {
        id: { type: 'integer' },
        partner_id: { type: 'integer' },
        reference: { type: 'string', maxLength: 100 },
        type: { 
          type: 'string', 
          enum: ['TRANSPORT', 'LOGISTICS', 'WAREHOUSING', 'DISTRIBUTION', 'OTHER'],
        },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: ['string', 'null'], format: 'date' },
        renewal_date: { type: ['string', 'null'], format: 'date' },
        terms: { type: ['string', 'null'] },
        pricing_model: { type: ['string', 'null'], maxLength: 100 },
        currency: { type: ['string', 'null'], maxLength: 3 },
        payment_terms: { type: ['string', 'null'], maxLength: 100 },
        status: { 
          type: 'string', 
          enum: ['draft', 'active', 'expired', 'terminated', 'pending_renewal'],
          default: 'draft'
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    const Partner = require('./Partner');
    const PartnerDocument = require('./PartnerDocument');
    const User = require('./User');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'contracts.partner_id',
          to: 'partners.id'
        }
      },
      
      documents: {
        relation: Model.HasManyRelation,
        modelClass: PartnerDocument,
        join: {
          from: 'contracts.id',
          to: 'partner_documents.contract_id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contracts.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'contracts.updated_by',
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
  
  // Check if contract is active
  isActive() {
    const today = new Date();
    const startDate = new Date(this.start_date);
    
    if (startDate > today) {
      return false;
    }
    
    if (this.end_date) {
      const endDate = new Date(this.end_date);
      return endDate >= today;
    }
    
    return true;
  }
  
  // Check if contract is about to expire (within 30 days)
  isAboutToExpire() {
    if (!this.end_date) return false;
    
    const today = new Date();
    const endDate = new Date(this.end_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return endDate < thirtyDaysFromNow && endDate >= today;
  }
  
  // Get contract duration in months
  getDurationInMonths() {
    if (!this.end_date) return null;
    
    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    
    const diffInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (endDate.getMonth() - startDate.getMonth());
    
    return diffInMonths;
  }
}

module.exports = Contract;
