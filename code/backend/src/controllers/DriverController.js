const DriverService = require('../services/DriverService');

/**
 * GET /api/drivers
 */
const getAllDrivers = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      partnerId,
      status,
      sortBy,
      sortOrder
    } = req.query;

    const drivers = await DriverService.getDrivers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      partnerId: partnerId ? parseInt(partnerId) : null,
      status,
      sortBy,
      sortOrder
    });

    res.json({
        data: drivers.data,
        pagination: drivers.pagination
    });

  } catch (error) {
    console.error('Erreur dans getAllDrivers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * GET /api/drivers/:id
 */
const getDriverById = async (req, res) => {
  try {
    const driver = await DriverService.getDriverById(parseInt(req.params.id), { withPartner: true });
    res.json(driver);
  } catch (error) {
    console.error('Erreur dans getDriverById:', error);
    if (error.name === 'NotFoundError') {
      res.status(404).json({ error: 'Chauffeur introuvable' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

/**
 * POST /api/drivers
 */
const createDriver = async (req, res) => {
  try {
    const userId = req.body.userId || 1; // à adapter selon ton système d’auth
    const newDriver = await DriverService.createDriver(req.body, String(userId));
    res.status(201).json(newDriver);
  } catch (error) {
    console.error('Erreur dans createDriver:', error);
    res.status(400).json({ error: 'Erreur lors de la création du chauffeur' });
  }
};

/**
 * PUT /api/drivers/:id
 */
const updateDriver = async (req, res) => {
  try {
    //const userId = req.body.userId || 6;
    const userId = req.user.id;
    delete req.body.id;
    delete req.body.created_by; 
    //req.body.updated_by = String(req.user?.id || '1');
    if (req.body.license_expiry && typeof req.body.license_expiry === 'string') {
  req.body.license_expiry = req.body.license_expiry.split('T')[0]; // ✅ garde que la date
}
    console.log('Payload envoyé :', req.body);
    const updatedDriver = await DriverService.updateDriver(parseInt(req.params.id), req.body, String(userId));
    res.json(updatedDriver);
  } catch (error) {
    console.error('Erreur dans updateDriver:', error);
    if (error.name === 'NotFoundError') {
      res.status(404).json({ error: 'Chauffeur non trouvé' });
    } else {
      res.status(400).json({ error: 'Erreur lors de la mise à jour du chauffeur' });
    }
  }
};

/**
 * DELETE /api/drivers/:id
 */
const deleteDriver = async (req, res) => {
  try {
    const deleted = await DriverService.deleteDriver(parseInt(req.params.id));
    res.status(204).end();
  } catch (error) {
    console.error('Erreur dans deleteDriver:', error);
    if (error.name === 'NotFoundError') {
      res.status(404).json({ error: 'Chauffeur non trouvé' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};
