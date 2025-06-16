const ResourceAllocationService = require("../services/ResourceAllocationService");
const { handleError } = require("../utils/errorHandler");

class ResourceAllocationController {
  static async createAvailability(req, res) {
    try {
      const availability = await ResourceAllocationService.createAvailability({ ...req.body, tenant_id: req.user.tenant_id });
      res.status(201).json({ success: true, data: availability });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getAvailabilityById(req, res) {
    try {
      const availability = await ResourceAllocationService.getAvailabilityById(req.params.id, req.user.tenant_id);
      res.status(200).json({ success: true, data: availability });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateAvailability(req, res) {
    try {
      const availability = await ResourceAllocationService.updateAvailability(req.params.id, req.user.tenant_id, req.body);
      res.status(200).json({ success: true, data: availability });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteAvailability(req, res) {
    try {
      await ResourceAllocationService.deleteAvailability(req.params.id, req.user.tenant_id);
      res.status(200).json({ success: true, message: "Disponibilité supprimée avec succès." });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async listAvailabilities(req, res) {
    try {
      const availabilities = await ResourceAllocationService.listAvailabilities(req.query, req.user.tenant_id);
      res.status(200).json({ success: true, data: availabilities });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async checkAvailability(req, res) {
    try {
      const { resource_type, resource_id, start_time, end_time } = req.query;
      const isAvailable = await ResourceAllocationService.checkAvailability(resource_type, resource_id, start_time, end_time, req.user.tenant_id);
      res.status(200).json({ success: true, data: { isAvailable } });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getAvailableResources(req, res) {
    try {
      const { resource_type, start_time, end_time } = req.query;
      const availableResources = await ResourceAllocationService.getAvailableResources(resource_type, start_time, end_time, req.user.tenant_id);
      res.status(200).json({ success: true, data: availableResources });
    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = ResourceAllocationController;

