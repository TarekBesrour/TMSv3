/**
 * Contract Service for managing partner contracts in the TMS system
 * 
 * This service provides CRUD operations and business logic for contracts.
 */

const Contract = require('../models/Contract');
const { NotFoundError, ValidationError } = require('objection');

class ContractService {
  /**
   * Get all contracts with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for contract fields
   * @param {number} options.partnerId - Filter by partner ID
   * @param {string} options.type - Filter by contract type
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Contracts with pagination info
   */
  async getContracts(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      type = '',
      status = '',
      sortBy = 'start_date',
      sortOrder = 'desc'
    } = options;

    // Start building query
    let query = Contract.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('reference', 'ilike', `%${search}%`)
          .orWhere('terms', 'ilike', `%${search}%`);
      });
    }

    // Apply type filter if provided
    if (type) {
      query = query.where('type', type);
    }

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    }

    // Count total before pagination
    const total = await query.clone().resultSize();

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    // Execute query with related partner
    const contracts = await query.withGraphFetched('partner');

    // Return contracts with pagination info
    return {
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a contract by ID
   * 
   * @param {number} id - Contract ID
   * @param {Object} options - Query options
   * @param {boolean} options.withRelations - Include relations
   * @returns {Promise<Object>} Contract
   * @throws {NotFoundError} If contract not found
   */
  async getContractById(id, options = {}) {
    const {
      withRelations = false
    } = options;

    let query = Contract.query().findById(id);

    // Include relations if requested
    if (withRelations) {
      query = query.withGraphFetched('[partner, documents]');
    }

    const contract = await query;

    if (!contract) {
      throw new NotFoundError(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  /**
   * Get contracts by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.type - Filter by contract type
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Contracts
   */
  async getContractsByPartnerId(partnerId, options = {}) {
    const {
      type = '',
      status = ''
    } = options;

    let query = Contract.query()
      .where('partner_id', partnerId)
      .orderBy('start_date', 'desc');

    // Apply type filter if provided
    if (type) {
      query = query.where('type', type);
    }

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    }

    return await query;
  }

  /**
   * Create a new contract
   * 
   * @param {Object} contractData - Contract data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created contract
   */
  async createContract(contractData, userId) {
    // Set audit fields
    contractData.created_by = userId;
    contractData.updated_by = userId;

    // Create contract
    const contract = await Contract.query().insert(contractData);

    return await this.getContractById(contract.id, { withRelations: true });
  }

  /**
   * Update a contract
   * 
   * @param {number} id - Contract ID
   * @param {Object} contractData - Contract data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Updated contract
   * @throws {NotFoundError} If contract not found
   */
  async updateContract(id, contractData, userId) {
    // Set audit fields
    contractData.updated_by = userId;

    // Start transaction
    const contract = await Contract.transaction(async trx => {
      // Check if contract exists
      const existingContract = await Contract.query(trx).findById(id);
      
      if (!existingContract) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }
      
      // Update contract
      return await Contract.query(trx)
        .patchAndFetchById(id, contractData);
    });

    return await this.getContractById(contract.id, { withRelations: true });
  }

  /**
   * Delete a contract
   * 
   * @param {number} id - Contract ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If contract not found
   */
  async deleteContract(id) {
    // Start transaction
    return await Contract.transaction(async trx => {
      // Check if contract exists
      const contract = await Contract.query(trx).findById(id);
      
      if (!contract) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }
      
      // Delete contract
      const deleted = await Contract.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Get contracts that are about to expire
   * 
   * @param {Object} options - Query options
   * @param {number} options.daysThreshold - Days threshold for expiration (default: 30)
   * @returns {Promise<Array>} Contracts about to expire
   */
  async getContractsAboutToExpire(options = {}) {
    const {
      daysThreshold = 30
    } = options;

    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return await Contract.query()
      .where('status', 'active')
      .where('end_date', '<=', thresholdDate.toISOString().split('T')[0])
      .where('end_date', '>=', today.toISOString().split('T')[0])
      .withGraphFetched('partner')
      .orderBy('end_date');
  }

  /**
   * Get expired contracts
   * 
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of contracts to return (default: 100)
   * @returns {Promise<Array>} Expired contracts
   */
  async getExpiredContracts(options = {}) {
    const {
      limit = 100
    } = options;

    const today = new Date();

    return await Contract.query()
      .where('status', 'active')
      .where('end_date', '<', today.toISOString().split('T')[0])
      .withGraphFetched('partner')
      .orderBy('end_date', 'desc')
      .limit(limit);
  }
}

module.exports = new ContractService();
