

const EquipmentService = require("../services/EquipmentService");

class EquipmentController {
  static async getAllEquipments(req, res) {
    try {
      const filters = req.query;
      const pagination = { page: parseInt(req.query.page), pageSize: parseInt(req.query.pageSize) };
      const equipments = await EquipmentService.getAllEquipments(filters, pagination);
      res.json(equipments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getEquipmentById(req, res) {
    try {
      const equipment = await EquipmentService.getEquipmentById(req.params.id);
      if (equipment) {
        res.json(equipment);
      } else {
        res.status(404).json({ message: "Equipment not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createEquipment(req, res) {
    try {
      const newEquipment = await EquipmentService.createEquipment(req.body);
      res.status(201).json(newEquipment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateEquipment(req, res) {
    try {
      const updatedEquipment = await EquipmentService.updateEquipment(req.params.id, req.body);
      if (updatedEquipment) {
        res.json(updatedEquipment);
      } else {
        res.status(404).json({ message: "Equipment not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteEquipment(req, res) {
    try {
      const deleted = await EquipmentService.deleteEquipment(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Equipment not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EquipmentController;


