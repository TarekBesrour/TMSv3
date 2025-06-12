import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  TruckIcon, 
  OfficeBuildingIcon, 
  SearchIcon,
  FilterIcon,
  PlusIcon,
  DotsVerticalIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
  status: 'active' | 'inactive' | 'pending' | 'blocked';
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();
  
  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          const mockPartners: Partner[] = [
            { id: 1, name: 'Acme Logistics', type: 'CLIENT', legal_form: 'SAS', registration_number: '123456789', vat_number: 'FR12345678901', website: 'https://acme-logistics.com', logo_url: null, status: 'active' },
            { id: 2, name: 'FastTruck Transport', type: 'CARRIER', legal_form: 'SARL', registration_number: '987654321', vat_number: 'FR98765432109', website: 'https://fasttruck.com', logo_url: null, status: 'active' },
            { id: 3, name: 'Global Shipping Co', type: 'CARRIER', legal_form: 'SA', registration_number: '456789123', vat_number: 'FR45678912345', website: 'https://globalshipping.com', logo_url: null, status: 'active' },
            { id: 4, name: 'Tech Supplies Inc', type: 'SUPPLIER', legal_form: 'Inc', registration_number: '789123456', vat_number: 'US78912345678', website: 'https://techsupplies.com', logo_url: null, status: 'active' },
            { id: 5, name: 'European Distributors', type: 'CLIENT', legal_form: 'GmbH', registration_number: '321654987', vat_number: 'DE32165498765', website: 'https://eurodist.com', logo_url: null, status: 'inactive' },
          ];
          
          // Apply filters
          let filteredPartners = mockPartners;
          
          if (search) {
            const searchLower = search.toLowerCase();
            filteredPartners = filteredPartners.filter(partner => 
              partner.name.toLowerCase().includes(searchLower) ||
              (partner.registration_number && partner.registration_number.toLowerCase().includes(searchLower)) ||
              (partner.vat_number && partner.vat_number.toLowerCase().includes(searchLower))
            );
          }
          
          if (typeFilter) {
            filteredPartners = filteredPartners.filter(partner => partner.type === typeFilter);
          }
          
          if (statusFilter) {
            filteredPartners = filteredPartners.filter(partner => partner.status === statusFilter);
          }
          
          setPartners(filteredPartners);
          setPagination({
            page: 1,
            limit: 10,
            total: filteredPartners.length,
            totalPages: Math.ceil(filteredPartners.length / 10)
          });
          setLoading(false);
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des partenaires');
        setLoading(false);
      }
    };
    
    fetchPartners();
  }, [search, typeFilter, statusFilter]);
  
  const handleCreatePartner = () => {
    navigate('/partners/create');
  };
  
  const handleViewPartner = (id: number) => {
    navigate(`/partners/${id}`);
  };
  
  const handleEditPartner = (id: number) => {
    navigate(`/partners/${id}/edit`);
  };
  
  const handleDeletePartner = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      // In a real app, this would be an API call
      console.log(`Delete partner ${id}`);
      
      // Update local state
      setPartners(partners.filter(partner => partner.id !== id));
    }
  };
  
  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      case 'CARRIER':
        return <TruckIcon className="h-5 w-5 text-green-500" />;
      case 'SUPPLIER':
        return <OfficeBuildingIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <UserGroupIcon className="h-5 w-5 text-gray-500" />;
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
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };
  
  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Partenaires
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreatePartner}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau partenaire
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Filtres
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Rechercher
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Rechercher par nom, numéro SIRET, etc."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="type" className="sr-only">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="CLIENT">Client</option>
                  <option value="CARRIER">Transporteur</option>
                  <option value="SUPPLIER">Fournisseur</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="sr-only">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                  <option value="blocked">Bloqué</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FilterIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Filtrer
                </button>
                
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Partners list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-6 py-4 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
              <span>Chargement des partenaires...</span>
            </li>
          ) : partners.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Aucun partenaire trouvé
            </li>
          ) : (
            partners.map((partner) => (
              <li key={partner.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewPartner(partner.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {partner.logo_url ? (
                        <img className="h-12 w-12 rounded-full" src={partner.logo_url} alt={partner.name} />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          {getPartnerTypeIcon(partner.type)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                      <div className="text-sm text-gray-500">
                        {partner.legal_form && `${partner.legal_form} • `}
                        {partner.registration_number && `SIRET: ${partner.registration_number}`}
                      </div>
                      <div className="mt-1 flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(partner.status)}`}
                        >
                          {getStatusLabel(partner.status)}
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {getPartnerTypeLabel(partner.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 relative">
                    <Menu as="div" className="relative inline-block text-left">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewPartner(partner.id);
                                  }}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } block w-full text-left px-4 py-2 text-sm`}
                                >
                                  Voir les détails
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPartner(partner.id);
                                  }}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } block w-full text-left px-4 py-2 text-sm`}
                                >
                                  Modifier
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePartner(partner.id);
                                  }}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } block w-full text-left px-4 py-2 text-sm text-red-600`}
                                >
                                  Supprimer
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Précédent
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
              disabled={pagination.page === pagination.totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de la page <span className="font-medium">{pagination.page}</span> sur{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page === pagination.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
