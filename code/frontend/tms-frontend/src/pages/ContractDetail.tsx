import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  PencilIcon,
  TrashIcon,
  TagIcon
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

const ContractDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      try {
        // In a real app, this would be an API call
        console.log('Deleting contract with ID:', id);
        // Simulate API call success
        setTimeout(() => {
          navigate('/contracts');
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de la suppression du contrat');
      }
    }
  };

  const getContractTypeName = (type: string) => {
    const contractTypeNames: Record<string, string> = {
      'transport': 'Transport routier',
      'multimodal': 'Transport multimodal',
      'rental': 'Location',
      'sea_freight': 'Transport maritime',
      'air_freight': 'Transport aérien',
      'rail_freight': 'Transport ferroviaire',
      'logistics': 'Services logistiques',
      'warehousing': 'Entreposage'
    };
    return contractTypeNames[type] || type;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'active': 'Actif',
      'draft': 'Brouillon',
      'expired': 'Expiré',
      'pending': 'En attente',
      'terminated': 'Résilié'
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
    return <div className="text-center py-10">Chargement des détails du contrat...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!contract) {
    return <div className="text-center py-10">Contrat non trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails du Contrat: {contract.title}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur le contrat {contract.reference}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/contracts/${contract.id}/edit`)}
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

      {/* Contract Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Référence</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contract.reference}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Titre</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contract.title}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de Contrat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getContractTypeName(contract.type)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Période de Validité</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(contract.start_date)} au {formatDate(contract.end_date)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contract.status)}`}>
                  {getStatusName(contract.status)}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Partenaire</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contract.partner_name} (ID: {contract.partner_id})</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Valeur du Contrat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(contract.value, contract.currency)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contract.notes || 'Aucune'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;


