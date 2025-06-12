/**
 * Vehicle Service for managing carrier vehicles in the TMS system
 * 
 * This service provides CRUD operations and business logic for vehicles.
 */

const Vehicle = require('../models/Vehicle');
const { NotFoundError, ValidationError } = require('objection');

class VehicleService {
  /**
   * Get all vehicles with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for vehicle fields
   * @param {number} options.partnerId - Filter by partner ID
   * @param {string} options.type - Filter by vehicle type
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Vehicles with pagination info
   */
  async getVehicles(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      type = '',
      status = '',
      sortBy = 'registration_number',
      sortOrder = 'asc'
    } = options;

    // Start building query
    let query = Vehicle.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('registration_number', 'ilike', `%${search}%`)
          .orWhere('brand', 'ilike', `%${search}%`)
          .orWhere('model', 'ilike', `%${search}%`);
      });
    }

    // Apply type filter if provided
    if (type) {
      query = query.where('type', type);
    }

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    }

    // Count total before pagination
    const total = await query.clone().resultSize();

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    // Execute query with related partner
    const vehicles = await query.withGraphFetched('partner');

    // Return vehicles with pagination info
    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a vehicle by ID
   * 
   * @param {number} id - Vehicle ID
   * @param {Object} options - Query options
   * @param {boolean} options.withPartner - Include partner relation
   * @returns {Promise<Object>} Vehicle
   * @throws {NotFoundError} If vehicle not found
   */
  async getVehicleById(id, options = {}) {
    const {
      withPartner = false
    } = options;

    let query = Vehicle.query().findById(id);

    // Include partner relation if requested
    if (withPartner) {
      query = query.withGraphFetched('partner');
    }

    const vehicle = await query;

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  /**
   * Get vehicles by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.type - Filter by vehicle type
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Vehicles
   */
  async getVehiclesByPartnerId(partnerId, options = {}) {
    const {
      type = '',
      status = 'active'
    } = options;

    let query = Vehicle.query()
      .where('partner_id', partnerId)
      .orderBy('registration_number');

    // Apply type filter if provided
    if (type) {
      query = query.where('type', type);
    }

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    }

    return await query;
  }

  /**
   * Create a new vehicle
   * 
   * @param {Object} vehicleData - Vehicle data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created vehicle
   */
  async createVehicle(vehicleData, userId) {
    // Set audit fields
    vehicleData.created_by = userId;
    vehicleData.updated_by = userId;

    // Create vehicle
    const vehicle = await Vehicle.query().insert(vehicleData);

    return await this.getVehicleById(vehicle.id, { withPartner: true });
  }

  /**
   * Update a vehicle
   * 
   * @param {number} id - Vehicle ID
   * @param {Object} vehicleData - Vehicle data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Updated vehicle
   * @throws {NotFoundError} If vehicle not found
   */
  async updateVehicle(id, vehicleData, userId) {
    // Set audit fields
    vehicleData.updated_by = userId;

    // Start transaction
    const vehicle = await Vehicle.transaction(async trx => {
      // Check if vehicle exists
      const existingVehicle = await Vehicle.query(trx).findById(id);
      
      if (!existingVehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }
      
      // Update vehicle
      return await Vehicle.query(trx)
        .patchAndFetchById(id, vehicleData);
    });

    return await this.getVehicleById(vehicle.id, { withPartner: true });
  }

  /**
   * Delete a vehicle
   * 
   * @param {number} id - Vehicle ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If vehicle not found
   */
  async deleteVehicle(id) {
    // Start transaction
    return await Vehicle.transaction(async trx => {
      // Check if vehicle exists
      const vehicle = await Vehicle.query(trx).findById(id);
      
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${id} not found`);
      }
      
      // Delete vehicle
      const deleted = await Vehicle.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Get vehicle availability
   * 
   * @param {number} id - Vehicle ID
   * @returns {Promise<Object>} Availability info
   * @throws {NotFoundError} If vehicle not found
   */
  async getVehicleAvailability(id) {
    const vehicle = await this.getVehicleById(id);
    
    // In a real application, this would query shipments, maintenance schedules, etc.
    // For now, we'll return a simplified version
    return {
      vehicle_id: vehicle.id,
      registration_number: vehicle.registration_number,
      status: vehicle.status,
      is_available: vehicle.status === 'active',
      current_location: {
        latitude: 48.8566 + (Math.random() * 0.1 - 0.05),
        longitude: 2.3522 + (Math.random() * 0.1 - 0.05),
        address: 'Paris, France'
      },
      next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString()
    };
  }
}

module.exports = new VehicleService();
