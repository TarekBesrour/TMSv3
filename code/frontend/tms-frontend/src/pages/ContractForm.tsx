import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  //ExclamationIcon,
  TagIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Types
interface Contract {
  id: string;
  reference: string;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  partner_id: string;
  partner_name: string;
  value: number;
  currency: string;
  notes?: string;
}

const ContractForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract>({
    id: '',
    reference: '',
    title: '',
    type: 'transport',
    start_date: '',
    end_date: '',
    status: 'draft',
    partner_id: '',
    partner_name: '',
    value: 0,
    currency: 'EUR',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchContract(id);
    }
  }, [id]);

  const fetchContract = async (contractId: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, simulate with mock data
      const mockContracts: Contract[] = [
        {
          id: '1',
          reference: 'CTR-2025-001',
          title: 'Contrat de transport routier national',
          type: 'transport',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          status: 'active',
          partner_id: '101',
          partner_name: 'Acme Logistics',
          value: 250000,
          currency: 'EUR'
        },
        {
          id: '2',
          reference: 'CTR-2025-002',
          title: 'Contrat de transport multimodal international',
          type: 'multimodal',
          start_date: '2025-02-15',
          end_date: '2026-02-14',
          status: 'active',
          partner_id: '102',
          partner_name: 'Fast Freight',
          value: 500000,
          currency: 'EUR'
        },
      ];
      const foundContract = mockContracts.find(c => c.id === contractId);
      if (foundContract) {
        setContract(foundContract);
      } else {
        setError('Contrat non trouvé.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du chargement du contrat');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContract(prev => ({
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
      console.log('Saving contract:', contract);
      // Simulate API call success
      setTimeout(() => {
        setLoading(false);
        navigate('/contracts');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement du contrat');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Chargement du contrat...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">{id ? 'Modifier le Contrat' : 'Créer un Nouveau Contrat'}</h1>
      <p className="mt-2 text-sm text-gray-700">
        {id ? 'Mettez à jour les informations du contrat existant.' : 'Remplissez les détails pour créer un nouveau contrat.'}
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
              <p className="mt-1 text-sm text-gray-500">Détails de base du contrat.</p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700">Référence</label>
                  <input
                    type="text"
                    name="reference"
                    id="reference"
                    value={contract.reference}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={contract.title}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de Contrat</label>
                  <select
                    id="type"
                    name="type"
                    value={contract.type}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="transport">Transport routier</option>
                    <option value="multimodal">Transport multimodal</option>
                    <option value="rental">Location</option>
                    <option value="sea_freight">Transport maritime</option>
                    <option value="air_freight">Transport aérien</option>
                    <option value="rail_freight">Transport ferroviaire</option>
                    <option value="logistics">Services logistiques</option>
                    <option value="warehousing">Entreposage</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Date de Début</label>
                  <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    value={contract.start_date}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Date de Fin</label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    value={contract.end_date}
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
                    value={contract.status}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="draft">Brouillon</option>
                    <option value="pending">En attente</option>
                    <option value="active">Actif</option>
                    <option value="expired">Expiré</option>
                    <option value="terminated">Résilié</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="partner_id" className="block text-sm font-medium text-gray-700">ID Partenaire</label>
                  <input
                    type="text"
                    name="partner_id"
                    id="partner_id"
                    value={contract.partner_id}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="partner_name" className="block text-sm font-medium text-gray-700">Nom Partenaire</label>
                  <input
                    type="text"
                    name="partner_name"
                    id="partner_name"
                    value={contract.partner_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valeur du Contrat</label>
                  <input
                    type="number"
                    name="value"
                    id="value"
                    value={contract.value}
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
                    value={contract.currency}
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
                    value={contract.notes}
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
            onClick={() => navigate('/contracts')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le Contrat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;


