```typescript
// Backend API Endpoints for Reference Data Management

// Base URL: /api/v1/references

// 1. Get all reference types
// GET /api/v1/references/types
// Response: [{ id: string, name: string, description: string }]

// 2. Get all entries for a specific reference type
// GET /api/v1/references/:typeId/entries
// Query Parameters: 
//   - page: number (default 1)
//   - limit: number (default 10)
//   - search: string (fuzzy search on code, label_fr, label_en)
//   - sortBy: string (field to sort by, e.g., 'code', 'label_fr')
//   - sortOrder: 'asc' | 'desc' (default 'asc')
// Response: { total: number, page: number, limit: number, data: [{ id: string, code: string, label_fr: string, label_en: string, isActive: boolean, validFrom: date, validTo: date, ...specific_attributes }] }

// 3. Get a single reference entry by ID
// GET /api/v1/references/:typeId/entries/:id
// Response: { id: string, code: string, label_fr: string, label_en: string, isActive: boolean, validFrom: date, validTo: date, ...specific_attributes }

// 4. Create a new reference entry
// POST /api/v1/references/:typeId/entries
// Request Body: { code: string, label_fr: string, label_en?: string, isActive?: boolean, validFrom?: date, validTo?: date, ...specific_attributes }
// Response: { id: string, ...created_entry }

// 5. Update an existing reference entry
// PUT /api/v1/references/:typeId/entries/:id
// Request Body: { code?: string, label_fr?: string, label_en?: string, isActive?: boolean, validFrom?: date, validTo?: date, ...specific_attributes }
// Response: { id: string, ...updated_entry }

// 6. Deactivate a reference entry (soft delete)
// PATCH /api/v1/references/:typeId/entries/:id/deactivate
// Response: { id: string, isActive: false, ...updated_entry }

// 7. Activate a reference entry
// PATCH /api/v1/references/:typeId/entries/:id/activate
// Response: { id: string, isActive: true, ...updated_entry }

// 8. Import reference data
// POST /api/v1/references/:typeId/import
// Request Body: FormData with file (CSV, Excel, JSON, XML)
// Response: { status: 'success' | 'failure', message: string, importedCount: number, errors: [{ row: number, message: string }] }

// 9. Export reference data
// GET /api/v1/references/:typeId/export
// Query Parameters: 
//   - format: 'csv' | 'excel' | 'json' | 'xml' (default 'csv')
// Response: File download

// 10. Configure external synchronization for a reference type
// POST /api/v1/references/:typeId/sync/configure
// Request Body: { source: string, frequency: string, mappingRules: object, validationRules: object }
// Response: { status: 'success', message: string }

// 11. Trigger manual synchronization for a reference type
// POST /api/v1/references/:typeId/sync/trigger
// Response: { status: 'success' | 'failure', message: string }

// 12. Get synchronization history for a reference type
// GET /api/v1/references/:typeId/sync/history
// Response: [{ timestamp: date, status: 'success' | 'failure', message: string, newEntries: number, updatedEntries: number, errors: number }]

```

