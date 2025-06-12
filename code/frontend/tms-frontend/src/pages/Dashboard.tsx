import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TruckIcon,
  ClockIcon,
  ExclamationIcon,
  CheckCircleIcon,
  GlobeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LocationMarkerIcon
} from '@heroicons/react/24/outline';

// Mock data for charts
const generateMockData = () => {
  // Transport modes distribution
  const transportModes = {
    road: Math.floor(Math.random() * 50) + 30,
    sea: Math.floor(Math.random() * 30) + 10,
    air: Math.floor(Math.random() * 20) + 5,
    rail: Math.floor(Math.random() * 15) + 5,
    multimodal: Math.floor(Math.random() * 25) + 10
  };
  
  // Shipment status distribution
  const shipmentStatus = {
    delivered: Math.floor(Math.random() * 40) + 40,
    inTransit: Math.floor(Math.random() * 30) + 20,
    delayed: Math.floor(Math.random() * 15) + 5,
    issue: Math.floor(Math.random() * 10) + 2
  };
  
  // On-time performance by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const onTimePerformance = months.map(month => ({
    month,
    onTime: 75 + Math.floor(Math.random() * 20),
    delayed: Math.floor(Math.random() * 25)
  }));
  
  // Recent shipments
  const shipmentTypes = ['domestic', 'international', 'cross_border'];
  const transportModesList = ['road', 'sea', 'air', 'rail', 'multimodal'];
  const statuses = ['delivered', 'in_transit', 'delayed', 'issue'];
  
  const recentShipments = Array(5).fill(null).map((_, i) => ({
    id: `SHP-2025-${1000 + i}`,
    origin: ['Paris, France', 'Hamburg, Germany', 'Rotterdam, Netherlands', 'Barcelona, Spain', 'Milan, Italy'][i],
    destination: ['Madrid, Spain', 'Warsaw, Poland', 'Stockholm, Sweden', 'Athens, Greece', 'Lisbon, Portugal'][i],
    shipment_type: shipmentTypes[Math.floor(Math.random() * shipmentTypes.length)],
    transport_mode: transportModesList[Math.floor(Math.random() * transportModesList.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    planned_delivery: new Date(Date.now() + (Math.floor(Math.random() * 10) - 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
  
  // Upcoming deliveries
  const upcomingDeliveries = Array(3).fill(null).map((_, i) => ({
    id: `SHP-2025-${2000 + i}`,
    destination: ['Berlin, Germany', 'Lyon, France', 'Brussels, Belgium'][i],
    customer: ['Acme Corp', 'Globex Industries', 'Stark Enterprises'][i],
    planned_delivery: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: i === 0 ? 'at_risk' : 'on_track'
  }));
  
  return {
    transportModes,
    shipmentStatus,
    onTimePerformance,
    recentShipments,
    upcomingDeliveries,
    kpis: {
      activeShipments: Math.floor(Math.random() * 50) + 30,
      onTimeDelivery: Math.floor(Math.random() * 10) + 90,
      averageTransitTime: Math.floor(Math.random() * 3) + 2,
      co2Emissions: Math.floor(Math.random() * 500) + 1000
    }
  };
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('week');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        setTimeout(() => {
          const mockData = generateMockData();
          setData(mockData);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tableau de bord
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => handleTimeRangeChange('day')}
              className={`${
                timeRange === 'day'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700'
              } relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              Jour
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeChange('week')}
              className={`${
                timeRange === 'week'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700'
              } relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => handleTimeRangeChange('month')}
              className={`${
                timeRange === 'month'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700'
              } relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Active Shipments */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <TruckIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expéditions actives
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {data.kpis.activeShipments}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* On-time Delivery */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Livraisons à l'heure
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {data.kpis.onTimeDelivery}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Average Transit Time */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Temps de transit moyen
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {data.kpis.averageTransitTime} jours
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* CO2 Emissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <GlobeIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Émissions CO2
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {data.kpis.co2Emissions} kg
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
        {/* Transport Modes Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Répartition par mode de transport
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64">
              {/* In a real app, this would be a chart component */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Routier</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.transportModes.road}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${data.transportModes.road}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GlobeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Maritime</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.transportModes.sea}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${data.transportModes.sea}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Aérien</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.transportModes.air}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${data.transportModes.air}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Ferroviaire</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.transportModes.rail}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.transportModes.rail}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-500">Multimodal</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{data.transportModes.multimodal}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.transportModes.multimodal}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
            {/* Shipment Status Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Statut des expéditions
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64">
              {/* In a real app, this would be a chart component */}
              <div className="flex h-full">
                <div className="flex-1 flex flex-col justify-end space-y-1">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                          Livrées
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-green-600">
                          {data.shipmentStatus.delivered}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                      <div style={{ width: `${data.shipmentStatus.delivered}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          En transit
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {data.shipmentStatus.inTransit}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div style={{ width: `${data.shipmentStatus.inTransit}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">
                          Retardées
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-yellow-600">
                          {data.shipmentStatus.delayed}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                      <div style={{ width: `${data.shipmentStatus.delayed}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"></div>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                          Problèmes
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-red-600">
                          {data.shipmentStatus.issue}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                      <div style={{ width: `${data.shipmentStatus.issue}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
        {/* On-time Performance Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Performance de livraison à l'heure
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64">
              {/* In a real app, this would be a chart component */}
              <div className="flex h-full items-end">
                {data.onTimePerformance.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center space-y-1">
                      <div className="w-full px-2">
                        <div className="bg-green-500 rounded-t" style={{ height: `${item.onTime * 2}px` }}></div>
                        <div className="bg-yellow-500" style={{ height: `${item.delayed * 2}px` }}></div>
                      </div>
                      <div className="text-xs font-medium text-gray-500">{item.month}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
                  <span className="text-xs text-gray-500">À l'heure</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1"></div>
                  <span className="text-xs text-gray-500">Retardé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Deliveries */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Livraisons à venir
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {data.upcomingDeliveries.map((delivery) => (
                  <li key={delivery.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          delivery.status === 'at_risk' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {delivery.status === 'at_risk' ? (
                            <ExclamationIcon className="h-5 w-5 text-red-500" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {delivery.id}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {delivery.customer} - {delivery.destination}
                        </p>
                      </div>
                      <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          delivery.status === 'at_risk' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {delivery.status === 'at_risk' ? 'À risque' : 'En bonne voie'}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 text-right">
                          {delivery.planned_delivery}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Shipments */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Expéditions récentes
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Dernières expéditions créées ou mises à jour
            </p>
          </div>
          <a href="/shipments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Voir toutes les expéditions
          </a>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origine → Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livraison prévue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 hover:text-indigo-900">
                      <a href={`/shipments/${shipment.id}`}>{shipment.id}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.origin} → {shipment.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shipment.shipment_type === 'domestic' ? 'bg-gray-100 text-gray-800' : 
                        shipment.shipment_type === 'international' ? 'bg-blue-100 text-blue-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {shipment.shipment_type === 'domestic' ? 'National' : 
                         shipment.shipment_type === 'international' ? 'International' : 
                         'Transfrontalier'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.transport_mode === 'road' ? 'Routier' : 
                       shipment.transport_mode === 'sea' ? 'Maritime' : 
                       shipment.transport_mode === 'air' ? 'Aérien' : 
                       shipment.transport_mode === 'rail' ? 'Ferroviaire' : 
                       'Multimodal'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shipment.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 
                        shipment.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {shipment.status === 'delivered' ? 'Livré' : 
                         shipment.status === 'in_transit' ? 'En transit' : 
                         shipment.status === 'delayed' ? 'Retardé' : 
                         'Problème'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.planned_delivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
