const express = require("express");
const router = express.Router();
const ResourceAllocationController = require("../controllers/ResourceAllocationController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Apply authentication middleware to all resource allocation routes
router.use(authenticateToken);

// Availability routes
router.post("/availabilities", ResourceAllocationController.createAvailability);
router.get("/availabilities", ResourceAllocationController.listAvailabilities);
router.get("/availabilities/:id", ResourceAllocationController.getAvailabilityById);
router.put("/availabilities/:id", ResourceAllocationController.updateAvailability);
router.delete("/availabilities/:id", ResourceAllocationController.deleteAvailability);

// Resource availability check and listing
router.get("/check-availability", ResourceAllocationController.checkAvailability);
router.get("/available-resources", ResourceAllocationController.getAvailableResources);

module.exports = router;

