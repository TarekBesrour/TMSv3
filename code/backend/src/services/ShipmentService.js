/**
 * ShipmentService for managing shipments in the TMS system
 * 
 * This service provides business logic for shipment management,
 * supporting multimodal transport and international shipping.
 */

const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const TransportSegment = require('../models/TransportSegment');
const TransportUnit = require('../models/TransportUnit');
const CustomsInfo = require('../models/CustomsInfo');
const TrackingEvent = require('../models/TrackingEvent');
const ShipmentDocument = require('../models/ShipmentDocument');
const { transaction } = require('objection');

class ShipmentService {
  /**
   * Create a new shipment
   * @param {Object} shipmentData - Shipment data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created shipment
   */
  async createShipment(shipmentData, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Shipment.knex());
    
    try {
      // Set audit fields
      if (userId) {
        shipmentData.created_by = userId;
        shipmentData.updated_by = userId;
      }
      
      // Set default values if not provided
      if (!shipmentData.status) {
        shipmentData.status = 'draft';
      }
      
      if (!shipmentData.shipment_type) {
        // Determine if international based on addresses or incoterm
        if (shipmentData.incoterm) {
          shipmentData.shipment_type = 'international';
        } else {
          shipmentData.shipment_type = 'domestic';
        }
      }
      
      // Create the shipment
      const shipment = await Shipment.query(trx).insert(shipmentData);
      
      // Create customs info if international
      if (shipment.isInternational() && !shipmentData.customs_info_id) {
        await CustomsInfo.query(trx).insert({
          shipment_id: shipment.id,
          status: 'pending',
          origin_country: shipmentData.origin_country,
          destination_country: shipmentData.destination_country,
          incoterm: shipmentData.incoterm,
          created_by: userId,
          updated_by: userId
        });
      }
      
      // If order_id is provided, update order status
      if (shipmentData.order_id) {
        await Order.query(trx).findById(shipmentData.order_id).patch({
          status: 'planned',
          updated_by: userId
        });
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the created shipment with relations
      return this.getShipmentById(shipment.id, { withRelations: true });
    } catch (error) {
      // If not using an external transaction, rollback
      if (!providedTrx) {
        await trx.rollback();
      }
      
      throw error;
    }
  }
  
  /**
   * Get shipment by ID
   * @param {number} id - Shipment ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Shipment
   */
  async getShipmentById(id, options = {}) {
    const { withRelations = false } = options;
    
    let query = Shipment.query().findById(id);
    
    if (withRelations) {
      query = query.withGraphFetched(`[
        order,
        carrier,
        originAddress,
        destinationAddress,
        transportSegments.[
          carrier,
          vehicle,
          driver,
          originAddress,
          destinationAddress,
          trackingEvents
        ],
        transportUnits.[
          orderLines
        ],
        documents,
        trackingEvents,
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
   * Get shipments with filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Paginated shipments
   */
  async getShipments(filters = {}, pagination = {}, options = {}) {
    const { 
      order_id,
      carrier_id,
      status, 
      shipment_type,
      service_level,
      reference,
      carrier_reference,
      transport_mode,
      created_after,
      created_before,
      planned_pickup_after,
      planned_pickup_before,
      planned_delivery_after,
      planned_delivery_before,
      search
    } = filters;
    
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortDirection = 'desc' } = pagination;
    const { withRelations = false } = options;
    
    let query = Shipment.query();
    
    // Apply filters
    if (order_id) {
      query = query.where('order_id', order_id);
    }
    
    if (carrier_id) {
      query = query.where('carrier_id', carrier_id);
    }
    
    if (status) {
      if (Array.isArray(status)) {
        query = query.whereIn('status', status);
      } else {
        query = query.where('status', status);
      }
    }
    
    if (shipment_type) {
      if (Array.isArray(shipment_type)) {
        query = query.whereIn('shipment_type', shipment_type);
      } else {
        query = query.where('shipment_type', shipment_type);
      }
    }
    
    if (service_level) {
      if (Array.isArray(service_level)) {
        query = query.whereIn('service_level', service_level);
      } else {
        query = query.where('service_level', service_level);
      }
    }
    
    if (reference) {
      query = query.where('reference', 'like', `%${reference}%`);
    }
    
    if (carrier_reference) {
      query = query.where('carrier_reference', 'like', `%${carrier_reference}%`);
    }
    
    if (transport_mode) {
      query = query.where('transport_mode', transport_mode);
    }
    
    if (created_after) {
      query = query.where('created_at', '>=', created_after);
    }
    
    if (created_before) {
      query = query.where('created_at', '<=', created_before);
    }
    
    if (planned_pickup_after) {
      query = query.where('planned_pickup_date', '>=', planned_pickup_after);
    }
    
    if (planned_pickup_before) {
      query = query.where('planned_pickup_date', '<=', planned_pickup_before);
    }
    
    if (planned_delivery_after) {
      query = query.where('planned_delivery_date', '>=', planned_delivery_after);
    }
    
    if (planned_delivery_before) {
      query = query.where('planned_delivery_date', '<=', planned_delivery_before);
    }
    
    if (search) {
      query = query.where(builder => {
        builder.where('reference', 'like', `%${search}%`)
          .orWhere('carrier_reference', 'like', `%${search}%`)
          .orWhereExists(
            Shipment.relatedQuery('carrier')
              .where('name', 'like', `%${search}%`)
          )
          .orWhereExists(
            Shipment.relatedQuery('order')
              .where('reference', 'like', `%${search}%`)
          );
      });
    }
    
    // Apply relations if requested
    if (withRelations) {
      query = query.withGraphFetched(`[
        order,
        carrier,
        transportSegments.[carrier],
        transportUnits
      ]`);
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'carrier_name' ? 'carrier:name' : sortBy;
    query = query.orderBy(sortColumn, sortDirection);
    
    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);
    
    // Get total count for pagination
    const totalQuery = Shipment.query().count('id as count');
    
    // Apply the same filters to the count query
    if (order_id) {
      totalQuery.where('order_id', order_id);
    }
    
    if (carrier_id) {
      totalQuery.where('carrier_id', carrier_id);
    }
    
    if (status) {
      if (Array.isArray(status)) {
        totalQuery.whereIn('status', status);
      } else {
        totalQuery.where('status', status);
      }
    }
    
    // ... apply other filters to totalQuery
    
    const [shipments, countResult] = await Promise.all([
      query,
      totalQuery.first()
    ]);
    
    const total = parseInt(countResult.count, 10);
    
    return {
      data: shipments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
  
  /**
   * Update a shipment
   * @param {number} id - Shipment ID
   * @param {Object} shipmentData - Updated shipment data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Updated shipment
   */
  async updateShipment(id, shipmentData, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Shipment.knex());
    
    try {
      // Set audit fields
      if (userId) {
        shipmentData.updated_by = userId;
      }
      
      // Get current shipment
      const currentShipment = await Shipment.query(trx).findById(id);
      
      if (!currentShipment) {
        throw new Error(`Shipment with ID ${id} not found`);
      }
      
      // Update the shipment
      await Shipment.query(trx).findById(id).patch(shipmentData);
      
      // If status changed, create tracking event
      if (shipmentData.status && shipmentData.status !== currentShipment.status) {
        await TrackingEvent.query(trx).insert({
          shipment_id: id,
          event_type: 'status_update',
          description: `Status changed from ${currentShipment.status} to ${shipmentData.status}`,
          timestamp: new Date().toISOString(),
          status: shipmentData.status,
          source: 'system',
          created_by: userId,
          updated_by: userId
        });
        
        // If status changed to completed, update order status
        if (shipmentData.status === 'completed' && currentShipment.order_id) {
          await Order.query(trx).findById(currentShipment.order_id).patch({
            status: 'completed',
            updated_by: userId
          });
        }
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the updated shipment with relations
      return this.getShipmentById(id, { withRelations: true });
    } catch (error) {
      // If not using an external transaction, rollback
      if (!providedTrx) {
        await trx.rollback();
      }
      
      throw error;
    }
  }
  
  /**
   * Delete a shipment
   * @param {number} id - Shipment ID
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success indicator
   */
  async deleteShipment(id, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(Shipment.knex());
    
    try {
      // Get the shipment
      const shipment = await Shipment.query(trx).findById(id);
      
      if (!shipment) {
        throw new Error(`Shipment with ID ${id} not found`);
      }
      
      // Check if shipment can be deleted
      if (shipment.status === 'in_transit' || shipment.status === 'completed' || shipment.status === 'delivered') {
        throw new Error(`Cannot delete shipment with status ${shipment.status}`);
      }
      
      // Delete transport segments
      await TransportSegment.query(trx).delete().where('shipment_id', id);
      
      // Delete transport units
      await TransportUnit.query(trx).delete().where('shipment_id', id);
      
      // Delete tracking events
      await TrackingEvent.query(trx).delete().where('shipment_id', id);
      
      // Delete documents
      await ShipmentDocument.query(trx).delete().where('shipment_id', id);
      
      // Delete customs info
      await CustomsInfo.query(trx).delete().where('shipment_id', id);
      
      // Delete the shipment
      await Shipment.query(trx).deleteById(id);
      
      // If order_id exists, update order status
      if (shipment.order_id) {
        await Order.query(trx).findById(shipment.order_id).patch({
          status: 'confirmed', // Revert to confirmed status
          updated_by: userId
        });
      }
      
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
   * Add a transport segment to a shipment
   * @param {number} shipmentId - Shipment ID
   * @param {Object} segmentData - Transport segment data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created transport segment
   */
  async addTransportSegment(shipmentId, segmentData, options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(TransportSegment.knex());
    
    try {
      // Get the shipment
      const shipment = await Shipment.query(trx).findById(shipmentId);
      
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }
      
      // Set shipment_id
      segmentData.shipment_id = shipmentId;
      
      // Set audit fields
      if (userId) {
        segmentData.created_by = userId;
        segmentData.updated_by = userId;
      }
      
      // Set default status if not provided
      if (!segmentData.status) {
        segmentData.status = 'planned';
      }
      
      // Get the sequence number
      const maxSequence = await TransportSegment.query(trx)
        .where('shipment_id', shipmentId)
        .max('sequence_number as max')
        .first();
      
      segmentData.sequence_number = maxSequence.max ? maxSequence.max + 1 : 1;
      
      // Create the transport segment
      const segment = await TransportSegment.query(trx).insert(segmentData);
      
      // Update shipment to multimodal if this is a second segment with different mode
      if (segmentData.sequence_number > 1 && segmentData.transport_mode !== shipment.transport_mode) {
        await Shipment.query(trx).findById(shipmentId).patch({
          transport_mode: 'multimodal',
          updated_by: userId
        });
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the created segment with relations
      return TransportSegment.query()
        .findById(segment.id)
        .withGraphFetched(`[
          shipment,
          carrier,
          vehicle,
          driver,
          originAddress,
          destinationAddress
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
   * Add a transport unit to a shipment
   * @param {number} shipmentId - Shipment ID
   * @param {Object} unitData - Transport unit data
   * @param {Array} orderLineIds - Order line IDs to associate with the unit
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created transport unit
   */
  async addTransportUnit(shipmentId, unitData, orderLineIds = [], options = {}) {
    const { trx: providedTrx, userId } = options;
    
    const trx = providedTrx || await transaction.start(TransportUnit.knex());
    
    try {
      // Get the shipment
      const shipment = await Shipment.query(trx).findById(shipmentId);
      
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }
      
      // Set shipment_id
      unitData.shipment_id = shipmentId;
      
      // Set audit fields
      if (userId) {
        unitData.created_by = userId;
        unitData.updated_by = userId;
      }
      
      // Set default status if not provided
      if (!unitData.status) {
        unitData.status = 'empty';
      }
      
      // Create the transport unit
      const unit = await TransportUnit.query(trx).insert(unitData);
      
      // Associate order lines if provided
      if (orderLineIds && orderLineIds.length > 0) {
        const unitContents = orderLineIds.map(orderLineId => ({
          transport_unit_id: unit.id,
          order_line_id: orderLineId,
          quantity: 1 // Default quantity, would be specified in real app
        }));
        
        await trx.raw(
          `INSERT INTO transport_unit_contents (transport_unit_id, order_line_id, quantity) VALUES ${
            unitContents.map(() => '(?, ?, ?)').join(', ')
          }`,
          unitContents.flatMap(content => [
            content.transport_unit_id,
            content.order_line_id,
            content.quantity
          ])
        );
        
        // Update unit status to loaded
        await TransportUnit.query(trx).findById(unit.id).patch({
          status: 'loaded',
          loaded_at: new Date().toISOString(),
          updated_by: userId
        });
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the created unit with relations
      return TransportUnit.query()
        .findById(unit.id)
        .withGraphFetched(`[
          shipment,
          orderLines
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
   * Add a tracking event to a shipment
   * @param {number} shipmentId - Shipment ID
   * @param {Object} eventData - Tracking event data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created tracking event
   */
  async addTrackingEvent(shipmentId, eventData, options = {}) {
    const { trx: providedTrx, userId, updateShipmentStatus = true } = options;
    
    const trx = providedTrx || await transaction.start(TrackingEvent.knex());
    
    try {
      // Get the shipment
      const shipment = await Shipment.query(trx).findById(shipmentId);
      
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }
      
      // Set shipment_id
      eventData.shipment_id = shipmentId;
      
      // Set audit fields
      if (userId) {
        eventData.created_by = userId;
        eventData.updated_by = userId;
      }
      
      // Set timestamp if not provided
      if (!eventData.timestamp) {
        eventData.timestamp = new Date().toISOString();
      }
      
      // Create the tracking event
      const event = await TrackingEvent.query(trx).insert(eventData);
      
      // Update shipment status based on event type if requested
      if (updateShipmentStatus) {
        let newStatus = null;
        
        switch (eventData.event_type) {
          case 'pickup_completed':
            newStatus = 'in_transit';
            break;
          case 'delivery_completed':
            newStatus = 'delivered';
            break;
          case 'customs_hold':
            newStatus = 'customs_hold';
            break;
          case 'customs_cleared':
            newStatus = 'in_transit';
            break;
          case 'exception':
            newStatus = 'exception';
            break;
        }
        
        if (newStatus) {
          await Shipment.query(trx).findById(shipmentId).patch({
            status: newStatus,
            updated_by: userId
          });
          
          // If delivery completed, update actual delivery date
          if (eventData.event_type === 'delivery_completed') {
            await Shipment.query(trx).findById(shipmentId).patch({
              actual_delivery_date: eventData.timestamp,
              updated_by: userId
            });
            
            // If order exists, update order status
            if (shipment.order_id) {
              await Order.query(trx).findById(shipment.order_id).patch({
                status: 'completed',
                updated_by: userId
              });
            }
          }
          
          // If pickup completed, update actual pickup date
          if (eventData.event_type === 'pickup_completed') {
            await Shipment.query(trx).findById(shipmentId).patch({
              actual_pickup_date: eventData.timestamp,
              updated_by: userId
            });
          }
        }
      }
      
      // If not using an external transaction, commit
      if (!providedTrx) {
        await trx.commit();
      }
      
      // Return the created event with relations
      return TrackingEvent.query()
        .findById(event.id)
        .withGraphFetched(`[
          shipment,
          transportSegment,
          transportUnit
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
   * Calculate estimated arrival date for a shipment
   * @param {number} id - Shipment ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} ETA information
   */
  async calculateETA(id, options = {}) {
    // Get the shipment with transport segments
    const shipment = await Shipment.query()
      .findById(id)
      .withGraphFetched('[transportSegments, trackingEvents]');
    
    if (!shipment) {
      throw new Error(`Shipment with ID ${id} not found`);
    }
    
    // Initialize ETA information
    const etaInfo = {
      estimated_arrival_date: null,
      confidence: 'medium', // low, medium, high
      delay: 0, // in minutes
      factors: []
    };
    
    // If shipment is already delivered or completed, use actual delivery date
    if (shipment.status === 'delivered' || shipment.status === 'completed') {
      if (shipment.actual_delivery_date) {
        etaInfo.estimated_arrival_date = shipment.actual_delivery_date;
        etaInfo.confidence = 'high';
        
        // Calculate delay if planned delivery date exists
        if (shipment.planned_delivery_date) {
          const planned = new Date(shipment.planned_delivery_date);
          const actual = new Date(shipment.actual_delivery_date);
          etaInfo.delay = Math.round((actual - planned) / (1000 * 60));
        }
        
        return etaInfo;
      }
    }
    
    // If no transport segments, use planned delivery date
    if (!shipment.transportSegments || shipment.transportSegments.length === 0) {
      if (shipment.planned_delivery_date) {
        etaInfo.estimated_arrival_date = shipment.planned_delivery_date;
        etaInfo.confidence = 'low';
        etaInfo.factors.push('No transport segments available');
        
        return etaInfo;
      } else {
        throw new Error('Cannot calculate ETA: No planned delivery date or transport segments');
      }
    }
    
    // Sort segments by sequence number
    const sortedSegments = [...shipment.transportSegments].sort((a, b) => a.sequence_number - b.sequence_number);
    
    // Get the last segment
    const lastSegment = sortedSegments[sortedSegments.length - 1];
    
    // If last segment has planned arrival date, use it as base
    if (lastSegment.planned_arrival_date) {
      etaInfo.estimated_arrival_date = lastSegment.planned_arrival_date;
      
      // Check if any segments are delayed
      let totalDelay = 0;
      let delayedSegments = 0;
      
      for (const segment of sortedSegments) {
        if (segment.status === 'delayed') {
          delayedSegments++;
          etaInfo.factors.push(`Segment ${segment.sequence_number} is delayed`);
          
          // If actual departure exists but is later than planned, add delay
          if (segment.planned_departure_date && segment.actual_departure_date) {
            const plannedDeparture = new Date(segment.planned_departure_date);
            const actualDeparture = new Date(segment.actual_departure_date);
            const departureDelay = Math.max(0, (actualDeparture - plannedDeparture) / (1000 * 60));
            totalDelay += departureDelay;
          }
        }
      }
      
      // Adjust ETA based on delays
      if (totalDelay > 0) {
        const estimatedArrival = new Date(etaInfo.estimated_arrival_date);
        estimatedArrival.setMinutes(estimatedArrival.getMinutes() + totalDelay);
        etaInfo.estimated_arrival_date = estimatedArrival.toISOString();
        etaInfo.delay = totalDelay;
      }
      
      // Set confidence based on shipment status and delays
      if (shipment.status === 'in_transit') {
        if (delayedSegments > 0) {
          etaInfo.confidence = 'low';
        } else {
          etaInfo.confidence = 'medium';
        }
      } else if (shipment.status === 'planned' || shipment.status === 'booked') {
        etaInfo.confidence = 'low';
      }
      
      // Check latest tracking events for additional factors
      if (shipment.trackingEvents && shipment.trackingEvents.length > 0) {
        const latestEvents = [...shipment.trackingEvents]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3);
        
        for (const event of latestEvents) {
          if (event.event_type === 'exception' || event.event_type === 'customs_hold') {
            etaInfo.confidence = 'low';
            etaInfo.factors.push(`Recent ${event.event_type} event: ${event.description || event.event_type}`);
          }
        }
      }
    } else {
      // Fallback to shipment planned delivery date
      if (shipment.planned_delivery_date) {
        etaInfo.estimated_arrival_date = shipment.planned_delivery_date;
        etaInfo.confidence = 'low';
        etaInfo.factors.push('Using planned delivery date as fallback');
      } else {
        throw new Error('Cannot calculate ETA: No planned arrival dates available');
      }
    }
    
    return etaInfo;
  }
  
  /**
   * Get shipment statistics
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Shipment statistics
   */
  async getShipmentStatistics(filters = {}, options = {}) {
    const { 
      carrier_id, 
      start_date,
      end_date
    } = filters;
    
    // Base query
    let query = Shipment.query();
    
    // Apply filters
    if (carrier_id) {
      query = query.where('carrier_id', carrier_id);
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
    
    // Get counts by shipment type
    const shipmentTypeCounts = await query.clone()
      .select('shipment_type')
      .count('id as count')
      .groupBy('shipment_type');
    
    // Get counts by transport mode
    const transportModeCounts = await query.clone()
      .select('transport_mode')
      .count('id as count')
      .groupBy('transport_mode');
    
    // Get on-time delivery percentage
    const totalDelivered = await query.clone()
      .whereIn('status', ['delivered', 'completed'])
      .count('id as count')
      .first();
    
    const onTimeDelivered = await query.clone()
      .whereIn('status', ['delivered', 'completed'])
      .whereRaw('actual_delivery_date <= planned_delivery_date')
      .count('id as count')
      .first();
    
    // Format the results
    const statistics = {
      status: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10);
        return acc;
      }, {}),
      
      shipment_type: shipmentTypeCounts.reduce((acc, item) => {
        acc[item.shipment_type] = parseInt(item.count, 10);
        return acc;
      }, {}),
      
      transport_mode: transportModeCounts.reduce((acc, item) => {
        acc[item.transport_mode] = parseInt(item.count, 10);
        return acc;
      }, {}),
      
      delivery_performance: {
        total_delivered: parseInt(totalDelivered.count, 10),
        on_time_delivered: parseInt(onTimeDelivered.count, 10),
        on_time_percentage: totalDelivered.count > 0 
          ? Math.round((onTimeDelivered.count / totalDelivered.count) * 100) 
          : 0
      }
    };
    
    return statistics;
  }
}

module.exports = new ShipmentService();
