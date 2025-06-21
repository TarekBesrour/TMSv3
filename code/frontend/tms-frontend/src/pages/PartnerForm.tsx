import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Types
interface Partner {
  id?: number;
  name: string;
  type: 'CLIENT' | 'CARRIER' | 'SUPPLIER' | 'OTHER';
  legal_form: string | null;
  registration_number: string | null;
  vat_number: string | null;
  website: string | null;
  logo_url: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'pending' | 'blocked';
}

const PartnerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [partner, setPartner] = useState<Partner>({
    name: '',
    type: 'CLIENT',
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
      const fetchPartner = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // In a real app, this would be an API call
          // For now, we'll simulate with mock data
          setTimeout(() => {
            // Mock partner data
            const mockPartner: Partner = {
              id: Number(id),
              name: 'Acme Logistics',
              type: 'CLIENT',
              legal_form: 'SAS',
              registration_number: '123456789',
              vat_number: 'FR12345678901',
              website: 'https://acme-logistics.com',
              logo_url: null,
              notes: 'Important client for international shipping.',
              status: 'active'
            };
            
            setPartner(mockPartner);
            setLoading(false);
          }, 800);
        } catch (err: any) {
          setError(err.message || 'Une erreur est survenue lors du chargement des données du partenaire');
          setLoading(false);
        }
      };
      
      fetchPartner();
    }
  }, [id, isEditMode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPartner(prev => ({ ...prev, [name]: value }));
    
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
    
    if (!partner.name.trim()) {
      errors.name = 'Le nom est obligatoire';
    }
    
    if (!partner.type) {
      errors.type = 'Le type est obligatoire';
    }
    
    if (partner.website && !isValidUrl(partner.website)) {
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
      
      // In a real app, this would be an API call
      // For now, we'll simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to partner list or detail page
      if (isEditMode) {
        navigate(`/partners/${id}`);
      } else {
        navigate('/partners');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement du partenaire');
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/partners/${id}`);
    } else {
      navigate('/partners');
    }
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
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="mr-4 text-gray-400 hover:text-gray-500"
            >
              <ArrowLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isEditMode ? 'Modifier le partenaire' : 'Nouveau partenaire'}
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
                    value={partner.name}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.name ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
              </div>
              
              {/* Type */}
              <div className="sm:col-span-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="type"
                    name="type"
                    value={partner.type}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.type ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="CARRIER">Transporteur</option>
                    <option value="SUPPLIER">Fournisseur</option>
                    <option value="OTHER">Autre</option>
                  </select>
                  {formErrors.type && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.type}</p>
                  )}
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
                    value={partner.legal_form || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    value={partner.registration_number || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    value={partner.vat_number || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    value={partner.website || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
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
                    value={partner.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    value={partner.notes || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Informations complémentaires sur le partenaire.
                </p>
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PartnerForm;
