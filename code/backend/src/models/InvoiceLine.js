const { Model } = require('objection');
const BaseModel = require('./BaseModel');

class InvoiceLine extends BaseModel {
  static get tableName() {
    return 'invoice_lines';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['invoice_id', 'description', 'quantity', 'unit_price', 'line_total'],
      properties: {
        id: { type: 'integer' },
        invoice_id: { type: 'integer' },
        
        // Description du service/produit
        description: { type: 'string', minLength: 1 },
        detailed_description: { type: 'string' },
        
        // Quantité et prix
        quantity: { type: 'number', minimum: 0 },
        unit_price: { type: 'number', minimum: 0 },
        line_total: { type: 'number', minimum: 0 },
        
        // Unité de mesure
        unit_of_measure: { 
          type: 'string',
          enum: ['kg', 'm3', 'km', 'hour', 'day', 'pallet', 'container', 'piece', 'percentage']
        },
        
        // Type de ligne
        line_type: {
          type: 'string',
          enum: ['transport', 'surcharge', 'tax', 'discount', 'other'],
          default: 'transport'
        },
        
        // Références
        order_id: { type: 'integer' },
        shipment_id: { type: 'integer' },
        segment_id: { type: 'integer' },
        rate_id: { type: 'integer' },
        surcharge_id: { type: 'integer' },
        
        // Informations de transport
        origin: { type: 'string' },
        destination: { type: 'string' },
        transport_mode: { 
          type: 'string',
          enum: ['road', 'sea', 'air', 'rail', 'multimodal']
        },
        service_date: { type: 'string', format: 'date' },
        
        // Taxes
        tax_rate: { type: 'number', minimum: 0, maximum: 100 },
        tax_amount: { type: 'number', minimum: 0 },
        is_tax_inclusive: { type: 'boolean', default: false },
        
        // Remise
        discount_rate: { type: 'number', minimum: 0, maximum: 100 },
        discount_amount: { type: 'number', minimum: 0 },
        
        // Métadonnées
        sort_order: { type: 'integer', default: 0 },
        is_billable: { type: 'boolean', default: true },
        
        // Relations
        tenant_id: { type: 'integer' },
        
        // Audit
        created_by: { type: 'integer' },
        updated_by: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Invoice = require('./Invoice');
    const Order = require('./Order');
    const Shipment = require('./Shipment');
    const TransportSegment = require('./TransportSegment');
    const Rate = require('./Rate');
    const Surcharge = require('./Surcharge');
    const Tenant = require('./Tenant');
    const User = require('./User');

    return {
      invoice: {
        relation: Model.BelongsToOneRelation,
        modelClass: Invoice,
        join: {
          from: 'invoice_lines.invoice_id',
          to: 'invoices.id'
        }
      },
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'invoice_lines.order_id',
          to: 'orders.id'
        }
      },
      shipment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shipment,
        join: {
          from: 'invoice_lines.shipment_id',
          to: 'shipments.id'
        }
      },
      segment: {
        relation: Model.BelongsToOneRelation,
        modelClass: TransportSegment,
        join: {
          from: 'invoice_lines.segment_id',
          to: 'transport_segments.id'
        }
      },
      rate: {
        relation: Model.BelongsToOneRelation,
        modelClass: Rate,
        join: {
          from: 'invoice_lines.rate_id',
          to: 'rates.id'
        }
      },
      surcharge: {
        relation: Model.BelongsToOneRelation,
        modelClass: Surcharge,
        join: {
          from: 'invoice_lines.surcharge_id',
          to: 'surcharges.id'
        }
      },
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'invoice_lines.tenant_id',
          to: 'tenants.id'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'invoice_lines.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'invoice_lines.updated_by',
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

  getNetAmount() {
    // Montant hors taxes
    if (this.is_tax_inclusive && this.tax_amount > 0) {
      return this.line_total - this.tax_amount;
    }
    return this.line_total - (this.tax_amount || 0);
  }

  getTaxAmount() {
    return this.tax_amount || 0;
  }

  getDiscountAmount() {
    return this.discount_amount || 0;
  }

  // Appliquer une remise
  applyDiscount(discountRate) {
    this.discount_rate = discountRate;
    this.calculateLineTotal();
  }

  // Appliquer une taxe
  applyTax(taxRate, isInclusive = false) {
    this.tax_rate = taxRate;
    this.is_tax_inclusive = isInclusive;
    this.calculateLineTotal();
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
    
    return description;
  }

  // Obtenir les détails de la ligne pour l'export
  getExportData() {
    return {
      description: this.getFormattedDescription(),
      quantity: this.quantity,
      unit_of_measure: this.unit_of_measure,
      unit_price: this.unit_price,
      discount_amount: this.getDiscountAmount(),
      net_amount: this.getNetAmount(),
      tax_rate: this.tax_rate,
      tax_amount: this.getTaxAmount(),
      line_total: this.line_total,
      line_type: this.line_type,
      transport_mode: this.transport_mode,
      service_date: this.service_date
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.calculateLineTotal();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
    this.calculateLineTotal();
  }
}

module.exports = InvoiceLine;

