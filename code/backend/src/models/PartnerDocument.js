/**
 * PartnerDocument model for managing documents associated with partners in the TMS system
 * 
 * This model represents documents such as contracts, certificates, licenses, etc.
 */

const { Model } = require('objection');

class PartnerDocument extends Model {
  static get tableName() {
    return 'partner_documents';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'name', 'file_path'],
      
      properties: {
        id: { type: ['integer','string'] },
        partner_id: { type: ['integer','string'] },
        contract_id: { type: ['integer', 'string','null'] },
        type: { 
          type: 'string', 
          enum: ['CONTRACT', 'CERTIFICATE', 'LICENSE', 'INSURANCE', 'INVOICE', 'OTHER'],
          default: 'OTHER'
        },
        name: { type: 'string', maxLength: 255 },
        file_path: { type: 'string', maxLength: 255 },
        mime_type: { type: ['string', 'null'], maxLength: 100 },
        size: { type: ['integer', 'null'] },
        upload_date: { type: 'string', format: 'date-time' },
        expiry_date: { type: ['string', 'null'], format: 'date' },
        status: { 
          type: 'string', 
          enum: ['active', 'archived', 'expired'],
          default: 'active'
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
    const Contract = require('./Contract');
    const User = require('./User');

    return {
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'partner_documents.partner_id',
          to: 'partners.id'
        }
      },
      
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        join: {
          from: 'partner_documents.contract_id',
          to: 'contracts.id'
        }
      },
      
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'partner_documents.created_by',
          to: 'users.id'
        }
      },
      
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'partner_documents.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  // Hooks
  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.upload_date = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
  
  // Check if document is expired
  isExpired() {
    if (!this.expiry_date) return false;
    
    const today = new Date();
    const expiryDate = new Date(this.expiry_date);
    
    return expiryDate < today;
  }
  
  // Check if document is about to expire (within 30 days)
  isAboutToExpire() {
    if (!this.expiry_date) return false;
    
    const today = new Date();
    const expiryDate = new Date(this.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return expiryDate < thirtyDaysFromNow && expiryDate >= today;
  }
  
  // Get file extension
  getFileExtension() {
    if (!this.file_path) return null;
    
    const parts = this.file_path.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    
    return null;
  }
  
  // Get formatted file size
  getFormattedSize() {
    if (!this.size) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.size;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }
}

module.exports = PartnerDocument;
