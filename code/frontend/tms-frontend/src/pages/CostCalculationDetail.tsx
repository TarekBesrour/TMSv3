import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CalculatorIcon,
  TruckIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  DocumentTextIcon,
  TagIcon,
  PencilIcon,
  TrashIcon
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
  // Add more fields as needed for detailed calculation breakdown
  details?: {
    base_cost: number;
    surcharges_total: number;
    taxes_total: number;
    // breakdown by segment, etc.
  };
}

const CostCalculationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [costCalculation, setCostCalculation] = useState<CostCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCostCalculation(id);
    }
  }, [id]);

  const fetchCostCalculation = async (calculationId: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, simulate with mock data
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
        {
          id: '3',
          name: 'Calcul Coût Segment Routier',
          type: 'segment',
          total_cost: 85.50,
          currency: 'EUR',
          calculation_date: '2025-06-08',
          status: 'draft',
          notes: 'Coût du segment routier Marseille-Nice',
          details: {
            base_cost: 70.00,
            surcharges_total: 10.50,
            taxes_total: 5.00,
          }
        },
      ];
      const foundCalculation = mockCostCalculations.find(calc => calc.id === calculationId);
      if (foundCalculation) {
        setCostCalculation(foundCalculation);
      } else {
        setError('Calcul de coût non trouvé.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du chargement du calcul de coût');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce calcul de coût ?')) {
      try {
        // In a real app, this would be an API call
        console.log('Deleting cost calculation with ID:', id);
        // Simulate API call success
        setTimeout(() => {
          navigate('/cost-calculations');
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de la suppression du calcul de coût');
      }
    }
  };

  const getCalculationTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'order': 'Commande',
      'shipment': 'Expédition',
      'segment': 'Segment',
    };
    return typeNames[type] || type;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'calculated':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'calculated': 'Calculé',
      'approved': 'Approuvé',
      'draft': 'Brouillon',
    };
    return statusNames[status] || status;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des détails du calcul de coût...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!costCalculation) {
    return <div className="text-center py-10">Calcul de coût non trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails du Calcul de Coût: {costCalculation.name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur le calcul de coût {costCalculation.name}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/cost-calculations/${costCalculation.id}/edit`)}
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

      {/* Cost Calculation Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{costCalculation.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de Calcul</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getCalculationTypeName(costCalculation.type)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Coût Total</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(costCalculation.total_cost, costCalculation.currency)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date de Calcul</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(costCalculation.calculation_date)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(costCalculation.status)}`}>
                  {getStatusName(costCalculation.status)}
                </span>
              </dd>
            </div>
            {costCalculation.notes && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{costCalculation.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      {costCalculation.details && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Détail des Coûts</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Coût de Base</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(costCalculation.details.base_cost, costCalculation.currency)}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Surcharges</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(costCalculation.details.surcharges_total, costCalculation.currency)}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Taxes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(costCalculation.details.taxes_total, costCalculation.currency)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCalculationDetail;


