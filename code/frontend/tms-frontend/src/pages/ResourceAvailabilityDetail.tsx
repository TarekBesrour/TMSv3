import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ResourceAvailabilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAvailability(id);
    }
  }, [id]);

  const fetchAvailability = async (availabilityId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/availabilities/${availabilityId}`);
      const data = await response.json();
      if (data.success) {
        setAvailability(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch availability details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      try {
        const response = await fetch(`/api/availabilities/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          navigate('/resource-availability');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete availability.');
        console.error(err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      case 'booked':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'unavailable':
        return 'Indisponible';
      case 'booked':
        return 'Réservé';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const getResourceTypeName = (type) => {
    switch (type) {
      case 'vehicle':
        return 'Véhicule';
      case 'driver':
        return 'Chauffeur';
      default:
        return type;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('fr-FR');
  };

  const getResourceIcon = (type) => {
    return type === 'vehicle' ? TruckIcon : UserIcon;
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des détails de disponibilité...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!availability) {
    return <div className="text-center py-10">Disponibilité non trouvée.</div>;
  }

  const ResourceIcon = getResourceIcon(availability.resource_type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails de Disponibilité</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur la disponibilité de la ressource.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/resource-availability/${availability.id}/edit`)}
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

      {/* Availability Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de Ressource</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                <ResourceIcon className="h-5 w-5 mr-2 text-gray-500" />
                {getResourceTypeName(availability.resource_type)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ID Ressource</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{availability.resource_id}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(availability.status)}`}>
                  {getStatusName(availability.status)}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Début</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDateTime(availability.start_time)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fin</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDateTime(availability.end_time)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{availability.notes || 'Aucune'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ResourceAvailabilityDetail;

