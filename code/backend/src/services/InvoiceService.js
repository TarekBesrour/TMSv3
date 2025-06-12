const Invoice = require('../models/Invoice');
const InvoiceLine = require('../models/InvoiceLine');
const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Partner = require('../models/Partner');
const CostCalculationService = require('./CostCalculationService');

class InvoiceService {
  // Créer une nouvelle facture
  async createInvoice(invoiceData, userId, tenantId) {
    try {
      // Générer le numéro de facture si non fourni
      if (!invoiceData.invoice_number) {
        invoiceData.invoice_number = await Invoice.generateInvoiceNumber(tenantId);
      }

      // Validation des données
      const validation = await this.validateInvoiceData(invoiceData);
      if (!validation.is_valid) {
        throw new Error(`Données de facture invalides: ${validation.errors.join(', ')}`);
      }

      const invoice = await Invoice.query().insert({
        ...invoiceData,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId,
        outstanding_amount: invoiceData.total_amount || 0
      });

      return await this.getInvoiceById(invoice.id);
    } catch (error) {
      throw new Error(`Erreur lors de la création de la facture: ${error.message}`);
    }
  }

  // Obtenir une facture par ID
  async getInvoiceById(invoiceId) {
    try {
      const invoice = await Invoice.query()
        .findById(invoiceId)
        .withGraphFetched('[customer, contract, invoiceLines.[order, shipment, segment, rate, surcharge], payments, createdBy, updatedBy]');

      if (!invoice) {
        throw new Error('Facture non trouvée');
      }

      return invoice;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la facture: ${error.message}`);
    }
  }

  // Obtenir toutes les factures avec filtres et pagination
  async getInvoices(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = Invoice.query()
        .withGraphFetched('[customer, contract, invoiceLines, payments]')
        .orderBy('invoice_date', 'desc');

      // Application des filtres
      if (filters.tenant_id) {
        query = query.where('tenant_id', filters.tenant_id);
      }

      if (filters.customer_id) {
        query = query.where('customer_id', filters.customer_id);
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.whereIn('status', filters.status);
        } else {
          query = query.where('status', filters.status);
        }
      }

      if (filters.invoice_type) {
        query = query.where('invoice_type', filters.invoice_type);
      }

      if (filters.currency) {
        query = query.where('currency', filters.currency);
      }

      if (filters.start_date) {
        query = query.where('invoice_date', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('invoice_date', '<=', filters.end_date);
      }

      if (filters.due_start_date) {
        query = query.where('due_date', '>=', filters.due_start_date);
      }

      if (filters.due_end_date) {
        query = query.where('due_date', '<=', filters.due_end_date);
      }

      if (filters.min_amount) {
        query = query.where('total_amount', '>=', filters.min_amount);
      }

      if (filters.max_amount) {
        query = query.where('total_amount', '<=', filters.max_amount);
      }

      if (filters.overdue === true) {
        query = query.where('due_date', '<', new Date().toISOString().split('T')[0])
          .whereNotIn('status', ['paid', 'cancelled']);
      }

      if (filters.search) {
        query = query.where(builder => {
          builder.where('invoice_number', 'ilike', `%${filters.search}%`)
            .orWhere('customer_name', 'ilike', `%${filters.search}%`)
            .orWhere('notes', 'ilike', `%${filters.search}%`);
        });
      }

      // Pagination
      const total = await query.resultSize();
      const invoices = await query.page(page - 1, limit);

      return {
        data: invoices.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des factures: ${error.message}`);
    }
  }

  // Mettre à jour une facture
  async updateInvoice(invoiceId, updateData, userId) {
    try {
      const invoice = await Invoice.query().findById(invoiceId);
      if (!invoice) {
        throw new Error('Facture non trouvée');
      }

      // Vérifier si la facture peut être modifiée
      if (!this.canBeModified(invoice)) {
        throw new Error('Cette facture ne peut plus être modifiée');
      }

      // Validation des données mises à jour
      const validation = await this.validateInvoiceData(updateData);
      if (!validation.is_valid) {
        throw new Error(`Données de facture invalides: ${validation.errors.join(', ')}`);
      }

      const updatedInvoice = await Invoice.query()
        .patchAndFetchById(invoiceId, {
          ...updateData,
          updated_by: userId
        });

      return await this.getInvoiceById(updatedInvoice.id);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la facture: ${error.message}`);
    }
  }

  // Supprimer une facture
  async deleteInvoice(invoiceId) {
    try {
      const invoice = await Invoice.query().findById(invoiceId);
      if (!invoice) {
        throw new Error('Facture non trouvée');
      }

      if (!this.canBeDeleted(invoice)) {
        throw new Error('Cette facture ne peut pas être supprimée');
      }

      // Supprimer les lignes de facture associées
      await InvoiceLine.query().where('invoice_id', invoiceId).delete();

      // Supprimer la facture
      await Invoice.query().deleteById(invoiceId);

      return { message: 'Facture supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la facture: ${error.message}`);
    }
  }

  // Générer une facture automatiquement à partir d'expéditions
  async generateInvoiceFromShipments(shipmentIds, invoiceData, userId, tenantId) {
    try {
      // Récupérer les expéditions
      const shipments = await Shipment.query()
        .whereIn('id', shipmentIds)
        .where('tenant_id', tenantId)
        .withGraphFetched('[order, customer]');

      if (shipments.length === 0) {
        throw new Error('Aucune expédition trouvée');
      }

      // Vérifier que toutes les expéditions appartiennent au même client
      const customerId = shipments[0].customer_id;
      if (!shipments.every(s => s.customer_id === customerId)) {
        throw new Error('Toutes les expéditions doivent appartenir au même client');
      }

      // Récupérer les informations du client
      const customer = await Partner.query().findById(customerId);
      if (!customer) {
        throw new Error('Client non trouvé');
      }

      // Créer la facture
      const invoice = await this.createInvoice({
        customer_id: customerId,
        customer_name: customer.name,
        customer_address: customer.billing_address || customer.address,
        customer_tax_number: customer.tax_number,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: this.calculateDueDate(customer.payment_terms || 30),
        payment_terms: customer.payment_terms || 30,
        currency: invoiceData.currency || 'EUR',
        status: 'draft',
        invoice_type: 'standard',
        shipment_ids: shipmentIds,
        generated_from: 'automatic',
        ...invoiceData
      }, userId, tenantId);

      // Générer les lignes de facture pour chaque expédition
      let subtotal = 0;
      for (const shipment of shipments) {
        const shipmentCost = await CostCalculationService.calculateShipmentCost(shipment.id);
        const lines = await this.generateInvoiceLinesFromShipment(shipment, shipmentCost, invoice.id, userId, tenantId);
        
        for (const line of lines) {
          subtotal += line.line_total;
        }
      }

      // Mettre à jour les totaux de la facture
      await this.updateInvoiceTotals(invoice.id, subtotal);

      return await this.getInvoiceById(invoice.id);
    } catch (error) {
      throw new Error(`Erreur lors de la génération de la facture: ${error.message}`);
    }
  }

  // Générer des lignes de facture à partir d'une expédition
  async generateInvoiceLinesFromShipment(shipment, shipmentCost, invoiceId, userId, tenantId) {
    try {
      const lines = [];

      // Ligne principale de transport
      const transportLine = await InvoiceLine.query().insert({
        invoice_id: invoiceId,
        description: `Transport ${shipment.transport_mode} - ${shipment.reference}`,
        detailed_description: `${shipment.origin_address} → ${shipment.destination_address}`,
        quantity: 1,
        unit_price: shipmentCost.breakdown.transport_cost,
        line_total: shipmentCost.breakdown.transport_cost,
        unit_of_measure: 'piece',
        line_type: 'transport',
        shipment_id: shipment.id,
        order_id: shipment.order_id,
        origin: shipment.origin_address,
        destination: shipment.destination_address,
        transport_mode: shipment.transport_mode,
        service_date: shipment.planned_pickup_date,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId
      });
      lines.push(transportLine);

      // Lignes pour les surcharges
      if (shipmentCost.breakdown.surcharges > 0) {
        for (const segment of shipmentCost.segments || []) {
          for (const surcharge of segment.surcharges || []) {
            const surchargeLine = await InvoiceLine.query().insert({
              invoice_id: invoiceId,
              description: surcharge.name,
              detailed_description: surcharge.description,
              quantity: 1,
              unit_price: surcharge.amount,
              line_total: surcharge.amount,
              unit_of_measure: 'piece',
              line_type: 'surcharge',
              shipment_id: shipment.id,
              surcharge_id: surcharge.id,
              tenant_id: tenantId,
              created_by: userId,
              updated_by: userId
            });
            lines.push(surchargeLine);
          }
        }
      }

      return lines;
    } catch (error) {
      throw new Error(`Erreur lors de la génération des lignes de facture: ${error.message}`);
    }
  }

  // Regrouper plusieurs expéditions en une seule facture
  async consolidateShipmentsInvoice(consolidationParams, userId, tenantId) {
    try {
      const { customer_id, start_date, end_date, currency, grouping_criteria } = consolidationParams;

      // Récupérer les expéditions à regrouper
      let query = Shipment.query()
        .where('customer_id', customer_id)
        .where('tenant_id', tenantId)
        .where('status', 'delivered')
        .whereNull('invoice_id'); // Non encore facturées

      if (start_date) {
        query = query.where('actual_delivery_date', '>=', start_date);
      }

      if (end_date) {
        query = query.where('actual_delivery_date', '<=', end_date);
      }

      const shipments = await query.withGraphFetched('[order, customer]');

      if (shipments.length === 0) {
        throw new Error('Aucune expédition à regrouper trouvée');
      }

      // Regrouper selon les critères
      const groups = this.groupShipments(shipments, grouping_criteria);
      const invoices = [];

      for (const group of groups) {
        const invoice = await this.generateInvoiceFromShipments(
          group.shipment_ids,
          {
            currency,
            notes: `Facture consolidée - ${group.description}`
          },
          userId,
          tenantId
        );
        invoices.push(invoice);

        // Marquer les expéditions comme facturées
        await Shipment.query()
          .whereIn('id', group.shipment_ids)
          .patch({ invoice_id: invoice.id });
      }

      return {
        consolidated_invoices: invoices,
        total_shipments: shipments.length,
        total_groups: groups.length
      };
    } catch (error) {
      throw new Error(`Erreur lors de la consolidation des factures: ${error.message}`);
    }
  }

  // Regrouper les expéditions selon des critères
  groupShipments(shipments, criteria = 'monthly') {
    const groups = [];

    switch (criteria) {
      case 'weekly':
        // Regrouper par semaine
        const weekGroups = {};
        shipments.forEach(shipment => {
          const date = new Date(shipment.actual_delivery_date);
          const week = this.getWeekNumber(date);
          const key = `${date.getFullYear()}-W${week}`;
          
          if (!weekGroups[key]) {
            weekGroups[key] = {
              shipment_ids: [],
              description: `Semaine ${week} ${date.getFullYear()}`
            };
          }
          weekGroups[key].shipment_ids.push(shipment.id);
        });
        groups.push(...Object.values(weekGroups));
        break;

      case 'monthly':
        // Regrouper par mois
        const monthGroups = {};
        shipments.forEach(shipment => {
          const date = new Date(shipment.actual_delivery_date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthGroups[key]) {
            monthGroups[key] = {
              shipment_ids: [],
              description: `${this.getMonthName(date.getMonth())} ${date.getFullYear()}`
            };
          }
          monthGroups[key].shipment_ids.push(shipment.id);
        });
        groups.push(...Object.values(monthGroups));
        break;

      case 'route':
        // Regrouper par route (origine-destination)
        const routeGroups = {};
        shipments.forEach(shipment => {
          const key = `${shipment.origin_country}-${shipment.destination_country}`;
          
          if (!routeGroups[key]) {
            routeGroups[key] = {
              shipment_ids: [],
              description: `Route ${shipment.origin_country} → ${shipment.destination_country}`
            };
          }
          routeGroups[key].shipment_ids.push(shipment.id);
        });
        groups.push(...Object.values(routeGroups));
        break;

      default:
        // Regrouper toutes les expéditions ensemble
        groups.push({
          shipment_ids: shipments.map(s => s.id),
          description: 'Toutes les expéditions'
        });
    }

    return groups;
  }

  // Envoyer une facture par email
  async sendInvoiceByEmail(invoiceId, emailOptions = {}) {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      
      if (!invoice.customer?.email) {
        throw new Error('Adresse email du client non trouvée');
      }

      // Générer le PDF de la facture
      const pdfBuffer = await this.generateInvoicePDF(invoice);

      // Préparer l'email
      const emailData = {
        to: emailOptions.to || invoice.customer.email,
        cc: emailOptions.cc,
        bcc: emailOptions.bcc,
        subject: emailOptions.subject || `Facture ${invoice.invoice_number}`,
        body: emailOptions.body || this.getDefaultEmailBody(invoice),
        attachments: [
          {
            filename: `Facture_${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      // Envoyer l'email (à implémenter avec un service d'email)
      // await EmailService.sendEmail(emailData);

      // Mettre à jour le statut de la facture
      await Invoice.query().patchAndFetchById(invoiceId, {
        status: 'sent',
        sent_date: new Date().toISOString(),
        delivery_method: 'email',
        delivery_address: emailData.to,
        delivery_status: 'sent'
      });

           return {
        message: 'Facture envoyée par email avec succès',
        email_address: emailData.to,
        sent_date: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi de la facture: ${error.message}`);
    }
  }

  // Générer le PDF d'une facture
  async generateInvoicePDF(invoice) {
    try {
      // Cette méthode nécessiterait une bibliothèque de génération PDF
      // Pour l'instant, retourner un buffer vide
      return Buffer.from('PDF content placeholder');
    } catch (error) {
      throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  }

  // Marquer une facture comme payée
  async markInvoiceAsPaid(invoiceId, paymentData, userId) {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      
      const updatedInvoice = await Invoice.query().patchAndFetchById(invoiceId, {
        status: 'paid',
        paid_amount: invoice.total_amount,
        outstanding_amount: 0,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
        updated_by: userId
      });

      return updatedInvoice;
    } catch (error) {
      throw new Error(`Erreur lors du marquage de la facture comme payée: ${error.message}`);
    }
  }

  // Annuler une facture
  async cancelInvoice(invoiceId, reason, userId) {
    try {
      const invoice = await Invoice.query().findById(invoiceId);
      if (!invoice) {
        throw new Error('Facture non trouvée');
      }

      if (!invoice.canBeCancelled()) {
        throw new Error('Cette facture ne peut pas être annulée');
      }

      const updatedInvoice = await Invoice.query().patchAndFetchById(invoiceId, {
        status: 'cancelled',
        notes: (invoice.notes || '') + `\nAnnulée le ${new Date().toLocaleDateString()}: ${reason}`,
        updated_by: userId
      });

      return updatedInvoice;
    } catch (error) {
      throw new Error(`Erreur lors de l'annulation de la facture: ${error.message}`);
    }
  }

  // Obtenir les statistiques des factures
  async getInvoiceStatistics(tenantId, filters = {}) {
    try {
      let query = Invoice.query().where('tenant_id', tenantId);

      if (filters.start_date) {
        query = query.where('invoice_date', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('invoice_date', '<=', filters.end_date);
      }

      const stats = await query
        .select('status', 'currency')
        .sum('total_amount as total')
        .count('* as count')
        .groupBy('status', 'currency');

      const overdue = await Invoice.query()
        .where('tenant_id', tenantId)
        .where('due_date', '<', new Date().toISOString().split('T')[0])
        .whereNotIn('status', ['paid', 'cancelled'])
        .sum('outstanding_amount as total')
        .count('* as count')
        .first();

      return {
        by_status: stats,
        overdue: {
          count: parseInt(overdue.count),
          total_amount: parseFloat(overdue.total) || 0
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Méthodes utilitaires
  canBeModified(invoice) {
    return ['draft'].includes(invoice.status);
  }

  canBeDeleted(invoice) {
    return ['draft'].includes(invoice.status) && invoice.paid_amount === 0;
  }

  calculateDueDate(paymentTerms) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTerms);
    return dueDate.toISOString().split('T')[0];
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  getMonthName(monthIndex) {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[monthIndex];
  }

  getDefaultEmailBody(invoice) {
    return `
Bonjour,

Veuillez trouver ci-joint la facture ${invoice.invoice_number} d'un montant de ${invoice.total_amount} ${invoice.currency}.

Date d'échéance: ${new Date(invoice.due_date).toLocaleDateString()}

Cordialement,
L'équipe de facturation
    `.trim();
  }

  async updateInvoiceTotals(invoiceId, subtotal) {
    const invoice = await Invoice.query().findById(invoiceId);
    
    // Calculer les taxes (exemple: 20% TVA)
    const taxRate = 20;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    await Invoice.query().patchAndFetchById(invoiceId, {
      subtotal,
      tax_amount: taxAmount,
      tax_rate: taxRate,
      total_amount: totalAmount,
      outstanding_amount: totalAmount
    });
  }

  async validateInvoiceData(invoiceData) {
    const errors = [];

    // Validation des champs requis
    if (!invoiceData.customer_id) {
      errors.push('ID client requis');
    }

    if (!invoiceData.invoice_date) {
      errors.push('Date de facture requise');
    }

    if (!invoiceData.due_date) {
      errors.push('Date d\'échéance requise');
    }

    if (!invoiceData.currency) {
      errors.push('Devise requise');
    }

    // Validation des dates
    if (invoiceData.invoice_date && invoiceData.due_date) {
      if (new Date(invoiceData.due_date) <= new Date(invoiceData.invoice_date)) {
        errors.push('La date d\'échéance doit être postérieure à la date de facture');
      }
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new InvoiceService();

