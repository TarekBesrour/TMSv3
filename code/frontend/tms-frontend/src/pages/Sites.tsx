import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSites, Site as ApiSite } from '../services/sitesApi';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BarsArrowUpIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// Types

// Utilise le type ApiSite du service

const Sites: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<ApiSite[]>([]);
  const [filteredSites, setFilteredSites] = useState<ApiSite[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterSiteType, setFilterSiteType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSites();
        setSites(data);
        setFilteredSites(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des sites');
        setLoading(false);
      }
    };
    loadSites();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...sites];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(site => 
        (site.name ?? '').toLowerCase().includes(lowerSearchTerm) ||
        (site.address ?? '').toLowerCase().includes(lowerSearchTerm) ||
        (site.city ?? '').toLowerCase().includes(lowerSearchTerm) ||
        (site.partner_name ?? '').toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply site type filter
    if (filterSiteType !== 'all') {
      result = result.filter(site => site.type === filterSiteType);
    }
    
    // Apply country filter
    if (filterCountry !== 'all') {
      result = result.filter(site => site.country === filterCountry);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name ?? '').localeCompare(b.name ?? '');
      } else if (sortField === 'city') {
        comparison = (a.city ?? '').localeCompare(b.city ?? '');
      } else if (sortField === 'partner_name') {
        comparison = (a.partner_name ?? '').localeCompare(b.partner_name ?? '');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredSites(result);
  }, [sites, searchTerm, filterSiteType, filterCountry, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateSite = () => {
    navigate('/sites/new');
  };
  
  const handleViewSite = (id: number) => {
    navigate(`/sites/${id}`);
  };
  
  const getSiteTypeIcon = (type: string) => {
    switch (type) {
      case 'warehouse':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-500" title="Entrepôt" />;
      case 'distribution_center':
        return <BuildingOfficeIcon className="h-5 w-5 text-green-500" title="Centre de distribution" />;
      case 'port':
        return <MapPinIcon className="h-5 w-5 text-purple-500" title="Port" />;
      case 'hub':
        return <MapPinIcon className="h-5 w-5 text-orange-500" title="Hub" />;
      case 'factory':
        return <BuildingOfficeIcon className="h-5 w-5 text-red-500" title="Usine" />;
      default:
        return <MapPinIcon className="h-5 w-5 text-gray-500" title="Site" />;
    }
  };
  
  const getSiteTypeName = (type: string) => {
    const siteTypeNames: Record<string, string> = {
      'warehouse': 'Entrepôt',
      'distribution_center': 'Centre de distribution',
      'port': 'Port',
      'hub': 'Hub',
      'factory': 'Usine',
      'retail': 'Point de vente',
      'office': 'Bureau',
      'cross_dock': 'Cross-dock'
    };
    
    return siteTypeNames[type] || type;
  };
  
  const getCountryName = (countryCode: string) => {
    const countryNames: Record<string, string> = {
      'FR': 'France',
      'BE': 'Belgique',
      'DE': 'Allemagne',
      'ES': 'Espagne',
      'IT': 'Italie',
      'UK': 'Royaume-Uni',
      'NL': 'Pays-Bas'
    };
    
    return countryNames[countryCode] || countryCode;
  };
  
  // Get unique countries for filter
  const uniqueCountries = Array.from(new Set(sites.map(site => site.country ?? '')));
  
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
            Sites
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateSite}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau site
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
              placeholder="Rechercher un site..."
            />
          </div>
          
          {/* Site type filter */}
          <div>
            <label htmlFor="site-type" className="block text-sm font-medium text-gray-700">
              Type de site
            </label>
            <select
              id="site-type"
              value={filterSiteType}
              onChange={(e) => setFilterSiteType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="warehouse">Entrepôts</option>
              <option value="distribution_center">Centres de distribution</option>
              <option value="port">Ports</option>
              <option value="hub">Hubs</option>
              <option value="factory">Usines</option>
            </select>
          </div>
          
          {/* Country filter */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Pays
            </label>
            <select
              id="country"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>
                  {getCountryName(country ?? '')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Sites table */}
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
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('city')}
                    >
                      <div className="flex items-center">
                        Adresse
                        {sortField === 'city' && (
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('partner_name')}
                    >
                      <div className="flex items-center">
                        Partenaire
                        {sortField === 'partner_name' && (
                          <BarsArrowUpIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun site trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredSites.map((site) => (
                      <tr 
                        key={site.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewSite(site.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{site.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSiteTypeIcon(site.type)}
                            <span className="ml-2 text-sm text-gray-900">
                              {getSiteTypeName(site.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site.address ?? ''}</div>
                          <div className="text-sm text-gray-500">{(site.city ?? '') + (site.country ? ', ' + getCountryName(site.country ?? '') : '')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site.partner_name}</div>
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

export default Sites;
