/**
 * ReferenceEntryTable Component
 * 
 * Generic table component for displaying reference entries
 * with search, filtering, sorting, and pagination
 * with strict TypeScript typing
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  ReferenceEntry,
  ReferenceEntriesFilters,
  TableColumn,
  SortOrder
} from '../types/referenceData';

interface ReferenceEntryTableProps {
  entries: ReferenceEntry[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  onFiltersChange: (filters: ReferenceEntriesFilters) => void;
  onCreateClick: () => void;
  onEditClick: (entry: ReferenceEntry) => void;
  onViewClick: (entry: ReferenceEntry) => void;
  onDeleteClick: (entry: ReferenceEntry) => void;
  onActivateClick: (entry: ReferenceEntry) => void;
  onDeactivateClick: (entry: ReferenceEntry) => void;
  onImportClick: () => void;
  onExportClick: () => void;
  className?: string;
}

const ReferenceEntryTable: React.FC<ReferenceEntryTableProps> = ({
  entries,
  total,
  page,
  totalPages,
  loading,
  onFiltersChange,
  onCreateClick,
  onEditClick,
  onViewClick,
  onDeleteClick,
  onActivateClick,
  onDeactivateClick,
  onImportClick,
  onExportClick,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof ReferenceEntry>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [limit, setLimit] = useState<number>(10);

  const columns: TableColumn[] = useMemo(() => [
    { key: 'code', label: 'Code', sortable: true, width: '15%' },
    { key: 'label', label: 'Libellé', sortable: true, width: '25%' },
    { key: 'description', label: 'Description', sortable: false, width: '30%' },
    { key: 'is_active', label: 'Statut', sortable: true, width: '10%' },
    { key: 'created_at', label: 'Créé le', sortable: true, width: '15%' }
  ], []);

  const handleSearch = useCallback((value: string): void => {
    setSearchTerm(value);
    onFiltersChange({
      page: 1,
      limit,
      search: value || undefined,
      sortBy,
      sortOrder
    });
  }, [limit, sortBy, sortOrder, onFiltersChange]);

  const handleSort = useCallback((column: keyof ReferenceEntry): void => {
    const newSortOrder: SortOrder = 
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    
    setSortBy(column);
    setSortOrder(newSortOrder);
    
    onFiltersChange({
      page: 1,
      limit,
      search: searchTerm || undefined,
      sortBy: column,
      sortOrder: newSortOrder
    });
  }, [sortBy, sortOrder, limit, searchTerm, onFiltersChange]);

  const handlePageChange = useCallback((newPage: number): void => {
    onFiltersChange({
      page: newPage,
      limit,
      search: searchTerm || undefined,
      sortBy,
      sortOrder
    });
  }, [limit, searchTerm, sortBy, sortOrder, onFiltersChange]);

  const handleLimitChange = useCallback((newLimit: number): void => {
    setLimit(newLimit);
    onFiltersChange({
      page: 1,
      limit: newLimit,
      search: searchTerm || undefined,
      sortBy,
      sortOrder
    });
  }, [searchTerm, sortBy, sortOrder, onFiltersChange]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const renderSortIcon = (column: keyof ReferenceEntry): React.ReactNode => {
    if (sortBy !== column) {
      return null;
    }
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  const renderStatusBadge = (isActive: boolean): React.ReactNode => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        Inactif
      </span>
    );
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Entrées de Référentiel
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {total} entrée{total > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-2">
            <button
              onClick={onImportClick}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Importer
            </button>
            <button
              onClick={onExportClick}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Exporter
            </button>
            <button
              onClick={onCreateClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher par code, libellé ou description..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="limit" className="text-sm text-gray-700">
              Afficher:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-gray-500">
                  Aucune entrée trouvée
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={entry.description || ''}>
                      {entry.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(entry.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewClick(entry)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {entry.is_editable && (
                        <button
                          onClick={() => onEditClick(entry)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {entry.is_active ? (
                        <button
                          onClick={() => onDeactivateClick(entry)}
                          className="text-red-600 hover:text-red-900"
                          title="Désactiver"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateClick(entry)}
                          className="text-green-600 hover:text-green-900"
                          title="Activer"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {!entry.is_system && (
                        <button
                          onClick={() => onDeleteClick(entry)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{(page - 1) * limit + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(page * limit, total)}
                </span>{' '}
                sur <span className="font-medium">{total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(pageNum => 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    Math.abs(pageNum - page) <= 2
                  )
                  .map((pageNum, index, array) => (
                    <React.Fragment key={pageNum}>
                      {index > 0 && array[index - 1] !== pageNum - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceEntryTable;

