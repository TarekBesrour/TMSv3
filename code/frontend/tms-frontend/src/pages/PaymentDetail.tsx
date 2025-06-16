import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  BanknotesIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [processData, setProcessData] = useState({
    transaction_reference: '',
    notes: ''
  });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/${id}`);
      const data = await response.json();
      if (data.success) {
        setPayment(data.data);
      } else {
        setError(data.message || 'Failed to fetch payment details.');
      }
    } catch (err) {
      setError('Error connecting to the server.');
      console.error('Error fetching payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processData)
      });
      const data = await response.json();
      if (data.success) {
        fetchPayment(); // Refresh payment data
        setShowProcessModal(false);
        setProcessData({ transaction_reference: '', notes: '' });
      } else {
        setError(data.message || 'Failed to process payment.');
      }
    } catch (err) {
      setError('Error connecting to the server.');
      console.error('Error processing payment:', err);
    }
  };

  const handleCancelPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await response.json();
      if (data.success) {
        fetchPayment(); // Refresh payment data
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        setError(data.message || 'Failed to cancel payment.');
      }
    } catch (err) {
      setError('Error connecting to the server.');
      console.error('Error canceling payment:', err);
    }
  };

  const handleDeletePayment = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        const response = await fetch(`/api/payments/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          navigate('/payments'); // Redirect to payments list
        } else {
          setError(data.message || 'Failed to delete payment.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
        console.error('Error deleting payment:', err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusName = (status) => {
    const statusNames = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminé',
      failed: 'Échoué',
      cancelled: 'Annulé',
      refunded: 'Remboursé'
    };
    return statusNames[status] || status;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      case 'bank_transfer':
        return <BanknotesIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const isOverdue = (payment) => {
    if (!payment.due_date || payment.status === 'completed') return false;
    return new Date(payment.due_date) < new Date();
  };

  if (loading) {
    return <div className="text-center py-10">Chargement des détails du paiement...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Erreur: {error}</div>;
  }

  if (!payment) {
    return <div className="text-center py-10">Paiement non trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Détails du Paiement</h1>
          <p className="mt-2 text-sm text-gray-700">
            Informations détaillées sur le paiement {payment.reference}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Retour à la liste
          </button>
          <button
            type="button"
            onClick={() => navigate(`/payments/${payment.id}/edit`)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Modifier
          </button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informations Générales</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Détails du paiement et statut.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Référence</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{payment.reference}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de Paiement</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {payment.payment_type === 'incoming' ? 'Entrant' : 'Sortant'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Montant</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatAmount(payment.amount, payment.currency)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date de Paiement</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(payment.payment_date)}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date d'échéance</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(payment.due_date)}
                {isOverdue(payment) && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="-ml-0.5 mr-1 h-3 w-3" aria-hidden="true" />
                    En retard
                  </span>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                  {getStatusName(payment.status)}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Méthode de Paiement</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  {getPaymentMethodIcon(payment.payment_method)}
                  <span className="ml-2">{payment.getPaymentMethodLabel()}</span>
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Partenaire</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {payment.partner ? payment.partner.name : 'N/A'}
              </dd>
            </div>
            {payment.invoice && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Facture Client</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a href={`/invoices/${payment.invoice.id}`} className="text-indigo-600 hover:text-indigo-900">
                    {payment.invoice.invoice_number}
                  </a>
                </dd>
              </div>
            )}
            {payment.carrierInvoice && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Facture Transporteur</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a href={`/carrier-invoices/${payment.carrierInvoice.id}`} className="text-indigo-600 hover:text-indigo-900">
                    {payment.carrierInvoice.invoice_number}
                  </a>
                </dd>
              </div>
            )}
            {payment.bankAccount && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Compte Bancaire</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {payment.bankAccount.account_name} ({payment.bankAccount.account_number})
                </dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Référence de Transaction</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{payment.transaction_reference || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{payment.description || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{payment.notes || 'N/A'}</dd>
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
          {payment.status !== 'completed' && payment.status !== 'cancelled' && payment.status !== 'failed' && (
            <button
              type="button"
              onClick={() => setShowProcessModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Traiter le Paiement
            </button>
          )}
          {payment.status !== 'cancelled' && payment.status !== 'completed' && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Annuler le Paiement
            </button>
          )}
          {payment.status !== 'completed' && (
            <button
              type="button"
              onClick={handleDeletePayment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Supprimer le Paiement
            </button>
          )}
        </div>
      </div>

      {/* Process Payment Modal */}
           {showProcessModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Traiter le Paiement
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Confirmez le traitement de ce paiement. Cela marquera le paiement comme 'Terminé'.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="transaction_reference" className="block text-sm font-medium text-gray-700">
                          Référence de Transaction (Optionnel)
                        </label>
                        <input
                          type="text"
                          name="transaction_reference"
                          id="transaction_reference"
                          value={processData.transaction_reference}
                          onChange={(e) => setProcessData({ ...processData, transaction_reference: e.target.value })}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="mt-4">
                        <label htmlFor="process_notes" className="block text-sm font-medium text-gray-700">
                          Notes (Optionnel)
                        </label>
                        <textarea
                          id="process_notes"
                          name="process_notes"
                          rows="3"
                          value={processData.notes}
                          onChange={(e) => setProcessData({ ...processData, notes: e.target.value })}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleProcessPayment}
                >
                  Traiter
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowProcessModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Payment Modal */}
      {showCancelModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Annuler le Paiement
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir annuler ce paiement ? Cette action est irréversible.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="cancel_reason" className="block text-sm font-medium text-gray-700">
                          Raison de l'annulation
                        </label>
                        <textarea
                          id="cancel_reason"
                          name="cancel_reason"
                          rows="3"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelPayment}
                >
                  Annuler le Paiement
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetail;


