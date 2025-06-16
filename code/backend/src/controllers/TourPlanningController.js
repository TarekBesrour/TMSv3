const TourPlanningService = require("../services/TourPlanningService");
const { handleError } = require("../utils/errorHandler");

class TourPlanningController {
  static async createTour(req, res) {
    try {
      const tour = await TourPlanningService.createTour({ ...req.body, tenant_id: req.user.tenant_id });
      res.status(201).json({ success: true, data: tour });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getTourById(req, res) {
    try {
      const tour = await TourPlanningService.getTourById(req.params.id, req.user.tenant_id);
      res.status(200).json({ success: true, data: tour });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateTour(req, res) {
    try {
      const tour = await TourPlanningService.updateTour(req.params.id, req.user.tenant_id, req.body);
      res.status(200).json({ success: true, data: tour });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteTour(req, res) {
    try {
      await TourPlanningService.deleteTour(req.params.id, req.user.tenant_id);
      res.status(200).json({ success: true, message: "Tournée supprimée avec succès." });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async listTours(req, res) {
    try {
      const tours = await TourPlanningService.listTours(req.query, req.user.tenant_id);
      res.status(200).json({ success: true, data: tours });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async addStopToTour(req, res) {
    try {
      const stop = await TourPlanningService.addStopToTour(req.params.tourId, req.user.tenant_id, req.body);
      res.status(201).json({ success: true, data: stop });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateTourStop(req, res) {
    try {
      const stop = await TourPlanningService.updateTourStop(req.params.tourId, req.params.stopId, req.user.tenant_id, req.body);
      res.status(200).json({ success: true, data: stop });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async deleteTourStop(req, res) {
    try {
      await TourPlanningService.deleteTourStop(req.params.tourId, req.params.stopId, req.user.tenant_id);
      res.status(200).json({ success: true, message: "Arrêt de tournée supprimé avec succès." });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async optimizeTour(req, res) {
    try {
      const tour = await TourPlanningService.optimizeTour(req.params.id, req.user.tenant_id);
      res.status(200).json({ success: true, data: tour });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async generateOptimizationReport(req, res) {
    try {
      const report = await TourPlanningService.generateOptimizationReport(req.params.id, req.user.tenant_id);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateTourStatus(req, res) {
    try {
      const tour = await TourPlanningService.updateTourStatus(req.params.id, req.user.tenant_id, req.body.status);
      res.status(200).json({ success: true, data: tour });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async assignVehicleAndDriver(req, res) {
    try {
      const tour = await TourPlanningService.assignVehicleAndDriver(req.params.id, req.user.tenant_id, req.body.vehicle_id, req.body.driver_id);
      res.status(200).json({ success: true, data: tour });
    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = TourPlanningController;

