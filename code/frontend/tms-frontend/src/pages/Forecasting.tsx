import React, { useState } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

// Forecasting component - AI-powered demand and resource forecasting
const Forecasting: React.FC = () => {
  // Sample data for forecasts
  const [forecastData, setForecastData] = useState({
    demandForecast: [
      { period: 'Juin 2025', volume: 1250, trend: '+8%', confidence: 92 },
      { period: 'Juillet 2025', volume: 1320, trend: '+5.6%', confidence: 89 },
      { period: 'Août 2025', volume: 1180, trend: '-10.6%', confidence: 85 },
      { period: 'Septembre 2025', volume: 1420, trend: '+20.3%', confidence: 82 },
      { period: 'Octobre 2025', volume: 1480, trend: '+4.2%', confidence: 78 },
      { period: 'Novembre 2025', volume: 1520, trend: '+2.7%', confidence: 75 },
    ],
    resourceForecast: [
      { resource: 'Camions 19T', current: 12, required: 14, gap: 2, period: 'Septembre 2025' },
      { resource: 'Camions 12T', current: 8, required: 8, gap: 0, period: 'Septembre 2025' },
      { resource: 'Chauffeurs', current: 24, required: 28, gap: 4, period: 'Septembre 2025' },
      { resource: 'Entrepôts (m²)', current: 5000, required: 5800, gap: 800, period: 'Octobre 2025' },
    ],
    seasonalFactors: [
      { factor: 'Vacances d\'été', impact: -15, period: 'Août 2025', confidence: 95 },
      { factor: 'Rentrée scolaire', impact: +18, period: 'Septembre 2025', confidence: 92 },
      { factor: 'Black Friday', impact: +25, period: 'Novembre 2025', confidence: 88 },
      { factor: 'Fêtes de fin d\'année', impact: +35, period: 'Décembre 2025', confidence: 90 },
    ]
  });

  // AI-generated insights
  const insights = [
    { id: 1, text: 'Prévoir 2 camions 19T supplémentaires pour Septembre 2025 pour répondre au pic de demande', impact: 'high' },
    { id: 2, text: 'Anticiper le recrutement de 4 chauffeurs supplémentaires d\'ici Août 2025', impact: 'high' },
    { id: 3, text: 'Envisager une extension temporaire d\'entrepôt de 800m² pour la période Octobre-Décembre', impact: 'medium' },
  ];

  // Forecast horizon selection
  const [forecastHorizon, setForecastHorizon] = useState('6months');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prévisions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Prévision avancée de la demande et des ressources
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="relative z-0 inline-flex shadow-sm rounded-md">
              <button
                type="button"
                onClick={() => setForecastHorizon('3months')}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 ${
                  forecastHorizon === '3months' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                3 mois
              </button>
              <button
                type="button"
                onClick={() => setForecastHorizon('6months')}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${
                  forecastHorizon === '6months' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                6 mois
              </button>
              <button
                type="button"
                onClick={() => setForecastHorizon('12months')}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 ${
                  forecastHorizon === '12months' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                12 mois
              </button>
            </span>
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
            Insights IA - Recommandations Prévisionnelles
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

      {/* Demand forecast chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Prévision de la Demande</h3>
          <p className="mt-1 text-sm text-gray-500">
            Volumes prévisionnels basés sur l'historique, la saisonnalité et les facteurs externes
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Graphique de prévision de la demande</p>
          </div>
          
          {/* Forecast table */}
          <div className="mt-6">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Période
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volume prévu
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Évolution
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confiance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {forecastData.demandForecast.map((forecast, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {forecast.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {forecast.volume} expéditions
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                forecast.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {forecast.trend}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      forecast.confidence >= 90 ? 'bg-green-500' :
                                      forecast.confidence >= 80 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${forecast.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-500">{forecast.confidence}%</span>
                              </div>
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
        </div>
      </div>

      {/* Resource forecast */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Prévision des Ressources</h3>
          <p className="mt-1 text-sm text-gray-500">
            Besoins prévisionnels en ressources basés sur la demande anticipée
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Graphique des besoins en ressources</p>
            </div>
            
            {/* Resource forecast table */}
            <div className="overflow-hidden shadow rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ressource
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actuel
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requis
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Écart
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastData.resourceForecast.map((resource, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.current}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.required}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          resource.gap > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {resource.gap > 0 ? `+${resource.gap} requis` : 'Suffisant'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal factors */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Facteurs Saisonniers</h3>
          <p className="mt-1 text-sm text-gray-500">
            Événements et tendances saisonnières impactant la demande
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-hidden shadow rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facteur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact (%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confiance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.seasonalFactors.map((factor, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {factor.factor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        factor.impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {factor.impact > 0 ? `+${factor.impact}%` : `${factor.impact}%`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {factor.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              factor.confidence >= 90 ? 'bg-green-500' :
                              factor.confidence >= 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${factor.confidence}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{factor.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Forecast scenarios */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Scénarios Prévisionnels</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analyse de différents scénarios basés sur les facteurs d'incertitude
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Graphique des scénarios prévisionnels</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;
