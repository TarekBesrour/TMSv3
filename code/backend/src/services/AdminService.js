const SystemConfiguration = require('../models/SystemConfiguration');
const ReferenceData = require('../models/ReferenceData');
const { transaction } = require('objection');
const { NotFoundError, ValidationError } = require('../utils/errors');

class AdminService {
  /**
   * Configuration Management
   */

  /**
   * Get all configurations for a tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} - List of configurations
   */
  async getConfigurations(tenantId, filters = {}) {
    let query = SystemConfiguration.query().where('tenant_id', tenantId);

    if (filters.category) {
      query = query.where('category', filters.category);
    }

    if (filters.is_system !== undefined) {
      query = query.where('is_system', filters.is_system);
    }

    if (filters.search) {
      query = query.where(builder => {
        builder.where('config_key', 'like', `%${filters.search}%`)
          .orWhere('description', 'like', `%${filters.search}%`);
      });
    }

    return await query.orderBy('category').orderBy('config_key');
  }

  /**
   * Get configuration by key
   * @param {number} tenantId - Tenant ID
   * @param {string} key - Configuration key
   * @returns {Promise<Object>} - Configuration object
   */
  async getConfigurationByKey(tenantId, key) {
    const config = await SystemConfiguration.query()
      .where('tenant_id', tenantId)
      .where('config_key', key)
      .first();

    if (!config) {
      throw new NotFoundError(`Configuration with key ${key} not found`);
    }

    return config;
  }

  /**
   * Get configuration value (parsed)
   * @param {number} tenantId - Tenant ID
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if not found
   * @returns {Promise<*>} - Parsed configuration value
   */
  async getConfigurationValue(tenantId, key, defaultValue = null) {
    try {
      const config = await this.getConfigurationByKey(tenantId, key);
      return config.getParsedValue();
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Set configuration value
   * @param {number} tenantId - Tenant ID
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   * @param {string} type - Value type
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Updated configuration
   */
  async setConfigurationValue(tenantId, key, value, type = 'string', userId) {
    const formattedValue = SystemConfiguration.formatValue(value, type);

    const existingConfig = await SystemConfiguration.query()
      .where('tenant_id', tenantId)
      .where('config_key', key)
      .first();

    if (existingConfig) {
      return await SystemConfiguration.query()
        .patchAndFetchById(existingConfig.id, {
          config_value: formattedValue,
          config_type: type,
          updated_by: userId
        });
    } else {
      return await SystemConfiguration.query().insert({
        tenant_id: tenantId,
        config_key: key,
        config_value: formattedValue,
        config_type: type,
        created_by: userId,
        updated_by: userId
      });
    }
  }

  /**
   * Create or update configuration
   * @param {Object} configData - Configuration data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Created/updated configuration
   */
  async createOrUpdateConfiguration(configData, userId) {
    const validationErrors = await SystemConfiguration.validateConfiguration(configData);
    if (validationErrors.length > 0) {
      throw new ValidationError('Invalid configuration data', validationErrors);
    }

    const existingConfig = await SystemConfiguration.query()
      .where('tenant_id', configData.tenant_id)
      .where('config_key', configData.config_key)
      .first();

    if (existingConfig) {
      return await SystemConfiguration.query()
        .patchAndFetchById(existingConfig.id, {
          ...configData,
          updated_by: userId
        });
    } else {
      return await SystemConfiguration.query().insert({
        ...configData,
        created_by: userId,
        updated_by: userId
      });
    }
  }

  /**
   * Delete configuration
   * @param {number} tenantId - Tenant ID
   * @param {string} key - Configuration key
   * @returns {Promise<boolean>} - Success status
   */
  async deleteConfiguration(tenantId, key) {
    const config = await SystemConfiguration.query()
      .where('tenant_id', tenantId)
      .where('config_key', key)
      .first();

    if (!config) {
      throw new NotFoundError(`Configuration with key ${key} not found`);
    }

    if (config.is_system) {
      throw new ValidationError('Cannot delete system configuration');
    }

    const numDeleted = await SystemConfiguration.query()
      .where('tenant_id', tenantId)
      .where('config_key', key)
      .delete();

    return numDeleted > 0;
  }

  /**
   * Reference Data Management
   */

  /**
   * Get reference data by category
   * @param {number} tenantId - Tenant ID
   * @param {string} category - Reference data category
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of reference data
   */
  async getReferenceDataByCategory(tenantId, category, options = {}) {
    let query = ReferenceData.query()
      .where('tenant_id', tenantId)
      .where('category', category);

    if (options.active_only !== false) {
      query = query.where('is_active', true);
    }

    if (options.include_hierarchy) {
      query = query.withGraphFetched('[parent, children]');
    }

    if (options.parent_id !== undefined) {
      if (options.parent_id === null) {
        query = query.whereNull('parent_id');
      } else {
        query = query.where('parent_id', options.parent_id);
      }
    }

    return await query.orderBy('sort_order').orderBy('label');
  }

  /**
   * Get reference data by ID
   * @param {number} id - Reference data ID
   * @param {boolean} withRelations - Include relations
   * @returns {Promise<Object>} - Reference data object
   */
  async getReferenceDataById(id, withRelations = false) {
    let query = ReferenceData.query().findById(id);

    if (withRelations) {
      query = query.withGraphFetched('[parent, children, createdBy, updatedBy]');
    }

    const refData = await query;

    if (!refData) {
      throw new NotFoundError(`Reference data with ID ${id} not found`);
    }

    return refData;
  }

  /**
   * Create reference data
   * @param {Object} refData - Reference data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Created reference data
   */
  async createReferenceData(refData, userId) {
    const validationErrors = await ReferenceData.validateReferenceData(refData);
    if (validationErrors.length > 0) {
      throw new ValidationError('Invalid reference data', validationErrors);
    }

    return await ReferenceData.query().insert({
      ...refData,
      created_by: userId,
      updated_by: userId
    });
  }

  /**
   * Update reference data
   * @param {number} id - Reference data ID
   * @param {Object} refData - Updated reference data
   * @param {number} userId - User ID for audit
   * @returns {Promise<Object>} - Updated reference data
   */
  async updateReferenceData(id, refData, userId) {
    const existingRefData = await ReferenceData.query().findById(id);
    if (!existingRefData) {
      throw new NotFoundError(`Reference data with ID ${id} not found`);
    }

    if (existingRefData.is_system && !refData.is_system) {
      throw new ValidationError('Cannot modify system reference data');
    }

    const validationErrors = await ReferenceData.validateReferenceData({
      ...existingRefData,
      ...refData,
      id
    });
    if (validationErrors.length > 0) {
      throw new ValidationError('Invalid reference data', validationErrors);
    }

    return await ReferenceData.query()
      .patchAndFetchById(id, {
        ...refData,
        updated_by: userId
      });
  }

  /**
   * Delete reference data
   * @param {number} id - Reference data ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteReferenceData(id) {
    const refData = await ReferenceData.query().findById(id);
    if (!refData) {
      throw new NotFoundError(`Reference data with ID ${id} not found`);
    }

    if (refData.is_system) {
      throw new ValidationError('Cannot delete system reference data');
    }

    // Check if there are children
    const children = await ReferenceData.query().where('parent_id', id);
    if (children.length > 0) {
      throw new ValidationError('Cannot delete reference data with children');
    }

    const numDeleted = await ReferenceData.query().deleteById(id);
    return numDeleted > 0;
  }

  /**
   * Initialize default reference data for a tenant
   * @param {number} tenantId - Tenant ID
   * @param {number} userId - User ID for audit
   * @returns {Promise<void>}
   */
  async initializeDefaultReferenceData(tenantId, userId) {
    const defaultData = this.getDefaultReferenceData();

    return await transaction(ReferenceData.knex(), async (trx) => {
      for (const category in defaultData) {
        const items = defaultData[category];
        
        for (const item of items) {
          await ReferenceData.query(trx).insert({
            tenant_id: tenantId,
            category,
            code: item.code,
            label: item.label,
            description: item.description,
            value: item.value,
            sort_order: item.sort_order || 0,
            is_system: true,
            created_by: userId,
            updated_by: userId
          });
        }
      }
    });
  }

  /**
   * Get default reference data structure
   * @returns {Object} - Default reference data
   */
  getDefaultReferenceData() {
    return {
      transport_modes: [
        { code: 'ROAD', label: 'Transport routier', description: 'Transport par route' },
        { code: 'RAIL', label: 'Transport ferroviaire', description: 'Transport par train' },
        { code: 'SEA', label: 'Transport maritime', description: 'Transport par mer' },
        { code: 'AIR', label: 'Transport aérien', description: 'Transport par avion' },
        { code: 'MULTIMODAL', label: 'Transport multimodal', description: 'Combinaison de plusieurs modes' }
      ],
      vehicle_types: [
        { code: 'TRUCK', label: 'Camion', description: 'Véhicule de transport routier' },
        { code: 'VAN', label: 'Fourgon', description: 'Véhicule utilitaire léger' },
        { code: 'TRAILER', label: 'Semi-remorque', description: 'Remorque tractée' },
        { code: 'CONTAINER', label: 'Conteneur', description: 'Conteneur de transport' }
      ],
      cargo_types: [
        { code: 'GENERAL', label: 'Marchandise générale', description: 'Marchandise standard' },
        { code: 'DANGEROUS', label: 'Marchandise dangereuse', description: 'Matières dangereuses' },
        { code: 'PERISHABLE', label: 'Denrées périssables', description: 'Produits frais' },
        { code: 'FRAGILE', label: 'Marchandise fragile', description: 'Produits fragiles' },
        { code: 'OVERSIZED', label: 'Hors gabarit', description: 'Marchandise exceptionnelle' }
      ],
      incoterms: [
        { code: 'EXW', label: 'Ex Works', description: "À l'usine" },
        { code: 'FCA', label: 'Free Carrier', description: 'Franco transporteur' },
        { code: 'CPT', label: 'Carriage Paid To', description: "Port payé jusqu'à" },
        { code: 'CIP', label: 'Carriage and Insurance Paid', description: 'Port payé, assurance comprise' },
        { code: 'DAP', label: 'Delivered at Place', description: 'Rendu au lieu de destination' },
        { code: 'DPU', label: 'Delivered at Place Unloaded', description: 'Rendu au lieu de destination déchargé' },
        { code: 'DDP', label: 'Delivered Duty Paid', description: 'Rendu droits acquittés' }
      ],
      currencies: [
        { code: 'EUR', label: 'Euro', description: 'Monnaie européenne' },
        { code: 'USD', label: 'Dollar américain', description: 'Monnaie américaine' },
        { code: 'GBP', label: 'Livre sterling', description: 'Monnaie britannique' },
        { code: 'CHF', label: 'Franc suisse', description: 'Monnaie suisse' }
      ],
      units_of_measure: [
        { code: 'KG', label: 'Kilogramme', description: 'Unité de poids' },
        { code: 'T', label: 'Tonne', description: 'Unité de poids' },
        { code: 'M3', label: 'Mètre cube', description: 'Unité de volume' },
        { code: 'L', label: 'Litre', description: 'Unité de volume' },
        { code: 'M', label: 'Mètre', description: 'Unité de longueur' },
        { code: 'KM', label: 'Kilomètre', description: 'Unité de distance' }
      ],
      document_types: [
        { code: 'CMR', label: 'Lettre de voiture CMR', description: 'Document de transport routier' },
        { code: 'AWB', label: 'Lettre de transport aérien', description: 'Document de transport aérien' },
        { code: 'BL', label: 'Connaissement', description: 'Document de transport maritime' },
        { code: 'INVOICE', label: 'Facture', description: 'Document commercial' },
        { code: 'PACKING_LIST', label: 'Liste de colisage', description: 'Détail des marchandises' },
        { code: 'CERTIFICATE', label: 'Certificat', description: 'Document de certification' }
      ],
      payment_terms: [
        { code: 'IMMEDIATE', label: 'Paiement immédiat', description: 'Paiement à la livraison' },
        { code: 'NET_15', label: 'Net 15 jours', description: 'Paiement sous 15 jours' },
        { code: 'NET_30', label: 'Net 30 jours', description: 'Paiement sous 30 jours' },
        { code: 'NET_45', label: 'Net 45 jours', description: 'Paiement sous 45 jours' },
        { code: 'NET_60', label: 'Net 60 jours', description: 'Paiement sous 60 jours' }
      ]
    };
  }

  /**
   * System utilities
   */

  /**
   * Get system health status
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} - System health information
   */
  async getSystemHealth(tenantId) {
    // This would typically check database connections, external services, etc.
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy',
        configurations: 'healthy',
        reference_data: 'healthy'
      }
    };

    try {
      // Check if we can query configurations
      await SystemConfiguration.query().where('tenant_id', tenantId).limit(1);
      
      // Check if we can query reference data
      await ReferenceData.query().where('tenant_id', tenantId).limit(1);
      
    } catch (error) {
      health.status = 'unhealthy';
      health.checks.database = 'unhealthy';
      health.error = error.message;
    }

    return health;
  }

  /**
   * Get system statistics
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Object>} - System statistics
   */
  async getSystemStatistics(tenantId) {
    const stats = {
      configurations: {
        total: 0,
        by_category: {}
      },
      reference_data: {
        total: 0,
        by_category: {}
      }
    };

    // Configuration statistics
    const configStats = await SystemConfiguration.query()
      .where('tenant_id', tenantId)
      .select('category')
      .count('* as count')
      .groupBy('category');

       stats.configurations.total = configStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
    configStats.forEach(stat => {
      stats.configurations.by_category[stat.category || 'uncategorized'] = parseInt(stat.count);
    });

    // Reference data statistics
    const refDataStats = await ReferenceData.query()
      .where('tenant_id', tenantId)
      .select('category')
      .count('* as count')
      .groupBy('category');

    stats.reference_data.total = refDataStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
    refDataStats.forEach(stat => {
      stats.reference_data.by_category[stat.category] = parseInt(stat.count);
    });

    return stats;
  }
}

module.exports = new AdminService();

