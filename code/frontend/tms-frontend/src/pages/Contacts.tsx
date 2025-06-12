import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  SortAscendingIcon,
  ExclamationIcon,
  TruckIcon,
  OfficeBuildingIcon,
  UserGroupIcon
} from '@heroicons/react/outline';

// Types
interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  is_primary: boolean;
  partner_id: number;
}

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterPartnerType, setFilterPartnerType] = useState<string>('all');
  const [filterIsPrimary, setFilterIsPrimary] = useState<boolean | null>(null);
  
  // Sorting
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          // Mock contacts data
          const mockContacts: Contact[] = [
            {
              id: 1,
              name: 'Jean Dupont',
              email: 'jean.dupont@acme-logistics.com',
              phone: '+33 6 12 34 56 78',
              position: 'Directeur Logistique',
              is_primary: true,
              partner_id: 1 // Acme Logistics (CLIENT)
            },
            {
              id: 2,
              name: 'Marie Martin',
              email: 'marie.martin@acme-logistics.com',
              phone: '+33 6 23 45 67 89',
              position: 'Responsable Transport',
              is_primary: false,
              partner_id: 1 // Acme Logistics (CLIENT)
            },
            {
              id: 3,
              name: 'Pierre Durand',
              email: 'pierre.durand@fastfreight.com',
              phone: '+33 6 34 56 78 90',
              position: 'Directeur Commercial',
              is_primary: true,
              partner_id: 2 // Fast Freight (CARRIER)
            },
            {
              id: 4,
              name: 'Sophie Lefebvre',
              email: 'sophie.lefebvre@fastfreight.com',
              phone: '+33 6 45 67 89 01',
              position: 'Planificateur',
              is_primary: false,
              partner_id: 2 // Fast Freight (CARRIER)
            },
            {
              id: 5,
              name: 'Thomas Bernard',
              email: 'thomas.bernard@globalsupply.com',
              phone: '+33 6 56 78 90 12',
              position: 'Responsable Achats',
              is_primary: true,
              partner_id: 3 // Global Supply (SUPPLIER)
            }
          ];
          
          setContacts(mockContacts);
          setFilteredContacts(mockContacts);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des contacts');
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...contacts];
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(contact => 
        contact.name.toLowerCase().includes(lowerSearchTerm) ||
        contact.email.toLowerCase().includes(lowerSearchTerm) ||
        contact.phone.toLowerCase().includes(lowerSearchTerm) ||
        contact.position.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply partner type filter
    if (filterPartnerType !== 'all') {
      // In a real app, we would have the partner type information
      // For now, we'll simulate with the partner_id
      if (filterPartnerType === 'client') {
        result = result.filter(contact => contact.partner_id === 1);
      } else if (filterPartnerType === 'carrier') {
        result = result.filter(contact => contact.partner_id === 2);
      } else if (filterPartnerType === 'supplier') {
        result = result.filter(contact => contact.partner_id === 3);
      }
    }
    
    // Apply primary contact filter
    if (filterIsPrimary !== null) {
      result = result.filter(contact => contact.is_primary === filterIsPrimary);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === 'position') {
        comparison = a.position.localeCompare(b.position);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredContacts(result);
  }, [contacts, searchTerm, filterPartnerType, filterIsPrimary, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCreateContact = () => {
    navigate('/contacts/new');
  };
  
  const handleViewContact = (id: number) => {
    navigate(`/contacts/${id}`);
  };
  
  const getPartnerTypeIcon = (partnerId: number) => {
    // In a real app, we would have the partner type information
    // For now, we'll simulate with the partner_id
    if (partnerId === 1) {
      return <UserGroupIcon className="h-5 w-5 text-blue-500" title="Client" />;
    } else if (partnerId === 2) {
      return <TruckIcon className="h-5 w-5 text-green-500" title="Transporteur" />;
    } else if (partnerId === 3) {
      return <OfficeBuildingIcon className="h-5 w-5 text-purple-500" title="Fournisseur" />;
    }
    
    return null;
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
            Contacts
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateContact}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau contact
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
              placeholder="Rechercher un contact..."
            />
          </div>
          
          {/* Partner type filter */}
          <div>
            <label htmlFor="partner-type" className="block text-sm font-medium text-gray-700">
              Type de partenaire
            </label>
            <select
              id="partner-type"
              value={filterPartnerType}
              onChange={(e) => setFilterPartnerType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="client">Clients</option>
              <option value="carrier">Transporteurs</option>
              <option value="supplier">Fournisseurs</option>
            </select>
          </div>
          
          {/* Primary contact filter */}
          <div>
            <label htmlFor="is-primary" className="block text-sm font-medium text-gray-700">
              Contact principal
            </label>
            <select
              id="is-primary"
              value={filterIsPrimary === null ? 'all' : filterIsPrimary ? 'yes' : 'no'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setFilterIsPrimary(null);
                } else if (e.target.value === 'yes') {
                  setFilterIsPrimary(true);
                } else {
                  setFilterIsPrimary(false);
                }
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Contacts table */}
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
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nom
                        {sortField === 'name' && (
                          <SortAscendingIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortField === 'email' && (
                          <SortAscendingIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Téléphone
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('position')}
                    >
                      <div className="flex items-center">
                        Fonction
                        {sortField === 'position' && (
                          <SortAscendingIcon 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'text-indigo-500' : 'text-gray-400'}`} 
                            aria-hidden="true" 
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Partenaire
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Principal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun contact trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr 
                        key={contact.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewContact(contact.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPartnerTypeIcon(contact.partner_id)}
                            <span className="ml-2 text-sm text-gray-900">
                              {contact.partner_id === 1 ? 'Acme Logistics' : 
                               contact.partner_id === 2 ? 'Fast Freight' : 
                               contact.partner_id === 3 ? 'Global Supply' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.is_primary ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Oui
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Non
                            </span>
                          )}
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

export default Contacts;
