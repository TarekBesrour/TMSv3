import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  SaveIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const BankAccountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    iban: '',
    swift_bic: '',
    currency: 'EUR',
    account_type: 'checking',
    current_balance: 0,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchBankAccount(id);
    }
    setLoading(false);
  }, [id]);

  const fetchBankAccount = async (accountId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bank-accounts/${accountId}`);
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      } else {
        console.error('Failed to fetch bank account:', data.message);
        setErrors({ general: data.message || 'Failed to fetch bank account.' });
      }
    } catch (error) {
      console.error('Error fetching bank account:', error);
      setErrors({ general: 'Error connecting to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/bank-accounts/${id}` : '/api/bank-accounts';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        navigate('/bank-accounts');
      } else {
        if (data.errors) {
          const newErrors = {};
          data.errors.forEach(err => {
            if (err.path) {
              newErrors[err.path] = err.msg;
            } else {
              newErrors.general = data.message; // General error message
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.message || 'Une erreur est survenue.' });
        }
      }
    } catch (error) {
      console.error('Error saving bank account:', error);
      setErrors({ general: 'Impossible de se connecter au serveur.' });
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center py-10">Chargement du compte bancaire...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Modifier le Compte Bancaire' : 'Nouveau Compte Bancaire'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {isEditMode ? 'Mettez à jour les informations de ce compte bancaire.' : 'Créez un nouveau compte bancaire dans le système.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/bank-accounts')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Retour à la liste
          </button>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{errors.general}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Account Name */}
              <div className="sm:col-span-3">
                <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
                  Nom du Compte
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="account_name"
                    id="account_name"
                    value={formData.account_name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.account_name && <p className="mt-2 text-sm text-red-600">{errors.account_name}</p>}
              </div>

              {/* Bank Name */}
              <div className="sm:col-span-3">
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
                  Nom de la Banque
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="bank_name"
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.bank_name && <p className="mt-2 text-sm text-red-600">{errors.bank_name}</p>}
              </div>

              {/* Account Number */}
              <div className="sm:col-span-3">
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
                  Numéro de Compte
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="account_number"
                    id="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.account_number && <p className="mt-2 text-sm text-red-600">{errors.account_number}</p>}
              </div>

              {/* IBAN */}
              <div className="sm:col-span-3">
                <label htmlFor="iban" className="block text-sm font-medium text-gray-700">
                  IBAN
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="iban"
                    id="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.iban && <p className="mt-2 text-sm text-red-600">{errors.iban}</p>}
              </div>

              {/* SWIFT/BIC */}
              <div className="sm:col-span-3">
                <label htmlFor="swift_bic" className="block text-sm font-medium text-gray-700">
                  SWIFT/BIC
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="swift_bic"
                    id="swift_bic"
                    value={formData.swift_bic}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.swift_bic && <p className="mt-2 text-sm text-red-600">{errors.swift_bic}</p>}
              </div>

              {/* Currency */}
              <div className="sm:col-span-3">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Devise
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="currency"
                    id="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    maxLength="3"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.currency && <p className="mt-2 text-sm text-red-600">{errors.currency}</p>}
              </div>

              {/* Account Type */}
              <div className="sm:col-span-3">
                <label htmlFor="account_type" className="block text-sm font-medium text-gray-700">
                  Type de Compte
                </label>
                <select
                  id="account_type"
                  name="account_type"
                  value={formData.account_type}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="checking">Compte courant</option>
                  <option value="savings">Compte épargne</option>
                  <option value="credit">Compte de crédit</option>
                  <option value="other">Autre</option>
                </select>
                {errors.account_type && <p className="mt-2 text-sm text-red-600">{errors.account_type}</p>}
              </div>

              {/* Current Balance */}
              <div className="sm:col-span-3">
                <label htmlFor="current_balance" className="block text-sm font-medium text-gray-700">
                  Solde Actuel
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="current_balance"
                    id="current_balance"
                    value={formData.current_balance}
                    onChange={handleChange}
                    step="0.01"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.current_balance && <p className="mt-2 text-sm text-red-600">{errors.current_balance}</p>}
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
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
                {errors.notes && <p className="mt-2 text-sm text-red-600">{errors.notes}</p>}
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <SaveIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  {isEditMode ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankAccountForm;


