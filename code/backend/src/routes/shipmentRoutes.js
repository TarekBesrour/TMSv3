/**
 * API routes for shipment management in the TMS system
 * 
 * These routes handle shipment-related operations,
 * supporting multimodal transport and international shipping.
 */

const express = require('express');
const router = express.Router();
const ShipmentController = require('../controllers/ShipmentController');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');

// Create a new shipment
router.post(
  '/',
  authenticate,
  checkPermission('shipments:create'),
  [
    body('reference').notEmpty().withMessage('Reference is required'),
    body('order_id').optional().isInt().withMessage('Valid order ID is required'),
    body('carrier_id').isInt().withMessage('Valid carrier ID is required'),
    body('origin_address_id').isInt().withMessage('Valid origin address ID is required'),
    body('destination_address_id').isInt().withMessage('Valid destination address ID is required'),
    body('transport_mode').isIn(['road', 'rail', 'sea', 'air', 'multimodal']).withMessage('Valid transport mode is required'),
    body('service_level').isIn(['standard', 'express', 'economy']).withMessage('Valid service level is required'),
    body('shipment_type').optional().isIn(['domestic', 'international', 'cross_border']).withMessage('Valid shipment type is required'),
    body('planned_pickup_date').isISO8601().withMessage('Valid date is required for planned pickup date'),
    body('planned_delivery_date').isISO8601().withMessage('Valid date is required for planned delivery date'),
    body('incoterm').optional().isIn(['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']).withMessage('Valid incoterm is required'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Valid currency code is required')
  ],
  ShipmentController.createShipment
);

// Get all shipments with filtering and pagination
router.get(
  '/',
  authenticate,
  checkPermission('shipments:read'),
  [
    query('order_id').optional().isInt().withMessage('Order ID must be an integer'),
    query('carrier_id').optional().isInt().withMessage('Carrier ID must be an integer'),
    query('status').optional(),
    query('shipment_type').optional(),
    query('transport_mode').optional(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('page_size').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
    query('sort_by').optional().isIn(['created_at', 'reference', 'status', 'planned_pickup_date', 'planned_delivery_date', 'carrier_name']).withMessage('Invalid sort field'),
    query('sort_direction').optional().isIn(['asc', 'desc']).withMessage('Sort direction must be asc or desc')
  ],
  ShipmentController.getShipments
);

// Get shipment by ID
router.get(
  '/:id',
  authenticate,
  checkPermission('shipments:read'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer'),
    query('include_relations').optional().isBoolean().withMessage('Include relations must be a boolean')
  ],
  ShipmentController.getShipmentById
);

// Update a shipment
router.put(
  '/:id',
  authenticate,
  checkPermission('shipments:update'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer'),
    body('reference').optional().notEmpty().withMessage('Reference cannot be empty'),
    body('status').optional().isIn(['draft', 'planned', 'booked', 'in_transit', 'customs_hold', 'exception', 'delivered', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('carrier_reference').optional(),
    body('planned_pickup_date').optional().isISO8601().withMessage('Valid date is required for planned pickup date'),
    body('planned_delivery_date').optional().isISO8601().withMessage('Valid date is required for planned delivery date')
  ],
  ShipmentController.updateShipment
);

// Delete a shipment
router.delete(
  '/:id',
  authenticate,
  checkPermission('shipments:delete'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer')
  ],
  ShipmentController.deleteShipment
);

// Add a transport segment to a shipment
router.post(
  '/:id/segments',
  authenticate,
  checkPermission('shipments:update'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer'),
    body('carrier_id').isInt().withMessage('Valid carrier ID is required'),
    body('transport_mode').isIn(['road', 'rail', 'sea', 'air']).withMessage('Valid transport mode is required'),
    body('origin_address_id').isInt().withMessage('Valid origin address ID is required'),
    body('destination_address_id').isInt().withMessage('Valid destination address ID is required'),
    body('planned_departure_date').isISO8601().withMessage('Valid date is required for planned departure date'),
    body('planned_arrival_date').isISO8601().withMessage('Valid date is required for planned arrival date')
  ],
  ShipmentController.addTransportSegment
);

// Add a transport unit to a shipment
router.post(
  '/:id/units',
  authenticate,
  checkPermission('shipments:update'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer'),
    body('unitData.unit_type').isIn(['container', 'pallet', 'parcel', 'bulk', 'vehicle']).withMessage('Valid unit type is required'),
    body('unitData.unit_number').optional(),
    body('unitData.seal_number').optional(),
    body('orderLineIds').optional().isArray().withMessage('Order line IDs must be an array')
  ],
  ShipmentController.addTransportUnit
);

// Add a tracking event to a shipment
router.post(
  '/:id/events',
  authenticate,
  checkPermission('shipments:update'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer'),
    body('event_type').isIn([
      'pickup_planned', 'pickup_delayed', 'pickup_completed',
      'departure', 'arrival', 'in_transit', 'customs_clearance_start',
      'customs_hold', 'customs_cleared', 'delivery_planned',
      'delivery_delayed', 'delivery_completed', 'exception',
      'status_update', 'document_update', 'location_update'
    ]).withMessage('Valid event type is required'),
    body('timestamp').optional().isISO8601().withMessage('Valid timestamp is required'),
    body('description').optional(),
    query('update_status').optional().isBoolean().withMessage('Update status must be a boolean')
  ],
  ShipmentController.addTrackingEvent
);

// Calculate estimated arrival date for a shipment
router.get(
  '/:id/eta',
  authenticate,
  checkPermission('shipments:read'),
  [
    param('id').isInt().withMessage('Shipment ID must be an integer')
  ],
  ShipmentController.calculateETA
);

// Get shipment statistics
router.get(
  '/statistics',
  authenticate,
  checkPermission('shipments:read'),
  [
    query('carrier_id').optional().isInt().withMessage('Carrier ID must be an integer'),
    query('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    query('end_date').optional().isISO8601().withMessage('Valid end date is required')
  ],
  ShipmentController.getShipmentStatistics
);

module.exports = router;
