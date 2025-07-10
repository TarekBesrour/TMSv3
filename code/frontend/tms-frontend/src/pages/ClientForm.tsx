import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { createPartner, getPartnerById, updatePartner, Partner as ApiPartner } from '../services/partnersApi';

// Types
import type { Partner } from '../services/partnersApi';

// ClientFormProps
interface ClientFormProps {
  mode?: 'create' | 'edit';
}

const ClientForm: React.FC<ClientFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = mode ? mode === 'edit' : !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [client, setClient] = useState<Partner>({
    id: undefined,
    name: '',
    type: 'customer', // Default to customer
    legal_form: '',
    registration_number: '',
    vat_number: '',
    website: '',
    logo_url: '',
    notes: '',
    status: 'active'
  });
  
  useEffect(() => {
    if (isEditMode) {
      const fetchClient = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getPartnerById(id!);
          if (data.type !== 'customer') {
            throw new Error('Ce partenaire n\'est pas un client');
          }
          setClient(data);
          setLoading(false);
        } catch (err: any) {
          setError(err.message || 'Une erreur est survenue lors du chargement des données du client');
          setLoading(false);
        }
      };
      
      fetchClient();
    }
  }, [id, isEditMode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user changes the value
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!client.name.trim()) {
      errors.name = 'Le nom est obligatoire';
    }
    
    // Type is fixed to 'customer' for this form, so no validation needed for it
    /*  console.log(client.type);
     if (!client.type) {
     
      errors.type = 'Le type est obligatoire';
    } */
    
    if (client.website && !isValidUrl(client.website)) {
      errors.website = 'L\'URL du site web n\'est pas valide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (isEditMode) {
        await updatePartner(id!, client);
        navigate(`/clients/${id}`);
      } else {
        await createPartner(client);
        navigate('/clients');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement du client');
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/clients/${id}`);
    } else {
      navigate('/clients');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="mr-4 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isEditMode ? 'Modifier le client' : 'Nouveau client'}
            </h2>
          </div>
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
            </div>
          </div>
        </div>
      )}
      
      {/* Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Name */}
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={client.name}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
              </div>
              
              {/* Type (hidden or disabled as it's fixed to 'customer') */}
              <div className="sm:col-span-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="type"
                    id="type"
                    value="customer"
                    disabled
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
              
              {/* Legal form */}
              <div className="sm:col-span-2">
                <label htmlFor="legal_form" className="block text-sm font-medium text-gray-700">
                  Forme juridique
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="legal_form"
                    id="legal_form"
                    value={client.legal_form || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Registration number */}
              <div className="sm:col-span-2">
                <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
                  Numéro SIRET
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="registration_number"
                    id="registration_number"
                    value={client.registration_number || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* VAT number */}
              <div className="sm:col-span-2">
                <label htmlFor="vat_number" className="block text-sm font-medium text-gray-700">
                  Numéro TVA
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="vat_number"
                    id="vat_number"
                    value={client.vat_number || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Website */}
              <div className="sm:col-span-3">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Site web
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="website"
                    id="website"
                    value={client.website || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.website ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.website && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.website}</p>
                  )}
                </div>
              </div>
              
              {/* Status */}
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={client.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                    <option value="blocked">Bloqué</option>
                  </select>
                </div>
              </div>
              
              {/* Notes */}
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={client.notes || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Informations complémentaires sur le client.
                </p>
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;


