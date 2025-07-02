
const { Model } = require('objection');

class Equipment extends Model {
  static get tableName() {
    return 'equipments';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['identification', 'type', 'status'],

      properties: {
        id: { type: ['integer','string'] },
        identification: { type: 'string', minLength: 1, maxLength: 255 },
        type: { type: 'string', minLength: 1, maxLength: 255 }, // e.g., 'remorque', 'conteneur', 'hayon'
        characteristics: { type: 'string', maxLength: 1000 }, // JSON string or text for dimensions, capacity, compatibilities
        financialInfo: { type: 'string', maxLength: 1000 }, // JSON string or text for cost, amortization, ownership/lease
        status: { type: 'string', enum: ['available', 'in_maintenance', 'reserved', 'in_use', 'out_of_service'] },
        location: { type: 'string', maxLength: 255 }, // Current physical location or last known GPS location
        lastMaintenanceDate: { type: 'string', format: 'date-time' },
        nextMaintenanceDate: { type: 'string', format: 'date-time' },
        documents: { type: 'string', maxLength: 1000 }, // JSON string for associated documents (e.g., 'immatriculation', 'certificats')
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    };
  }
}

module.exports = Equipment;


