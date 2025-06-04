import React, { useState } from 'react';
import { CalendarIcon, MapIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Planning component - AI-enhanced route planning and optimization
const Planning: React.FC = () => {
  // Sample data for planning
  const [routes, setRoutes] = useState([
    { id: 'RT-001', name: 'Tournée Nord', driver: 'Martin Dupont', vehicle: 'TR-7845', stops: 8, status: 'Planifiée', startTime: '08:00', endTime: '16:30', distance: '245 km', load: '85%' },
    { id: 'RT-002', name: 'Tournée Sud', driver: 'Sophie Martin', vehicle: 'TR-6532', stops: 12, status: 'En cours', startTime: '07:30', endTime: '17:00', distance: '320 km', load: '92%' },
    { id: 'RT-003', name: 'Tournée Est', driver: 'Jean Leroy', vehicle: 'TR-9012', stops: 6, status: 'Terminée', startTime: '06:00', endTime: '14:15', distance: '180 km', load: '78%' },
    { id: 'RT-004', name: 'Tournée Ouest', driver: 'Lucie Blanc', vehicle: 'TR-5421', stops: 10, status: 'Planifiée', startTime: '09:00', endTime: '18:00', distance: '290 km', load: '65%' },
  ]);

  // AI optimization scenarios
  const optimizationScenarios = [
    { id: 1, name: 'Optimisation coûts', description: 'Réduction des coûts de 12%', impact: { cost: '-12%', co2: '-8%', service: '-2%' } },
    { id: 2, name: 'Optimisation service', description: 'Amélioration du niveau de service de 15%', impact: { cost: '+5%', co2: '+3%', service: '+15%' } },
    { id: 3, name: 'Optimisation CO2', description: 'Réduction des émissions de 18%', impact: { cost: '+2%', co2: '-18%', service: '-4%' } },
    { id: 4, name: 'Équilibré', description: 'Compromis optimal entre coûts, service et CO2', impact: { cost: '-5%', co2: '-10%', service: '+8%' } },
  ];

  // Selected optimization scenario
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planification</h1>
              <p className="mt-1 text-sm text-gray-500">
                Planifiez et optimisez vos tournées avec l'aide de l'IA
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Nouvelle tournée
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Routes list */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tournées planifiées</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  Filtrer
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Actualiser
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tournée
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chauffeur / Véhicule
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horaires
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Détails
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routes.map((route) => (
                    <tr key={route.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-md">
                            <MapIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{route.name}</div>
                            <div className="text-sm text-gray-500">{route.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{route.driver}</div>
                        <div className="text-sm text-gray-500">{route.vehicle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{route.startTime} - {route.endTime}</div>
                        <div className="text-sm text-gray-500">{route.distance}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          route.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                          route.status === 'Planifiée' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {route.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {route.stops} arrêts • {route.load} chargé
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

        {/* Right column - AI Optimization */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Optimisation IA
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Scénarios d'optimisation multi-objectifs
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {optimizationScenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className={`border rounded-md p-4 cursor-pointer transition-all ${
                      selectedScenario === scenario.id 
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-900">{scenario.name}</h4>
                      <div className="flex space-x-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          scenario.impact.cost.startsWith('-') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {scenario.impact.cost}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          scenario.impact.co2.startsWith('-') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {scenario.impact.co2}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          scenario.impact.service.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {scenario.impact.service}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{scenario.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={selectedScenario === null}
                >
                  Appliquer l'optimisation
                </button>
              </div>
            </div>
          </div>

          {/* Map preview */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Aperçu cartographique</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Carte des tournées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
