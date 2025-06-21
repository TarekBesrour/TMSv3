import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CogIcon,
  CircleStackIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SystemHealth {
  database?: { status?: string };
  api?: { status?: string };
  storage?: { status?: string };
  external_services?: { status?: string };
}

interface SystemStats {
  active_users?: number;
  active_orders?: number;
  active_shipments?: number;
  total_partners?: number;
}

const Administration = () => {
  const navigate = useNavigate();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch system health
      const healthResponse = await fetch('/api/admin/system/health');
      const healthData = await healthResponse.json();
      if (healthData.success) {
        setSystemHealth(healthData.data);
      }

      // Fetch system statistics
      const statsResponse = await fetch('/api/admin/system/statistics');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setSystemStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des données système...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Administration et Configuration</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les configurations système et surveillez l'état de santé de l'application.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => navigate('/admin/configurations')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md cursor-pointer"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
              <CogIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <span className="absolute inset-0" aria-hidden="true" />
              Configurations Système
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Gérez les paramètres et configurations globales du système.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/reference-data')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md cursor-pointer"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
              <CircleStackIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <span className="absolute inset-0" aria-hidden="true" />
              Données de Référence
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Gérez les référentiels de données (modes de transport, devises, etc.).
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/system-health')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md cursor-pointer"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
              <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <span className="absolute inset-0" aria-hidden="true" />
              État de Santé
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Surveillez l'état de santé et les performances du système.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/statistics')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md cursor-pointer"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
              <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium">
              <span className="absolute inset-0" aria-hidden="true" />
              Statistiques Système
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Consultez les statistiques d'utilisation et de performance.
            </p>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">État de Santé du Système</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Aperçu rapide de l'état de santé des composants système.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getHealthStatusIcon(systemHealth.database?.status)}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Base de Données</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusClass(systemHealth.database?.status)}`}>
                                {systemHealth.database?.status || 'Unknown'}
                              </span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getHealthStatusIcon(systemHealth.api?.status)}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">API</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusClass(systemHealth.api?.status)}`}>
                                {systemHealth.api?.status || 'Unknown'}
                              </span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getHealthStatusIcon(systemHealth.storage?.status)}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Stockage</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusClass(systemHealth.storage?.status)}`}>
                                {systemHealth.storage?.status || 'Unknown'}
                              </span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getHealthStatusIcon(systemHealth.external_services?.status)}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Services Externes</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusClass(systemHealth.external_services?.status)}`}>
                                {systemHealth.external_services?.status || 'Unknown'}
                              </span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Statistics Overview */}
      {systemStats && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Statistiques Système</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Aperçu des statistiques d'utilisation du système.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs Actifs</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatNumber(systemStats.active_users || 0)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Commandes Actives</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatNumber(systemStats.active_orders || 0)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Expéditions en Cours</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatNumber(systemStats.active_shipments || 0)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Partenaires</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatNumber(systemStats.total_partners || 0)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;

