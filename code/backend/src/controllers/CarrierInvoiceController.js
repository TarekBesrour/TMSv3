const CarrierInvoiceControlService = require('../services/CarrierInvoiceControlService');
const { validationResult } = require('express-validator');

class CarrierInvoiceController {
  // Créer une nouvelle facture transporteur
  async createCarrierInvoice(req, res) {
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

      const invoice = await CarrierInvoiceControlService.createCarrierInvoice(
        req.body,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Facture transporteur créée avec succès',
        data: invoice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir une facture transporteur par ID
  async getCarrierInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await CarrierInvoiceControlService.getCarrierInvoiceById(id);

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

  // Obtenir toutes les factures transporteurs avec filtres
  async getCarrierInvoices(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, pagination);

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

  // Contrôler automatiquement une facture transporteur
  async controlCarrierInvoice(req, res) {
    try {
      const { id } = req.params;
      const result = await CarrierInvoiceControlService.controlCarrierInvoice(id, req.user.id);

      res.json({
        success: true,
        message: 'Contrôle de la facture effectué avec succès',
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

  // Approuver une facture transporteur
  async approveCarrierInvoice(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const invoice = await CarrierInvoiceControlService.approveCarrierInvoice(id, req.user.id, notes);

      res.json({
        success: true,
        message: 'Facture approuvée avec succès',
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

  // Rejeter une facture transporteur
  async rejectCarrierInvoice(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Raison du rejet requise'
        });
      }

      const invoice = await CarrierInvoiceControlService.rejectCarrierInvoice(id, req.user.id, reason);

      res.json({
        success: true,
        message: 'Facture rejetée avec succès',
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

  // Disputer une facture transporteur
  async disputeCarrierInvoice(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Raison de la dispute requise'
        });
      }

      const invoice = await CarrierInvoiceControlService.disputeCarrierInvoice(id, req.user.id, reason);

      res.json({
        success: true,
        message: 'Facture mise en dispute avec succès',
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

  // Corriger une ligne de facture
  async correctInvoiceLine(req, res) {
    try {
      const { id, line_id } = req.params;
      const { corrected_unit_price, reason } = req.body;

      if (!corrected_unit_price || corrected_unit_price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Prix unitaire corrigé requis et doit être positif'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Raison de la correction requise'
        });
      }

      const line = await CarrierInvoiceControlService.correctInvoiceLine(
        line_id,
        corrected_unit_price,
        reason,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Ligne de facture corrigée avec succès',
        data: line
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

  // Obtenir les factures nécessitant une révision manuelle
  async getInvoicesRequiringManualReview(req, res) {
    try {
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await CarrierInvoiceControlService.getInvoicesRequiringManualReview(
        req.user.tenant_id,
        pagination
      );

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

  // Obtenir les factures par transporteur
  async getInvoicesByCarrier(req, res) {
    try {
      const { carrier_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        carrier_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, pagination);

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

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, pagination);

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

  // Obtenir les factures avec anomalies
  async getInvoicesWithAnomalies(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        has_anomalies: true,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, pagination);

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

  // Obtenir les statistiques de contrôle
  async getControlStatistics(req, res) {
    try {
      const filters = req.query;
      const stats = await CarrierInvoiceControlService.getControlStatistics(req.user.tenant_id, filters);

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

  // Analyser les tendances de variance
  async analyzeVarianceTrends(req, res) {
    try {
      const filters = req.query;
      const analysis = await CarrierInvoiceControlService.analyzeVarianceTrends(req.user.tenant_id, filters);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir le tableau de bord de contrôle
  async getControlDashboard(req, res) {
    try {
      const filters = req.query;

      // Obtenir les statistiques
      const stats = await CarrierInvoiceControlService.getControlStatistics(req.user.tenant_id, filters);

      // Obtenir les factures nécessitant une révision
      const manualReview = await CarrierInvoiceControlService.getInvoicesRequiringManualReview(
        req.user.tenant_id,
        { page: 1, limit: 5 }
      );

      // Obtenir les factures avec anomalies
      const withAnomalies = await CarrierInvoiceControlService.getCarrierInvoices({
        tenant_id: req.user.tenant_id,
        has_anomalies: true
      }, { page: 1, limit: 5 });

      // Analyser les tendances
      const trends = await CarrierInvoiceControlService.analyzeVarianceTrends(req.user.tenant_id, filters);

      res.json({
        success: true,
        data: {
          statistics: stats,
          manual_review_invoices: manualReview.data,
          anomaly_invoices: withAnomalies.data,
          variance_trends: trends
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Valider une facture transporteur
  async validateCarrierInvoice(req, res) {
    try {
      const invoiceData = req.body;
      const validation = await CarrierInvoiceControlService.validateCarrierInvoiceData(invoiceData);

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

  // Rechercher des factures transporteurs
  async searchCarrierInvoices(req, res) {
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

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, pagination);

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

  // Exporter les factures transporteurs
  async exportCarrierInvoices(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, { page: 1, limit: 10000 });

      // Formatage des données pour l'export
      const exportData = result.data.map(invoice => ({
        invoice_number: invoice.invoice_number,
        carrier_name: invoice.carrier_name,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        status: invoice.status,
        validation_status: invoice.validation_status,
        total_amount: invoice.total_amount,
        expected_amount: invoice.expected_amount,
        variance_amount: invoice.variance_amount,
        variance_percentage: invoice.variance_percentage,
        currency: invoice.currency,
        requires_manual_review: invoice.requires_manual_review,
        anomalies_count: (invoice.anomalies || []).length,
        received_date: invoice.received_date,
        control_date: invoice.control_date
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

  // Obtenir le résumé de contrôle d'une facture
  async getInvoiceControlSummary(req, res) {
    try {
      const { id } = req.params;
      const invoice = await CarrierInvoiceControlService.getCarrierInvoiceById(id);

      const summary = invoice.getControlSummary();

      res.json({
        success: true,
        data: summary
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

  // Assigner une facture à un utilisateur pour révision
  async assignInvoiceForReview(req, res) {
    try {
      const { id } = req.params;
      const { assigned_to, priority } = req.body;

      const CarrierInvoice = require('../models/CarrierInvoice');
      const updatedInvoice = await CarrierInvoice.query().patchAndFetchById(id, {
        assigned_to,
        priority: priority || 'normal',
        workflow_step: 'manual_review',
        next_action: 'review_and_validate'
      });

      res.json({
        success: true,
        message: 'Facture assignée pour révision avec succès',
        data: updatedInvoice
      });
    } catch (error) {
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

      const CarrierInvoice = require('../models/CarrierInvoice');
      const invoice = await CarrierInvoice.query().findById(id);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Facture non trouvée'
        });
      }

          if (!invoice.canBePaid()) {
        return res.status(400).json({
          success: false,
          message: 'Cette facture ne peut pas être marquée comme payée'
        });
      }

      invoice.markAsPaid(paymentData);
      const updatedInvoice = await CarrierInvoice.query().patchAndFetchById(id, invoice);

      res.json({
        success: true,
        message: 'Facture marquée comme payée avec succès',
        data: updatedInvoice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les factures en retard de paiement
  async getOverdueInvoices(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        status: ['approved'],
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await CarrierInvoiceControlService.getCarrierInvoices(filters, pagination);

      // Filtrer les factures en retard
      const overdueInvoices = result.data.filter(invoice => invoice.isOverdue());

      res.json({
        success: true,
        data: overdueInvoices,
        count: overdueInvoices.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CarrierInvoiceController();

