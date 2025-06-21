import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CalculatorIcon,
  TruckIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  DocumentTextIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// Types
interface CostCalculation {
  id: string;
  name: string;
  type: string; // e.g., 'order', 'shipment', 'segment'
  total_cost: number;
  currency: string;
  calculation_date: string;
  status: string; // e.g., 'draft', 'calculated', 'approved'
  notes?: string;
  details?: {
    base_cost?: number;
    surcharges_total?: number;
    taxes_total?: number;
  };
}

const CostCalculationForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<CostCalculation>>({
    name: '',
    type: 'order',
    total_cost: 0,
    currency: 'EUR',
    calculation_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    details: {
      base_cost: 0,
      surcharges_total: 0,
      taxes_total: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCostCalculation(id);
    }
  }, [id]);

  const fetchCostCalculation = async (calculationId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockCostCalculations: CostCalculation[] = [
        {
          id: '1',
          name: 'Calcul Coût Commande #123',
          type: 'order',
          total_cost: 150.75,
          currency: 'EUR',
          calculation_date: '2025-06-10',
          status: 'calculated',
          notes: 'Coût estimé pour la commande de Paris à Lyon',
          details: {
            base_cost: 120.00,
            surcharges_total: 15.75,
            taxes_total: 15.00,
          }
        },
        {
          id: '2',
          name: 'Calcul Coût Expédition #456',
          type: 'shipment',
          total_cost: 320.00,
          currency: 'EUR',
          calculation_date: '2025-06-09',
          status: 'approved',
          notes: 'Coût final pour l\'expédition internationale',
          details: {
            base_cost: 250.00,
            surcharges_total: 40.00,
            taxes_total: 30.00,
          }
        },
      ];
      const foundCalculation = mockCostCalculations.find(calc => calc.id === calculationId);
      if (foundCalculation) {
        setFormData(foundCalculation);
      } else {
        setError('Calcul de coût non trouvé.');
      }
      setLoading(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      console.log('Submitting data:', formData);
      setTimeout(() => {
        alert(`Calcul de coût ${id ? 'mis à jour' : 'créé'} avec succès!`);
        navigate('/cost-calculations');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la soumission du formulaire.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center py-10">Chargement du calcul de coût...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {id ? 'Modifier le Calcul de Coût' : 'Nouveau Calcul de Coût'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Informations Générales</h3>
              <p className="mt-1 text-sm text-gray-600">Détails de base du calcul de coût.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom du Calcul
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type de Calcul
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type || 'order'}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="order">Commande</option>
                    <option value="shipment">Expédition</option>
                    <option value="segment">Segment</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="total_cost" className="block text-sm font-medium text-gray-700">
                    Coût Total
                  </label>
                  <input
                    type="number"
                    name="total_cost"
                    id="total_cost"
                    value={formData.total_cost || 0}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Devise
                  </label>
                  <input
                    type="text"
                    name="currency"
                    id="currency"
                    value={formData.currency || 'EUR'}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="calculation_date" className="block text-sm font-medium text-gray-700">
                    Date de Calcul
                  </label>
                  <input
                    type="date"
                    name="calculation_date"
                    id="calculation_date"
                    value={formData.calculation_date || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="calculated">Calculé</option>
                    <option value="approved">Approuvé</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes || ''}
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
              <h3 className="text-lg font-medium leading-6 text-gray-900">Détail des Coûts</h3>
              <p className="mt-1 text-sm text-gray-600">Ventilation des coûts (optionnel).</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="base_cost" className="block text-sm font-medium text-gray-700">
                    Coût de Base
                  </label>
                  <input
                    type="number"
                    name="base_cost"
                    id="base_cost"
                    value={formData.details?.base_cost || 0}
                    onChange={handleDetailChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="surcharges_total" className="block text-sm font-medium text-gray-700">
                    Total Surcharges
                  </label>
                  <input
                    type="number"
                    name="surcharges_total"
                    id="surcharges_total"
                    value={formData.details?.surcharges_total || 0}
                    onChange={handleDetailChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="taxes_total" className="block text-sm font-medium text-gray-700">
                    Total Taxes
                  </label>
                  <input
                    type="number"
                    name="taxes_total"
                    id="taxes_total"
                    value={formData.details?.taxes_total || 0}
                    onChange={handleDetailChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/cost-calculations')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : (id ? 'Mettre à jour' : 'Créer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CostCalculationForm;


