/**
 * ContractService for managing contracts and contract lines in the TMS
 * Provides methods for creating, retrieving, updating, and searching contracts
 */
const Contract = require('../models/Contract');
const ContractLine = require('../models/ContractLine');
const { transaction } = require('objection');
const { NotFoundError, ValidationError } = require('../utils/errors');

class ContractService {
  /**
   * Create a new contract with optional contract lines
   * @param {Object} contractData - Data for the new contract
   * @param {Array} contractLines - Optional array of contract lines
   * @returns {Promise<Object>} - Created contract with lines
   */
  async createContract(contractData, contractLines = []) {
    try {
      return await transaction(Contract.knex(), async (trx) => {
        // Create the contract
        const contract = await Contract.query(trx).insert(contractData);
        
        // Create contract lines if provided
        if (contractLines && contractLines.length > 0) {
          const lines = contractLines.map(line => ({
            ...line,
            contract_id: contract.id
          }));
          
          await ContractLine.query(trx).insert(lines);
        }
        
        // Return contract with lines
        return await Contract.query(trx)
          .findById(contract.id)
          .withGraphFetched('contractLines');
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid contract data', error.data);
      }
      throw error;
    }
  }

  /**
   * Get contract by ID
   * @param {Number} id - Contract ID
   * @param {Boolean} withRelations - Whether to include related data
   * @returns {Promise<Object>} - Contract object
   */
  async getContractById(id, withRelations = false) {
    let query = Contract.query().findById(id);
    
    if (withRelations) {
      query = query.withGraphFetched('[partner, contractLines, documents]');
    }
    
    const contract = await query;
    
    if (!contract) {
      throw new NotFoundError(`Contract with ID ${id} not found`);
    }
    
    return contract;
  }

  /**
   * Update an existing contract
   * @param {Number} id - Contract ID
   * @param {Object} contractData - Updated contract data
   * @returns {Promise<Object>} - Updated contract
   */
  async updateContract(id, contractData) {
    try {
      const updatedContract = await Contract.query()
        .patchAndFetchById(id, contractData);
      
      if (!updatedContract) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }
      
      return updatedContract;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid contract data', error.data);
      }
      throw error;
    }
  }

  /**
   * Delete a contract and its lines
   * @param {Number} id - Contract ID
   * @returns {Promise<Boolean>} - Success status
   */
  async deleteContract(id) {
    return await transaction(Contract.knex(), async (trx) => {
      // Delete contract lines first
      await ContractLine.query(trx)
        .delete()
        .where('contract_id', id);
      
      // Delete the contract
      const numDeleted = await Contract.query(trx).deleteById(id);
      
      if (numDeleted === 0) {
        throw new NotFoundError(`Contract with ID ${id} not found`);
      }
      
      return true;
    });
  }

  /**
   * Add a line to an existing contract
   * @param {Number} contractId - Contract ID
   * @param {Object} lineData - Contract line data
   * @returns {Promise<Object>} - Created contract line
   */
  async addContractLine(contractId, lineData) {
    try {
      // Check if contract exists
      const contract = await Contract.query().findById(contractId);
      
      if (!contract) {
        throw new NotFoundError(`Contract with ID ${contractId} not found`);
      }
      
      // Create the contract line
      return await ContractLine.query().insert({
        ...lineData,
        contract_id: contractId
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid contract line data', error.data);
      }
      throw error;
    }
  }

  /**
   * Update a contract line
   * @param {Number} lineId - Contract line ID
   * @param {Object} lineData - Updated line data
   * @returns {Promise<Object>} - Updated contract line
   */
  async updateContractLine(lineId, lineData) {
    try {
      const updatedLine = await ContractLine.query()
        .patchAndFetchById(lineId, lineData);
      
      if (!updatedLine) {
        throw new NotFoundError(`Contract line with ID ${lineId} not found`);
      }
      
      return updatedLine;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid contract line data', error.data);
      }
      throw error;
    }
  }

  /**
   * Delete a contract line
   * @param {Number} lineId - Contract line ID
   * @returns {Promise<Boolean>} - Success status
   */
  async deleteContractLine(lineId) {
    const numDeleted = await ContractLine.query().deleteById(lineId);
    
    if (numDeleted === 0) {
      throw new NotFoundError(`Contract line with ID ${lineId} not found`);
    }
    
    return true;
  }

  /**
   * Search for contracts based on criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchContracts(criteria = {}, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    
    let query = Contract.query();
    
    // Apply filters
    if (criteria.contract_type) {
      query = query.where('contract_type', criteria.contract_type);
    }
    
    if (criteria.partner_id) {
      query = query.where('partner_id', criteria.partner_id);
    }
    
    if (criteria.status) {
      query = query.where('status', criteria.status);
    }
    
    if (criteria.is_active !== undefined) {
      query = query.where('is_active', criteria.is_active);
    }
    
    // Date range filters
    if (criteria.valid_from) {
      query = query.where('valid_from', '>=', criteria.valid_from);
    }
    
    if (criteria.valid_to) {
      query = query.where('valid_to', '<=', criteria.valid_to);
    }
    
    // Check for current validity
    if (criteria.currently_valid) {
      const now = new Date().toISOString();
      query = query.where('valid_from', '<=', now)
        .where(builder => {
          builder.whereNull('valid_to').orWhere('valid_to', '>=', now);
        })
        .where('is_active', true)
        .where('status', 'active');
    }
    
    // Check for expiring contracts
    if (criteria.expiring_within_days) {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + criteria.expiring_within_days);
      
      query = query.where('valid_to', '>=', now.toISOString())
        .where('valid_to', '<=', futureDate.toISOString())
        .where('is_active', true)
        .where('status', 'active');
    }
    
    // Text search
    if (criteria.search_term) {
      query = query.where(builder => {
        builder.where('contract_reference', 'like', `%${criteria.search_term}%`)
          .orWhere('general_conditions', 'like', `%${criteria.search_term}%`)
          .orWhere('notes', 'like', `%${criteria.search_term}%`);
      });
    }
    
    // Include relations if requested
    if (criteria.with_relations) {
      query = query.withGraphFetched('[partner, contractLines]');
    }
    
    // Apply pagination
    const results = await query.page(page - 1, pageSize);
    
    return {
      data: results.results,
      pagination: {
        page,
        pageSize,
        total: results.total,
        totalPages: Math.ceil(results.total / pageSize)
      }
    };
  }

  /**
   * Find applicable contract lines for given parameters
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} - List of applicable contract lines
   */
  async findApplicableContractLines(params) {
    // First, find valid contracts for the partner
    const validContracts = await Contract.query()
      .where('partner_id', params.partner_id)
      .where('contract_type', params.contract_type)
      .where('is_active', true)
      .where('status', 'active')
      .where('valid_from', '<=', new Date().toISOString())
      .where(builder => {
        builder.whereNull('valid_to').orWhere('valid_to', '>=', new Date().toISOString());
      });
    
    if (validContracts.length === 0) {
      return [];
    }
    
    const contractIds = validContracts.map(contract => contract.id);
    
    // Find applicable contract lines
    const query = ContractLine.query()
      .whereIn('contract_id', contractIds)
      .where('is_active', true);
    
    // Apply filters based on params
    if (params.service_type) {
      query.where('service_type', params.service_type);
    }
    
    if (params.transport_mode) {
      query.where(builder => {
        builder.where('transport_mode', params.transport_mode)
          .orWhere('transport_mode', 'multimodal')
          .orWhereNull('transport_mode');
      });
    }
    
    if (params.origin_country) {
      query.where(builder => {
        builder.where('origin_country', params.origin_country)
          .orWhereNull('origin_country');
      });
    }
    
    if (params.destination_country) {
      query.where(builder => {
        builder.where('destination_country', params.destination_country)
          .orWhereNull('destination_country');
      });
    }
    
    // Get contract lines with related contract and rate
    const contractLines = await query.withGraphFetched('[contract, rate]');
    
    // Filter lines that are truly applicable by calling isApplicable method
    return contractLines.filter(line => line.isApplicable(params));
  }

  /**
   * Calculate price for given parameters using applicable contract lines
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} - Calculated price details
   */
  async calculateContractPrice(params) {
    const applicableLines = await this.findApplicableContractLines(params);
    
    if (applicableLines.length === 0) {
      throw new Error('No applicable contract lines found for the given parameters');
    }
    
    // Sort by priority (lower number = higher priority)
    applicableLines.sort((a, b) => a.priority - b.priority);
    
    // Use the highest priority line
    const bestLine = applicableLines[0];
    
    try {
      const priceDetails = bestLine.calculatePrice(params);
      
      return {
        ...priceDetails,
        contract_id: bestLine.contract_id,
        contract_reference: bestLine.contract ? bestLine.contract.contract_reference : null,
        service_type: bestLine.service_type
      };
    } catch (error) {
      throw new Error(`Failed to calculate price with contract line ${bestLine.id}: ${error.message}`);
    }
  }

  /**
   * Get contracts expiring soon
   * @param {Number} daysThreshold - Days threshold for expiration warning
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Expiring contracts with pagination
   */
  async getExpiringContracts(daysThreshold = 30, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysThreshold);
    
    const query = Contract.query()
      .where('valid_to', '>=', now.toISOString())
      .where('valid_to', '<=', futureDate.toISOString())
      .where('is_active', true)
      .where('status', 'active')
      .withGraphFetched('partner');
    
    // Apply pagination
    const results = await query.page(page - 1, pageSize);
    
    return {
      data: results.results,
      pagination: {
        page,
        pageSize,
        total: results.total,
        totalPages: Math.ceil(results.total / pageSize)
      }
    };
  }
}

module.exports = new ContractService();
