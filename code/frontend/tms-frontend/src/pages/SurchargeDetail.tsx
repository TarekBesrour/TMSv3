import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TagIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon
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

const SurchargeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surcharge, setSurcharge] = useState<Surcharge | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette surcharge ?')) {
      try {
        // In a real app, this would be an API call
        console.log('Deleting surcharge with ID:', id);
        // Simulate API call success
        setTimeout(() => {
          navigate('/surcharges');
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de la suppression de la surcharge');
      }
    }
  };

  const getSurchargeTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'fuel': 'Carburant',
      'toll': 'Péage',
      'handling': 'Manutention',
      'security': 'Sécurité',
      'customs': 'Douane',
    };
    return typeNames[type] || type;
  };

  const getCalculationMethodName = (method: string) => {
    const methodNames: Record<string, string> = {
      'percentage': 'Pourcentage',
      'fixed_amount': 'Montant Fixe',
      'per_unit': 'Par Unité',
    };
    return methodNames[method] || method;
  };

  const getAppliesToName = (appliesTo: string) => {
    const appliesToNames: Record<string, string> = {
      'all': 'Tous',
      'road': 'Routier',
      'sea': 'Maritime',
      'air': 'Aérien',
      'rail': 'Ferroviaire',
      'multimodal': 'Multimodal',
    };
    return appliesToNames[appliesTo] || appliesTo;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des détails de la surcharge...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!surcharge) {
    return <div className="text-center py-10">Surcharge non trouvée.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails de la Surcharge: {surcharge.name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur la surcharge {surcharge.name}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/surcharges/${surcharge.id}/edit`)}
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

      {/* Surcharge Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{surcharge.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de Surcharge</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getSurchargeTypeName(surcharge.type)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Méthode de Calcul</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getCalculationMethodName(surcharge.calculation_method)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Valeur</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {surcharge.value} {surcharge.calculation_method === 'percentage' ? '%' : surcharge.currency}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">S'applique à</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getAppliesToName(surcharge.applies_to)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Période de Validité</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(surcharge.valid_from)} au {formatDate(surcharge.valid_to)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{surcharge.notes || 'Aucune'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SurchargeDetail;


