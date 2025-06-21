import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  //FunnelIcon,
  //DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  TruckIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Types
interface Shipment {
  id: number;
  reference: string;
  order_id?: number;
  order_reference?: string;
  carrier_id: number;
  carrier_name: string;
  origin_address: string;
  destination_address: string;
  transport_mode: string;
  service_level: string;
  status: string;
  planned_pickup_date: string;
  planned_delivery_date: string;
  actual_pickup_date?: string;
  actual_delivery_date?: string;
  shipment_type: string;
  incoterm?: string;
  carrier_reference?: string;
  segment_count: number;
}

const Shipments: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTransportMode, setFilterTransportMode] = useState<string>('all');
  const [filterShipmentType, setFilterShipmentType] = useState<string>('all');
  const [filterCarrier, setFilterCarrier] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('planned_pickup_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock shipments data
          const mockShipments: Shipment[] = [
            {
              id: 1,
              reference: 'SHP-2025-0001',
              order_id: 1,
              order_reference: 'ORD-2025-0001',
              carrier_id: 1,
              carrier_name: 'FastTruck Logistics',
              origin_address: 'Paris, France',
              destination_address: 'Madrid, Spain',
              transport_mode: 'road',
              service_level: 'standard',
              status: 'booked',
              planned_pickup_date: '2025-06-05T08:00:00Z',
              planned_delivery_date: '2025-06-07T16:00:00Z',
              shipment_type: 'international',
              incoterm: 'DAP',
              carrier_reference: 'FTL-78945',
              segment_count: 1
            },
            {
              id: 2,
              reference: 'SHP-2025-0002',
              order_id: 2,
              order_reference: 'ORD-2025-0002',
              carrier_id: 2,
              carrier_name: 'Global Shipping Lines',
              origin_address: 'Shanghai, China',
              destination_address: 'Hamburg, Germany',
              transport_mode: 'multimodal',
              service_level: 'express',
              status: 'in_transit',
              planned_pickup_date: '2025-06-03T10:00:00Z',
              planned_delivery_date: '2025-06-20T14:00:00Z',
              actual_pickup_date: '2025-06-03T11:15:00Z',
              shipment_type: 'international',
              incoterm: 'CIF',
              carrier_reference: 'GSL-123456',
              segment_count: 3
            },
            {
              id: 3,
              reference: 'SHP-2025-0003',
              order_id: 3,
              order_reference: 'ORD-2025-0003',
              carrier_id: 3,
              carrier_name: 'Express Delivery',
              origin_address: 'Lyon, France',
              destination_address: 'Marseille, France',
              transport_mode: 'road',
              service_level: 'economy',
              status: 'planned',
              planned_pickup_date: '2025-06-10T09:00:00Z',
              planned_delivery_date: '2025-06-11T17:00:00Z',
              shipment_type: 'domestic',
              carrier_reference: 'ED-56789',
              segment_count: 1
            },
            {
              id: 4,
              reference: 'SHP-2025-0004',
              order_id: 4,
              order_reference: 'ORD-2025-0004',
              carrier_id: 1,
              carrier_name: 'FastTruck Logistics',
              origin_address: 'Milan, Italy',
              destination_address: 'Paris, France',
              transport_mode: 'road',
              service_level: 'standard',
              status: 'customs_hold',
              planned_pickup_date: '2025-06-06T08:30:00Z',
              planned_delivery_date: '2025-06-08T12:00:00Z',
              actual_pickup_date: '2025-06-06T09:15:00Z',
              shipment_type: 'international',
              incoterm: 'DAP',
              carrier_reference: 'FTL-78946',
              segment_count: 1
            },
            {
              id: 5,
              reference: 'SHP-2025-0005',
              order_id: 5,
              order_reference: 'ORD-2025-0005',
              carrier_id: 4,
              carrier_name: 'Air Freight Express',
              origin_address: 'Shenzhen, China',
              destination_address: 'Rotterdam, Netherlands',
              transport_mode: 'multimodal',
              service_level: 'express',
              status: 'in_transit',
              planned_pickup_date: '2025-06-07T14:00:00Z',
              planned_delivery_date: '2025-06-15T10:00:00Z',
              actual_pickup_date: '2025-06-07T14:30:00Z',
              shipment_type: 'international',
              incoterm: 'FOB',
              carrier_reference: 'AFE-456789',
              segment_count: 4
            }
          ];
          
          setShipments(mockShipments);
          setFilteredShipments(mockShipments);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des expéditions');
        setLoading(false);
      }
    };
    
    fetchShipments();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...shipments];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(shipment => 
        shipment.reference.toLowerCase().includes(lowerSearchTerm) ||
        (shipment.order_reference && shipment.order_reference.toLowerCase().includes(lowerSearchTerm)) ||
        shipment.carrier_name.toLowerCase().includes(lowerSearchTerm) ||
        shipment.origin_address.toLowerCase().includes(lowerSearchTerm) ||
        shipment.destination_address.toLowerCase().includes(lowerSearchTerm) ||
        (shipment.carrier_reference && shipment.carrier_reference.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(shipment => shipment.status === filterStatus);
    }
    
    // Apply transport mode filter
    if (filterTransportMode !== 'all') {
      result = result.filter(shipment => shipment.transport_mode === filterTransportMode);
    }
    
    // Apply shipment type filter
    if (filterShipmentType !== 'all') {
      result = result.filter(shipment => shipment.shipment_type === filterShipmentType);
    }
    
    // Apply carrier filter
    if (filterCarrier !== 'all') {
      result = result.filter(shipment => shipment.carrier_id.toString() === filterCarrier);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'reference') {
        comparison = a.reference.localeCompare(b.reference);
      } else if (sortField === 'carrier_name') {
        comparison = a.carrier_name.localeCompare(b.carrier_name);
      } else if (sortField === 'planned_pickup_date') {
        comparison = new Date(a.planned_pickup_date).getTime() - new Date(b.planned_pickup_date).getTime();
      } else if (sortField === 'planned_delivery_date') {
        comparison = new Date(a.planned_delivery_date).getTime() - new Date(b.planned_delivery_date).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'segment_count') {
        comparison = a.segment_count - b.segment_count;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredShipments(result);
  }, [shipments, searchTerm, filterStatus, filterTransportMode, filterShipmentType, filterCarrier, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateShipment = () => {
    navigate('/shipments/new');
  };
  
  const handleViewShipment = (id: number) => {
    navigate(`/shipments/${id}`);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'booked':
        return 'bg-indigo-100 text-indigo-800';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'customs_hold':
        return 'bg-red-100 text-red-800';
      case 'exception':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'draft': 'Brouillon',
      'planned': 'Planifiée',
      'booked': 'Réservée',
      'in_transit': 'En transit',
      'customs_hold': 'Retenue en douane',
      'exception': 'Exception',
      'delivered': 'Livrée',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    
    return statusNames[status] || status;
  };
  
  const getTransportModeIcon = (mode: string) => {
    switch (mode) {
      case 'road':
        return <TruckIcon className="h-5 w-5 text-blue-500" title="Transport routier" />;
      case 'rail':
        return <TruckIcon className="h-5 w-5 text-green-500" title="Transport ferroviaire" />;
      case 'sea':
        return <TruckIcon className="h-5 w-5 text-cyan-500" title="Transport maritime" />;
      case 'air':
        return <TruckIcon className="h-5 w-5 text-purple-500" title="Transport aérien" />;
      case 'multimodal':
        return <TruckIcon className="h-5 w-5 text-orange-500" title="Transport multimodal" />;
      default:
        return <TruckIcon className="h-5 w-5 text-gray-500" title="Transport" />;
    }
  };
  
  const getTransportModeName = (mode: string) => {
    const modeNames: Record<string, string> = {
      'road': 'Routier',
      'rail': 'Ferroviaire',
      'sea': 'Maritime',
      'air': 'Aérien',
      'multimodal': 'Multimodal'
    };
    
    return modeNames[mode] || mode;
  };
  
  const getShipmentTypeIcon = (type: string) => {
    switch (type) {
      case 'domestic':
        return <MapPinIcon className="h-5 w-5 text-blue-500" title="Transport national" />;
      case 'international':
        return <GlobeAltIcon className="h-5 w-5 text-green-500" title="Transport international" />;
      case 'cross_border':
        return <GlobeAltIcon className="h-5 w-5 text-purple-500" title="Transport transfrontalier" />;
      default:
        return <MapPinIcon className="h-5 w-5 text-gray-500" title="Transport" />;
    }
  };
  
  const getShipmentTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'domestic': 'National',
      'international': 'International',
      'cross_border': 'Transfrontalier'
    };
    
    return typeNames[type] || type;
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  const getSegmentBadge = (count: number) => {
    if (count === 1) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Direct
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
          {count} segments
        </span>
      );
    }
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
            Expéditions
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateShipment}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle expédition
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {/* Search */}
          <div className="relative rounded-md shadow-sm lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher une expédition..."
            />
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
              <option value="draft">Brouillon</option>
              <option value="planned">Planifiée</option>
              <option value="booked">Réservée</option>
              <option value="in_transit">En transit</option>
              <option value="customs_hold">Retenue en douane</option>
              <option value="exception">Exception</option>
              <option value="delivered">Livrée</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          
          {/* Transport mode filter */}
          <div>
            <label htmlFor="transport-mode" className="block text-sm font-medium text-gray-700">
              Mode de transport
            </label>
            <select
              id="transport-mode"
              value={filterTransportMode}
              onChange={(e) => setFilterTransportMode(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="road">Routier</option>
              <option value="rail">Ferroviaire</option>
              <option value="sea">Maritime</option>
              <option value="air">Aérien</option>
              <option value="multimodal">Multimodal</option>
            </select>
          </div>
          
          {/* Shipment type filter */}
          <div>
            <label htmlFor="shipment-type" className="block text-sm font-medium text-gray-700">
              Type d'expédition
            </label>
            <select
              id="shipment-type"
              value={filterShipmentType}
              onChange={(e) => setFilterShipmentType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="domestic">National</option>
              <option value="international">International</option>
              <option value="cross_border">Transfrontalier</option>
            </select>
          </div>
          
          {/* Carrier filter */}
          <div>
            <label htmlFor="carrier" className="block text-sm font-medium text-gray-700">
              Transporteur
            </label>
            <select
              id="carrier"
              value={filterCarrier}
              onChange={(e) => setFilterCarrier(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="1">FastTruck Logistics</option>
              <option value="2">Global Shipping Lines</option>
              <option value="3">Express Delivery</option>
              <option value="4">Air Freight Express</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Shipments table */}
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
                      onClick={() => handleSort('carrier_name')}
                    >
                      <div className="flex items-center">
                        Transporteur
                        {sortField === 'carrier_name' && (
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
                      Trajet
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Statut
                        {sortField === 'status' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('planned_pickup_date')}
                    >
                      <div className="flex items-center">
                        Enlèvement
                        {sortField === 'planned_pickup_date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('planned_delivery_date')}
                    >
                      <div className="flex items-center">
                        Livraison
                        {sortField === 'planned_delivery_date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('segment_count')}
                    >
                      <div className="flex items-center">
                        Segments
                        {sortField === 'segment_count' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune expédition trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <tr 
                        key={shipment.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewShipment(shipment.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransportModeIcon(shipment.transport_mode)}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{shipment.reference}</div>
                              {shipment.order_reference && (
                                <div className="text-xs text-gray-500">
                                  Commande: {shipment.order_reference}
                                </div>
                              )}
                            </div>
                          </div>
                          {shipment.incoterm && (
                            <div className="text-xs text-gray-500 mt-1 ml-7">
                              Incoterm: {shipment.incoterm}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shipment.carrier_name}</div>
                          {shipment.carrier_reference && (
                            <div className="text-xs text-gray-500">
                              Réf: {shipment.carrier_reference}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center mb-1">
                            {getShipmentTypeIcon(shipment.shipment_type)}
                            <span className="ml-1 text-xs text-gray-500">{getShipmentTypeName(shipment.shipment_type)}</span>
                          </div>
                          <div className="text-sm text-gray-900">{shipment.origin_address}</div>
                          <div className="text-sm text-gray-500">→ {shipment.destination_address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
                            {getStatusName(shipment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-1" />
                            {formatDate(shipment.planned_pickup_date)}
                          </div>
                          {shipment.actual_pickup_date && (
                            <div className="flex items-center text-xs text-green-600 mt-1">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Réel: {formatDate(shipment.actual_pickup_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-1" />
                            {formatDate(shipment.planned_delivery_date)}
                          </div>
                          {shipment.actual_delivery_date && (
                            <div className="flex items-center text-xs text-green-600 mt-1">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Réel: {formatDate(shipment.actual_delivery_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSegmentBadge(shipment.segment_count)}
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

export default Shipments;
