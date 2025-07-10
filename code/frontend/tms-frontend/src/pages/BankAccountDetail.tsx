import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BankAccount } from '../types/bankAccount';
import { apiFetch } from '../utils/apiFetch'; // Assuming you have a utility function for API calls

const BankAccountDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBankAccount();
  }, [id]);

  const fetchBankAccount = async () => {
    try {
      setLoading(true);
      //const response = await fetch(`/bank-accounts/${id}`);
      /* const API_URL = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem('accessToken');   
      const response = await fetch(`${API_URL}/bank-accounts/${id}`, {
      headers: {        
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
      }); */
      const response = await apiFetch(`/bank-accounts/${id}`);
    //console.log('Responseeeeee:', response);

      const data = await response.json();
      if (data.success) {
        setBankAccount(data.data);
      } else {
        setError(data.message || 'Failed to fetch bank account details.');
      }
    } catch (err) {
      setError('Error connecting to the server.');
      console.error('Error fetching bank account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte bancaire ?')) {
      try {
        /* const response = await fetch(`/bank-accounts/${id}`, {
          method: 'DELETE'
        }); */
        const response = await apiFetch(`/bank-accounts/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          navigate('/bank-accounts'); // Redirect to bank accounts list
        } else {
          setError(data.message || 'Failed to delete bank account.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
        console.error('Error deleting bank account:', err);
      }
    }
  };

  const formatAmount = (amount: number = 0, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des détails du compte bancaire...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!bankAccount) {
    return <div className="text-center py-10">Compte bancaire non trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails du Compte Bancaire</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur le compte bancaire {bankAccount.account_name}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/bank-accounts')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Retour à la liste
          </button>
          <button
            type="button"
            onClick={() => navigate(`/bank-accounts/${bankAccount.id}/edit`)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Modifier
          </button>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Détails du compte bancaire.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom du Compte</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.account_name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom de la Banque</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.bank_name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Numéro de Compte</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.account_number}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">IBAN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.iban || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">SWIFT/BIC</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.swift_bic || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Devise</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.currency}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de Compte</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.account_type}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Solde Actuel</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatAmount(bankAccount.current_balance, bankAccount.currency)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{bankAccount.notes || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Actions</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6 flex space-x-3">
          <button
            type="button"
            onClick={handleDeleteBankAccount}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Supprimer le Compte
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountDetail;


