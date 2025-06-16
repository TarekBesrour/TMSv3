const ResourceAvailability = require("../models/ResourceAvailability");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const { ValidationError } = require("../utils/errors");

class ResourceAllocationService {
  /**
   * Enregistre la disponibilité d'une ressource (véhicule ou chauffeur).
   * @param {object} availabilityData - Données de disponibilité.
   * @returns {Promise<ResourceAvailability>} La disponibilité enregistrée.
   */
  static async createAvailability(availabilityData) {
    if (!availabilityData.resource_type || !availabilityData.resource_id || !availabilityData.start_time || !availabilityData.end_time || !availabilityData.tenant_id) {
      throw new ValidationError("Le type de ressource, l'ID de ressource, l'heure de début, l'heure de fin et l'ID du locataire sont requis.");
    }
    return ResourceAvailability.query().insert(availabilityData);
  }

  /**
   * Récupère la disponibilité d'une ressource par son ID.
   * @param {number} availabilityId - ID de la disponibilité.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<ResourceAvailability>} La disponibilité trouvée.
   */
  static async getAvailabilityById(availabilityId, tenantId) {
    const availability = await ResourceAvailability.query().where({ id: availabilityId, tenant_id: tenantId }).first();
    if (!availability) {
      throw new ValidationError("Disponibilité non trouvée.", 404);
    }
    return availability;
  }

  /**
   * Met à jour la disponibilité d'une ressource.
   * @param {number} availabilityId - ID de la disponibilité.
   * @param {number} tenantId - ID du locataire.
   * @param {object} updateData - Données de mise à jour.
   * @returns {Promise<ResourceAvailability>} La disponibilité mise à jour.
   */
  static async updateAvailability(availabilityId, tenantId, updateData) {
    const availability = await ResourceAvailability.query().where({ id: availabilityId, tenant_id: tenantId }).first();
    if (!availability) {
      throw new ValidationError("Disponibilité non trouvée.", 404);
    }
    return availability.$query().patchAndFetch(updateData);
  }

  /**
   * Supprime une entrée de disponibilité.
   * @param {number} availabilityId - ID de la disponibilité.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<number>} Nombre d'entrées supprimées.
   */
  static async deleteAvailability(availabilityId, tenantId) {
    const deletedCount = await ResourceAvailability.query().where({ id: availabilityId, tenant_id: tenantId }).delete();
    if (deletedCount === 0) {
      throw new ValidationError("Disponibilité non trouvée.", 404);
    }
    return deletedCount;
  }

  /**
   * Liste les disponibilités des ressources avec filtres.
   * @param {object} options - Options de recherche et pagination.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<object>} Liste des disponibilités et pagination.
   */
  static async listAvailabilities({ page = 1, pageSize = 10, resource_type, resource_id, status, start_time_after, end_time_before }, tenantId) {
    const query = ResourceAvailability.query().where({ tenant_id: tenantId });

    if (resource_type) {
      query.where({ resource_type });
    }
    if (resource_id) {
      query.where({ resource_id });
    }
    if (status) {
      query.where({ status });
    }
    if (start_time_after) {
      query.where("start_time", ">=", start_time_after);
    }
    if (end_time_before) {
      query.where("end_time", "<=", end_time_before);
    }

    const availabilities = await query.page(page - 1, pageSize).orderBy("start_time", "desc");

    return {
      data: availabilities.results,
      pagination: {
        total: availabilities.total,
        page,
        pageSize,
        totalPages: Math.ceil(availabilities.total / pageSize)
      }
    };
  }

  /**
   * Vérifie la disponibilité d'une ressource pour une période donnée.
   * @param {string} resourceType - Type de ressource ('vehicle' ou 'driver').
   * @param {number} resourceId - ID de la ressource.
   * @param {string} startTime - Heure de début de la période (ISO string).
   * @param {string} endTime - Heure de fin de la période (ISO string).
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<boolean>} True si la ressource est disponible, false sinon.
   */
  static async checkAvailability(resourceType, resourceId, startTime, endTime, tenantId) {
    const conflicts = await ResourceAvailability.query()
      .where({ tenant_id: tenantId, resource_type: resourceType, resource_id: resourceId })
      .andWhere(builder => {
        builder.where(innerBuilder => {
          innerBuilder.where("start_time", "<", endTime)
                      .andWhere("end_time", ">", startTime);
        })
        .orWhere("status", "unavailable"); // Consider explicitly unavailable periods
      })
      .first();

    return !conflicts;
  }

  /**
   * Récupère les ressources disponibles pour une période.
   * @param {string} resourceType - Type de ressource ('vehicle' ou 'driver').
   * @param {string} startTime - Heure de début de la période (ISO string).
   * @param {string} endTime - Heure de fin de la période (ISO string).
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<Array<Vehicle|Driver>>} Liste des ressources disponibles.
   */
  static async getAvailableResources(resourceType, startTime, endTime, tenantId) {
    let availableResources = [];
    let allResources = [];

    if (resourceType === "vehicle") {
      allResources = await Vehicle.query().where({ tenant_id: tenantId, status: "active" });
    } else if (resourceType === "driver") {
      allResources = await Driver.query().where({ tenant_id: tenantId, status: "active" });
    } else {
      throw new ValidationError("Type de ressource invalide. Doit être 'vehicle' ou 'driver'.");
    }

    for (const resource of allResources) {
      const isAvailable = await this.checkAvailability(resourceType, resource.id, startTime, endTime, tenantId);
      if (isAvailable) {
        availableResources.push(resource);
      }
    }

    return availableResources;
  }
}

module.exports = ResourceAllocationService;

