const Payment = require('../models/Payment');
const BankAccount = require('../models/BankAccount');
const Invoice = require('../models/Invoice');
const CarrierInvoice = require('../models/CarrierInvoice');
const { transaction } = require('objection');
const { NotFoundError, ValidationError } = require('../utils/errors');

class PaymentService {
  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Created payment
   */
  async createPayment(paymentData, userId) {
    try {
      // Validate payment data
      const validationErrors = await Payment.validatePayment(paymentData);
      if (validationErrors.length > 0) {
        throw new ValidationError('Invalid payment data', validationErrors);
      }

      return await transaction(Payment.knex(), async (trx) => {
        // Set audit fields
        paymentData.created_by = userId;
        paymentData.updated_by = userId;

        // Create payment
        const payment = await Payment.query(trx).insert(paymentData);

        // Update related invoice status if applicable
        if (payment.invoice_id) {
          await this.updateInvoicePaymentStatus(payment.invoice_id, trx);
        }

        if (payment.carrier_invoice_id) {
          await this.updateCarrierInvoicePaymentStatus(payment.carrier_invoice_id, trx);
        }

        return await Payment.query(trx)
          .findById(payment.id)
          .withGraphFetched('[partner, invoice, carrierInvoice, bankAccount]');
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid payment data', error.data);
      }
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @param {boolean} withRelations - Include related data
   * @returns {Promise<Object>} - Payment object
   */
  async getPaymentById(id, withRelations = false) {
    let query = Payment.query().findById(id);

    if (withRelations) {
      query = query.withGraphFetched('[partner, invoice, carrierInvoice, bankAccount, createdBy, updatedBy]');
    }

    const payment = await query;

    if (!payment) {
      throw new NotFoundError(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Update a payment
   * @param {number} id - Payment ID
   * @param {Object} paymentData - Updated payment data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Updated payment
   */
  async updatePayment(id, paymentData, userId) {
    try {
      return await transaction(Payment.knex(), async (trx) => {
        // Check if payment exists
        const existingPayment = await Payment.query(trx).findById(id);
        if (!existingPayment) {
          throw new NotFoundError(`Payment with ID ${id} not found`);
        }

        // Set audit fields
        paymentData.updated_by = userId;

        // Update payment
        const updatedPayment = await Payment.query(trx)
          .patchAndFetchById(id, paymentData);

        // Update related invoice status if status changed
        if (paymentData.status && paymentData.status !== existingPayment.status) {
          if (updatedPayment.invoice_id) {
            await this.updateInvoicePaymentStatus(updatedPayment.invoice_id, trx);
          }
          if (updatedPayment.carrier_invoice_id) {
            await this.updateCarrierInvoicePaymentStatus(updatedPayment.carrier_invoice_id, trx);
          }
        }

        return await Payment.query(trx)
          .findById(id)
          .withGraphFetched('[partner, invoice, carrierInvoice, bankAccount]');
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError('Invalid payment data', error.data);
      }
      throw error;
    }
  }

  /**
   * Delete a payment
   * @param {number} id - Payment ID
   * @returns {Promise<boolean>} - Success status
   */
  async deletePayment(id) {
    return await transaction(Payment.knex(), async (trx) => {
      const payment = await Payment.query(trx).findById(id);
      if (!payment) {
        throw new NotFoundError(`Payment with ID ${id} not found`);
      }

      // Check if payment can be deleted
      if (payment.status === 'completed') {
        throw new ValidationError('Cannot delete a completed payment');
      }

      const numDeleted = await Payment.query(trx).deleteById(id);

      // Update related invoice status
      if (payment.invoice_id) {
        await this.updateInvoicePaymentStatus(payment.invoice_id, trx);
      }
      if (payment.carrier_invoice_id) {
        await this.updateCarrierInvoicePaymentStatus(payment.carrier_invoice_id, trx);
      }

      return numDeleted > 0;
    });
  }

  /**
   * Search payments with filters and pagination
   * @param {Object} criteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchPayments(criteria = {}, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;

    let query = Payment.query();

    // Apply filters
    if (criteria.tenant_id) {
      query = query.where('tenant_id', criteria.tenant_id);
    }

    if (criteria.payment_type) {
      query = query.where('payment_type', criteria.payment_type);
    }

    if (criteria.status) {
      query = query.where('status', criteria.status);
    }

    if (criteria.partner_id) {
      query = query.where('partner_id', criteria.partner_id);
    }

    if (criteria.payment_method) {
      query = query.where('payment_method', criteria.payment_method);
    }

    if (criteria.currency) {
      query = query.where('currency', criteria.currency);
    }

    // Date range filters
    if (criteria.payment_date_from) {
      query = query.where('payment_date', '>=', criteria.payment_date_from);
    }

    if (criteria.payment_date_to) {
      query = query.where('payment_date', '<=', criteria.payment_date_to);
    }

    if (criteria.due_date_from) {
      query = query.where('due_date', '>=', criteria.due_date_from);
    }

    if (criteria.due_date_to) {
      query = query.where('due_date', '<=', criteria.due_date_to);
    }

    // Amount range filters
    if (criteria.amount_min) {
      query = query.where('amount', '>=', criteria.amount_min);
    }

    if (criteria.amount_max) {
      query = query.where('amount', '<=', criteria.amount_max);
    }

    // Overdue payments
    if (criteria.overdue) {
      const today = new Date().toISOString().split('T')[0];
      query = query.where('due_date', '<', today)
        .whereIn('status', ['pending', 'processing']);
    }

    // Text search
    if (criteria.search_term) {
      query = query.where(builder => {
        builder.where('reference', 'like', `%${criteria.search_term}%`)
          .orWhere('description', 'like', `%${criteria.search_term}%`)
          .orWhere('transaction_reference', 'like', `%${criteria.search_term}%`);
      });
    }

    // Include relations if requested
    if (criteria.with_relations) {
      query = query.withGraphFetched('[partner, invoice, carrierInvoice, bankAccount]');
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
   * Get payment statistics
   * @param {number} tenantId - Tenant ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - Payment statistics
   */
  async getPaymentStatistics(tenantId, filters = {}) {
    let query = Payment.query().where('tenant_id', tenantId);

    // Apply date filter if provided
    if (filters.date_from) {
      query = query.where('payment_date', '>=', filters.date_from);
    }
    if (filters.date_to) {
      query = query.where('payment_date', '<=', filters.date_to);
    }

    const stats = await query
      .select('payment_type', 'status', 'currency')
      .sum('amount as total_amount')
      .count('* as count')
      .groupBy('payment_type', 'status', 'currency');

    // Get overdue payments
    const today = new Date().toISOString().split('T')[0];
    const overdueQuery = Payment.query()
      .where('tenant_id', tenantId)
      .where('due_date', '<', today)
      .whereIn('status', ['pending', 'processing']);

    if (filters.date_from) {
      overdueQuery.where('payment_date', '>=', filters.date_from);
    }
    if (filters.date_to) {
      overdueQuery.where('payment_date', '<=', filters.date_to);
    }

    const overdueStats = await overdueQuery
      .select('currency')
      .sum('amount as total_amount')
      .count('* as count')
      .groupBy('currency');

    return {
      by_type_and_status: stats,
      overdue: overdueStats,
      summary: this.calculateSummaryStats(stats)
    };
  }

  /**
   * Process payment (mark as completed)
   * @param {number} id - Payment ID
   * @param {Object} processingData - Processing data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Updated payment
   */
  async processPayment(id, processingData, userId) {
    return await transaction(Payment.knex(), async (trx) => {
      const payment = await Payment.query(trx).findById(id);
      if (!payment) {
        throw new NotFoundError(`Payment with ID ${id} not found`);
      }

      if (payment.status !== 'pending' && payment.status !== 'processing') {
        throw new ValidationError(`Cannot process payment with status: ${payment.status}`);
      }

      const updateData = {
        status: 'completed',
        transaction_reference: processingData.transaction_reference,
        notes: processingData.notes,
        updated_by: userId
      };

      const updatedPayment = await Payment.query(trx)
        .patchAndFetchById(id, updateData);

      // Update related invoice status
      if (updatedPayment.invoice_id) {
        await this.updateInvoicePaymentStatus(updatedPayment.invoice_id, trx);
      }
      if (updatedPayment.carrier_invoice_id) {
        await this.updateCarrierInvoicePaymentStatus(updatedPayment.carrier_invoice_id, trx);
      }

      return updatedPayment;
    });
  }

  /**
   * Cancel a payment
   * @param {number} id - Payment ID
   * @param {string} reason - Cancellation reason
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Updated payment
   */
  async cancelPayment(id, reason, userId) {
    return await transaction(Payment.knex(), async (trx) => {
      const payment = await Payment.query(trx).findById(id);
      if (!payment) {
        throw new NotFoundError(`Payment with ID ${id} not found`);
      }

      if (!payment.canBeCancelled()) {
        throw new ValidationError(`Cannot cancel payment with status: ${payment.status}`);
      }

      const updateData = {
        status: 'cancelled',
        notes: reason,
        updated_by: userId
      };

      const updatedPayment = await Payment.query(trx)
        .patchAndFetchById(id, updateData);

      // Update related invoice status
      if (updatedPayment.invoice_id) {
        await this.updateInvoicePaymentStatus(updatedPayment.invoice_id, trx);
      }
      if (updatedPayment.carrier_invoice_id) {
        await this.updateCarrierInvoicePaymentStatus(updatedPayment.carrier_invoice_id, trx);
      }

      return updatedPayment;
    });
  }

  /**
   * Get overdue payments
   * @param {number} tenantId - Tenant ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Overdue payments with pagination
   */
  async getOverduePayments(tenantId, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    const today = new Date().toISOString().split('T')[0];

    const query = Payment.query()
      .where('tenant_id', tenantId)
      .where('due_date', '<', today)
      .whereIn('status', ['pending', 'processing'])
      .withGraphFetched('[partner, invoice, carrierInvoice]')
      .orderBy('due_date', 'asc');

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

  // Private helper methods
  async updateInvoicePaymentStatus(invoiceId, trx) {
    const payments = await Payment.query(trx)
      .where('invoice_id', invoiceId)
      .where('status', 'completed');

    const invoice = await Invoice.query(trx).findById(invoiceId);
    if (!invoice) return;

    const totalPaid = payments.reduce((sum, payment) => sum + payment.getAmountInBaseCurrency(), 0);
    const invoiceTotal = invoice.total_amount;

    let paymentStatus = 'unpaid';
    if (totalPaid >= invoiceTotal) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    await Invoice.query(trx)
      .patchAndFetchById(invoiceId, { payment_status: paymentStatus });
  }

  async updateCarrierInvoicePaymentStatus(carrierInvoiceId, trx) {
    const payments = await Payment.query(trx)
      .where('carrier_invoice_id', carrierInvoiceId)
      .where('status', 'completed');

    const carrierInvoice = await CarrierInvoice.query(trx).findById(carrierInvoiceId);
    if (!carrierInvoice) return;

    const totalPaid = payments.reduce((sum, payment) => sum + payment.getAmountInBaseCurrency(), 0);
    const invoiceTotal = carrierInvoice.total_amount;

    let paymentStatus = 'unpaid';
    if (totalPaid >= invoiceTotal) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    await CarrierInvoice.query(trx)
      .patchAndFetchById(carrierInvoiceId, { payment_status: paymentStatus });
  }

  calculateSummaryStats(stats) {
    const summary = {
      total_incoming: 0,
      total_outgoing: 0,
      total_pending: 0,
      total_completed: 0
    };

    stats.forEach(stat => {
      if (stat.payment_type === 'incoming') {
        summary.total_incoming += parseFloat(stat.total_amount);
      } else {
        summary.total_outgoing += parseFloat(stat.total_amount);
      }

      if (stat.status === 'pending' || stat.status === 'processing') {
        summary.total_pending += parseFloat(stat.total_amount);
      } else if (stat.status === 'completed') {
        summary.total_completed += parseFloat(stat.total_amount);
      }
    });

    return summary;
  }
}

module.exports = new PaymentService();

