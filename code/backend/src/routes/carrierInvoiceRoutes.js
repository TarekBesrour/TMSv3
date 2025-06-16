const express = require('express');
const router = express.Router();
const CarrierInvoiceController = require('../controllers/CarrierInvoiceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware pour protéger les routes
router.use(authMiddleware);

// Routes pour la gestion des factures transporteurs
router.post('/carrier-invoices', CarrierInvoiceController.createCarrierInvoice);
router.get('/carrier-invoices', CarrierInvoiceController.getCarrierInvoices);
router.get('/carrier-invoices/:id', CarrierInvoiceController.getCarrierInvoiceById);
router.put('/carrier-invoices/:id', CarrierInvoiceController.updateCarrierInvoice);
router.delete('/carrier-invoices/:id', CarrierInvoiceController.deleteCarrierInvoice);

// Routes spécifiques au contrôle des factures
router.post('/carrier-invoices/:id/validate', CarrierInvoiceController.validateCarrierInvoice);
router.post('/carrier-invoices/:id/approve', CarrierInvoiceController.approveCarrierInvoice);
router.post('/carrier-invoices/:id/reject', CarrierInvoiceController.rejectCarrierInvoice);
router.get('/carrier-invoices/control-summary', CarrierInvoiceController.getControlSummary);

module.exports = router;


