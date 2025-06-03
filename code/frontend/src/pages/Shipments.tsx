import React, { useState } from 'react';
import { TruckIcon, MapPinIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Shipments component - Shipment tracking with AI-enhanced features
const Shipments: React.FC = () => {
  // Sample data for shipments
  const [shipments, setShipments] = useState([
    { id: 'SHP-7845', order: 'CMD-4582', customer: 'Acme Corp', origin: 'Paris', destination: 'Lyon', status: 'En transit', progress: 65, eta: '15:30', driver: 'Martin Dupont', vehicle: 'TR-7845', delay: null },
    { id: 'SHP-7844', order: 'CMD-4579', customer: 'EcoFarm', origin: 'Bordeaux', destination: 'Toulouse', status: 'Livré', progress: 100, eta: 'Livré à 14:15', driver: 'Sophie Martin', vehicle: 'TR-6532', delay: null },
    { id: 'SHP-7843', order: 'CMD-4581', customer: 'TechSolutions', origin: 'Marseille', destination: 'Nice', status: 'En transit', progress: 30, eta: '17:45', driver: 'Jean Leroy', vehicle: 'TR-9012', delay: '+15 min' },
    { id: 'SHP-7842', order: 'CMD-4578', customer: 'MediHealth', origin: 'Lyon', destination: 'Grenoble', status: 'Chargement', progress: 10, eta: '18:30', driver: 'Lucie Blanc', vehicle: 'TR-5421', delay: null },
  ]);

  // AI-generated alerts
  const alerts = [
    { id: 1, shipmentId: 'SHP-7843', type: 'delay', message: 'Retard de 15 minutes prévu en raison du trafic sur l\'A8', severity: 'medium' },
    { id: 2, shipmentId: 'SHP-7845', type: 'weather', message: 'Risque de pluie à l\'arrivée, prévoir une zone de déchargement couverte', severity: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Suivi des Expéditions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Suivez vos expéditions en temps réel avec prévisions IA
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher une expédition..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts section */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-amber-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Alertes IA
          </h2>
          <ul className="mt-2 space-y-1">
            {alerts.map((alert) => (
              <li key={alert.id} className="text-sm text-amber-700 flex items-center">
                <span className="inline-block w-1 h-1 rounded-full bg-amber-500 mr-2"></span>
                <span className="font-medium">{alert.shipmentId}:</span> {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Shipments cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shipments.map((shipment) => (
          <div key={shipment.id} className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${
            shipment.status === 'Livré' ? 'border-green-500' :
            shipment.status === 'En transit' ? 'border-blue-500' :
            'border-yellow-500'
          }`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{shipment.id}</h3>
                  <p className="text-sm text-gray-500">{shipment.order}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  shipment.status === 'Livré' ? 'bg-green-100 text-green-800' :
                  shipment.status === 'En transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {shipment.status}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>{shipment.origin} → {shipment.destination}</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>ETA: {shipment.eta}</span>
                  {shipment.delay && (
                    <span className="ml-2 text-red-600">{shipment.delay}</span>
                  )}
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <TruckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>{shipment.vehicle} • {shipment.driver}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        Progression
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {shipment.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div style={{ width: `${shipment.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Détails
                </button>
                {shipment.status !== 'Livré' && (
                  <button
                    type="button"
                    className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Suivre
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map view */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Carte de suivi en temps réel</h3>
          <p className="mt-1 text-sm text-gray-500">
            Visualisez la position de vos expéditions et les prévisions de trafic
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-96 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Carte de suivi des expéditions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipments;
