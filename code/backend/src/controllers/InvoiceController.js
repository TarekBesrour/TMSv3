const InvoiceService = require('../services/InvoiceService');
const { validationResult } = require('express-validator');

class InvoiceController {
  // Créer une nouvelle facture
  async createInvoice(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: errors.array()
        });
      }

      const invoice = await InvoiceService.createInvoice(
        req.body,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Facture créée avec succès',
        data: invoice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir une facture par ID
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoiceById(id);

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Obtenir toutes les factures avec filtres et pagination
  async getInvoices(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await InvoiceService.getInvoices(filters, pagination);

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

  // Mettre à jour une facture
  async updateInvoice(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const invoice = await InvoiceService.updateInvoice(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Facture mise à jour avec succès',
        data: invoice
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Supprimer une facture
  async deleteInvoice(req, res) {
    try {
      const { id } = req.params;
      const result = await InvoiceService.deleteInvoice(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Générer une facture à partir d'expéditions
  async generateInvoiceFromShipments(req, res) {
    try {
      const { shipment_ids, ...invoiceData } = req.body;

      if (!shipment_ids || !Array.isArray(shipment_ids) || shipment_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Liste des expéditions requise'
        });
      }

      const invoice = await InvoiceService.generateInvoiceFromShipments(
        shipment_ids,
        invoiceData,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Facture générée avec succès',
        data: invoice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Consolider plusieurs expéditions en factures
  async consolidateShipmentsInvoice(req, res) {
    try {
      const consolidationParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const result = await InvoiceService.consolidateShipmentsInvoice(
        consolidationParams,
        req.user.id,
        req.user.tenant_id
      );

      res.json({
        success: true,
        message: 'Factures consolidées avec succès',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Envoyer une facture par email
  async sendInvoiceByEmail(req, res) {
    try {
      const { id } = req.params;
      const emailOptions = req.body;

      const result = await InvoiceService.sendInvoiceByEmail(id, emailOptions);

      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Générer le PDF d'une facture
  async generateInvoicePDF(req, res) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoiceById(id);
      const pdfBuffer = await InvoiceService.generateInvoicePDF(invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Facture_${invoice.invoice_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Marquer une facture comme payée
  async markInvoiceAsPaid(req, res) {
    try {
      const { id } = req.params;
      const paymentData = req.body;

      const invoice = await InvoiceService.markInvoiceAsPaid(id, paymentData, req.user.id);

      res.json({
        success: true,
        message: 'Facture marquée comme payée',
        data: invoice
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Annuler une facture
  async cancelInvoice(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Raison d\'annulation requise'
        });
      }

      const invoice = await InvoiceService.cancelInvoice(id, reason, req.user.id);

      res.json({
        success: true,
        message: 'Facture annulée avec succès',
        data: invoice
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Obtenir les factures en retard
  async getOverdueInvoices(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        overdue: true,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await InvoiceService.getInvoices(filters, pagination);

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

  // Obtenir les factures par client
  async getInvoicesByCustomer(req, res) {
    try {
      const { customer_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        customer_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await InvoiceService.getInvoices(filters, pagination);

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

  // Obtenir les factures par statut
  async getInvoicesByStatus(req, res) {
    try {
      const { status } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        status,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await InvoiceService.getInvoices(filters, pagination);

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

  // Obtenir les statistiques des factures
  async getInvoiceStatistics(req, res) {
    try {
      const filters = req.query;
      const stats = await InvoiceService.getInvoiceStatistics(req.user.tenant_id, filters);

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

  // Dupliquer une facture
  async duplicateInvoice(req, res) {
    try {
      const { id } = req.params;
      const originalInvoice = await InvoiceService.getInvoiceById(id);

      // Créer une nouvelle facture basée sur l'originale
      const duplicateData = {
        customer_id: originalInvoice.customer_id,
        customer_name: originalInvoice.customer_name,
        customer_address: originalInvoice.customer_address,
        customer_tax_number: originalInvoice.customer_tax_number,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: InvoiceService.calculateDueDate(originalInvoice.payment_terms || 30),
        payment_terms: originalInvoice.payment_terms,
        currency: originalInvoice.currency,
        status: 'draft',
        invoice_type: originalInvoice.invoice_type,
        notes: `Dupliquée de ${originalInvoice.invoice_number}`,
        ...req.body
      };

      const duplicateInvoice = await InvoiceService.createInvoice(
        duplicateData,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Facture dupliquée avec succès',
        data: duplicateInvoice
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Valider une facture
  async validateInvoice(req, res) {
    try {
      const invoiceData = req.body;
      const validation = await InvoiceService.validateInvoiceData(invoiceData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir le résumé des factures
  async getInvoicesSummary(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      // Obtenir les statistiques
      const stats = await InvoiceService.getInvoiceStatistics(req.user.tenant_id, filters);

      // Obtenir les factures récentes
      const recentInvoices = await InvoiceService.getInvoices(
        { ...filters, limit: 5 },
        { page: 1, limit: 5 }
      );

      // Obtenir les factures en retard
      const overdueInvoices = await InvoiceService.getInvoices(
        { ...filters, overdue: true, limit: 5 },
        { page: 1, limit: 5 }
      );

      res.json({
        success: true,
        data: {
          statistics: stats,
          recent_invoices: recentInvoices.data,
          overdue_invoices: overdueInvoices.data
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Exporter les factures
  async exportInvoices(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const result = await InvoiceService.getInvoices(filters, { page: 1, limit: 10000 });

      // Formatage des données pour l'export
      const exportData = result.data.map(invoice => ({
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer_name,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        status: invoice.status,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        paid_amount: invoice.paid_amount,
        outstanding_amount: invoice.outstanding_amount,
        currency: invoice.currency,
        payment_method: invoice.payment_method,
        created_at: invoice.created_at
      }));

      res.json({
        success: true,
        data: exportData,
        count: exportData.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Rechercher des factures
  async searchInvoices(req, res) {
    try {
      const { q: search } = req.query;
      
      if (!search || search.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Terme de recherche trop court (minimum 2 caractères)'
        });
      }

      const filters = {
        tenant_id: req.user.tenant_id,
        search: search.trim(),
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await InvoiceService.getInvoices(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        search_term: search
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new InvoiceController();

