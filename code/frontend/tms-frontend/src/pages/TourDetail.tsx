import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTour(id);
    }
  }, [id]);

  const fetchTour = async (tourId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tours/${tourId}`);
      const data = await response.json();
      if (data.success) {
        setTour(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch tour details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tournée ?')) {
      try {
        const response = await fetch(`/api/tours/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          navigate('/tours');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete tour.');
        console.error(err);
      }
    }
  };

  const handleOptimize = async () => {
    try {
      // This would typically call an optimization endpoint
      // For now, just simulate a success
      alert('Optimisation de la tournée lancée ! (Fonctionnalité à implémenter)');
      // const response = await fetch(`/api/tours/${id}/optimize`, { method: 'POST' });
      // const data = await response.json();
      // if (data.success) {
      //   fetchTour(id); // Refresh tour data after optimization
      // } else {
      //   setError(data.message);
      // }
    } catch (err) {
      setError('Failed to optimize tour.');
      console.error(err);
    }
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('fr-FR');
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
    return <div className="text-center py-10">Chargement des détails de la tournée...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!tour) {
    return <div className="text-center py-10">Tournée non trouvée.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails de la Tournée: {tour.tour_name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur la tournée {tour.tour_number}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={handleOptimize}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Optimiser
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tours/${tour.id}/edit`)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Modifier
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Tour Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom de la Tournée</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tour.tour_name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro de Tournée</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tour.tour_number}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(tour.status)}`}>
                  {getStatusName(tour.status)}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date Planifiée</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(tour.planned_date)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Heure de Début</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatTime(tour.start_time)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Heure de Fin</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatTime(tour.end_time)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Véhicule</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tour.vehicle ? `${tour.vehicle.registration_number} (${tour.vehicle.type})` : 'Non assigné'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Chauffeur</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tour.driver ? `${tour.driver.first_name} ${tour.driver.last_name}` : 'Non assigné'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Distance Totale</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDistance(tour.total_distance)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Durée Estimée</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDuration(tour.estimated_duration)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Score d'Optimisation</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {tour.optimization_score ? `${Math.round(tour.optimization_score)}%` : 'N/A'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tour.notes || 'Aucune'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Tour Stops */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Arrêts de la Tournée</h3>
          <button
            type="button"
            onClick={() => navigate(`/tours/${tour.id}/stops/new`)} // Assuming a route for adding stops
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Ajouter un arrêt
          </button>
        </div>
        <div className="border-t border-gray-200">
          {tour.stops && tour.stops.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {tour.stops.map((stop, index) => (
                <li key={stop.id || index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <MapPinIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Arrêt #{index + 1}: {stop.address ? `${stop.address.street}, ${stop.address.city}` : `Adresse ID: ${stop.address_id}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {stop.location_type} | Planifié: {formatDateTime(stop.scheduled_time)}
                      </p>
                      {stop.order_id && <p className="text-sm text-gray-500">Commande ID: {stop.order_id}</p>}
                      {stop.shipment_id && <p className="text-sm text-gray-500">Expédition ID: {stop.shipment_id}</p>}
                    </div>
                    <div className="flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => navigate(`/tour-stops/${stop.id}/edit`)} // Assuming a route for editing stops
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cet arrêt ?')) {
                            // Implement delete stop logic here
                            alert('Suppression d\'arrêt (Fonctionnalité à implémenter)');
                          }
                        }}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              Aucun arrêt défini pour cette tournée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetail;

