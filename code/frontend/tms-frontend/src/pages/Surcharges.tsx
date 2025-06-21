import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ExclamationCircleIcon,
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

const Surcharges: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surcharges, setSurcharges] = useState<Surcharge[]>([]);
  const [filteredSurcharges, setFilteredSurcharges] = useState<Surcharge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAppliesTo, setFilterAppliesTo] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchSurcharges = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
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
            {
              id: '3',
              name: 'Surcharge Manutention Portuaire',
              type: 'handling',
              calculation_method: 'per_unit',
              value: 2.5,
              currency: 'USD',
              applies_to: 'sea',
              valid_from: '2024-06-01',
              valid_to: '2025-05-31',
              notes: 'Frais de manutention par conteneur'
            },
            {
              id: '4',
              name: 'Surcharge Sécurité Aérienne',
              type: 'security',
              calculation_method: 'fixed_amount',
              value: 50,
              currency: 'EUR',
              applies_to: 'air',
              valid_from: '2024-01-01',
              valid_to: '2024-12-31',
              notes: 'Frais de sécurité aéroportuaire'
            },
          ];

          setSurcharges(mockSurcharges);
          setFilteredSurcharges(mockSurcharges);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des surcharges');
        setLoading(false);
      }
    };

    fetchSurcharges();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...surcharges];

    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(surcharge =>
        surcharge.name.toLowerCase().includes(lowerSearchTerm) ||
        surcharge.type.toLowerCase().includes(lowerSearchTerm) ||
        surcharge.notes?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(surcharge => surcharge.type === filterType);
    }

    // Apply applies_to filter
    if (filterAppliesTo !== 'all') {
      result = result.filter(surcharge => surcharge.applies_to === filterAppliesTo);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'value') {
        comparison = a.value - b.value;
      } else if (sortField === 'valid_from') {
        comparison = new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredSurcharges(result);
  }, [surcharges, searchTerm, filterType, filterAppliesTo, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateSurcharge = () => {
    navigate('/surcharges/new');
  };

  const handleViewSurcharge = (id: string) => {
    navigate(`/surcharges/${id}`);
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
            Surcharges
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateSurcharge}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle surcharge
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
              placeholder="Rechercher une surcharge..."
            />
          </div>

          {/* Surcharge type filter */}
          <div>
            <label htmlFor="surcharge-type" className="block text-sm font-medium text-gray-700">
              Type de surcharge
            </label>
            <select
              id="surcharge-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="fuel">Carburant</option>
              <option value="toll">Péage</option>
              <option value="handling">Manutention</option>
              <option value="security">Sécurité</option>
              <option value="customs">Douane</option>
            </select>
          </div>

          {/* Applies to filter */}
          <div>
            <label htmlFor="applies-to" className="block text-sm font-medium text-gray-700">
              S'applique à
            </label>
            <select
              id="applies-to"
              value={filterAppliesTo}
              onChange={(e) => setFilterAppliesTo(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="road">Routier</option>
              <option value="sea">Maritime</option>
              <option value="air">Aérien</option>
              <option value="rail">Ferroviaire</option>
              <option value="multimodal">Multimodal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Surcharges table */}
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
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nom
                        {sortField === 'name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        Type
                        {sortField === 'type' && (
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('applies_to')}
                    >
                      <div className="flex items-center">
                        S'applique à
                        {sortField === 'applies_to' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('valid_from')}
                    >
                      <div className="flex items-center">
                        Période de validité
                        {sortField === 'valid_from' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSurcharges.map((surcharge) => (
                    <tr key={surcharge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TagIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{surcharge.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getSurchargeTypeName(surcharge.type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{surcharge.value} {surcharge.calculation_method === 'percentage' ? '%' : surcharge.currency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getAppliesToName(surcharge.applies_to)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(surcharge.valid_from)} - {formatDate(surcharge.valid_to)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                                                  onClick={() => handleViewSurcharge(surcharge.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/surcharges/${surcharge.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => console.log('Delete surcharge', surcharge.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Surcharges;


