/**
 * CustomsInfo model for managing customs information in the TMS system
 * 
 * This model represents customs information for international shipments,
 * supporting compliance with customs regulations and documentation.
 */

const { Model } = require('objection');

class CustomsInfo extends Model {
  static get tableName() {
    return 'customs_info';
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
      required: ['status'],

      properties: {
        id: { type: 'integer' },
        tenant_id: { type: 'integer' },
        order_id: { type: ['integer', 'null'] },
        shipment_id: { type: ['integer', 'null'] },
        
        // Customs declaration information
        customs_declaration_number: { type: ['string', 'null'], maxLength: 100 },
        declaration_type: { 
          type: ['string', 'null'], 
          enum: [
            'export', 'import', 'transit', 'temporary_export', 
            'temporary_import', 're_export', 're_import', null
          ] 
        },
        
        // Countries and trade information
        origin_country: { type: ['string', 'null'], maxLength: 2 },
        destination_country: { type: ['string', 'null'], maxLength: 2 },
        transit_countries: { 
          type: ['array', 'null'],
          items: { type: 'string', maxLength: 2 }
        },
        
        // Financial information
        customs_value: { type: ['number', 'null'] },
        currency: { type: ['string', 'null'], maxLength: 3 },
        insurance_value: { type: ['number', 'null'] },
        freight_value: { type: ['number', 'null'] },
        
        // Duties and taxes
        duties_amount: { type: ['number', 'null'] },
        taxes_amount: { type: ['number', 'null'] },
        vat_amount: { type: ['number', 'null'] },
        total_duties_taxes: { type: ['number', 'null'] },
        
        // Incoterms
        incoterm: { 
          type: ['string', 'null'], 
          enum: [
            'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 
            'DAP', 'DPU', 'DDP', null
          ]
        },
        
        // Parties
        exporter_id: { type: ['integer', 'null'] },
        importer_id: { type: ['integer', 'null'] },
        declarant_id: { type: ['integer', 'null'] },
        customs_broker_id: { type: ['integer', 'null'] },
        
        // Status
        status: { 
          type: 'string', 
          enum: [
            'not_required', 'pending', 'submitted', 'in_progress', 
            'cleared', 'held', 'rejected', 'completed'
          ] 
        },
        
        // Dates
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        submission_date: { type: ['string', 'null'], format: 'date-time' },
        clearance_date: { type: ['string', 'null'], format: 'date-time' },
        
        // Additional information
        reason_for_hold: { type: ['string', 'null'] },
        notes: { type: ['string', 'null'] },
        
        // Audit fields
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    // Avoid circular dependencies by requiring models here
    const Order = require('./Order');
    const Shipment = require('./Shipment');
    const Partner = require('./Partner');
    const User = require('./User');
    const ShipmentDocument = require('./ShipmentDocument');

    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'customs_info.order_id',
          to: 'orders.id'
        }
      },
      
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'customs_info.shipment_id',
          to: 'shipments.id'
        }
      },
      
      exporter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'customs_info.exporter_id',
          to: 'partners.id'
        }
      },
      
      importer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'customs_info.importer_id',
          to: 'partners.id'
        }
      },
      
      declarant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'customs_info.declarant_id',
          to: 'partners.id'
        }
      },
      
      customsBroker: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'customs_info.customs_broker_id',
          to: 'partners.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'customs_info.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'customs_info.updated_by',
          to: 'users.id'
        }
      },
      
      documents: {
        relation: Model.HasManyRelation,
        modelClass: ShipmentDocument,
        join: {
          from: 'customs_info.id',
          to: 'shipment_documents.customs_info_id'
        }
      }
    };
  }

  // Helper methods
  isCleared() {
    return this.status === 'cleared' || this.status === 'completed';
  }

  isHeld() {
    return this.status === 'held';
  }

  isPending() {
    return this.status === 'pending' || this.status === 'submitted' || this.status === 'in_progress';
  }

  calculateTotalDutiesAndTaxes() {
    let total = 0;
    
    if (this.duties_amount) {
      total += this.duties_amount;
    }
    
    if (this.taxes_amount) {
      total += this.taxes_amount;
    }
    
    if (this.vat_amount) {
      total += this.vat_amount;
    }
    
    return total;
  }

  getRequiredDocuments() {
    // This would be more sophisticated in a real application,
    // based on countries, goods, and declaration type
    const requiredDocs = [];
    
    if (this.declaration_type === 'export' || this.declaration_type === 're_export') {
      requiredDocs.push('export_declaration');
      requiredDocs.push('commercial_invoice');
      requiredDocs.push('packing_list');
    }
    
    if (this.declaration_type === 'import' || this.declaration_type === 're_import') {
      requiredDocs.push('import_declaration');
      requiredDocs.push('commercial_invoice');
      requiredDocs.push('packing_list');
      requiredDocs.push('certificate_of_origin');
    }
    
    if (this.declaration_type === 'transit') {
      requiredDocs.push('transit_document');
      requiredDocs.push('commercial_invoice');
    }
    
    if (this.declaration_type === 'temporary_export' || this.declaration_type === 'temporary_import') {
      requiredDocs.push('ata_carnet');
    }
    
    return requiredDocs;
  }
}

module.exports = CustomsInfo;
