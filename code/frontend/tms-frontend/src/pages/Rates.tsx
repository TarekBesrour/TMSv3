import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  TruckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Rates = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    transport_mode: '',
    rate_type: '',
    currency: '',
    status: 'active'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchRates();
  }, [pagination.page, searchTerm, filters]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search_term: searchTerm,
        ...filters
      });

      const response = await fetch(`/api/rates?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setRates(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      transport_mode: '',
      rate_type: '',
      currency: '',
      status: 'active'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusName = (status) => {
    const statusNames = {
      active: 'Actif',
      inactive: 'Inactif',
      expired: 'Expiré'
    };
    return statusNames[status] || status;
  };

  const getTransportModeIcon = (mode) => {
    switch (mode) {
      case 'road':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'sea':
        return <GlobeAltIcon className="h-5 w-5 text-blue-600" />;
      case 'air':
        return <GlobeAltIcon className="h-5 w-5 text-sky-500" />;
      case 'rail':
        return <TruckIcon className="h-5 w-5 text-green-500" />;
      default:
        return <TruckIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Gestion des Tarifs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les tarifs de transport pour tous les modes et destinations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/rates/new')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau tarif
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Recherche
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Nom, origine, destination..."
                />
              </div>
            </div>

            {/* Transport Mode Filter */}
            <div>
              <label htmlFor="transport_mode" className="block text-sm font-medium text-gray-700">
                Mode de Transport
              </label>
              <select
                id="transport_mode"
                name="transport_mode"
                value={filters.transport_mode}
                onChange={(e) => handleFilterChange('transport_mode', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Tous</option>
                <option value="road">Routier</option>
                <option value="sea">Maritime</option>
                <option value="air">Aérien</option>
                <option value="rail">Ferroviaire</option>
                <option value="multimodal">Multimodal</option>
              </select>
            </div>

            {/* Rate Type Filter */}
            <div>
              <label htmlFor="rate_type" className="block text-sm font-medium text-gray-700">
                Type de Tarif
              </label>
              <select
                id="rate_type"
                name="rate_type"
                value={filters.rate_type}
                onChange={(e) => handleFilterChange('rate_type', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Tous</option>
                <option value="per_km">Par kilomètre</option>
                <option value="per_kg">Par kilogramme</option>
                <option value="per_m3">Par mètre cube</option>
                <option value="per_pallet">Par palette</option>
                <option value="per_container">Par conteneur</option>
                <option value="flat_rate">Forfait</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Devise
              </label>
              <select
                id="currency"
                name="currency"
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Toutes</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Effacer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tarifs ({pagination.total})
          </h3>
        </div>
        {loading ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="animate-pulse">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : rates.length === 0 ? (
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-500">Aucun tarif trouvé.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rates.map((rate) => (
              <li key={rate.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getTransportModeIcon(rate.transport_mode)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {rate.rate_name}
                        </p>
                      </div>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          {rate.origin_country} → {rate.destination_country}
                        </p>
                        <span className="mx-2 text-gray-300">•</span>
                        <p className="text-sm text-gray-500">
                          {rate.rate_type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(rate.base_rate, rate.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valide jusqu'au {formatDate(rate.valid_until)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(rate.status)}`}>
                      {getStatusName(rate.status)}
                    </span>
                    <button
                      onClick={() => navigate(`/rates/${rate.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rates;

