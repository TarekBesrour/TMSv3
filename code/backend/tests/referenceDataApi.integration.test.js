/**
 * Integration tests for Reference Data API endpoints
 */

const request = require('supertest');
const app = require('../app');

describe('Reference Data API Integration Tests', () => {
  let authToken;
  let testTenantId = 1;

  beforeAll(async () => {
    // Setup test database and get auth token
    // This would typically involve creating a test user and getting a JWT token
    authToken = 'test-jwt-token';
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('GET /api/v1/references/types', () => {
    it('should return list of reference types', async () => {
      const response = await request(app)
        .get('/api/v1/references/types')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('description');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/references/types')
        .expect(401);
    });
  });

  describe('GET /api/v1/references/:typeId/entries', () => {
    it('should return paginated reference entries', async () => {
      const response = await request(app)
        .get('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
          sortBy: 'code',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter entries by search term', async () => {
      const response = await request(app)
        .get('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          search: 'road',
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      // Check that results contain the search term
      if (response.body.data.length > 0) {
        const hasSearchTerm = response.body.data.some(entry => 
          entry.code.toLowerCase().includes('road') ||
          entry.label.toLowerCase().includes('road') ||
          (entry.description && entry.description.toLowerCase().includes('road'))
        );
        expect(hasSearchTerm).toBe(true);
      }
    });
  });

  describe('POST /api/v1/references/:typeId/entries', () => {
    it('should create a new reference entry', async () => {
      const newEntry = {
        code: 'TEST_MODE',
        label: 'Test Transport Mode',
        description: 'A test transport mode for integration testing',
        is_active: true,
        language_code: 'fr'
      };

      const response = await request(app)
        .post('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEntry)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('code', newEntry.code);
      expect(response.body).toHaveProperty('label', newEntry.label);
      expect(response.body).toHaveProperty('category', 'transport_modes');
      expect(response.body).toHaveProperty('tenant_id', testTenantId);
    });

    it('should return 400 for invalid data', async () => {
      const invalidEntry = {
        // Missing required fields
        description: 'Invalid entry without code and label'
      };

      const response = await request(app)
        .post('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEntry)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/references/:typeId/entries/:id', () => {
    let testEntryId;

    beforeAll(async () => {
      // Create a test entry to update
      const newEntry = {
        code: 'UPDATE_TEST',
        label: 'Update Test Entry',
        description: 'Entry for update testing',
        is_active: true,
        language_code: 'fr'
      };

      const response = await request(app)
        .post('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEntry);

      testEntryId = response.body.id;
    });

    it('should update an existing reference entry', async () => {
      const updateData = {
        label: 'Updated Test Entry',
        description: 'Updated description for testing'
      };

      const response = await request(app)
        .put(`/api/v1/references/transport_modes/entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', testEntryId);
      expect(response.body).toHaveProperty('label', updateData.label);
      expect(response.body).toHaveProperty('description', updateData.description);
    });

    it('should return 404 for non-existent entry', async () => {
      const updateData = {
        label: 'Updated Label'
      };

      await request(app)
        .put('/api/v1/references/transport_modes/entries/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/references/:typeId/entries/:id/deactivate', () => {
    let testEntryId;

    beforeAll(async () => {
      // Create a test entry to deactivate
      const newEntry = {
        code: 'DEACTIVATE_TEST',
        label: 'Deactivate Test Entry',
        is_active: true,
        language_code: 'fr'
      };

      const response = await request(app)
        .post('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEntry);

      testEntryId = response.body.id;
    });

    it('should deactivate a reference entry', async () => {
      const response = await request(app)
        .patch(`/api/v1/references/transport_modes/entries/${testEntryId}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testEntryId);
      expect(response.body).toHaveProperty('is_active', false);
    });
  });

  describe('PATCH /api/v1/references/:typeId/entries/:id/activate', () => {
    it('should activate a reference entry', async () => {
      // Using the previously deactivated entry
      const testEntryId = 1; // Assuming we have a deactivated entry

      const response = await request(app)
        .patch(`/api/v1/references/transport_modes/entries/${testEntryId}/activate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testEntryId);
      expect(response.body).toHaveProperty('is_active', true);
    });
  });

  describe('POST /api/v1/references/:typeId/import', () => {
    it('should import reference data from CSV file', async () => {
      // Create a test CSV file content
      const csvContent = `code,label,description,is_active
IMPORT_TEST1,Import Test 1,First import test entry,true
IMPORT_TEST2,Import Test 2,Second import test entry,false`;

      const response = await request(app)
        .post('/api/v1/references/transport_modes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(csvContent), 'test.csv')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('importedCount');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 when no file is provided', async () => {
      await request(app)
        .post('/api/v1/references/transport_modes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/references/:typeId/export', () => {
    it('should export reference data as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/references/transport_modes/export')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' })
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should export reference data as JSON', async () => {
      const response = await request(app)
        .get('/api/v1/references/transport_modes/export')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'json' })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database failures
      // For now, we'll test that the API returns proper error responses
      
      const response = await request(app)
        .get('/api/v1/references/invalid_type/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should validate request parameters', async () => {
      const response = await request(app)
        .get('/api/v1/references/transport_modes/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 'invalid',
          limit: 'invalid'
        });

      // Should handle invalid query parameters gracefully
      expect(response.status).toBeLessThan(500);
    });
  });
});

module.exports = {};

