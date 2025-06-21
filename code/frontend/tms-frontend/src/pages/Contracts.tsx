import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  //DocumentDownloadIcon,
  CalendarIcon,
  ExclamationCircleIcon
  //ClockIcon
} from '@heroicons/react/24/outline';

// Types
interface Contract {
  id: number;
  reference: string;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  partner_id: number;
  partner_name: string;
  value: number;
  currency: string;
}

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterContractType, setFilterContractType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock contracts data
          const mockContracts: Contract[] = [
            {
              id: 1,
              reference: 'CTR-2025-001',
              title: 'Contrat de transport routier national',
              type: 'transport',
              start_date: '2025-01-01',
              end_date: '2025-12-31',
              status: 'active',
              partner_id: 1,
              partner_name: 'Acme Logistics',
              value: 250000,
              currency: 'EUR'
            },
            {
              id: 2,
              reference: 'CTR-2025-002',
              title: 'Contrat de transport multimodal international',
              type: 'multimodal',
              start_date: '2025-02-15',
              end_date: '2026-02-14',
              status: 'active',
              partner_id: 2,
              partner_name: 'Fast Freight',
              value: 500000,
              currency: 'EUR'
            },
            {
              id: 3,
              reference: 'CTR-2024-015',
              title: 'Contrat de location de véhicules',
              type: 'rental',
              start_date: '2024-06-01',
              end_date: '2025-05-31',
              status: 'active',
              partner_id: 3,
              partner_name: 'Global Supply',
              value: 120000,
              currency: 'EUR'
            },
            {
              id: 4,
              reference: 'CTR-2023-008',
              title: 'Contrat de transport maritime',
              type: 'sea_freight',
              start_date: '2023-10-01',
              end_date: '2024-09-30',
              status: 'expired',
              partner_id: 4,
              partner_name: 'Ocean Shipping',
              value: 350000,
              currency: 'USD'
            },
            {
              id: 5,
              reference: 'CTR-2025-010',
              title: 'Contrat de services logistiques',
              type: 'logistics',
              start_date: '2025-04-01',
              end_date: '2027-03-31',
              status: 'draft',
              partner_id: 5,
              partner_name: 'Logistics Solutions',
              value: 750000,
              currency: 'EUR'
            }
          ];
          
          setContracts(mockContracts);
          setFilteredContracts(mockContracts);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des contrats');
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...contracts];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(contract => 
        contract.reference.toLowerCase().includes(lowerSearchTerm) ||
        contract.title.toLowerCase().includes(lowerSearchTerm) ||
        contract.partner_name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply contract type filter
    if (filterContractType !== 'all') {
      result = result.filter(contract => contract.type === filterContractType);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(contract => contract.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'reference') {
        comparison = a.reference.localeCompare(b.reference);
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'start_date') {
        comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      } else if (sortField === 'end_date') {
        comparison = new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      } else if (sortField === 'partner_name') {
        comparison = a.partner_name.localeCompare(b.partner_name);
      } else if (sortField === 'value') {
        comparison = a.value - b.value;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredContracts(result);
  }, [contracts, searchTerm, filterContractType, filterStatus, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateContract = () => {
    navigate('/contracts/new');
  };
  
  const handleViewContract = (id: number) => {
    navigate(`/contracts/${id}`);
  };
  
  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" title="Transport" />;
      case 'multimodal':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" title="Multimodal" />;
      case 'rental':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" title="Location" />;
      case 'sea_freight':
        return <DocumentTextIcon className="h-5 w-5 text-cyan-500" title="Transport maritime" />;
      case 'logistics':
        return <DocumentTextIcon className="h-5 w-5 text-orange-500" title="Logistique" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" title="Contrat" />;
    }
  };
  
  const getContractTypeName = (type: string) => {
    const contractTypeNames: Record<string, string> = {
      'transport': 'Transport routier',
      'multimodal': 'Transport multimodal',
      'rental': 'Location',
      'sea_freight': 'Transport maritime',
      'logistics': 'Services logistiques',
      'air_freight': 'Transport aérien',
      'rail_freight': 'Transport ferroviaire',
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
  
  const isContractExpiringSoon = (endDate: string) => {
    const expiry = new Date(endDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    return expiry <= threeMonthsFromNow && expiry >= today;
  };
  
  const isContractExpired = (endDate: string) => {
    const expiry = new Date(endDate);
    const today = new Date();
    
    return expiry < today;
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Contrats
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateContract}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau contrat
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and search */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher un contrat..."
            />
          </div>
          
          {/* Contract type filter */}
          <div>
            <label htmlFor="contract-type" className="block text-sm font-medium text-gray-700">
              Type de contrat
            </label>
            <select
              id="contract-type"
              value={filterContractType}
              onChange={(e) => setFilterContractType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="transport">Transport routier</option>
              <option value="multimodal">Transport multimodal</option>
              <option value="sea_freight">Transport maritime</option>
              <option value="air_freight">Transport aérien</option>
              <option value="rail_freight">Transport ferroviaire</option>
              <option value="rental">Location</option>
              <option value="logistics">Services logistiques</option>
            </select>
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="draft">Brouillon</option>
              <option value="expired">Expiré</option>
              <option value="pending">En attente</option>
              <option value="terminated">Résilié</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Contracts table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('reference')}
                    >
                      <div className="flex items-center">
                        Référence
                        {sortField === 'reference' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Titre
                        {sortField === 'title' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('end_date')}
                    >
                      <div className="flex items-center">
                        Période
                        {sortField === 'end_date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('partner_name')}
                    >
                      <div className="flex items-center">
                        Partenaire
                        {sortField === 'partner_name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center">
                        Valeur
                        {sortField === 'value' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun contrat trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((contract) => (
                      <tr 
                        key={contract.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewContract(contract.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getContractTypeIcon(contract.type)}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{contract.reference}</div>
                              <div className="text-sm text-gray-500">{getContractTypeName(contract.type)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{contract.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${
                            isContractExpired(contract.end_date) 
                              ? 'text-red-600' 
                              : isContractExpiringSoon(contract.end_date) 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            <CalendarIcon className="h-5 w-5 mr-1" />
                            <div>
                              <div className="text-sm">
                                {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                              </div>
                              {isContractExpired(contract.end_date) && (
                                <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                  Expiré
                                </span>
                              )}
                              {isContractExpiringSoon(contract.end_date) && !isContractExpired(contract.end_date) && (
                                <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  Expire bientôt
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contract.status)}`}>
                            {getStatusName(contract.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contract.partner_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(contract.value, contract.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
