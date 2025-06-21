import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TagIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Types
interface Surcharge {
  id: string;
  name: string;
  type: string; // e.g., 'fuel', 'toll', 'handling'
  calculation_method: string; // e.g., 'percentage', 'fixed_amount', 'per_unit'
  value: number;
  currency: string;
  applies_to: string; // e.g., 'all', 'road', 'sea', 'air'
  valid_from: string;
  valid_to: string;
  notes?: string;
}

const SurchargeForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surcharge, setSurcharge] = useState<Surcharge>({
    id: '',
    name: '',
    type: 'fuel',
    calculation_method: 'percentage',
    value: 0,
    currency: 'EUR',
    applies_to: 'all',
    valid_from: '',
    valid_to: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchSurcharge(id);
    }
  }, [id]);

  const fetchSurcharge = async (surchargeId: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, simulate with mock data
      const mockSurcharges: Surcharge[] = [
        {
          id: '1',
          name: 'Surcharge Carburant',
          type: 'fuel',
          calculation_method: 'percentage',
          value: 15,
          currency: 'EUR',
          applies_to: 'road',
          valid_from: '2024-01-01',
          valid_to: '2024-12-31',
          notes: 'Surcharge basée sur le prix du carburant'
        },
        {
          id: '2',
          name: 'Surcharge Péage A1',
          type: 'toll',
          calculation_method: 'fixed_amount',
          value: 10,
          currency: 'EUR',
          applies_to: 'road',
          valid_from: '2024-03-01',
          valid_to: '2025-02-28',
          notes: 'Péage pour l\'autoroute A1'
        },
      ];
      const foundSurcharge = mockSurcharges.find(s => s.id === surchargeId);
      if (foundSurcharge) {
        setSurcharge(foundSurcharge);
      } else {
        setError('Surcharge non trouvée.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du chargement de la surcharge');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSurcharge(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // In a real app, this would be an API call (POST for new, PUT for update)
      console.log('Saving surcharge:', surcharge);
      // Simulate API call success
      setTimeout(() => {
        setLoading(false);
        navigate('/surcharges');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement de la surcharge');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Chargement de la surcharge...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{id ? 'Modifier la Surcharge' : 'Créer une Nouvelle Surcharge'}</h1>
      <p className="mt-2 text-sm text-gray-700">
        {id ? 'Mettez à jour les informations de la surcharge existante.' : 'Remplissez les détails pour créer une nouvelle surcharge.'}
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
              <p className="mt-1 text-sm text-gray-500">Détails de base de la surcharge.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={surcharge.name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de Surcharge</label>
                  <select
                    id="type"
                    name="type"
                    value={surcharge.type}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="fuel">Carburant</option>
                    <option value="toll">Péage</option>
                    <option value="handling">Manutention</option>
                    <option value="security">Sécurité</option>
                    <option value="customs">Douane</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="calculation_method" className="block text-sm font-medium text-gray-700">Méthode de Calcul</label>
                  <select
                    id="calculation_method"
                    name="calculation_method"
                    value={surcharge.calculation_method}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed_amount">Montant Fixe</option>
                    <option value="per_unit">Par Unité</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valeur</label>
                  <input
                    type="number"
                    name="value"
                    id="value"
                    value={surcharge.value}
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
                    value={surcharge.currency}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="applies_to" className="block text-sm font-medium text-gray-700">S'applique à</label>
                  <select
                    id="applies_to"
                    name="applies_to"
                    value={surcharge.applies_to}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="all">Tous</option>
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
                    value={surcharge.valid_from}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="valid_to" className="block text-sm font-medium text-gray-700">Valide jusqu'au</label>
                  <input
                    type="date"
                    name="valid_to"
                    id="valid_to"
                    value={surcharge.valid_to}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={surcharge.notes}
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
            onClick={() => navigate('/surcharges')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la Surcharge'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurchargeForm;


