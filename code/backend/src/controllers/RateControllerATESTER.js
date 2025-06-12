/**
 * RateController for handling API requests related to tariff rates
 * Provides endpoints for creating, retrieving, updating, and searching rates
 */
const express = require('express');
const router = express.Router();
const RateService = require('../services/RateService');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { handleError } = require('../utils/errorHandler');

/**
 * @route GET /api/rates
 * @desc Search for rates based on criteria
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const criteria = {
      rate_type: req.query.rate_type,
      transport_mode: req.query.transport_mode,
      origin_country: req.query.origin_country,
      destination_country: req.query.destination_country,
      partner_id: req.query.partner_id ? parseInt(req.query.partner_id) : undefined,
      is_active: req.query.is_active === 'true',
      valid_from: req.query.valid_from,
      valid_to: req.query.valid_to,
      currently_valid: req.query.currently_valid === 'true',
      search_term: req.query.search
    };
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20
    };
    
    const results = await RateService.searchRates(criteria, pagination);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/rates/:id
 * @desc Get rate by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const withRelations = req.query.with_relations === 'true';
    const rate = await RateService.getRateById(parseInt(req.params.id), withRelations);
    res.json(rate);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/rates
 * @desc Create a new rate
 * @access Private
 */
router.post('/', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    rate_type: { type: 'string', required: true },
    transport_mode: { type: 'string', required: true },
    pricing_unit: { type: 'string', required: true },
    base_amount: { type: 'number', required: true },
    currency: { type: 'string', required: true },
    valid_from: { type: 'string', required: true }
  }
}), async (req, res) => {
  try {
    // Add tenant_id from authenticated user
    const rateData = {
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.id
    };
    
    const rate = await RateService.createRate(rateData);
    res.status(201).json(rate);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route PUT /api/rates/:id
 * @desc Update an existing rate
 * @access Private
 */
router.put('/:id', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    rate_type: { type: 'string' },
    transport_mode: { type: 'string' },
    pricing_unit: { type: 'string' },
    base_amount: { type: 'number' },
    currency: { type: 'string' },
    valid_from: { type: 'string' }
  }
}), async (req, res) => {
  try {
    // Add updated_by from authenticated user
    const rateData = {
      ...req.body,
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    };
    
    const rate = await RateService.updateRate(parseInt(req.params.id), rateData);
    res.json(rate);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route DELETE /api/rates/:id
 * @desc Delete a rate
 * @access Private
 */
router.delete('/:id', authenticate, authorize(['admin', 'rate_manager']), async (req, res) => {
  try {
    await RateService.deleteRate(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/rates/calculate
 * @desc Calculate price based on parameters
 * @access Private
 */
router.post('/calculate', authenticate, validateRequest({
  body: {
    transport_mode: { type: 'string', required: true },
    origin_country: { type: 'string' },
    destination_country: { type: 'string' },
    weight: { type: 'number' },
    volume: { type: 'number' },
    distance: { type: 'number' },
    client_id: { type: 'number' },
    carrier_id: { type: 'number' }
  }
}), async (req, res) => {
  try {
    const priceDetails = await RateService.calculatePrice(req.body);
    res.json(priceDetails);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/rates/import
 * @desc Import rates from array
 * @access Private
 */
router.post('/import', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    rates: { type: 'array', required: true }
  }
}), async (req, res) => {
  try {
    const results = await RateService.importRates(req.body.rates);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/rates/applicable
 * @desc Find applicable rates for given parameters
 * @access Private
 */
router.get('/applicable', authenticate, async (req, res) => {
  try {
    const params = {
      transport_mode: req.query.transport_mode,
      origin_country: req.query.origin_country,
      destination_country: req.query.destination_country,
      weight: req.query.weight ? parseFloat(req.query.weight) : undefined,
      volume: req.query.volume ? parseFloat(req.query.volume) : undefined,
      distance: req.query.distance ? parseFloat(req.query.distance) : undefined,
      client_id: req.query.client_id ? parseInt(req.query.client_id) : undefined,
      carrier_id: req.query.carrier_id ? parseInt(req.query.carrier_id) : undefined
    };
    
    const applicableRates = await RateService.findApplicableRates(params);
    res.json(applicableRates);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
