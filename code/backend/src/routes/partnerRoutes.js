// partnerRoutes.js
const express = require('express');
const router = express.Router();
const PartnerService = require('../services/PartnerService');

// GET /api/v1/partners
router.get('/', async (req, res) => {
  try {
    const { page, limit, search, type, status, sortBy, sortOrder, tenantId } = req.query;
    const result = await PartnerService.getPartners({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      type,
      status,
      sortBy,
      sortOrder,
      tenantId: tenantId ? parseInt(tenantId) : undefined
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/partners/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerService.getPartnerById(id);
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/partners
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null; // adapt if you have auth
    const partner = await PartnerService.createPartner(req.body, userId);
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/v1/partners/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const partner = await PartnerService.updatePartner(id, req.body, userId);
    //console.log('userId: ' + userId);
    /* const data = { ...req.body, updated_by: userId }; // ajoutez cette ligne pour définir la valeur de updated_by
    const partner = await PartnerService.updatePartner(id, data, userId); */

    res.json(partner);
  } catch (err) {
     console.error('ffffff '  && err);
    res.status(400).json({ error: err.message });
    
}
});

// DELETE /api/v1/partners/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PartnerService.deletePartner(id);
    if (!deleted) return res.status(404).json({ error: 'Partner not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
