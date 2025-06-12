/**
 * Contract model for managing client and carrier contracts in the TMS
 * Supports different contract types, terms, and conditions
 */
const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class Contract extends BaseModel {
  static get tableName() {
    return 'contracts';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['contract_reference', 'contract_type', 'partner_id', 'valid_from'],
      properties: {
        id: { type: 'integer' },
        tenant_id: { type: 'integer' },
        contract_reference: { type: 'string', maxLength: 100 },
        contract_type: { 
          type: 'string',
          enum: ['client', 'carrier']
        },
        partner_id: { type: 'integer' },
        valid_from: { type: 'string', format: 'date-time' },
        valid_to: { type: ['string', 'null'], format: 'date-time' },
        payment_terms: { type: ['string', 'null'], maxLength: 200 },
        payment_days: { type: ['integer', 'null'] },
        general_conditions: { type: ['string', 'null'] },
        status: { 
          type: 'string',
          enum: ['draft', 'active', 'pending', 'expired', 'terminated'],
          default: 'draft'
        },
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        auto_renewal: { type: 'boolean', default: false },
        renewal_notice_days: { type: ['integer', 'null'] },
        notes: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] },
        is_active: { type: 'boolean', default: true }
      }
    };
  }

  static get relationMappings() {
    const Partner = require('./Partner');
    const ContractLine = require('./ContractLine');
    const PartnerDocument = require('./PartnerDocument');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'contracts.partner_id',
          to: 'partners.id'
        }
      },
      contractLines: {
        relation: Model.HasManyRelation,
        modelClass: ContractLine,
        join: {
          from: 'contracts.id',
          to: 'contract_lines.contract_id'
        }
      },
      documents: {
        relation: Model.HasManyRelation,
        modelClass: PartnerDocument,
        join: {
          from: 'contracts.id',
          to: 'partner_documents.reference_id'
        },
        filter: builder => {
          builder.where('reference_type', 'contract');
        }
      }
    };
  }

  /**
   * Check if contract is currently valid
   * @returns {Boolean} - Whether the contract is valid
   */
  isValid() {
    const now = new Date();
    const validFrom = new Date(this.valid_from);
    const validTo = this.valid_to ? new Date(this.valid_to) : null;
    
    return this.is_active && 
           this.status === 'active' && 
           validFrom <= now && 
           (!validTo || validTo >= now);
  }

  /**
   * Check if contract is expiring soon
   * @param {Number} daysThreshold - Days threshold for expiration warning
   * @returns {Boolean} - Whether the contract is expiring soon
   */
  isExpiringSoon(daysThreshold = 30) {
    if (!this.valid_to || !this.is_active || this.status !== 'active') {
      return false;
    }
    
    const now = new Date();
    const validTo = new Date(this.valid_to);
    const diffTime = validTo - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= daysThreshold;
  }

  /**
   * Get contract status with additional context
   * @returns {Object} - Contract status with context
   */
  getStatusWithContext() {
    const now = new Date();
    const validFrom = new Date(this.valid_from);
    const validTo = this.valid_to ? new Date(this.valid_to) : null;
    
    let statusContext = {
      status: this.status,
      is_active: this.is_active,
      is_future: validFrom > now,
      is_expired: validTo && validTo < now,
      days_until_expiry: null,
      days_since_expiry: null,
      needs_renewal: false
    };
    
    if (validTo) {
      const diffTime = validTo - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0) {
        statusContext.days_until_expiry = diffDays;
        statusContext.needs_renewal = this.auto_renewal && diffDays <= (this.renewal_notice_days || 30);
      } else {
        statusContext.days_since_expiry = Math.abs(diffDays);
      }
    }
    
    return statusContext;
  }
}

module.exports = Contract;
