const PaymentService = require('../services/PaymentService');
const { validationResult } = require('express-validator');
const BankAccount = require('../models/BankAccount');

class PaymentController {
  /**
   * Create a new payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid validation data',
          errors: errors.array()
        });
      }

      const payment = await PaymentService.createPayment(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get payment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await PaymentService.getPaymentById(id, true);

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all payments with filters and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPayments(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 20
      };

      const result = await PaymentService.searchPayments(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update a payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid validation data',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const payment = await PaymentService.updatePayment(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Payment updated successfully',
        data: payment
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete a payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deletePayment(req, res) {
    try {
      const { id } = req.params;
      const result = await PaymentService.deletePayment(id);

      res.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Process a payment (mark as completed)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processPayment(req, res) {
    try {
      const { id } = req.params;
      const payment = await PaymentService.processPayment(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: payment
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cancel a payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async cancelPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const payment = await PaymentService.cancelPayment(id, reason, req.user.id);

      res.json({
        success: true,
        message: 'Payment cancelled successfully',
        data: payment
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get overdue payments
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOverduePayments(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 20
      };

      const result = await PaymentService.getOverduePayments(filters.tenant_id, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get payment statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPaymentStatistics(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };
      const stats = await PaymentService.getPaymentStatistics(filters.tenant_id, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bank Account Management

  /**
   * Create a new bank account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBankAccount(req, res) {
    try {
      //console.log('BODY REÇU:', req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid validation data',
          errors: errors.array()
        });
      }

      const accountData = {
        ...req.body,
        tenant_id: req.user.tenant_id,
        created_by: req.user.id,
        updated_by: req.user.id
      };

      delete accountData.id;

      const validationErrors = await BankAccount.validateBankAccount(accountData);
      if (validationErrors.length > 0) {
        console.log('Erreurs de validation compte bancaire:', validationErrors);
        return res.status(400).json({
          success: false,
          message: 'Invalid bank account data',
          errors: validationErrors
        });
      }

      
      const bankAccount = await BankAccount.query().insert(accountData);

      res.status(201).json({
        success: true,
        message: 'Bank account created successfully',
        data: bankAccount
      });
    } catch (error) {
      console.error('Erreur création compte bancaire:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get bank account by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBankAccountById(req, res) {
    try {
      const { id } = req.params;
      const bankAccount = await BankAccount.query().findById(id);

      if (!bankAccount || bankAccount.tenant_id !== req.user.tenant_id) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }

      res.json({
        success: true,
        data: bankAccount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all bank accounts for a tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBankAccounts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * limit;

      // Filtrage par tenant
      const query = BankAccount.query()
        .where('tenant_id', req.user.tenant_id)
        .orderBy('account_name', 'asc');

      //Filtres 
      if (req.query.account_type) {
        query.where('account_type', req.query.account_type);
      }
      if (req.query.currency) {
        query.where('currency', req.query.currency);
      }
      if (req.query.search_term) {
      const search = `%${req.query.search_term}%`;
      query.where(builder =>
        builder
          .where('account_name', 'ilike', search)
          .orWhere('account_number', 'ilike', search)
          .orWhere('bank_name', 'ilike', search)
      );
      }

      // Compte total
      const total = await query.resultSize();
      // Récupère les comptes paginés
      const bankAccounts = await query.clone().offset(offset).limit(limit);

      const totalPages = Math.ceil(total / limit) || 1;

      res.json({
        success: true,
        data: bankAccounts,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      console.log('Erreur récupération comptes bancaires:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update a bank account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBankAccount(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid validation data',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const accountData = {
        ...req.body,
        updated_by: req.user.id
      };
      delete accountData.id;
      
      const existingAccount = await BankAccount.query().findById(id);
      if (!existingAccount || existingAccount.tenant_id !== req.user.tenant_id) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }

      const validationErrors = await BankAccount.validateBankAccount(accountData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bank account data',
          errors: validationErrors
        });
      }

      const updatedAccount = await BankAccount.query().patchAndFetchById(id, accountData);

      res.json({
        success: true,
        message: 'Bank account updated successfully',
        data: updatedAccount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete a bank account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBankAccount(req, res) {
    try {
      const { id } = req.params;
      const existingAccount = await BankAccount.query().findById(id);

      if (!existingAccount || existingAccount.tenant_id !== req.user.tenant_id) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }

      // Check if there are any payments associated with this bank account
      const associatedPayments = await Payment.query().where('bank_account_id', id).first();
      if (associatedPayments) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete bank account with associated payments'
        });
      }

      const numDeleted = await BankAccount.query().deleteById(id);

      if (numDeleted === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }

      res.json({
        success: true,
        message: 'Bank account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentController();


