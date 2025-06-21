import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

// Types
interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  status: string;
  partner_id: number;
  partner_name: string;
}

const Drivers: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterLicenseType, setFilterLicenseType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock drivers data
          const mockDrivers: Driver[] = [
            {
              id: 1,
              first_name: 'Jean',
              last_name: 'Dupont',
              license_number: 'DRV12345678',
              license_type: 'C',
              license_expiry: '2026-05-15',
              status: 'available',
              partner_id: 1,
              partner_name: 'Acme Logistics'
            },
            {
              id: 2,
              first_name: 'Marie',
              last_name: 'Laurent',
              license_number: 'DRV87654321',
              license_type: 'CE',
              license_expiry: '2025-11-30',
              status: 'on_duty',
              partner_id: 1,
              partner_name: 'Acme Logistics'
            },
            {
              id: 3,
              first_name: 'Pierre',
              last_name: 'Martin',
              license_number: 'DRV23456789',
              license_type: 'C',
              license_expiry: '2024-08-22',
              status: 'off_duty',
              partner_id: 2,
              partner_name: 'Fast Freight'
            },
            {
              id: 4,
              first_name: 'Sophie',
              last_name: 'Dubois',
              license_number: 'DRV34567890',
              license_type: 'CE+ADR',
              license_expiry: '2027-03-10',
              status: 'available',
              partner_id: 2,
              partner_name: 'Fast Freight'
            },
            {
              id: 5,
              first_name: 'Thomas',
              last_name: 'Leroy',
              license_number: 'DRV45678901',
              license_type: 'B',
              license_expiry: '2023-12-05',
              status: 'on_leave',
              partner_id: 3,
              partner_name: 'Global Supply'
            }
          ];
          
          setDrivers(mockDrivers);
          setFilteredDrivers(mockDrivers);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des chauffeurs');
        setLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...drivers];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(driver => 
        driver.first_name.toLowerCase().includes(lowerSearchTerm) ||
        driver.last_name.toLowerCase().includes(lowerSearchTerm) ||
        driver.license_number.toLowerCase().includes(lowerSearchTerm) ||
        driver.partner_name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply license type filter
    if (filterLicenseType !== 'all') {
      result = result.filter(driver => driver.license_type.includes(filterLicenseType));
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(driver => driver.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'last_name') {
        comparison = a.last_name.localeCompare(b.last_name);
      } else if (sortField === 'license_number') {
        comparison = a.license_number.localeCompare(b.license_number);
      } else if (sortField === 'license_expiry') {
        comparison = new Date(a.license_expiry).getTime() - new Date(b.license_expiry).getTime();
      } else if (sortField === 'partner_name') {
        comparison = a.partner_name.localeCompare(b.partner_name);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredDrivers(result);
  }, [drivers, searchTerm, filterLicenseType, filterStatus, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateDriver = () => {
    navigate('/drivers/new');
  };
  
  const handleViewDriver = (id: number) => {
    navigate(`/drivers/${id}`);
  };
  
  const getLicenseTypeIcon = (type: string) => {
    if (type.includes('ADR')) {
      return <IdentificationIcon className="h-5 w-5 text-red-500" title="Licence ADR" />;
    } else if (type.includes('CE')) {
      return <IdentificationIcon className="h-5 w-5 text-blue-500" title="Licence CE" />;
    } else if (type.includes('C')) {
      return <IdentificationIcon className="h-5 w-5 text-green-500" title="Licence C" />;
    } else {
      return <IdentificationIcon className="h-5 w-5 text-gray-500" title="Licence" />;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'on_duty':
        return 'bg-blue-100 text-blue-800';
      case 'off_duty':
        return 'bg-gray-100 text-gray-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'available': 'Disponible',
      'on_duty': 'En service',
      'off_duty': 'Hors service',
      'on_leave': 'En congé',
      'training': 'En formation'
    };
    
    return statusNames[status] || status;
  };
  
  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    return expiry <= threeMonthsFromNow && expiry >= today;
  };
  
  const isLicenseExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    
    return expiry < today;
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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
            Chauffeurs
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateDriver}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau chauffeur
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
              placeholder="Rechercher un chauffeur..."
            />
          </div>
          
          {/* License type filter */}
          <div>
            <label htmlFor="license-type" className="block text-sm font-medium text-gray-700">
              Type de permis
            </label>
            <select
              id="license-type"
              value={filterLicenseType}
              onChange={(e) => setFilterLicenseType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="B">Permis B</option>
              <option value="C">Permis C</option>
              <option value="CE">Permis CE</option>
              <option value="ADR">ADR</option>
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
              <option value="available">Disponible</option>
              <option value="on_duty">En service</option>
              <option value="off_duty">Hors service</option>
              <option value="on_leave">En congé</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Drivers table */}
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
                      onClick={() => handleSort('last_name')}
                    >
                      <div className="flex items-center">
                        Nom
                        {sortField === 'last_name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('license_number')}
                    >
                      <div className="flex items-center">
                        Permis
                        {sortField === 'license_number' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('license_expiry')}
                    >
                      <div className="flex items-center">
                        Expiration
                        {sortField === 'license_expiry' && (
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun chauffeur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <tr 
                        key={driver.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewDriver(driver.id)}
                      >
                                                <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{driver.last_name} {driver.first_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getLicenseTypeIcon(driver.license_type)}
                            <div className="ml-2">
                              <div className="text-sm text-gray-900">{driver.license_type}</div>
                              <div className="text-sm text-gray-500">{driver.license_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${
                            isLicenseExpired(driver.license_expiry) 
                              ? 'text-red-600' 
                              : isLicenseExpiringSoon(driver.license_expiry) 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            <CalendarIcon className="h-5 w-5 mr-1" />
                            <span className="text-sm">
                              {formatDate(driver.license_expiry)}
                              {isLicenseExpired(driver.license_expiry) && (
                                <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                  Expiré
                                </span>
                              )}
                              {isLicenseExpiringSoon(driver.license_expiry) && !isLicenseExpired(driver.license_expiry) && (
                                <span className="ml-2 text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  Bientôt expiré
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(driver.status)}`}>
                            {getStatusName(driver.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{driver.partner_name}</div>
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

export default Drivers;
