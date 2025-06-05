import React, { useState } from 'react';
import { TruckIcon, WrenchScrewdriverIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Fleet component - Fleet management with AI-enhanced features
const Fleet: React.FC = () => {
  // Sample data for vehicles
  const [vehicles, setVehicles] = useState([
    { id: 'TR-7845', type: 'Camion 19T', brand: 'Volvo', model: 'FH16', status: 'En service', driver: 'Martin Dupont', location: 'En route - A6', health: 92, nextMaintenance: '15/06/2025', alerts: 1 },
    { id: 'TR-6532', type: 'Camion 12T', brand: 'Mercedes', model: 'Actros', status: 'En service', driver: 'Sophie Martin', location: 'En route - A7', health: 87, nextMaintenance: '02/06/2025', alerts: 0 },
    { id: 'TR-9012', type: 'Camion 7.5T', brand: 'Renault', model: 'D Wide', status: 'En service', driver: 'Jean Leroy', location: 'En route - A8', health: 76, nextMaintenance: '05/06/2025', alerts: 2 },
    { id: 'TR-5421', type: 'Utilitaire 3.5T', brand: 'Iveco', model: 'Daily', status: 'Au dépôt', driver: 'Lucie Blanc', location: 'Dépôt Paris', health: 95, nextMaintenance: '20/07/2025', alerts: 0 },
    { id: 'TR-8754', type: 'Camion 19T', brand: 'Scania', model: 'R450', status: 'Maintenance', driver: 'Non assigné', location: 'Garage Lyon', health: 65, nextMaintenance: 'En cours', alerts: 3 },
  ]);

  // AI-generated insights
  const insights = [
    { id: 1, vehicleId: 'TR-9012', type: 'maintenance', message: 'Usure des plaquettes de frein détectée, maintenance préventive recommandée dans les 2 semaines', severity: 'medium' },
    { id: 2, vehicleId: 'TR-9012', type: 'fuel', message: 'Consommation de carburant 12% supérieure à la moyenne, vérification recommandée', severity: 'low' },
    { id: 3, vehicleId: 'TR-8754', type: 'part', message: 'Remplacement du filtre à air nécessaire', severity: 'high' },
    { id: 4, vehicleId: 'TR-8754', type: 'engine', message: 'Anomalie détectée dans les performances du moteur', severity: 'high' },
    { id: 5, vehicleId: 'TR-8754', type: 'diagnostic', message: 'Diagnostic complet recommandé avant remise en service', severity: 'medium' },
    { id: 6, vehicleId: 'TR-7845', type: 'tire', message: 'Pression des pneus arrière droits inférieure de 10% à la valeur recommandée', severity: 'low' },
  ];

  // Filter insights by vehicle
  const getVehicleInsights = (vehicleId: string) => {
    return insights.filter(insight => insight.vehicleId === vehicleId);
  };

  // Fleet statistics
  const fleetStats = {
    total: 12,
    active: 8,
    maintenance: 3,
    idle: 1,
    avgHealth: 83,
    avgAge: 3.2,
    fuelEfficiency: 28.5,
    co2: 102.4
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion de Flotte</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez votre flotte avec maintenance prédictive IA
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ajouter un véhicule
            </button>
          </div>
        </div>
      </div>

      {/* Fleet stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <TruckIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Flotte totale</dt>
                  <dd className="text-lg font-medium text-gray-900">{fleetStats.total} véhicules</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex text-sm">
                <span className="flex-1 text-green-600">{fleetStats.active} actifs</span>
                <span className="flex-1 text-yellow-600">{fleetStats.maintenance} en maintenance</span>
                <span className="flex-1 text-gray-500">{fleetStats.idle} inactifs</span>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Santé moyenne</dt>
                  <dd className="text-lg font-medium text-gray-900">{fleetStats.avgHealth}%</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div style={{ width: `${fleetStats.avgHealth}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                </div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Âge moyen</dt>
                  <dd className="text-lg font-medium text-gray-900">{fleetStats.avgAge} ans</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Prochaine acquisition prévue: Août 2025
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Efficacité carburant</dt>
                  <dd className="text-lg font-medium text-gray-900">{fleetStats.fuelEfficiency} L/100km</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Émissions CO2: {fleetStats.co2} g/km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => {
            const vehicleInsights = getVehicleInsights(vehicle.id);
            return (
              <li key={vehicle.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-md flex items-center justify-center ${
                          vehicle.status === 'En service' ? 'bg-green-100' :
                          vehicle.status === 'Maintenance' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <TruckIcon className={`h-6 w-6 ${
                            vehicle.status === 'En service' ? 'text-green-600' :
                            vehicle.status === 'Maintenance' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{vehicle.id}</h3>
                          {vehicle.alerts > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {vehicle.alerts} alertes
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.brand} {vehicle.model} • {vehicle.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-gray-900 font-medium">{vehicle.status}</div>
                      <div className="text-sm text-gray-500">{vehicle.location}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {vehicle.driver}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <WrenchScrewdriverIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Prochaine maintenance: {vehicle.nextMaintenance}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <div className="flex items-center">
                        <span className="mr-2">Santé:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              vehicle.health >= 90 ? 'bg-green-500' :
                              vehicle.health >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${vehicle.health}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{vehicle.health}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle insights */}
                  {vehicleInsights.length > 0 && (
                    <div className="mt-4 bg-amber-50 rounded-md p-3">
                      <h4 className="text-sm font-medium text-amber-800">Alertes IA de maintenance prédictive:</h4>
                      <ul className="mt-2 space-y-1">
                        {vehicleInsights.map((insight) => (
                          <li key={insight.id} className="text-sm text-amber-700 flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              insight.severity === 'high' ? 'bg-red-500' :
                              insight.severity === 'medium' ? 'bg-amber-500' :
                              'bg-yellow-500'
                            }`}></span>
                            {insight.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Détails
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Maintenance
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Localiser
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Fleet map */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Carte de la flotte</h3>
          <p className="mt-1 text-sm text-gray-500">
            Localisation en temps réel et statut des véhicules
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-96 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Carte de localisation des véhicules</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fleet;
