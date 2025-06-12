const CarrierInvoice = require('../models/CarrierInvoice');
const CarrierInvoiceLine = require('../models/CarrierInvoiceLine');
const Shipment = require('../models/Shipment');
const CostCalculationService = require('./CostCalculationService');
const RateService = require('./RateService');
const ContractService = require('./ContractService');

class CarrierInvoiceControlService {
  // Créer une nouvelle facture transporteur
  async createCarrierInvoice(invoiceData, userId, tenantId) {
    try {
      // Validation des données
      const validation = await this.validateCarrierInvoiceData(invoiceData);
      if (!validation.is_valid) {
        throw new Error(`Données de facture invalides: ${validation.errors.join(', ')}`);
      }

      const invoice = await CarrierInvoice.query().insert({
        ...invoiceData,
        tenant_id: tenantId,
        created_by: userId,
        updated_by: userId,
        received_date: new Date().toISOString(),
        status: 'received',
        validation_status: 'pending'
      });

      return await this.getCarrierInvoiceById(invoice.id);
    } catch (error) {
      throw new Error(`Erreur lors de la création de la facture transporteur: ${error.message}`);
    }
  }

  // Obtenir une facture transporteur par ID
  async getCarrierInvoiceById(invoiceId) {
    try {
      const invoice = await CarrierInvoice.query()
        .findById(invoiceId)
        .withGraphFetched('[carrier, contract, invoiceLines.[shipment, segment, rate, surcharge, contractLine], createdBy, updatedBy, controlledBy, approvedBy, assignedTo]');

      if (!invoice) {
        throw new Error('Facture transporteur non trouvée');
      }

      return invoice;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la facture: ${error.message}`);
    }
  }

  // Obtenir toutes les factures transporteurs avec filtres
  async getCarrierInvoices(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = CarrierInvoice.query()
        .withGraphFetched('[carrier, contract, invoiceLines]')
        .orderBy('received_date', 'desc');

      // Application des filtres
      if (filters.tenant_id) {
        query = query.where('tenant_id', filters.tenant_id);
      }

      if (filters.carrier_id) {
        query = query.where('carrier_id', filters.carrier_id);
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.whereIn('status', filters.status);
        } else {
          query = query.where('status', filters.status);
        }
      }

      if (filters.validation_status) {
        query = query.where('validation_status', filters.validation_status);
      }

      if (filters.requires_manual_review !== undefined) {
        query = query.where('requires_manual_review', filters.requires_manual_review);
      }

      if (filters.has_anomalies === true) {
        query = query.whereRaw("jsonb_array_length(anomalies) > 0");
      }

      if (filters.start_date) {
        query = query.where('invoice_date', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('invoice_date', '<=', filters.end_date);
      }

      if (filters.min_variance) {
        query = query.where('variance_percentage', '>=', filters.min_variance);
      }

      if (filters.search) {
        query = query.where(builder => {
          builder.where('invoice_number', 'ilike', `%${filters.search}%`)
            .orWhere('carrier_name', 'ilike', `%${filters.search}%`)
            .orWhere('carrier_reference', 'ilike', `%${filters.search}%`);
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

  // Contrôler automatiquement une facture transporteur
  async controlCarrierInvoice(invoiceId, userId) {
    try {
      const invoice = await this.getCarrierInvoiceById(invoiceId);
      
      if (invoice.status !== 'received') {
        throw new Error('Cette facture a déjà été contrôlée');
      }

      // Marquer comme en cours de révision
      await CarrierInvoice.query().patchAndFetchById(invoiceId, {
        status: 'under_review',
        control_date: new Date().toISOString(),
        controlled_by: userId
      });

      const controlResult = {
        invoice_id: invoiceId,
        control_date: new Date().toISOString(),
        controlled_by: userId,
        anomalies: [],
        line_validations: [],
        total_variance: 0,
        expected_total: 0,
        validation_status: 'passed',
        requires_manual_review: false,
        risk_level: 'low'
      };

      // Calculer le montant attendu total
      let expectedTotal = 0;
      
      // Contrôler chaque ligne de facture
      for (const line of invoice.invoiceLines || []) {
        const lineValidation = await this.validateInvoiceLine(line, invoice);
        controlResult.line_validations.push(lineValidation);
        
        if (lineValidation.expected_amount) {
          expectedTotal += lineValidation.expected_amount;
        }
        
        if (lineValidation.anomalies.length > 0) {
          controlResult.anomalies.push(...lineValidation.anomalies);
        }
      }

      controlResult.expected_total = expectedTotal;
      controlResult.total_variance = invoice.total_amount - expectedTotal;
      const variancePercentage = expectedTotal > 0 ? 
        (controlResult.total_variance / expectedTotal) * 100 : 0;

      // Déterminer le statut de validation
      if (controlResult.anomalies.length > 0) {
        const criticalAnomalies = controlResult.anomalies.filter(a => a.severity === 'critical');
        const highAnomalies = controlResult.anomalies.filter(a => a.severity === 'high');
        
        if (criticalAnomalies.length > 0 || Math.abs(variancePercentage) > 20) {
          controlResult.validation_status = 'failed';
          controlResult.requires_manual_review = true;
          controlResult.risk_level = 'critical';
        } else if (highAnomalies.length > 0 || Math.abs(variancePercentage) > 10) {
          controlResult.validation_status = 'manual_review';
          controlResult.requires_manual_review = true;
          controlResult.risk_level = 'high';
        } else {
          controlResult.validation_status = 'passed';
          controlResult.risk_level = 'medium';
        }
      }

      // Mettre à jour la facture avec les résultats du contrôle
      const updatedInvoice = await CarrierInvoice.query().patchAndFetchById(invoiceId, {
        expected_amount: expectedTotal,
        variance_amount: controlResult.total_variance,
        variance_percentage: variancePercentage,
        anomalies: controlResult.anomalies,
        validation_status: controlResult.validation_status,
        requires_manual_review: controlResult.requires_manual_review,
        status: controlResult.validation_status === 'passed' ? 'validated' : 'under_review',
        control_notes: `Contrôle automatique effectué. ${controlResult.anomalies.length} anomalie(s) détectée(s).`
      });

      return {
        ...controlResult,
        updated_invoice: updatedInvoice
      };
    } catch (error) {
      throw new Error(`Erreur lors du contrôle de la facture: ${error.message}`);
    }
  }

  // Valider une ligne de facture
  async validateInvoiceLine(line, invoice) {
    try {
      const validation = {
        line_id: line.id,
        description: line.description,
        actual_amount: line.line_total,
        expected_amount: null,
        variance: 0,
        variance_percentage: 0,
        anomalies: [],
        validation_status: 'pending'
      };

      // Récupérer l'expédition associée si disponible
      let expectedAmount = null;
      
      if (line.shipment_id) {
        // Calculer le coût attendu basé sur l'expédition
        const shipmentCost = await CostCalculationService.calculateShipmentCost(line.shipment_id);
        expectedAmount = this.extractRelevantCost(shipmentCost, line);
      } else if (line.rate_id) {
        // Utiliser le tarif de référence
        const rate = await RateService.getRateById(line.rate_id);
        expectedAmount = rate.calculateRate(line.quantity, {
          weight: line.weight,
          volume: line.volume,
          distance: line.distance
        });
      } else if (line.contract_line_id) {
        // Utiliser la ligne de contrat
        const contractLine = await ContractService.getContractLineById(line.contract_line_id);
        expectedAmount = contractLine.calculateRate(line.quantity, {
          weight: line.weight,
          volume: line.volume,
          distance: line.distance
        });
      }

      if (expectedAmount !== null) {
        validation.expected_amount = expectedAmount;
        validation.variance = line.line_total - expectedAmount;
        validation.variance_percentage = expectedAmount > 0 ? 
          (validation.variance / expectedAmount) * 100 : 0;
      }

      // Détecter les anomalies
      validation.anomalies = this.detectLineAnomalies(line, validation);

      // Déterminer le statut de validation
      if (validation.anomalies.length > 0) {
        const criticalAnomalies = validation.anomalies.filter(a => a.severity === 'critical');
        const highAnomalies = validation.anomalies.filter(a => a.severity === 'high');
        
        if (criticalAnomalies.length > 0) {
          validation.validation_status = 'failed';
        } else if (highAnomalies.length > 0) {
          validation.validation_status = 'disputed';
        } else {
          validation.validation_status = 'warning';
        }
      } else {
        validation.validation_status = 'passed';
      }

      // Mettre à jour la ligne avec les informations de validation
      await CarrierInvoiceLine.query().patchAndFetchById(line.id, {
        expected_unit_price: expectedAmount ? expectedAmount / line.quantity : null,
        expected_line_total: expectedAmount,
        price_variance: validation.variance,
        price_variance_percentage: validation.variance_percentage,
        validation_status: validation.validation_status,
        has_anomaly: validation.anomalies.length > 0,
        anomaly_type: validation.anomalies[0]?.type,
        anomaly_severity: validation.anomalies[0]?.severity,
        anomaly_description: validation.anomalies[0]?.description
      });

      return validation;
    } catch (error) {
      throw new Error(`Erreur lors de la validation de la ligne: ${error.message}`);
    }
  }

  // Extraire le coût pertinent d'un calcul d'expédition
  extractRelevantCost(shipmentCost, line) {
    // Selon le type de ligne, extraire le coût approprié
    switch (line.line_type) {
      case 'transport':
        return shipmentCost.breakdown.transport_cost;
      case 'surcharge':
        // Chercher la surcharge correspondante
        for (const segment of shipmentCost.segments || []) {
          for (const surcharge of segment.surcharges || []) {
            if (surcharge.id === line.surcharge_id || 
                surcharge.name.toLowerCase().includes(line.description.toLowerCase())) {
              return surcharge.amount;
            }
          }
        }
        return null;
      case 'tax':
        return shipmentCost.breakdown.taxes;
      default:
        return shipmentCost.total_cost;
    }
  }

  // Détecter les anomalies d'une ligne
  detectLineAnomalies(line, validation) {
    const anomalies = [];

    // Variance de prix significative
    if (Math.abs(validation.variance_percentage) > 15) {
      anomalies.push({
        type: 'price_variance',
        severity: Math.abs(validation.variance_percentage) > 30 ? 'critical' : 'high',
        description: `Variance de prix de ${validation.variance_percentage.toFixed(2)}%`,
        expected_value: validation.expected_amount,
        actual_value: line.line_total,
        variance: validation.variance,
        line_reference: line.id
      });
    }

    // Prix anormalement élevé
    if (validation.expected_amount && line.line_total > validation.expected_amount * 2) {
      anomalies.push({
        type: 'price_variance',
        severity: 'critical',
        description: 'Prix anormalement élevé (plus du double du prix attendu)',
        expected_value: validation.expected_amount,
        actual_value: line.line_total,
        variance: validation.variance,
        line_reference: line.id
      });
    }

    // Service non référencé
    if (!line.shipment_id && !line.rate_id && !line.contract_line_id && line.line_type === 'transport') {
      anomalies.push({
        type: 'service_not_contracted',
        severity: 'medium',
        description: 'Service de transport sans référence dans le système',
        expected_value: null,
        actual_value: line.line_total,
        variance: line.line_total,
        line_reference: line.id
      });
    }

    // Quantité anormale
    if (line.quantity <= 0) {
      anomalies.push({
        type: 'quantity_mismatch',
        severity: 'high',
        description: 'Quantité nulle ou négative',
        expected_value: 1,
        actual_value: line.quantity,
        variance: line.quantity - 1,
        line_reference: line.id
      });
    }

    // Prix unitaire anormalement bas (possible erreur)
    if (line.unit_price < 0.01 && line.line_type === 'transport') {
      anomalies.push({
        type: 'price_variance',
        severity: 'medium',
        description: 'Prix unitaire anormalement bas',
        expected_value: 1,
        actual_value: line.unit_price,
        variance: line.unit_price - 1,
        line_reference: line.id
      });
    }

    return anomalies;
  }

  // Approuver une facture transporteur
  async approveCarrierInvoice(invoiceId, userId, notes = '') {
    try {
      const invoice = await this.getCarrierInvoiceById(invoiceId);
      
      if (!invoice.canBeApproved()) {
        throw new Error('Cette facture ne peut pas être approuvée dans son état actuel');
      }

      const updatedInvoice = await CarrierInvoice.query().patchAndFetchById(invoiceId, {
        status: 'approved',
        approved_by: userId,
        approved_date: new Date().toISOString(),
        approval_notes: notes,
        next_action: 'payment'
      });

      return updatedInvoice;
    } catch (error) {
      throw new Error(`Erreur lors de l'approbation de la facture: ${error.message}`);
    }
  }

  // Rejeter une facture transporteur
  async rejectCarrierInvoice(invoiceId, userId, reason) {
    try {
      const invoice = await this.getCarrierInvoiceById(invoiceId);
      
      if (!invoice.canBeRejected()) {
        throw new Error('Cette facture ne peut pas être rejetée dans son état actuel');
      }

      const updatedInvoice = await CarrierInvoice.query().patchAndFetchById(invoiceId, {
        status: 'rejected',
        rejected_by: userId,
        rejected_date: new Date().toISOString(),
        rejection_reason: reason,
        next_action: 'return_to_carrier'
      });

      return updatedInvoice;
    } catch (error) {
      throw new Error(`Erreur lors du rejet de la facture: ${error.message}`);
    }
  }

  // Disputer une facture transporteur
  async disputeCarrierInvoice(invoiceId, userId, reason) {
    try {
      const invoice = await this.getCarrierInvoiceById(invoiceId);
      
      if (!invoice.canBeDisputed()) {
        throw new Error('Cette facture ne peut pas être disputée dans son état actuel');
      }

            const updatedInvoice = await CarrierInvoice.query().patchAndFetchById(invoiceId, {
        status: 'disputed',
        disputed_by: userId,
        disputed_date: new Date().toISOString(),
        dispute_reason: reason,
        next_action: 'resolve_dispute'
      });

      return updatedInvoice;
    } catch (error) {
      throw new Error(`Erreur lors de la mise en dispute de la facture: ${error.message}`);
    }
  }

  // Corriger une ligne de facture
  async correctInvoiceLine(lineId, correctedUnitPrice, reason, userId) {
    try {
      const line = await CarrierInvoiceLine.query().findById(lineId);
      if (!line) {
        throw new Error('Ligne de facture non trouvée');
      }

      const updatedLine = await CarrierInvoiceLine.query().patchAndFetchById(lineId, {
        corrected_unit_price: correctedUnitPrice,
        corrected_line_total: line.quantity * correctedUnitPrice,
        correction_reason: reason,
        corrected_by: userId,
        corrected_date: new Date().toISOString(),
        validation_status: 'corrected'
      });

      // Recalculer les totaux de la facture
      await this.recalculateInvoiceTotals(line.carrier_invoice_id);

      return updatedLine;
    } catch (error) {
      throw new Error(`Erreur lors de la correction de la ligne: ${error.message}`);
    }
  }

  // Recalculer les totaux d'une facture
  async recalculateInvoiceTotals(invoiceId) {
    try {
      const lines = await CarrierInvoiceLine.query()
        .where('carrier_invoice_id', invoiceId);

      let subtotal = 0;
      let correctedSubtotal = 0;

      for (const line of lines) {
        subtotal += line.line_total;
        correctedSubtotal += line.getFinalAmount();
      }

      // Mettre à jour la facture avec les nouveaux totaux
      await CarrierInvoice.query().patchAndFetchById(invoiceId, {
        subtotal: correctedSubtotal,
        total_amount: correctedSubtotal // Simplification, sans taxes pour l'exemple
      });

      return { subtotal: correctedSubtotal, total_amount: correctedSubtotal };
    } catch (error) {
      throw new Error(`Erreur lors du recalcul des totaux: ${error.message}`);
    }
  }

  // Obtenir les statistiques de contrôle
  async getControlStatistics(tenantId, filters = {}) {
    try {
      let query = CarrierInvoice.query().where('tenant_id', tenantId);

      if (filters.start_date) {
        query = query.where('received_date', '>=', filters.start_date);
      }

      if (filters.end_date) {
        query = query.where('received_date', '<=', filters.end_date);
      }

      const stats = await query
        .select('status', 'validation_status')
        .sum('total_amount as total')
        .sum('variance_amount as total_variance')
        .count('* as count')
        .groupBy('status', 'validation_status');

      const anomaliesCount = await CarrierInvoice.query()
        .where('tenant_id', tenantId)
        .whereRaw("jsonb_array_length(anomalies) > 0")
        .count('* as count')
        .first();

      const manualReviewCount = await CarrierInvoice.query()
        .where('tenant_id', tenantId)
        .where('requires_manual_review', true)
        .count('* as count')
        .first();

      return {
        by_status: stats,
        anomalies_count: parseInt(anomaliesCount.count),
        manual_review_count: parseInt(manualReviewCount.count)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Obtenir les factures nécessitant une révision manuelle
  async getInvoicesRequiringManualReview(tenantId, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;

      const result = await this.getCarrierInvoices({
        tenant_id: tenantId,
        requires_manual_review: true,
        status: ['under_review', 'disputed']
      }, { page, limit });

      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des factures à réviser: ${error.message}`);
    }
  }

  // Analyser les tendances de variance
  async analyzeVarianceTrends(tenantId, filters = {}) {
    try {
      const { start_date, end_date, carrier_id } = filters;

      let query = CarrierInvoice.query()
        .where('tenant_id', tenantId)
        .whereNotNull('variance_percentage');

      if (start_date) {
        query = query.where('invoice_date', '>=', start_date);
      }

      if (end_date) {
        query = query.where('invoice_date', '<=', end_date);
      }

      if (carrier_id) {
        query = query.where('carrier_id', carrier_id);
      }

      const invoices = await query
        .select('invoice_date', 'carrier_id', 'carrier_name', 'variance_percentage', 'total_amount')
        .orderBy('invoice_date');

      // Analyser les tendances
      const analysis = {
        total_invoices: invoices.length,
        average_variance: 0,
        variance_by_carrier: {},
        variance_trend: 'stable',
        high_variance_invoices: 0
      };

      if (invoices.length > 0) {
        const totalVariance = invoices.reduce((sum, inv) => sum + Math.abs(inv.variance_percentage), 0);
        analysis.average_variance = totalVariance / invoices.length;

        // Grouper par transporteur
        invoices.forEach(inv => {
          if (!analysis.variance_by_carrier[inv.carrier_name]) {
            analysis.variance_by_carrier[inv.carrier_name] = {
              count: 0,
              total_variance: 0,
              average_variance: 0
            };
          }
          analysis.variance_by_carrier[inv.carrier_name].count++;
          analysis.variance_by_carrier[inv.carrier_name].total_variance += Math.abs(inv.variance_percentage);
        });

        // Calculer les moyennes par transporteur
        Object.keys(analysis.variance_by_carrier).forEach(carrier => {
          const data = analysis.variance_by_carrier[carrier];
          data.average_variance = data.total_variance / data.count;
        });

        // Compter les factures à forte variance
        analysis.high_variance_invoices = invoices.filter(inv => Math.abs(inv.variance_percentage) > 15).length;
      }

      return analysis;
    } catch (error) {
      throw new Error(`Erreur lors de l'analyse des tendances: ${error.message}`);
    }
  }

  // Valider les données de facture transporteur
  async validateCarrierInvoiceData(invoiceData) {
    const errors = [];

    // Validation des champs requis
    if (!invoiceData.carrier_id) {
      errors.push('ID transporteur requis');
    }

    if (!invoiceData.invoice_number) {
      errors.push('Numéro de facture requis');
    }

    if (!invoiceData.invoice_date) {
      errors.push('Date de facture requise');
    }

    if (!invoiceData.currency) {
      errors.push('Devise requise');
    }

    if (!invoiceData.total_amount || invoiceData.total_amount <= 0) {
      errors.push('Montant total requis et doit être positif');
    }

    return {
      is_valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new CarrierInvoiceControlService();

