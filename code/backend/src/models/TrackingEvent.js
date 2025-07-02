/**
 * TrackingEvent model for managing tracking events in the TMS system
 * 
 * This model represents tracking events for shipments, transport segments,
 * and transport units, supporting real-time visibility across multimodal chains.
 */

const { Model } = require('objection');

class TrackingEvent extends Model {
  static get tableName() {
    return 'tracking_events';
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
      required: ['event_type', 'timestamp'],

      properties: {
        id: { type: ['integer','string'] },
        tenant_id: { type: ['integer','string'] },
        shipment_id: { type: ['integer', 'string','null'] },
        transport_segment_id: { type: ['integer', 'string','null'] },
        transport_unit_id: { type: ['integer', 'string','null'] },
        
        // Event information
        event_type: { 
          type: 'string', 
          enum: [
            'pickup_planned', 'pickup_delayed', 'pickup_completed',
            'departure', 'arrival', 'in_transit', 'customs_clearance_start',
            'customs_hold', 'customs_cleared', 'delivery_planned',
            'delivery_delayed', 'delivery_completed', 'exception',
            'status_update', 'document_update', 'location_update'
          ] 
        },
        event_code: { type: ['string', 'null'], maxLength: 50 },
        description: { type: ['string', 'null'] },
        
        // Timing
        timestamp: { type: 'string', format: 'date-time' },
        planned_timestamp: { type: ['string', 'null'], format: 'date-time' },
        
        // Location
        location_type: { 
          type: ['string', 'null'], 
          enum: [
            'address', 'port', 'airport', 'terminal', 'warehouse', 
            'hub', 'border', 'customs', 'vehicle', null
          ] 
        },
        location_id: { type: ['integer', 'string','null'] },
        location_name: { type: ['string', 'null'], maxLength: 255 },
        location_code: { type: ['string', 'null'], maxLength: 50 },
        country: { type: ['string', 'null'], maxLength: 2 },
        
        // Geolocation
        latitude: { type: ['number', 'null'] },
        longitude: { type: ['number', 'null'] },
        
        // Status information
        status: { type: ['string', 'null'], maxLength: 50 },
        reason_code: { type: ['string', 'null'], maxLength: 50 },
        reason: { type: ['string', 'null'] },
        
        // Source of information
        source: { 
          type: ['string', 'null'], 
          enum: [
            'carrier_api', 'edi', 'manual', 'gps', 'iot_device', 
            'mobile_app', 'email', 'system', null
          ] 
        },
        source_reference: { type: ['string', 'null'], maxLength: 100 },
        
        // Additional information
        notes: { type: ['string', 'null'] },
        
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
    const Shipment = require('./Shipment');
    const TransportSegment = require('./TransportSegment');
    const TransportUnit = require('./TransportUnit');
    const Address = require('./Address');
    const Site = require('./Site');
    const User = require('./User');

    return {
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'tracking_events.shipment_id',
          to: 'shipments.id'
        }
      },
      
      transportSegment: {
        relation: Model.BelongsToOneRelation,
        modelClass: TransportSegment,
        join: {
          from: 'tracking_events.transport_segment_id',
          to: 'transport_segments.id'
        }
      },
      
      transportUnit: {
        relation: Model.BelongsToOneRelation,
        modelClass: TransportUnit,
        join: {
          from: 'tracking_events.transport_unit_id',
          to: 'transport_units.id'
        }
      },
      
      locationAddress: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'tracking_events.location_id',
          to: 'addresses.id'
        }
      },
      
      locationSite: {
        relation: Model.BelongsToOneRelation,
        modelClass: Site,
        join: {
          from: 'tracking_events.location_id',
          to: 'sites.id'
        }
      },
      
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tracking_events.created_by',
          to: 'users.id'
        }
      },
      
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tracking_events.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  // Helper methods
  isPickupEvent() {
    return this.event_type.startsWith('pickup_');
  }

  isDeliveryEvent() {
    return this.event_type.startsWith('delivery_');
  }

  isCustomsEvent() {
    return this.event_type.startsWith('customs_');
  }

  isExceptionEvent() {
    return this.event_type === 'exception';
  }

  isDelayed() {
    return this.event_type === 'pickup_delayed' || this.event_type === 'delivery_delayed';
  }

  getEventTypeName() {
    const eventTypeNames = {
      'pickup_planned': 'Enlèvement planifié',
      'pickup_delayed': 'Enlèvement retardé',
      'pickup_completed': 'Enlèvement effectué',
      'departure': 'Départ',
      'arrival': 'Arrivée',
      'in_transit': 'En transit',
      'customs_clearance_start': 'Début dédouanement',
      'customs_hold': 'Retenu en douane',
      'customs_cleared': 'Dédouané',
      'delivery_planned': 'Livraison planifiée',
      'delivery_delayed': 'Livraison retardée',
      'delivery_completed': 'Livraison effectuée',
      'exception': 'Exception',
      'status_update': 'Mise à jour statut',
      'document_update': 'Mise à jour document',
      'location_update': 'Mise à jour position'
    };
    
    return eventTypeNames[this.event_type] || this.event_type;
  }

  getDelay() {
    if (!this.planned_timestamp || !this.timestamp) {
      return null;
    }
    
    const planned = new Date(this.planned_timestamp);
    const actual = new Date(this.timestamp);
    
    // Return delay in minutes
    return Math.round((actual - planned) / (1000 * 60));
  }

  getLocationDisplay() {
    if (this.location_name) {
      return this.location_code ? `${this.location_name} (${this.location_code})` : this.location_name;
    }
    
    return this.location_code || 'Unknown';
  }

  getGeoCoordinates() {
    if (this.latitude !== null && this.longitude !== null) {
      return { lat: this.latitude, lng: this.longitude };
    }
    
    return null;
  }
}

module.exports = TrackingEvent;
