const RateService = require('../services/RateService');
const { validationResult } = require('express-validator');

class RateController {
  // Créer un nouveau tarif
  async createRate(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: errors.array()
        });
      }

      const rate = await RateService.createRate(
        req.body,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Tarif créé avec succès',
        data: rate
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir un tarif par ID
  async getRateById(req, res) {
    try {
      const { id } = req.params;
      const rate = await RateService.getRateById(id);

      res.json({
        success: true,
        data: rate
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir tous les tarifs avec filtres et pagination
  async getRates(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await RateService.getRates(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mettre à jour un tarif
  async updateRate(req, res) {
    try {
      // Vérification des erreurs de validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const rate = await RateService.updateRate(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Tarif mis à jour avec succès',
        data: rate
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Supprimer un tarif
  async deleteRate(req, res) {
    try {
      const { id } = req.params;
      const result = await RateService.deleteRate(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Rechercher des tarifs applicables pour une expédition
  async findApplicableRates(req, res) {
    try {
      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const rates = await RateService.findApplicableRates(shipmentParams);

      res.json({
        success: true,
        data: rates,
        count: rates.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le coût total pour une expédition
  async calculateShipmentCost(req, res) {
    try {
      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const calculation = await RateService.calculateShipmentCost(shipmentParams);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Appliquer les règles de tarification
  async applyPricingRules(req, res) {
    try {
      const { shipmentParams, calculations } = req.body;
      
      const result = await RateService.applyPricingRules(
        { ...shipmentParams, tenant_id: req.user.tenant_id },
        calculations
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Dupliquer un tarif
  async duplicateRate(req, res) {
    try {
      const { id } = req.params;
      const rate = await RateService.duplicateRate(id, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Tarif dupliqué avec succès',
        data: rate
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les statistiques des tarifs
  async getRateStatistics(req, res) {
    try {
      const filters = req.query;
      const stats = await RateService.getRateStatistics(req.user.tenant_id, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les tarifs par mode de transport
  async getRatesByTransportMode(req, res) {
    try {
      const { transport_mode } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        transport_mode,
        is_active: true
      };

      const result = await RateService.getRates(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les tarifs par partenaire
  async getRatesByPartner(req, res) {
    try {
      const { partner_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        partner_id,
        is_active: true
      };

      const result = await RateService.getRates(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les tarifs par contrat
  async getRatesByContract(req, res) {
    try {
      const { contract_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        contract_id,
        is_active: true
      };

      const result = await RateService.getRates(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Valider un tarif
  async validateRate(req, res) {
    try {
      const rateData = req.body;
      
      // Validation basique des champs requis
      const requiredFields = ['name', 'transport_mode', 'rate_type', 'base_rate', 'currency', 'effective_date'];
      const missingFields = requiredFields.filter(field => !rateData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Champs requis manquants',
          missing_fields: missingFields
        });
      }

      // Validation des dates
      const errors = [];
      if (rateData.effective_date && rateData.expiry_date) {
        if (new Date(rateData.effective_date) >= new Date(rateData.expiry_date)) {
          errors.push('La date d\'expiration doit être postérieure à la date d\'effet');
        }
      }

      // Validation des limites
      if (rateData.min_weight && rateData.max_weight) {
        if (rateData.min_weight >= rateData.max_weight) {
          errors.push('Le poids maximum doit être supérieur au poids minimum');
        }
      }

      if (rateData.min_volume && rateData.max_volume) {
        if (rateData.min_volume >= rateData.max_volume) {
          errors.push('Le volume maximum doit être supérieur au volume minimum');
        }
      }

      if (rateData.min_distance && rateData.max_distance) {
        if (rateData.min_distance >= rateData.max_distance) {
          errors.push('La distance maximum doit être supérieure à la distance minimum');
        }
      }

      res.json({
        success: true,
        is_valid: errors.length === 0,
        errors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Activer/désactiver un tarif
  async toggleRateStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const rate = await RateService.updateRate(id, { is_active }, req.user.id);

      res.json({
        success: true,
        message: `Tarif ${is_active ? 'activé' : 'désactivé'} avec succès`,
        data: rate
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Exporter les tarifs
  async exportRates(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const result = await RateService.getRates(filters, { page: 1, limit: 10000 });

      // Formatage des données pour l'export
      const exportData = result.data.map(rate => ({
        id: rate.id,
        name: rate.name,
        description: rate.description,
        transport_mode: rate.transport_mode,
        rate_type: rate.rate_type,
        base_rate: rate.base_rate,
        currency: rate.currency,
        origin_country: rate.origin_country,
        destination_country: rate.destination_country,
        origin_zone: rate.origin_zone,
        destination_zone: rate.destination_zone,
        effective_date: rate.effective_date,
        expiry_date: rate.expiry_date,
        is_active: rate.is_active,
        partner_name: rate.partner?.name,
        contract_reference: rate.contract?.reference,
        created_at: rate.created_at
      }));

      res.json({
        success: true,
        data: exportData,
        count: exportData.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RateController();

