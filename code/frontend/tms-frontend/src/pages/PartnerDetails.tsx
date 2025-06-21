import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  TruckIcon, 
  BuildingOfficeIcon ,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

// Types
interface Partner {
  id: number;
  name: string;
  type: 'CLIENT' | 'CARRIER' | 'SUPPLIER' | 'OTHER';
  legal_form: string | null;
  registration_number: string | null;
  vat_number: string | null;
  website: string | null;
  logo_url: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'pending' | 'blocked';
}

interface Contact {
  id: number;
  partner_id: number;
  first_name: string;
  last_name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  is_primary: boolean;
  status: 'active' | 'inactive';
}

interface Address {
  id: number;
  partner_id: number;
  name: string | null;
  street_line1: string;
  street_line2: string | null;
  city: string;
  postal_code: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  is_headquarters: boolean;
  is_billing: boolean;
  is_shipping: boolean;
  is_operational: boolean;
  status: 'active' | 'inactive';
}

interface Site {
  id: number;
  partner_id: number;
  address_id: number;
  name: string;
  type: 'WAREHOUSE' | 'FACTORY' | 'STORE' | 'DISTRIBUTION_CENTER' | 'CROSS_DOCK' | 'OTHER';
  code: string | null;
  opening_hours: string | null;
  contact_id: number | null;
  capacity: number | null;
  surface_area: number | null;
  loading_docks: number | null;
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  address?: Address;
  contact?: Contact;
}

interface Vehicle {
  id: number;
  partner_id: number;
  registration_number: string;
  type: 'TRUCK' | 'VAN' | 'TRAILER' | 'CONTAINER' | 'OTHER';
  brand: string | null;
  model: string | null;
  year: number | null;
  capacity_volume: number | null;
  capacity_weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  fuel_type: string | null;
  emissions_class: string | null;
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_service';
}

interface Driver {
  id: number;
  partner_id: number;
  first_name: string;
  last_name: string;
  license_number: string | null;
  license_type: string | null;
  license_expiry: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
}

interface Contract {
  id: number;
  partner_id: number;
  reference: string;
  type: 'TRANSPORT' | 'LOGISTICS' | 'WAREHOUSING' | 'DISTRIBUTION' | 'OTHER';
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  terms: string | null;
  pricing_model: string | null;
  currency: string | null;
  payment_terms: string | null;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'pending_renewal';
}

interface Document {
  id: number;
  partner_id: number;
  contract_id: number | null;
  type: 'CONTRACT' | 'CERTIFICATE' | 'LICENSE' | 'INSURANCE' | 'INVOICE' | 'OTHER';
  name: string;
  file_path: string;
  mime_type: string | null;
  size: number | null;
  upload_date: string;
  expiry_date: string | null;
  status: 'active' | 'archived' | 'expired';
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const PartnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be API calls
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock partner data
          const mockPartner: Partner = {
            id: Number(id),
            name: 'Acme Logistics',
            type: 'CLIENT',
            legal_form: 'SAS',
            registration_number: '123456789',
            vat_number: 'FR12345678901',
            website: 'https://acme-logistics.com',
            logo_url: null,
            notes: 'Important client for international shipping.',
            status: 'active'
          };
          
          // Mock contacts
          const mockContacts: Contact[] = [
            {
              id: 1,
              partner_id: Number(id),
              first_name: 'Jean',
              last_name: 'Dupont',
              position: 'Directeur Logistique',
              email: 'jean.dupont@acme-logistics.com',
              phone: '+33123456789',
              mobile: '+33612345678',
              is_primary: true,
              status: 'active'
            },
            {
              id: 2,
              partner_id: Number(id),
              first_name: 'Marie',
              last_name: 'Martin',
              position: 'Responsable Transport',
              email: 'marie.martin@acme-logistics.com',
              phone: '+33123456790',
              mobile: '+33612345679',
              is_primary: false,
              status: 'active'
            }
          ];
          
          // Mock addresses
          const mockAddresses: Address[] = [
            {
              id: 1,
              partner_id: Number(id),
              name: 'Siège social',
              street_line1: '123 Avenue de la République',
              street_line2: null,
              city: 'Paris',
              postal_code: '75011',
              state: 'Île-de-France',
              country: 'France',
              latitude: 48.8566,
              longitude: 2.3522,
              is_headquarters: true,
              is_billing: true,
              is_shipping: false,
              is_operational: false,
              status: 'active'
            },
            {
              id: 2,
              partner_id: Number(id),
              name: 'Entrepôt principal',
              street_line1: '45 Rue de l\'Industrie',
              street_line2: 'Zone Industrielle Est',
              city: 'Lyon',
              postal_code: '69008',
              state: 'Auvergne-Rhône-Alpes',
              country: 'France',
              latitude: 45.7578,
              longitude: 4.8320,
              is_headquarters: false,
              is_billing: false,
              is_shipping: true,
              is_operational: true,
              status: 'active'
            }
          ];
          
          // Mock sites
          const mockSites: Site[] = [
            {
              id: 1,
              partner_id: Number(id),
              address_id: 2,
              name: 'Entrepôt Lyon Est',
              type: 'WAREHOUSE',
              code: 'LYO-E01',
              opening_hours: 'Lun-Ven: 08:00-18:00',
              contact_id: 2,
              capacity: 5000,
              surface_area: 8500,
              loading_docks: 12,
              status: 'active',
              address: mockAddresses[1],
              contact: mockContacts[1]
            }
          ];
          
          // Mock vehicles (only for carriers)
          const mockVehicles: Vehicle[] = mockPartner.type === 'CARRIER' ? [
            {
              id: 1,
              partner_id: Number(id),
              registration_number: 'AB-123-CD',
              type: 'TRUCK',
              brand: 'Volvo',
              model: 'FH16',
              year: 2021,
              capacity_volume: 80,
              capacity_weight: 24000,
              length: 1360,
              width: 255,
              height: 400,
              fuel_type: 'Diesel',
              emissions_class: 'Euro 6',
              status: 'active'
            }
          ] : [];
          
          // Mock drivers (only for carriers)
          const mockDrivers: Driver[] = mockPartner.type === 'CARRIER' ? [
            {
              id: 1,
              partner_id: Number(id),
              first_name: 'Pierre',
              last_name: 'Durand',
              license_number: 'DRV12345',
              license_type: 'C+E',
              license_expiry: '2025-06-30',
              phone: '+33612345680',
              email: 'p.durand@carrier.com',
              status: 'active'
            }
          ] : [];
          
          // Mock contracts
          const mockContracts: Contract[] = [
            {
              id: 1,
              partner_id: Number(id),
              reference: 'CTR-2023-001',
              type: 'TRANSPORT',
              start_date: '2023-01-01',
              end_date: '2025-12-31',
              renewal_date: '2025-10-01',
              terms: 'Contrat de transport standard avec renouvellement automatique.',
              pricing_model: 'Par kilomètre + frais fixes',
              currency: 'EUR',
              payment_terms: '30 jours fin de mois',
              status: 'active'
            }
          ];
          
          // Mock documents
          const mockDocuments: Document[] = [
            {
              id: 1,
              partner_id: Number(id),
              contract_id: 1,
              type: 'CONTRACT',
              name: 'Contrat de transport 2023-2025',
              file_path: '/uploads/documents/contract_123.pdf',
              mime_type: 'application/pdf',
              size: 2457600,
              upload_date: '2023-01-15T10:30:00Z',
              expiry_date: '2025-12-31',
              status: 'active'
            },
            {
              id: 2,
              partner_id: Number(id),
              contract_id: null,
              type: 'CERTIFICATE',
              name: 'Attestation d\'assurance RC',
              file_path: '/uploads/documents/insurance_123.pdf',
              mime_type: 'application/pdf',
              size: 1254400,
              upload_date: '2023-02-10T14:15:00Z',
              expiry_date: '2024-01-31',
              status: 'active'
            }
          ];
          
          setPartner(mockPartner);
          setContacts(mockContacts);
          setAddresses(mockAddresses);
          setSites(mockSites);
          setVehicles(mockVehicles);
          setDrivers(mockDrivers);
          setContracts(mockContracts);
          setDocuments(mockDocuments);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données du partenaire');
        setLoading(false);
      }
    };
    
    fetchPartnerData();
  }, [id]);
  
  const handleEditPartner = () => {
    navigate(`/partners/${id}/edit`);
  };
  
  const handleBack = () => {
    navigate('/partners');
  };
  
  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return <UserGroupIcon className="h-8 w-8 text-blue-500" />;
      case 'CARRIER':
        return <TruckIcon className="h-8 w-8 text-green-500" />;
      case 'SUPPLIER':
        return <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />;
      default:
        return <UserGroupIcon className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const getPartnerTypeLabel = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return 'Client';
      case 'CARRIER':
        return 'Transporteur';
      case 'SUPPLIER':
        return 'Fournisseur';
      default:
        return 'Autre';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'pending':
        return 'En attente';
      case 'blocked':
        return 'Bloqué';
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !partner) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="flex items-center text-red-500">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <p>{error || 'Partenaire non trouvé'}</p>
        </div>
        <button
          onClick={handleBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Retour à la liste
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
              {partner.name}
            </h2>
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              {getPartnerTypeIcon(partner.type)}
              <span className="ml-1.5">{getPartnerTypeLabel(partner.type)}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(partner.status)}`}
              >
                {getStatusLabel(partner.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleEditPartner}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Modifier
          </button>
        </div>
      </div>
      
      {/* Partner details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informations générales
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Détails du partenaire et informations légales
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{partner.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{getPartnerTypeLabel(partner.type)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Forme juridique</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{partner.legal_form || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro SIRET</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{partner.registration_number || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro TVA</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{partner.vat_number || '-'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Site web</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                    {partner.website}
                  </a>
                ) : (
                  '-'
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{partner.notes || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow sm:rounded-lg">
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
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
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
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
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Sites ({sites.length})
            </Tab>
            {partner.type === 'CARRIER' && (
              <Tab
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium',
                    selected
                      ? 'border-indigo-500 text-indigo-600 border-b-2'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                Véhicules ({vehicles.length})
              </Tab>
            )}
            {partner.type === 'CARRIER' && (
              <Tab
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium',
                    selected
                      ? 'border-indigo-500 text-indigo-600 border-b-2'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                Chauffeurs ({drivers.length})
              </Tab>
            )}
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Contrats ({contracts.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-6 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 text-indigo-600 border-b-2'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }
            >
              Documents ({documents.length})
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Contacts panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                              <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-900">
                                {contact.email}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contact.phone ? (
                              <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:text-indigo-900">
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
                            <a href="#" className="text-indigo-600 hover:text-indigo-900">
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
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            
            {/* Sites panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sites</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter un site
                </button>
              </div>
              
              {sites.length === 0 ? (
                <p className="text-gray-500">Aucun site enregistré</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Adresse</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacité</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {sites.map((site) => (
                        <tr key={site.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {site.name}
                            {site.code && <span className="ml-2 text-gray-500">({site.code})</span>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {site.type === 'WAREHOUSE' ? 'Entrepôt' :
                             site.type === 'FACTORY' ? 'Usine' :
                             site.type === 'STORE' ? 'Magasin' :
                             site.type === 'DISTRIBUTION_CENTER' ? 'Centre de distribution' :
                             site.type === 'CROSS_DOCK' ? 'Cross-dock' : 'Autre'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {site.address ? `${site.address.city}, ${site.address.country}` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {site.capacity ? `${site.capacity} m³` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                site.status === 'active' ? 'bg-green-100 text-green-800' :
                                site.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                site.status === 'closed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {site.status === 'active' ? 'Actif' :
                               site.status === 'maintenance' ? 'En maintenance' :
                               site.status === 'closed' ? 'Fermé' : 'Inactif'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-indigo-600 hover:text-indigo-900">
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
            
            {/* Vehicles panel (only for carriers) */}
            {partner.type === 'CARRIER' && (
              <Tab.Panel className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Véhicules</h3>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Marque / Modèle</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacité</th>
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
                              {vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : '-'}
                              {vehicle.year && ` (${vehicle.year})`}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {vehicle.capacity_volume && `${vehicle.capacity_volume} m³`}
                              {vehicle.capacity_weight && vehicle.capacity_volume && ' / '}
                              {vehicle.capacity_weight && `${vehicle.capacity_weight / 1000} t`}
                              {!vehicle.capacity_volume && !vehicle.capacity_weight && '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                                  vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                  vehicle.status === 'out_of_service' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {vehicle.status === 'active' ? 'Actif' :
                                 vehicle.status === 'maintenance' ? 'En maintenance' :
                                 vehicle.status === 'out_of_service' ? 'Hors service' : 'Inactif'}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a href="#" className="text-indigo-600 hover:text-indigo-900">
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
            )}
            
            {/* Drivers panel (only for carriers) */}
            {partner.type === 'CARRIER' && (
              <Tab.Panel className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Chauffeurs</h3>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Licence</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiration licence</th>
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
                              {driver.license_number && driver.license_type ? 
                                `${driver.license_number} (${driver.license_type})` : 
                                driver.license_number || driver.license_type || '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {driver.phone && (
                                <div className="flex items-center">
                                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                                  <a href={`tel:${driver.phone}`} className="text-indigo-600 hover:text-indigo-900">
                                    {driver.phone}
                                  </a>
                                </div>
                              )}
                              {driver.email && (
                                <div className="flex items-center mt-1">
                                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                                  <a href={`mailto:${driver.email}`} className="text-indigo-600 hover:text-indigo-900">
                                    {driver.email}
                                  </a>
                                </div>
                              )}
                              {!driver.phone && !driver.email && '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {driver.license_expiry ? formatDate(driver.license_expiry) : '-'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  driver.status === 'active' ? 'bg-green-100 text-green-800' :
                                  driver.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                                  driver.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {driver.status === 'active' ? 'Actif' :
                                 driver.status === 'on_leave' ? 'En congé' :
                                 driver.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a href="#" className="text-indigo-600 hover:text-indigo-900">
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
            )}
            
            {/* Contracts panel */}
            <Tab.Panel className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contrats</h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter un contrat
                </button>
              </div>
              
              {contracts.length === 0 ? (
                <p className="text-gray-500">Aucun contrat enregistré</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Référence</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Période</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Renouvellement</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {contracts.map((contract) => (
                        <tr key={contract.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {contract.reference}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contract.type === 'TRANSPORT' ? 'Transport' :
                             contract.type === 'LOGISTICS' ? 'Logistique' :
                             contract.type === 'WAREHOUSING' ? 'Entreposage' :
                             contract.type === 'DISTRIBUTION' ? 'Distribution' : 'Autre'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(contract.start_date)}
                            {contract.end_date && ` - ${formatDate(contract.end_date)}`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {contract.renewal_date ? formatDate(contract.renewal_date) : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                contract.status === 'active' ? 'bg-green-100 text-green-800' :
                                contract.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                                contract.status === 'terminated' ? 'bg-red-100 text-red-800' :
                                contract.status === 'pending_renewal' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {contract.status === 'active' ? 'Actif' :
                               contract.status === 'draft' ? 'Brouillon' :
                               contract.status === 'expired' ? 'Expiré' :
                               contract.status === 'terminated' ? 'Résilié' :
                               contract.status === 'pending_renewal' ? 'En attente de renouvellement' : 
                               contract.status}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-indigo-600 hover:text-indigo-900">
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
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                            <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Télécharger
                            </a>
                            <a href="#" className="text-indigo-600 hover:text-indigo-900">
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

export default PartnerDetails;
