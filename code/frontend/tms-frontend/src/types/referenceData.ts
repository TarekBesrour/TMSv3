// Reference Data Types with strict TypeScript typing
export interface ReferenceType {
  id: string;
  name: string;
  description: string;
}

export interface ReferenceEntryMetadata {
  [key: string]: string | number | boolean | null;
}

export interface ReferenceEntry {
  id: number;
  tenant_id: number;
  category: string;
  code: string;
  label: string;
  description: string | null;
  value: string | null;
  metadata: ReferenceEntryMetadata | null;
  parent_id: number | null;
  sort_order: number;
  level: number;
  is_active: boolean;
  is_system: boolean;
  is_editable: boolean;
  language_code: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  parent?: ReferenceEntry;
  children?: ReferenceEntry[];
}

export interface ReferenceEntryFormData {
  code: string;
  label: string;
  description?: string;
  value?: string;
  metadata?: ReferenceEntryMetadata;
  parent_id?: number;
  sort_order?: number;
  is_active?: boolean;
  language_code?: string;
}

export interface ReferenceEntriesResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ReferenceEntry[];
}

export interface ReferenceEntriesFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof ReferenceEntry;
  sortOrder?: 'asc' | 'desc';
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  status: 'success' | 'failure' | 'partial';
  message: string;
  importedCount: number;
  errors: ImportError[];
}

export interface SyncMappingRule {
  sourceField: string;
  targetField: keyof ReferenceEntry;
  transformation?: string;
}

export interface SyncValidationRule {
  field: keyof ReferenceEntry;
  rule: 'required' | 'unique' | 'format';
  value?: string;
}

export interface SyncConfig {
  source: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  mappingRules: SyncMappingRule[];
  validationRules: SyncValidationRule[];
}

export interface SyncHistory {
  timestamp: string;
  status: 'success' | 'failure';
  message: string;
  newEntries: number;
  updatedEntries: number;
  errors: number;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export type SortOrder = 'asc' | 'desc';

export type ReferenceEntryStatus = 'active' | 'inactive';

export interface TableColumn {
  key: keyof ReferenceEntry;
  label: string;
  sortable: boolean;
  width?: string;
}

