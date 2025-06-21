import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  ClipboardDocumentCheckIcon
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
  description?: string;
  total_weight?: number;
  weight_unit?: string;
  total_volume?: number;
  volume_unit?: string;
  package_count?: number;
  special_instructions?: string;
  customs_value?: number;
  customs_currency?: string;
  shipment_id?: number;
  shipment_reference?: string;
  shipment_status?: string;
}

interface OrderLine {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  weight: number;
  weight_unit: string;
  volume: number;
  volume_unit: string;
  description?: string;
  hs_code?: string;
  country_of_origin?: string;
}

interface Document {
  id: number;
  reference: string;
  type: string;
  name: string;
  upload_date: string;
  status: string;
  url: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'documents' | 'tracking'>('details');
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock order data
          const mockOrder: Order = {
            id: parseInt(id || '1'),
            reference: `ORD-2025-000${id}`,
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
            transport_mode: 'multimodal',
            description: 'Équipements électroniques pour le bureau de Madrid',
            total_weight: 1250,
            weight_unit: 'kg',
            total_volume: 3.5,
            volume_unit: 'm³',
            package_count: 15,
            special_instructions: 'Fragile, manipuler avec précaution. Livraison sur rendez-vous uniquement.',
            customs_value: 25000,
            customs_currency: 'EUR',
            shipment_id: 1,
            shipment_reference: 'SHP-2025-0001',
            shipment_status: 'booked'
          };
          
          // Mock order lines
          const mockOrderLines: OrderLine[] = [
            {
              id: 1,
              order_id: parseInt(id || '1'),
              product_id: 101,
              product_name: 'Écran LCD 27"',
              quantity: 5,
              weight: 35,
              weight_unit: 'kg',
              volume: 0.5,
              volume_unit: 'm³',
              description: 'Écrans LCD haute résolution',
              hs_code: '8528.52.00',
              country_of_origin: 'China'
            },
            {
              id: 2,
              order_id: parseInt(id || '1'),
              product_id: 102,
              product_name: 'Ordinateur portable',
              quantity: 10,
              weight: 25,
              weight_unit: 'kg',
              volume: 0.2,
              volume_unit: 'm³',
              description: 'Ordinateurs portables professionnels',
              hs_code: '8471.30.00',
              country_of_origin: 'Vietnam'
            },
            {
              id: 3,
              order_id: parseInt(id || '1'),
              product_id: 103,
              product_name: 'Imprimante multifonction',
              quantity: 3,
              weight: 60,
              weight_unit: 'kg',
              volume: 0.8,
              volume_unit: 'm³',
              description: 'Imprimantes laser multifonctions',
              hs_code: '8443.31.00',
              country_of_origin: 'Japan'
            }
          ];
          
          // Mock documents
          const mockDocuments: Document[] = [
            {
              id: 1,
              reference: 'INV-2025-0001',
              type: 'invoice',
              name: 'Facture commerciale',
              upload_date: '2025-06-01T11:30:00Z',
              status: 'approved',
              url: '/documents/invoice-2025-0001.pdf'
            },
            {
              id: 2,
              reference: 'PL-2025-0001',
              type: 'packing_list',
              name: 'Liste de colisage',
              upload_date: '2025-06-01T11:35:00Z',
              status: 'approved',
              url: '/documents/packing-list-2025-0001.pdf'
            },
            {
              id: 3,
              reference: 'CMR-2025-0001',
              type: 'transport',
              name: 'Lettre de voiture CMR',
              upload_date: '2025-06-02T09:15:00Z',
              status: 'pending',
              url: '/documents/cmr-2025-0001.pdf'
            },
            {
              id: 4,
              reference: 'EXP-2025-0001',
              type: 'customs',
              name: 'Déclaration d\'exportation',
              upload_date: '2025-06-02T10:20:00Z',
              status: 'pending',
              url: '/documents/export-declaration-2025-0001.pdf'
            }
          ];
          
          setOrder(mockOrder);
          setOrderLines(mockOrderLines);
          setDocuments(mockDocuments);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des détails de la commande');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  const handleBack = () => {
    navigate('/orders');
  };
  
  const handleEdit = () => {
    navigate(`/orders/${id}/edit`);
  };
  
  const handleDuplicate = () => {
    navigate('/orders/new', { state: { duplicate: order } });
  };
  
  const handleDelete = () => {
    // In a real app, this would be an API call to delete the order
    // For now, we'll just navigate back to the orders list
    navigate('/orders');
  };
  
  const handleCreateShipment = () => {
    navigate('/shipments/new', { state: { orderId: id } });
  };
  
  const handleViewShipment = () => {
    if (order?.shipment_id) {
      navigate(`/shipments/${order.shipment_id}`);
    }
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
  
  const getDocumentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDocumentStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté'
    };
    
    return statusNames[status] || status;
  };
  
  const getDocumentTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'invoice': 'Facture',
      'packing_list': 'Liste de colisage',
      'transport': 'Document de transport',
      'customs': 'Document douanier',
      'certificate': 'Certificat',
      'other': 'Autre'
    };
    
    return typeNames[type] || type;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error || "Impossible de charger les détails de la commande"}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleBack}
              className="mr-4 inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {order.reference}
            </h2>
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                {getStatusName(order.status)}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(order.priority)}`}>
                {getPriorityName(order.priority)}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Créée le {formatDate(order.created_at)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <button
            type="button"
            onClick={handleDuplicate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentDuplicateIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Dupliquer
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Modifier
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Supprimer
          </button>
          {order.shipment_id ? (
            <button
              type="button"
              onClick={handleViewShipment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <TruckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Voir l'expédition
            </button>
          ) : (
                       <button
              type="button"
              onClick={handleCreateShipment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <TruckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Créer une expédition
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('details')}
          >
            Détails
          </button>
          <button
            className={`${
              activeTab === 'lines'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('lines')}
          >
            Lignes ({orderLines.length})
          </button>
          <button
            className={`${
              activeTab === 'documents'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('documents')}
          >
            Documents ({documents.length})
          </button>
          <button
            className={`${
              activeTab === 'tracking'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('tracking')}
          >
            Suivi
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'details' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informations de la commande</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Détails et spécifications</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.customer_name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Origine</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.origin_address}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Destination</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.destination_address}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date promise</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(order.promised_date)}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type d'expédition</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    {order.shipment_type === 'international' ? (
                      <GlobeAltIcon className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <MapPinIcon className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    {getShipmentTypeName(order.shipment_type)}
                  </div>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Mode de transport</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-indigo-500 mr-2" />
                    {getTransportModeName(order.transport_mode)}
                  </div>
                </dd>
              </div>
              {order.incoterm && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Incoterm</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.incoterm} {order.currency && `(${order.currency})`}
                  </dd>
                </div>
              )}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.description || '-'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Poids total</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.total_weight} {order.weight_unit}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Volume total</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.total_volume} {order.volume_unit}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre de colis</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.package_count}</dd>
              </div>
              {order.customs_value && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Valeur en douane</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.customs_value} {order.customs_currency}
                  </dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Instructions spéciales</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {order.special_instructions || '-'}
                </dd>
              </div>
              {order.shipment_id && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Expédition associée</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="mr-2">{order.shipment_reference}</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.shipment_status || '')}`}>
                        {getStatusName(order.shipment_status || '')}
                      </span>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
      
      {activeTab === 'lines' && (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Produit
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantité
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Poids
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Volume
                      </th>
                      {order.shipment_type === 'international' && (
                        <>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Code HS
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Origine
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderLines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{line.product_name}</div>
                          <div className="text-sm text-gray-500">{line.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {line.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {line.weight} {line.weight_unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {line.volume} {line.volume_unit}
                        </td>
                        {order.shipment_type === 'international' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {line.hs_code || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {line.country_of_origin || '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Document
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Statut
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{document.name}</div>
                              <div className="text-xs text-gray-500">{document.reference}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getDocumentTypeName(document.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(document.upload_date)}
                        </td>
                                               <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocumentStatusBadgeClass(document.status)}`}>
                            {getDocumentStatusName(document.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href={document.url} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            Voir
                          </a>
                          <a href="#" className="text-indigo-600 hover:text-indigo-900">
                            Télécharger
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Ajouter un document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tracking' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Suivi de la commande</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Historique des événements</p>
          </div>
          <div className="border-t border-gray-200">
            {order.shipment_id ? (
              <div className="flow-root px-4 py-5">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Commande <span className="font-medium text-gray-900">confirmée</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <TruckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Expédition <span className="font-medium text-gray-900">créée</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate('2025-06-02T09:00:00Z')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <DocumentTextIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Documents <span className="font-medium text-gray-900">ajoutés</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate('2025-06-02T10:30:00Z')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                            <TruckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Expédition <span className="font-medium text-gray-900">réservée</span> avec le transporteur
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate('2025-06-03T14:00:00Z')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="px-4 py-5 sm:px-6">
                <p className="text-sm text-gray-500">
                  Aucune expédition n'a encore été créée pour cette commande.
                </p>
                <button
                  type="button"
                  onClick={handleCreateShipment}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <TruckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Créer une expédition
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
