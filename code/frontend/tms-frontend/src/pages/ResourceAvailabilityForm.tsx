import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon, TruckIcon } from '@heroicons/react/24/outline';
import { ResourceAvailability, ResourceType, ResourceAvailabilityStatus, Vehicle, Driver } from '../types/resourceAvailability';

const ResourceAvailabilityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<ResourceAvailability>({
    id: '',
    resource_type: '' as ResourceType,
    resource_id: '',
    start_time: '',
    end_time: '',
    status: 'available',
    notes: ''
  });
  const [resources, setResources] = useState<(Vehicle | Driver)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAvailability(id);
    }
    // Fetch resources based on selected type or initially all
    fetchResources(availability.resource_type);
  }, [id, availability.resource_type]);

  const fetchAvailability = async (availabilityId: string) => {
    try {
      const response = await fetch(`/api/availabilities/${availabilityId}`);
      const data = await response.json();
      if (data.success) {
        setAvailability(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch availability data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (type: ResourceType) => {
    if (!type) return;
    try {
      const url = type === 'vehicle' ? '/api/vehicles' : '/api/drivers';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setResources(data.data.data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}s:`, err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAvailability(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/availabilities/${id}` : '/api/availabilities';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability)
      });
      const data = await response.json();

      if (data.success) {
        navigate('/resource-availability');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save availability.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center py-10">Chargement de la disponibilité...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{id ? 'Modifier la Disponibilité' : 'Créer une Nouvelle Disponibilité'}</h1>
      <p className="mt-2 text-sm text-gray-700">
        {id ? 'Mettez à jour les informations de disponibilité existantes.' : 'Remplissez les détails pour créer une nouvelle entrée de disponibilité.'}
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Informations Générales</h3>
              <p className="mt-1 text-sm text-gray-500">Détails de base de la disponibilité de la ressource.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="resource_type" className="block text-sm font-medium text-gray-700">Type de Ressource</label>
                  <select
                    id="resource_type"
                    name="resource_type"
                    value={availability.resource_type}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="vehicle">Véhicule</option>
                    <option value="driver">Chauffeur</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="resource_id" className="block text-sm font-medium text-gray-700">Ressource</label>
                  <select
                    id="resource_id"
                    name="resource_id"
                    value={availability.resource_id}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                    disabled={!availability.resource_type}
                  >
                    <option value="">Sélectionner une ressource</option>
                    {resources.map(res => (
                      <option key={res.id} value={res.id}>
                        {availability.resource_type === 'vehicle' && 'registration_number' in res
                          ? res.registration_number
                          : 'first_name' in res && 'last_name' in res
                            ? `${res.first_name} ${res.last_name}`
                            : res.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Heure de Début</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    id="start_time"
                    value={availability.start_time}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">Heure de Fin</label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    id="end_time"
                    value={availability.end_time}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    id="status"
                    name="status"
                    value={availability.status}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="available">Disponible</option>
                    <option value="unavailable">Indisponible</option>
                    <option value="booked">Réservé</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={availability.notes}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/resource-availability')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la Disponibilité'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceAvailabilityForm;

