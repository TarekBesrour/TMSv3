/**
 * Address Service for managing partner addresses in the TMS system
 * 
 * This service provides CRUD operations and business logic for addresses.
 */

const Address = require('../models/Address');
const { NotFoundError, ValidationError } = require('objection');
const axios = require('axios');

class AddressService {
  /**
   * Get all addresses with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for address fields
   * @param {number} options.partnerId - Filter by partner ID
   * @param {boolean} options.isHeadquarters - Filter headquarters addresses
   * @param {boolean} options.isBilling - Filter billing addresses
   * @param {boolean} options.isShipping - Filter shipping addresses
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Addresses with pagination info
   */
  async getAddresses(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      isHeadquarters = null,
      isBilling = null,
      isShipping = null,
      status = '',
      sortBy = 'city',
      sortOrder = 'asc'
    } = options;

    // Start building query
    let query = Address.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('name', 'ilike', `%${search}%`)
          .orWhere('street_line1', 'ilike', `%${search}%`)
          .orWhere('city', 'ilike', `%${search}%`)
          .orWhere('postal_code', 'ilike', `%${search}%`)
          .orWhere('country', 'ilike', `%${search}%`);
      });
    }

    // Apply headquarters filter if provided
    if (isHeadquarters !== null) {
      query = query.where('is_headquarters', isHeadquarters);
    }

    // Apply billing filter if provided
    if (isBilling !== null) {
      query = query.where('is_billing', isBilling);
    }

    // Apply shipping filter if provided
    if (isShipping !== null) {
      query = query.where('is_shipping', isShipping);
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

    // Execute query
    const addresses = await query;

    // Return addresses with pagination info
    return {
      data: addresses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get an address by ID
   * 
   * @param {number} id - Address ID
   * @param {Object} options - Query options
   * @param {boolean} options.withPartner - Include partner relation
   * @returns {Promise<Object>} Address
   * @throws {NotFoundError} If address not found
   */
  async getAddressById(id, options = {}) {
    const {
      withPartner = false
    } = options;

    let query = Address.query().findById(id);

    // Include partner relation if requested
    if (withPartner) {
      query = query.withGraphFetched('partner');
    }

    const address = await query;

    if (!address) {
      throw new NotFoundError(`Address with ID ${id} not found`);
    }

    return address;
  }

  /**
   * Get addresses by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @param {boolean} options.onlyActive - Only return active addresses
   * @returns {Promise<Array>} Addresses
   */
  async getAddressesByPartnerId(partnerId, options = {}) {
    const {
      status = '',
      onlyActive = true
    } = options;

    let query = Address.query()
      .where('partner_id', partnerId)
      .orderBy('is_headquarters', 'desc')
      .orderBy('city');

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    } else if (onlyActive) {
      query = query.where('status', 'active');
    }

    return await query;
  }

  /**
   * Create a new address
   * 
   * @param {Object} addressData - Address data
   * @param {number} userId - User ID for audit
   * @param {boolean} geocode - Whether to geocode the address
   * @returns {Promise<Object>} Created address
   */
  async createAddress(addressData, userId, geocode = true) {
    // Set audit fields
    addressData.created_by = userId;
    addressData.updated_by = userId;

    // If this is a headquarters address, ensure other addresses for this partner are not headquarters
    if (addressData.is_headquarters) {
      await this.handleHeadquartersAddress(addressData.partner_id);
    }

    // Geocode address if requested
    if (geocode && !addressData.latitude && !addressData.longitude) {
      const geocodeResult = await this.geocodeAddress(addressData);
      if (geocodeResult) {
        addressData.latitude = geocodeResult.latitude;
        addressData.longitude = geocodeResult.longitude;
      }
    }

    // Create address
    const address = await Address.query().insert(addressData);

    return address;
  }

  /**
   * Update an address
   * 
   * @param {number} id - Address ID
   * @param {Object} addressData - Address data
   * @param {number} userId - User ID for audit
   * @param {boolean} geocode - Whether to geocode the address if location changed
   * @returns {Promise<Object>} Updated address
   * @throws {NotFoundError} If address not found
   */
  async updateAddress(id, addressData, userId, geocode = true) {
    // Set audit fields
    addressData.updated_by = userId;

    // Start transaction
    const address = await Address.transaction(async trx => {
      // Check if address exists
      const existingAddress = await Address.query(trx).findById(id);
      
      if (!existingAddress) {
        throw new NotFoundError(`Address with ID ${id} not found`);
      }
      
      // If this is being set as headquarters, ensure other addresses for this partner are not headquarters
      if (addressData.is_headquarters && !existingAddress.is_headquarters) {
        await this.handleHeadquartersAddress(existingAddress.partner_id, trx);
      }
      
      // Check if address fields that affect geocoding have changed
      const shouldGeocode = geocode && (
        addressData.street_line1 !== existingAddress.street_line1 ||
        addressData.street_line2 !== existingAddress.street_line2 ||
        addressData.city !== existingAddress.city ||
        addressData.postal_code !== existingAddress.postal_code ||
        addressData.state !== existingAddress.state ||
        addressData.country !== existingAddress.country
      );
      
      // Geocode address if needed
      if (shouldGeocode) {
        const geocodeData = {
          ...existingAddress,
          ...addressData
        };
        
        const geocodeResult = await this.geocodeAddress(geocodeData);
        if (geocodeResult) {
          addressData.latitude = geocodeResult.latitude;
          addressData.longitude = geocodeResult.longitude;
        }
      }
      
      // Update address
      return await Address.query(trx)
        .patchAndFetchById(id, addressData);
    });

    return address;
  }

  /**
   * Delete an address
   * 
   * @param {number} id - Address ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If address not found
   */
  async deleteAddress(id) {
    // Start transaction
    return await Address.transaction(async trx => {
      // Check if address exists
      const address = await Address.query(trx).findById(id);
      
      if (!address) {
        throw new NotFoundError(`Address with ID ${id} not found`);
      }
      
      // Check if address is used by sites
      const sites = await address.$relatedQuery('sites', trx);
      if (sites.length > 0) {
        throw new ValidationError({
          message: 'Cannot delete address that is used by sites',
          type: 'ForeignKeyViolationError'
        });
      }
      
      // Delete address
      const deleted = await Address.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Geocode an address
   * 
   * @param {Object} addressData - Address data
   * @returns {Promise<Object|null>} Geocoding result with latitude and longitude
   * @private
   */
  async geocodeAddress(addressData) {
    try {
      // Build address string
      const addressString = [
        addressData.street_line1,
        addressData.street_line2,
        addressData.city,
        addressData.postal_code,
        addressData.state,
        addressData.country
      ].filter(Boolean).join(', ');
      
      // Use OpenStreetMap Nominatim API for geocoding
      // Note: In a production environment, you would use a paid geocoding service with better rate limits
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: addressString,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'TMS-Application/1.0'
        }
      });
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Handle headquarters address logic
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} trx - Transaction object
   * @private
   */
  async handleHeadquartersAddress(partnerId, trx = null) {
    const query = trx 
      ? Address.query(trx)
      : Address.query();
    
    await query
      .where('partner_id', partnerId)
      .where('is_headquarters', true)
      .patch({ is_headquarters: false });
  }
}

module.exports = new AddressService();
