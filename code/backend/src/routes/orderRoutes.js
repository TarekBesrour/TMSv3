/**
 * API routes for order management in the TMS system
 * 
 * These routes handle order-related operations,
 * supporting multimodal transport and international shipping.
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');

// Create a new order
router.post(
  '/',
  authenticate,
  checkPermission('orders:create'),
  [
    body('orderData.reference').notEmpty().withMessage('Reference is required'),
    body('orderData.customer_id').isInt().withMessage('Valid customer ID is required'),
    body('orderData.origin_address_id').isInt().withMessage('Valid origin address ID is required'),
    body('orderData.destination_address_id').isInt().withMessage('Valid destination address ID is required'),
    body('orderData.service_type').isIn(['standard', 'express', 'economy']).withMessage('Valid service type is required'),
    body('orderData.incoterm').optional().isIn(['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']).withMessage('Valid incoterm is required'),
    body('orderData.currency').optional().isLength({ min: 3, max: 3 }).withMessage('Valid currency code is required'),
    body('orderLines').isArray().withMessage('Order lines must be an array'),
    body('orderLines.*.description').notEmpty().withMessage('Line description is required'),
    body('orderLines.*.quantity').isFloat({ min: 0.01 }).withMessage('Valid quantity is required'),
    body('orderLines.*.weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    body('orderLines.*.weight_unit').optional().isIn(['kg', 'lb']).withMessage('Valid weight unit is required'),
    body('orderLines.*.volume').optional().isFloat({ min: 0 }).withMessage('Volume must be a positive number'),
    body('orderLines.*.volume_unit').optional().isIn(['m3', 'ft3']).withMessage('Valid volume unit is required')
  ],
  OrderController.createOrder
);

// Get all orders with filtering and pagination
router.get(
  '/',
  authenticate,
  checkPermission('orders:read'),
  [
    query('customer_id').optional().isInt().withMessage('Customer ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('page_size').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    query('sort_by').optional().isIn(['created_at', 'reference', 'status', 'priority', 'promised_date', 'customer_name']).withMessage('Invalid sort field'),
    query('sort_direction').optional().isIn(['asc', 'desc']).withMessage('Sort direction must be asc or desc')
  ],
  OrderController.getOrders
);

// Get order by ID
router.get(
  '/:id',
  authenticate,
  checkPermission('orders:read'),
  [
    param('id').isInt().withMessage('Order ID must be an integer'),
    query('include_relations').optional().isBoolean().withMessage('Include relations must be a boolean')
  ],
  OrderController.getOrderById
);

// Update an order
router.put(
  '/:id',
  authenticate,
  checkPermission('orders:update'),
  [
    param('id').isInt().withMessage('Order ID must be an integer'),
    body('reference').optional().notEmpty().withMessage('Reference cannot be empty'),
    body('status').optional().isIn(['draft', 'confirmed', 'planned', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
    body('service_type').optional().isIn(['standard', 'express', 'economy']).withMessage('Invalid service type'),
    body('promised_date').optional().isISO8601().withMessage('Valid date is required for promised date')
  ],
  OrderController.updateOrder
);

// Delete an order
router.delete(
  '/:id',
  authenticate,
  checkPermission('orders:delete'),
  [
    param('id').isInt().withMessage('Order ID must be an integer')
  ],
  OrderController.deleteOrder
);

// Convert an order to shipment
router.post(
  '/:id/convert-to-shipment',
  authenticate,
  checkPermission('orders:update'),
  [
    param('id').isInt().withMessage('Order ID must be an integer'),
    body('carrier_id').isInt().withMessage('Valid carrier ID is required'),
    body('transport_mode').isIn(['road', 'rail', 'sea', 'air', 'multimodal']).withMessage('Valid transport mode is required'),
    body('planned_pickup_date').isISO8601().withMessage('Valid date is required for planned pickup date')
  ],
  OrderController.convertOrderToShipment
);

// Calculate estimated costs for an order
router.get(
  '/:id/costs',
  authenticate,
  checkPermission('orders:read'),
  [
    param('id').isInt().withMessage('Order ID must be an integer')
  ],
  OrderController.calculateOrderCosts
);

// Get order statistics
router.get(
  '/statistics',
  authenticate,
  checkPermission('orders:read'),
  [
    query('customer_id').optional().isInt().withMessage('Customer ID must be an integer'),
    query('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    query('end_date').optional().isISO8601().withMessage('Valid end date is required')
  ],
  OrderController.getOrderStatistics
);

module.exports = router;
