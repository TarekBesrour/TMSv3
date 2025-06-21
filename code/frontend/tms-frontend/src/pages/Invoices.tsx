import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CSVLink } from 'react-csv';

// Types
interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: string; // e.g., 'draft', 'sent', 'paid', 'overdue'
  notes?: string;
}

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<string>('issue_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          const mockInvoices: Invoice[] = [
            {
              id: '1',
              invoice_number: 'INV-2025-001',
              client_name: 'Client Alpha',
              total_amount: 1250.50,
              currency: 'EUR',
              issue_date: '2025-05-20',
              due_date: '2025-06-20',
              status: 'paid',
              notes: 'Facture pour services de transport de mai'
            },
            {
              id: '2',
              invoice_number: 'INV-2025-002',
              client_name: 'Client Beta',
              total_amount: 890.00,
              currency: 'EUR',
              issue_date: '2025-06-01',
              due_date: '2025-07-01',
              status: 'sent',
              notes: 'Facture pour expédition urgente'
            },
            {
              id: '3',
              invoice_number: 'INV-2025-003',
              client_name: 'Client Gamma',
              total_amount: 2100.75,
              currency: 'EUR',
              issue_date: '2025-06-10',
              due_date: '2025-07-10',
              status: 'draft',
              notes: 'Facture en cours de préparation'
            },
            {
              id: '4',
              invoice_number: 'INV-2025-004',
              client_name: 'Client Delta',
              total_amount: 550.00,
              currency: 'EUR',
              issue_date: '2025-05-01',
              due_date: '2025-05-31',
              status: 'overdue',
              notes: 'Facture en retard de paiement'
            },
          ];

          setInvoices(mockInvoices);
          setFilteredInvoices(mockInvoices);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des factures');
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...invoices];

    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(lowerSearchTerm) ||
        invoice.client_name.toLowerCase().includes(lowerSearchTerm) ||
        invoice.notes?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(invoice => invoice.status === filterStatus);
    }

    // Apply client filter
    if (filterClient !== 'all') {
      result = result.filter(invoice => invoice.client_name === filterClient);
    }

    // Apply start date filter
    if (filterStartDate) {
      result = result.filter(invoice => invoice.issue_date >= filterStartDate);
    }

    // Apply end date filter
    if (filterEndDate) {
      result = result.filter(invoice => invoice.issue_date <= filterEndDate);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'issue_date' || sortField === 'due_date') {
        comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      } else if (sortField === 'total_amount') {
        comparison = a.total_amount - b.total_amount;
      } else if (sortField === 'invoice_number' || sortField === 'client_name') {
        comparison = a[sortField].localeCompare(b[sortField]);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredInvoices(result);
  }, [invoices, searchTerm, filterStatus, filterClient, filterStartDate, filterEndDate, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/new');
  };

  const handleViewInvoice = (id: string) => {
    navigate(`/invoices/${id}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'draft': 'Brouillon',
      'sent': 'Envoyée',
      'paid': 'Payée',
      'overdue': 'En Retard',
      'contested': 'Contestée',
      'cancelled': 'Annulée',
    };
    return statusNames[status] || status;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(value);
  };

  // Calcul du résumé
  const totalFactures = filteredInvoices.length;
  const totalMontant = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const uniqueClients = Array.from(new Set(invoices.map(inv => inv.client_name)));

  // Action de suppression
  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Confirmer la suppression de cette facture ?')) return;
    // Appel API à ajouter ici
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Action de relance (placeholder)
  const handleRemindInvoice = (id: string) => {
    alert('Fonction de relance à implémenter');
  };

  // Préparation export CSV
  const csvHeaders = [
    { label: 'Numéro', key: 'invoice_number' },
    { label: 'Client', key: 'client_name' },
    { label: 'Montant', key: 'total_amount' },
    { label: 'Devise', key: 'currency' },
    { label: 'Date émission', key: 'issue_date' },
    { label: 'Date échéance', key: 'due_date' },
    { label: 'Statut', key: 'status' },
    { label: 'Notes', key: 'notes' }
  ];

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
            Factures Clients
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleCreateInvoice}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Résumé et actions */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-2 md:mb-0">
          <span className="font-semibold">Total factures :</span> {totalFactures} &nbsp;|
          <span className="font-semibold ml-2">Montant total :</span> {formatCurrency(totalMontant, 'EUR')}
        </div>
        <div className="flex gap-2">
          <CSVLink data={filteredInvoices} headers={csvHeaders} filename="factures.csv">
            <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Exporter CSV</button>
          </CSVLink>
        </div>
      </div>

      {/* Filters and search */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Rechercher une facture..."
          />
        </div>

        {/* Statut */}
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
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="overdue">En Retard</option>
            <option value="contested">Contestée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        {/* Client */}
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="client"
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">Tous</option>
            {uniqueClients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>

        {/* Date début */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            Date début
          </label>
          <input
            type="date"
            id="start-date"
            value={filterStartDate}
            onChange={e => setFilterStartDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>

        {/* Date fin */}
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            Date fin
          </label>
          <input
            type="date"
            id="end-date"
            value={filterEndDate}
            onChange={e => setFilterEndDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Invoices table */}
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
                      onClick={() => handleSort('invoice_number')}
                    >
                      <div className="flex items-center">
                        Numéro de Facture
                        {sortField === 'invoice_number' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('client_name')}
                    >
                      <div className="flex items-center">
                        Client
                        {sortField === 'client_name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('total_amount')}
                    >
                      <div className="flex items-center">
                        Montant Total
                        {sortField === 'total_amount' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('issue_date')}
                    >
                      <div className="flex items-center">
                        Date d'Émission
                        {sortField === 'issue_date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('due_date')}
                    >
                      <div className="flex items-center">
                        Date d'Échéance
                        {sortField === 'due_date' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
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
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.client_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(invoice.total_amount, invoice.currency)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(invoice.issue_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(invoice.due_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                          {getStatusName(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleRemindInvoice(invoice.id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          Relancer
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;