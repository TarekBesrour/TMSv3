const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class CarrierInvoice extends BaseModel {
  static get tableName() {
    return 'carrier_invoices';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['invoice_number', 'carrier_id', 'invoice_date', 'currency', 'status'],
      properties: {
        id: { type: 'string' },
        invoice_number: { type: 'string', minLength: 1, maxLength: 50 },
        
        // Informations transporteur
        carrier_id: { type: 'string' },
        carrier_name: { type: 'string' },
        carrier_reference: { type: 'string' },
        
        // Informations de facturation
        invoice_date: { type: 'string', format: 'date' },
        due_date: { type: 'string', format: 'date' },
        received_date: { type: 'string', format: 'date-time' },
        
        // Montants
        subtotal: { type: 'number', minimum: 0 },
        tax_amount: { type: 'number', minimum: 0 },
        discount_amount: { type: 'number', minimum: 0 },
        total_amount: { type: 'number', minimum: 0 },
        
        // Montants de contrôle
        expected_amount: { type: 'number', minimum: 0 },
        variance_amount: { type: 'number' },
        variance_percentage: { type: 'number' },
        
        // Devise et taux de change
        currency: { type: 'string', minLength: 3, maxLength: 3 },
        exchange_rate: { type: 'number', minimum: 0 },
        base_currency: { type: 'string', minLength: 3, maxLength: 3 },
        
        // Statut et validation
        status: { 
          type: 'string', 
          enum: ['received', 'under_review', 'validated', 'disputed', 'approved', 'rejected', 'paid'] 
        },
        validation_status: {
          type: 'string',
          enum: ['pending', 'passed', 'failed', 'manual_review']
        },
        
        // Références aux expéditions
        shipment_ids: {
          type: 'array',
          items: { type: 'integer' }
        },
        contract_id: { type: 'string' },
        
        // Informations de contrôle
        control_date: { type: 'string', format: 'date-time' },
        controlled_by: { type: 'integer' },
        control_notes: { type: 'string' },
        
        // Anomalies détectées
        anomalies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              description: { type: 'string' },
              expected_value: { type: 'number' },
              actual_value: { type: 'number' },
              variance: { type: 'number' },
              line_reference: { type: 'string' }
            }
          }
        },
        
        // Approbation
        approved_by: { type: 'integer' },
        approved_date: { type: 'string', format: 'date-time' },
        approval_notes: { type: 'string' },
        
        // Rejet
        rejected_by: { type: 'integer' },
        rejected_date: { type: 'string', format: 'date-time' },
        rejection_reason: { type: 'string' },
        
        // Dispute
        disputed_by: { type: 'integer' },
        disputed_date: { type: 'string', format: 'date-time' },
        dispute_reason: { type: 'string' },
        dispute_resolution: { type: 'string' },
        
        // Paiement
        payment_date: { type: 'string', format: 'date' },
        payment_reference: { type: 'string' },
        payment_method: { 
          type: 'string', 
          enum: ['bank_transfer', 'check', 'credit_card', 'other'] 
        },
        
        // Documents
        original_document_path: { type: 'string' },
        processed_document_path: { type: 'string' },
        supporting_documents: {
          type: 'array',
          items: { type: 'string' }
        },
        
        // Informations de traitement
        processing_method: {
          type: 'string',
          enum: ['manual', 'ocr', 'edi', 'api', 'email']
        },
        ocr_confidence: { type: 'number', minimum: 0, maximum: 100 },
        requires_manual_review: { type: 'boolean', default: false },
        
        // Workflow
        workflow_step: { type: 'string' },
        next_action: { type: 'string' },
        assigned_to: { type: 'integer' },
        
        // Métadonnées
        tags: {
          type: 'array',
          items: { type: 'string' }
        },
        priority: {
          type: 'string',
          enum: ['low', 'normal', 'high', 'urgent'],
          default: 'normal'
        },
        
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
    const Contract = require('./Contract');
    const Shipment = require('./Shipment');
    const CarrierInvoiceLine = require('./CarrierInvoiceLine');
    const Payment = require('./Payment');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      carrier: {
        relation: Model.BelongsToOneRelation,
        modelClass: Partner,
        join: {
          from: 'carrier_invoices.carrier_id',
          to: 'partners.id'
        }
      },
      contract: {
        relation: Model.BelongsToOneRelation,
        modelClass: Contract,
        join: {
          from: 'carrier_invoices.contract_id',
          to: 'contracts.id'
        }
      },
      invoiceLines: {
        relation: Model.HasManyRelation,
        modelClass: CarrierInvoiceLine,
        join: {
          from: 'carrier_invoices.id',
          to: 'carrier_invoice_lines.carrier_invoice_id'
        }
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'carrier_invoices.id',
          to: 'payments.carrier_invoice_id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'carrier_invoices.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoices.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoices.updated_by',
          to: 'users.id'
        }
      },
      controlledBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoices.controlled_by',
          to: 'users.id'
        }
      },
      approvedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoices.approved_by',
          to: 'users.id'
        }
      },
      assignedTo: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoices.assigned_to',
          to: 'users.id'
        }
      }
    };
  }

  // Méthodes utilitaires
  isOverdue() {
    if (this.status === 'paid' || this.status === 'rejected') {
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

  hasAnomalies() {
    return this.anomalies && this.anomalies.length > 0;
  }

  getCriticalAnomalies() {
    return (this.anomalies || []).filter(a => a.severity === 'critical');
  }

  getHighAnomalies() {
    return (this.anomalies || []).filter(a => ['high', 'critical'].includes(a.severity));
  }

  canBeApproved() {
    return ['validated'].includes(this.status) && 
           this.validation_status === 'passed';
  }

  canBeRejected() {
    return ['received', 'under_review', 'validated', 'disputed'].includes(this.status);
  }

  canBeDisputed() {
    return ['validated'].includes(this.status) && 
           this.hasAnomalies();
  }

  canBePaid() {
    return this.status === 'approved';
  }

  // Calculer la variance
  calculateVariance() {
    if (this.expected_amount && this.total_amount) {
      this.variance_amount = this.total_amount - this.expected_amount;
      this.variance_percentage = this.expected_amount > 0 ? 
        (this.variance_amount / this.expected_amount) * 100 : 0;
    }
  }

  // Ajouter une anomalie
  addAnomaly(anomaly) {
    if (!this.anomalies) {
      this.anomalies = [];
    }
    
    this.anomalies.push({
      type: anomaly.type,
      severity: anomaly.severity,
      description: anomaly.description,
      expected_value: anomaly.expected_value,
      actual_value: anomaly.actual_value,
      variance: anomaly.variance,
      line_reference: anomaly.line_reference,
      detected_at: new Date().toISOString()
    });
  }

  // Obtenir le niveau de risque
  getRiskLevel() {
    const criticalAnomalies = this.getCriticalAnomalies().length;
    const highAnomalies = this.getHighAnomalies().length;
    const variancePercentage = Math.abs(this.variance_percentage || 0);

    if (criticalAnomalies > 0 || variancePercentage > 20) {
      return 'critical';
    } else if (highAnomalies > 0 || variancePercentage > 10) {
      return 'high';
    } else if (this.hasAnomalies() || variancePercentage > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Marquer comme nécessitant une révision manuelle
  requireManualReview(reason) {
    this.requires_manual_review = true;
    this.status = 'under_review';
    this.control_notes = (this.control_notes || '') + `\nRévision manuelle requise: ${reason}`;
  }

  // Approuver la facture
  approve(userId, notes = '') {
    this.status = 'approved';
    this.approved_by = userId;
    this.approved_date = new Date().toISOString();
    this.approval_notes = notes;
    this.next_action = 'payment';
  }

  // Rejeter la facture
  reject(userId, reason) {
    this.status = 'rejected';
    this.rejected_by = userId;
    this.rejected_date = new Date().toISOString();
    this.rejection_reason = reason;
    this.next_action = 'return_to_carrier';
  }

  // Disputer la facture
  dispute(userId, reason) {
    this.status = 'disputed';
    this.disputed_by = userId;
    this.disputed_date = new Date().toISOString();
    this.dispute_reason = reason;
    this.next_action = 'resolve_dispute';
  }

  // Marquer comme payée
  markAsPaid(paymentData) {
    this.status = 'paid';
    this.payment_date = paymentData.payment_date;
    this.payment_reference = paymentData.payment_reference;
    this.payment_method = paymentData.payment_method;
    this.next_action = null;
  }

  // Convertir en devise de base
  convertToBaseCurrency() {
    if (this.currency === this.base_currency || !this.exchange_rate) {
      return {
        subtotal: this.subtotal,
        tax_amount: this.tax_amount,
        discount_amount: this.discount_amount,
        total_amount: this.total_amount,
        expected_amount: this.expected_amount,
        variance_amount: this.variance_amount
      };
    }

    return {
      subtotal: this.subtotal * this.exchange_rate,
      tax_amount: this.tax_amount * this.exchange_rate,
      discount_amount: this.discount_amount * this.exchange_rate,
      total_amount: this.total_amount * this.exchange_rate,
      expected_amount: this.expected_amount * this.exchange_rate,
      variance_amount: this.variance_amount * this.exchange_rate
    };
  }

    // Obtenir le résumé de contrôle
  getControlSummary() {
    return {
      invoice_id: this.id,
      invoice_number: this.invoice_number,
      carrier_name: this.carrier_name,
      total_amount: this.total_amount,
      expected_amount: this.expected_amount,
      variance_amount: this.variance_amount,
      variance_percentage: this.variance_percentage,
      status: this.status,
      validation_status: this.validation_status,
      risk_level: this.getRiskLevel(),
      anomalies_count: (this.anomalies || []).length,
      critical_anomalies_count: this.getCriticalAnomalies().length,
      requires_manual_review: this.requires_manual_review,
      is_overdue: this.isOverdue(),
      days_overdue: this.getDaysOverdue()
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.calculateVariance();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
    this.calculateVariance();
  }
}

module.exports = CarrierInvoice;

