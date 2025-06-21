/**
 * Reference Data API Service
 * 
 * Service for making API calls to the reference data endpoints
 * with strict TypeScript typing
 */

import {
  ReferenceType,
  ReferenceEntry,
  ReferenceEntriesResponse,
  ReferenceEntriesFilters,
  ReferenceEntryFormData,
  ImportResult,
  SyncConfig,
  SyncHistory,
  ApiResponse,
  ApiError
} from '../types/referenceData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

class ReferenceDataApiService {
  private static async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        return { error: errorData };
      }

      const data: T = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          error: 'Network Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  /**
   * Get all reference types
   */
  static async getReferenceTypes(): Promise<ApiResponse<ReferenceType[]>> {
    return this.makeRequest<ReferenceType[]>('/references/types');
  }

  /**
   * Get all entries for a specific reference type
   */
  static async getReferenceEntries(
    typeId: string,
    filters: ReferenceEntriesFilters = {}
  ): Promise<ApiResponse<ReferenceEntriesResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
    if (filters.limit !== undefined) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const queryString = queryParams.toString();
    const url = `/references/${typeId}/entries${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ReferenceEntriesResponse>(url);
  }

  /**
   * Get a single reference entry by ID
   */
  static async getReferenceEntry(
    typeId: string,
    id: number
  ): Promise<ApiResponse<ReferenceEntry>> {
    return this.makeRequest<ReferenceEntry>(`/references/${typeId}/entries/${id}`);
  }

  /**
   * Create a new reference entry
   */
  static async createReferenceEntry(
    typeId: string,
    entryData: ReferenceEntryFormData
  ): Promise<ApiResponse<ReferenceEntry>> {
    return this.makeRequest<ReferenceEntry>(`/references/${typeId}/entries`, {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  /**
   * Update an existing reference entry
   */
  static async updateReferenceEntry(
    typeId: string,
    id: number,
    entryData: Partial<ReferenceEntryFormData>
  ): Promise<ApiResponse<ReferenceEntry>> {
    return this.makeRequest<ReferenceEntry>(`/references/${typeId}/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  /**
   * Deactivate a reference entry
   */
  static async deactivateReferenceEntry(
    typeId: string,
    id: number
  ): Promise<ApiResponse<ReferenceEntry>> {
    return this.makeRequest<ReferenceEntry>(`/references/${typeId}/entries/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  /**
   * Activate a reference entry
   */
  static async activateReferenceEntry(
    typeId: string,
    id: number
  ): Promise<ApiResponse<ReferenceEntry>> {
    return this.makeRequest<ReferenceEntry>(`/references/${typeId}/entries/${id}/activate`, {
      method: 'PATCH',
    });
  }

  /**
   * Import reference data from file
   */
  static async importReferenceData(
    typeId: string,
    file: File
  ): Promise<ApiResponse<ImportResult>> {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/references/${typeId}/import`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        return { error: errorData };
      }

      const data: ImportResult = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          error: 'Network Error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  /**
   * Export reference data
   */
  static async exportReferenceData(
    typeId: string,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob | null> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/references/${typeId}/export?format=${format}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting reference data:', error);
      return null;
    }
  }

  /**
   * Configure external synchronization
   */
  static async configureSynchronization(
    typeId: string,
    config: SyncConfig
  ): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.makeRequest<{ status: string; message: string }>(
      `/references/${typeId}/sync/configure`,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  /**
   * Trigger manual synchronization
   */
  static async triggerSynchronization(
    typeId: string
  ): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.makeRequest<{ status: string; message: string }>(
      `/references/${typeId}/sync/trigger`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get synchronization history
   */
  static async getSynchronizationHistory(
    typeId: string
  ): Promise<ApiResponse<SyncHistory[]>> {
    return this.makeRequest<SyncHistory[]>(`/references/${typeId}/sync/history`);
  }
}

export default ReferenceDataApiService;

