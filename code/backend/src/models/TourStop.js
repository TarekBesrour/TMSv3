const { Model } = require('objection');

class TourStop extends Model {
  static get tableName() {
    return 'tour_stops';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tour_id', 'stop_order', 'location_type', 'address_id', 'scheduled_time'],
      properties: {
        id: { type: ['integer','string'] },
        tour_id: { type: ['integer','string'] },
        stop_order: { type: 'integer' },
        location_type: { type: 'string', enum: ['pickup', 'delivery', 'intermediate'] },
        address_id: { type: ['integer','string'] },
        order_id: { type: ['integer','string'] },
        shipment_id: { type: ['integer','string'] },
        scheduled_time: { type: 'string', format: 'date-time' },
        arrival_time: { type: 'string', format: 'date-time' },
        departure_time: { type: 'string', format: 'date-time' },
        service_duration: { type: 'integer' }, // in minutes
        notes: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'arrived', 'completed', 'skipped'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Tour = require('./Tour');
    const Address = require('./Address');
    const Order = require('./Order');
    const Shipment = require('./Shipment');

    return {
      tour: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tour,
        join: {
          from: 'tour_stops.tour_id',
          to: 'tours.id'
        }
      },
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'tour_stops.address_id',
          to: 'addresses.id'
        }
      },
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'tour_stops.order_id',
          to: 'orders.id'
        }
      },
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'tour_stops.shipment_id',
          to: 'shipments.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Helper to get status display name
  getStatusDisplayName() {
    const statusNames = {
      pending: 'En attente',
      arrived: 'Arrivé',
      completed: 'Terminé',
      skipped: 'Ignoré'
    };
    return statusNames[this.status] || this.status;
  }

  // Helper to check if stop is completed
  isCompleted() {
    return this.status === 'completed';
  }

  // Helper to calculate actual duration at stop
  getActualDuration() {
    if (this.arrival_time && this.departure_time) {
      const arrival = new Date(this.arrival_time);
      const departure = new Date(this.departure_time);
      return Math.round((departure.getTime() - arrival.getTime()) / (1000 * 60)); // minutes
    }
    return 0;
  }
}

module.exports = TourStop;

