/**
 * Partner Service for managing partners in the TMS system
 * 
 * This service provides CRUD operations and business logic for partners.
 */

const Partner = require('../models/Partner');
const { NotFoundError, ValidationError } = require('objection');

class PartnerService {
  /**
   * Get all partners with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for name, registration number, etc.
   * @param {string} options.type - Filter by partner type
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @param {number} options.tenantId - Tenant ID for multi-tenancy
   * @returns {Promise<Object>} Partners with pagination info
   */
  async getPartners(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = '',
      status = '',
      sortBy = 'name',
      sortOrder = 'asc',
      tenantId = null
    } = options;

    // Start building query
    let query = Partner.query();

    // Apply tenant filter if provided
    if (tenantId) {
      query = query.where('tenant_id', tenantId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('name', 'ilike', `%${search}%`)
          .orWhere('registration_number', 'ilike', `%${search}%`)
          .orWhere('vat_number', 'ilike', `%${search}%`);
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

    // Execute query
    const partners = await query;

    // Return partners with pagination info
    return {
      data: partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a partner by ID
   * 
   * @param {number} id - Partner ID
   * @param {Object} options - Query options
   * @param {boolean} options.withRelations - Include relations
   * @param {number} options.tenantId - Tenant ID for multi-tenancy
   * @returns {Promise<Object>} Partner
   * @throws {NotFoundError} If partner not found
   */
  async getPartnerById(id, options = {}) {
    const {
      withRelations = false,
      tenantId = null
    } = options;

    let query = Partner.query().findById(id);

    // Apply tenant filter if provided
    if (tenantId) {
      query = query.where('tenant_id', tenantId);
    }

    // Include relations if requested
    if (withRelations) {
      query = query.withGraphFetched('[contacts, addresses, sites, vehicles, drivers, contracts, documents]');
    }

    const partner = await query;

    if (!partner) {
      throw new NotFoundError(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  /**
   * Create a new partner
   * 
   * @param {Object} partnerData - Partner data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created partner
   */
  async createPartner(partnerData, userId) {
    // Set audit fields
    partnerData.created_by = userId;
    partnerData.updated_by = userId;

    // Create partner
    const partner = await Partner.query().insert(partnerData);

    return partner;
  }

  /**
   * Update a partner
   * 
   * @param {number} id - Partner ID
   * @param {Object} partnerData - Partner data
   * @param {number} userId - User ID for audit
   * @param {number} tenantId - Tenant ID for multi-tenancy
   * @returns {Promise<Object>} Updated partner
   * @throws {NotFoundError} If partner not found
   */
  async updatePartner(id, partnerData, userId, tenantId = null) {
    // Set audit fields
    partnerData.updated_by = userId;

    // Start transaction
    const partner = await Partner.transaction(async trx => {
      // Check if partner exists and belongs to tenant
      let query = Partner.query(trx).findById(id);
      
      if (tenantId) {
        query = query.where('tenant_id', tenantId);
      }
      
      const existingPartner = await query;
      
      if (!existingPartner) {
        throw new NotFoundError(`Partner with ID ${id} not found`);
      }
      
      // Update partner
      return await Partner.query(trx)
        .patchAndFetchById(id, partnerData);
    });

    return partner;
  }

  /**
   * Delete a partner
   * 
   * @param {number} id - Partner ID
   * @param {number} tenantId - Tenant ID for multi-tenancy
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If partner not found
   */
  async deletePartner(id, tenantId = null) {
    // Start transaction
    return await Partner.transaction(async trx => {
      // Check if partner exists and belongs to tenant
      let query = Partner.query(trx).findById(id);
      
      if (tenantId) {
        query = query.where('tenant_id', tenantId);
      }
      
      const partner = await query;
      
      if (!partner) {
        throw new NotFoundError(`Partner with ID ${id} not found`);
      }
      
      // Delete partner
      const deleted = await Partner.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Get partners by type
   * 
   * @param {string} type - Partner type
   * @param {Object} options - Query options
   * @param {number} options.tenantId - Tenant ID for multi-tenancy
   * @returns {Promise<Array>} Partners
   */
  async getPartnersByType(type, options = {}) {
    const {
      tenantId = null
    } = options;

    let query = Partner.query()
      .where('type', type)
      .where('status', 'active')
      .orderBy('name');

    // Apply tenant filter if provided
    if (tenantId) {
      query = query.where('tenant_id', tenantId);
    }

    return await query;
  }

  /**
   * Get active carriers with vehicles
   * 
   * @param {Object} options - Query options
   * @param {number} options.tenantId - Tenant ID for multi-tenancy
   * @returns {Promise<Array>} Carriers with vehicles
   */
  async getActiveCarriersWithVehicles(options = {}) {
    const {
      tenantId = null
    } = options;

    let query = Partner.query()
      .where('type', 'CARRIER')
      .where('status', 'active')
      .withGraphFetched('vehicles(active)')
      .modifiers({
        active: builder => {
          builder.where('status', 'active');
        }
      })
      .orderBy('name');

    // Apply tenant filter if provided
    if (tenantId) {
      query = query.where('tenant_id', tenantId);
    }

    return await query;
  }
}

module.exports = new PartnerService();
