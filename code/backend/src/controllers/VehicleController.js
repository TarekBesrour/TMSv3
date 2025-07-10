// VehicleController.js
const vehicleService = require('../services/VehicleService');

const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getVehicles({
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      search: req.query.search || '',
      partnerId: req.query.partnerId,
      type: req.query.type,
      status: req.query.status,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder || 'asc'
    });
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id, {
      withPartner: req.query.withPartner === 'true'
    });
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const userId = String(req.user?.id || '1');
    const created = await vehicleService.createVehicle(req.body, userId);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const userId = String(req.user?.id || '1');
    delete req.body.id;
    delete req.body.created_at;
    delete req.body.updated_at;
    delete req.body.created_by;
    const updated = await vehicleService.updateVehicle(req.params.id, req.body, userId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const deleted = await vehicleService.deleteVehicle(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    next(error);
  }
};

const getVehicleAvailability = async (req, res, next) => {
  try {
    const availability = await vehicleService.getVehicleAvailability(req.params.id);
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleAvailability
};
