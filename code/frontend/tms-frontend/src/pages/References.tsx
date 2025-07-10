/**
 * References Page
 * 
 * Main page for displaying reference types
 * Following the same pattern as Sites.tsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ReferenceType } from '../types/referenceData';
import { useReferenceData } from '../hooks/useReferenceData';
import { useAuth } from '../contexts/AuthContext';


const References: React.FC = () => {
  const navigate = useNavigate();
  const { types, loading, error, loadTypes, clearError } = useReferenceData();
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // <-- Ajoute ceci
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredTypes, setFilteredTypes] = useState<ReferenceType[]>([]);

  useEffect(() => {
     console.log('authLoading:', authLoading, 'isAuthenticated:', isAuthenticated); 
    if (!authLoading && isAuthenticated) {
    loadTypes();
     }
  }, [loadTypes, isAuthenticated, authLoading]);
 // }, [loadTypes]);

  useEffect(() => {
    // Apply search filter
    let result = [...types];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(type => 
        type.name.toLowerCase().includes(lowerSearchTerm) ||
        type.description.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredTypes(result);
  }, [types, searchTerm]);

  const handleTypeClick = (typeId: string): void => {
    navigate(`/admin/references/${typeId}`);
  };

  const getTypeIcon = (typeId: string): React.ReactNode => {
    // Return appropriate icon based on type
    return <FolderIcon className="h-6 w-6 text-blue-600" />;
  };

  const getTypeDisplayName = (typeId: string): string => {
    const typeNames: Record<string, string> = {
      'transport_modes': 'Modes de Transport',
      'vehicle_types': 'Types de Véhicules',
      'equipment_type': 'Types d\'Equipement',
      'cargo_types': 'Types de Marchandises',
      'incoterms': 'Incoterms',
      'currencies': 'Devises',
      'countries': 'Pays',
      'units_of_measure': 'Unités de Mesure',
      'document_types': 'Types de Documents',
      'payment_terms': 'Conditions de Paiement',
      'shipment_status': 'Statuts d\'Expédition',
      'order_status': 'Statuts de Commande',
      'invoice_status': 'Statuts de Facture',
      'partner_types': 'Types de Partenaires',
      'contact_types': 'Types de Contacts',
      'address_types': 'Types d\'Adresses'
    };

    return typeNames[typeId] || typeId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Référentiels
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les données de référence utilisées dans le système TMS
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="max-w-md">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Rechercher un type de référentiel..."
            />
          </div>
        </div>
      </div>

      {/* Reference Types Grid */}
      {filteredTypes.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Aucun référentiel trouvé' : 'Aucun référentiel disponible'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Essayez de modifier votre recherche.'
              : 'Aucun type de référentiel n\'est disponible pour le moment.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeClick(type.id)}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                  {getTypeIcon(type.id)}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {getTypeDisplayName(type.id)}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {type.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default References;

