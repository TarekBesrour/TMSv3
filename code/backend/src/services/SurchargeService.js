const Surcharge = require('../models/Surcharge');

class SurchargeService {
  // Créer une nouvelle surcharge
  async createSurcharge(surchargeData, userId, tenantId) {
    try {
      const surcharge = await Surcharge.query().insert({
        ...surchargeData,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      });

      return await this.getSurchargeById(surcharge.id);
    } catch (error) {
      throw new Error(`Erreur lors de la création de la surcharge: ${error.message}`);
    }
  }

  // Obtenir une surcharge par ID
  async getSurchargeById(surchargeId) {
    try {
      const surcharge = await Surcharge.query()
        .findById(surchargeId)
        .withGraphFetched('[rate, contract, partner, createdBy, updatedBy]');

      if (!surcharge) {
        throw new Error('Surcharge non trouvée');
      }

      return surcharge;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la surcharge: ${error.message}`);
    }
  }

  // Obtenir toutes les surcharges avec filtres et pagination
  async getSurcharges(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = Surcharge.query()
        .withGraphFetched('[rate, contract, partner]')
        .orderBy('created_at', 'desc');

      // Application des filtres
      if (filters.tenant_id) {
        query = query.where('tenant_id', filters.tenant_id);
      }

      if (filters.surcharge_type) {
        query = query.where('surcharge_type', filters.surcharge_type);
      }

      if (filters.calculation_method) {
        query = query.where('calculation_method', filters.calculation_method);
      }

      if (filters.transport_mode) {
        query = query.where('transport_mode', filters.transport_mode);
      }

      if (filters.rate_id) {
        query = query.where('rate_id', filters.rate_id);
      }

      if (filters.contract_id) {
        query = query.where('contract_id', filters.contract_id);
      }

      if (filters.partner_id) {
        query = query.where('partner_id', filters.partner_id);
      }

      if (filters.is_active !== undefined) {
        query = query.where('is_active', filters.is_active);
      }

      if (filters.is_mandatory !== undefined) {
        query = query.where('is_mandatory', filters.is_mandatory);
      }

      if (filters.effective_date) {
        query = query.where('effective_date', '<=', filters.effective_date);
      }

      if (filters.expiry_date) {
        query = query.where(builder => {
          builder.whereNull('expiry_date')
            .orWhere('expiry_date', '>=', filters.expiry_date);
        });
      }

      if (filters.search) {
        query = query.where(builder => {
          builder.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('description', 'ilike', `%${filters.search}%`);
        });
      }

      // Pagination
      const total = await query.resultSize();
      const surcharges = await query.page(page - 1, limit);

      return {
        data: surcharges.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des surcharges: ${error.message}`);
    }
  }

  // Mettre à jour une surcharge
  async updateSurcharge(surchargeId, updateData, userId) {
    try {
      const surcharge = await Surcharge.query().findById(surchargeId);
      if (!surcharge) {
        throw new Error('Surcharge non trouvée');
      }

      const updatedSurcharge = await Surcharge.query()
        .patchAndFetchById(surchargeId, {
          ...updateData,
          updated_by: userId
        });

      return await this.getSurchargeById(updatedSurcharge.id);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la surcharge: ${error.message}`);
    }
  }

  // Supprimer une surcharge
  async deleteSurcharge(surchargeId) {
    try {
      const surcharge = await Surcharge.query().findById(surchargeId);
      if (!surcharge) {
        throw new Error('Surcharge non trouvée');
      }

      await Surcharge.query().deleteById(surchargeId);
      return { message: 'Surcharge supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la surcharge: ${error.message}`);
    }
  }

  // Rechercher des surcharges applicables pour une expédition
  async findApplicableSurcharges(shipmentParams) {
    try {
      const {
        origin_country,
        destination_country,
        origin_zone,
        destination_zone,
        transport_mode,
        weight,
        volume,
        rate_id,
        contract_id,
        partner_id,
        shipment_date = new Date()
      } = shipmentParams;

      let query = Surcharge.query()
        .withGraphFetched('[rate, contract, partner]')
        .where('is_active', true)
        .where(builder => {
          builder.whereNull('effective_date')
            .orWhere('effective_date', '<=', shipment_date);
        })
        .where(builder => {
          builder.whereNull('expiry_date')
            .orWhere('expiry_date', '>=', shipment_date);
        });

      // Filtres géographiques
      if (origin_country) {
        query = query.where(builder => {
          builder.whereNull('origin_country')
            .orWhere('origin_country', origin_country);
        });
      }

      if (destination_country) {
        query = query.where(builder => {
          builder.whereNull('destination_country')
            .orWhere('destination_country', destination_country);
        });
      }

      if (origin_zone) {
        query = query.where(builder => {
          builder.whereNull('origin_zone')
            .orWhere('origin_zone', origin_zone);
        });
      }

      if (destination_zone) {
        query = query.where(builder => {
          builder.whereNull('destination_zone')
            .orWhere('destination_zone', destination_zone);
        });
      }

      // Filtre mode de transport
      if (transport_mode) {
        query = query.where(builder => {
          builder.where('transport_mode', transport_mode)
            .orWhere('transport_mode', 'all')
            .orWhere('transport_mode', 'multimodal');
        });
      }

      // Filtres de relation
      if (rate_id) {
        query = query.where(builder => {
          builder.whereNull('rate_id')
            .orWhere('rate_id', rate_id);
        });
      }

      if (contract_id) {
        query = query.where(builder => {
          builder.whereNull('contract_id')
            .orWhere('contract_id', contract_id);
        });
      }

      if (partner_id) {
        query = query.where(builder => {
          builder.whereNull('partner_id')
            .orWhere('partner_id', partner_id);
        });
      }

      const surcharges = await query.orderBy('priority', 'desc');

      // Filtrer par conditions de poids, volume et temporelles
      const applicableSurcharges = surcharges.filter(surcharge => {
        // Vérification du poids
        if (weight && !surcharge.isValidForWeight(weight)) return false;
        
        // Vérification du volume
        if (volume && !surcharge.isValidForVolume(volume)) return false;
        
        // Vérification du jour de la semaine
        if (!surcharge.isValidForDay(shipment_date)) return false;
        
        // Vérification de l'heure
        if (!surcharge.isValidForTime(shipment_date)) return false;
        
        return true;
      });

      return applicableSurcharges;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des surcharges applicables: ${error.message}`);
    }
  }

  // Calculer le montant total des surcharges pour une expédition
  async calculateSurchargesForShipment(baseAmount, shipmentParams) {
    try {
      const applicableSurcharges = await this.findApplicableSurcharges(shipmentParams);
      
      const surchargeCalculations = [];
      let totalSurcharges = 0;

      for (const surcharge of applicableSurcharges) {
        const amount = surcharge.calculateSurcharge(baseAmount, shipmentParams);
        
        if (amount > 0) {
          const calculation = {
            surcharge_id: surcharge.id,
            name: surcharge.name,
            type: surcharge.surcharge_type,
            calculation_method: surcharge.calculation_method,
            value: surcharge.value,
            calculated_amount: amount,
            currency: surcharge.currency,
            is_mandatory: surcharge.is_mandatory
          };

          surchargeCalculations.push(calculation);
          totalSurcharges += amount;
        }
      }

      return {
        surcharges: surchargeCalculations,
        total_surcharges: totalSurcharges,
        base_amount: baseAmount,
        final_amount: baseAmount + totalSurcharges
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul des surcharges: ${error.message}`);
    }
  }

  // Obtenir les surcharges par type
  async getSurchargesByType(surchargeType, tenantId) {
    try {
      const surcharges = await Surcharge.query()
        .where('surcharge_type', surchargeType)
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .orderBy('name');

      return surcharges;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des surcharges par type: ${error.message}`);
    }
  }

  // Mettre à jour les prix du carburant pour les surcharges carburant
  async updateFuelPrices(fuelPriceData, userId) {
    try {
      const { current_price, region, currency } = fuelPriceData;

      // Récupérer toutes les surcharges carburant actives
      const fuelSurcharges = await Surcharge.query()
        .where('surcharge_type', 'fuel')
        .where('is_active', true);

      const updatedSurcharges = [];

      for (const surcharge of fuelSurcharges) {
        // Mettre à jour le prix de base du carburant si applicable
        if (surcharge.currency === currency) {
          await surcharge.$query().patch({
            fuel_base_price: current_price,
            updated_by: userId
          });

          updatedSurcharges.push(surcharge.id);
        }
      }

      return {
        message: 'Prix du carburant mis à jour',
        updated_surcharges: updatedSurcharges,
        fuel_price: current_price,
        currency,
        region
      };
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour des prix du carburant: ${error.message}`);
    }
  }

  // Dupliquer une surcharge
  async duplicateSurcharge(surchargeId, userId) {
    try {
      const originalSurcharge = await this.getSurchargeById(surchargeId);
      
      const duplicateData = {
        ...originalSurcharge,
        name: `${originalSurcharge.name} (Copie)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      return await this.createSurcharge(duplicateData, userId, originalSurcharge.tenant_id);
    } catch (error) {
      throw new Error(`Erreur lors de la duplication de la surcharge: ${error.message}`);
    }
  }

  // Obtenir les statistiques des surcharges
  async getSurchargeStatistics(tenantId, filters = {}) {
    try {
      let query = Surcharge.query().where('tenant_id', tenantId);

      if (filters.start_date) {
        query = query.where('created_at', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('created_at', '<=', filters.end_date);
      }

      const statsByType = await query
        .select('surcharge_type')
        .count('* as count')
        .groupBy('surcharge_type');

      const statsByMethod = await query
        .select('calculation_method')
        .count('* as count')
        .groupBy('calculation_method');

      const totalSurcharges = await Surcharge.query()
        .where('tenant_id', tenantId)
        .count('* as count')
        .first();

      const activeSurcharges = await Surcharge.query()
        .where('tenant_id', tenantId)
        .where('is_active', true)
        .count('* as count')
        .first();

      const mandatorySurcharges = await Surcharge.query()
        .where('tenant_id', tenantId)
        .where('is_mandatory', true)
        .count('* as count')
        .first();

      return {
        total_surcharges: parseInt(totalSurcharges.count),
        active_surcharges: parseInt(activeSurcharges.count),
        mandatory_surcharges: parseInt(mandatorySurcharges.count),
        by_type: statsByType.map(stat => ({
          surcharge_type: stat.surcharge_type,
          count: parseInt(stat.count)
        })),
        by_calculation_method: statsByMethod.map(stat => ({
          calculation_method: stat.calculation_method,
          count: parseInt(stat.count)
        }))
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Valider la cohérence d'une surcharge
  async validateSurcharge(surchargeData) {
    try {
      const errors = [];

      // Validation des dates
      if (surchargeData.effective_date && surchargeData.expiry_date) {
        if (new Date(surchargeData.effective_date) >= new Date(surchargeData.expiry_date)) {
          errors.push('La date d\'expiration doit être postérieure à la date d\'effet');
        }
      }

      // Validation des heures
      if (surchargeData.start_time && surchargeData.end_time) {
        if (surchargeData.start_time >= surchargeData.end_time) {
          errors.push('L\'heure de fin doit être postérieure à l\'heure de début');
        }
      }

      // Validation des limites de poids
      if (surchargeData.min_weight && surchargeData.max_weight) {
        if (surchargeData.min_weight >= surchargeData.max_weight) {
          errors.push('Le poids maximum doit être supérieur au poids minimum');
        }
      }

      // Validation des limites de volume
      if (surchargeData.min_volume && surchargeData.max_volume) {
        if (surchargeData.min_volume >= surchargeData.max_volume) {
          errors.push('Le volume maximum doit être supérieur au volume minimum');
        }
      }

      // Validation des montants min/max
      if (surchargeData.min_amount && surchargeData.max_amount) {
        if (surchargeData.min_amount >= surchargeData.max_amount) {
          errors.push('Le montant maximum doit être supérieur au montant minimum');
        }
      }

      // Validation spécifique pour surcharge carburant
      if (surchargeData.surcharge_type === 'fuel') {
        if (!surchargeData.fuel_base_price) {
          errors.push('Le prix de base du carburant est requis pour une surcharge carburant');
        }
        if (!surchargeData.fuel_threshold) {
          errors.push('Le seuil de déclenchement est requis pour une surcharge carburant');
        }
      }

      return {
        is_valid: errors.length === 0,
        errors
      };
    } catch (error) {
      throw new Error(`Erreur lors de la validation de la surcharge: ${error.message}`);
    }
  }
}

module.exports = new SurchargeService();

