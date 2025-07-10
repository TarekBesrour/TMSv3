
const { Model } = require('objection');

class Equipment extends Model {
  static get tableName() {
    return 'equipments';
  }

   static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id','identification', 'type', 'status'],

      properties: {
        id: { type: 'string' },
        tenant_id: { type: 'string' },
        identification: { type: 'string', minLength: 1, maxLength: 255 },
        type: { type: 'string', minLength: 1, maxLength: 255 }, // e.g., 'remorque', 'conteneur', 'hayon'
        characteristics: { type: ['object', 'null'] }, // JSON string or text for dimensions, capacity, compatibilities
        financialInfo: { type: ['object', 'null'] }, // JSON string or text for cost, amortization, ownership/lease
        status: { type: 'string', enum: ['available', 'in_maintenance', 'reserved', 'in_use', 'out_of_service'] },
        location: { type: 'string', maxLength: 255 }, // Current physical location or last known GPS location
        lastMaintenanceDate: { type: 'string', format: 'date-time' },
        nextMaintenanceDate: { type: 'string', format: 'date-time' },
        documents: { type: ['object', 'null'] }, // JSON string for associated documents (e.g., 'immatriculation', 'certificats')
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: 'string' },
        updated_by: { type: 'string' }
      },
    };
  }

  static get relationMappings() {
    const Tenant = require('./Tenant');
    const User = require('./User');
    

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'equipments.tenant_id',
          to: 'tenants.id'
        }
      },

      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'equipments.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'equipments.updated_by',
          to: 'users.id'
        }
      },
      
    };
  }

  $beforeInsert() {
  this.created_at = new Date().toISOString();
  this.updated_at = new Date().toISOString();
}

$beforeUpdate() {
  this.updated_at = new Date().toISOString();
}

}

module.exports = Equipment;


