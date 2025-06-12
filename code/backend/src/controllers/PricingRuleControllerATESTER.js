/**
 * PricingRuleController for handling API requests related to pricing rules
 * Provides endpoints for creating, retrieving, updating, and searching pricing rules
 */
const express = require('express');
const router = express.Router();
const PricingRuleService = require('../services/PricingRuleService');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { handleError } = require('../utils/errorHandler');

/**
 * @route GET /api/pricing-rules
 * @desc Search for pricing rules based on criteria
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const criteria = {
      rule_type: req.query.rule_type,
      is_active: req.query.is_active === 'true',
      partner_id: req.query.partner_id ? parseInt(req.query.partner_id) : undefined,
      valid_from: req.query.valid_from,
      valid_to: req.query.valid_to,
      currently_valid: req.query.currently_valid === 'true',
      search_term: req.query.search
    };
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20
    };
    
    const results = await PricingRuleService.searchPricingRules(criteria, pagination);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/pricing-rules/:id
 * @desc Get pricing rule by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const rule = await PricingRuleService.getPricingRuleById(parseInt(req.params.id));
    res.json(rule);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/pricing-rules
 * @desc Create a new pricing rule
 * @access Private
 */
router.post('/', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    name: { type: 'string', required: true },
    rule_type: { type: 'string', required: true },
    priority: { type: 'number', required: true },
    conditions: { type: 'object', required: true },
    actions: { type: 'object', required: true },
    valid_from: { type: 'string', required: true }
  }
}), async (req, res) => {
  try {
    // Add tenant_id from authenticated user
    const ruleData = {
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.id
    };
    
    const rule = await PricingRuleService.createPricingRule(ruleData);
    res.status(201).json(rule);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route PUT /api/pricing-rules/:id
 * @desc Update an existing pricing rule
 * @access Private
 */
router.put('/:id', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    name: { type: 'string' },
    rule_type: { type: 'string' },
    priority: { type: 'number' },
    conditions: { type: 'object' },
    actions: { type: 'object' },
    valid_from: { type: 'string' }
  }
}), async (req, res) => {
  try {
    // Add updated_by from authenticated user
    const ruleData = {
      ...req.body,
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    };
    
    const rule = await PricingRuleService.updatePricingRule(parseInt(req.params.id), ruleData);
    res.json(rule);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route DELETE /api/pricing-rules/:id
 * @desc Delete a pricing rule
 * @access Private
 */
router.delete('/:id', authenticate, authorize(['admin', 'rate_manager']), async (req, res) => {
  try {
    await PricingRuleService.deletePricingRule(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/pricing-rules/apply
 * @desc Apply pricing rules to modify a base price
 * @access Private
 */
router.post('/apply', authenticate, validateRequest({
  body: {
    base_price: { type: 'number', required: true },
    service_type: { type: 'string' },
    transport_mode: { type: 'string' },
    partner_id: { type: 'number' },
    weight: { type: 'number' },
    volume: { type: 'number' },
    distance: { type: 'number' },
    pallets: { type: 'number' },
    containers: { type: 'number' }
  }
}), async (req, res) => {
  try {
    const priceDetails = await PricingRuleService.applyPricingRules(req.body);
    res.json(priceDetails);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/pricing-rules/applicable
 * @desc Find applicable pricing rules for given parameters
 * @access Private
 */
router.get('/applicable', authenticate, async (req, res) => {
  try {
    const params = {
      service_type: req.query.service_type,
      transport_mode: req.query.transport_mode,
      partner_id: req.query.partner_id ? parseInt(req.query.partner_id) : undefined
    };
    
    const applicableRules = await PricingRuleService.findApplicablePricingRules(params);
    res.json(applicableRules);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
