/**
 * Order model for managing customer orders in the TMS system
 * 
 * This model represents customer orders with support for international shipping
 * and multimodal transport requirements.
 */

const { Model } = require('objection');
const { v4: uuidv4 } = require('uuid');

class Order extends Model {
  static get tableName() {
    return 'orders';
  }

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    
    // Generate a unique reference number if not provided
    if (!this.reference) {
      const prefix = 'ORD';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.reference = `${prefix}-${timestamp}-${random}`;
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['customer_id', 'status'],

      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string'] },
        reference: { type: 'string', maxLength: 50 },
        external_reference: { type: ['string', 'null'], maxLength: 100 },
        customer_id: { type: ['integer','string'] },
        customer_order_reference: { type: ['string', 'null'], maxLength: 100 },
        
        // Dates
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        requested_date: { type: ['string', 'null'], format: 'date-time' },
        promised_date: { type: ['string', 'null'], format: 'date-time' },
        
        // Status and priority
        status: { 
          type: 'string', 
          enum: ['draft', 'confirmed', 'planned', 'in_progress', 'completed', 'cancelled', 'on_hold'] 
        },
        priority: { 
          type: 'string', 
          enum: ['low', 'normal', 'high', 'urgent'] 
        },
        service_type: { 
          type: 'string', 
          enum: ['standard', 'express', 'economy', 'custom'] 
        },
        
        // International shipping
        incoterm: { 
          type: ['string', 'null'], 
          enum: [
            'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 
            'DAP', 'DPU', 'DDP', null
          ]
        },
        incoterm_location: { type: ['string', 'null'], maxLength: 255 },
        currency: { type: ['string', 'null'], maxLength: 3 },
        
        // Financial information
        total_value: { type: ['number', 'null'] },
        shipping_cost: { type: ['number', 'null'] },
        insurance_cost: { type: ['number', 'null'] },
        customs_cost: { type: ['number', 'null'] },
        tax_amount: { type: ['number', 'null'] },
        total_cost: { type: ['number', 'null'] },
        
        // Shipping information
        origin_address_id: { type: ['integer', 'string','null'] },
        destination_address_id: { type: ['integer', 'string','null'] },
        
        // Multimodal preferences
        preferred_transport_modes: { 
          type: ['array', 'null'],
          items: {
            type: 'string',
            enum: ['road', 'rail', 'sea', 'air', 'inland_waterway', 'multimodal']
          }
        },
        
        // Additional information
        special_instructions: { type: ['string', 'null'] },
        notes: { type: ['string', 'null'] },
        
        // Audit fields
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    // Avoid circular dependencies by requiring models here
    const Partner = require('./Partner');
    const Address = require('./Address');
    const User = require('./User');
    const OrderLine = require('./OrderLine');
    const Shipment = require('./Shipment');
    const OrderDocument = require('./OrderDocument');
    const CustomsInfo = require('./CustomsInfo');

    return {
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'orders.customer_id',
          to: 'partners.id'
        }
      },
      
      originAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'orders.origin_address_id',
          to: 'addresses.id'
        }
      },
      
      destinationAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'orders.destination_address_id',
          to: 'addresses.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'orders.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'orders.updated_by',
          to: 'users.id'
        }
      },
      
      orderLines: {
        relation: Model.HasManyRelation,
        modelClass: OrderLine,
        join: {
          from: 'orders.id',
          to: 'order_lines.order_id'
        }
      },
      
      shipments: {
        relation: Model.HasManyRelation,
        modelClass: Shipment,
        join: {
          from: 'orders.id',
          to: 'shipments.order_id'
        }
      },
      
      documents: {
        relation: Model.HasManyRelation,
        modelClass: OrderDocument,
        join: {
          from: 'orders.id',
          to: 'order_documents.order_id'
        }
      },
      
      customsInfo: {
        relation: Model.HasOneRelation,
        modelClass: CustomsInfo,
        join: {
          from: 'orders.id',
          to: 'customs_info.order_id'
        }
      }
    };
  }

  // Helper methods
  isInternational() {
    return !!this.incoterm;
  }

  isMultimodal() {
    return this.preferred_transport_modes && this.preferred_transport_modes.length > 1;
  }

  requiresCustoms() {
    // This would be more sophisticated in a real application,
    // checking origin and destination countries
    return this.isInternational();
  }

  calculateTotalWeight() {
    if (!this.orderLines || this.orderLines.length === 0) {
      return 0;
    }
    
    return this.orderLines.reduce((sum, line) => {
      return sum + (line.weight * line.quantity);
    }, 0);
  }

  calculateTotalVolume() {
    if (!this.orderLines || this.orderLines.length === 0) {
      return 0;
    }
    
    return this.orderLines.reduce((sum, line) => {
      return sum + (line.volume * line.quantity);
    }, 0);
  }
}

module.exports = Order;
