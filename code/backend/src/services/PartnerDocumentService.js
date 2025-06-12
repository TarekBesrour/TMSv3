/**
 * PartnerDocument Service for managing documents associated with partners in the TMS system
 * 
 * This service provides CRUD operations and business logic for partner documents.
 */

const PartnerDocument = require('../models/PartnerDocument');
const { NotFoundError, ValidationError } = require('objection');
const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdir = util.promisify(fs.mkdir);

class PartnerDocumentService {
  /**
   * Get all documents with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for document fields
   * @param {number} options.partnerId - Filter by partner ID
   * @param {number} options.contractId - Filter by contract ID
   * @param {string} options.type - Filter by document type
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Documents with pagination info
   */
  async getDocuments(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      contractId = null,
      type = '',
      status = '',
      sortBy = 'upload_date',
      sortOrder = 'desc'
    } = options;

    // Start building query
    let query = PartnerDocument.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply contract filter if provided
    if (contractId) {
      query = query.where('contract_id', contractId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('name', 'ilike', `%${search}%`)
          .orWhere('file_path', 'ilike', `%${search}%`);
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
    const documents = await query.withGraphFetched('[partner, contract]');

    // Return documents with pagination info
    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a document by ID
   * 
   * @param {number} id - Document ID
   * @param {Object} options - Query options
   * @param {boolean} options.withRelations - Include relations
   * @returns {Promise<Object>} Document
   * @throws {NotFoundError} If document not found
   */
  async getDocumentById(id, options = {}) {
    const {
      withRelations = false
    } = options;

    let query = PartnerDocument.query().findById(id);

    // Include relations if requested
    if (withRelations) {
      query = query.withGraphFetched('[partner, contract]');
    }

    const document = await query;

    if (!document) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Get documents by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.type - Filter by document type
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Documents
   */
  async getDocumentsByPartnerId(partnerId, options = {}) {
    const {
      type = '',
      status = 'active'
    } = options;

    let query = PartnerDocument.query()
      .where('partner_id', partnerId)
      .orderBy('upload_date', 'desc');

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
   * Upload a new document
   * 
   * @param {Object} documentData - Document metadata
   * @param {Object} file - File object
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created document
   */
  async uploadDocument(documentData, file, userId) {
    // Set audit fields
    documentData.created_by = userId;
    documentData.updated_by = userId;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'partner_documents');
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const filename = `${documentData.partner_id}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    
    // Save file
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Set document data
    documentData.file_path = `/uploads/partner_documents/${filename}`;
    documentData.mime_type = file.mimetype;
    documentData.size = file.size;
    documentData.upload_date = new Date().toISOString();
    
    // Create document record
    const document = await PartnerDocument.query().insert(documentData);

    return await this.getDocumentById(document.id, { withRelations: true });
  }

  /**
   * Update a document
   * 
   * @param {number} id - Document ID
   * @param {Object} documentData - Document metadata
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Updated document
   * @throws {NotFoundError} If document not found
   */
  async updateDocument(id, documentData, userId) {
    // Set audit fields
    documentData.updated_by = userId;

    // Start transaction
    const document = await PartnerDocument.transaction(async trx => {
      // Check if document exists
      const existingDocument = await PartnerDocument.query(trx).findById(id);
      
      if (!existingDocument) {
        throw new NotFoundError(`Document with ID ${id} not found`);
      }
      
      // Update document
      return await PartnerDocument.query(trx)
        .patchAndFetchById(id, documentData);
    });

    return await this.getDocumentById(document.id, { withRelations: true });
  }

  /**
   * Delete a document
   * 
   * @param {number} id - Document ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If document not found
   */
  async deleteDocument(id) {
    // Start transaction
    return await PartnerDocument.transaction(async trx => {
      // Check if document exists
      const document = await PartnerDocument.query(trx).findById(id);
      
      if (!document) {
        throw new NotFoundError(`Document with ID ${id} not found`);
      }
      
      // Delete physical file
      try {
        const filePath = path.join(process.cwd(), document.file_path.replace(/^\//, ''));
        await fs.promises.unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete file: ${error.message}`);
        // Continue with database deletion even if file deletion fails
      }
      
      // Delete document record
      const deleted = await PartnerDocument.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Get documents that are about to expire
   * 
   * @param {Object} options - Query options
   * @param {number} options.daysThreshold - Days threshold for expiration (default: 30)
   * @returns {Promise<Array>} Documents about to expire
   */
  async getDocumentsAboutToExpire(options = {}) {
    const {
      daysThreshold = 30
    } = options;

    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return await PartnerDocument.query()
      .where('status', 'active')
      .whereNotNull('expiry_date')
      .where('expiry_date', '<=', thresholdDate.toISOString().split('T')[0])
      .where('expiry_date', '>=', today.toISOString().split('T')[0])
      .withGraphFetched('[partner, contract]')
      .orderBy('expiry_date');
  }

  /**
   * Get expired documents
   * 
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of documents to return (default: 100)
   * @returns {Promise<Array>} Expired documents
   */
  async getExpiredDocuments(options = {}) {
    const {
      limit = 100
    } = options;

    const today = new Date();

    return await PartnerDocument.query()
      .where('status', 'active')
      .whereNotNull('expiry_date')
      .where('expiry_date', '<', today.toISOString().split('T')[0])
      .withGraphFetched('[partner, contract]')
      .orderBy('expiry_date', 'desc')
      .limit(limit);
  }
}

module.exports = new PartnerDocumentService();
