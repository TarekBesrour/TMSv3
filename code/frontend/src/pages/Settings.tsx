import React, { useState } from 'react';
import { Cog6ToothIcon, UserGroupIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Settings component - System configuration and administration
const Settings: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  // Sample data for settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Transport Solutions SaaS',
    defaultLanguage: 'Français',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    distanceUnit: 'km',
    weightUnit: 'kg',
    volumeUnit: 'm³',
  });

  const [userRoles, setUserRoles] = useState([
    { id: 1, name: 'Administrateur', users: 3, permissions: 'Toutes les permissions' },
    { id: 2, name: 'Gestionnaire Transport', users: 8, permissions: 'Gestion des commandes, planification, expéditions' },
    { id: 3, name: 'Responsable Flotte', users: 4, permissions: 'Gestion de la flotte, maintenance' },
    { id: 4, name: 'Comptabilité', users: 5, permissions: 'Facturation, coûts, reporting financier' },
    { id: 5, name: 'Client', users: 42, permissions: 'Suivi des commandes, documents' },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'ERP Entreprise', status: 'Actif', lastSync: '29/05/2025 10:15', type: 'API' },
    { id: 2, name: 'Système Comptable', status: 'Actif', lastSync: '29/05/2025 09:30', type: 'API' },
    { id: 3, name: 'Télématique Véhicules', status: 'Actif', lastSync: '29/05/2025 11:00', type: 'API' },
    { id: 4, name: 'Système Clients', status: 'Inactif', lastSync: '25/05/2025 14:20', type: 'EDI' },
    { id: 5, name: 'Plateforme Transporteurs', status: 'Actif', lastSync: '29/05/2025 08:45', type: 'API' },
  ]);

  const [aiSettings, setAiSettings] = useState({
    assistantEnabled: true,
    predictiveMaintenance: true,
    documentProcessing: true,
    demandForecasting: true,
    routeOptimization: true,
    kpiAnalysis: true,
    dataPrivacy: 'Haute',
    modelUpdateFrequency: 'Hebdomadaire',
    confidenceThreshold: 85,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres & Administration</h1>
              <p className="mt-1 text-sm text-gray-500">
                Configuration du système et gestion des paramètres
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('general')}
            className={`${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Général
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Utilisateurs & Rôles
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`${
              activeTab === 'integrations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Intégrations
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Configuration IA
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Paramètres Généraux</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuration générale du système
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {Object.entries(generalSettings).map(([key, value]) => (
                  <div key={key} className="sm:col-span-1">
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                      {key === 'companyName' ? 'Nom de l\'entreprise' :
                       key === 'defaultLanguage' ? 'Langue par défaut' :
                       key === 'timezone' ? 'Fuseau horaire' :
                       key === 'dateFormat' ? 'Format de date' :
                       key === 'currency' ? 'Devise' :
                       key === 'distanceUnit' ? 'Unité de distance' :
                       key === 'weightUnit' ? 'Unité de poids' :
                       key === 'volumeUnit' ? 'Unité de volume' : key}
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name={key}
                        id={key}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={value}
                        onChange={(e) => setGeneralSettings({...generalSettings, [key]: e.target.value})}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users & Roles */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Utilisateurs & Rôles</h3>
              <p className="mt-1 text-sm text-gray-500">
                Gestion des utilisateurs et des rôles
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Nouveau rôle
                </button>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rôle
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Utilisateurs
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Permissions
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userRoles.map((role) => (
                            <tr key={role.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {role.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {role.users} utilisateurs
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {role.permissions}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  Éditer
                                </a>
                                <a href="#" className="text-red-600 hover:text-red-900">
                                  Supprimer
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
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Intégrations</h3>
              <p className="mt-1 text-sm text-gray-500">
                Gestion des intégrations avec les systèmes externes
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                  Nouvelle intégration
                </button>
              </div>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Système
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dernière synchronisation
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {integrations.map((integration) => (
                            <tr key={integration.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {integration.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {integration.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  integration.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {integration.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {integration.lastSync}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  Configurer
                                </a>
                                <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                  Synchroniser
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
            </div>
          </div>
        )}

        {/* AI Configuration */}
        {activeTab === 'ai' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Configuration IA</h3>
              <p className="mt-1 text-sm text-gray-500">
                Paramètres des fonctionnalités d'intelligence artificielle
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-gray-900">Modules IA</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="assistantEnabled"
                        name="assistantEnabled"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={aiSettings.assistantEnabled}
                        onChange={(e) => setAiSettings({...aiSettings, assistantEnabled: e.target.checked})}
                      />
                      <label htmlFor="assistantEnabled" className="ml-3 block text-sm font-medium text-gray-700">
                        Assistant Virtuel
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="predictiveMaintenance"
                        name="predictiveMaintenance"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={aiSettings.predictiveMaintenance}
                        onChange={(e) => setAiSettings({...aiSettings, predictiveMaintenance: e.target.checked})}
                      />
                      <label htmlFor="predictiveMaintenance" className="ml-3 block text-sm font-medium text-gray-700">
                        Maintenance Prédictive
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="documentProcessing"
                        name="documentProcessing"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={aiSettings.documentProcessing}
                        onChange={(e) => setAiSettings({...aiSettings, documentProcessing: e.target.checked})}
                      />
                      <label htmlFor="documentProcessing" className="ml-3 block text-sm font-medium text-gray-700">
                        Traitement Automatisé des Documents
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="demandForecasting"
                        name="demandForecasting"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={aiSettings.demandForecasting}
                        onChange={(e) => setAiSettings({...aiSettings, demandForecasting: e.target.checked})}
                      />
                      <label htmlFor="demandForecasting" className="ml-3 block text-sm font-medium text-gray-700">
                        Prévision de la Demande
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="routeOptimization"
                        name="routeOptimization"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={aiSettings.routeOptimization}
                        onChange={(e) => setAiSettings({...aiSettings, routeOptimization: e.target.checked})}
                      />
                      <label htmlFor="routeOptimization" className="ml-3 block text-sm font-medium text-gray-700">
                        Optimisation des Tournées
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="kpiAnalysis"
                        name="kpiAnalysis"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={aiSettings.kpiAnalysis}
                        onChange={(e) => setAiSettings({...aiSettings, kpiAnalysis: e.target.checked})}
                      />
                      <label htmlFor="kpiAnalysis" className="ml-3 block text-sm font-medium text-gray-700">
                        Analyse Prédictive des KPIs
                      </label>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="dataPrivacy" className="block text-sm font-medium text-gray-700">
                    Niveau de confidentialité des données
                  </label>
                  <select
                    id="dataPrivacy"
                    name="dataPrivacy"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={aiSettings.dataPrivacy}
                    onChange={(e) => setAiSettings({...aiSettings, dataPrivacy: e.target.value})}
                  >
                    <option>Standard</option>
                    <option>Élevée</option>
                    <option>Haute</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="modelUpdateFrequency" className="block text-sm font-medium text-gray-700">
                    Fréquence de mise à jour des modèles
                  </label>
                  <select
                    id="modelUpdateFrequency"
                    name="modelUpdateFrequency"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={aiSettings.modelUpdateFrequency}
                    onChange={(e) => setAiSettings({...aiSettings, modelUpdateFrequency: e.target.value})}
                  >
                    <option>Quotidienne</option>
                    <option>Hebdomadaire</option>
                    <option>Mensuelle</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor="confidenceThreshold" className="block text-sm font-medium text-gray-700">
                    Seuil de confiance (%)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="confidenceThreshold"
                      id="confidenceThreshold"
                      min="0"
                      max="100"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => setAiSettings({...aiSettings, confidenceThreshold: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
