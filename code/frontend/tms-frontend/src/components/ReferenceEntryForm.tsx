/**
 * ReferenceEntryForm Component
 * 
 * Form component for creating and editing reference entries
 * with strict TypeScript typing
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  ReferenceEntry,
  ReferenceEntryFormData,
  ReferenceEntryMetadata
} from '../types/referenceData';
import { useReferenceData } from '../hooks/useReferenceData';

interface ReferenceEntryFormProps {
  mode: 'create' | 'edit' | 'view'; // Added 'view' mode
  typeId: string;
  entryId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReferenceEntryForm: React.FC<ReferenceEntryFormProps> = ({
  mode,
  typeId,
  entryId,
  onSuccess,
  onCancel
}) => {
   console.log('ReferenceEntryForm - Props:', { mode, typeId, entryId });
  const navigate = useNavigate();
  const { currentEntry, loading, error, loadEntry, createEntry, updateEntry, clearError } = useReferenceData();

  const [formData, setFormData] = useState<ReferenceEntryFormData>({
    code: '',
    label: '',
    description: '',
    value: '',
    metadata: {},
    parent_id: undefined,
    sort_order: 0,
    is_active: true,
    language_code: 'fr'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && entryId) { // Load data for edit and view modes
      console.log('ReferenceEntryForm - Calling loadEntry for:', typeId, entryId);
      loadEntry(typeId, entryId);
    }
  }, [mode, typeId, entryId, loadEntry]);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && currentEntry) { // Populate form data for edit and view modes
      console.log('useReferenceData - currentEntry updated:', currentEntry);
      setFormData({
        code: currentEntry.code,
        label: currentEntry.label,
        description: currentEntry.description || '',
        value: currentEntry.value || '',
        metadata: currentEntry.metadata || {},
        parent_id: currentEntry.parent_id || undefined,
        sort_order: currentEntry.sort_order,
        is_active: currentEntry.is_active,
        language_code: currentEntry.language_code
      });
    }
  }, [mode, currentEntry]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = 'Le code est requis';
    } else if (formData.code.length > 50) {
      errors.code = 'Le code ne peut pas dépasser 50 caractères';
    }

    if (!formData.label.trim()) {
      errors.label = 'Le libellé est requis';
    } else if (formData.label.length > 255) {
      errors.label = 'Le libellé ne peut pas dépasser 255 caractères';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'La description ne peut pas dépasser 1000 caractères';
    }

    if (formData.value && formData.value.length > 255) {
      errors.value = 'La valeur ne peut pas dépasser 255 caractères';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ReferenceEntryFormData, value: string | number | boolean | ReferenceEntryMetadata | undefined): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      let success = false;

      if (mode === 'create') {
        success = await createEntry(typeId, formData);
      } else if (mode === 'edit' && entryId) {
        success = await updateEntry(typeId, entryId, formData);
      }

      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/admin/references/${typeId}`);
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/admin/references/${typeId}`);
    }
  };

  if (mode === 'edit' && loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement de l'entrée...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <button
                onClick={handleCancel}
                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Retour à la liste
              </button>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {mode === 'create' ? 'Nouvelle entrée de référentiel' : mode === 'edit' ? 'Modifier l\'entrée de référentiel' : 'Détails de l\'entrée de référentiel'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'create' 
                ? 'Créer une nouvelle entrée dans le référentiel'
                : mode === 'edit' || mode === 'view'
                  ? 'Modifier les informations de l\'entrée existante'
                  : 'Consulter les détails de l\'entrée de référentiel'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erreur
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Code *
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  formErrors.code ? 'border-red-300' : ''
                }`}
                placeholder="Entrez le code unique"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
              )}
            </div>

            {/* Label */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                Libellé *
              </label>
              <input
                type="text"
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  formErrors.label ? 'border-red-300' : ''
                }`}
                placeholder="Entrez le libellé"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              />
              {formErrors.label && (
                <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  formErrors.description ? 'border-red-300' : ''
                }`}
                placeholder="Entrez une description (optionnel)"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            {/* Value */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                Valeur
              </label>
              <input
                type="text"
                id="value"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  formErrors.value ? 'border-red-300' : ''
                }`}
                placeholder="Entrez une valeur (optionnel)"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              />
              {formErrors.value && (
                <p className="mt-1 text-sm text-red-600">{formErrors.value}</p>
              )}
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">
                Ordre de tri
              </label>
              <input
                type="number"
                id="sort_order"
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              />
            </div>

            {/* Language Code */}
            <div>
              <label htmlFor="language_code" className="block text-sm font-medium text-gray-700">
                Code de langue
              </label>
              <select
                id="language_code"
                value={formData.language_code}
                onChange={(e) => handleInputChange('language_code', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              >
                <option value="fr">Français (fr)</option>
                <option value="en">Anglais (en)</option>
                <option value="es">Espagnol (es)</option>
                <option value="de">Allemand (de)</option>
                <option value="it">Italien (it)</option>
              </select>
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting || mode === 'view'} // Disable in view mode
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Entrée active
              </label>
            </div>

            {/* Form Actions */}
            {mode !== 'view' && ( // Hide buttons in view mode
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {mode === 'create' ? 'Création...' : 'Modification...'}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {mode === 'create' ? 'Créer' : 'Modifier'}
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReferenceEntryForm;
