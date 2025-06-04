import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Dashboard component with AI-enhanced features
const Dashboard: React.FC = () => {
  // Sample data for dashboard
  const kpiData = [
    { name: 'Livraisons en cours', value: '124', change: '+12%', status: 'increase' },
    { name: 'Taux de livraison à l\'heure', value: '94.2%', change: '+2.1%', status: 'increase' },
    { name: 'Coût moyen par km', value: '0.87€', change: '-0.05€', status: 'decrease' },
    { name: 'Taux de remplissage', value: '82%', change: '+5%', status: 'increase' },
  ];

  const alerts = [
    { id: 1, title: 'Risque de retard détecté', description: 'Livraison #4582 - Embouteillage sur A1, délai estimé +45min', severity: 'high' },
    { id: 2, title: 'Maintenance préventive recommandée', description: 'Véhicule TR-7845 - Usure des plaquettes de frein détectée', severity: 'medium' },
    { id: 3, title: 'Pic de demande prévu', description: 'Augmentation de 30% des commandes prévue pour la semaine prochaine', severity: 'info' },
  ];

  const recommendations = [
    { id: 1, title: 'Optimisation des tournées', description: 'Regrouper les livraisons du secteur Nord-Est pourrait réduire les coûts de 12%', impact: 'high' },
    { id: 2, title: 'Ajustement des créneaux', description: 'Décaler les livraisons urbaines de 30min réduirait les temps d\'attente', impact: 'medium' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="mt-1 text-sm text-gray-500">
              Vue d'ensemble des opérations et insights IA
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="relative z-0 inline-flex shadow-sm rounded-md">
              <button
                type="button"
                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                Cette semaine
              </button>
              <button
                type="button"
                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                Ce mois
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{kpi.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{kpi.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className={`flex items-center text-sm ${
                  kpi.status === 'increase' 
                    ? 'text-green-600' 
                    : kpi.status === 'decrease' 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                }`}>
                  {kpi.status === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
                  ) : kpi.status === 'decrease' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center transform rotate-180" aria-hidden="true" />
                  ) : null}
                  <span className="ml-1">{kpi.change} vs période précédente</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column - Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-500" />
                Alertes IA
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Détection proactive des problèmes potentiels
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`rounded-md p-4 ${
                    alert.severity === 'high' 
                      ? 'bg-red-50 border border-red-200' 
                      : alert.severity === 'medium'
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon 
                          className={`h-5 w-5 ${
                            alert.severity === 'high' 
                              ? 'text-red-400' 
                              : alert.severity === 'medium'
                                ? 'text-amber-400'
                                : 'text-blue-400'
                          }`} 
                          aria-hidden="true" 
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          alert.severity === 'high' 
                            ? 'text-red-800' 
                            : alert.severity === 'medium'
                              ? 'text-amber-800'
                              : 'text-blue-800'
                        }`}>
                          {alert.title}
                        </h3>
                        <div className={`mt-2 text-sm ${
                          alert.severity === 'high' 
                            ? 'text-red-700' 
                            : alert.severity === 'medium'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                        }`}>
                          <p>{alert.description}</p>
                        </div>
                        <div className="mt-4">
                          <div className="-mx-2 -my-1.5 flex">
                            <button
                              type="button"
                              className={`px-2 py-1.5 rounded-md text-sm font-medium ${
                                alert.severity === 'high' 
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                  : alert.severity === 'medium'
                                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              Voir détails
                            </button>
                            <button
                              type="button"
                              className="ml-3 px-2 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100"
                            >
                              Ignorer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Recommendations and Activity */}
        <div className="lg:col-span-2">
          {/* Recommendations */}
          <div className="bg-white shadow rounded-lg mb-5">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Recommandations IA
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Suggestions d'optimisation basées sur l'analyse prédictive
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-md p-4 border border-indigo-100">
                    <div className="flex">
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-indigo-800 flex items-center">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                            rec.impact === 'high' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          } mr-2 text-xs`}>
                            {rec.impact === 'high' ? '+12%' : '+5%'}
                          </span>
                          {rec.title}
                        </h3>
                        <div className="mt-2 text-sm text-indigo-700">
                          <p>{rec.description}</p>
                        </div>
                        <div className="mt-4">
                          <div className="-mx-2 -my-1.5 flex">
                            <button
                              type="button"
                              className="px-2 py-1.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                            >
                              Appliquer
                            </button>
                            <button
                              type="button"
                              className="ml-3 px-2 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100"
                            >
                              Analyser
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity chart placeholder */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Activité opérationnelle</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vue d'ensemble des opérations en cours et prévisions
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Graphique d'activité et prévisions IA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
