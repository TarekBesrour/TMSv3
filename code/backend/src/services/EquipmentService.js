
const Equipment = require("../models/Equipment");

class EquipmentService {
  static async getAllEquipments(filters, pagination) {
    let query = Equipment.query();

    if (filters.type) {
      query = query.where("type", filters.type);
    }
    if (filters.status) {
      query = query.where("status", filters.status);
    }
    if (filters.identification) {
      query = query.where("identification", "like", `%${filters.identification}%`);
    }

    if (pagination.page && pagination.pageSize) {
      const offset = (pagination.page - 1) * pagination.pageSize;
      query = query.offset(offset).limit(pagination.pageSize);
    }

    return query;
  }

  static async getEquipmentById(id) {
    return Equipment.query().findById(id);
  }

  static async createEquipment(equipmentData) {
    return Equipment.query().insert(equipmentData);
  }

  static async updateEquipment(id, equipmentData) {
    return Equipment.query().patchAndFetchById(id, equipmentData);
  }

  static async deleteEquipment(id) {
    return Equipment.query().deleteById(id);
  }
}

module.exports = EquipmentService;


