import React, { useState } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Partners component - Partner management with AI-enhanced features
const Partners: React.FC = () => {
  // Sample data for partners
  const [partners, setPartners] = useState([
    { id: 'PART-001', name: 'Acme Corp', type: 'Client', category: 'Industrie', contact: 'John Smith', email: 'j.smith@acmecorp.com', phone: '+33 1 23 45 67 89', status: 'Actif', rating: 4.8, orders: 24, revenue: '125 000 €' },
    { id: 'PART-002', name: 'TransExpress', type: 'Transporteur', category: 'Transport routier', contact: 'Marie Dupont', email: 'm.dupont@transexpress.com', phone: '+33 1 23 45 67 90', status: 'Actif', rating: 4.2, orders: 56, revenue: '78 000 €' },
    { id: 'PART-003', name: 'EcoFarm', type: 'Client', category: 'Agriculture', contact: 'Pierre Martin', email: 'p.martin@ecofarm.com', phone: '+33 1 23 45 67 91', status: 'Actif', rating: 4.5, orders: 12, revenue: '45 000 €' },
    { id: 'PART-004', name: 'MediHealth', type: 'Client', category: 'Santé', contact: 'Sophie Bernard', email: 's.bernard@medihealth.com', phone: '+33 1 23 45 67 92', status: 'Inactif', rating: 3.9, orders: 8, revenue: '32 000 €' },
    { id: 'PART-005', name: 'SpeedLogistics', type: 'Transporteur', category: 'Transport express', contact: 'Thomas Leroy', email: 't.leroy@speedlogistics.com', phone: '+33 1 23 45 67 93', status: 'Actif', rating: 4.0, orders: 38, revenue: '62 000 €' },
  ]);

  // AI-generated insights
  const insights = [
    { id: 1, text: 'Acme Corp a augmenté son volume de commandes de 15% ce trimestre, opportunité de négociation tarifaire', impact: 'high' },
    { id: 2, text: 'TransExpress montre des signes de surcharge, risque de retards dans les prochaines semaines', impact: 'medium' },
    { id: 3, text: 'MediHealth pourrait être réactivé avec une offre personnalisée basée sur leurs besoins saisonniers', impact: 'medium' },
  ];

  // Partner statistics
  const stats = {
    totalPartners: 42,
    activeClients: 28,
    activeCarriers: 14,
    newThisMonth: 3,
    avgRating: 4.3,
    topCategory: 'Industrie'
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos clients et transporteurs avec insights IA
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nouveau partenaire
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
            Insights IA - Relations Partenaires
          </h2>
          <ul className="mt-2 space-y-2">
            {insights.map((insight) => (
              <li key={insight.id} className="text-sm text-indigo-700 flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  insight.impact === 'high' ? 'bg-green-500' :
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
                <UserGroupIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Partenaires totaux</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalPartners}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex text-sm">
                <span className="flex-1 text-blue-600">{stats.activeClients} clients</span>
                <span className="flex-1 text-green-600">{stats.activeCarriers} transporteurs</span>
                <span className="flex-1 text-indigo-600">+{stats.newThisMonth} ce mois</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Note moyenne</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.avgRating}/5</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-${star <= Math.floor(stats.avgRating) ? 'yellow' : 'gray'}-400`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Catégorie principale</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.topCategory}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                32% des partenaires
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher un partenaire..."
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option>Tous les types</option>
              <option>Client</option>
              <option>Transporteur</option>
            </select>
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

      {/* Partners table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partenaire
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activité
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partners.map((partner) => (
                    <tr key={partner.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">{partner.name.substring(0, 2)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                            <div className="text-sm text-gray-500">{partner.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          partner.type === 'Client' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {partner.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{partner.contact}</div>
                        <div className="text-sm text-gray-500">{partner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          partner.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span>{partner.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{partner.orders} commandes</div>
                        <div>{partner.revenue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Détails
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

      {/* Partner relationship analysis */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Analyse des Relations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analyse IA des relations partenaires et recommandations
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Analyse de satisfaction</p>
            </div>
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Opportunités de développement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
