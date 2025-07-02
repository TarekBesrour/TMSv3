/**
 * ShipmentDocument model for managing documents related to shipments in the TMS system
 * 
 * This model represents documents associated with shipments, orders, and customs,
 * supporting international shipping requirements and compliance.
 */

const { Model } = require('objection');

class ShipmentDocument extends Model {
  static get tableName() {
    return 'shipment_documents';
  }

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['document_type', 'status'],

      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string'] },
        shipment_id: { type: ['integer', 'string','null'] },
        order_id: { type: ['integer', 'string','null'] },
        customs_info_id: { type: ['integer', 'string','null'] },
        transport_segment_id: { type: ['integer', 'string','null'] },
        
        // Document information
        document_type: { 
          type: 'string', 
          enum: [
            'bill_of_lading', 'cmr', 'air_waybill', 'sea_waybill', 'commercial_invoice',
            'packing_list', 'certificate_of_origin', 'dangerous_goods_declaration',
            'customs_declaration', 'import_permit', 'export_permit', 'phytosanitary_certificate',
            'insurance_certificate', 'inspection_certificate', 'delivery_note', 'pickup_note',
            'proof_of_delivery', 'other'
          ] 
        },
        document_number: { type: ['string', 'null'], maxLength: 100 },
        reference: { type: ['string', 'null'], maxLength: 100 },
        
        // File information
        file_name: { type: ['string', 'null'], maxLength: 255 },
        file_path: { type: ['string', 'null'], maxLength: 255 },
        file_type: { type: ['string', 'null'], maxLength: 50 },
        file_size: { type: ['integer', 'null'] },
        
        // Status
        status: { 
          type: 'string', 
          enum: [
            'draft', 'pending', 'approved', 'rejected', 'signed', 
            'submitted', 'received', 'expired', 'cancelled'
          ] 
        },
        
        // Dates
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        issue_date: { type: ['string', 'null'], format: 'date-time' },
        expiry_date: { type: ['string', 'null'], format: 'date-time' },
        
        // Parties
        issuer_id: { type: ['integer', 'string','null'] },
        recipient_id: { type: ['integer', 'string','null'] },
        
        // Additional information
        notes: { type: ['string', 'null'] },
        is_original: { type: 'boolean', default: true },
        requires_original: { type: 'boolean', default: false },
        
        // Audit fields
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    // Avoid circular dependencies by requiring models here
    const Shipment = require('./Shipment');
    const Order = require('./Order');
    const CustomsInfo = require('./CustomsInfo');
    const TransportSegment = require('./TransportSegment');
    const Partner = require('./Partner');
    const User = require('./User');

    return {
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'shipment_documents.shipment_id',
          to: 'shipments.id'
        }
      },
      
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'shipment_documents.order_id',
          to: 'orders.id'
        }
      },
      
      customsInfo: {
        relation: Model.BelongsToOneRelation,
        modelClass: CustomsInfo,
        join: {
          from: 'shipment_documents.customs_info_id',
          to: 'customs_info.id'
        }
      },
      
      transportSegment: {
        relation: Model.BelongsToOneRelation,
        modelClass: TransportSegment,
        join: {
          from: 'shipment_documents.transport_segment_id',
          to: 'transport_segments.id'
        }
      },
      
      issuer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'shipment_documents.issuer_id',
          to: 'partners.id'
        }
      },
      
      recipient: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'shipment_documents.recipient_id',
          to: 'partners.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'shipment_documents.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'shipment_documents.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  // Helper methods
  isExpired() {
    if (!this.expiry_date) {
      return false;
    }
    
    return new Date(this.expiry_date) < new Date();
  }

  isApproved() {
    return this.status === 'approved' || this.status === 'signed' || this.status === 'submitted' || this.status === 'received';
  }

  isPending() {
    return this.status === 'draft' || this.status === 'pending';
  }

  isTransportDocument() {
    const transportDocs = [
      'bill_of_lading', 'cmr', 'air_waybill', 'sea_waybill',
      'delivery_note', 'pickup_note', 'proof_of_delivery'
    ];
    
    return transportDocs.includes(this.document_type);
  }

  isCustomsDocument() {
    const customsDocs = [
      'customs_declaration', 'certificate_of_origin', 'commercial_invoice',
      'packing_list', 'import_permit', 'export_permit', 'phytosanitary_certificate'
    ];
    
    return customsDocs.includes(this.document_type);
  }

  getDocumentTypeName() {
    const documentTypeNames = {
      'bill_of_lading': 'Bill of Lading',
      'cmr': 'CMR Transport Document',
      'air_waybill': 'Air Waybill',
      'sea_waybill': 'Sea Waybill',
      'commercial_invoice': 'Commercial Invoice',
      'packing_list': 'Packing List',
      'certificate_of_origin': 'Certificate of Origin',
      'dangerous_goods_declaration': 'Dangerous Goods Declaration',
      'customs_declaration': 'Customs Declaration',
      'import_permit': 'Import Permit',
      'export_permit': 'Export Permit',
      'phytosanitary_certificate': 'Phytosanitary Certificate',
      'insurance_certificate': 'Insurance Certificate',
      'inspection_certificate': 'Inspection Certificate',
      'delivery_note': 'Delivery Note',
      'pickup_note': 'Pickup Note',
      'proof_of_delivery': 'Proof of Delivery',
      'other': 'Other Document'
    };
    
    return documentTypeNames[this.document_type] || this.document_type;
  }

  getStatusName() {
    const statusNames = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'signed': 'Signé',
      'submitted': 'Soumis',
      'received': 'Reçu',
      'expired': 'Expiré',
      'cancelled': 'Annulé'
    };
    
    return statusNames[this.status] || this.status;
  }
}

module.exports = ShipmentDocument;
