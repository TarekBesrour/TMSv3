const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class Invoice extends BaseModel {
  static get tableName() {
    return 'invoices';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['invoice_number', 'customer_id', 'invoice_date', 'due_date', 'currency', 'status'],
      properties: {
        id: { type: 'string' },
        invoice_number: { type: 'string', minLength: 1, maxLength: 50 },
        
        // Informations client
        customer_id: { type: 'string' },
        customer_name: { type: 'string' },
        customer_address: { type: 'string' },
        customer_tax_number: { type: 'string' },
        
        // Informations de facturation
        invoice_date: { type: 'string', format: 'date' },
        due_date: { type: 'string', format: 'date' },
        payment_terms: { type: 'integer', minimum: 0 }, // jours
        
        // Montants
        subtotal: { type: 'number', minimum: 0 },
        tax_amount: { type: 'number', minimum: 0 },
        discount_amount: { type: 'number', minimum: 0 },
        total_amount: { type: 'number', minimum: 0 },
        paid_amount: { type: 'number', minimum: 0, default: 0 },
        outstanding_amount: { type: 'number', minimum: 0 },
        
        // Devise et taux de change
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        exchange_rate: { type: 'number', minimum: 0 },
        base_currency: { type: 'string', minLength: 3, maxLength: 3 },
        
        // Statut et type
        status: { 
          type: 'string', 
          enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'] 
        },
        invoice_type: { 
          type: 'string', 
          enum: ['standard', 'proforma', 'credit_note', 'debit_note'], 
          default: 'standard' 
        },
        
        // Références
        order_ids: {
          type: 'array',
          items: { type: 'integer' }
        },
        shipment_ids: {
          type: 'array',
          items: { type: 'integer' }
        },
        contract_id: { type: 'string' },
        
        // Informations de paiement
        payment_method: { 
          type: 'string', 
          enum: ['bank_transfer', 'credit_card', 'check', 'cash', 'other'] 
        },
        payment_reference: { type: 'string' },
        payment_date: { type: 'string', format: 'date' },
        
        // Informations fiscales
        tax_rate: { type: 'number', minimum: 0, maximum: 100 },
        tax_type: { type: 'string' },
        reverse_charge: { type: 'boolean', default: false },
        
        // Remises
        discount_type: { 
          type: 'string', 
          enum: ['percentage', 'fixed_amount'] 
        },
        discount_value: { type: 'number', minimum: 0 },
        discount_reason: { type: 'string' },
        
        // Dates importantes
        sent_date: { type: 'string', format: 'date-time' },
        viewed_date: { type: 'string', format: 'date-time' },
        first_reminder_date: { type: 'string', format: 'date-time' },
        last_reminder_date: { type: 'string', format: 'date-time' },
        
        // Informations de livraison
        delivery_method: { 
          type: 'string', 
          enum: ['email', 'postal', 'portal', 'api'] 
        },
        delivery_address: { type: 'string' },
        delivery_status: { 
          type: 'string', 
          enum: ['pending', 'sent', 'delivered', 'failed'] 
        },
        
        // Notes et commentaires
        notes: { type: 'string' },
        internal_notes: { type: 'string' },
        payment_instructions: { type: 'string' },
        
        // Informations de génération
        generated_from: { 
          type: 'string', 
          enum: ['manual', 'automatic', 'recurring', 'api'] 
        },
        template_id: { type: 'string' },
        
        // Métadonnées
        is_recurring: { type: 'boolean', default: false },
        recurring_frequency: { 
          type: 'string', 
          enum: ['weekly', 'monthly', 'quarterly', 'yearly'] 
        },
        next_invoice_date: { type: 'string', format: 'date' },
        
        // Relations
        tenant_id: { type: 'string' },
        
        // Audit
        created_by: { type: ['integer','string'] },
        updated_by: { type: ['integer','string'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Partner = require('./Partner');
    const Order = require('./Order');
    const Shipment = require('./Shipment');
    const Contract = require('./Contract');
    const InvoiceLine = require('./InvoiceLine');
    const Payment = require('./Payment');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'invoices.customer_id',
          to: 'partners.id'
        }
      },
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        join: {
          from: 'invoices.contract_id',
          to: 'contracts.id'
        }
      },
      invoiceLines: {
        relation: Model.HasManyRelation,
        modelClass: InvoiceLine,
        join: {
          from: 'invoices.id',
          to: 'invoice_lines.invoice_id'
        }
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'invoices.id',
          to: 'payments.invoice_id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'invoices.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'invoices.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'invoices.updated_by',
          to: 'users.id'
        }
      }
    };
  }

  // Méthodes utilitaires
  isOverdue() {
    if (this.status === 'paid' || this.status === 'cancelled') {
      return false;
    }
    return new Date() > new Date(this.due_date);
  }

  getDaysOverdue() {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const dueDate = new Date(this.due_date);
    return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  }

  getPaymentStatus() {
    if (this.paid_amount === 0) return 'unpaid';
    if (this.paid_amount >= this.total_amount) return 'paid';
    return 'partially_paid';
  }

  calculateOutstandingAmount() {
    return Math.max(0, this.total_amount - this.paid_amount);
  }

  canBePaid() {
    return ['sent', 'viewed', 'overdue'].includes(this.status) && 
           this.outstanding_amount > 0;
  }

  canBeCancelled() {
    return ['draft', 'sent', 'viewed'].includes(this.status) && 
           this.paid_amount === 0;
  }

  canBeRefunded() {
    return this.status === 'paid' && this.paid_amount > 0;
  }

  // Calculer les totaux
  calculateTotals() {
    this.outstanding_amount = this.calculateOutstandingAmount();
    
    // Mettre à jour le statut si nécessaire
    if (this.paid_amount >= this.total_amount && this.status !== 'paid') {
      this.status = 'paid';
    } else if (this.isOverdue() && this.status === 'sent') {
      this.status = 'overdue';
    }
  }

  // Appliquer une remise
  applyDiscount(discountType, discountValue, reason = '') {
    this.discount_type = discountType;
    this.discount_value = discountValue;
    this.discount_reason = reason;

    if (discountType === 'percentage') {
      this.discount_amount = this.subtotal * (discountValue / 100);
    } else {
      this.discount_amount = discountValue;
    }

    // Recalculer le total
    this.total_amount = this.subtotal - this.discount_amount + this.tax_amount;
    this.calculateTotals();
  }

  // Calculer les taxes
  calculateTax(taxRate, taxType = 'VAT') {
    this.tax_rate = taxRate;
    this.tax_type = taxType;
    
    const taxableAmount = this.subtotal - this.discount_amount;
    this.tax_amount = taxableAmount * (taxRate / 100);
    
    // Recalculer le total
    this.total_amount = taxableAmount + this.tax_amount;
    this.calculateTotals();
  }

  // Convertir en devise de base
  convertToBaseCurrency() {
    if (this.currency === this.base_currency || !this.exchange_rate) {
      return {
        subtotal: this.subtotal,
        tax_amount: this.tax_amount,
        discount_amount: this.discount_amount,
        total_amount: this.total_amount,
        paid_amount: this.paid_amount,
        outstanding_amount: this.outstanding_amount
      };
    }

    return {
      subtotal: this.subtotal * this.exchange_rate,
      tax_amount: this.tax_amount * this.exchange_rate,
      discount_amount: this.discount_amount * this.exchange_rate,
      total_amount: this.total_amount * this.exchange_rate,
      paid_amount: this.paid_amount * this.exchange_rate,
      outstanding_amount: this.outstanding_amount * this.exchange_rate
    };
  }

  // Générer le numéro de facture suivant
  static async generateInvoiceNumber(tenantId, prefix = 'INV') {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Compter les factures du mois
    const count = await Invoice.query()
      .where('tenant_id', tenantId)
      .where('invoice_number', 'like', `${prefix}-${year}${month}%`)
      .count('* as count')
      .first();

    const sequence = String(parseInt(count.count) + 1).padStart(4, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.calculateTotals();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
    this.calculateTotals();
  }
}

module.exports = Invoice;

