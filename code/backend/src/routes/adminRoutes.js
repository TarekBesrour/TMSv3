const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware to protect routes
router.use(authMiddleware.authenticate);


// System Configuration Routes
router.get('/admin/configurations', AdminController.getConfigurations);
router.get('/admin/configurations/:key', AdminController.getConfigurationByKey);
router.post('/admin/configurations', AdminController.createOrUpdateConfiguration);
router.put('/admin/configurations/:key', AdminController.createOrUpdateConfiguration); // Re-use for update
router.delete('/admin/configurations/:key', AdminController.deleteConfiguration);

// Reference Data Routes
router.get('/admin/reference-data/:category', AdminController.getReferenceDataByCategory);
router.get('/admin/reference-data/:category/:id', AdminController.getReferenceDataById);
router.post('/admin/reference-data', AdminController.createReferenceData);
router.put('/admin/reference-data/:id', AdminController.updateReferenceData);
router.delete('/admin/reference-data/:id', AdminController.deleteReferenceData);
router.post('/admin/reference-data/initialize-defaults', AdminController.initializeDefaultReferenceData);

// System Utilities Routes
router.get('/admin/health', AdminController.getSystemHealth);
router.get('/admin/statistics', AdminController.getSystemStatistics);

module.exports = router;


