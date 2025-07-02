/**
 * OrderLine model for managing order line items in the TMS system
 * 
 * This model represents individual line items within customer orders,
 * including product details, quantities, and shipping requirements.
 */

const { Model } = require('objection');

class OrderLine extends Model {
  static get tableName() {
    return 'order_lines';
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
      required: ['order_id', 'product_name', 'quantity'],

      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string'] },
        order_id: { type: ['integer','string'] },
        line_number: { type: 'integer' },
        
        // Product information
        product_id: { type: ['integer', 'string','null'] },
        product_code: { type: ['string', 'null'], maxLength: 50 },
        product_name: { type: 'string', maxLength: 255 },
        description: { type: ['string', 'null'] },
        
        // Quantity information
        quantity: { type: 'number' },
        unit_of_measure: { type: ['string', 'null'], maxLength: 20 },
        
        // Physical properties
        weight: { type: ['number', 'null'] },
        weight_unit: { type: ['string', 'null'], enum: ['kg', 'lb', 'g', 't', null] },
        length: { type: ['number', 'null'] },
        width: { type: ['number', 'null'] },
        height: { type: ['number', 'null'] },
        dimension_unit: { type: ['string', 'null'], enum: ['cm', 'm', 'in', 'ft', null] },
        volume: { type: ['number', 'null'] },
        volume_unit: { type: ['string', 'null'], enum: ['m3', 'ft3', 'l', null] },
        
        // Packaging information
        packaging_type: { type: ['string', 'null'], maxLength: 50 },
        packages_count: { type: ['integer', 'null'] },
        
        // Financial information
        unit_value: { type: ['number', 'null'] },
        total_value: { type: ['number', 'null'] },
        currency: { type: ['string', 'null'], maxLength: 3 },
        
        // Special requirements
        is_dangerous_goods: { type: 'boolean', default: false },
        dangerous_goods_class: { type: ['string', 'null'], maxLength: 50 },
        un_number: { type: ['string', 'null'], maxLength: 20 },
        temperature_controlled: { type: 'boolean', default: false },
        min_temperature: { type: ['number', 'null'] },
        max_temperature: { type: ['number', 'null'] },
        temperature_unit: { type: ['string', 'null'], enum: ['C', 'F', null] },
        
        // International shipping information
        country_of_origin: { type: ['string', 'null'], maxLength: 2 },
        hs_code: { type: ['string', 'null'], maxLength: 20 },
        
        // Status
        status: { 
          type: 'string', 
          enum: ['pending', 'allocated', 'partially_shipped', 'shipped', 'cancelled'] 
        },
        
        // Timestamps
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        
        // Audit fields
        created_by: { type: ['integer', 'null'] },
        updated_by: { type: ['integer', 'null'] }
      }
    };
  }

  static get relationMappings() {
    // Avoid circular dependencies by requiring models here
    const Order = require('./Order');
    const User = require('./User');
    const TransportUnit = require('./TransportUnit');

    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'order_lines.order_id',
          to: 'orders.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'order_lines.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'order_lines.updated_by',
          to: 'users.id'
        }
      },
      
      transportUnits: {
        relation: Model.ManyToManyRelation,
        modelClass: TransportUnit,
        join: {
          from: 'order_lines.id',
          through: {
            from: 'transport_unit_contents.order_line_id',
            to: 'transport_unit_contents.transport_unit_id'
          },
          to: 'transport_units.id'
        }
      }
    };
  }

  // Helper methods
  calculateTotalWeight() {
    if (!this.weight || !this.quantity) {
      return 0;
    }
    return this.weight * this.quantity;
  }

  calculateTotalVolume() {
    if (!this.volume || !this.quantity) {
      return 0;
    }
    return this.volume * this.quantity;
  }

  calculateDimensionalWeight(factor = 5000) {
    if (!this.length || !this.width || !this.height || !this.quantity) {
      return 0;
    }
    
    // Convert all dimensions to meters if needed
    let length = this.length;
    let width = this.width;
    let height = this.height;
    
    if (this.dimension_unit === 'cm') {
      length /= 100;
      width /= 100;
      height /= 100;
    } else if (this.dimension_unit === 'in') {
      length *= 0.0254;
      width *= 0.0254;
      height *= 0.0254;
    } else if (this.dimension_unit === 'ft') {
      length *= 0.3048;
      width *= 0.3048;
      height *= 0.3048;
    }
    
    // Calculate volume in cubic meters
    const volumeInCubicMeters = length * width * height * this.quantity;
    
    // Calculate dimensional weight in kg
    return volumeInCubicMeters * factor;
  }

  requiresSpecialHandling() {
    return this.is_dangerous_goods || this.temperature_controlled;
  }

  requiresCustomsDeclaration() {
    return !!this.hs_code || !!this.country_of_origin;
  }
}

module.exports = OrderLine;
