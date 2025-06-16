import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, MapPinIcon, TruckIcon, UserIcon } from '@heroicons/react/24/outline';

const TourForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState({
    tour_name: '',
    planned_date: '',
    start_time: '',
    end_time: '',
    vehicle_id: '',
    driver_id: '',
    status: 'planned',
    notes: ''
  });
  const [stops, setStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehiclesAndDrivers();
    if (id) {
      fetchTour(id);
    }
  }, [id]);

  const fetchTour = async (tourId) => {
    try {
      const response = await fetch(`/api/tours/${tourId}`);
      const data = await response.json();
      if (data.success) {
        setTour(data.data);
        setStops(data.data.stops || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch tour data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesAndDrivers = async () => {
    try {
      const vehiclesResponse = await fetch('/api/vehicles');
      const vehiclesData = await vehiclesResponse.json();
      if (vehiclesData.success) {
        setVehicles(vehiclesData.data.data);
      }

      const driversResponse = await fetch('/api/drivers');
      const driversData = await driversResponse.json();
      if (driversData.success) {
        setDrivers(driversData.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles or drivers:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTour(prev => ({ ...prev, [name]: value }));
  };

  const handleStopChange = (index, e) => {
    const { name, value } = e.target;
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [name]: value };
    setStops(newStops);
  };

  const addStop = () => {
    setStops(prev => [...prev, { address_id: '', scheduled_time: '', location_type: 'delivery', order_id: '', shipment_id: '' }]);
  };

  const removeStop = (index) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/tours/${id}` : '/api/tours';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tour)
      });
      const data = await response.json();

      if (data.success) {
        // Handle stops separately if creating a new tour
        if (!id) {
          for (const stop of stops) {
            await fetch(`/api/tours/${data.data.id}/stops`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(stop)
            });
          }
        }
        navigate('/tours');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save tour.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center py-10">Chargement de la tournée...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{id ? 'Modifier la Tournée' : 'Créer une Nouvelle Tournée'}</h1>
      <p className="mt-2 text-sm text-gray-700">
        {id ? 'Mettez à jour les informations de la tournée existante.' : 'Remplissez les détails pour créer une nouvelle tournée.'}
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
              <p className="mt-1 text-sm text-gray-500">Détails de base de la tournée.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="tour_name" className="block text-sm font-medium text-gray-700">Nom de la Tournée</label>
                  <input
                    type="text"
                    name="tour_name"
                    id="tour_name"
                    value={tour.tour_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="planned_date" className="block text-sm font-medium text-gray-700">Date Planifiée</label>
                  <input
                    type="date"
                    name="planned_date"
                    id="planned_date"
                    value={tour.planned_date}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Heure de Début (optionnel)</label>
                  <input
                    type="time"
                    name="start_time"
                    id="start_time"
                    value={tour.start_time}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">Heure de Fin (optionnel)</label>
                  <input
                    type="time"
                    name="end_time"
                    id="end_time"
                    value={tour.end_time}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700">Véhicule (optionnel)</label>
                  <select
                    id="vehicle_id"
                    name="vehicle_id"
                    value={tour.vehicle_id}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number} ({vehicle.type})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="driver_id" className="block text-sm font-medium text-gray-700">Chauffeur (optionnel)</label>
                  <select
                    id="driver_id"
                    name="driver_id"
                    value={tour.driver_id}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Sélectionner un chauffeur</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.first_name} {driver.last_name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={tour.notes}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Arrêts de la Tournée</h3>
              <p className="mt-1 text-sm text-gray-500">Définissez les points d'arrêt de cette tournée.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-md relative">
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-900"
                    >
                      &times;
                    </button>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`address_id-${index}`} className="block text-sm font-medium text-gray-700">Adresse ID</label>
                        <input
                          type="number"
                          name="address_id"
                          id={`address_id-${index}`}
                          value={stop.address_id}
                          onChange={(e) => handleStopChange(index, e)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`scheduled_time-${index}`} className="block text-sm font-medium text-gray-700">Heure Planifiée</label>
                        <input
                          type="datetime-local"
                          name="scheduled_time"
                          id={`scheduled_time-${index}`}
                          value={stop.scheduled_time}
                          onChange={(e) => handleStopChange(index, e)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`location_type-${index}`} className="block text-sm font-medium text-gray-700">Type de Lieu</label>
                        <select
                          id={`location_type-${index}`}
                          name="location_type"
                          value={stop.location_type}
                          onChange={(e) => handleStopChange(index, e)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          required
                        >
                          <option value="pickup">Enlèvement</option>
                          <option value="delivery">Livraison</option>
                          <option value="intermediate">Intermédiaire</option>
                        </select>
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`service_duration-${index}`} className="block text-sm font-medium text-gray-700">Durée de Service (min)</label>
                        <input
                          type="number"
                          name="service_duration"
                          id={`service_duration-${index}`}
                          value={stop.service_duration}
                          onChange={(e) => handleStopChange(index, e)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`order_id-${index}`} className="block text-sm font-medium text-gray-700">Commande ID (optionnel)</label>
                        <input
                          type="number"
                          name="order_id"
                          id={`order_id-${index}`}
                          value={stop.order_id}
                          onChange={(e) => handleStopChange(index, e)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor={`shipment_id-${index}`} className="block text-sm font-medium text-gray-700">Expédition ID (optionnel)</label>
                        <input
                          type="number"
                          name="shipment_id"
                          id={`shipment_id-${index}`}
                          value={stop.shipment_id}
                          onChange={(e) => handleStopChange(index, e)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStop}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Ajouter un arrêt
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
                       onClick={() => navigate('/tours')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la Tournée'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourForm;

