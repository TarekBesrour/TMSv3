const SurchargeService = require('../services/SurchargeService');
const { validationResult } = require('express-validator');

class SurchargeController {
  // Créer une nouvelle surcharge
  async createSurcharge(req, res) {
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

      const surcharge = await SurchargeService.createSurcharge(
        req.body,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Surcharge créée avec succès',
        data: surcharge
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir une surcharge par ID
  async getSurchargeById(req, res) {
    try {
      const { id } = req.params;
      const surcharge = await SurchargeService.getSurchargeById(id);

      res.json({
        success: true,
        data: surcharge
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Obtenir toutes les surcharges avec filtres et pagination
  async getSurcharges(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await SurchargeService.getSurcharges(filters, pagination);

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

  // Mettre à jour une surcharge
  async updateSurcharge(req, res) {
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
      const surcharge = await SurchargeService.updateSurcharge(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Surcharge mise à jour avec succès',
        data: surcharge
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Supprimer une surcharge
  async deleteSurcharge(req, res) {
    try {
      const { id } = req.params;
      const result = await SurchargeService.deleteSurcharge(id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Rechercher des surcharges applicables pour une expédition
  async findApplicableSurcharges(req, res) {
    try {
      const shipmentParams = {
        ...req.body,
        tenant_id: req.user.tenant_id
      };

      const surcharges = await SurchargeService.findApplicableSurcharges(shipmentParams);

      res.json({
        success: true,
        data: surcharges,
        count: surcharges.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le montant total des surcharges pour une expédition
  async calculateSurchargesForShipment(req, res) {
    try {
      const { base_amount, shipment_params } = req.body;
      
      const calculation = await SurchargeService.calculateSurchargesForShipment(
        base_amount,
        { ...shipment_params, tenant_id: req.user.tenant_id }
      );

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

  // Obtenir les surcharges par type
  async getSurchargesByType(req, res) {
    try {
      const { type } = req.params;
      const surcharges = await SurchargeService.getSurchargesByType(type, req.user.tenant_id);

      res.json({
        success: true,
        data: surcharges
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mettre à jour les prix du carburant
  async updateFuelPrices(req, res) {
    try {
      const fuelPriceData = req.body;
      const result = await SurchargeService.updateFuelPrices(fuelPriceData, req.user.id);

      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Dupliquer une surcharge
  async duplicateSurcharge(req, res) {
    try {
      const { id } = req.params;
      const surcharge = await SurchargeService.duplicateSurcharge(id, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Surcharge dupliquée avec succès',
        data: surcharge
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Obtenir les statistiques des surcharges
  async getSurchargeStatistics(req, res) {
    try {
      const filters = req.query;
      const stats = await SurchargeService.getSurchargeStatistics(req.user.tenant_id, filters);

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

  // Valider une surcharge
  async validateSurcharge(req, res) {
    try {
      const surchargeData = req.body;
      const validation = await SurchargeService.validateSurcharge(surchargeData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Activer/désactiver une surcharge
  async toggleSurchargeStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const surcharge = await SurchargeService.updateSurcharge(id, { is_active }, req.user.id);

      res.json({
        success: true,
        message: `Surcharge ${is_active ? 'activée' : 'désactivée'} avec succès`,
        data: surcharge
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Obtenir les surcharges par mode de transport
  async getSurchargesByTransportMode(req, res) {
    try {
      const { transport_mode } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        transport_mode,
        is_active: true
      };

      const result = await SurchargeService.getSurcharges(filters);

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

  // Obtenir les surcharges par tarif
  async getSurchargesByRate(req, res) {
    try {
      const { rate_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        rate_id,
        is_active: true
      };

      const result = await SurchargeService.getSurcharges(filters);

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

  // Obtenir les surcharges par contrat
  async getSurchargesByContract(req, res) {
    try {
      const { contract_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        contract_id,
        is_active: true
      };

      const result = await SurchargeService.getSurcharges(filters);

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

  // Obtenir les surcharges obligatoires
  async getMandatorySurcharges(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        is_mandatory: true,
        is_active: true
      };

      const result = await SurchargeService.getSurcharges(filters);

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

  // Simuler le calcul d'une surcharge
  async simulateSurchargeCalculation(req, res) {
    try {
      const { id } = req.params;
      const { base_amount, shipment_params } = req.body;

      const surcharge = await SurchargeService.getSurchargeById(id);
      
      // Vérifier si la surcharge est applicable
      const isApplicable = surcharge.isValidForDate(shipment_params.shipment_date) &&
                          surcharge.isValidForWeight(shipment_params.weight) &&
                          surcharge.isValidForVolume(shipment_params.volume) &&
                          surcharge.isValidForDay(new Date(shipment_params.shipment_date)) &&
                          surcharge.isValidForTime(new Date(shipment_params.shipment_date));

      let calculatedAmount = 0;
      if (isApplicable) {
        calculatedAmount = surcharge.calculateSurcharge(base_amount, shipment_params);
      }

      res.json({
        success: true,
        data: {
          surcharge_id: surcharge.id,
          surcharge_name: surcharge.name,
          surcharge_type: surcharge.surcharge_type,
          calculation_method: surcharge.calculation_method,
          value: surcharge.value,
          base_amount,
          is_applicable: isApplicable,
          calculated_amount: calculatedAmount,
          currency: surcharge.currency,
          simulation_params: shipment_params
        }
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
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

  // Exporter les surcharges
  async exportSurcharges(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const result = await SurchargeService.getSurcharges(filters, { page: 1, limit: 10000 });

      // Formatage des données pour l'export
      const exportData = result.data.map(surcharge => ({
        id: surcharge.id,
        name: surcharge.name,
        description: surcharge.description,
        surcharge_type: surcharge.surcharge_type,
        calculation_method: surcharge.calculation_method,
        value: surcharge.value,
        currency: surcharge.currency,
        transport_mode: surcharge.transport_mode,
        effective_date: surcharge.effective_date,
        expiry_date: surcharge.expiry_date,
        is_active: surcharge.is_active,
        is_mandatory: surcharge.is_mandatory,
        rate_name: surcharge.rate?.name,
        contract_reference: surcharge.contract?.reference,
        partner_name: surcharge.partner?.name,
        created_at: surcharge.created_at
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

module.exports = new SurchargeController();

