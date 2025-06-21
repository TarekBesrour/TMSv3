import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CurrencyEuroIcon,
  TagIcon,
  TruckIcon,
  CubeIcon,
  ScaleIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const RateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rate, setRate] = useState({
    rate_name: '',
    rate_type: 'per_kg',
    base_rate: 0,
    currency: 'EUR',
    min_weight: 0,
    max_weight: 0,
    min_volume: 0,
    max_volume: 0,
    min_distance: 0,
    max_distance: 0,
    origin_country: '',
    destination_country: '',
    mode_of_transport: 'road',
    valid_from: '',
    valid_to: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRate(id);
    }
  }, [id]);

  const fetchRate = async (rateId : string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rates/${rateId}`);
      const data = await response.json();
      if (data.success) {
        setRate(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch rate data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

//   const handleChange = (e) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  //const handleSubmit = async (e) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/rates/${id}` : '/api/rates';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rate)
      });
      const data = await response.json();

      if (data.success) {
        navigate('/rates');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save rate.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{id ? 'Modifier le Tarif' : 'Créer un Nouveau Tarif'}</h1>
      <p className="mt-2 text-sm text-gray-700">
        {id ? 'Mettez à jour les informations du tarif existant.' : 'Remplissez les détails pour créer un nouveau tarif.'}
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
              <p className="mt-1 text-sm text-gray-500">Détails de base du tarif.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="rate_name" className="block text-sm font-medium text-gray-700">Nom du Tarif</label>
                  <input
                    type="text"
                    name="rate_name"
                    id="rate_name"
                    value={rate.rate_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="rate_type" className="block text-sm font-medium text-gray-700">Type de Tarif</label>
                  <select
                    id="rate_type"
                    name="rate_type"
                    value={rate.rate_type}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="per_kg">Par Kilogramme</option>
                    <option value="per_volume">Par Volume (m³)</option>
                    <option value="per_distance">Par Distance (km)</option>
                    <option value="flat_rate">Forfait</option>
                    <option value="per_pallet">Par Palette</option>
                    <option value="per_container">Par Conteneur</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="base_rate" className="block text-sm font-medium text-gray-700">Tarif de Base</label>
                  <input
                    type="number"
                    name="base_rate"
                    id="base_rate"
                    value={rate.base_rate}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Devise</label>
                  <input
                    type="text"
                    name="currency"
                    id="currency"
                    value={rate.currency}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="min_weight" className="block text-sm font-medium text-gray-700">Poids Min (kg)</label>
                  <input
                    type="number"
                    name="min_weight"
                    id="min_weight"
                    value={rate.min_weight}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="max_weight" className="block text-sm font-medium text-gray-700">Poids Max (kg)</label>
                  <input
                    type="number"
                    name="max_weight"
                    id="max_weight"
                    value={rate.max_weight}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="min_volume" className="block text-sm font-medium text-gray-700">Volume Min (m³)</label>
                  <input
                    type="number"
                    name="min_volume"
                    id="min_volume"
                    value={rate.min_volume}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="max_volume" className="block text-sm font-medium text-gray-700">Volume Max (m³)</label>
                  <input
                    type="number"
                    name="max_volume"
                    id="max_volume"
                    value={rate.max_volume}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="min_distance" className="block text-sm font-medium text-gray-700">Distance Min (km)</label>
                  <input
                    type="number"
                    name="min_distance"
                    id="min_distance"
                    value={rate.min_distance}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="max_distance" className="block text-sm font-medium text-gray-700">Distance Max (km)</label>
                  <input
                    type="number"
                    name="max_distance"
                    id="max_distance"
                    value={rate.max_distance}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="origin_country" className="block text-sm font-medium text-gray-700">Pays d'Origine</label>
                  <input
                    type="text"
                    name="origin_country"
                    id="origin_country"
                    value={rate.origin_country}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="destination_country" className="block text-sm font-medium text-gray-700">Pays de Destination</label>
                  <input
                    type="text"
                    name="destination_country"
                    id="destination_country"
                    value={rate.destination_country}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="mode_of_transport" className="block text-sm font-medium text-gray-700">Mode de Transport</label>
                  <select
                    id="mode_of_transport"
                    name="mode_of_transport"
                    value={rate.mode_of_transport}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="road">Routier</option>
                    <option value="sea">Maritime</option>
                    <option value="air">Aérien</option>
                    <option value="rail">Ferroviaire</option>
                    <option value="multimodal">Multimodal</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700">Valide à partir du</label>
                  <input
                    type="date"
                    name="valid_from"
                    id="valid_from"
                    value={rate.valid_from}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="valid_to" className="block text-sm font-medium text-gray-700">Valide jusqu'au</label>
                  <input
                    type="date"
                    name="valid_to"
                    id="valid_to"
                    value={rate.valid_to}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={rate.notes}
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
            onClick={() => navigate('/rates')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le Tarif'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RateForm;


