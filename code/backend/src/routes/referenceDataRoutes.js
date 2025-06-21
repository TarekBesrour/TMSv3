/**
 * Reference Data Routes
 * 
 * Routes for managing reference data in the TMS system.
 */

const express = require('express');
const multer = require('multer');
const ReferenceDataController = require('../controllers/ReferenceDataController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.xlsx'];
    const fileExtension = file.originalname.toLowerCase().slice(-4);
    
    if (allowedTypes.some(type => fileExtension.endsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, JSON, and Excel files are allowed.'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all reference types
router.get('/types', ReferenceDataController.getReferenceTypes);

// Get all entries for a specific reference type
router.get('/:typeId/entries', ReferenceDataController.getReferenceEntries);

// Get a single reference entry by ID
router.get('/:typeId/entries/:id', ReferenceDataController.getReferenceEntry);

// Create a new reference entry
router.post('/:typeId/entries', ReferenceDataController.createReferenceEntry);

// Update an existing reference entry
router.put('/:typeId/entries/:id', ReferenceDataController.updateReferenceEntry);

// Deactivate a reference entry (soft delete)
router.patch('/:typeId/entries/:id/deactivate', ReferenceDataController.deactivateReferenceEntry);

// Activate a reference entry
router.patch('/:typeId/entries/:id/activate', ReferenceDataController.activateReferenceEntry);

// Import reference data
router.post('/:typeId/import', upload.single('file'), ReferenceDataController.importReferenceData);

// Export reference data
router.get('/:typeId/export', ReferenceDataController.exportReferenceData);

// Configure external synchronization for a reference type
router.post('/:typeId/sync/configure', ReferenceDataController.configureSynchronization);

// Trigger manual synchronization for a reference type
router.post('/:typeId/sync/trigger', ReferenceDataController.triggerSynchronization);

// Get synchronization history for a reference type
router.get('/:typeId/sync/history', ReferenceDataController.getSynchronizationHistory);

module.exports = router;

