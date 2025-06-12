/**
 * RateService for managing tariff rates in the TMS
 * Provides methods for creating, retrieving, updating, and searching rates
 */
const Rate = require('../models/Rate');
const { transaction } = require('objection');
const { NotFoundError, ValidationError } = require('../utils/errors');

class RateService {
  /**
   * Create a new rate
   * @param {Object} rateData - Data for the new rate
   * @returns {Promise<Object>} - Created rate
   */
  async createRate(rateData) {
    try {
      return await Rate.query().insert(rateData);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid rate data', error.data);
      }
      throw error;
    }
  }

  /**
   * Get rate by ID
   * @param {Number} id - Rate ID
   * @param {Boolean} withRelations - Whether to include related data
   * @returns {Promise<Object>} - Rate object
   */
  async getRateById(id, withRelations = false) {
    let query = Rate.query().findById(id);
    
    if (withRelations) {
      query = query.withGraphFetched('[partner, surcharges]');
    }
    
    const rate = await query;
    
    if (!rate) {
      throw new NotFoundError(`Rate with ID ${id} not found`);
    }
    
    return rate;
  }

  /**
   * Update an existing rate
   * @param {Number} id - Rate ID
   * @param {Object} rateData - Updated rate data
   * @returns {Promise<Object>} - Updated rate
   */
  async updateRate(id, rateData) {
    try {
      const updatedRate = await Rate.query()
        .patchAndFetchById(id, rateData);
      
      if (!updatedRate) {
        throw new NotFoundError(`Rate with ID ${id} not found`);
      }
      
      return updatedRate;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid rate data', error.data);
      }
      throw error;
    }
  }

  /**
   * Delete a rate
   * @param {Number} id - Rate ID
   * @returns {Promise<Boolean>} - Success status
   */
  async deleteRate(id) {
    const numDeleted = await Rate.query().deleteById(id);
    
    if (numDeleted === 0) {
      throw new NotFoundError(`Rate with ID ${id} not found`);
    }
    
    return true;
  }

  /**
   * Search for rates based on criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchRates(criteria = {}, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    
    let query = Rate.query();
    
    // Apply filters
    if (criteria.rate_type) {
      query = query.where('rate_type', criteria.rate_type);
    }
    
    if (criteria.transport_mode) {
      query = query.where('transport_mode', criteria.transport_mode);
    }
    
    if (criteria.origin_country) {
      query = query.where('origin_country', criteria.origin_country);
    }
    
    if (criteria.destination_country) {
      query = query.where('destination_country', criteria.destination_country);
    }
    
    if (criteria.partner_id) {
      query = query.where('partner_id', criteria.partner_id);
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
   * Find applicable rates for given parameters
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} - List of applicable rates
   */
  async findApplicableRates(params) {
    const query = Rate.query()
      .where('is_active', true)
      .where('valid_from', '<=', new Date().toISOString())
      .where(builder => {
        builder.whereNull('valid_to').orWhere('valid_to', '>=', new Date().toISOString());
      });
    
    // Apply filters based on params
    if (params.transport_mode) {
      query.where(builder => {
        builder.where('transport_mode', params.transport_mode)
          .orWhere('transport_mode', 'multimodal');
      });
    }
    
    if (params.origin_country) {
      query.where(builder => {
        builder.where('origin_country', params.origin_country)
          .orWhereNull('origin_country');
      });
    }
    
    if (params.destination_country) {
      query.where(builder => {
        builder.where('destination_country', params.destination_country)
          .orWhereNull('destination_country');
      });
    }
    
    // Partner-specific rates
    if (params.client_id) {
      query.where(builder => {
        builder.where(subBuilder => {
          subBuilder.where('rate_type', 'client_specific')
            .where('partner_id', params.client_id);
        }).orWhere('rate_type', 'standard');
      });
    } else if (params.carrier_id) {
      query.where(builder => {
        builder.where(subBuilder => {
          subBuilder.where('rate_type', 'carrier_specific')
            .where('partner_id', params.carrier_id);
        }).orWhere('rate_type', 'standard');
      });
    } else {
      query.where('rate_type', 'standard');
    }
    
    // Weight constraints
    if (params.weight) {
      query.where(builder => {
        builder.where(subBuilder => {
          subBuilder.where('min_weight', '<=', params.weight)
            .orWhereNull('min_weight');
        }).where(subBuilder => {
          subBuilder.where('max_weight', '>=', params.weight)
            .orWhereNull('max_weight');
        });
      });
    }
    
    // Volume constraints
    if (params.volume) {
      query.where(builder => {
        builder.where(subBuilder => {
          subBuilder.where('min_volume', '<=', params.volume)
            .orWhereNull('min_volume');
        }).where(subBuilder => {
          subBuilder.where('max_volume', '>=', params.volume)
            .orWhereNull('max_volume');
        });
      });
    }
    
    // Distance constraints
    if (params.distance) {
      query.where(builder => {
        builder.where(subBuilder => {
          subBuilder.where('min_distance', '<=', params.distance)
            .orWhereNull('min_distance');
        }).where(subBuilder => {
          subBuilder.where('max_distance', '>=', params.distance)
            .orWhereNull('max_distance');
        });
      });
    }
    
    // Get rates with surcharges
    const rates = await query.withGraphFetched('surcharges');
    
    // Filter rates that are truly applicable by calling isApplicable method
    return rates.filter(rate => rate.isApplicable(params));
  }

  /**
   * Calculate price for given parameters using best applicable rate
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} - Calculated price details
   */
  async calculatePrice(params) {
    const applicableRates = await this.findApplicableRates(params);
    
    if (applicableRates.length === 0) {
      throw new Error('No applicable rates found for the given parameters');
    }
    
    // Find the best rate (lowest price)
    let bestRate = null;
    let bestPrice = Infinity;
    let priceDetails = null;
    
    for (const rate of applicableRates) {
      try {
        const calculatedPrice = rate.calculatePrice(params);
        
        if (calculatedPrice.base_price < bestPrice) {
          bestPrice = calculatedPrice.base_price;
          bestRate = rate;
          priceDetails = calculatedPrice;
        }
      } catch (error) {
        console.error(`Error calculating price for rate ${rate.id}: ${error.message}`);
      }
    }
    
    if (!bestRate) {
      throw new Error('Failed to calculate price with any of the applicable rates');
    }
    
    // Calculate applicable surcharges
    const surcharges = [];
    let totalSurcharges = 0;
    
    for (const surcharge of bestRate.surcharges || []) {
      const surchargeResult = surcharge.calculateAmount({
        ...params,
        base_price: priceDetails.base_price
      });
      
      if (surchargeResult.is_applicable) {
        surcharges.push(surchargeResult);
        totalSurcharges += surchargeResult.amount;
      }
    }
    
    return {
      ...priceDetails,
      surcharges,
      total_surcharges: totalSurcharges,
      total_price: priceDetails.base_price + totalSurcharges,
      rate: {
        id: bestRate.id,
        rate_type: bestRate.rate_type,
        transport_mode: bestRate.transport_mode,
        pricing_unit: bestRate.pricing_unit
      }
    };
  }

  /**
   * Import rates from array
   * @param {Array} ratesData - Array of rate data objects
   * @returns {Promise<Object>} - Import results
   */
  async importRates(ratesData) {
    const results = {
      total: ratesData.length,
      created: 0,
      failed: 0,
      errors: []
    };
    
    await transaction(Rate.knex(), async (trx) => {
      for (const rateData of ratesData) {
        try {
          await Rate.query(trx).insert(rateData);
          results.created++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            data: rateData,
            error: error.message
          });
        }
      }
    });
    
    return results;
  }
}

module.exports = new RateService();
