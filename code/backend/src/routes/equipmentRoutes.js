

const express = require("express");
const router = express.Router();
const EquipmentController = require("../controllers/EquipmentController");

router.get("/", EquipmentController.getAllEquipments);
router.get("/:id", EquipmentController.getEquipmentById);
router.post("/", EquipmentController.createEquipment);
router.put("/:id", EquipmentController.updateEquipment);
router.delete("/:id", EquipmentController.deleteEquipment);

module.exports = router;


