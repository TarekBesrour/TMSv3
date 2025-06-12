/**
 * SurchargeService for managing surcharges in the TMS
 * Provides methods for creating, retrieving, updating, and searching surcharges
 */
const Surcharge = require('../models/Surcharge');
const { NotFoundError, ValidationError } = require('../utils/errors');

class SurchargeService {
  /**
   * Create a new surcharge
   * @param {Object} surchargeData - Data for the new surcharge
   * @returns {Promise<Object>} - Created surcharge
   */
  async createSurcharge(surchargeData) {
    try {
      return await Surcharge.query().insert(surchargeData);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid surcharge data', error.data);
      }
      throw error;
    }
  }

  /**
   * Get surcharge by ID
   * @param {Number} id - Surcharge ID
   * @returns {Promise<Object>} - Surcharge object
   */
  async getSurchargeById(id) {
    const surcharge = await Surcharge.query().findById(id);
    
    if (!surcharge) {
      throw new NotFoundError(`Surcharge with ID ${id} not found`);
    }
    
    return surcharge;
  }

  /**
   * Update an existing surcharge
   * @param {Number} id - Surcharge ID
   * @param {Object} surchargeData - Updated surcharge data
   * @returns {Promise<Object>} - Updated surcharge
   */
  async updateSurcharge(id, surchargeData) {
    try {
      const updatedSurcharge = await Surcharge.query()
        .patchAndFetchById(id, surchargeData);
      
      if (!updatedSurcharge) {
        throw new NotFoundError(`Surcharge with ID ${id} not found`);
      }
      
      return updatedSurcharge;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid surcharge data', error.data);
      }
      throw error;
    }
  }

  /**
   * Delete a surcharge
   * @param {Number} id - Surcharge ID
   * @returns {Promise<Boolean>} - Success status
   */
  async deleteSurcharge(id) {
    const numDeleted = await Surcharge.query().deleteById(id);
    
    if (numDeleted === 0) {
      throw new NotFoundError(`Surcharge with ID ${id} not found`);
    }
    
    return true;
  }

  /**
   * Search for surcharges based on criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchSurcharges(criteria = {}, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    
    let query = Surcharge.query();
    
    // Apply filters
    if (criteria.surcharge_type) {
      query = query.where('surcharge_type', criteria.surcharge_type);
    }
    
    if (criteria.calculation_method) {
      query = query.where('calculation_method', criteria.calculation_method);
    }
    
    if (criteria.is_active !== undefined) {
      query = query.where('is_active', criteria.is_active);
    }
    
    // Date range filters
    if (criteria.valid_from) {
      query = query.where('valid_from', '>=', criteria.valid_from);
    }
    
    if (criteria.valid_to) {
      query = query.where('valid_to', '<=', criteria.valid_to);
    }
    
    // Check for current validity
    if (criteria.currently_valid) {
      const now = new Date().toISOString();
      query = query.where('valid_from', '<=', now)
        .where(builder => {
          builder.whereNull('valid_to').orWhere('valid_to', '>=', now);
        })
        .where('is_active', true);
    }
    
    // Text search
    if (criteria.search_term) {
      query = query.where(builder => {
        builder.where('name', 'like', `%${criteria.search_term}%`)
          .orWhere('description', 'like', `%${criteria.search_term}%`);
      });
    }
    
    // Apply pagination
    const results = await query.page(page - 1, pageSize);
    
    return {
      data: results.results,
      pagination: {
        page,
        pageSize,
        total: results.total,
        totalPages: Math.ceil(results.total / pageSize)
      }
    };
  }

  /**
   * Find applicable surcharges for given parameters
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} - List of applicable surcharges
   */
  async findApplicableSurcharges(params) {
    const query = Surcharge.query()
      .where('is_active', true)
      .where('valid_from', '<=', new Date().toISOString())
      .where(builder => {
        builder.whereNull('valid_to').orWhere('valid_to', '>=', new Date().toISOString());
      });
    
    // Apply filters based on params
    if (params.transport_mode) {
      query.where(builder => {
        builder.whereJsonSuperset('applicable_modes', [params.transport_mode])
          .orWhereJsonSuperset('applicable_modes', ['multimodal'])
          .orWhereNull('applicable_modes');
      });
    }
    
    if (params.region) {
      query.where(builder => {
        builder.whereJsonSuperset('applicable_regions', [params.region])
          .orWhereNull('applicable_regions');
      });
    }
    
    const surcharges = await query;
    
    // Filter surcharges that are truly applicable by calling isApplicable method
    return surcharges.filter(surcharge => surcharge.isApplicable(params));
  }

  /**
   * Calculate surcharges for given parameters
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} - Calculated surcharges details
   */
  async calculateSurcharges(params) {
    const applicableSurcharges = await this.findApplicableSurcharges(params);
    
    if (applicableSurcharges.length === 0) {
      return {
        surcharges: [],
        total_surcharges: 0
      };
    }
    
    const surchargeDetails = [];
    let totalSurcharges = 0;
    
    for (const surcharge of applicableSurcharges) {
      const surchargeResult = surcharge.calculateAmount(params);
      
      if (surchargeResult.is_applicable) {
        surchargeDetails.push(surchargeResult);
        totalSurcharges += surchargeResult.amount;
      }
    }
    
    return {
      surcharges: surchargeDetails,
      total_surcharges: totalSurcharges
    };
  }
}

module.exports = new SurchargeService();
