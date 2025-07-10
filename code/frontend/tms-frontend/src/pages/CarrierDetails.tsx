import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPartnerById,
  getPartnerContacts,
  getPartnerAddresses,
  getPartnerSites,
  getPartnerContracts,
  getPartnerDocuments,
  getPartnerVehicles,
  getPartnerDrivers,
  getCarrierTransportCapacities,
  getCarrierCoverageZones,
  getCarrierCertifications,
  getCarrierInsurances,
  getCarrierMetrics,
  Partner,
  Contact,
  Address,
  Site,
  Contract,
  Document,
  Vehicle,
  Driver,
  TransportCapacity,
  CoverageZone,
  Certification,
  Insurance,
  CarrierMetrics
} from '../services/partnersApi';
import { 
  TruckIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const CarrierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [carrier, setCarrier] = useState<Partner | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Carrier-specific data
  const [transportCapacities, setTransportCapacities] = useState<TransportCapacity[]>([]);
  const [coverageZones, setCoverageZones] = useState<CoverageZone[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [metrics, setMetrics] = useState<CarrierMetrics | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCarrierData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('ID du transporteur manquant');
        }
        
        // Fetch carrier data
        const carrierData = await getPartnerById(id);
        
        // Verify it's a carrier
        if (carrierData.type !== 'carrier') {
          throw new Error('Ce partenaire n\'est pas un transporteur');
        }
        
        setCarrier(carrierData);
        
        // Fetch related data in parallel
        const [
          contactsData, 
          addressesData, 
          sitesData, 
          contractsData, 
          documentsData,
          vehiclesData,
          driversData,
          transportCapacitiesData,
          coverageZonesData,
          certificationsData,
          insurancesData,
          metricsData
        ] = await Promise.all([
          getPartnerContacts(id),
          getPartnerAddresses(id),
          getPartnerSites(id),
          getPartnerContracts(id),
          getPartnerDocuments(id),
          getPartnerVehicles(id),
          getPartnerDrivers(id),
          getCarrierTransportCapacities(id),
          getCarrierCoverageZones(id),
          getCarrierCertifications(id),
          getCarrierInsurances(id),
          getCarrierMetrics(id)
        ]);
        
        setContacts(contactsData);
        setAddresses(addressesData);
        setSites(sitesData);
        setContracts(contractsData);
        setDocuments(documentsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setTransportCapacities(transportCapacitiesData);
        setCoverageZones(coverageZonesData);
        setCertifications(certificationsData);
        setInsurances(insurancesData);
        setMetrics(metricsData);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données du transporteur');
        setLoading(false);
      }
    };
    
    fetchCarrierData();
  }, [id]);
  
  const handleEditCarrier = () => {
    navigate(`/carriers/${id}/edit`);
  };
  
  const handleBack = () => {
    navigate('/carriers');
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'out_of_service':
      case 'suspended':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
      case 'on_leave':
      case 'pending_renewal':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'maintenance': 'Maintenance',
      'out_of_service': 'Hors service',
      'on_leave': 'En congé',
      'suspended': 'Suspendu',
      'expired': 'Expiré',
      'cancelled': 'Annulé',
      'pending_renewal': 'Renouvellement en cours'
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error || !carrier) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="flex items-center text-red-500">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p>{error || 'Transporteur non trouvé'}</p>
        </div>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Retour à la liste des transporteurs
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
              {carrier.name}
            </h2>
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <TruckIcon className="h-5 w-5 text-green-500 mr-1.5" />
              <span>Transporteur</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(carrier.status)}`}
              >
                {getStatusLabel(carrier.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleEditCarrier}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Modifier
          </button>
        </div>
      </div>
      
      {/* Carrier metrics overview */}
      {metrics && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Aperçu des performances
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 p-6">
              <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Expéditions totales</dt>
                        <dd className="text-lg font-medium text-gray-900">{metrics.total_shipments}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyEuroIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Utilisation flotte</dt>
                        <dd className="text-lg font-medium text-gray-900">{(metrics.fleet_utilization_rate * 100).toFixed(1)}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Carrier details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informations générales
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Détails du transporteur et informations légales
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carrier.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Transporteur</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Forme juridique</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carrier.legal_form || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro SIRET</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carrier.registration_number || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro TVA</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carrier.vat_number || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Site web</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {carrier.website ? (
                  <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900">
                    {carrier.website}
                  </a>
                ) : (
                  '-'
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carrier.notes || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Tabs - Carrier specific tabs */}
      <div className="bg-white shadow sm:rounded-lg">
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Véhicules ({vehicles.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Chauffeurs ({drivers.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Capacités transport ({transportCapacities.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Zones de couverture ({coverageZones.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Certifications ({certifications.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Assurances ({insurances.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-green-500 text-green-600 border-b-2'
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
                    ? 'border-green-500 text-green-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Documents ({documents.length})
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Vehicles panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Véhicules</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter un véhicule
                </button>
              </div>
              
              {vehicles.length === 0 ? (
                <p className="text-gray-500">Aucun véhicule enregistré</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Immatriculation</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Marque/Modèle</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacité poids</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacité volume</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {vehicle.registration_number}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {vehicle.type === 'TRUCK' ? 'Camion' :
                             vehicle.type === 'VAN' ? 'Fourgon' :
                             vehicle.type === 'TRAILER' ? 'Remorque' :
                             vehicle.type === 'CONTAINER' ? 'Conteneur' : 'Autre'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : 
                             vehicle.brand || vehicle.model || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {vehicle.capacity_weight ? `${vehicle.capacity_weight} kg` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {vehicle.capacity_volume ? `${vehicle.capacity_volume} m³` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(vehicle.status)}`}
                            >
                              {getStatusLabel(vehicle.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-green-600 hover:text-green-900">
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
            
            {/* Drivers panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chauffeurs</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter un chauffeur
                </button>
              </div>
              
              {drivers.length === 0 ? (
                <p className="text-gray-500">Aucun chauffeur enregistré</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">N° permis</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type permis</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiration</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Téléphone</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {drivers.map((driver) => (
                        <tr key={driver.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {driver.first_name} {driver.last_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {driver.license_number || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {driver.license_type || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {driver.license_expiry ? formatDate(driver.license_expiry) : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {driver.phone ? (
                              <a href={`tel:${driver.phone}`} className="text-green-600 hover:text-green-900">
                                {driver.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(driver.status)}`}
                            >
                              {getStatusLabel(driver.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-green-600 hover:text-green-900">
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
            
            {/* Transport Capacities panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Capacités de transport</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter une capacité
                </button>
              </div>
              
              {transportCapacities.length === 0 ? (
                <p className="text-gray-500">Aucune capacité de transport configurée</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {transportCapacities.map((capacity) => (
                    <div key={capacity.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between">
                          <h4 className="text-lg font-medium text-gray-900">
                            {capacity.service_type === 'ROAD' ? 'Route' :
                             capacity.service_type === 'RAIL' ? 'Rail' :
                             capacity.service_type === 'AIR' ? 'Aérien' :
                             capacity.service_type === 'SEA' ? 'Maritime' : 'Multimodal'}
                          </h4>
                          <button
                            type="button"
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="text-sm text-gray-500">
                            <strong>Type de cargo:</strong> {capacity.cargo_type === 'GENERAL' ? 'Général' :
                                                            capacity.cargo_type === 'REFRIGERATED' ? 'Réfrigéré' :
                                                            capacity.cargo_type === 'HAZARDOUS' ? 'Dangereux' :
                                                            capacity.cargo_type === 'OVERSIZED' ? 'Hors gabarit' :
                                                            capacity.cargo_type === 'LIQUID' ? 'Liquide' :
                                                            capacity.cargo_type === 'BULK' ? 'Vrac' : capacity.cargo_type}
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Poids max:</strong> {capacity.max_weight} kg
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Volume max:</strong> {capacity.max_volume} m³
                          </div>
                          <div className="text-sm text-gray-500">
                            <strong>Distance max:</strong> {capacity.max_distance} km
                          </div>
                          {capacity.equipment_type && (
                            <div className="text-sm text-gray-500">
                              <strong>Équipement:</strong> {capacity.equipment_type}
                            </div>
                          )}
                          {capacity.special_requirements && (
                            <div className="text-sm text-gray-500">
                              <strong>Exigences spéciales:</strong> {capacity.special_requirements}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
            
            {/* Coverage Zones panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Zones de couverture</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter une zone
                </button>
              </div>
              
              {coverageZones.length === 0 ? (
                <p className="text-gray-500">Aucune zone de couverture configurée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Zone</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Niveau service</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Délai livraison</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {coverageZones.map((zone) => (
                        <tr key={zone.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {zone.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {zone.zone_type === 'COUNTRY' ? 'Pays' :
                             zone.zone_type === 'REGION' ? 'Région' :
                             zone.zone_type === 'CITY' ? 'Ville' :
                             zone.zone_type === 'POSTAL_CODE' ? 'Code postal' : 'Personnalisé'}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="truncate max-w-xs">{zone.coverage_area}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {zone.service_level === 'STANDARD' ? 'Standard' :
                             zone.service_level === 'EXPRESS' ? 'Express' :
                             zone.service_level === 'ECONOMY' ? 'Économique' : 'Premium'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {zone.delivery_time_min === zone.delivery_time_max ? 
                              `${zone.delivery_time_min}h` : 
                              `${zone.delivery_time_min}-${zone.delivery_time_max}h`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                zone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {zone.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-green-600 hover:text-green-900">
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
            
            {/* Certifications panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter une certification
                </button>
              </div>
              
              {certifications.length === 0 ? (
                <p className="text-gray-500">Aucune certification enregistrée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">N° certification</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Organisme</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiration</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {certifications.map((certification) => (
                        <tr key={certification.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex items-center">
                              <ShieldCheckIcon className="h-5 w-5 text-green-400 mr-2" />
                              {certification.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {certification.type === 'ISO' ? 'ISO' :
                             certification.type === 'SAFETY' ? 'Sécurité' :
                             certification.type === 'ENVIRONMENTAL' ? 'Environnement' :
                             certification.type === 'QUALITY' ? 'Qualité' :
                             certification.type === 'SECURITY' ? 'Sûreté' : 'Autre'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {certification.certification_number}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {certification.issuing_authority}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {certification.expiry_date ? formatDate(certification.expiry_date) : 'Permanente'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(certification.status)}`}
                            >
                              {getStatusLabel(certification.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {certification.document_url && (
                              <a href={certification.document_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 mr-4">
                                Télécharger
                              </a>
                            )}
                            <a href="#" className="text-green-600 hover:text-green-900">
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
            
            {/* Insurances panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assurances</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter une assurance
                </button>
              </div>
              
              {insurances.length === 0 ? (
                <p className="text-gray-500">Aucune assurance enregistrée</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">N° police</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Assureur</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Couverture</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Période</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {insurances.map((insurance) => (
                        <tr key={insurance.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {insurance.policy_number}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {insurance.insurance_type === 'LIABILITY' ? 'Responsabilité civile' :
                             insurance.insurance_type === 'CARGO' ? 'Marchandises' :
                             insurance.insurance_type === 'VEHICLE' ? 'Véhicule' :
                             insurance.insurance_type === 'WORKERS_COMP' ? 'Accidents du travail' :
                             insurance.insurance_type === 'GENERAL' ? 'Générale' : 'Autre'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {insurance.provider}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatCurrency(insurance.coverage_amount, insurance.currency)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(insurance.effective_date)} - {formatDate(insurance.expiry_date)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(insurance.status)}`}
                            >
                              {getStatusLabel(insurance.status)}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            {insurance.document_url && (
                              <a href={insurance.document_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 mr-4">
                                Télécharger
                              </a>
                            )}
                            <a href="#" className="text-green-600 hover:text-green-900">
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
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Principal
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contact.position || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} className="text-green-600 hover:text-green-900">
                                {contact.email}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contact.phone ? (
                              <a href={`tel:${contact.phone}`} className="text-green-600 hover:text-green-900">
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
                            <a href="#" className="text-green-600 hover:text-green-900">
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
            
            {/* Documents panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                            <a href="#" className="text-green-600 hover:text-green-900 mr-4">
                              Télécharger
                            </a>
                            <a href="#" className="text-green-600 hover:text-green-900">
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

export default CarrierDetails;

