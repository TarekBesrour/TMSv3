const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class CarrierInvoiceLine extends BaseModel {
  static get tableName() {
    return 'carrier_invoice_lines';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['carrier_invoice_id', 'description', 'quantity', 'unit_price', 'line_total'],
      properties: {
        id: { type: 'string' },
        carrier_invoice_id: { type: 'string' },
        
        // Description du service
        description: { type: 'string', minLength: 1 },
        detailed_description: { type: 'string' },
        service_code: { type: 'string' },
        
        // Quantité et prix
        quantity: { type: 'number', minimum: 0 },
        unit_price: { type: 'number', minimum: 0 },
        line_total: { type: 'number', minimum: 0 },
        
        // Prix attendu et variance
        expected_unit_price: { type: 'number', minimum: 0 },
        expected_line_total: { type: 'number', minimum: 0 },
        price_variance: { type: 'number' },
        price_variance_percentage: { type: 'number' },
        
        // Unité de mesure
        unit_of_measure: { 
          type: 'string',
          enum: ['kg', 'm3', 'km', 'hour', 'day', 'pallet', 'container', 'piece', 'percentage']
        },
        
        // Type de ligne
        line_type: {
          type: 'string',
          enum: ['transport', 'surcharge', 'tax', 'discount', 'penalty', 'other'],
          default: 'transport'
        },
        
        // Références
        shipment_id: { type: 'string' },
        segment_id: { type: 'string' },
        rate_id: { type: 'string' },
        surcharge_id: { type: 'string' },
        contract_line_id: { type: 'string' },
        
        // Informations de transport
        origin: { type: 'string' },
        destination: { type: 'string' },
        transport_mode: { 
          type: 'string',
          enum: ['road', 'sea', 'air', 'rail', 'multimodal']
        },
        service_date: { type: 'string', format: 'date' },
        
        // Validation
        validation_status: {
          type: 'string',
          enum: ['pending', 'validated', 'disputed', 'corrected'],
          default: 'pending'
        },
        validation_notes: { type: 'string' },
        
        // Anomalies spécifiques à la ligne
        has_anomaly: { type: 'boolean', default: false },
        anomaly_type: {
          type: 'string',
          enum: ['price_variance', 'quantity_mismatch', 'service_not_contracted', 'duplicate_charge', 'missing_service', 'other']
        },
        anomaly_description: { type: 'string' },
        anomaly_severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical']
        },
        
        // Taxes
        tax_rate: { type: 'number', minimum: 0, maximum: 100 },
        tax_amount: { type: 'number', minimum: 0 },
        is_tax_inclusive: { type: 'boolean', default: false },
        
        // Remise
        discount_rate: { type: 'number', minimum: 0, maximum: 100 },
        discount_amount: { type: 'number', minimum: 0 },
        
        // Informations de mesure
        weight: { type: 'number', minimum: 0 },
        volume: { type: 'number', minimum: 0 },
        distance: { type: 'number', minimum: 0 },
        duration: { type: 'number', minimum: 0 }, // en heures
        
        // Correction
        corrected_unit_price: { type: 'number', minimum: 0 },
        corrected_line_total: { type: 'number', minimum: 0 },
        correction_reason: { type: 'string' },
        corrected_by: { type: 'integer' },
        corrected_date: { type: 'string', format: 'date-time' },
        
        // Approbation
        approved: { type: 'boolean', default: false },
        approved_by: { type: 'integer' },
        approved_date: { type: 'string', format: 'date-time' },
        approval_notes: { type: 'string' },
        
        // Métadonnées
        sort_order: { type: 'integer', default: 0 },
        is_billable: { type: 'boolean', default: true },
        reference_number: { type: 'string' },
        
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
    const CarrierInvoice = require('./CarrierInvoice');
    const Shipment = require('./Shipment');
    const TransportSegment = require('./TransportSegment');
    const Rate = require('./Rate');
    const Surcharge = require('./Surcharge');
    const ContractLine = require('./ContractLine');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      carrierInvoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: CarrierInvoice,
        join: {
          from: 'carrier_invoice_lines.carrier_invoice_id',
          to: 'carrier_invoices.id'
        }
      },
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'carrier_invoice_lines.shipment_id',
          to: 'shipments.id'
        }
      },
      segment: {
        relation: Model.BelongsToOneRelation,
        modelClass: TransportSegment,
        join: {
          from: 'carrier_invoice_lines.segment_id',
          to: 'transport_segments.id'
        }
      },
      rate: {
        relation: Model.BelongsToOneRelation,
        modelClass: Rate,
        join: {
          from: 'carrier_invoice_lines.rate_id',
          to: 'rates.id'
        }
      },
      surcharge: {
        relation: Model.BelongsToOneRelation,
        modelClass: Surcharge,
        join: {
          from: 'carrier_invoice_lines.surcharge_id',
          to: 'surcharges.id'
        }
      },
      contractLine: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContractLine,
        join: {
          from: 'carrier_invoice_lines.contract_line_id',
          to: 'contract_lines.id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'carrier_invoice_lines.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoice_lines.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoice_lines.updated_by',
          to: 'users.id'
        }
      },
      correctedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoice_lines.corrected_by',
          to: 'users.id'
        }
      },
      approvedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'carrier_invoice_lines.approved_by',
          to: 'users.id'
        }
      }
    };
  }

  // Méthodes utilitaires
  calculateLineTotal() {
    let total = this.quantity * this.unit_price;
    
    // Appliquer la remise
    if (this.discount_rate > 0) {
      this.discount_amount = total * (this.discount_rate / 100);
      total -= this.discount_amount;
    } else if (this.discount_amount > 0) {
      total -= this.discount_amount;
    }
    
    // Calculer les taxes
    if (this.tax_rate > 0) {
      if (this.is_tax_inclusive) {
        // Prix TTC, extraire la taxe
        this.tax_amount = total * (this.tax_rate / (100 + this.tax_rate));
      } else {
        // Prix HT, ajouter la taxe
        this.tax_amount = total * (this.tax_rate / 100);
        total += this.tax_amount;
           }
    }
    
    this.line_total = total;
    return total;
  }

  // Calculer la variance de prix
  calculatePriceVariance() {
    if (this.expected_unit_price && this.unit_price) {
      this.price_variance = this.unit_price - this.expected_unit_price;
      this.price_variance_percentage = this.expected_unit_price > 0 ? 
        (this.price_variance / this.expected_unit_price) * 100 : 0;
    }

    if (this.expected_line_total && this.line_total) {
      const lineVariance = this.line_total - this.expected_line_total;
      const lineVariancePercentage = this.expected_line_total > 0 ? 
        (lineVariance / this.expected_line_total) * 100 : 0;
      
      // Utiliser la variance de ligne si elle est plus significative
      if (Math.abs(lineVariancePercentage) > Math.abs(this.price_variance_percentage || 0)) {
        this.price_variance = lineVariance;
        this.price_variance_percentage = lineVariancePercentage;
      }
    }
  }

  // Détecter les anomalies
  detectAnomalies() {
    const anomalies = [];

    // Variance de prix significative
    if (Math.abs(this.price_variance_percentage || 0) > 10) {
      anomalies.push({
        type: 'price_variance',
        severity: Math.abs(this.price_variance_percentage) > 25 ? 'critical' : 'high',
        description: `Variance de prix de ${this.price_variance_percentage.toFixed(2)}%`,
        expected_value: this.expected_unit_price,
        actual_value: this.unit_price,
        variance: this.price_variance
      });
    }

    // Prix unitaire anormalement élevé
    if (this.expected_unit_price && this.unit_price > this.expected_unit_price * 2) {
      anomalies.push({
        type: 'price_variance',
        severity: 'critical',
        description: 'Prix unitaire anormalement élevé (plus du double du prix attendu)',
        expected_value: this.expected_unit_price,
        actual_value: this.unit_price,
        variance: this.price_variance
      });
    }

    // Quantité anormale
    if (this.quantity <= 0) {
      anomalies.push({
        type: 'quantity_mismatch',
        severity: 'high',
        description: 'Quantité nulle ou négative',
        expected_value: 1,
        actual_value: this.quantity,
        variance: this.quantity - 1
      });
    }

    // Service non contractuel (si pas de rate_id ou contract_line_id)
    if (!this.rate_id && !this.contract_line_id && this.line_type === 'transport') {
      anomalies.push({
        type: 'service_not_contracted',
        severity: 'medium',
        description: 'Service de transport sans référence tarifaire',
        expected_value: null,
        actual_value: this.unit_price,
        variance: this.unit_price
      });
    }

    return anomalies;
  }

  // Marquer comme ayant une anomalie
  markAsAnomaly(type, severity, description) {
    this.has_anomaly = true;
    this.anomaly_type = type;
    this.anomaly_severity = severity;
    this.anomaly_description = description;
    this.validation_status = 'disputed';
  }

  // Corriger la ligne
  correct(correctedUnitPrice, reason, userId) {
    this.corrected_unit_price = correctedUnitPrice;
    this.corrected_line_total = this.quantity * correctedUnitPrice;
    this.correction_reason = reason;
    this.corrected_by = userId;
    this.corrected_date = new Date().toISOString();
    this.validation_status = 'corrected';
  }

  // Approuver la ligne
  approve(userId, notes = '') {
    this.approved = true;
    this.approved_by = userId;
    this.approved_date = new Date().toISOString();
    this.approval_notes = notes;
    this.validation_status = 'validated';
  }

  // Obtenir le montant final (corrigé ou original)
  getFinalAmount() {
    return this.corrected_line_total || this.line_total;
  }

  // Obtenir le prix unitaire final
  getFinalUnitPrice() {
    return this.corrected_unit_price || this.unit_price;
  }

  // Vérifier si la ligne nécessite une attention
  requiresAttention() {
    return this.has_anomaly || 
           Math.abs(this.price_variance_percentage || 0) > 5 ||
           this.validation_status === 'disputed';
  }

  // Obtenir le niveau de risque de la ligne
  getRiskLevel() {
    if (this.anomaly_severity === 'critical' || Math.abs(this.price_variance_percentage || 0) > 25) {
      return 'critical';
    } else if (this.anomaly_severity === 'high' || Math.abs(this.price_variance_percentage || 0) > 15) {
      return 'high';
    } else if (this.has_anomaly || Math.abs(this.price_variance_percentage || 0) > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Formater la description pour l'affichage
  getFormattedDescription() {
    let description = this.description;
    
    if (this.origin && this.destination) {
      description += ` (${this.origin} → ${this.destination})`;
    }
    
    if (this.service_date) {
      description += ` - ${new Date(this.service_date).toLocaleDateString()}`;
    }
    
    if (this.reference_number) {
      description += ` [Réf: ${this.reference_number}]`;
    }
    
    return description;
  }

  // Obtenir les détails de validation
  getValidationDetails() {
    return {
      line_id: this.id,
      description: this.getFormattedDescription(),
      unit_price: this.unit_price,
      expected_unit_price: this.expected_unit_price,
      line_total: this.line_total,
      expected_line_total: this.expected_line_total,
      price_variance: this.price_variance,
      price_variance_percentage: this.price_variance_percentage,
      validation_status: this.validation_status,
      has_anomaly: this.has_anomaly,
      anomaly_type: this.anomaly_type,
      anomaly_severity: this.anomaly_severity,
      risk_level: this.getRiskLevel(),
      requires_attention: this.requiresAttention(),
      is_corrected: !!this.corrected_unit_price,
      is_approved: this.approved
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.calculateLineTotal();
    this.calculatePriceVariance();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
    this.calculateLineTotal();
    this.calculatePriceVariance();
  }
}

module.exports = CarrierInvoiceLine;

