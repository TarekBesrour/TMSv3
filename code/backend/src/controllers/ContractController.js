const ContractService = require('../services/ContractService');
const ContractLine = require('../models/ContractLine');
const { validationResult } = require('express-validator');

class ContractController {
  // Créer un nouveau contrat
  async createContract(req, res) {
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

      const contract = await ContractService.createContract(
        req.body,
        req.user.id,
        req.user.tenant_id
      );

      res.status(201).json({
        success: true,
        message: 'Contrat créé avec succès',
        data: contract
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir un contrat par ID
  async getContractById(req, res) {
    try {
      const { id } = req.params;
      const contract = await ContractService.getContractById(id);

      res.json({
        success: true,
        data: contract
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

  // Obtenir tous les contrats avec filtres et pagination
  async getContracts(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await ContractService.getContracts(filters, pagination);

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

  // Mettre à jour un contrat
  async updateContract(req, res) {
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
      const contract = await ContractService.updateContract(id, req.body, req.user.id);

      res.json({
        success: true,
        message: 'Contrat mis à jour avec succès',
        data: contract
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

  // Supprimer un contrat
  async deleteContract(req, res) {
    try {
      const { id } = req.params;
      const result = await ContractService.deleteContract(id);

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

  // Ajouter une ligne de contrat
  async addContractLine(req, res) {
    try {
      const { id } = req.params;
      const lineData = {
        ...req.body,
        contract_id: id,
        tenant_id: req.user.tenant_id
      };

      const contractLine = await ContractLine.query().insert({
        ...lineData,
        created_by: req.user.id,
        updated_by: req.user.id
      });

      const line = await ContractLine.query()
        .findById(contractLine.id)
        .withGraphFetched('[contract, createdBy, updatedBy]');

      res.status(201).json({
        success: true,
        message: 'Ligne de contrat ajoutée avec succès',
        data: line
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir les lignes d'un contrat
  async getContractLines(req, res) {
    try {
      const { id } = req.params;
      
      const lines = await ContractLine.query()
        .where('contract_id', id)
        .where('is_active', true)
        .orderBy('service_type')
        .orderBy('priority', 'desc');

      res.json({
        success: true,
        data: lines
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mettre à jour une ligne de contrat
  async updateContractLine(req, res) {
    try {
      const { id, lineId } = req.params;
      
      const line = await ContractLine.query().findById(lineId);
      if (!line || line.contract_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          message: 'Ligne de contrat non trouvée'
        });
      }

      const updatedLine = await ContractLine.query()
        .patchAndFetchById(lineId, {
          ...req.body,
          updated_by: req.user.id
        });

      res.json({
        success: true,
        message: 'Ligne de contrat mise à jour avec succès',
        data: updatedLine
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Supprimer une ligne de contrat
  async deleteContractLine(req, res) {
    try {
      const { id, lineId } = req.params;
      
      const line = await ContractLine.query().findById(lineId);
      if (!line || line.contract_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          message: 'Ligne de contrat non trouvée'
        });
      }

      await ContractLine.query().deleteById(lineId);

      res.json({
        success: true,
        message: 'Ligne de contrat supprimée avec succès'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Calculer le coût selon les lignes de contrat
  async calculateContractCost(req, res) {
    try {
      const { id } = req.params;
      const shipmentParams = req.body;

      const contract = await ContractService.getContractById(id);
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contrat non trouvé'
        });
      }

      const lines = await ContractLine.query()
        .where('contract_id', id)
        .where('is_active', true);

      const calculations = [];
      let totalCost = 0;

      for (const line of lines) {
        // Vérifier si la ligne est applicable
        if (line.isValidForDate(shipmentParams.shipment_date) &&
            line.isValidForWeight(shipmentParams.weight) &&
            line.isValidForVolume(shipmentParams.volume) &&
            line.isValidForDistance(shipmentParams.distance)) {
          
          const quantity = this.getQuantityForRateType(line.rate_type, shipmentParams);
          const cost = line.calculateRate(quantity, shipmentParams);

          calculations.push({
            line_id: line.id,
            service_type: line.service_type,
            service_description: line.service_description,
            rate_type: line.rate_type,
            rate_value: line.rate_value,
            quantity,
            cost,
            currency: line.currency
          });

          totalCost += cost;
        }
      }

      res.json({
        success: true,
        data: {
          contract_id: id,
          contract_reference: contract.reference,
          shipment_params: shipmentParams,
          line_calculations: calculations,
          total_cost: totalCost,
          currency: contract.currency || 'EUR'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Dupliquer un contrat
  async duplicateContract(req, res) {
    try {
      const { id } = req.params;
      const contract = await ContractService.duplicateContract(id, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Contrat dupliqué avec succès',
        data: contract
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

  // Obtenir les contrats par partenaire
  async getContractsByPartner(req, res) {
    try {
      const { partner_id } = req.params;
      
      const filters = {
        tenant_id: req.user.tenant_id,
        partner_id,
        is_active: true
      };

      const result = await ContractService.getContracts(filters);

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

  // Obtenir les contrats expirant bientôt
  async getExpiringContracts(req, res) {
    try {
      const { days = 30 } = req.query;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(days));

      const filters = {
        tenant_id: req.user.tenant_id,
        is_active: true,
        expiry_date_before: expiryDate.toISOString().split('T')[0]
      };

      const result = await ContractService.getContracts(filters);

      res.json({
        success: true,
        data: result.data,
        message: `Contrats expirant dans les ${days} prochains jours`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Activer/désactiver un contrat
  async toggleContractStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const contract = await ContractService.updateContract(id, { is_active }, req.user.id);

      res.json({
        success: true,
        message: `Contrat ${is_active ? 'activé' : 'désactivé'} avec succès`,
        data: contract
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

  // Obtenir les statistiques des contrats
  async getContractStatistics(req, res) {
    try {
      const filters = req.query;
      const stats = await ContractService.getContractStatistics(req.user.tenant_id, filters);

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

  // Valider un contrat
  async validateContract(req, res) {
    try {
      const contractData = req.body;
      
      // Validation basique des champs requis
      const requiredFields = ['reference', 'partner_id', 'contract_type', 'start_date', 'end_date'];
      const missingFields = requiredFields.filter(field => !contractData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Champs requis manquants',
          missing_fields: missingFields
        });
      }

      // Validation des dates
      const errors = [];
      if (new Date(contractData.start_date) >= new Date(contractData.end_date)) {
        errors.push('La date de fin doit être postérieure à la date de début');
      }

      // Validation des conditions de paiement
      if (contractData.payment_terms && contractData.payment_terms < 0) {
        errors.push('Les conditions de paiement doivent être positives');
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

  // Exporter les contrats
  async exportContracts(req, res) {
    try {
      const filters = {
        tenant_id: req.user.tenant_id,
        ...req.query
      };

      const result = await ContractService.getContracts(filters, { page: 1, limit: 10000 });

      // Formatage des données pour l'export
      const exportData = result.data.map(contract => ({
        id: contract.id,
        reference: contract.reference,
        partner_name: contract.partner?.name,
        contract_type: contract.contract_type,
        status: contract.status,
        start_date: contract.start_date,
        end_date: contract.end_date,
        currency: contract.currency,
        payment_terms: contract.payment_terms,
        is_active: contract.is_active,
        created_at: contract.created_at
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

  // Méthode utilitaire pour obtenir la quantité selon le type de tarif
  getQuantityForRateType(rateType, params) {
    switch (rateType) {
      case 'per_km':
        return params.distance || 0;
      case 'per_kg':
        return params.weight || 0;
      case 'per_m3':
        return params.volume || 0;
      case 'per_pallet':
        return params.pallets || 0;
      case 'per_container':
        return params.containers || 0;
      case 'per_hour':
        return params.hours || 0;
      case 'percentage':
        return params.baseAmount || 0;
      case 'flat_rate':
      default:
        return 1;
    }
  }
}

module.exports = new ContractController();

