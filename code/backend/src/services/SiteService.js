/**
 * Site Service for managing physical locations in the TMS system
 * 
 * This service provides CRUD operations and business logic for sites.
 */

const Site = require('../models/Site');
const { NotFoundError, ValidationError } = require('objection');

class SiteService {
  /**
   * Get all sites with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for site fields
   * @param {number} options.partnerId - Filter by partner ID
   * @param {string} options.type - Filter by site type
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Sites with pagination info
   */
  async getSites(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      type = '',
      status = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    // Start building query
    let query = Site.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
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

    // Execute query with related address
    const sites = await query.withGraphFetched('address');

    // Return sites with pagination info
    return {
      data: sites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a site by ID
   * 
   * @param {number} id - Site ID
   * @param {Object} options - Query options
   * @param {boolean} options.withRelations - Include relations
   * @returns {Promise<Object>} Site
   * @throws {NotFoundError} If site not found
   */
  async getSiteById(id, options = {}) {
    const {
      withRelations = false
    } = options;

    let query = Site.query().findById(id);

    // Include relations if requested
    if (withRelations) {
      query = query.withGraphFetched('[partner, address, contact]');
    }

    const site = await query;

    if (!site) {
      throw new NotFoundError(`Site with ID ${id} not found`);
    }

    return site;
  }

  /**
   * Get sites by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.type - Filter by site type
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Sites
   */
  async getSitesByPartnerId(partnerId, options = {}) {
    const {
      type = '',
      status = 'active'
    } = options;

    let query = Site.query()
      .where('partner_id', partnerId)
      .withGraphFetched('address')
      .orderBy('name');

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
   * Create a new site
   * 
   * @param {Object} siteData - Site data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created site
   */
  async createSite(siteData, userId) {
    // Set audit fields
    siteData.created_by = userId;
    siteData.updated_by = userId;

    // Create site
    const site = await Site.query().insert(siteData);

    return await this.getSiteById(site.id, { withRelations: true });
  }

  /**
   * Update a site
   * 
   * @param {number} id - Site ID
   * @param {Object} siteData - Site data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Updated site
   * @throws {NotFoundError} If site not found
   */
  async updateSite(id, siteData, userId) {
    // Set audit fields
    siteData.updated_by = userId;

    // Start transaction
    const site = await Site.transaction(async trx => {
      // Check if site exists
      const existingSite = await Site.query(trx).findById(id);
      
      if (!existingSite) {
        throw new NotFoundError(`Site with ID ${id} not found`);
      }
      
      // Update site
      return await Site.query(trx)
        .patchAndFetchById(id, siteData);
    });

    return await this.getSiteById(site.id, { withRelations: true });
  }

  /**
   * Delete a site
   * 
   * @param {number} id - Site ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If site not found
   */
  async deleteSite(id) {
    // Start transaction
    return await Site.transaction(async trx => {
      // Check if site exists
      const site = await Site.query(trx).findById(id);
      
      if (!site) {
        throw new NotFoundError(`Site with ID ${id} not found`);
      }
      
      // Delete site
      const deleted = await Site.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Get site capacity and availability
   * 
   * @param {number} id - Site ID
   * @returns {Promise<Object>} Capacity and availability info
   * @throws {NotFoundError} If site not found
   */
  async getSiteCapacity(id) {
    const site = await this.getSiteById(id);
    
    // In a real application, this would query inventory, shipments, etc.
    // For now, we'll return a simplified version
    return {
      site_id: site.id,
      site_name: site.name,
      total_capacity: site.capacity || 0,
      used_capacity: Math.floor(Math.random() * (site.capacity || 100)),
      loading_docks: {
        total: site.loading_docks || 0,
        available: Math.floor(Math.random() * (site.loading_docks || 5))
      },
      last_updated: new Date().toISOString()
    };
  }
}

module.exports = new SiteService();
