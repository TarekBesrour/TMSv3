const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware pour protéger les routes
router.use(authMiddleware);

// Routes pour la gestion des paiements
router.post('/payments', PaymentController.createPayment);
router.get('/payments', PaymentController.getPayments);
router.get('/payments/:id', PaymentController.getPaymentById);
router.put('/payments/:id', PaymentController.updatePayment);
router.delete('/payments/:id', PaymentController.deletePayment);

// Routes spécifiques aux actions sur les paiements
router.post('/payments/:id/process', PaymentController.processPayment);
router.post('/payments/:id/cancel', PaymentController.cancelPayment);

// Routes pour les statistiques et paiements en retard
router.get('/payments/overdue', PaymentController.getOverduePayments);
router.get('/payments/statistics', PaymentController.getPaymentStatistics);

// Routes pour la gestion des comptes bancaires
router.post('/bank-accounts', PaymentController.createBankAccount);
router.get('/bank-accounts', PaymentController.getBankAccounts);
router.get('/bank-accounts/:id', PaymentController.getBankAccountById);
router.put('/bank-accounts/:id', PaymentController.updateBankAccount);
router.delete('/bank-accounts/:id', PaymentController.deleteBankAccount);

module.exports = router;


