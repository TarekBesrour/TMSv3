/**
 * Shipment model for managing shipments in the TMS system
 * 
 * This model represents shipments with support for multimodal transport
 * and international shipping requirements.
 */

const { Model } = require('objection');

class Shipment extends Model {
  static get tableName() {
    return 'shipments';
  }

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    
    // Generate a unique reference number if not provided
    if (!this.reference) {
      const prefix = 'SHP';
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
      required: ['status'],

      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string'] },
        reference: { type: 'string', maxLength: 50 },
        order_id: { type: ['integer', 'string','null'] },
        
        // Type and classification
        shipment_type: { 
          type: 'string', 
          enum: ['domestic', 'international', 'return', 'transfer'] 
        },
        service_level: { 
          type: 'string', 
          enum: ['standard', 'express', 'economy', 'custom'] 
        },
        
        // Locations
        origin_address_id: { type: ['integer', 'string','null'] },
        destination_address_id: { type: ['integer', 'string','null'] },
        
        // Primary carrier
        carrier_id: { type: ['integer', 'string','null'] },
        carrier_reference: { type: ['string', 'null'], maxLength: 100 },
        
        // Primary transport mode
        transport_mode: { 
          type: 'string', 
          enum: ['road', 'rail', 'sea', 'air', 'inland_waterway', 'multimodal'] 
        },
        
        // Dates
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        planned_pickup_date: { type: ['string', 'null'], format: 'date-time' },
        actual_pickup_date: { type: ['string', 'null'], format: 'date-time' },
        planned_delivery_date: { type: ['string', 'null'], format: 'date-time' },
        actual_delivery_date: { type: ['string', 'null'], format: 'date-time' },
        estimated_arrival_date: { type: ['string', 'null'], format: 'date-time' },
        
        // Status
        status: { 
          type: 'string', 
          enum: [
            'draft', 'planned', 'booked', 'in_transit', 'customs_hold', 
            'delivered', 'exception', 'cancelled', 'completed'
          ] 
        },
        
        // Physical properties
        total_weight: { type: ['number', 'null'] },
        weight_unit: { type: ['string', 'null'], enum: ['kg', 'lb', 'g', 't', null] },
        total_volume: { type: ['number', 'null'] },
        volume_unit: { type: ['string', 'null'], enum: ['m3', 'ft3', 'l', null] },
        package_count: { type: ['integer', 'null'] },
        pallet_count: { type: ['integer', 'null'] },
        
        // Financial information
        total_cost: { type: ['number', 'null'] },
        currency: { type: ['string', 'null'], maxLength: 3 },
        freight_cost: { type: ['number', 'null'] },
        fuel_surcharge: { type: ['number', 'null'] },
        customs_cost: { type: ['number', 'null'] },
        insurance_cost: { type: ['number', 'null'] },
        other_costs: { type: ['number', 'null'] },
        
        // International shipping
        incoterm: { 
          type: ['string', 'null'], 
          enum: [
            'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 
            'DAP', 'DPU', 'DDP', null
          ]
        },
        customs_status: { 
          type: ['string', 'null'], 
          enum: [
            'not_required', 'pending', 'in_progress', 'cleared', 
            'held', 'rejected', null
          ]
        },
        
        // Carbon footprint
        co2_emissions: { type: ['number', 'null'] },
        co2_emissions_unit: { type: ['string', 'null'], enum: ['kg', 't', null] },
        
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
    const Order = require('./Order');
    const Partner = require('./Partner');
    const Address = require('./Address');
    const User = require('./User');
    const TransportSegment = require('./TransportSegment');
    const TransportUnit = require('./TransportUnit');
    const ShipmentDocument = require('./ShipmentDocument');
    const TrackingEvent = require('./TrackingEvent');
    const CustomsInfo = require('./CustomsInfo');

    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'shipments.order_id',
          to: 'orders.id'
        }
      },
      
      carrier: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'shipments.carrier_id',
          to: 'partners.id'
        }
      },
      
      originAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'shipments.origin_address_id',
          to: 'addresses.id'
        }
      },
      
      destinationAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'shipments.destination_address_id',
          to: 'addresses.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'shipments.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'shipments.updated_by',
          to: 'users.id'
        }
      },
      
      transportSegments: {
        relation: Model.HasManyRelation,
        modelClass: TransportSegment,
        join: {
          from: 'shipments.id',
          to: 'transport_segments.shipment_id'
        }
      },
      
      transportUnits: {
        relation: Model.HasManyRelation,
        modelClass: TransportUnit,
        join: {
          from: 'shipments.id',
          to: 'transport_units.shipment_id'
        }
      },
      
      documents: {
        relation: Model.HasManyRelation,
        modelClass: ShipmentDocument,
        join: {
          from: 'shipments.id',
          to: 'shipment_documents.shipment_id'
        }
      },
      
      trackingEvents: {
        relation: Model.HasManyRelation,
        modelClass: TrackingEvent,
        join: {
          from: 'shipments.id',
          to: 'tracking_events.shipment_id'
        }
      },
      
      customsInfo: {
        relation: Model.HasOneRelation,
        modelClass: CustomsInfo,
        join: {
          from: 'shipments.id',
          to: 'customs_info.shipment_id'
        }
      }
    };
  }

  // Helper methods
  isInternational() {
    return this.shipment_type === 'international' || !!this.incoterm;
  }

  isMultimodal() {
    return this.transport_mode === 'multimodal';
  }

  requiresCustoms() {
    return this.isInternational();
  }

  isInTransit() {
    return this.status === 'in_transit' || this.status === 'customs_hold';
  }

  isCompleted() {
    return this.status === 'delivered' || this.status === 'completed';
  }

  calculateDeliveryDelay() {
    if (!this.planned_delivery_date || !this.actual_delivery_date) {
      return null;
    }
    
    const planned = new Date(this.planned_delivery_date);
    const actual = new Date(this.actual_delivery_date);
    
    // Return delay in hours
    return Math.round((actual - planned) / (1000 * 60 * 60));
  }

  getLatestTrackingEvent() {
    if (!this.trackingEvents || this.trackingEvents.length === 0) {
      return null;
    }
    
    return this.trackingEvents.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    })[0];
  }

  getTransportModes() {
    if (!this.transportSegments || this.transportSegments.length === 0) {
      return [this.transport_mode];
    }
    
    // Get unique transport modes from all segments
    return [...new Set(this.transportSegments.map(segment => segment.transport_mode))];
  }
}

module.exports = Shipment;
