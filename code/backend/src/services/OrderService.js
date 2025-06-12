/**
 * OrderService for managing orders in the TMS system
 * 
 * This service provides business logic for order management,
 * supporting multimodal transport and international shipping.
 */

const Order = require('../models/Order');
const OrderLine = require('../models/OrderLine');
const Shipment = require('../models/Shipment');
const CustomsInfo = require('../models/CustomsInfo');
const { transaction } = require('objection');

class OrderService {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @param {Array} orderLines - Order line items
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData, orderLines = [], options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Order.knex());
    
    try {
      // Set audit fields
      if (userId) {
        orderData.created_by = userId;
        orderData.updated_by = userId;
      }
      
      // Set default values if not provided
      if (!orderData.status) {
        orderData.status = 'draft';
      }
      
      if (!orderData.priority) {
        orderData.priority = 'normal';
      }
      
      if (!orderData.service_type) {
        orderData.service_type = 'standard';
      }
      
      // Create the order
      const order = await Order.query(trx).insert(orderData);
      
      // Create order lines if provided
      if (orderLines && orderLines.length > 0) {
        const orderLinesWithOrderId = orderLines.map((line, index) => ({
          ...line,
          order_id: order.id,
          line_number: index + 1,
          created_by: userId,
          updated_by: userId
        }));
        
        await OrderLine.query(trx).insert(orderLinesWithOrderId);
      }
      
      // Create customs info if international
      if (order.isInternational()) {
        await CustomsInfo.query(trx).insert({
          order_id: order.id,
          status: 'pending',
          origin_country: orderData.origin_country,
          destination_country: orderData.destination_country,
          incoterm: orderData.incoterm,
          created_by: userId,
          updated_by: userId
        });
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the created order with relations
      return this.getOrderById(order.id, { withRelations: true });
    } catch (error) {
      // If not using an external transaction, rollback
      if (!providedTrx) {
        await trx.rollback();
      }
      
      throw error;
    }
  }
  
  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Order
   */
  async getOrderById(id, options = {}) {
    const { withRelations = false } = options;
    
    let query = Order.query().findById(id);
    
    if (withRelations) {
      query = query.withGraphFetched(`[
        customer,
        originAddress,
        destinationAddress,
        orderLines,
        shipments.[
          carrier,
          transportSegments.[carrier],
          transportUnits,
          documents,
          trackingEvents
        ],
        documents,
        customsInfo.[
          exporter,
          importer,
          documents
        ]
      ]`);
    }
    
    return query;
  }
  
  /**
   * Get orders with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Paginated orders
   */
  async getOrders(filters = {}, pagination = {}, options = {}) {
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
      search
    } = filters;
    
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortDirection = 'desc' } = pagination;
    const { withRelations = false } = options;
    
    let query = Order.query();
    
    // Apply filters
    if (customer_id) {
      query = query.where('customer_id', customer_id);
    }
    
    if (status) {
      if (Array.isArray(status)) {
        query = query.whereIn('status', status);
      } else {
        query = query.where('status', status);
      }
    }
    
    if (priority) {
      if (Array.isArray(priority)) {
        query = query.whereIn('priority', priority);
      } else {
        query = query.where('priority', priority);
      }
    }
    
    if (service_type) {
      if (Array.isArray(service_type)) {
        query = query.whereIn('service_type', service_type);
      } else {
        query = query.where('service_type', service_type);
      }
    }
    
    if (reference) {
      query = query.where('reference', 'like', `%${reference}%`);
    }
    
    if (external_reference) {
      query = query.where('external_reference', 'like', `%${external_reference}%`);
    }
    
    if (created_after) {
      query = query.where('created_at', '>=', created_after);
    }
    
    if (created_before) {
      query = query.where('created_at', '<=', created_before);
    }
    
    if (is_international !== undefined) {
      if (is_international) {
        query = query.whereNotNull('incoterm');
      } else {
        query = query.whereNull('incoterm');
      }
    }
    
    if (transport_mode) {
      query = query.where('preferred_transport_modes', '@>', JSON.stringify([transport_mode]));
    }
    
    if (search) {
      query = query.where(builder => {
        builder.where('reference', 'like', `%${search}%`)
          .orWhere('external_reference', 'like', `%${search}%`)
          .orWhere('customer_order_reference', 'like', `%${search}%`)
          .orWhereExists(
            Order.relatedQuery('customer')
              .where('name', 'like', `%${search}%`)
          );
      });
    }
    
    // Apply relations if requested
    if (withRelations) {
      query = query.withGraphFetched(`[
        customer,
        orderLines,
        shipments.[carrier]
      ]`);
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'customer_name' ? 'customer:name' : sortBy;
    query = query.orderBy(sortColumn, sortDirection);
    
    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);
    
    // Get total count for pagination
    const totalQuery = Order.query().count('id as count');
    
    // Apply the same filters to the count query
    if (customer_id) {
      totalQuery.where('customer_id', customer_id);
    }
    
    if (status) {
      if (Array.isArray(status)) {
        totalQuery.whereIn('status', status);
      } else {
        totalQuery.where('status', status);
      }
    }
    
    // ... apply other filters to totalQuery
    
    const [orders, countResult] = await Promise.all([
      query,
      totalQuery.first()
    ]);
    
    const total = parseInt(countResult.count, 10);
    
    return {
      data: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
  
  /**
   * Update an order
   * @param {number} id - Order ID
   * @param {Object} orderData - Updated order data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Updated order
   */
  async updateOrder(id, orderData, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Order.knex());
    
    try {
      // Set audit fields
      if (userId) {
        orderData.updated_by = userId;
      }
      
      // Update the order
      await Order.query(trx).findById(id).patch(orderData);
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the updated order with relations
      return this.getOrderById(id, { withRelations: true });
    } catch (error) {
      // If not using an external transaction, rollback
      if (!providedTrx) {
        await trx.rollback();
      }
      
      throw error;
    }
  }
  
  /**
   * Delete an order
   * @param {number} id - Order ID
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success indicator
   */
  async deleteOrder(id, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Order.knex());
    
    try {
      // Check if order has shipments
      const shipments = await Shipment.query(trx).where('order_id', id);
      
      if (shipments.length > 0) {
        throw new Error('Cannot delete order with associated shipments');
      }
      
      // Delete order lines
      await OrderLine.query(trx).delete().where('order_id', id);
      
      // Delete customs info
      await CustomsInfo.query(trx).delete().where('order_id', id);
      
      // Delete the order
      await Order.query(trx).deleteById(id);
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      return true;
    } catch (error) {
      // If not using an external transaction, rollback
      if (!providedTrx) {
        await trx.rollback();
      }
      
      throw error;
    }
  }
  
  /**
   * Convert an order to shipment
   * @param {number} id - Order ID
   * @param {Object} shipmentData - Additional shipment data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created shipment
   */
  async convertOrderToShipment(id, shipmentData = {}, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Order.knex());
    
    try {
      // Get the order with order lines
      const order = await Order.query(trx)
        .findById(id)
        .withGraphFetched('[orderLines, customsInfo]');
      
      if (!order) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      // Create shipment data from order
      const newShipmentData = {
        order_id: order.id,
        reference: shipmentData.reference,
        shipment_type: order.isInternational() ? 'international' : 'domestic',
        service_level: order.service_type,
        origin_address_id: order.origin_address_id,
        destination_address_id: order.destination_address_id,
        carrier_id: shipmentData.carrier_id,
        transport_mode: shipmentData.transport_mode || (order.preferred_transport_modes && order.preferred_transport_modes[0]) || 'road',
        planned_pickup_date: shipmentData.planned_pickup_date,
        planned_delivery_date: shipmentData.planned_delivery_date || order.promised_date,
        status: 'planned',
        incoterm: order.incoterm,
        currency: order.currency,
        created_by: userId,
        updated_by: userId
      };
      
      // Calculate total weight and volume from order lines
      if (order.orderLines && order.orderLines.length > 0) {
        let totalWeight = 0;
        let totalVolume = 0;
        let packageCount = 0;
        
        for (const line of order.orderLines) {
          if (line.weight) {
            totalWeight += line.weight * line.quantity;
          }
          
          if (line.volume) {
            totalVolume += line.volume * line.quantity;
          }
          
          if (line.packages_count) {
            packageCount += line.packages_count;
          } else {
            packageCount += line.quantity;
          }
        }
        
        newShipmentData.total_weight = totalWeight;
        newShipmentData.weight_unit = order.orderLines[0].weight_unit;
        newShipmentData.total_volume = totalVolume;
        newShipmentData.volume_unit = order.orderLines[0].volume_unit;
        newShipmentData.package_count = packageCount;
      }
      
      // Create the shipment
      const shipment = await Shipment.query(trx).insert(newShipmentData);
      
      // Update order status
      await Order.query(trx).findById(id).patch({
        status: 'planned',
        updated_by: userId
      });
      
      // If customs info exists, link it to the shipment
      if (order.customsInfo) {
        await CustomsInfo.query(trx)
          .findById(order.customsInfo.id)
          .patch({
            shipment_id: shipment.id,
            updated_by: userId
          });
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the created shipment with relations
      return Shipment.query()
        .findById(shipment.id)
        .withGraphFetched(`[
          order,
          carrier,
          originAddress,
          destinationAddress,
          customsInfo
        ]`);
    } catch (error) {
      // If not using an external transaction, rollback
      if (!providedTrx) {
        await trx.rollback();
      }
      
      throw error;
    }
  }
  
  /**
   * Calculate estimated costs for an order
   * @param {number} id - Order ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Cost breakdown
   */
  async calculateOrderCosts(id, options = {}) {
    // Get the order with order lines
    const order = await Order.query()
      .findById(id)
      .withGraphFetched('[orderLines, customsInfo]');
    
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    // Initialize cost breakdown
    const costBreakdown = {
      freight_cost: 0,
      fuel_surcharge: 0,
      customs_cost: 0,
      insurance_cost: 0,
      other_costs: 0,
      total_cost: 0
    };
    
    // Calculate freight cost based on weight, volume, and distance
    // This would be more sophisticated in a real application,
    // using rate cards, contracts, and carrier APIs
    if (order.orderLines && order.orderLines.length > 0) {
      let totalWeight = 0;
      let totalVolume = 0;
      
      for (const line of order.orderLines) {
        if (line.weight) {
          totalWeight += line.weight * line.quantity;
        }
        
        if (line.volume) {
          totalVolume += line.volume * line.quantity;
        }
      }
      
      // Simple freight cost calculation
      const baseRate = 10; // Base rate per kg
      costBreakdown.freight_cost = totalWeight * baseRate;
      
      // Add volume-based cost
      const volumeRate = 100; // Rate per cubic meter
      costBreakdown.freight_cost += totalVolume * volumeRate;
      
      // Apply service type multiplier
      if (order.service_type === 'express') {
        costBreakdown.freight_cost *= 1.5;
      } else if (order.service_type === 'economy') {
        costBreakdown.freight_cost *= 0.8;
      }
      
      // Add fuel surcharge (typically a percentage of freight cost)
      costBreakdown.fuel_surcharge = costBreakdown.freight_cost * 0.1;
      
      // Add customs costs for international shipments
      if (order.isInternational()) {
        costBreakdown.customs_cost = costBreakdown.freight_cost * 0.05;
        
        // Add additional costs based on incoterm
        if (order.incoterm === 'DDP') {
          costBreakdown.customs_cost += 100; // Additional cost for DDP
        }
      }
      
      // Add insurance cost (typically a percentage of order value)
      if (order.total_value) {
        costBreakdown.insurance_cost = order.total_value * 0.01;
      }
      
      // Calculate total cost
      costBreakdown.total_cost = 
        costBreakdown.freight_cost +
        costBreakdown.fuel_surcharge +
        costBreakdown.customs_cost +
        costBreakdown.insurance_cost +
        costBreakdown.other_costs;
    }
    
    return costBreakdown;
  }
  
  /**
   * Get order statistics
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(filters = {}, options = {}) {
    const { 
      customer_id, 
      start_date,
      end_date
    } = filters;
    
    // Base query
    let query = Order.query();
    
    // Apply filters
    if (customer_id) {
      query = query.where('customer_id', customer_id);
    }
    
    if (start_date) {
      query = query.where('created_at', '>=', start_date);
    }
    
    if (end_date) {
      query = query.where('created_at', '<=', end_date);
    }
    
    // Get counts by status
    const statusCounts = await query.clone()
      .select('status')
      .count('id as count')
      .groupBy('status');
    
    // Get counts by service type
    const serviceTypeCounts = await query.clone()
      .select('service_type')
      .count('id as count')
      .groupBy('service_type');
    
    // Get counts by priority
    const priorityCounts = await query.clone()
      .select('priority')
      .count('id as count')
      .groupBy('priority');
    
    // Get international vs domestic counts
    const internationalCount = await query.clone()
      .whereNotNull('incoterm')
      .count('id as count')
      .first();
    
    const domesticCount = await query.clone()
      .whereNull('incoterm')
      .count('id as count')
      .first();
    
    // Format the results
    const statistics = {
      status: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {}),
      
      service_type: serviceTypeCounts.reduce((acc, item) => {
        acc[item.service_type] = parseInt(item.count, 10);
        return acc;
      }, {}),
      
      priority: priorityCounts.reduce((acc, item) => {
        acc[item.priority] = parseInt(item.count, 10);
        return acc;
      }, {}),
      
      shipping_type: {
        international: parseInt(internationalCount.count, 10),
        domestic: parseInt(domesticCount.count, 10)
      }
    };
    
    return statistics;
  }
}

module.exports = new OrderService();
