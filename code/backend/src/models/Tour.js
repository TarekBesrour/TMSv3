const { Model } = require('objection');

class Tour extends Model {
  static get tableName() {
    return 'tours';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tour_name', 'planned_date', 'status', 'tenant_id'],
      properties: {
        id: { type: 'string' },
        tenant_id: { type: 'string' },
        tour_name: { type: 'string', minLength: 1, maxLength: 255 },
        tour_number: { type: 'string', maxLength: 50 },
        planned_date: { type: 'string', format: 'date' },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        status: { 
          type: 'string', 
          enum: ['planned', 'in_progress', 'completed', 'cancelled'] 
        },
        vehicle_id: { type: 'string' },
        driver_id: { type: 'string' },
        total_distance: { type: 'number' },
        estimated_duration: { type: 'integer' }, // in minutes
        actual_duration: { type: 'integer' }, // in minutes
        total_cost: { type: 'number' },
        optimization_score: { type: 'number' },
        route_coordinates: { type: 'object' }, // JSON array of coordinates
        notes: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Vehicle = require('./Vehicle');
    const Driver = require('./Driver');
    const TourStop = require('./TourStop');
    const Tenant = require('./Tenant');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'tours.tenant_id',
          to: 'tenants.id'
        }
      },
      vehicle: {
        relation: Model.BelongsToOneRelation,
        modelClass: Vehicle,
        join: {
          from: 'tours.vehicle_id',
          to: 'vehicles.id'
        }
      },
      driver: {
        relation: Model.BelongsToOneRelation,
        modelClass: Driver,
        join: {
          from: 'tours.driver_id',
          to: 'drivers.id'
        }
      },
      stops: {
        relation: Model.HasManyRelation,
        modelClass: TourStop,
        join: {
          from: 'tours.id',
          to: 'tour_stops.tour_id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    
    // Generate tour number if not provided
    if (!this.tour_number) {
      const date = new Date(this.planned_date);
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      this.tour_number = `TOUR-${dateStr}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Calculate optimization metrics
  calculateOptimizationScore() {
    if (!this.total_distance || !this.estimated_duration) {
      return 0;
    }
    
    // Simple optimization score based on distance efficiency
    // Higher score = better optimization
    const baseScore = 100;
    const distanceEfficiency = this.total_distance / (this.estimated_duration / 60); // km/hour
    const score = Math.min(baseScore, distanceEfficiency * 2);
    
    return Math.round(score * 100) / 100;
  }

  // Get tour status display name
  getStatusDisplayName() {
    const statusNames = {
      planned: 'Planifiée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };
    return statusNames[this.status] || this.status;
  }

  // Check if tour can be modified
  canBeModified() {
    return ['planned'].includes(this.status);
  }

  // Check if tour can be started
  canBeStarted() {
    return this.status === 'planned' && this.vehicle_id && this.driver_id;
  }

  // Check if tour can be completed
  canBeCompleted() {
    return this.status === 'in_progress';
  }

  // Get tour duration in hours
  getDurationInHours() {
    if (this.actual_duration) {
      return Math.round((this.actual_duration / 60) * 100) / 100;
    }
    if (this.estimated_duration) {
      return Math.round((this.estimated_duration / 60) * 100) / 100;
    }
    return 0;
  }

  // Format total distance
  getFormattedDistance() {
    if (!this.total_distance) return '0 km';
    return `${Math.round(this.total_distance * 100) / 100} km`;
  }

  // Get tour efficiency metrics
  getEfficiencyMetrics() {
    const metrics = {
      distance_per_stop: 0,
      time_per_stop: 0,
      cost_per_km: 0,
      cost_per_hour: 0
    };

    if (this.stops && this.stops.length > 0) {
      metrics.distance_per_stop = this.total_distance / this.stops.length;
      if (this.estimated_duration) {
        metrics.time_per_stop = this.estimated_duration / this.stops.length;
      }
    }

    if (this.total_cost) {
      if (this.total_distance) {
        metrics.cost_per_km = this.total_cost / this.total_distance;
      }
      if (this.estimated_duration) {
        metrics.cost_per_hour = this.total_cost / (this.estimated_duration / 60);
      }
    }

    return metrics;
  }
}

module.exports = Tour;

