import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  TruckIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationIcon
} from '@heroicons/react/outline';

// Types
interface Vehicle {
  id: number;
  registration_number: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  capacity: string;
  status: string;
  partner_id: number;
  partner_name: string;
}

const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterVehicleType, setFilterVehicleType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('registration_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock vehicles data
          const mockVehicles: Vehicle[] = [
            {
              id: 1,
              registration_number: 'AB-123-CD',
              type: 'truck',
              brand: 'Volvo',
              model: 'FH16',
              year: 2022,
              capacity: '24 tonnes',
              status: 'available',
              partner_id: 1,
              partner_name: 'Acme Logistics'
            },
            {
              id: 2,
              registration_number: 'EF-456-GH',
              type: 'van',
              brand: 'Mercedes',
              model: 'Sprinter',
              year: 2021,
              capacity: '3.5 tonnes',
              status: 'in_transit',
              partner_id: 1,
              partner_name: 'Acme Logistics'
            },
            {
              id: 3,
              registration_number: 'IJ-789-KL',
              type: 'truck',
              brand: 'Scania',
              model: 'R450',
              year: 2020,
              capacity: '20 tonnes',
              status: 'maintenance',
              partner_id: 2,
              partner_name: 'Fast Freight'
            },
            {
              id: 4,
              registration_number: 'MN-012-OP',
              type: 'trailer',
              brand: 'Schmitz',
              model: 'Cargobull',
              year: 2019,
              capacity: '28 tonnes',
              status: 'available',
              partner_id: 2,
              partner_name: 'Fast Freight'
            },
            {
              id: 5,
              registration_number: 'QR-345-ST',
              type: 'container_chassis',
              brand: 'Krone',
              model: 'Box Liner',
              year: 2021,
              capacity: '40ft',
              status: 'available',
              partner_id: 3,
              partner_name: 'Global Supply'
            }
          ];
          
          setVehicles(mockVehicles);
          setFilteredVehicles(mockVehicles);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des véhicules');
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...vehicles];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(vehicle => 
        vehicle.registration_number.toLowerCase().includes(lowerSearchTerm) ||
        vehicle.brand.toLowerCase().includes(lowerSearchTerm) ||
        vehicle.model.toLowerCase().includes(lowerSearchTerm) ||
        vehicle.partner_name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply vehicle type filter
    if (filterVehicleType !== 'all') {
      result = result.filter(vehicle => vehicle.type === filterVehicleType);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(vehicle => vehicle.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'registration_number') {
        comparison = a.registration_number.localeCompare(b.registration_number);
      } else if (sortField === 'brand') {
        comparison = a.brand.localeCompare(b.brand);
      } else if (sortField === 'year') {
        comparison = a.year - b.year;
      } else if (sortField === 'partner_name') {
        comparison = a.partner_name.localeCompare(b.partner_name);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredVehicles(result);
  }, [vehicles, searchTerm, filterVehicleType, filterStatus, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateVehicle = () => {
    navigate('/vehicles/new');
  };
  
  const handleViewVehicle = (id: number) => {
    navigate(`/vehicles/${id}`);
  };
  
  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return <TruckIcon className="h-5 w-5 text-blue-500" title="Camion" />;
      case 'van':
        return <TruckIcon className="h-5 w-5 text-green-500" title="Fourgon" />;
      case 'trailer':
        return <TruckIcon className="h-5 w-5 text-purple-500" title="Remorque" />;
      case 'container_chassis':
        return <TruckIcon className="h-5 w-5 text-orange-500" title="Châssis porte-conteneur" />;
      default:
        return <TruckIcon className="h-5 w-5 text-gray-500" title="Véhicule" />;
    }
  };
  
  const getVehicleTypeName = (type: string) => {
    const vehicleTypeNames: Record<string, string> = {
      'truck': 'Camion',
      'van': 'Fourgon',
      'trailer': 'Remorque',
      'container_chassis': 'Châssis porte-conteneur',
      'tractor': 'Tracteur',
      'refrigerated_truck': 'Camion frigorifique',
      'tanker': 'Citerne'
    };
    
    return vehicleTypeNames[type] || type;
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'available': 'Disponible',
      'in_transit': 'En transit',
      'maintenance': 'En maintenance',
      'out_of_service': 'Hors service',
      'reserved': 'Réservé'
    };
    
    return statusNames[status] || status;
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
            Véhicules
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateVehicle}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau véhicule
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
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
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher un véhicule..."
            />
          </div>
          
          {/* Vehicle type filter */}
          <div>
            <label htmlFor="vehicle-type" className="block text-sm font-medium text-gray-700">
              Type de véhicule
            </label>
            <select
              id="vehicle-type"
              value={filterVehicleType}
              onChange={(e) => setFilterVehicleType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="truck">Camions</option>
              <option value="van">Fourgons</option>
              <option value="trailer">Remorques</option>
              <option value="container_chassis">Châssis porte-conteneurs</option>
              <option value="tractor">Tracteurs</option>
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
              <option value="in_transit">En transit</option>
              <option value="maintenance">En maintenance</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Vehicles table */}
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
                      onClick={() => handleSort('registration_number')}
                    >
                      <div className="flex items-center">
                        Immatriculation
                        {sortField === 'registration_number' && (
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
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('brand')}
                    >
                      <div className="flex items-center">
                        Véhicule
                        {sortField === 'brand' && (
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
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun véhicule trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <tr 
                        key={vehicle.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewVehicle(vehicle.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{vehicle.registration_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getVehicleTypeIcon(vehicle.type)}
                            <span className="ml-2 text-sm text-gray-900">
                              {getVehicleTypeName(vehicle.type)}
                            </span>
                          </div>
                        </td>
                                              <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-sm text-gray-500">{vehicle.year} - {vehicle.capacity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(vehicle.status)}`}>
                            {getStatusName(vehicle.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vehicle.partner_name}</div>
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

export default Vehicles;
