/**
 * TransportSegment model for managing segments of multimodal transport in the TMS system
 * 
 * This model represents individual segments of a shipment's journey,
 * supporting multimodal transport chains with different carriers and modes.
 */

const { Model } = require('objection');

class TransportSegment extends Model {
  static get tableName() {
    return 'transport_segments';
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
      required: ['shipment_id', 'transport_mode', 'sequence_number', 'status'],

      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string'] },
        shipment_id: { type: ['integer','string'] },
        sequence_number: { type: 'integer' },
        reference: { type: ['string', 'null'], maxLength: 50 },
        
        // Transport mode and carrier
        transport_mode: { 
          type: 'string', 
          enum: ['road', 'rail', 'sea', 'air', 'inland_waterway'] 
        },
        carrier_id: { type: ['integer', 'string','null'] },
        carrier_reference: { type: ['string', 'null'], maxLength: 100 },
        
        // Vehicle/vessel information
        vehicle_id: { type: ['integer', 'string','null'] },
        vehicle_reference: { type: ['string', 'null'], maxLength: 100 },
        driver_id: { type: ['integer', 'string','null'] },
        
        // For sea/air transport
        vessel_name: { type: ['string', 'null'], maxLength: 100 },
        voyage_number: { type: ['string', 'null'], maxLength: 50 },
        vessel_imo: { type: ['string', 'null'], maxLength: 20 },
        
        // For air transport
        flight_number: { type: ['string', 'null'], maxLength: 20 },
        
        // For rail transport
        train_number: { type: ['string', 'null'], maxLength: 20 },
        wagon_number: { type: ['string', 'null'], maxLength: 20 },
        
        // Locations
        origin_location_id: { type: ['integer', 'string','null'] },
        origin_location_type: { 
          type: ['string', 'null'], 
          enum: ['address', 'port', 'airport', 'terminal', 'warehouse', 'hub', null] 
        },
        origin_location_code: { type: ['string', 'null'], maxLength: 20 },
        origin_location_name: { type: ['string', 'null'], maxLength: 255 },
        origin_country: { type: ['string', 'null'], maxLength: 2 },
        
        destination_location_id: { type: ['integer', 'string','null'] },
        destination_location_type: { 
          type: ['string', 'null'], 
          enum: ['address', 'port', 'airport', 'terminal', 'warehouse', 'hub', null] 
        },
        destination_location_code: { type: ['string', 'null'], maxLength: 20 },
        destination_location_name: { type: ['string', 'null'], maxLength: 255 },
        destination_country: { type: ['string', 'null'], maxLength: 2 },
        
        // Dates
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        planned_departure_date: { type: ['string', 'null'], format: 'date-time' },
        actual_departure_date: { type: ['string', 'null'], format: 'date-time' },
        planned_arrival_date: { type: ['string', 'null'], format: 'date-time' },
        actual_arrival_date: { type: ['string', 'null'], format: 'date-time' },
        estimated_arrival_date: { type: ['string', 'null'], format: 'date-time' },
        
        // Status
        status: { 
          type: 'string', 
          enum: [
            'planned', 'booked', 'in_transit', 'arrived', 
            'delayed', 'cancelled', 'completed'
          ] 
        },
        
        // Distance and duration
        distance: { type: ['number', 'null'] },
        distance_unit: { type: ['string', 'null'], enum: ['km', 'mi', 'nm', null] },
        duration: { type: ['number', 'null'] }, // in minutes
        
        // Financial information
        cost: { type: ['number', 'null'] },
        currency: { type: ['string', 'null'], maxLength: 3 },
        
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
    const Shipment = require('./Shipment');
    const Partner = require('./Partner');
    const Vehicle = require('./Vehicle');
    const Driver = require('./Driver');
    const Address = require('./Address');
    const Site = require('./Site');
    const User = require('./User');
    const TrackingEvent = require('./TrackingEvent');
    const TransportUnit = require('./TransportUnit');

    return {
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'transport_segments.shipment_id',
          to: 'shipments.id'
        }
      },
      
      carrier: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'transport_segments.carrier_id',
          to: 'partners.id'
        }
      },
      
      vehicle: {
        relation: Model.BelongsToOneRelation,
        modelClass: Vehicle,
        join: {
          from: 'transport_segments.vehicle_id',
          to: 'vehicles.id'
        }
      },
      
      driver: {
        relation: Model.BelongsToOneRelation,
        modelClass: Driver,
        join: {
          from: 'transport_segments.driver_id',
          to: 'drivers.id'
        }
      },
      
      originAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'transport_segments.origin_location_id',
          to: 'addresses.id'
        }
      },
      
      destinationAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'transport_segments.destination_location_id',
          to: 'addresses.id'
        }
      },
      
      originSite: {
        relation: Model.BelongsToOneRelation,
        modelClass: Site,
        join: {
          from: 'transport_segments.origin_location_id',
          to: 'sites.id'
        }
      },
      
      destinationSite: {
        relation: Model.BelongsToOneRelation,
        modelClass: Site,
        join: {
          from: 'transport_segments.destination_location_id',
          to: 'sites.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transport_segments.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transport_segments.updated_by',
          to: 'users.id'
        }
      },
      
      trackingEvents: {
        relation: Model.HasManyRelation,
        modelClass: TrackingEvent,
        join: {
          from: 'transport_segments.id',
          to: 'tracking_events.transport_segment_id'
        }
      },
      
      transportUnits: {
        relation: Model.ManyToManyRelation,
        modelClass: TransportUnit,
        join: {
          from: 'transport_segments.id',
          through: {
            from: 'segment_transport_units.transport_segment_id',
            to: 'segment_transport_units.transport_unit_id'
          },
          to: 'transport_units.id'
        }
      }
    };
  }

  // Helper methods
  isInternational() {
    return this.origin_country !== this.destination_country;
  }

  isInTransit() {
    return this.status === 'in_transit';
  }

  isCompleted() {
    return this.status === 'completed';
  }

  calculateDelay() {
    if (!this.planned_arrival_date || !this.actual_arrival_date) {
      return null;
    }
    
    const planned = new Date(this.planned_arrival_date);
    const actual = new Date(this.actual_arrival_date);
    
    // Return delay in minutes
    return Math.round((actual - planned) / (1000 * 60));
  }

  getLatestTrackingEvent() {
    if (!this.trackingEvents || this.trackingEvents.length === 0) {
      return null;
    }
    
    return this.trackingEvents.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    })[0];
  }

  getLocationName(type) {
    if (type !== 'origin' && type !== 'destination') {
      throw new Error('Type must be either "origin" or "destination"');
    }
    
    const locationType = this[`${type}_location_type`];
    const locationName = this[`${type}_location_name`];
    const locationCode = this[`${type}_location_code`];
    
    if (locationName) {
      return locationCode ? `${locationName} (${locationCode})` : locationName;
    }
    
    return locationCode || 'Unknown';
  }
}

module.exports = TransportSegment;
