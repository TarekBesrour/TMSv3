/**
 * TransportUnit model for managing transport units in the TMS system
 * 
 * This model represents transport units such as containers, pallets, or packages
 * that are used to transport goods in multimodal shipments.
 */

const { Model } = require('objection');

class TransportUnit extends Model {
  static get tableName() {
    return 'transport_units';
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
      required: ['shipment_id', 'type', 'status'],

      properties: {
        id: { type: 'string' },
        tenant_id: { type: 'string' },
        shipment_id: { type: 'string' },
        reference: { type: ['string', 'null'], maxLength: 50 },
        
        // Type and identification
        type: { 
          type: 'string', 
          enum: [
            'container', 'pallet', 'box', 'crate', 'bag', 
            'drum', 'bulk', 'parcel', 'other'
          ] 
        },
        subtype: { type: ['string', 'null'], maxLength: 50 },
        identifier: { type: ['string', 'null'], maxLength: 50 }, // Container number, pallet ID, etc.
        
        // Container specific
        container_type: { 
          type: ['string', 'null'], 
          enum: [
            'dry_20', 'dry_40', 'dry_45', 'high_cube_40', 'high_cube_45',
            'reefer_20', 'reefer_40', 'open_top_20', 'open_top_40',
            'flat_rack_20', 'flat_rack_40', 'tank_20', 'tank_40', null
          ] 
        },
        container_owner: { type: ['string', 'null'], maxLength: 100 },
        
        // Physical properties
        weight: { type: ['number', 'null'] },
        weight_unit: { type: ['string', 'null'], enum: ['kg', 'lb', 'g', 't', null] },
        tare_weight: { type: ['number', 'null'] }, // Empty weight of container
        net_weight: { type: ['number', 'null'] }, // Weight of goods only
        gross_weight: { type: ['number', 'null'] }, // Total weight including container
        length: { type: ['number', 'null'] },
        width: { type: ['number', 'null'] },
        height: { type: ['number', 'null'] },
        dimension_unit: { type: ['string', 'null'], enum: ['cm', 'm', 'in', 'ft', null] },
        volume: { type: ['number', 'null'] },
        volume_unit: { type: ['string', 'null'], enum: ['m3', 'ft3', 'l', null] },
        
        // Packaging information
        quantity: { type: ['integer', 'null'] }, // Number of identical units
        stackable: { type: 'boolean', default: true },
        max_stack_weight: { type: ['number', 'null'] },
        
        // Special requirements
        is_dangerous_goods: { type: 'boolean', default: false },
        dangerous_goods_class: { type: ['string', 'null'], maxLength: 50 },
        un_number: { type: ['string', 'null'], maxLength: 20 },
        temperature_controlled: { type: 'boolean', default: false },
        min_temperature: { type: ['number', 'null'] },
        max_temperature: { type: ['number', 'null'] },
        temperature_unit: { type: ['string', 'null'], enum: ['C', 'F', null] },
        
        // Seals and security
        seal_number: { type: ['string', 'null'], maxLength: 50 },
        seal_type: { type: ['string', 'null'], maxLength: 50 },
        customs_seal: { type: ['string', 'null'], maxLength: 50 },
        
        // Status
        status: { 
          type: 'string', 
          enum: [
            'empty', 'loaded', 'in_transit', 'delivered', 
            'returned', 'damaged', 'lost'
          ] 
        },
        
        // Current location
        current_location_id: { type: ['integer', 'string','null'] },
        current_location_type: { 
          type: ['string', 'null'], 
          enum: ['address', 'port', 'airport', 'terminal', 'warehouse', 'hub', 'vehicle', null] 
        },
        current_location_name: { type: ['string', 'null'], maxLength: 255 },
        
        // Timestamps
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        loaded_at: { type: ['string', 'null'], format: 'date-time' },
        
        // Audit fields
        created_by: { type: 'string' },
        updated_by: { type: 'string' }
      }
    };
  }

  static get relationMappings() {
    // Avoid circular dependencies by requiring models here
    const Shipment = require('./Shipment');
    const OrderLine = require('./OrderLine');
    const TransportSegment = require('./TransportSegment');
    const Address = require('./Address');
    const Site = require('./Site');
    const User = require('./User');
    const TrackingEvent = require('./TrackingEvent');

    return {
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'transport_units.shipment_id',
          to: 'shipments.id'
        }
      },
      
      orderLines: {
        relation: Model.ManyToManyRelation,
        modelClass: OrderLine,
        join: {
          from: 'transport_units.id',
          through: {
            from: 'transport_unit_contents.transport_unit_id',
            to: 'transport_unit_contents.order_line_id',
            extra: ['quantity']
          },
          to: 'order_lines.id'
        }
      },
      
      transportSegments: {
        relation: Model.ManyToManyRelation,
        modelClass: TransportSegment,
        join: {
          from: 'transport_units.id',
          through: {
            from: 'segment_transport_units.transport_unit_id',
            to: 'segment_transport_units.transport_segment_id'
          },
          to: 'transport_segments.id'
        }
      },
      
      currentAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'transport_units.current_location_id',
          to: 'addresses.id'
        }
      },
      
      currentSite: {
        relation: Model.BelongsToOneRelation,
        modelClass: Site,
        join: {
          from: 'transport_units.current_location_id',
          to: 'sites.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transport_units.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transport_units.updated_by',
          to: 'users.id'
        }
      },
      
      trackingEvents: {
        relation: Model.HasManyRelation,
        modelClass: TrackingEvent,
        join: {
          from: 'transport_units.id',
          to: 'tracking_events.transport_unit_id'
        }
      }
    };
  }

  // Helper methods
  isContainer() {
    return this.type === 'container';
  }

  isPallet() {
    return this.type === 'pallet';
  }

  isLoaded() {
    return this.status === 'loaded' || this.status === 'in_transit';
  }

  isInTransit() {
    return this.status === 'in_transit';
  }

  requiresSpecialHandling() {
    return this.is_dangerous_goods || this.temperature_controlled;
  }

  calculateGrossWeight() {
    if (this.gross_weight) {
      return this.gross_weight;
    }
    
    if (this.net_weight && this.tare_weight) {
      return this.net_weight + this.tare_weight;
    }
    
    return this.weight;
  }

  calculateVolume() {
    if (this.volume) {
      return this.volume;
    }
    
    if (this.length && this.width && this.height) {
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
      return length * width * height * (this.quantity || 1);
    }
    
    return null;
  }

  getLatestTrackingEvent() {
    if (!this.trackingEvents || this.trackingEvents.length === 0) {
      return null;
    }
    
    return this.trackingEvents.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    })[0];
  }
}

module.exports = TransportUnit;
