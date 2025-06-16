import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  MapIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Tours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchTours();
  }, [pagination.page, searchTerm, statusFilter, dateFilter]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(searchTerm && { searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFilter && { planned_date_start: dateFilter })
      });

      const response = await fetch(`/api/tours?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTours(data.data.data);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'planned':
        return 'Planifiée';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return `${Math.round(distance * 100) / 100} km`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des tournées...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Planification des Tournées</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez et optimisez vos tournées de transport pour une efficacité maximale.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/tours/new')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle Tournée
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Rechercher
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Nom ou numéro de tournée..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="">Tous les statuts</option>
              <option value="planned">Planifiée</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date planifiée
            </label>
            <input
              type="date"
              name="date"
              id="date"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={dateFilter}
              onChange={handleDateFilter}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tours List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tours.map((tour) => (
            <li key={tour.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TruckIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {tour.tour_name}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(tour.status)}`}>
                        {getStatusName(tour.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {tour.tour_number}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>
                        {formatDate(tour.planned_date)}
                        {tour.start_time && (
                          <span className="ml-2">
                            {formatTime(tour.start_time)}
                            {tour.end_time && ` - ${formatTime(tour.end_time)}`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {tour.vehicle && (
                    <div className="flex items-center text-sm text-gray-500">
                      <TruckIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{tour.vehicle.license_plate}</span>
                    </div>
                  )}
                  
                  {tour.driver && (
                    <div className="flex items-center text-sm text-gray-500">
                      <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{tour.driver.first_name} {tour.driver.last_name}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <MapIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{formatDistance(tour.total_distance)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{formatDuration(tour.estimated_duration)}</span>
                  </div>

                  {tour.optimization_score && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ChartBarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{Math.round(tour.optimization_score)}%</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/tours/${tour.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => navigate(`/tours/${tour.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {tours.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune tournée</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer une nouvelle tournée.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/tours/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Nouvelle Tournée
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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

export default Tours;

