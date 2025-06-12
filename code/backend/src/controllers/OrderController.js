/**
 * OrderController for handling order-related API requests in the TMS system
 * 
 * This controller provides endpoints for managing orders,
 * supporting multimodal transport and international shipping.
 */

const OrderService = require('../services/OrderService');
const { validationResult } = require('express-validator');

class OrderController {
  /**
   * Create a new order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createOrder(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { orderData, orderLines } = req.body;
      const userId = req.user.id;
      
      // Create order
      const order = await OrderService.createOrder(orderData, orderLines, { userId });
      
      return res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while creating the order'
      });
    }
  }
  
  /**
   * Get order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const withRelations = req.query.include_relations === 'true';
      
      const order = await OrderService.getOrderById(id, { withRelations });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order with ID ${id} not found`
        });
      }
      
      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error getting order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while retrieving the order'
      });
    }
  }
  
  /**
   * Get orders with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrders(req, res) {
    try {
      // Extract query parameters
      const {
        customer_id,
        status,
        priority,
        service_type,
        reference,
        external_reference,
        created_after,
        created_before,
        is_international,
        transport_mode,
        search,
        page = 1,
        page_size = 20,
        sort_by = 'created_at',
        sort_direction = 'desc',
        include_relations = false
      } = req.query;
      
      // Prepare filters
      const filters = {
        customer_id: customer_id ? parseInt(customer_id, 10) : undefined,
        status,
        priority,
        service_type,
        reference,
        external_reference,
        created_after,
        created_before,
        is_international: is_international === 'true' ? true : is_international === 'false' ? false : undefined,
        transport_mode,
        search
      };
      
      // Prepare pagination
      const pagination = {
        page: parseInt(page, 10),
        pageSize: parseInt(page_size, 10),
        sortBy: sort_by,
        sortDirection: sort_direction
      };
      
      // Prepare options
      const options = {
        withRelations: include_relations === 'true'
      };
      
      // Get orders
      const result = await OrderService.getOrders(filters, pagination, options);
      
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while retrieving orders'
      });
    }
  }
  
  /**
   * Update an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateOrder(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const orderData = req.body;
      const userId = req.user.id;
      
      // Update order
      const order = await OrderService.updateOrder(id, orderData, { userId });
      
      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while updating the order'
      });
    }
  }
  
  /**
   * Delete an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Delete order
      await OrderService.deleteOrder(id, { userId });
      
      return res.status(200).json({
        success: true,
        message: `Order with ID ${id} deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while deleting the order'
      });
    }
  }
  
  /**
   * Convert an order to shipment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async convertOrderToShipment(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const shipmentData = req.body;
      const userId = req.user.id;
      
      // Convert order to shipment
      const shipment = await OrderService.convertOrderToShipment(id, shipmentData, { userId });
      
      return res.status(201).json({
        success: true,
        data: shipment
      });
    } catch (error) {
      console.error('Error converting order to shipment:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while converting the order to shipment'
      });
    }
  }
  
  /**
   * Calculate estimated costs for an order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateOrderCosts(req, res) {
    try {
      const { id } = req.params;
      
      // Calculate costs
      const costs = await OrderService.calculateOrderCosts(id);
      
      return res.status(200).json({
        success: true,
        data: costs
      });
    } catch (error) {
      console.error('Error calculating order costs:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while calculating order costs'
      });
    }
  }
  
  /**
   * Get order statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrderStatistics(req, res) {
    try {
      // Extract query parameters
      const {
        customer_id,
        start_date,
        end_date
      } = req.query;
      
      // Prepare filters
      const filters = {
        customer_id: customer_id ? parseInt(customer_id, 10) : undefined,
        start_date,
        end_date
      };
      
      // Get statistics
      const statistics = await OrderService.getOrderStatistics(filters);
      
      return res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting order statistics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while retrieving order statistics'
      });
    }
  }
}

module.exports = new OrderController();
