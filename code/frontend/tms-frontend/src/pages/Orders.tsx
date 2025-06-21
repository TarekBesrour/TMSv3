import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  TruckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Types
interface Order {
  id: number;
  reference: string;
  customer_id: number;
  customer_name: string;
  origin_address: string;
  destination_address: string;
  service_type: string;
  status: string;
  priority: string;
  created_at: string;
  promised_date: string;
  incoterm?: string;
  currency?: string;
  shipment_type: string;
  transport_mode: string;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTransportMode, setFilterTransportMode] = useState<string>('all');
  const [filterShipmentType, setFilterShipmentType] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock orders data
          const mockOrders: Order[] = [
            {
              id: 1,
              reference: 'ORD-2025-0001',
              customer_id: 1,
              customer_name: 'Acme Corporation',
              origin_address: 'Paris, France',
              destination_address: 'Madrid, Spain',
              service_type: 'standard',
              status: 'confirmed',
              priority: 'normal',
              created_at: '2025-06-01T10:30:00Z',
              promised_date: '2025-06-10T18:00:00Z',
              incoterm: 'DAP',
              currency: 'EUR',
              shipment_type: 'international',
              transport_mode: 'road'
            },
            {
              id: 2,
              reference: 'ORD-2025-0002',
              customer_id: 2,
              customer_name: 'Global Imports',
              origin_address: 'Shanghai, China',
              destination_address: 'Hamburg, Germany',
              service_type: 'express',
              status: 'in_progress',
              priority: 'high',
              created_at: '2025-06-02T08:15:00Z',
              promised_date: '2025-06-25T12:00:00Z',
              incoterm: 'CIF',
              currency: 'USD',
              shipment_type: 'international',
              transport_mode: 'multimodal'
            },
            {
              id: 3,
              reference: 'ORD-2025-0003',
              customer_id: 3,
              customer_name: 'Tech Solutions',
              origin_address: 'Lyon, France',
              destination_address: 'Marseille, France',
              service_type: 'economy',
              status: 'draft',
              priority: 'low',
              created_at: '2025-06-03T14:45:00Z',
              promised_date: '2025-06-15T10:00:00Z',
              shipment_type: 'domestic',
              transport_mode: 'road'
            },
            {
              id: 4,
              reference: 'ORD-2025-0004',
              customer_id: 4,
              customer_name: 'Fashion Retail',
              origin_address: 'Milan, Italy',
              destination_address: 'Paris, France',
              service_type: 'standard',
              status: 'planned',
              priority: 'normal',
              created_at: '2025-06-04T09:20:00Z',
              promised_date: '2025-06-12T16:00:00Z',
              incoterm: 'DAP',
              currency: 'EUR',
              shipment_type: 'international',
              transport_mode: 'road'
            },
            {
              id: 5,
              reference: 'ORD-2025-0005',
              customer_id: 5,
              customer_name: 'Electronics Distributor',
              origin_address: 'Shenzhen, China',
              destination_address: 'Rotterdam, Netherlands',
              service_type: 'express',
              status: 'confirmed',
              priority: 'urgent',
              created_at: '2025-06-05T11:10:00Z',
              promised_date: '2025-06-20T09:00:00Z',
              incoterm: 'FOB',
              currency: 'USD',
              shipment_type: 'international',
              transport_mode: 'multimodal'
            }
          ];
          
          setOrders(mockOrders);
          setFilteredOrders(mockOrders);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des commandes');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...orders];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.reference.toLowerCase().includes(lowerSearchTerm) ||
        order.customer_name.toLowerCase().includes(lowerSearchTerm) ||
        order.origin_address.toLowerCase().includes(lowerSearchTerm) ||
        order.destination_address.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter(order => order.priority === filterPriority);
    }
    
    // Apply transport mode filter
    if (filterTransportMode !== 'all') {
      result = result.filter(order => order.transport_mode === filterTransportMode);
    }
    
    // Apply shipment type filter
    if (filterShipmentType !== 'all') {
      result = result.filter(order => order.shipment_type === filterShipmentType);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'reference') {
        comparison = a.reference.localeCompare(b.reference);
      } else if (sortField === 'customer_name') {
        comparison = a.customer_name.localeCompare(b.customer_name);
      } else if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'promised_date') {
        comparison = new Date(a.promised_date).getTime() - new Date(b.promised_date).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'priority') {
        const priorityOrder: Record<string, number> = {
          'low': 0,
          'normal': 1,
          'high': 2,
          'urgent': 3
        };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, filterPriority, filterTransportMode, filterShipmentType, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateOrder = () => {
    navigate('/orders/new');
  };
  
  const handleViewOrder = (id: number) => {
    navigate(`/orders/${id}`);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-indigo-100 text-indigo-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
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
      'confirmed': 'Confirmée',
      'planned': 'Planifiée',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    
    return statusNames[status] || status;
  };
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityName = (priority: string) => {
    const priorityNames: Record<string, string> = {
      'low': 'Basse',
      'normal': 'Normale',
      'high': 'Haute',
      'urgent': 'Urgente'
    };
    
    return priorityNames[priority] || priority;
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
            Commandes
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateOrder}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle commande
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
              placeholder="Rechercher une commande..."
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
              <option value="confirmed">Confirmée</option>
              <option value="planned">Planifiée</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          
          {/* Priority filter */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priorité
            </label>
            <select
              id="priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Toutes</option>
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
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
        </div>
      </div>
      
      {/* Orders table */}
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
                      onClick={() => handleSort('customer_name')}
                    >
                      <div className="flex items-center">
                        Client
                        {sortField === 'customer_name' && (
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
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center">
                        Priorité
                        {sortField === 'priority' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('promised_date')}
                    >
                      <div className="flex items-center">
                        Date promise
                        {sortField === 'promised_date' && (
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune commande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{order.reference}</div>
                          </div>
                          {order.incoterm && (
                            <div className="text-xs text-gray-500 mt-1">
                              Incoterm: {order.incoterm} {order.currency && `(${order.currency})`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customer_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{order.origin_address}</div>
                          <div className="text-sm text-gray-500">→ {order.destination_address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {getStatusName(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(order.priority)}`}>
                            {getPriorityName(order.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-1" />
                            {formatDate(order.promised_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getShipmentTypeIcon(order.shipment_type)}
                            <span className="ml-1 text-sm text-gray-500">{getShipmentTypeName(order.shipment_type)}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            {getTransportModeIcon(order.transport_mode)}
                            <span className="ml-1 text-sm text-gray-500">{getTransportModeName(order.transport_mode)}</span>
                          </div>
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

export default Orders;
