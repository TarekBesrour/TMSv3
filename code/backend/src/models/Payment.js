const { Model } = require(\'objection\');

class Payment extends Model {
  static get tableName() {
    return \'payments\';
  }

  static get idColumn() {
    return \'id\';
  }

  static get jsonSchema() {
    return {
      type: \'object\',
      required: [\'tenant_id\', \'payment_type\', \'amount\', \'currency\', \'payment_date\', \'status\'],
      properties: {
        id: { type: \'integer\' },
        tenant_id: { type: \'integer\' },
        payment_type: { 
          type: \'string\', 
          enum: [\'incoming\', \'outgoing\'] 
        },
        reference: { type: \'string\', maxLength: 100 },
        
        // Relations
        invoice_id: { type: [\'integer\', \'null\'] },
        carrier_invoice_id: { type: [\'integer\', \'null\'] },
        partner_id: { type: \'integer\' },
        
        // Montants
        amount: { type: \'number\', minimum: 0 },
        currency: { type: \'string\', maxLength: 3 },
        exchange_rate: { type: [\'number\', \'null\'], minimum: 0 },
        amount_base_currency: { type: [\'number\', \'null\'], minimum: 0 },
        
        // Dates
        payment_date: { type: \'string\', format: \'date\' },
        due_date: { type: [\'string\', \'null\'], format: \'date\' },
        
        // Statut et méthode
        status: { 
          type: \'string\', 
          enum: [\'pending\', \'processing\', \'completed\', \'failed\', \'cancelled\', \'refunded\'] 
        },
        payment_method: { 
          type: \'string\', 
          enum: [\'bank_transfer\', \'credit_card\', \'check\', \'cash\', \'direct_debit\', \'other\'] 
        },
        
        // Informations bancaires
        bank_account_id: { type: [\'integer\', \'null\'] },
        transaction_reference: { type: [\'string\', \'null\'], maxLength: 255 },
        
        // Descriptions et notes
        description: { type: [\'string\', \'null\'] },
        notes: { type: [\'string\', \'null\'] },
        
        // Audit
        created_by: { type: \'integer\' },
        updated_by: { type: \'integer\' },
        created_at: { type: \'string\', format: \'date-time\' },
        updated_at: { type: \'string\', format: \'date-time\' }
      }
    };
  }

  static get relationMappings() {
    const Invoice = require(\'./Invoice\');
    const CarrierInvoice = require(\'./CarrierInvoice\');
    const Partner = require(\'./Partner\');
    const User = require(\'./User\');
    const BankAccount = require(\'./BankAccount\');

    return {
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: Invoice,
        join: {
          from: \'payments.invoice_id\',
          to: \'invoices.id\'
        }
      },
      carrierInvoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: CarrierInvoice,
        join: {
          from: \'payments.carrier_invoice_id\',
          to: \'carrier_invoices.id\'
        }
      },
      partner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: \'payments.partner_id\',
          to: \'partners.id\'
        }
      },
      bankAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: BankAccount,
        join: {
          from: \'payments.bank_account_id\',
          to: \'bank_accounts.id\'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: \'payments.created_by\',
          to: \'users.id\'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: \'payments.updated_by\',
          to: \'users.id\'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    
    // Générer une référence si elle n\'est pas fournie
    if (!this.reference) {
      const prefix = this.payment_type === \'incoming\' ? \'PAY-IN\' : \'PAY-OUT\';
      const timestamp = Date.now();
      this.reference = `${prefix}-${timestamp}`;
    }
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Méthodes utilitaires
  isOverdue() {
    if (!this.due_date || this.status === \'completed\') {
      return false;
    }
    return new Date(this.due_date) < new Date();
  }

  getDaysOverdue() {
    if (!this.isOverdue()) {
      return 0;
    }
    const today = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getAmountInBaseCurrency() {
    if (this.amount_base_currency !== null) {
      return this.amount_base_currency;
    }
    if (this.exchange_rate) {
      return this.amount * this.exchange_rate;
    }
    return this.amount; // Assume same currency
  }

  canBeCancelled() {
    return [\'pending\', \'processing\'].includes(this.status);
  }

  canBeRefunded() {
    return this.status === \'completed\' && this.payment_type === \'incoming\';
  }

  getStatusLabel() {
    const statusLabels = {
      pending: \'En attente\',
      processing: \'En cours\',
      completed: \'Terminé\',
      failed: \'Échoué\',
      cancelled: \'Annulé\',
      refunded: \'Remboursé\'
    };
    return statusLabels[this.status] || this.status;
  }

  getPaymentMethodLabel() {
    const methodLabels = {
      bank_transfer: \'Virement bancaire\',
      credit_card: \'Carte de crédit\',
      check: \'Chèque\',
      cash: \'Espèces\',
      direct_debit: \'Prélèvement automatique\',
      other: \'Autre\'
    };
    return methodLabels[this.payment_method] || this.payment_method;
  }

  // Validation métier
  static async validatePayment(paymentData) {
    const errors = [];

    // Vérifier que le montant est positif
    if (paymentData.amount <= 0) {
      errors.push(\'Le montant doit être positif\');
    }

    // Vérifier la cohérence des relations
    if (paymentData.payment_type === \'incoming\' && !paymentData.invoice_id) {
      errors.push(\'Un paiement entrant doit être lié à une facture client\');
    }

    if (paymentData.payment_type === \'outgoing\' && !paymentData.carrier_invoice_id) {
      errors.push(\'Un paiement sortant doit être lié à une facture transporteur\');
    }

    // Vérifier les dates
    if (paymentData.due_date && paymentData.payment_date) {
      const paymentDate = new Date(paymentData.payment_date);
      const dueDate = new Date(paymentData.due_date);
      if (paymentDate > dueDate && paymentData.status === \'pending\') {
        errors.push(\'La date de paiement ne peut pas être postérieure à la date d\'échéance pour un paiement en attente\');
      }
    }

    return errors;
  }
}

module.exports = Payment;

