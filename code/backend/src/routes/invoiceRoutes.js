const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const InvoiceController = require('../controllers/InvoiceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware d'authentification pour toutes les routes
//router.use(authMiddleware.verifyToken);
router.use(authMiddleware.authenticate);


// Validation des données de facture
const validateInvoiceData = [
  body('customer_id').isInt().withMessage('ID client invalide'),
  body('invoice_date').isISO8601().withMessage('Date de facture invalide'),
  body('due_date').isISO8601().withMessage('Date d\'échéance invalide'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Code devise invalide'),
  body('status').optional().isIn(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded']).withMessage('Statut invalide'),
  body('invoice_type').optional().isIn(['standard', 'proforma', 'credit_note', 'debit_note']).withMessage('Type de facture invalide'),
  body('payment_terms').optional().isInt({ min: 0 }).withMessage('Conditions de paiement invalides'),
  body('subtotal').optional().isFloat({ min: 0 }).withMessage('Sous-total doit être positif'),
  body('tax_amount').optional().isFloat({ min: 0 }).withMessage('Montant de taxe doit être positif'),
  body('total_amount').optional().isFloat({ min: 0 }).withMessage('Montant total doit être positif')
];

// Validation des données de consolidation
const validateConsolidationData = [
  body('customer_id').isInt().withMessage('ID client invalide'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Code devise invalide'),
  body('start_date').optional().isISO8601().withMessage('Date de début invalide'),
  body('end_date').optional().isISO8601().withMessage('Date de fin invalide'),
  body('grouping_criteria').optional().isIn(['weekly', 'monthly', 'route', 'all']).withMessage('Critère de regroupement invalide')
];

// Routes CRUD de base

// Créer une nouvelle facture
router.post('/',
  validateInvoiceData,
  InvoiceController.createInvoice
);

// Obtenir toutes les factures avec filtres et pagination
router.get('/',
  query('page').optional().isInt({ min: 1 }).withMessage('Numéro de page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  query('status').optional().isIn(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded']).withMessage('Statut invalide'),
  query('customer_id').optional().isInt().withMessage('ID client invalide'),
  query('start_date').optional().isISO8601().withMessage('Date de début invalide'),
  query('end_date').optional().isISO8601().withMessage('Date de fin invalide'),
  InvoiceController.getInvoices
);

// Obtenir une facture par ID
router.get('/:id',
  param('id').isInt().withMessage('ID de facture invalide'),
  InvoiceController.getInvoiceById
);

// Mettre à jour une facture
router.put('/:id',
  param('id').isInt().withMessage('ID de facture invalide'),
  validateInvoiceData,
  InvoiceController.updateInvoice
);

// Supprimer une facture
router.delete('/:id',
  param('id').isInt().withMessage('ID de facture invalide'),
  InvoiceController.deleteInvoice
);

// Routes spécialisées

// Générer une facture à partir d'expéditions
router.post('/generate-from-shipments',
  body('shipment_ids').isArray({ min: 1 }).withMessage('Liste d\'expéditions requise'),
  body('shipment_ids.*').isInt().withMessage('ID d\'expédition invalide'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Code devise invalide'),
  body('invoice_date').optional().isISO8601().withMessage('Date de facture invalide'),
  body('due_date').optional().isISO8601().withMessage('Date d\'échéance invalide'),
  InvoiceController.generateInvoiceFromShipments
);

// Consolider plusieurs expéditions en factures
router.post('/consolidate',
  validateConsolidationData,
  InvoiceController.consolidateShipmentsInvoice
);

// Envoyer une facture par email
router.post('/:id/send-email',
  param('id').isInt().withMessage('ID de facture invalide'),
  body('to').optional().isEmail().withMessage('Adresse email invalide'),
  body('cc').optional().isEmail().withMessage('Adresse email CC invalide'),
  body('bcc').optional().isEmail().withMessage('Adresse email BCC invalide'),
  body('subject').optional().isString().withMessage('Sujet invalide'),
  body('body').optional().isString().withMessage('Corps du message invalide'),
  InvoiceController.sendInvoiceByEmail
);

// Générer le PDF d'une facture
router.get('/:id/pdf',
  param('id').isInt().withMessage('ID de facture invalide'),
  InvoiceController.generateInvoicePDF
);

// Marquer une facture comme payée
router.post('/:id/mark-paid',
  param('id').isInt().withMessage('ID de facture invalide'),
  body('payment_method').optional().isIn(['bank_transfer', 'credit_card', 'check', 'cash', 'other']).withMessage('Méthode de paiement invalide'),
  body('payment_reference').optional().isString().withMessage('Référence de paiement invalide'),
  body('payment_date').optional().isISO8601().withMessage('Date de paiement invalide'),
  InvoiceController.markInvoiceAsPaid
);

// Annuler une facture
router.post('/:id/cancel',
  param('id').isInt().withMessage('ID de facture invalide'),
  body('reason').notEmpty().withMessage('Raison d\'annulation requise'),
  InvoiceController.cancelInvoice
);

// Dupliquer une facture
router.post('/:id/duplicate',
  param('id').isInt().withMessage('ID de facture invalide'),
  body('invoice_date').optional().isISO8601().withMessage('Date de facture invalide'),
  body('due_date').optional().isISO8601().withMessage('Date d\'échéance invalide'),
  InvoiceController.duplicateInvoice
);

// Routes de consultation spécialisées

// Obtenir les factures en retard
router.get('/status/overdue',
  query('page').optional().isInt({ min: 1 }).withMessage('Numéro de page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  InvoiceController.getOverdueInvoices
);

// Obtenir les factures par client
router.get('/customer/:customer_id',
  param('customer_id').isInt().withMessage('ID client invalide'),
  query('page').optional().isInt({ min: 1 }).withMessage('Numéro de page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  InvoiceController.getInvoicesByCustomer
);

// Obtenir les factures par statut
router.get('/status/:status',
  param('status').isIn(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded']).withMessage('Statut invalide'),
  query('page').optional().isInt({ min: 1 }).withMessage('Numéro de page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  InvoiceController.getInvoicesByStatus
);

// Obtenir les statistiques des factures
router.get('/analytics/statistics',
  query('start_date').optional().isISO8601().withMessage('Date de début invalide'),
  query('end_date').optional().isISO8601().withMessage('Date de fin invalide'),
  InvoiceController.getInvoiceStatistics
);

// Obtenir le résumé des factures
router.get('/analytics/summary',
  query('start_date').optional().isISO8601().withMessage('Date de début invalide'),
  query('end_date').optional().isISO8601().withMessage('Date de fin invalide'),
  InvoiceController.getInvoicesSummary
);

// Rechercher des factures
router.get('/search',
  query('q').notEmpty().withMessage('Terme de recherche requis'),
  query('page').optional().isInt({ min: 1 }).withMessage('Numéro de page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  InvoiceController.searchInvoices
);

// Exporter les factures
router.get('/export',
  query('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format d\'export invalide'),
  query('start_date').optional().isISO8601().withMessage('Date de début invalide'),
  query('end_date').optional().isISO8601().withMessage('Date de fin invalide'),
  InvoiceController.exportInvoices
);

// Valider une facture
router.post('/validate',
  InvoiceController.validateInvoice
);

// Routes pour la gestion des lignes de facture

// Ajouter une ligne à une facture
router.post('/:id/lines',
  param('id').isInt().withMessage('ID de facture invalide'),
  body('description').notEmpty().withMessage('Description requise'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantité doit être positive'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Prix unitaire doit être positif'),
  body('unit_of_measure').optional().isIn(['kg', 'm3', 'km', 'hour', 'day', 'pallet', 'container', 'piece', 'percentage']).withMessage('Unité de mesure invalide'),
  body('line_type').optional().isIn(['transport', 'surcharge', 'tax', 'discount', 'other']).withMessage('Type de ligne invalide'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const InvoiceLine = require('../models/InvoiceLine');
      
      const lineData = {
        ...req.body,
        invoice_id: id,
        tenant_id: req.user.tenant_id,
        created_by: req.user.id,
        updated_by: req.user.id
      };

      const line = await InvoiceLine.query().insert(lineData);

      res.status(201).json({
        success: true,
        message: 'Ligne de facture ajoutée avec succès',
        data: line
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Obtenir les lignes d'une facture
router.get('/:id/lines',
  param('id').isInt().withMessage('ID de facture invalide'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const InvoiceLine = require('../models/InvoiceLine');
      
      const lines = await InvoiceLine.query()
        .where('invoice_id', id)
        .withGraphFetched('[order, shipment, segment, rate, surcharge]')
        .orderBy('sort_order')
        .orderBy('created_at');

      res.json({
        success: true,
        data: lines
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Mettre à jour une ligne de facture
router.put('/:id/lines/:line_id',
  param('id').isInt().withMessage('ID de facture invalide'),
  param('line_id').isInt().withMessage('ID de ligne invalide'),
  body('description').optional().notEmpty().withMessage('Description ne peut pas être vide'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantité doit être positive'),
  body('unit_price').optional().isFloat({ min: 0 }).withMessage('Prix unitaire doit être positif'),
  async (req, res) => {
    try {
      const { id, line_id } = req.params;
      const InvoiceLine = require('../models/InvoiceLine');
      
      const line = await InvoiceLine.query().findById(line_id);
      if (!line || line.invoice_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          message: 'Ligne de facture non trouvée'
        });
      }

      const updatedLine = await InvoiceLine.query()
        .patchAndFetchById(line_id, {
          ...req.body,
          updated_by: req.user.id
        });

      res.json({
        success: true,
        message: 'Ligne de facture mise à jour avec succès',
        data: updatedLine
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Supprimer une ligne de facture
router.delete('/:id/lines/:line_id',
  param('id').isInt().withMessage('ID de facture invalide'),
  param('line_id').isInt().withMessage('ID de ligne invalide'),
  async (req, res) => {
    try {
      const { id, line_id } = req.params;
      const InvoiceLine = require('../models/InvoiceLine');
      
      const line = await InvoiceLine.query().findById(line_id);
      if (!line || line.invoice_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          message: 'Ligne de facture non trouvée'
        });
      }

      await InvoiceLine.query().deleteById(line_id);

      res.json({
        success: true,
        message: 'Ligne de facture supprimée avec succès'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Routes pour les rappels et notifications

// Envoyer un rappel de paiement
router.post('/:id/send-reminder',
  param('id').isInt().withMessage('ID de facture invalide'),
  body('reminder_type').optional().isIn(['first', 'second', 'final']).withMessage('Type de rappel invalide'),
  body('custom_message').optional().isString().withMessage('Message personnalisé invalide'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reminder_type = 'first', custom_message } = req.body;
      
      // Cette fonctionnalité nécessiterait un service de notification
      // Pour l'instant, simuler l'envoi
      const Invoice = require('../models/Invoice');
      const invoice = await Invoice.query().findById(id);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Facture non trouvée'
        });
      }

      // Mettre à jour les dates de rappel
      const updateData = {};
      if (reminder_type === 'first') {
        updateData.first_reminder_date = new Date().toISOString();
      }
      updateData.last_reminder_date = new Date().toISOString();

      await Invoice.query().patchAndFetchById(id, updateData);

      res.json({
        success: true,
        message: `Rappel ${reminder_type} envoyé avec succès`,
        data: {
          invoice_id: id,
          reminder_type,
          sent_date: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Obtenir les factures nécessitant un rappel
router.get('/reminders/due',
  query('days_overdue').optional().isInt({ min: 1 }).withMessage('Nombre de jours en retard invalide'),
  async (req, res) => {
    try {
      const daysOverdue = parseInt(req.query.days_overdue) || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

      const Invoice = require('../models/Invoice');
      const invoices = await Invoice.query()
        .where('tenant_id', req.user.tenant_id)
        .where('status', 'overdue')
        .where('due_date', '<', cutoffDate.toISOString().split('T')[0])
        .where(builder => {
          builder.whereNull('last_reminder_date')
            .orWhere('last_reminder_date', '<', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        })
        .withGraphFetched('[customer]')
        .orderBy('due_date');

      res.json({
        success: true,
        data: invoices,
        count: invoices.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;

