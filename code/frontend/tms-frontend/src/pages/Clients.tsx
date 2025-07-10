import React, { useState, useEffect } from 'react';
import { fetchPartners, Partner as ApiPartner, PartnersApiResponse } from '../services/partnersApi';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<ApiPartner[]>([]);
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
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();
  
  // Fetch clients (partners with type 'customer')
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: PartnersApiResponse | ApiPartner[] = await fetchPartners({
          search,
          type: 'customer', // Filter only customers
          status: statusFilter,
          page: pagination.page,
          limit: pagination.limit,
        });
        if (response && Array.isArray((response as PartnersApiResponse).data)) {
          const r = response as PartnersApiResponse;
          setClients(r.data);
          setPagination((prev) => ({
            ...prev,
            ...r.pagination,
          }));
        } else if (Array.isArray(response)) {
          setClients(response);
          setPagination((prev) => ({
            ...prev,
            total: response.length,
            totalPages: Math.ceil(response.length / prev.limit),
          }));
        } else {
          setClients([]);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des clients');
        setLoading(false);
      }
    };
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, pagination.page, pagination.limit]);
  
  const handleCreateClient = () => {
    navigate('/clients/new');
  };
  
  const handleViewClient = (id: number) => {
    navigate(`/clients/${id}`);
  };
  
  const handleEditClient = (id: number) => {
    navigate(`/clients/${id}/edit`);
  };
  
  const handleDeleteClient = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      // In a real app, this would be an API call
      console.log(`Delete client ${id}`);
      
      // Update local state
      setClients(clients.filter(client => client.id !== id));
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
    setStatusFilter('');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Clients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des clients et de leurs informations
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateClient}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau client
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
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Rechercher par nom, numéro SIRET, etc."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="sr-only">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FunnelIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Filtrer
                </button>
                
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      
      {/* Clients list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-6 py-4 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span>Chargement des clients...</span>
            </li>
          ) : clients.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              Aucun client trouvé
            </li>
          ) : (
            clients.map((client) => (
              <li
                key={client.id ?? client.name}
                className={`px-6 py-4 ${client.id ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-100 cursor-not-allowed'}`}
                onClick={() => {
                  if (client.id !== undefined && client.id !== null) handleViewClient(client.id);
                }}
                aria-disabled={client.id === undefined || client.id === null}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {client.logo_url ? (
                        <img className="h-12 w-12 rounded-full" src={client.logo_url} alt={client.name} />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">
                        {client.legal_form && `${client.legal_form} • `}
                        {client.registration_number && `SIRET: ${client.registration_number}`}
                      </div>
                      <div className="mt-1 flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(client.status)}`}
                        >
                          {getStatusLabel(client.status)}
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Client
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 relative">
                    <Menu as="div" className="relative inline-block text-left">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
                                    if (client.id !== undefined && client.id !== null) handleViewClient(client.id);
                                  }}
                                  disabled={client.id === undefined || client.id === null}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } block w-full text-left px-4 py-2 text-sm${client.id === undefined || client.id === null ? ' opacity-50 cursor-not-allowed' : ''}`}
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
                                    if (client.id !== undefined && client.id !== null) handleEditClient(client.id);
                                  }}
                                  disabled={client.id === undefined || client.id === null}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } block w-full text-left px-4 py-2 text-sm${client.id === undefined || client.id === null ? ' opacity-50 cursor-not-allowed' : ''}`}
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
                                    if (client.id !== undefined && client.id !== null) handleDeleteClient(client.id);
                                  }}
                                  disabled={client.id === undefined || client.id === null}
                                  className={`${
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                  } block w-full text-left px-4 py-2 text-sm text-red-600${client.id === undefined || client.id === null ? ' opacity-50 cursor-not-allowed' : ''}`}
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
                  let pageNum: number;
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
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

export default Clients;

