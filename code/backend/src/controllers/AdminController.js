const AdminService = require('../services/AdminService');
const { validationResult } = require('express-validator');

class AdminController {
  /**
   * System Configuration Management
   */

  async getConfigurations(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };
      const configurations = await AdminService.getConfigurations(filters.tenant_id, filters);
      res.json({ success: true, data: configurations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getConfigurationByKey(req, res) {
    try {
      const { key } = req.params;
      const configuration = await AdminService.getConfigurationByKey(req.user.tenant_id, key);
      res.json({ success: true, data: configuration });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createOrUpdateConfiguration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid validation data', errors: errors.array() });
      }

      const configData = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };
      const configuration = await AdminService.createOrUpdateConfiguration(configData, req.user.id);
      res.status(201).json({ success: true, message: 'Configuration saved successfully', data: configuration });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteConfiguration(req, res) {
    try {
      const { key } = req.params;
      const result = await AdminService.deleteConfiguration(req.user.tenant_id, key);
      res.json({ success: true, message: 'Configuration deleted successfully' });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Reference Data Management
   */

  async getReferenceDataByCategory(req, res) {
    try {
      const { category } = req.params;
      const options = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };
      const referenceData = await AdminService.getReferenceDataByCategory(options.tenant_id, category, options);
      res.json({ success: true, data: referenceData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getReferenceDataById(req, res) {
    try {
      const { id } = req.params;
      const referenceData = await AdminService.getReferenceDataById(id, true);
      res.json({ success: true, data: referenceData });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
    }

  async createReferenceData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid validation data', errors: errors.array() });
      }

      const refData = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };
      const referenceData = await AdminService.createReferenceData(refData, req.user.id);
      res.status(201).json({ success: true, message: 'Reference data created successfully', data: referenceData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateReferenceData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid validation data', errors: errors.array() });
      }

      const { id } = req.params;
      const refData = req.body;
      const referenceData = await AdminService.updateReferenceData(id, refData, req.user.id);
      res.json({ success: true, message: 'Reference data updated successfully', data: referenceData });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteReferenceData(req, res) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteReferenceData(id);
      res.json({ success: true, message: 'Reference data deleted successfully' });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async initializeDefaultReferenceData(req, res) {
    try {
      await AdminService.initializeDefaultReferenceData(req.user.tenant_id, req.user.id);
      res.json({ success: true, message: 'Default reference data initialized successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * System Utilities
   */

  async getSystemHealth(req, res) {
    try {
      const health = await AdminService.getSystemHealth(req.user.tenant_id);
      res.json({ success: true, data: health });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSystemStatistics(req, res) {
    try {
      const stats = await AdminService.getSystemStatistics(req.user.tenant_id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();


