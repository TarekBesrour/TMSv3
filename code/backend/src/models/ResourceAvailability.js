const { Model } = require("objection");

class ResourceAvailability extends Model {
  static get tableName() {
    return "resource_availabilities";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["resource_type", "resource_id", "start_time", "end_time", "status", "tenant_id"],
      properties: {
        id: { type: "integer" },
        tenant_id: { type: 'string' },
        resource_type: { type: "string", enum: ["vehicle", "driver"] },
        resource_id: { type: "integer" },
        start_time: { type: "string", format: "date-time" },
        end_time: { type: "string", format: "date-time" },
        status: { type: "string", enum: ["available", "unavailable", "booked", "maintenance"] },
        notes: { type: ["string", "null"] },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }

  static get relationMappings() {
    const Vehicle = require("./Vehicle");
    const Driver = require("./Driver");
    const Tenant = require("./Tenant");

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: "resource_availabilities.tenant_id",
          to: "tenants.id",
        },
      },
      vehicle: {
        relation: Model.BelongsToOneRelation,
        modelClass: Vehicle,
        join: {
          from: "resource_availabilities.resource_id",
          to: "vehicles.id",
        },
        filter: (query) => query.where("resource_type", "vehicle"),
      },
      driver: {
        relation: Model.BelongsToOneRelation,
        modelClass: Driver,
        join: {
          from: "resource_availabilities.resource_id",
          to: "drivers.id",
        },
        filter: (query) => query.where("resource_type", "driver"),
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

module.exports = ResourceAvailability;

