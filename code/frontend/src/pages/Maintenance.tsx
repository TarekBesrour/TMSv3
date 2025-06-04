import React, { useState } from 'react';
import { WrenchScrewdriverIcon, CalendarIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Maintenance component - AI-powered predictive maintenance
const Maintenance: React.FC = () => {
  // Sample data for maintenance operations
  const [maintenanceOps, setMaintenanceOps] = useState([
    { id: 'MAINT-4582', vehicle: 'TR-7845', type: 'Préventive', status: 'Planifiée', priority: 'Normale', date: '15/06/2025', duration: '4h', technician: 'Pierre Dubois', parts: ['Filtre à huile', 'Huile moteur', 'Filtre à air'] },
    { id: 'MAINT-4581', vehicle: 'TR-8754', type: 'Corrective', status: 'En cours', priority: 'Haute', date: '29/05/2025', duration: '8h', technician: 'Marc Lefèvre', parts: ['Plaquettes de frein', 'Disques de frein', 'Liquide de frein'] },
    { id: 'MAINT-4580', vehicle: 'TR-6532', type: 'Préventive', status: 'Planifiée', priority: 'Normale', date: '02/06/2025', duration: '2h', technician: 'Pierre Dubois', parts: ['Filtre à carburant', 'Liquide de refroidissement'] },
    { id: 'MAINT-4579', vehicle: 'TR-9012', type: 'Prédictive', status: 'Planifiée', priority: 'Moyenne', date: '05/06/2025', duration: '3h', technician: 'Sophie Moreau', parts: ['Plaquettes de frein', 'Liquide de frein'] },
  ]);

  // AI-generated insights
  const insights = [
    { id: 1, text: 'Regrouper les maintenances de TR-7845 et TR-6532 pourrait économiser 2h de main d\'œuvre', impact: 'medium' },
    { id: 2, text: 'Anomalie détectée sur TR-9012: usure prématurée des plaquettes de frein, inspection approfondie recommandée', impact: 'high' },
    { id: 3, text: 'Prévision de stock insuffisant pour filtres à air d\'ici 2 semaines, commande recommandée', impact: 'medium' },
  ];

  // Maintenance statistics
  const stats = {
    completed: 24,
    planned: 8,
    inProgress: 1,
    predictive: 5,
    preventive: 18,
    corrective: 10,
    mtbf: 4500, // Mean Time Between Failures (hours)
    mttr: 3.2, // Mean Time To Repair (hours)
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maintenance Prédictive</h1>
              <p className="mt-1 text-sm text-gray-500">
                Planifiez et optimisez la maintenance avec l'IA
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nouvelle maintenance
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
            Insights IA - Maintenance Prédictive
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Maintenances totales</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completed + stats.planned + stats.inProgress}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex text-sm">
                <span className="flex-1 text-green-600">{stats.completed} terminées</span>
                <span className="flex-1 text-blue-600">{stats.planned} planifiées</span>
                <span className="flex-1 text-amber-600">{stats.inProgress} en cours</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Types de maintenance</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.predictive} prédictives</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex text-sm">
                <span className="flex-1 text-blue-600">{stats.preventive} préventives</span>
                <span className="flex-1 text-red-600">{stats.corrective} correctives</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">MTBF</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.mtbf} heures</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Temps moyen entre pannes
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">MTTR</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.mttr} heures</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Temps moyen de réparation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance operations table */}
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
                      Véhicule
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technicien
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maintenanceOps.map((op) => (
                    <tr key={op.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {op.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {op.vehicle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          op.type === 'Prédictive' ? 'bg-indigo-100 text-indigo-800' :
                          op.type === 'Préventive' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {op.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {op.date} ({op.duration})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          op.status === 'Terminée' ? 'bg-green-100 text-green-800' :
                          op.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {op.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          op.priority === 'Haute' ? 'bg-red-100 text-red-800' :
                          op.priority === 'Moyenne' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {op.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {op.technician}
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

      {/* Predictive maintenance visualization */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Analyse Prédictive</h3>
          <p className="mt-1 text-sm text-gray-500">
            Visualisation des prédictions de maintenance basées sur l'IA
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Prévision d'usure des composants</p>
            </div>
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Calendrier de maintenance optimisé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
