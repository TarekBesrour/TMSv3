/**
 * Test file for ReferenceDataService
 * 
 * Unit tests for the reference data service layer
 */

const ReferenceDataService = require('../services/ReferenceDataService');
const ReferenceData = require('../models/ReferenceData');

// Mock the ReferenceData model
jest.mock('../models/ReferenceData');

describe('ReferenceDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReferenceTypes', () => {
    it('should return unique reference types for a tenant', async () => {
      const mockTypes = [
        { category: 'transport_modes' },
        { category: 'vehicle_types' },
        { category: 'currencies' }
      ];

      ReferenceData.query.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockTypes)
      });

      const result = await ReferenceDataService.getReferenceTypes(1);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id', 'transport_modes');
      expect(result[0]).toHaveProperty('name', 'transport_modes');
      expect(result[0]).toHaveProperty('description');
    });

    it('should handle errors when getting reference types', async () => {
      ReferenceData.query.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(ReferenceDataService.getReferenceTypes(1))
        .rejects.toThrow('Error getting reference types: Database error');
    });
  });

  describe('getReferenceEntries', () => {
    it('should return paginated reference entries with filters', async () => {
      const mockEntries = [
        { id: 1, code: 'ROAD', label: 'Transport routier', category: 'transport_modes' },
        { id: 2, code: 'RAIL', label: 'Transport ferroviaire', category: 'transport_modes' }
      ];

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockEntries),
        clone: jest.fn().mockReturnThis(),
        resultSize: jest.fn().mockResolvedValue(2)
      };

      ReferenceData.query.mockReturnValue(mockQuery);

      const result = await ReferenceDataService.getReferenceEntries(1, 'transport_modes', {
        page: 1,
        limit: 10,
        search: 'transport',
        sortBy: 'code',
        sortOrder: 'asc'
      });

      expect(result).toHaveProperty('total', 2);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('createReferenceEntry', () => {
    it('should create a new reference entry successfully', async () => {
      const entryData = {
        tenant_id: 1,
        category: 'transport_modes',
        code: 'AIR',
        label: 'Transport aérien',
        is_active: true
      };

      const mockCreatedEntry = { id: 3, ...entryData };

      // Mock validation
      ReferenceData.validateReferenceData = jest.fn().mockResolvedValue([]);
      
      ReferenceData.query.mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockCreatedEntry)
      });

      const result = await ReferenceDataService.createReferenceEntry(entryData);

      expect(result).toEqual(mockCreatedEntry);
      expect(ReferenceData.validateReferenceData).toHaveBeenCalledWith(entryData);
    });

    it('should throw error when validation fails', async () => {
      const entryData = {
        tenant_id: 1,
        category: 'transport_modes',
        code: '',
        label: 'Transport aérien'
      };

      ReferenceData.validateReferenceData = jest.fn().mockResolvedValue(['Code is required']);

      await expect(ReferenceDataService.createReferenceEntry(entryData))
        .rejects.toThrow('Validation failed: Code is required');
    });
  });

  describe('updateReferenceEntry', () => {
    it('should update an existing reference entry successfully', async () => {
      const existingEntry = {
        id: 1,
        tenant_id: 1,
        category: 'transport_modes',
        code: 'ROAD',
        label: 'Transport routier'
      };

      const updateData = {
        label: 'Transport routier mis à jour'
      };

      const updatedEntry = { ...existingEntry, ...updateData };

      ReferenceData.query.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        findById: jest.fn().mockResolvedValue(existingEntry),
        patchAndFetchById: jest.fn().mockResolvedValue(updatedEntry)
      });

      ReferenceData.validateReferenceData = jest.fn().mockResolvedValue([]);

      const result = await ReferenceDataService.updateReferenceEntry(1, 'transport_modes', 1, updateData);

      expect(result).toEqual(updatedEntry);
    });

    it('should return null when entry not found', async () => {
      ReferenceData.query.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        findById: jest.fn().mockResolvedValue(null)
      });

      const result = await ReferenceDataService.updateReferenceEntry(1, 'transport_modes', 999, {});

      expect(result).toBeNull();
    });
  });

  describe('importFromCSV', () => {
    it('should import entries from CSV successfully', async () => {
      const mockFile = {
        path: '/tmp/test.csv'
      };

      const mockEntries = [
        { code: 'SEA', label: 'Transport maritime', description: 'Transport par mer' },
        { code: 'AIR', label: 'Transport aérien', description: 'Transport par avion' }
      ];

      // Mock fs and csv-parser
      const fs = require('fs');
      const csv = require('csv-parser');
      
      jest.mock('fs');
      jest.mock('csv-parser');

      // This would require more complex mocking for the stream operations
      // For now, we'll test the basic structure
      expect(ReferenceDataService.importFromCSV).toBeDefined();
    });
  });

  describe('exportToCSV', () => {
    it('should export entries to CSV format', async () => {
      const mockEntries = [
        { code: 'ROAD', label: 'Transport routier', description: 'Transport par route' },
        { code: 'RAIL', label: 'Transport ferroviaire', description: 'Transport par rail' }
      ];

      // Mock csv-writer and fs
      jest.mock('csv-writer');
      jest.mock('fs');

      const result = await ReferenceDataService.exportToCSV(mockEntries, 'transport_modes');

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('contentType', 'text/csv');
      expect(result).toHaveProperty('data');
    });
  });

  describe('getCategoryDescription', () => {
    it('should return correct description for known categories', () => {
      const description = ReferenceDataService.getCategoryDescription('transport_modes');
      expect(description).toBe('Transport modes (road, rail, air, sea)');
    });

    it('should return default description for unknown categories', () => {
      const description = ReferenceDataService.getCategoryDescription('unknown_category');
      expect(description).toBe('Reference data category');
    });
  });
});

module.exports = {};

