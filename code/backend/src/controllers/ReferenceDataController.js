/**
 * ReferenceDataController
 * 
 * Controller for managing reference data in the TMS system.
 * Handles CRUD operations, import/export, and synchronization.
 */

const ReferenceDataService = require('../services/ReferenceDataService');

class ReferenceDataController {
  
  /**
   * Get all reference types
   * GET /api/v1/references/types
   */
  static async getReferenceTypes(req, res) {
    try {
      console.log('req.user:', req.user);
      const types = await ReferenceDataService.getReferenceTypes(req.user.tenant_id);
      res.json(types);
    } catch (error) {
      console.error('Error getting reference types:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Get all entries for a specific reference type
   * GET /api/v1/references/:typeId/entries
   */
  static async getReferenceEntries(req, res) {
    try {
      const { typeId } = req.params;
      const { page = 1, limit = 10, search, sortBy = 'code', sortOrder = 'asc' } = req.query;
      
      const result = await ReferenceDataService.getReferenceEntries(
        req.user.tenant_id,
        typeId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
          sortBy,
          sortOrder
        }
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error getting reference entries:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Get a single reference entry by ID
   * GET /api/v1/references/:typeId/entries/:id
   */
  static async getReferenceEntry(req, res) {
    try {
      const { typeId, id } = req.params;
      
      const entry = await ReferenceDataService.getReferenceEntry(
        req.user.tenant_id,
        typeId,
        parseInt(id)
      );
      
      if (!entry) {
        return res.status(404).json({ 
          error: 'Reference entry not found' 
        });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error getting reference entry:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Create a new reference entry
   * POST /api/v1/references/:typeId/entries
   */
  static async createReferenceEntry(req, res) {
    try {
      const { typeId } = req.params;
      const entryData = {
        ...req.body,
        category: typeId,
        tenant_id: req.user.tenant_id,
        created_by: req.user.id,
        updated_by: req.user.id
      };
      
      const entry = await ReferenceDataService.createReferenceEntry(entryData);
      
      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating reference entry:', error);
      
      if (error.message.includes('validation')) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Update an existing reference entry
   * PUT /api/v1/references/:typeId/entries/:id
   */
  static async updateReferenceEntry(req, res) {
    try {
      const { typeId, id } = req.params;
      const updateData = {
        ...req.body,
        updated_by: req.user.id
      };
      
      const entry = await ReferenceDataService.updateReferenceEntry(
        req.user.tenant_id,
        typeId,
        parseInt(id),
        updateData
      );
      
      if (!entry) {
        return res.status(404).json({ 
          error: 'Reference entry not found' 
        });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error updating reference entry:', error);
      
      if (error.message.includes('validation')) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Deactivate a reference entry (soft delete)
   * PATCH /api/v1/references/:typeId/entries/:id/deactivate
   */
  static async deactivateReferenceEntry(req, res) {
    try {
      const { typeId, id } = req.params;
      
      const entry = await ReferenceDataService.updateReferenceEntry(
        req.user.tenant_id,
        typeId,
        parseInt(id),
        { 
          is_active: false,
          updated_by: req.user.id
        }
      );
      
      if (!entry) {
        return res.status(404).json({ 
          error: 'Reference entry not found' 
        });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error deactivating reference entry:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Activate a reference entry
   * PATCH /api/v1/references/:typeId/entries/:id/activate
   */
  static async activateReferenceEntry(req, res) {
    try {
      const { typeId, id } = req.params;
      
      const entry = await ReferenceDataService.updateReferenceEntry(
        req.user.tenant_id,
        typeId,
        parseInt(id),
        { 
          is_active: true,
          updated_by: req.user.id
        }
      );
      
      if (!entry) {
        return res.status(404).json({ 
          error: 'Reference entry not found' 
        });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error activating reference entry:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Import reference data
   * POST /api/v1/references/:typeId/import
   */
  static async importReferenceData(req, res) {
    try {
      const { typeId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file provided' 
        });
      }
      
      const result = await ReferenceDataService.importReferenceData(
        req.user.tenant_id,
        typeId,
        req.file,
        req.user.id
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error importing reference data:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Export reference data
   * GET /api/v1/references/:typeId/export
   */
  static async exportReferenceData(req, res) {
    try {
      const { typeId } = req.params;
      const { format = 'csv' } = req.query;
      
      const result = await ReferenceDataService.exportReferenceData(
        req.user.tenant_id,
        typeId,
        format
      );
      
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      console.error('Error exporting reference data:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Configure external synchronization for a reference type
   * POST /api/v1/references/:typeId/sync/configure
   */
  static async configureSynchronization(req, res) {
    try {
      const { typeId } = req.params;
      const { source, frequency, mappingRules, validationRules } = req.body;
      
      const result = await ReferenceDataService.configureSynchronization(
        req.user.tenant_id,
        typeId,
        {
          source,
          frequency,
          mappingRules,
          validationRules,
          configured_by: req.user.id
        }
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error configuring synchronization:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Trigger manual synchronization for a reference type
   * POST /api/v1/references/:typeId/sync/trigger
   */
  static async triggerSynchronization(req, res) {
    try {
      const { typeId } = req.params;
      
      const result = await ReferenceDataService.triggerSynchronization(
        req.user.tenant_id,
        typeId,
        req.user.id
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error triggering synchronization:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }

  /**
   * Get synchronization history for a reference type
   * GET /api/v1/references/:typeId/sync/history
   */
  static async getSynchronizationHistory(req, res) {
    try {
      const { typeId } = req.params;
      
      const history = await ReferenceDataService.getSynchronizationHistory(
        req.user.tenant_id,
        typeId
      );
      
      res.json(history);
    } catch (error) {
      console.error('Error getting synchronization history:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
}

module.exports = ReferenceDataController;

