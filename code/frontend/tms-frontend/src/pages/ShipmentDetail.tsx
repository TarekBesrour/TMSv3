import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  LocationMarkerIcon,
  CalendarIcon,
  TruckIcon,
  GlobeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon
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
  description?: string;
  total_weight?: number;
  weight_unit?: string;
  total_volume?: number;
  volume_unit?: string;
  package_count?: number;
  special_instructions?: string;
  customs_status?: string;
  customs_clearance_date?: string;
}

interface TransportSegment {
  id: number;
  shipment_id: number;
  sequence: number;
  origin: string;
  destination: string;
  transport_mode: string;
  carrier_name: string;
  carrier_reference?: string;
  vehicle_type?: string;
  vehicle_reference?: string;
  driver_name?: string;
  driver_contact?: string;
  planned_departure: string;
  planned_arrival: string;
  actual_departure?: string;
  actual_arrival?: string;
  status: string;
  transfer_type?: string;
  transfer_location?: string;
}

interface TrackingEvent {
  id: number;
  shipment_id: number;
  segment_id?: number;
  timestamp: string;
  location: string;
  event_type: string;
  description: string;
  status: string;
  created_by: string;
  notes?: string;
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

const ShipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [segments, setSegments] = useState<TransportSegment[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'segments' | 'tracking' | 'documents'>('details');
  
  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock shipment data
          const mockShipment: Shipment = {
            id: parseInt(id || '1'),
            reference: `SHP-2025-000${id}`,
            order_id: 1,
            order_reference: 'ORD-2025-0001',
            carrier_id: 1,
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
            description: 'Équipements électroniques pour le bureau de Hambourg',
            total_weight: 1250,
            weight_unit: 'kg',
            total_volume: 3.5,
            volume_unit: 'm³',
            package_count: 15,
            special_instructions: 'Fragile, manipuler avec précaution. Livraison sur rendez-vous uniquement.',
            customs_status: 'cleared',
            customs_clearance_date: '2025-06-15T08:30:00Z'
          };
          
          // Mock segments data for multimodal transport
          const mockSegments: TransportSegment[] = [
            {
              id: 1,
              shipment_id: parseInt(id || '1'),
              sequence: 1,
              origin: 'Shanghai, China',
              destination: 'Shanghai Port, China',
              transport_mode: 'road',
              carrier_name: 'China Express Logistics',
              carrier_reference: 'CEL-78945',
              vehicle_type: 'Truck',
              vehicle_reference: 'CEL-T-123',
              driver_name: 'Li Wei',
              driver_contact: '+86 123 456 7890',
              planned_departure: '2025-06-03T10:00:00Z',
              planned_arrival: '2025-06-03T14:00:00Z',
              actual_departure: '2025-06-03T11:15:00Z',
              actual_arrival: '2025-06-03T15:30:00Z',
              status: 'completed',
              transfer_type: 'port',
              transfer_location: 'Shanghai Port Terminal 3'
            },
            {
              id: 2,
              shipment_id: parseInt(id || '1'),
              sequence: 2,
              origin: 'Shanghai Port, China',
              destination: 'Rotterdam Port, Netherlands',
              transport_mode: 'sea',
              carrier_name: 'Global Shipping Lines',
              carrier_reference: 'GSL-123456',
              vehicle_type: 'Container Ship',
              vehicle_reference: 'MAERSK SEALAND',
              planned_departure: '2025-06-05T08:00:00Z',
              planned_arrival: '2025-06-18T10:00:00Z',
              actual_departure: '2025-06-05T09:30:00Z',
              status: 'in_transit',
              transfer_type: 'port',
              transfer_location: 'Rotterdam Port Terminal 8'
            },
            {
              id: 3,
              shipment_id: parseInt(id || '1'),
              sequence: 3,
              origin: 'Rotterdam Port, Netherlands',
              destination: 'Hamburg, Germany',
              transport_mode: 'road',
              carrier_name: 'Euro Transport',
              carrier_reference: 'ET-56789',
              vehicle_type: 'Truck',
              vehicle_reference: 'ET-T-456',
              driver_name: 'Hans Mueller',
              driver_contact: '+49 987 654 3210',
              planned_departure: '2025-06-18T14:00:00Z',
              planned_arrival: '2025-06-19T10:00:00Z',
              status: 'planned',
              transfer_type: 'delivery',
              transfer_location: 'Hamburg Warehouse'
            }
          ];
          
          // Mock tracking events
          const mockTrackingEvents: TrackingEvent[] = [
            {
              id: 1,
              shipment_id: parseInt(id || '1'),
              segment_id: 1,
              timestamp: '2025-06-03T11:15:00Z',
              location: 'Shanghai, China',
              event_type: 'pickup',
              description: 'Marchandises enlevées',
              status: 'completed',
              created_by: 'System'
            },
            {
              id: 2,
              shipment_id: parseInt(id || '1'),
              segment_id: 1,
              timestamp: '2025-06-03T15:30:00Z',
              location: 'Shanghai Port, China',
              event_type: 'arrival',
              description: 'Arrivée au port de Shanghai',
              status: 'completed',
              created_by: 'System'
            },
            {
              id: 3,
              shipment_id: parseInt(id || '1'),
              segment_id: 2,
              timestamp: '2025-06-04T10:00:00Z',
              location: 'Shanghai Port, China',
              event_type: 'customs',
              description: 'Formalités douanières d\'exportation complétées',
              status: 'completed',
              created_by: 'System'
            },
            {
              id: 4,
              shipment_id: parseInt(id || '1'),
              segment_id: 2,
              timestamp: '2025-06-05T09:30:00Z',
              location: 'Shanghai Port, China',
              event_type: 'departure',
              description: 'Départ du navire',
              status: 'completed',
              created_by: 'System'
            },
            {
              id: 5,
              shipment_id: parseInt(id || '1'),
              segment_id: 2,
              timestamp: '2025-06-10T14:00:00Z',
              location: 'South China Sea',
              event_type: 'transit',
              description: 'En transit - Mer de Chine méridionale',
              status: 'in_progress',
              created_by: 'System'
            }
          ];
          
          // Mock documents
          const mockDocuments: Document[] = [
            {
              id: 1,
              reference: 'BL-2025-0001',
              type: 'bill_of_lading',
              name: 'Connaissement maritime',
              upload_date: '2025-06-04T11:30:00Z',
              status: 'approved',
              url: '/documents/bill-of-lading-2025-0001.pdf'
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
              status: 'approved',
              url: '/documents/cmr-2025-0001.pdf'
            },
            {
              id: 4,
              reference: 'EXP-2025-0001',
              type: 'customs',
              name: 'Déclaration d\'exportation',
              upload_date: '2025-06-04T10:20:00Z',
              status: 'approved',
              url: '/documents/export-declaration-2025-0001.pdf'
            },
            {
              id: 5,
              reference: 'IMP-2025-0001',
              type: 'customs',
              name: 'Déclaration d\'importation',
              upload_date: '2025-06-15T08:30:00Z',
              status: 'pending',
              url: '/documents/import-declaration-2025-0001.pdf'
            }
          ];
          
          setShipment(mockShipment);
          setSegments(mockSegments);
          setTrackingEvents(mockTrackingEvents);
          setDocuments(mockDocuments);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des détails de l\'expédition');
        setLoading(false);
      }
    };
    
    fetchShipmentDetails();
  }, [id]);
  
  const handleBack = () => {
    navigate('/shipments');
  };
  
  const handleEdit = () => {
    navigate(`/shipments/${id}/edit`);
  };
  
  const handleDelete = () => {
    // In a real app, this would be an API call to delete the shipment
    // For now, we'll just navigate back to the shipments list
    navigate('/shipments');
  };
  
  const handleViewOrder = () => {
    if (shipment?.order_id) {
      navigate(`/orders/${shipment.order_id}`);
    }
  };
  
  const handleAddTrackingEvent = () => {
    // In a real app, this would open a modal to add a tracking event
    console.log('Add tracking event');
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
        return <LocationMarkerIcon className="h-5 w-5 text-blue-500" title="Transport national" />;
      case 'international':
        return <GlobeIcon className="h-5 w-5 text-green-500" title="Transport international" />;
      case 'cross_border':
        return <GlobeIcon className="h-5 w-5 text-purple-500" title="Transport transfrontalier" />;
      default:
        return <LocationMarkerIcon className="h-5 w-5 text-gray-500" title="Transport" />;
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
      'bill_of_lading': 'Connaissement',
      'packing_list': 'Liste de colisage',
      'transport': 'Document de transport',
      'customs': 'Document douanier',
      'certificate': 'Certificat',
      'other': 'Autre'
    };
    
    return typeNames[type] || type;
  };
  
    const getEventTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'pickup': 'Enlèvement',
      'departure': 'Départ',
      'arrival': 'Arrivée',
      'transit': 'Transit',
      'customs': 'Douane',
      'delivery': 'Livraison',
      'exception': 'Exception',
      'delay': 'Retard',
      'transfer': 'Transfert'
    };
    
    return typeNames[type] || type;
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'departure':
        return <TruckIcon className="h-5 w-5 text-indigo-500" />;
      case 'arrival':
        return <LocationMarkerIcon className="h-5 w-5 text-green-500" />;
      case 'transit':
        return <TruckIcon className="h-5 w-5 text-yellow-500" />;
      case 'customs':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'delivery':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'exception':
        return <ExclamationIcon className="h-5 w-5 text-red-500" />;
      case 'delay':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'transfer':
        return <TruckIcon className="h-5 w-5 text-cyan-500" />;
      default:
        return <LocationMarkerIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error || "Impossible de charger les détails de l'expédition"}
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
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
                {getTransportModeIcon(shipment.transport_mode)}
                <span className="ml-2">{shipment.reference}</span>
              </h2>
              {shipment.carrier_reference && (
                <p className="text-sm text-gray-500">
                  Référence transporteur: {shipment.carrier_reference}
                </p>
              )}
            </div>
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
                {getStatusName(shipment.status)}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              {getShipmentTypeIcon(shipment.shipment_type)}
              <span className="ml-1">{getShipmentTypeName(shipment.shipment_type)}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Planifiée le {formatDate(shipment.planned_pickup_date)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
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
          {shipment.order_id && (
            <button
              type="button"
              onClick={handleViewOrder}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Voir la commande
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
              activeTab === 'segments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('segments')}
          >
            Segments ({segments.length})
          </button>
          <button
            className={`${
              activeTab === 'tracking'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('tracking')}
          >
            Suivi ({trackingEvents.length})
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
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'details' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informations de l'expédition</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Détails et spécifications</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Transporteur</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.carrier_name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Origine</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.origin_address}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Destination</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.destination_address}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date d'enlèvement prévue</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(shipment.planned_pickup_date)}
                  {shipment.actual_pickup_date && (
                    <span className="ml-2 text-green-600">
                      (Réel: {formatDate(shipment.actual_pickup_date)})
                    </span>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date de livraison prévue</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(shipment.planned_delivery_date)}
                  {shipment.actual_delivery_date && (
                    <span className="ml-2 text-green-600">
                      (Réel: {formatDate(shipment.actual_delivery_date)})
                    </span>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Mode de transport</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    {getTransportModeIcon(shipment.transport_mode)}
                    <span className="ml-2">{getTransportModeName(shipment.transport_mode)}</span>
                  </div>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type d'expédition</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    {getShipmentTypeIcon(shipment.shipment_type)}
                    <span className="ml-2">{getShipmentTypeName(shipment.shipment_type)}</span>
                  </div>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Niveau de service</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.service_level}</dd>
              </div>
              {shipment.incoterm && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Incoterm</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.incoterm}</dd>
                </div>
              )}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.description || '-'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Poids total</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {shipment.total_weight} {shipment.weight_unit}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Volume total</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {shipment.total_volume} {shipment.volume_unit}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nombre de colis</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{shipment.package_count}</dd>
              </div>
              {shipment.shipment_type === 'international' && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Statut douanier</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {shipment.customs_status === 'cleared' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                        Dédouané le {formatDate(shipment.customs_clearance_date || '')}
                      </span>
                    ) : shipment.customs_status === 'pending' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                        En attente de dédouanement
                      </span>
                    ) : shipment.customs_status === 'hold' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                        Retenu en douane
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </dd>
                </div>
              )}
               <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Instructions spéciales</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {shipment.special_instructions || '-'}
                </dd>
              </div>
              {shipment.order_id && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Commande associée</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-indigo-500 mr-2" />
                      <span>{shipment.order_reference}</span>
                      <button
                        type="button"
                        onClick={handleViewOrder}
                        className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Voir
                      </button>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
      
      {activeTab === 'segments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Segments de transport</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {segments.length === 1 ? 'Transport direct' : `Transport multimodal avec ${segments.length} segments`}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Ajouter un segment
            </button>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-hidden">
              {segments.map((segment, index) => (
                <div key={segment.id} className="relative">
                  {index < segments.length - 1 && (
                    <div className="absolute top-0 left-8 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                  )}
                  <div className="relative flex items-start space-x-4 px-4 py-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <span className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold">
                          {segment.sequence}
                        </span>
                        <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center bg-white">
                          {getTransportModeIcon(segment.transport_mode)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(segment.status)}`}>
                          {getStatusName(segment.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">{segment.origin}</div>
                            <div className="text-xs text-gray-400">
                              {formatDate(segment.planned_departure)}
                              {segment.actual_departure && (
                                <span className="ml-1 text-green-600">
                                  (Réel: {formatDate(segment.actual_departure)})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{segment.destination}</div>
                            <div className="text-xs text-gray-400">
                              {formatDate(segment.planned_arrival)}
                              {segment.actual_arrival && (
                                <span className="ml-1 text-green-600">
                                  (Réel: {formatDate(segment.actual_arrival)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <TruckIcon className="mr-1 h-3 w-3" />
                          {segment.carrier_name}
                        </div>
                        {segment.vehicle_type && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {segment.vehicle_type}
                          </div>
                        )}
                        {segment.transfer_type && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Transfert: {segment.transfer_type}
                          </div>
                        )}
                      </div>
                      {segment.driver_name && (
                        <div className="mt-2 text-xs text-gray-500">
                          Chauffeur: {segment.driver_name} {segment.driver_contact && `(${segment.driver_contact})`}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tracking' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Suivi de l'expédition</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Historique des événements</p>
            </div>
            <button
              type="button"
              onClick={handleAddTrackingEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Ajouter un événement
            </button>
          </div>
          <div className="border-t border-gray-200">
            <div className="flow-root px-4 py-5">
              <ul className="-mb-8">
                {trackingEvents.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== trackingEvents.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                            {getEventIcon(event.event_type)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {getEventTypeName(event.event_type)}
                              </span>
                              {' - '}
                              {event.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Lieu: {event.location}
                              {event.notes && ` - ${event.notes}`}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
    </div>
  );
};

export default ShipmentDetail;
