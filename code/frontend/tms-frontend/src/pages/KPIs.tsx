import React, { useState } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// KPIs component - AI-enhanced KPI analysis and visualization
const KPIs: React.FC = () => {
  // Sample data for KPIs
  const [kpiData, setKpiData] = useState({
    operational: [
      { name: 'Taux de livraison à l\'heure', value: '94.2%', target: '95%', trend: '+2.1%', status: 'increase', period: 'vs mois précédent' },
      { name: 'Taux de remplissage', value: '82%', target: '85%', trend: '+5%', status: 'increase', period: 'vs mois précédent' },
      { name: 'Délai moyen de livraison', value: '1.8 jours', target: '1.5 jours', trend: '-0.2 jours', status: 'increase', period: 'vs mois précédent' },
      { name: 'Taux d\'incidents', value: '2.3%', target: '2%', trend: '-0.5%', status: 'increase', period: 'vs mois précédent' },
    ],
    financial: [
      { name: 'Coût moyen par km', value: '0.87€', target: '0.85€', trend: '-0.05€', status: 'increase', period: 'vs mois précédent' },
      { name: 'Marge opérationnelle', value: '18.5%', target: '20%', trend: '+1.2%', status: 'increase', period: 'vs mois précédent' },
      { name: 'Chiffre d\'affaires', value: '325K€', target: '350K€', trend: '+12%', status: 'increase', period: 'vs mois précédent' },
      { name: 'DSO', value: '42 jours', target: '30 jours', trend: '-3 jours', status: 'increase', period: 'vs mois précédent' },
    ],
    environmental: [
      { name: 'Émissions CO2', value: '102.4 g/km', target: '100 g/km', trend: '-3.2%', status: 'increase', period: 'vs mois précédent' },
      { name: 'Consommation carburant', value: '28.5 L/100km', target: '27 L/100km', trend: '-1.2%', status: 'increase', period: 'vs mois précédent' },
      { name: 'Taux de trajets à vide', value: '12%', target: '10%', trend: '-2%', status: 'increase', period: 'vs mois précédent' },
      { name: 'Score environnemental', value: '78/100', target: '80/100', trend: '+3 pts', status: 'increase', period: 'vs mois précédent' },
    ]
  });

  // AI-generated insights
  const insights = [
    { id: 1, text: 'Le taux de livraison à l\'heure pourrait atteindre 96% en optimisant les tournées du secteur Nord-Est', impact: 'high' },
    { id: 2, text: 'La réduction du taux de trajets à vide de 2% supplémentaires permettrait d\'économiser 8 500€ par mois', impact: 'high' },
    { id: 3, text: 'Le DSO pourrait être réduit de 7 jours en automatisant les relances clients', impact: 'medium' },
  ];

  // Time period selection
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analyse des KPIs</h1>
              <p className="mt-1 text-sm text-gray-500">
                Suivi et analyse prédictive des indicateurs clés
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="relative z-0 inline-flex shadow-sm rounded-md">
              <button
                type="button"
                onClick={() => setSelectedPeriod('week')}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 ${
                  selectedPeriod === 'week' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                Semaine
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('month')}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${
                  selectedPeriod === 'month' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                Mois
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('quarter')}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${
                  selectedPeriod === 'quarter' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                Trimestre
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('year')}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 ${
                  selectedPeriod === 'year' ? 'bg-indigo-50 text-indigo-700 z-10' : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
              >
                Année
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
            Insights IA - Opportunités d'Amélioration
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

      {/* Operational KPIs */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">KPIs Opérationnels</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.operational.map((kpi, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{kpi.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">{kpi.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold">
                          <span className={`${
                            kpi.status === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {kpi.trend}
                          </span>
                          <span className="text-gray-500 ml-1">{kpi.period}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">Objectif: {kpi.target}</div>
                    <div className="text-indigo-600">Détails</div>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        parseFloat(kpi.value) >= parseFloat(kpi.target) ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(parseFloat(kpi.value) / parseFloat(kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial KPIs */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">KPIs Financiers</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.financial.map((kpi, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{kpi.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">{kpi.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold">
                          <span className={`${
                            kpi.status === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {kpi.trend}
                          </span>
                          <span className="text-gray-500 ml-1">{kpi.period}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">Objectif: {kpi.target}</div>
                    <div className="text-indigo-600">Détails</div>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        parseFloat(kpi.value) >= parseFloat(kpi.target) ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(parseFloat(kpi.value) / parseFloat(kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental KPIs */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">KPIs Environnementaux</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.environmental.map((kpi, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{kpi.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-lg font-medium text-gray-900">{kpi.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold">
                          <span className={`${
                            kpi.status === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {kpi.trend}
                          </span>
                          <span className="text-gray-500 ml-1">{kpi.period}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">Objectif: {kpi.target}</div>
                    <div className="text-indigo-600">Détails</div>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        parseFloat(kpi.value) >= parseFloat(kpi.target) ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(parseFloat(kpi.value) / parseFloat(kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Analysis */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Analyse Prédictive des KPIs</h3>
          <p className="mt-1 text-sm text-gray-500">
            Prévisions et analyse causale des indicateurs clés
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Prévisions des KPIs</p>
            </div>
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Analyse causale</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIs;
