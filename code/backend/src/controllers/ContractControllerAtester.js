/**
 * ContractController for handling API requests related to contracts
 * Provides endpoints for creating, retrieving, updating, and searching contracts
 */
const express = require('express');
const router = express.Router();
const ContractService = require('../services/ContractService');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { handleError } = require('../utils/errorHandler');

/**
 * @route GET /api/contracts
 * @desc Search for contracts based on criteria
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const criteria = {
      contract_type: req.query.contract_type,
      partner_id: req.query.partner_id ? parseInt(req.query.partner_id) : undefined,
      status: req.query.status,
      is_active: req.query.is_active === 'true',
      valid_from: req.query.valid_from,
      valid_to: req.query.valid_to,
      currently_valid: req.query.currently_valid === 'true',
      expiring_within_days: req.query.expiring_within_days ? parseInt(req.query.expiring_within_days) : undefined,
      search_term: req.query.search,
      with_relations: req.query.with_relations === 'true'
    };
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20
    };
    
    const results = await ContractService.searchContracts(criteria, pagination);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/contracts/:id
 * @desc Get contract by ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const withRelations = req.query.with_relations === 'true';
    const contract = await ContractService.getContractById(parseInt(req.params.id), withRelations);
    res.json(contract);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/contracts
 * @desc Create a new contract
 * @access Private
 */
router.post('/', authenticate, authorize(['admin', 'contract_manager']), validateRequest({
  body: {
    contract_reference: { type: 'string', required: true },
    contract_type: { type: 'string', required: true },
    partner_id: { type: 'number', required: true },
    valid_from: { type: 'string', required: true },
    contract_lines: { type: 'array' }
  }
}), async (req, res) => {
  try {
    // Extract contract lines from request body
    const { contract_lines, ...contractData } = req.body;
    
    // Add tenant_id from authenticated user
    contractData.tenant_id = req.user.tenant_id;
    contractData.created_by = req.user.id;
    
    const contract = await ContractService.createContract(contractData, contract_lines);
    res.status(201).json(contract);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route PUT /api/contracts/:id
 * @desc Update an existing contract
 * @access Private
 */
router.put('/:id', authenticate, authorize(['admin', 'contract_manager']), validateRequest({
  body: {
    contract_reference: { type: 'string' },
    contract_type: { type: 'string' },
    partner_id: { type: 'number' },
    valid_from: { type: 'string' }
  }
}), async (req, res) => {
  try {
    // Add updated_by from authenticated user
    const contractData = {
      ...req.body,
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    };
    
    const contract = await ContractService.updateContract(parseInt(req.params.id), contractData);
    res.json(contract);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route DELETE /api/contracts/:id
 * @desc Delete a contract
 * @access Private
 */
router.delete('/:id', authenticate, authorize(['admin', 'contract_manager']), async (req, res) => {
  try {
    await ContractService.deleteContract(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/contracts/:id/lines
 * @desc Get contract lines for a contract
 * @access Private
 */
router.get('/:id/lines', authenticate, async (req, res) => {
  try {
    const contract = await ContractService.getContractById(parseInt(req.params.id), true);
    res.json(contract.contractLines || []);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/contracts/:id/lines
 * @desc Add a line to a contract
 * @access Private
 */
router.post('/:id/lines', authenticate, authorize(['admin', 'contract_manager']), validateRequest({
  body: {
    service_type: { type: 'string', required: true },
    service_description: { type: 'string', required: true }
  }
}), async (req, res) => {
  try {
    // Add tenant_id from authenticated user
    const lineData = {
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.id
    };
    
    const contractLine = await ContractService.addContractLine(parseInt(req.params.id), lineData);
    res.status(201).json(contractLine);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route PUT /api/contracts/lines/:lineId
 * @desc Update a contract line
 * @access Private
 */
router.put('/lines/:lineId', authenticate, authorize(['admin', 'contract_manager']), async (req, res) => {
  try {
    // Add updated_by from authenticated user
    const lineData = {
      ...req.body,
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    };
    
    const contractLine = await ContractService.updateContractLine(parseInt(req.params.lineId), lineData);
    res.json(contractLine);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route DELETE /api/contracts/lines/:lineId
 * @desc Delete a contract line
 * @access Private
 */
router.delete('/lines/:lineId', authenticate, authorize(['admin', 'contract_manager']), async (req, res) => {
  try {
    await ContractService.deleteContractLine(parseInt(req.params.lineId));
    res.status(204).end();
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route POST /api/contracts/calculate
 * @desc Calculate price based on contract and parameters
 * @access Private
 */
router.post('/calculate', authenticate, validateRequest({
  body: {
    partner_id: { type: 'number', required: true },
    contract_type: { type: 'string', required: true },
    service_type: { type: 'string' },
    transport_mode: { type: 'string' },
    origin_country: { type: 'string' },
    destination_country: { type: 'string' },
    weight: { type: 'number' },
    volume: { type: 'number' },
    distance: { type: 'number' },
    pallets: { type: 'number' },
    containers: { type: 'number' }
  }
}), async (req, res) => {
  try {
    const priceDetails = await ContractService.calculateContractPrice(req.body);
    res.json(priceDetails);
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * @route GET /api/contracts/expiring
 * @desc Get contracts expiring soon
 * @access Private
 */
router.get('/expiring', authenticate, authorize(['admin', 'contract_manager']), async (req, res) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 30;
    
    const pagination = {
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20
    };
    
    const results = await ContractService.getExpiringContracts(daysThreshold, pagination);
    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
