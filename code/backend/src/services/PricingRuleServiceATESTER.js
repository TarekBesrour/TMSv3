/**
 * PricingRuleService for managing pricing rules in the TMS
 * Provides methods for creating, retrieving, updating, and applying pricing rules
 */
const PricingRule = require('../models/PricingRule');
const { NotFoundError, ValidationError } = require('../utils/errors');

class PricingRuleService {
  /**
   * Create a new pricing rule
   * @param {Object} ruleData - Data for the new pricing rule
   * @returns {Promise<Object>} - Created pricing rule
   */
  async createPricingRule(ruleData) {
    try {
      return await PricingRule.query().insert(ruleData);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid pricing rule data', error.data);
      }
      throw error;
    }
  }

  /**
   * Get pricing rule by ID
   * @param {Number} id - Pricing rule ID
   * @returns {Promise<Object>} - Pricing rule object
   */
  async getPricingRuleById(id) {
    const rule = await PricingRule.query().findById(id);
    
    if (!rule) {
      throw new NotFoundError(`Pricing rule with ID ${id} not found`);
    }
    
    return rule;
  }

  /**
   * Update an existing pricing rule
   * @param {Number} id - Pricing rule ID
   * @param {Object} ruleData - Updated pricing rule data
   * @returns {Promise<Object>} - Updated pricing rule
   */
  async updatePricingRule(id, ruleData) {
    try {
      const updatedRule = await PricingRule.query()
        .patchAndFetchById(id, ruleData);
      
      if (!updatedRule) {
        throw new NotFoundError(`Pricing rule with ID ${id} not found`);
      }
      
      return updatedRule;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid pricing rule data', error.data);
      }
      throw error;
    }
  }

  /**
   * Delete a pricing rule
   * @param {Number} id - Pricing rule ID
   * @returns {Promise<Boolean>} - Success status
   */
  async deletePricingRule(id) {
    const numDeleted = await PricingRule.query().deleteById(id);
    
    if (numDeleted === 0) {
      throw new NotFoundError(`Pricing rule with ID ${id} not found`);
    }
    
    return true;
  }

  /**
   * Search for pricing rules based on criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchPricingRules(criteria = {}, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    
    let query = PricingRule.query();
    
    // Apply filters
    if (criteria.rule_type) {
      query = query.where('rule_type', criteria.rule_type);
    }
    
    if (criteria.is_active !== undefined) {
      query = query.where('is_active', criteria.is_active);
    }
    
    if (criteria.partner_id) {
      query = query.where('partner_id', criteria.partner_id);
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
   * Find applicable pricing rules for given parameters
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} - List of applicable pricing rules
   */
  async findApplicablePricingRules(params) {
    const query = PricingRule.query()
      .where('is_active', true)
      .where('valid_from', '<=', new Date().toISOString())
      .where(builder => {
        builder.whereNull('valid_to').orWhere('valid_to', '>=', new Date().toISOString());
      });
    
    // Apply filters based on params
    if (params.service_type) {
      query.where(builder => {
        builder.whereJsonSuperset('applicable_services', [params.service_type])
          .orWhereJsonSuperset('applicable_services', ['all'])
          .orWhereNull('applicable_services');
      });
    }
    
    if (params.transport_mode) {
      query.where(builder => {
        builder.whereJsonSuperset('applicable_modes', [params.transport_mode])
          .orWhereJsonSuperset('applicable_modes', ['multimodal', 'all'])
          .orWhereNull('applicable_modes');
      });
    }
    
    if (params.partner_id) {
      query.where(builder => {
        builder.where('partner_id', params.partner_id)
          .orWhereNull('partner_id');
      });
    }
    
    // Order by priority (lower number = higher priority)
    query.orderBy('priority', 'asc');
    
    const rules = await query;
    
    // Filter rules that match conditions by calling matchesConditions method
    return rules.filter(rule => rule.matchesConditions(params));
  }

  /**
   * Apply pricing rules to modify a base price
   * @param {Object} params - Calculation parameters including base price
   * @returns {Promise<Object>} - Modified price details with applied rules
   */
  async applyPricingRules(params) {
    const applicableRules = await this.findApplicablePricingRules(params);
    
    if (applicableRules.length === 0) {
      return {
        original_price: params.base_price,
        final_price: params.base_price,
        applied_rules: [],
        total_adjustment: 0
      };
    }
    
    let currentPrice = params.base_price;
    const appliedRules = [];
    let totalAdjustment = 0;
    
    // Apply rules in priority order
    for (const rule of applicableRules) {
      const ruleResult = rule.applyRule({
        ...params,
        base_price: currentPrice
      });
      
      if (ruleResult.applied) {
        currentPrice = ruleResult.modified_price;
        totalAdjustment += ruleResult.difference;
        
        appliedRules.push({
          rule_id: rule.id,
          rule_name: rule.name,
          rule_type: rule.rule_type,
          original_price: ruleResult.original_price,
          modified_price: ruleResult.modified_price,
          adjustment: ruleResult.difference
        });
      }
    }
    
    return {
      original_price: params.base_price,
      final_price: currentPrice,
      applied_rules: appliedRules,
      total_adjustment: totalAdjustment
    };
  }
}

module.exports = new PricingRuleService();
