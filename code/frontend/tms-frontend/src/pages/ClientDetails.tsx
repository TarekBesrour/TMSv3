import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPartnerById,
  getPartnerContacts,
  getPartnerAddresses,
  getPartnerSites,
  getPartnerContracts,
  getPartnerDocuments,
  getClientOrders,
  getClientShipments,
  getClientInvoices,
  getClientMetrics,
  getClientDeliveryPreferences,
  getClientPricingTiers,
  Partner,
  Contact,
  Address,
  Site,
  Contract,
  Document,
  Order,
  Shipment,
  Invoice,
  ClientMetrics,
  DeliveryPreference,
  PricingTier
} from '../services/partnersApi';
import { 
  UserGroupIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Partner | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Client-specific data
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [deliveryPreferences, setDeliveryPreferences] = useState<DeliveryPreference[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('ID du client manquant');
        }
        
        // Fetch client data
        const clientData = await getPartnerById(id);
        
        // Verify it's a customer
        if (clientData.type !== 'customer') {
          throw new Error('Ce partenaire n\'est pas un client');
        }
        
        setClient(clientData);
        
        // Fetch related data in parallel
        const [
          contactsData, 
          addressesData, 
          sitesData, 
          contractsData, 
          documentsData,
          ordersData,
          shipmentsData,
          invoicesData,
          metricsData,
          deliveryPreferencesData,
          pricingTiersData
        ] = await Promise.all([
          getPartnerContacts(id),
          getPartnerAddresses(id),
          getPartnerSites(id),
          getPartnerContracts(id),
          getPartnerDocuments(id),
          getClientOrders(id),
          getClientShipments(id),
          getClientInvoices(id),
          getClientMetrics(id),
          getClientDeliveryPreferences(id),
          getClientPricingTiers(id)
        ]);
        
        setContacts(contactsData);
        setAddresses(addressesData);
        setSites(sitesData);
        setContracts(contractsData);
        setDocuments(documentsData);
        setOrders(ordersData);
        setShipments(shipmentsData);
        setInvoices(invoicesData);
        setMetrics(metricsData);
        setDeliveryPreferences(deliveryPreferencesData);
        setPricingTiers(pricingTiersData);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données du client');
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [id]);
  
  const handleEditClient = () => {
    navigate(`/clients/${id}/edit`);
  };
  
  const handleBack = () => {
    navigate('/clients');
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'in_transit':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'pending': 'En attente',
      'blocked': 'Bloqué',
      'confirmed': 'Confirmé',
      'in_transit': 'En transit',
      'delivered': 'Livré',
      'cancelled': 'Annulé',
      'draft': 'Brouillon',
      'sent': 'Envoyé',
      'paid': 'Payé',
      'overdue': 'En retard'
    };
    return statusLabels[status] || status;
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return '-';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !client) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="flex items-center text-red-500">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p>{error || 'Client non trouvé'}</p>
        </div>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Retour à la liste des clients
        </button>
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
              onClick={handleBack}
              className="mr-4 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {client.name}
            </h2>
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <UserGroupIcon className="h-5 w-5 text-blue-500 mr-1.5" />
              <span>Client</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(client.status)}`}
              >
                {getStatusLabel(client.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleEditClient}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Modifier
          </button>
        </div>
      </div>
      
      {/* Client metrics overview */}
      {metrics && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Aperçu des performances
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 p-6">
              <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCartIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Commandes totales</dt>
                        <dd className="text-lg font-medium text-gray-900">{metrics.total_orders}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyEuroIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Chiffre d'affaires</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(metrics.total_revenue, metrics.currency)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Livraisons à temps</dt>
                        <dd className="text-lg font-medium text-gray-900">{(metrics.on_time_delivery_rate * 100).toFixed(1)}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Panier moyen</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(metrics.average_order_value, metrics.currency)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Client details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informations générales
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Détails du client et informations légales
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">customer</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Forme juridique</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.legal_form || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro SIRET</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.registration_number || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro TVA</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.vat_number || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Site web</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {client.website ? (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                    {client.website}
                  </a>
                ) : (
                  '-'
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{client.notes || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Tabs - Client specific tabs */}
      <div className="bg-white shadow sm:rounded-lg">
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Commandes ({orders.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Expéditions ({shipments.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Facturation ({invoices.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Préférences livraison ({deliveryPreferences.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Tarification ({pricingTiers.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Contacts ({contacts.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Adresses ({addresses.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-blue-500 text-blue-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Documents ({documents.length})
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Orders panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Commandes</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Nouvelle commande
                </button>
              </div>
              
              {orders.length === 0 ? (
                <p className="text-gray-500">Aucune commande enregistrée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Référence</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Origine → Destination</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date enlèvement</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Montant</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {order.reference}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="truncate max-w-xs">
                              {order.origin_address} → {order.destination_address}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(order.pickup_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatCurrency(order.total_amount, order.currency)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Voir
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
            
            {/* Shipments panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Expéditions</h3>
              </div>
              
              {shipments.length === 0 ? (
                <p className="text-gray-500">Aucune expédition enregistrée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">N° de suivi</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Origine → Destination</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Transporteur</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date enlèvement</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {shipments.map((shipment) => (
                        <tr key={shipment.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {shipment.tracking_number}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="truncate max-w-xs">
                              {shipment.origin} → {shipment.destination}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {shipment.carrier_name || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(shipment.pickup_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(shipment.status)}`}
                            >
                              {getStatusLabel(shipment.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Suivre
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
            
            {/* Invoices panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Facturation</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Nouvelle facture
                </button>
              </div>
              
              {invoices.length === 0 ? (
                <p className="text-gray-500">Aucune facture enregistrée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">N° facture</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date émission</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date échéance</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Montant</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {invoice.invoice_number}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(invoice.issue_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(invoice.due_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatCurrency(invoice.total_amount, invoice.currency)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}
                            >
                              {getStatusLabel(invoice.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900 mr-4">
                              Télécharger
                            </a>
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Modifier
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
            
            {/* Delivery Preferences panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Préférences de livraison</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajouter une préférence
                </button>
              </div>
              
              {deliveryPreferences.length === 0 ? (
                <p className="text-gray-500">Aucune préférence de livraison configurée</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {deliveryPreferences.map((preference) => (
                    <div key={preference.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between">
                          <h4 className="text-lg font-medium text-gray-900">
                            Adresse {preference.address_id}
                            {preference.is_default && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Par défaut
                              </span>
                            )}
                          </h4>
                          <button
                            type="button"
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          {preference.preferred_time_start && preference.preferred_time_end && (
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 mr-2" />
                              {preference.preferred_time_start} - {preference.preferred_time_end}
                            </div>
                          )}
                          {preference.contact_person && (
                            <div className="flex items-center text-sm text-gray-500">
                              <UserGroupIcon className="h-4 w-4 mr-2" />
                              {preference.contact_person}
                              {preference.contact_phone && ` (${preference.contact_phone})`}
                            </div>
                          )}
                          {preference.special_instructions && (
                            <div className="text-sm text-gray-500">
                              <strong>Instructions:</strong> {preference.special_instructions}
                            </div>
                          )}
                          {preference.access_code && (
                            <div className="text-sm text-gray-500">
                              <strong>Code d'accès:</strong> {preference.access_code}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
            
            {/* Pricing Tiers panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Grilles tarifaires</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Nouvelle grille
                </button>
              </div>
              
              {pricingTiers.length === 0 ? (
                <p className="text-gray-500">Aucune grille tarifaire configurée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type de service</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarif de base</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarif/kg</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Période</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {pricingTiers.map((tier) => (
                        <tr key={tier.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {tier.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {tier.service_type === 'STANDARD' ? 'Standard' :
                             tier.service_type === 'EXPRESS' ? 'Express' :
                             tier.service_type === 'ECONOMY' ? 'Économique' :
                             tier.service_type === 'PREMIUM' ? 'Premium' : tier.service_type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatCurrency(tier.base_rate, tier.currency)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {tier.per_kg_rate ? formatCurrency(tier.per_kg_rate, tier.currency) : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(tier.effective_date)}
                            {tier.expiry_date && ` - ${formatDate(tier.expiry_date)}`}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Modifier
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
            
            {/* Contacts panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajouter un contact
                </button>
              </div>
              
              {contacts.length === 0 ? (
                <p className="text-gray-500">Aucun contact enregistré</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fonction</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Téléphone</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {contacts.map((contact) => (
                        <tr key={contact.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {contact.first_name} {contact.last_name}
                            {contact.is_primary && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Principal
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contact.position || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-900">
                                {contact.email}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contact.phone ? (
                              <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-900">
                                {contact.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {contact.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Modifier
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
            
            {/* Addresses panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Adresses</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajouter une adresse
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <p className="text-gray-500">Aucune adresse enregistrée</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between">
                          <h4 className="text-lg font-medium text-gray-900">{address.name || 'Adresse'}</h4>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-start">
                          <div className="flex-shrink-0">
                            <MapPinIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3 text-sm text-gray-500">
                            <p>{address.street_line1}</p>
                            {address.street_line2 && <p>{address.street_line2}</p>}
                            <p>{address.postal_code} {address.city}</p>
                            {address.state && <p>{address.state}</p>}
                            <p>{address.country}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {address.is_headquarters && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Siège social
                            </span>
                          )}
                          {address.is_billing && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Facturation
                            </span>
                          )}
                          {address.is_shipping && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Expédition
                            </span>
                          )}
                          {address.is_operational && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Opérationnel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
            
            {/* Documents panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajouter un document
                </button>
              </div>
              
              {documents.length === 0 ? (
                <p className="text-gray-500">Aucun document enregistré</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Taille</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date d'ajout</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiration</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {documents.map((document) => (
                        <tr key={document.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                              {document.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {document.type === 'CONTRACT' ? 'Contrat' :
                             document.type === 'CERTIFICATE' ? 'Certificat' :
                             document.type === 'LICENSE' ? 'Licence' :
                             document.type === 'INSURANCE' ? 'Assurance' :
                             document.type === 'INVOICE' ? 'Facture' : 'Autre'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {document.size ? formatFileSize(document.size) : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(document.upload_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {document.expiry_date ? formatDate(document.expiry_date) : '-'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900 mr-4">
                              Télécharger
                            </a>
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Modifier
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default ClientDetails;

