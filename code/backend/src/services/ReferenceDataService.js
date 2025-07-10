/**
 * ReferenceDataService
 * 
 * Service layer for managing reference data in the TMS system.
 * Handles business logic, validation, and data operations.
 */

const ReferenceData = require('../models/ReferenceData');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

class ReferenceDataService {

  /**
   * Get all reference types for a tenant
   */
  static async getReferenceTypes(tenantId) {
    try {
      const types = await ReferenceData.query()
        .where('tenant_id', tenantId)
        .select('category')
        .groupBy('category')
        .orderBy('category');

      return types.map(type => ({
        id: type.category,
        name: type.category,
        description: this.getCategoryDescription(type.category)
      }));
    } catch (error) {
      throw new Error(`Error getting reference types: ${error.message}`);
    }
  }

  /**
   * Get all entries for a specific reference type with pagination and filtering
   */
  static async getReferenceEntries(tenantId, category, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'code',
        sortOrder = 'asc'
      } = options;

      let query = ReferenceData.query()
        .where('tenant_id', tenantId)
        .where('category', category);

      // Apply search filter
      if (search) {
        query = query.where(builder => {
          builder
            .where('code', 'ilike', `%${search}%`)
            .orWhere('label', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`);
        });
      }

      // Apply sorting
      query = query.orderBy(sortBy, sortOrder);

      // Get total count for pagination
      const totalQuery = query.clone();
      const total = await totalQuery.resultSize();

      // Apply pagination
      const offset = (page - 1) * limit;
      const data = await query.offset(offset).limit(limit);

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data
      };
    } catch (error) {
      throw new Error(`Error getting reference entries: ${error.message}`);
    }
  }

  /**
   * Get a single reference entry by ID
   */
  static async getReferenceEntry(tenantId, category, id) {
    try {
      const entry = await ReferenceData.query()
        .where('tenant_id', tenantId)
        .where('category', category)
        .findById(id)
        .withGraphFetched('[parent, children]');

      return entry;
    } catch (error) {
      throw new Error(`Error getting reference entry: ${error.message}`);
    }
  }

  /**
   * Create a new reference entry
   */
  static async createReferenceEntry(entryData) {
    try {
      // Validate the reference data
      const validationErrors = await ReferenceData.validateReferenceData(entryData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const entry = await ReferenceData.query().insert(entryData);
      return entry;
    } catch (error) {
      throw new Error(`Error creating reference entry: ${error.message}`);
    }
  }

  /**
   * Update an existing reference entry
   */
  static async updateReferenceEntry(tenantId, category, id, updateData) {
    try {
      // Get existing entry
      const existingEntry = await ReferenceData.query()
        .where('tenant_id', tenantId)
        .where('category', category)
        .findById(id);

      if (!existingEntry) {
        return null;
      }

      // Merge update data with existing data for validation
      const mergedData = { ...existingEntry, ...updateData, id };

      // Validate the merged data
      const validationErrors = await ReferenceData.validateReferenceData(mergedData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const updatedEntry = await ReferenceData.query()
        .where('tenant_id', tenantId)
        .where('category', category)
        .patchAndFetchById(id, updateData);

      return updatedEntry;
    } catch (error) {
      throw new Error(`Error updating reference entry: ${error.message}`);
    }
  }

  /**
   * Import reference data from file
   */
  static async importReferenceData(tenantId, category, file, userId) {
    try {
      const results = {
        status: 'success',
        message: 'Import completed successfully',
        importedCount: 0,
        errors: []
      };

      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      if (fileExtension === '.csv') {
        return await this.importFromCSV(tenantId, category, file, userId, results);
      } else if (fileExtension === '.json') {
        return await this.importFromJSON(tenantId, category, file, userId, results);
      } else {
        throw new Error('Unsupported file format. Only CSV and JSON are supported.');
      }
    } catch (error) {
      throw new Error(`Error importing reference data: ${error.message}`);
    }
  }

  /**
   * Import from CSV file
   */
  static async importFromCSV(tenantId, category, file, userId, results) {
    return new Promise((resolve, reject) => {
      const entries = [];
      
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => {
          entries.push({
            tenant_id: tenantId,
            category,
            code: row.code,
            label: row.label,
            description: row.description || null,
            value: row.value || null,
            is_active: row.is_active !== 'false',
            created_by: userId,
            updated_by: userId
          });
        })
        .on('end', async () => {
          try {
            for (let i = 0; i < entries.length; i++) {
              try {
                await this.createReferenceEntry(entries[i]);
                results.importedCount++;
              } catch (error) {
                results.errors.push({
                  row: i + 1,
                  message: error.message
                });
              }
            }

            if (results.errors.length > 0) {
              results.status = 'partial';
              results.message = `Import completed with ${results.errors.length} errors`;
            }

            resolve(results);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Import from JSON file
   */
  static async importFromJSON(tenantId, category, file, userId, results) {
    try {
      const fileContent = fs.readFileSync(file.path, 'utf8');
      const entries = JSON.parse(fileContent);

      if (!Array.isArray(entries)) {
        throw new Error('JSON file must contain an array of entries');
      }

      for (let i = 0; i < entries.length; i++) {
        try {
          const entryData = {
            ...entries[i],
            tenant_id: tenantId,
            category,
            created_by: userId,
            updated_by: userId
          };
          
          await this.createReferenceEntry(entryData);
          results.importedCount++;
        } catch (error) {
          results.errors.push({
            row: i + 1,
            message: error.message
          });
        }
      }

      if (results.errors.length > 0) {
        results.status = 'partial';
        results.message = `Import completed with ${results.errors.length} errors`;
      }

      return results;
    } catch (error) {
      throw new Error(`Error importing from JSON: ${error.message}`);
    }
  }

  /**
   * Export reference data to specified format
   */
  static async exportReferenceData(tenantId, category, format = 'csv') {
    try {
      const entries = await ReferenceData.query()
        .where('tenant_id', tenantId)
        .where('category', category)
        .orderBy('code');

      if (format === 'csv') {
        return await this.exportToCSV(entries, category);
      } else if (format === 'json') {
        return await this.exportToJSON(entries, category);
      } else {
        throw new Error('Unsupported export format. Only CSV and JSON are supported.');
      }
    } catch (error) {
      throw new Error(`Error exporting reference data: ${error.message}`);
    }
  }

  /**
   * Export to CSV format
   */
  static async exportToCSV(entries, category) {
    const filename = `${category}_${new Date().toISOString().split('T')[0]}.csv`;
    const filePath = path.join('/tmp', filename);

    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'code', title: 'Code' },
        { id: 'label', title: 'Label' },
        { id: 'description', title: 'Description' },
        { id: 'value', title: 'Value' },
        { id: 'is_active', title: 'Active' },
        { id: 'created_at', title: 'Created At' }
      ]
    });

    await csvWriter.writeRecords(entries);
    const data = fs.readFileSync(filePath);
    fs.unlinkSync(filePath); // Clean up temp file

    return {
      data,
      filename,
      contentType: 'text/csv'
    };
  }

  /**
   * Export to JSON format
   */
  static async exportToJSON(entries, category) {
    const filename = `${category}_${new Date().toISOString().split('T')[0]}.json`;
    const data = JSON.stringify(entries, null, 2);

    return {
      data: Buffer.from(data),
      filename,
      contentType: 'application/json'
    };
  }

  /**
   * Configure external synchronization (placeholder for future implementation)
   */
  static async configureSynchronization(tenantId, category, config) {
    // This would be implemented based on specific external data sources
    // For now, return a success response
    return {
      status: 'success',
      message: 'Synchronization configured successfully'
    };
  }

  /**
   * Trigger manual synchronization (placeholder for future implementation)
   */
  static async triggerSynchronization(tenantId, category, userId) {
    // This would be implemented based on specific external data sources
    // For now, return a success response
    return {
      status: 'success',
      message: 'Synchronization triggered successfully'
    };
  }

  /**
   * Get synchronization history (placeholder for future implementation)
   */
  static async getSynchronizationHistory(tenantId, category) {
    // This would return actual synchronization history from a dedicated table
    // For now, return empty array
    return [];
  }

  /**
   * Get description for a category
   */
  static getCategoryDescription(category) {
    const descriptions = {
      'transport_modes': 'Transport modes (road, rail, air, sea)',
      'vehicle_types': 'Types of vehicles (trucks, vans, etc.)',
      'equipment_type': 'Types of equipment (trailers, containers, etc.)',
      'cargo_types': 'Types of cargo/merchandise',
      'incoterms': 'International commercial terms',
      'currencies': 'Currency codes and exchange rates',
      'countries': 'Country codes and information',
      'units_of_measure': 'Units of measurement',
      'document_types': 'Document types',
      'payment_terms': 'Payment terms and conditions',
      'shipment_status': 'Shipment status codes',
      'order_status': 'Order status codes',
      'invoice_status': 'Invoice status codes',
      'partner_types': 'Partner types (client, carrier, etc.)',
      'contact_types': 'Contact types',
      'address_types': 'Address types'
    };

    return descriptions[category] || 'Reference data category';
  }
}

module.exports = ReferenceDataService;

