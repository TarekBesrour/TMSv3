// SiteController.js
const Site = require('../models/Site');

module.exports = {
  // GET /api/v1/sites
  async getAllSites(req, res) {
    try {
      const sites = await Site.query()
        .withGraphFetched('[partner]');
      res.json(sites);
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération des sites', error: err.message });
    }
  },

  // GET /api/v1/sites/:id
  async getSiteById(req, res) {
    try {
      const site = await Site.query()
        .findById(req.params.id)
        .withGraphFetched('[partner]');
      if (!site) return res.status(404).json({ message: 'Site non trouvé' });
      res.json(site);
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération du site', error: err.message });
    }
  },

  // POST /api/v1/sites
  async createSite(req, res) {
    try {
      const newSite = await Site.query().insert(req.body);
      res.status(201).json(newSite);
    } catch (err) {
      res.status(400).json({ message: 'Erreur lors de la création du site', error: err.message });
    }
  },

  // PUT /api/v1/sites/:id
  async updateSite(req, res) {
    try {
      const updatedSite = await Site.query().patchAndFetchById(req.params.id, req.body);
      if (!updatedSite) return res.status(404).json({ message: 'Site non trouvé' });
      res.json(updatedSite);
    } catch (err) {
      res.status(400).json({ message: 'Erreur lors de la mise à jour du site', error: err.message });
    }
  },

  // DELETE /api/v1/sites/:id
  async deleteSite(req, res) {
    try {
      const numDeleted = await Site.query().deleteById(req.params.id);
      if (!numDeleted) return res.status(404).json({ message: 'Site non trouvé' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la suppression du site', error: err.message });
    }
  }
};
