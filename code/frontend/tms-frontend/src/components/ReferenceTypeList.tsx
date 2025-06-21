/**
 * ReferenceTypeList Component
 * 
 * Displays the list of available reference types
 * with strict TypeScript typing
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ReferenceType } from '../types/referenceData';
import { useReferenceData } from '../hooks/useReferenceData';

interface ReferenceTypeListProps {
  className?: string;
}

const ReferenceTypeList: React.FC<ReferenceTypeListProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { types, loading, error, loadTypes, clearError } = useReferenceData();

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const handleTypeClick = (typeId: string): void => {
    navigate(`/admin/references/${typeId}`);
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des types de référentiels...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erreur lors du chargement
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (types.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Aucun type de référentiel
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Aucun type de référentiel n'est disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Types de Référentiels
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type: ReferenceType) => (
            <div
              key={type.id}
              onClick={() => handleTypeClick(type.id)}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {type.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceTypeList;

