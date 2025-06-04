import React, { useState } from 'react';
import { DocumentTextIcon, DocumentDuplicateIcon, DocumentArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Documents component - AI-powered document processing and management
const Documents: React.FC = () => {
  // Sample data for documents
  const [documents, setDocuments] = useState([
    { id: 'DOC-1234', type: 'Bon de Livraison', reference: 'BL-78452', related: 'CMD-4582', status: 'Traité', date: '28/05/2025', confidence: 98 },
    { id: 'DOC-1233', type: 'CMR', reference: 'CMR-45896', related: 'SHP-7845', status: 'Traité', date: '28/05/2025', confidence: 95 },
    { id: 'DOC-1232', type: 'Facture', reference: 'FAC-12458', related: 'CMD-4579', status: 'En attente', date: '27/05/2025', confidence: 0 },
    { id: 'DOC-1231', type: 'Bon de Commande', reference: 'BC-78965', related: 'CMD-4581', status: 'Traité', date: '26/05/2025', confidence: 92 },
    { id: 'DOC-1230', type: 'CMR', reference: 'CMR-45892', related: 'SHP-7842', status: 'Erreur', date: '25/05/2025', confidence: 65 },
  ]);

  // Document processing stats
  const stats = {
    processed: 127,
    pending: 3,
    errors: 1,
    accuracy: 96.5
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion Documentaire</h1>
              <p className="mt-1 text-sm text-gray-500">
                Traitement automatisé des documents par IA
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Importer des documents
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <DocumentDuplicateIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Documents traités</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.processed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <DocumentDuplicateIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <DocumentDuplicateIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Erreurs</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.errors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <DocumentDuplicateIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Précision IA</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.accuracy}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher un document..."
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option>Tous les types</option>
              <option>Bon de Livraison</option>
              <option>CMR</option>
              <option>Facture</option>
              <option>Bon de Commande</option>
            </select>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option>Tous les statuts</option>
              <option>Traité</option>
              <option>En attente</option>
              <option>Erreur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lié à
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confiance IA
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {doc.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.related}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doc.status === 'Traité' ? 'bg-green-100 text-green-800' :
                          doc.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.confidence > 0 ? (
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  doc.confidence >= 90 ? 'bg-green-500' :
                                  doc.confidence >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${doc.confidence}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-500">{doc.confidence}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Voir
                        </a>
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Éditer
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

      {/* Document processing preview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Traitement documentaire IA</h3>
          <p className="mt-1 text-sm text-gray-500">
            Visualisation du processus d'extraction et de reconnaissance
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Aperçu du document</p>
            </div>
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Données extraites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
