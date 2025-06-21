/**
 * Custom hook for managing reference data
 * 
 * Provides state management and API interactions for reference data
 * with strict TypeScript typing
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ReferenceType,
  ReferenceEntry,
  ReferenceEntriesResponse,
  ReferenceEntriesFilters,
  ReferenceEntryFormData,
  ImportResult,
  ApiError
} from '../types/referenceData';
import ReferenceDataApiService from '../services/referenceDataApi';

interface UseReferenceDataState {
  types: ReferenceType[];
  entries: ReferenceEntry[];
  currentEntry: ReferenceEntry | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface UseReferenceDataActions {
  loadTypes: () => Promise<void>;
  loadEntries: (typeId: string, filters?: ReferenceEntriesFilters) => Promise<void>;
  loadEntry: (typeId: string, id: number) => Promise<void>;
  createEntry: (typeId: string, data: ReferenceEntryFormData) => Promise<boolean>;
  updateEntry: (typeId: string, id: number, data: Partial<ReferenceEntryFormData>) => Promise<boolean>;
  deactivateEntry: (typeId: string, id: number) => Promise<boolean>;
  activateEntry: (typeId: string, id: number) => Promise<boolean>;
  importData: (typeId: string, file: File) => Promise<ImportResult | null>;
  exportData: (typeId: string, format?: 'csv' | 'json') => Promise<void>;
  clearError: () => void;
  clearCurrentEntry: () => void;
}

type UseReferenceDataReturn = UseReferenceDataState & UseReferenceDataActions;

export const useReferenceData = (): UseReferenceDataReturn => {
  const [state, setState] = useState<UseReferenceDataState>({
    types: [],
    entries: [],
    currentEntry: null,
    total: 0,
    page: 1,
    totalPages: 0,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const handleApiError = useCallback((apiError: ApiError) => {
    setError(apiError.message || apiError.error);
  }, [setError]);

  const loadTypes = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.getReferenceTypes();
      
      if (response.error) {
        handleApiError(response.error);
        return;
      }

      if (response.data) {
        setState(prev => ({
          ...prev,
          types: response.data!,
          loading: false,
        }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
    }
  }, [setLoading, setError, handleApiError]);

  const loadEntries = useCallback(async (
    typeId: string,
    filters: ReferenceEntriesFilters = {}
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.getReferenceEntries(typeId, filters);
      
      if (response.error) {
        handleApiError(response.error);
        return;
      }

      if (response.data) {
        setState(prev => ({
          ...prev,
          entries: response.data!.data,
          total: response.data!.total,
          page: response.data!.page,
          totalPages: response.data!.totalPages,
          loading: false,
        }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
    }
  }, [setLoading, setError, handleApiError]);

  const loadEntry = useCallback(async (typeId: string, id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.getReferenceEntry(typeId, id);
      
      if (response.error) {
        handleApiError(response.error);
        return;
      }

      if (response.data) {
        setState(prev => ({
          ...prev,
          currentEntry: response.data!,
          loading: false,
        }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
    }
  }, [setLoading, setError, handleApiError]);

  const createEntry = useCallback(async (
    typeId: string,
    data: ReferenceEntryFormData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.createReferenceEntry(typeId, data);
      
      if (response.error) {
        handleApiError(response.error);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
      return false;
    }
  }, [setLoading, setError, handleApiError]);

  const updateEntry = useCallback(async (
    typeId: string,
    id: number,
    data: Partial<ReferenceEntryFormData>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.updateReferenceEntry(typeId, id, data);
      
      if (response.error) {
        handleApiError(response.error);
        setLoading(false);
        return false;
      }

      if (response.data) {
        setState(prev => ({
          ...prev,
          currentEntry: response.data!,
          loading: false,
        }));
      }

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
      return false;
    }
  }, [setLoading, setError, handleApiError]);

  const deactivateEntry = useCallback(async (typeId: string, id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.deactivateReferenceEntry(typeId, id);
      
      if (response.error) {
        handleApiError(response.error);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
      return false;
    }
  }, [setLoading, setError, handleApiError]);

  const activateEntry = useCallback(async (typeId: string, id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.activateReferenceEntry(typeId, id);
      
      if (response.error) {
        handleApiError(response.error);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
      return false;
    }
  }, [setLoading, setError, handleApiError]);

  const importData = useCallback(async (
    typeId: string,
    file: File
  ): Promise<ImportResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ReferenceDataApiService.importReferenceData(typeId, file);
      
      if (response.error) {
        handleApiError(response.error);
        setLoading(false);
        return null;
      }

      setLoading(false);
      return response.data || null;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
      return null;
    }
  }, [setLoading, setError, handleApiError]);

  const exportData = useCallback(async (
    typeId: string,
    format: 'csv' | 'json' = 'csv'
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const blob = await ReferenceDataApiService.exportReferenceData(typeId, format);
      
      if (!blob) {
        setError('Export failed');
        setLoading(false);
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${typeId}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const clearError = useCallback((): void => {
    setError(null);
  }, [setError]);

  const clearCurrentEntry = useCallback((): void => {
    setState(prev => ({ ...prev, currentEntry: null }));
  }, []);

  return {
    ...state,
    loadTypes,
    loadEntries,
    loadEntry,
    createEntry,
    updateEntry,
    deactivateEntry,
    activateEntry,
    importData,
    exportData,
    clearError,
    clearCurrentEntry,
  };
};

