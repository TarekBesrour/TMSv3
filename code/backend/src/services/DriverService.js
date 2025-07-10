/**
 * Driver Service for managing carrier drivers in the TMS system
 * 
 * This service provides CRUD operations and business logic for drivers.
 */

const Driver = require('../models/Driver');
const { NotFoundError, ValidationError } = require('objection');

class DriverService {
  /**
   * Get all drivers with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for driver fields
   * @param {number} options.partnerId - Filter by partner ID
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Drivers with pagination info
   */
  async getDrivers(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      status = '',
      sortBy = 'last_name',
      sortOrder = 'asc'
    } = options;

    // Start building query
    let query = Driver.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('first_name', 'ilike', `%${search}%`)
          .orWhere('last_name', 'ilike', `%${search}%`)
          .orWhere('license_number', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`)
          .orWhere('phone', 'ilike', `%${search}%`);
      });
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
    const drivers = await query.withGraphFetched('partner');

    // Return drivers with pagination info
    const totalPages = Math.ceil(total / limit);
    return {
      data: drivers,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Get a driver by ID
   * 
   * @param {number} id - Driver ID
   * @param {Object} options - Query options
   * @param {boolean} options.withPartner - Include partner relation
   * @returns {Promise<Object>} Driver
   * @throws {NotFoundError} If driver not found
   */
  async getDriverById(id, options = {}) {
    const {
      withPartner = false
    } = options;

    let query = Driver.query().findById(id);

    // Include partner relation if requested
    if (withPartner) {
      query = query.withGraphFetched('partner');
    }

    const driver = await query;

    if (!driver) {
      throw new NotFoundError(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  /**
   * Get drivers by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Drivers
   */
  async getDriversByPartnerId(partnerId, options = {}) {
    const {
      status = 'active'
    } = options;

    let query = Driver.query()
      .where('partner_id', partnerId)
      .orderBy('last_name')
      .orderBy('first_name');

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    }

    return await query;
  }

  /**
   * Create a new driver
   * 
   * @param {Object} driverData - Driver data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created driver
   */
  async createDriver(driverData, userId) {
    // Set audit fields
    driverData.created_by = userId;
    driverData.updated_by = userId;

    // Create driver
    const driver = await Driver.query().insert(driverData);

    return await this.getDriverById(driver.id, { withPartner: true });
  }

  /**
   * Update a driver
   * 
   * @param {number} id - Driver ID
   * @param {Object} driverData - Driver data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Updated driver
   * @throws {NotFoundError} If driver not found
   */
  async updateDriver(id, driverData, userId) {
    // Set audit fields
    driverData.updated_by = userId;

    // Start transaction
    const driver = await Driver.transaction(async trx => {
      // Check if driver exists
      const existingDriver = await Driver.query(trx).findById(id);
      
      if (!existingDriver) {
        throw new NotFoundError(`Driver with ID ${id} not found`);
      }
      
      // Update driver
      return await Driver.query(trx)
        .patchAndFetchById(id, driverData);
    });

    return await this.getDriverById(driver.id, { withPartner: true });
  }

  /**
   * Delete a driver
   * 
   * @param {number} id - Driver ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If driver not found
   */
  async deleteDriver(id) {
    // Start transaction
    return await Driver.transaction(async trx => {
      // Check if driver exists
      const driver = await Driver.query(trx).findById(id);
      
      if (!driver) {
        throw new NotFoundError(`Driver with ID ${id} not found`);
      }
      
      // Delete driver
      const deleted = await Driver.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Get driver availability
   * 
   * @param {number} id - Driver ID
   * @returns {Promise<Object>} Availability info
   * @throws {NotFoundError} If driver not found
   */
  async getDriverAvailability(id) {
    const driver = await this.getDriverById(id);
    
    // In a real application, this would query shipments, schedules, etc.
    // For now, we'll return a simplified version
    return {
      driver_id: driver.id,
      driver_name: `${driver.first_name} ${driver.last_name}`,
      status: driver.status,
      is_available: driver.status === 'active',
      current_location: {
        latitude: 48.8566 + (Math.random() * 0.1 - 0.05),
        longitude: 2.3522 + (Math.random() * 0.1 - 0.05),
        address: 'Paris, France'
      },
      driving_hours: {
        today: Math.floor(Math.random() * 8),
        this_week: Math.floor(Math.random() * 40),
        remaining_today: Math.floor(Math.random() * 8)
      },
      license_valid: !driver.isLicenseExpired(),
      license_expiry_warning: driver.isLicenseAboutToExpire(),
      last_updated: new Date().toISOString()
    };
  }
}

module.exports = new DriverService();
