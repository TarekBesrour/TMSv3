/**
 * Contact Service for managing partner contacts in the TMS system
 * 
 * This service provides CRUD operations and business logic for contacts.
 */

const Contact = require('../models/Contact');
const { NotFoundError, ValidationError } = require('objection');

class ContactService {
  /**
   * Get all contacts with pagination, filtering and sorting
   * 
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.search - Search term for name, email, etc.
   * @param {number} options.partnerId - Filter by partner ID
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (asc or desc)
   * @returns {Promise<Object>} Contacts with pagination info
   */
  async getContacts(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      partnerId = null,
      status = '',
      sortBy = 'last_name',
      sortOrder = 'asc'
    } = options;

    // Start building query
    let query = Contact.query();

    // Apply partner filter if provided
    if (partnerId) {
      query = query.where('partner_id', partnerId);
    }

    // Apply search filter if provided
    if (search) {
      query = query.where(builder => {
        builder.where('first_name', 'ilike', `%${search}%`)
          .orWhere('last_name', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`)
          .orWhere('phone', 'ilike', `%${search}%`);
      });
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

    // Execute query
    const contacts = await query;

    // Return contacts with pagination info
    return {
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a contact by ID
   * 
   * @param {number} id - Contact ID
   * @param {Object} options - Query options
   * @param {boolean} options.withPartner - Include partner relation
   * @returns {Promise<Object>} Contact
   * @throws {NotFoundError} If contact not found
   */
  async getContactById(id, options = {}) {
    const {
      withPartner = false
    } = options;

    let query = Contact.query().findById(id);

    // Include partner relation if requested
    if (withPartner) {
      query = query.withGraphFetched('partner');
    }

    const contact = await query;

    if (!contact) {
      throw new NotFoundError(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  /**
   * Get contacts by partner ID
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Contacts
   */
  async getContactsByPartnerId(partnerId, options = {}) {
    const {
      status = 'active'
    } = options;

    let query = Contact.query()
      .where('partner_id', partnerId)
      .orderBy('is_primary', 'desc')
      .orderBy('last_name')
      .orderBy('first_name');

    // Apply status filter if provided
    if (status) {
      query = query.where('status', status);
    }

    return await query;
  }

  /**
   * Create a new contact
   * 
   * @param {Object} contactData - Contact data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Created contact
   */
  async createContact(contactData, userId) {
    // Set audit fields
    contactData.created_by = userId;
    contactData.updated_by = userId;

    // If this is a primary contact, ensure other contacts for this partner are not primary
    if (contactData.is_primary) {
      await this.handlePrimaryContact(contactData.partner_id);
    }

    // Create contact
    const contact = await Contact.query().insert(contactData);

    return contact;
  }

  /**
   * Update a contact
   * 
   * @param {number} id - Contact ID
   * @param {Object} contactData - Contact data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} Updated contact
   * @throws {NotFoundError} If contact not found
   */
  async updateContact(id, contactData, userId) {
    // Set audit fields
    contactData.updated_by = userId;

    // Start transaction
    const contact = await Contact.transaction(async trx => {
      // Check if contact exists
      const existingContact = await Contact.query(trx).findById(id);
      
      if (!existingContact) {
        throw new NotFoundError(`Contact with ID ${id} not found`);
      }
      
      // If this is being set as primary, ensure other contacts for this partner are not primary
      if (contactData.is_primary && !existingContact.is_primary) {
        await this.handlePrimaryContact(existingContact.partner_id, trx);
      }
      
      // Update contact
      return await Contact.query(trx)
        .patchAndFetchById(id, contactData);
    });

    return contact;
  }

  /**
   * Delete a contact
   * 
   * @param {number} id - Contact ID
   * @returns {Promise<boolean>} True if deleted
   * @throws {NotFoundError} If contact not found
   */
  async deleteContact(id) {
    // Start transaction
    return await Contact.transaction(async trx => {
      // Check if contact exists
      const contact = await Contact.query(trx).findById(id);
      
      if (!contact) {
        throw new NotFoundError(`Contact with ID ${id} not found`);
      }
      
      // Delete contact
      const deleted = await Contact.query(trx)
        .deleteById(id);
      
      return deleted > 0;
    });
  }

  /**
   * Handle primary contact logic
   * 
   * @param {number} partnerId - Partner ID
   * @param {Object} trx - Transaction object
   * @private
   */
  async handlePrimaryContact(partnerId, trx = null) {
    const query = trx 
      ? Contact.query(trx)
      : Contact.query();
    
    await query
      .where('partner_id', partnerId)
      .where('is_primary', true)
      .patch({ is_primary: false });
  }
}

module.exports = new ContactService();
