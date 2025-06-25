const Tour = require('../models/Tour');
const TourStop = require('../models/TourStop');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const Address = require('../models/Address');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { ValidationError } = require('../utils/errors');

class TourPlanningService {
  /**
   * Crée une nouvelle tournée.
   * @param {object} tourData - Données de la tournée.
   * @returns {Promise<Tour>} La tournée créée.
   */
  static async createTour(tourData) {
    if (!tourData.tour_name || !tourData.planned_date || !tourData.tenant_id) {
      throw new ValidationError('Le nom de la tournée, la date planifiée et l\'ID du locataire sont requis.');
    }
    return Tour.query().insert(tourData);
  }

  /**
   * Récupère une tournée par son ID.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<Tour>} La tournée trouvée.
   */
  static async getTourById(tourId, tenantId) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).withGraphFetched('[vehicle, driver, stops.address, stops.order, stops.shipment]').first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }
    return tour;
  }

  /**
   * Met à jour une tournée existante.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @param {object} updateData - Données de mise à jour.
   * @returns {Promise<Tour>} La tournée mise à jour.
   */
  static async updateTour(tourId, tenantId, updateData) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }
    return tour.$query().patchAndFetch(updateData);
  }

  /**
   * Supprime une tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<number>} Nombre de tournées supprimées.
   */
  static async deleteTour(tourId, tenantId) {
    const deletedCount = await Tour.query().where({ id: tourId, tenant_id: tenantId }).delete();
    if (deletedCount === 0) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }
    return deletedCount;
  }

  /**
   * Liste toutes les tournées avec pagination et filtres.
   * @param {object} options - Options de recherche et pagination.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<object>} Liste des tournées et pagination.
   */
  static async listTours({ page = 1, pageSize = 10, searchTerm, status, planned_date_start, planned_date_end, vehicle_id, driver_id }, tenantId) {
    const query = Tour.query().where({ tenant_id: tenantId });

    if (searchTerm) {
      query.where(builder => {
        builder.where('tour_name', 'ilike', `%${searchTerm}%`)
               .orWhere('tour_number', 'ilike', `%${searchTerm}%`);
      });
    }
    if (status) {
      query.where({ status });
    }
    if (planned_date_start) {
      query.where('planned_date', '>=', planned_date_start);
    }
    if (planned_date_end) {
      query.where('planned_date', '<=', planned_date_end);
    }
    if (vehicle_id) {
      query.where({ vehicle_id });
    }
    if (driver_id) {
      query.where({ driver_id });
    }

    const tours = await query.page(page - 1, pageSize).withGraphFetched('[vehicle, driver]').orderBy('planned_date', 'desc');

    return {
      data: tours.results,
      pagination: {
        total: tours.total,
        page,
        pageSize,
        totalPages: Math.ceil(tours.total / pageSize)
      }
    };
  }

  /**
   * Ajoute un arrêt à une tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @param {object} stopData - Données de l'arrêt.
   * @returns {Promise<TourStop>} L'arrêt créé.
   */
  static async addStopToTour(tourId, tenantId, stopData) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }
    if (!stopData.address_id || !stopData.scheduled_time || !stopData.location_type) {
      throw new ValidationError("L'adresse, l'heure planifiée et le type de lieu sont requis pour un arrêt.");
    }
    return tour.$relatedQuery('stops').insert(stopData);
  }

  /**
   * Met à jour un arrêt de tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} stopId - ID de l'arrêt.
   * @param {number} tenantId - ID du locataire.
   * @param {object} updateData - Données de mise à jour.
   * @returns {Promise<TourStop>} L'arrêt mis à jour.
   */
  static async updateTourStop(tourId, stopId, tenantId, updateData) {
    const stop = await TourStop.query().where({ id: stopId, tour_id: tourId }).first();
    if (!stop) {
      throw new ValidationError('Arrêt de tournée non trouvé.', 404);
    }
    // Ensure the tour belongs to the tenant
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée pour ce locataire.', 404);
    }
    return stop.$query().patchAndFetch(updateData);
  }

  /**
   * Supprime un arrêt de tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} stopId - ID de l'arrêt.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<number>} Nombre d'arrêts supprimés.
   */
  static async deleteTourStop(tourId, stopId, tenantId) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée pour ce locataire.', 404);
    }
    const deletedCount = await TourStop.query().where({ id: stopId, tour_id: tourId }).delete();
    if (deletedCount === 0) {
      throw new ValidationError('Arrêt de tournée non trouvé.', 404);
    }
    return deletedCount;
  }

  /**
   * Optimise une tournée existante.
   * Cette fonction simule une optimisation de route. Dans un cas réel, elle ferait appel à un algorithme d'optimisation ou un service externe.
   * @param {number} tourId - ID de la tournée à optimiser.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<Tour>} La tournée optimisée.
   */
  static async optimizeTour(tourId, tenantId) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).withGraphFetched('[stops.address]').first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }

    if (!tour.stops || tour.stops.length < 2) {
      throw new ValidationError('Une tournée doit avoir au moins deux arrêts pour être optimisée.');
    }

    // --- Simulation d'optimisation de route --- //
    // Dans un cas réel, on utiliserait un service de routage (ex: Google Maps API, OpenStreetMap, OR-Tools)
    // pour calculer l'itinéraire optimal, la distance et la durée.

    // 1. Collecter les adresses des arrêts
    const addresses = tour.stops.map(stop => stop.address);
    if (addresses.some(addr => !addr || !addr.latitude || !addr.longitude)) {
      throw new ValidationError("Toutes les adresses des arrêts doivent avoir des coordonnées géographiques (latitude, longitude) pour l'optimisation.");
    }

    // 2. Simuler le calcul de distance et de durée (très simplifié)
    let simulatedTotalDistance = 0;
    let simulatedEstimatedDuration = 0; // in minutes

    // Pour la simulation, on va juste ordonner les arrêts par leur ordre actuel
    // et calculer une distance et durée fictives.
    // En réalité, il faudrait un algorithme d'optimisation (ex: VRP solver) ici.
    const optimizedStops = [...tour.stops].sort((a, b) => a.stop_order - b.stop_order);

    // Simuler la distance et la durée entre les arrêts
    for (let i = 0; i < optimizedStops.length - 1; i++) {
      const stop1 = optimizedStops[i];
      const stop2 = optimizedStops[i + 1];

      // Calcul de distance euclidienne simplifiée (pour la simulation)
      const dist = Math.sqrt(
        Math.pow(stop1.address.latitude - stop2.address.latitude, 2) +
        Math.pow(stop1.address.longitude - stop2.address.longitude, 2)
      ) * 100; // Multiplicateur pour rendre la distance plus réaliste

      simulatedTotalDistance += dist;
      simulatedEstimatedDuration += (dist / 50) * 60; // Simuler 50 km/h de moyenne
      simulatedEstimatedDuration += stop1.service_duration || 0; // Ajouter le temps de service à l'arrêt
    }
    // Ajouter le temps de service du dernier arrêt
    simulatedEstimatedDuration += optimizedStops[optimizedStops.length - 1].service_duration || 0;

    // Mettre à jour la tournée avec les valeurs optimisées
    const updatedTour = await tour.$query().patchAndFetch({
      total_distance: simulatedTotalDistance,
      estimated_duration: simulatedEstimatedDuration,
      optimization_score: tour.calculateOptimizationScore() // Recalculer le score
    });

    return updatedTour;
  }

  /**
   * Génère un rapport d'optimisation pour une tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @returns {Promise<object>} Rapport d'optimisation.
   */
  static async generateOptimizationReport(tourId, tenantId) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).withGraphFetched('[vehicle, driver, stops.address, stops.order, stops.shipment]').first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }

    const report = {
      tour_id: tour.id,
      tour_name: tour.tour_name,
      tour_number: tour.tour_number,
      planned_date: tour.planned_date,
      status: tour.status,
      vehicle: tour.vehicle ? { id: tour.vehicle.id, license_plate: tour.vehicle.license_plate } : null,
      driver: tour.driver ? { id: tour.driver.id, name: tour.driver.first_name + ' ' + tour.driver.last_name } : null,
      total_distance: tour.total_distance,
      estimated_duration: tour.estimated_duration,
      optimization_score: tour.optimization_score,
      stops_count: tour.stops ? tour.stops.length : 0,
      stops_details: tour.stops ? tour.stops.map(stop => ({
        stop_order: stop.stop_order,
        location_type: stop.location_type,
        address: stop.address ? `${stop.address.street}, ${stop.address.city}, ${stop.address.zip_code}` : 'N/A',
        scheduled_time: stop.scheduled_time,
        order_id: stop.order_id,
        shipment_id: stop.shipment_id,
        service_duration: stop.service_duration
      })) : [],
      efficiency_metrics: tour.getEfficiencyMetrics()
    };

    return report;
  }

  /**
   * Met à jour le statut d'une tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @param {string} newStatus - Nouveau statut de la tournée.
   * @returns {Promise<Tour>} La tournée mise à jour.
   */
  static async updateTourStatus(tourId, tenantId, newStatus) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }
    if (!['planned', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
      throw new ValidationError('Statut de tournée invalide.');
    }
    return tour.$query().patchAndFetch({ status: newStatus });
  }

  /**
   * Affecte un véhicule et un chauffeur à une tournée.
   * @param {number} tourId - ID de la tournée.
   * @param {number} tenantId - ID du locataire.
   * @param {number} vehicleId - ID du véhicule.
   * @param {number} driverId - ID du chauffeur.
   * @returns {Promise<Tour>} La tournée mise à jour.
   */
  static async assignVehicleAndDriver(tourId, tenantId, vehicleId, driverId) {
    const tour = await Tour.query().where({ id: tourId, tenant_id: tenantId }).first();
    if (!tour) {
      throw new ValidationError('Tournée non trouvée.', 404);
    }
    const vehicle = await Vehicle.query().findById(vehicleId);
    if (!vehicle) {
      throw new ValidationError('Véhicule non trouvé.', 404);
    }
    const driver = await Driver.query().findById(driverId);
    if (!driver) {
      throw new ValidationError('Chauffeur non trouvé.', 404);
    }
    return tour.$query().patchAndFetch({ vehicle_id: vehicleId, driver_id: driverId });
  }
}

module.exports = TourPlanningService;

