import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { PaymentStatus, PaymentType, PaymentMethod } from '../types/payment';
import type { Partner } from '../types/partner.js';
import type { Invoice } from '../types/invoice';
import type { BankAccount } from '../types/bankAccount';

interface PaymentFormErrors {
  general?: string;
  payment_type?: string;
  reference?: string;
  amount?: string;
  currency?: string;
  payment_date?: string;
  due_date?: string;
  status?: string;
  payment_method?: string;
  partner_id?: string;
  invoice_id?: string;
  carrier_invoice_id?: string;
  bank_account_id?: string;
  transaction_reference?: string;
  description?: string;
  notes?: string;
}

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    payment_type: 'incoming',
    reference: '',
    amount: 0,
    currency: 'EUR',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending',
    payment_method: 'bank_transfer',
    partner_id: '',
    invoice_id: '',
    carrier_invoice_id: '',
    bank_account_id: '',
    transaction_reference: '',
    description: '',
    notes: ''
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [carrierInvoices, setCarrierInvoices] = useState<Invoice[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [errors, setErrors] = useState<PaymentFormErrors>({});

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchPayment(id);
    }
    fetchRelatedData();
  }, [id]);

  const fetchPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/${paymentId}`);
      const data = await response.json();
      if (data.success) {
        setFormData({
          ...data.data,
          payment_date: data.data.payment_date ? new Date(data.data.payment_date).toISOString().split('T')[0] : '',
          due_date: data.data.due_date ? new Date(data.data.due_date).toISOString().split('T')[0] : '',
          partner_id: data.data.partner_id || '',
          invoice_id: data.data.invoice_id || '',
          carrier_invoice_id: data.data.carrier_invoice_id || '',
          bank_account_id: data.data.bank_account_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      // Fetch Partners
      const partnersResponse = await fetch('/api/partners?pageSize=9999'); // Fetch all partners for dropdown
      const partnersData = await partnersResponse.json();
      if (partnersData.success) {
        setPartners(partnersData.data);
      }

      // Fetch Invoices (client)
      const invoicesResponse = await fetch('/api/invoices?pageSize=9999');
      const invoicesData = await invoicesResponse.json();
      if (invoicesData.success) {
        setInvoices(invoicesData.data);
      }

      // Fetch Carrier Invoices
      const carrierInvoicesResponse = await fetch('/api/carrier-invoices?pageSize=9999');
      const carrierInvoicesData = await carrierInvoicesResponse.json();
      if (carrierInvoicesData.success) {
        setCarrierInvoices(carrierInvoicesData.data);
      }

      // Fetch Bank Accounts
      const bankAccountsResponse = await fetch('/bank-accounts');
      const bankAccountsData = await bankAccountsResponse.json();
      if (bankAccountsData.success) {
        setBankAccounts(bankAccountsData.data);
      }
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/payments/${id}` : '/api/payments';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        navigate('/payments');
      } else {
        if (data.errors) {
          const newErrors: PaymentFormErrors = {};
          data.errors.forEach((err: { path?: keyof PaymentFormErrors; msg: string }) => {
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
      console.error('Error saving payment:', error);
      setErrors({ general: 'Impossible de se connecter au serveur.' });
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center py-10">Chargement du paiement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Modifier le Paiement' : 'Nouveau Paiement'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {isEditMode ? 'Mettez à jour les informations de ce paiement.' : 'Créez un nouveau paiement dans le système.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/payments')}
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
              {/* Payment Type */}
              <div className="sm:col-span-3">
                <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700">
                  Type de Paiement
                </label>
                <select
                  id="payment_type"
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="incoming">Entrant</option>
                  <option value="outgoing">Sortant</option>
                </select>
                {errors.payment_type && <p className="mt-2 text-sm text-red-600">{errors.payment_type}</p>}
              </div>

              {/* Reference */}
              <div className="sm:col-span-3">
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                  Référence
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="reference"
                    id="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.reference && <p className="mt-2 text-sm text-red-600">{errors.reference}</p>}
              </div>

              {/* Amount */}
              <div className="sm:col-span-3">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Montant
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
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
                    maxLength={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.currency && <p className="mt-2 text-sm text-red-600">{errors.currency}</p>}
              </div>

              {/* Payment Date */}
              <div className="sm:col-span-3">
                <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
                  Date de Paiement
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="payment_date"
                    id="payment_date"
                    value={formData.payment_date}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.payment_date && <p className="mt-2 text-sm text-red-600">{errors.payment_date}</p>}
              </div>

              {/* Due Date */}
              <div className="sm:col-span-3">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Date d'échéance
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="due_date"
                    id="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.due_date && <p className="mt-2 text-sm text-red-600">{errors.due_date}</p>}
              </div>

              {/* Status */}
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="failed">Échoué</option>
                  <option value="cancelled">Annulé</option>
                  <option value="refunded">Remboursé</option>
                </select>
                {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
              </div>

              {/* Payment Method */}
              <div className="sm:col-span-3">
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                  Méthode de Paiement
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="credit_card">Carte de crédit</option>
                  <option value="check">Chèque</option>
                  <option value="cash">Espèces</option>
                  <option value="direct_debit">Prélèvement automatique</option>
                  <option value="other">Autre</option>
                </select>
                {errors.payment_method && <p className="mt-2 text-sm text-red-600">{errors.payment_method}</p>}
              </div>

              {/* Partner */}
              <div className="sm:col-span-3">
                <label htmlFor="partner_id" className="block text-sm font-medium text-gray-700">
                  Partenaire
                </label>
                <select
                  id="partner_id"
                  name="partner_id"
                  value={formData.partner_id}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionner un partenaire</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
                {errors.partner_id && <p className="mt-2 text-sm text-red-600">{errors.partner_id}</p>}
              </div>

              {/* Invoice (Client) */}
              {formData.payment_type === 'incoming' && (
                <div className="sm:col-span-3">
                  <label htmlFor="invoice_id" className="block text-sm font-medium text-gray-700">
                    Facture Client
                  </label>
                  <select
                    id="invoice_id"
                    name="invoice_id"
                    value={formData.invoice_id}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                                      <option value="">Sélectionner une facture</option>
                    {invoices.map(invoice => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} ({invoice.total_amount} {invoice.currency})
                      </option>
                    ))}
                  </select>
                  {errors.invoice_id && <p className="mt-2 text-sm text-red-600">{errors.invoice_id}</p>}
                </div>
              )}

              {/* Carrier Invoice */}
              {formData.payment_type === 'outgoing' && (
                <div className="sm:col-span-3">
                  <label htmlFor="carrier_invoice_id" className="block text-sm font-medium text-gray-700">
                    Facture Transporteur
                  </label>
                  <select
                    id="carrier_invoice_id"
                    name="carrier_invoice_id"
                    value={formData.carrier_invoice_id}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Sélectionner une facture transporteur</option>
                    {carrierInvoices.map(cInvoice => (
                      <option key={cInvoice.id} value={cInvoice.id}>
                        {cInvoice.invoice_number} ({cInvoice.total_amount} {cInvoice.currency})
                      </option>
                    ))}
                  </select>
                  {errors.carrier_invoice_id && <p className="mt-2 text-sm text-red-600">{errors.carrier_invoice_id}</p>}
                </div>
              )}

              {/* Bank Account */}
              <div className="sm:col-span-3">
                <label htmlFor="bank_account_id" className="block text-sm font-medium text-gray-700">
                  Compte Bancaire
                </label>
                <select
                  id="bank_account_id"
                  name="bank_account_id"
                  value={formData.bank_account_id}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Sélectionner un compte bancaire</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} ({account.account_number})
                    </option>
                  ))}
                </select>
                {errors.bank_account_id && <p className="mt-2 text-sm text-red-600">{errors.bank_account_id}</p>}
              </div>

              {/* Transaction Reference */}
              <div className="sm:col-span-3">
                <label htmlFor="transaction_reference" className="block text-sm font-medium text-gray-700">
                  Référence de Transaction
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="transaction_reference"
                    id="transaction_reference"
                    value={formData.transaction_reference}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {errors.transaction_reference && <p className="mt-2 text-sm text-red-600">{errors.transaction_reference}</p>}
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
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
                    rows={3}
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
                  <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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

export default PaymentForm;


