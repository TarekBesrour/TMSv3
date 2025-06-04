import React, { useState } from 'react';
import { CurrencyDollarIcon, DocumentTextIcon, ArrowPathIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Billing component - AI-enhanced billing and invoicing
const Billing: React.FC = () => {
  // Sample data for invoices
  const [invoices, setInvoices] = useState([
    { id: 'INV-2025-0124', client: 'Acme Corp', amount: 12450.80, status: 'Payée', date: '15/05/2025', dueDate: '14/06/2025', paymentDate: '10/06/2025', type: 'Client' },
    { id: 'INV-2025-0123', client: 'EcoFarm', amount: 4580.50, status: 'En attente', date: '12/05/2025', dueDate: '11/06/2025', paymentDate: null, type: 'Client' },
    { id: 'INV-2025-0122', client: 'TechSolutions', amount: 8750.25, status: 'En retard', date: '28/04/2025', dueDate: '28/05/2025', paymentDate: null, type: 'Client' },
    { id: 'INV-2025-0121', client: 'MediHealth', amount: 3250.00, status: 'Payée', date: '20/04/2025', dueDate: '20/05/2025', paymentDate: '15/05/2025', type: 'Client' },
    { id: 'SUPP-2025-0058', client: 'TransExpress', amount: 8450.75, status: 'À vérifier', date: '10/05/2025', dueDate: '09/06/2025', paymentDate: null, type: 'Fournisseur' },
    { id: 'SUPP-2025-0057', client: 'SpeedLogistics', amount: 6320.40, status: 'Validée', date: '05/05/2025', dueDate: '04/06/2025', paymentDate: null, type: 'Fournisseur' },
  ]);

  // AI-generated insights
  const insights = [
    { id: 1, text: 'Anomalie détectée sur la facture SUPP-2025-0058: tarification non conforme au contrat (-12%)', impact: 'high' },
    { id: 2, text: 'TechSolutions présente un retard de paiement récurrent, recommandation de contact proactif', impact: 'medium' },
    { id: 3, text: 'Opportunité d\'optimisation fiscale identifiée: regroupement des factures EcoFarm', impact: 'medium' },
  ];

  // Billing statistics
  const stats = {
    totalInvoiced: 29031.55,
    totalPaid: 15700.80,
    totalPending: 4580.50,
    totalOverdue: 8750.25,
    avgPaymentTime: 22,
    supplierValidation: 14771.15
  };

  // Filter state
  const [filterType, setFilterType] = useState('all');

  // Filtered invoices
  const filteredInvoices = filterType === 'all' 
    ? invoices 
    : invoices.filter(invoice => 
        filterType === 'client' 
          ? invoice.type === 'Client' 
          : invoice.type === 'Fournisseur'
      );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestion intelligente des factures clients et fournisseurs
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nouvelle facture
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <h2 className="text-sm font-medium text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Insights IA - Facturation
          </h2>
          <ul className="mt-2 space-y-2">
            {insights.map((insight) => (
              <li key={insight.id} className="text-sm text-indigo-700 flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  insight.impact === 'high' ? 'bg-red-500' :
                  insight.impact === 'medium' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`}></span>
                {insight.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total facturé (clients)</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalInvoiced.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex text-sm">
                <span className="flex-1 text-green-600">{stats.totalPaid.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} payé</span>
                <span className="flex-1 text-amber-600">{stats.totalPending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} en attente</span>
                <span className="flex-1 text-red-600">{stats.totalOverdue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} en retard</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Factures fournisseurs</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.supplierValidation.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                6 factures à traiter
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Délai moyen de paiement</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.avgPaymentTime} jours</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Objectif: 30 jours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm max-w-lg">
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher une facture..."
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <div className="relative inline-block text-left">
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="client">Factures clients</option>
                <option value="supplier">Factures fournisseurs</option>
              </select>
            </div>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filtres
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Actualiser
            </button>
          </div>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client/Fournisseur
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.type === 'Client' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {invoice.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'Payée' || invoice.status === 'Validée' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'À vérifier' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Voir
                        </a>
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Éditer
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Billing analytics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Analyse de Facturation</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analyse des tendances et prévisions de trésorerie
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Tendances de facturation</p>
            </div>
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Prévisions de trésorerie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
