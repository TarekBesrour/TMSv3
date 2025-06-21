/**
 * ReferenceEntries Page
 * 
 * Page for displaying and managing entries of a specific reference type
 * Following the same pattern as Sites.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BarsArrowUpIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ReferenceEntry, ReferenceEntriesFilters } from '../types/referenceData';
import { useReferenceData } from '../hooks/useReferenceData';


const ReferenceEntries: React.FC = () => {
  const navigate = useNavigate();
  const { typeId } = useParams<{ typeId: string }>();
  const {
    entries,
    total,
    page,
    totalPages,
    loading,
    error,
    loadEntries,
    deactivateEntry,
    activateEntry,
    exportData,
    clearError
  } = useReferenceData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof ReferenceEntry>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (typeId) {
      const filters: ReferenceEntriesFilters = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection
      };
      loadEntries(typeId, filters);
    }
  }, [typeId, currentPage, pageSize, searchTerm, sortField, sortDirection, loadEntries]);

  const handleSearch = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof ReferenceEntry): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleCreateEntry = (): void => {
    navigate(`/admin/references/${typeId}/new`);
  };

  const handleViewEntry = (entry: ReferenceEntry): void => {
    navigate(`/admin/references/${typeId}/${entry.id}`);
  };

  const handleEditEntry = (entry: ReferenceEntry): void => {
    navigate(`/admin/references/${typeId}/${entry.id}/edit`);
  };

  const handleDeleteEntry = async (entry: ReferenceEntry): Promise<void> => {
    if (window.confirm(`Êtes-vous sûr de vouloir désactiver l'entrée "${entry.label}" ?`)) {
      await deactivateEntry(typeId!, entry.id);
      // Reload entries after deactivation
      const filters: ReferenceEntriesFilters = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection
      };
      loadEntries(typeId!, filters);
    }
  };

  const handleActivateEntry = async (entry: ReferenceEntry): Promise<void> => {
    await activateEntry(typeId!, entry.id);
    // Reload entries after activation
    const filters: ReferenceEntriesFilters = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm || undefined,
      sortBy: sortField,
      sortOrder: sortDirection
    };
    loadEntries(typeId!, filters);
  };

  const handleDeactivateEntry = async (entry: ReferenceEntry): Promise<void> => {
    if (window.confirm(`Êtes-vous sûr de vouloir désactiver l'entrée "${entry.label}" ?`)) {
      await deactivateEntry(typeId!, entry.id);
      // Reload entries after deactivation
      const filters: ReferenceEntriesFilters = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection
      };
      loadEntries(typeId!, filters);
    }
  };

  const handleImport = (): void => {
    navigate(`/admin/references/${typeId}/import`);
  };

  const handleExport = async (): Promise<void> => {
    if (typeId) {
      await exportData(typeId, 'csv');
    }
  };

  const handleBackToTypes = (): void => {
    navigate('/admin/references');
  };

  const getTypeDisplayName = (typeId: string): string => {
    const typeNames: Record<string, string> = {
      'transport_modes': 'Modes de Transport',
      'vehicle_types': 'Types de Véhicules',
      'cargo_types': 'Types de Marchandises',
      'incoterms': 'Incoterms',
      'currencies': 'Devises',
      'countries': 'Pays',
      'units_of_measure': 'Unités de Mesure',
      'document_types': 'Types de Documents',
      'payment_terms': 'Conditions de Paiement',
      'shipment_status': 'Statuts d\'Expédition',
      'order_status': 'Statuts de Commande',
      'invoice_status': 'Statuts de Facture',
      'partner_types': 'Types de Partenaires',
      'contact_types': 'Types de Contacts',
      'address_types': 'Types d\'Adresses'
    };

    return typeNames[typeId] || typeId;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredEntries = entries.filter(entry => {
    if (statusFilter === 'active') return entry.is_active;
    if (statusFilter === 'inactive') return !entry.is_active;
    return true;
  });

  if (!typeId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Type de référentiel non spécifié</h3>
        </div>
      </div>
    );
  }

  if (loading && entries.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackToTypes}
            className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux référentiels
          </button>
        </div>
        
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {getTypeDisplayName(typeId)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {total} entrée{total > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
            <button
              type="button"
              onClick={handleImport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Importer
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Exporter
            </button>
            <button
              type="button"
              onClick={handleCreateEntry}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouvelle entrée
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher..."
            />
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          {/* Page size */}
          <div>
            <label htmlFor="page-size" className="block text-sm font-medium text-gray-700">
              Afficher
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Entries table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center">
                        Code
                        {sortField === 'code' && (
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('label')}
                    >
                      <div className="flex items-center">
                        Libellé
                        {sortField === 'label' && (
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('is_active')}
                    >
                      <div className="flex items-center">
                        Statut
                        {sortField === 'is_active' && (
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Créé le
                        {sortField === 'created_at' && (
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-gray-600">Chargement...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune entrée trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.label}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.description || ''}>
                            {entry.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewEntry(entry)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {entry.is_editable && (
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {entry.is_active ? (
                              <button
                                onClick={() => handleDeactivateEntry(entry)}
                                className="text-red-600 hover:text-red-900"
                                title="Désactiver"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateEntry(entry)}
                                className="text-green-600 hover:text-green-900"
                                title="Activer"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                            {!entry.is_system && (
                              <button
                                onClick={() => handleDeleteEntry(entry)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, total)}
                </span>{' '}
                sur <span className="font-medium">{total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceEntries;

