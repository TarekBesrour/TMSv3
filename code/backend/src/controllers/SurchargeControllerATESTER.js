/**
 * SurchargeController for handling API requests related to surcharges
 * Provides endpoints for creating, retrieving, updating, and searching surcharges
 */
const express = require('express');
const router = express.Router();
const SurchargeService = require('../services/SurchargeService');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { handleError } = require('../utils/errorHandler');

/**
 * @route GET /api/surcharges
 * @desc Search for surcharges based on criteria
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const criteria = {
      surcharge_type: req.query.surcharge_type,
      calculation_method: req.query.calculation_method,
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
    
    const results = await SurchargeService.searchSurcharges(criteria, pagination);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/surcharges/:id
 * @desc Get surcharge by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const surcharge = await SurchargeService.getSurchargeById(parseInt(req.params.id));
    res.json(surcharge);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/surcharges
 * @desc Create a new surcharge
 * @access Private
 */
router.post('/', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    name: { type: 'string', required: true },
    surcharge_type: { type: 'string', required: true },
    calculation_method: { type: 'string', required: true },
    value: { type: 'number', required: true },
    valid_from: { type: 'string', required: true }
  }
}), async (req, res) => {
  try {
    // Add tenant_id from authenticated user
    const surchargeData = {
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.id
    };
    
    const surcharge = await SurchargeService.createSurcharge(surchargeData);
    res.status(201).json(surcharge);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route PUT /api/surcharges/:id
 * @desc Update an existing surcharge
 * @access Private
 */
router.put('/:id', authenticate, authorize(['admin', 'rate_manager']), validateRequest({
  body: {
    name: { type: 'string' },
    surcharge_type: { type: 'string' },
    calculation_method: { type: 'string' },
    value: { type: 'number' },
    valid_from: { type: 'string' }
  }
}), async (req, res) => {
  try {
    // Add updated_by from authenticated user
    const surchargeData = {
      ...req.body,
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    };
    
    const surcharge = await SurchargeService.updateSurcharge(parseInt(req.params.id), surchargeData);
    res.json(surcharge);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route DELETE /api/surcharges/:id
 * @desc Delete a surcharge
 * @access Private
 */
router.delete('/:id', authenticate, authorize(['admin', 'rate_manager']), async (req, res) => {
  try {
    await SurchargeService.deleteSurcharge(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/surcharges/calculate
 * @desc Calculate surcharges based on parameters
 * @access Private
 */
router.post('/calculate', authenticate, validateRequest({
  body: {
    base_price: { type: 'number', required: true },
    transport_mode: { type: 'string' },
    region: { type: 'string' },
    weight: { type: 'number' },
    volume: { type: 'number' },
    distance: { type: 'number' },
    pallets: { type: 'number' },
    containers: { type: 'number' }
  }
}), async (req, res) => {
  try {
    const surchargeDetails = await SurchargeService.calculateSurcharges(req.body);
    res.json(surchargeDetails);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/surcharges/applicable
 * @desc Find applicable surcharges for given parameters
 * @access Private
 */
router.get('/applicable', authenticate, async (req, res) => {
  try {
    const params = {
      transport_mode: req.query.transport_mode,
      region: req.query.region
    };
    
    const applicableSurcharges = await SurchargeService.findApplicableSurcharges(params);
    res.json(applicableSurcharges);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
