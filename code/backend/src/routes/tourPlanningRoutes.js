const express = require("express");
const router = express.Router();
const TourPlanningController = require("../controllers/TourPlanningController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply authentication middleware to all tour planning routes
router.use(authMiddleware.authenticate);

// Tour routes
router.post("/tours", TourPlanningController.createTour);
router.get("/tours", TourPlanningController.listTours);
router.get("/tours/:id", TourPlanningController.getTourById);
router.put("/tours/:id", TourPlanningController.updateTour);
router.delete("/tours/:id", TourPlanningController.deleteTour);

// Tour stop routes
router.post("/tours/:tourId/stops", TourPlanningController.addStopToTour);
router.put("/tours/:tourId/stops/:stopId", TourPlanningController.updateTourStop);
router.delete("/tours/:tourId/stops/:stopId", TourPlanningController.deleteTourStop);

// Tour optimization and status routes
router.post("/tours/:id/optimize", TourPlanningController.optimizeTour);
router.get("/tours/:id/report", TourPlanningController.generateOptimizationReport);
router.patch("/tours/:id/status", TourPlanningController.updateTourStatus);
router.patch("/tours/:id/assign", TourPlanningController.assignVehicleAndDriver);

module.exports = router;

