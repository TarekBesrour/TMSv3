const { Model } = require('objection');

class BankAccount extends Model {
  static get tableName() {
    return 'bank_accounts';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tenant_id', 'account_name', 'account_number', 'bank_name', 'currency'],
      properties: {
        id: { type: 'string' },
        tenant_id: { type: 'string' },
        
        // Informations du compte
        account_name: { type: 'string', maxLength: 255 },
        account_number: { type: 'string', maxLength: 50 },
        iban: { type: ['string', 'null'], maxLength: 34 },
        swift_bic: { type: ['string', 'null'], maxLength: 11 },
        
        // Informations de la banque
        bank_name: { type: 'string', maxLength: 255 },
        bank_address: { type: ['string', 'null'] },
        bank_code: { type: ['string', 'null'], maxLength: 20 },
        
        // Devise et statut
        currency: { type: 'string', maxLength: 3 },
        is_default: { type: 'boolean', default: false },
        is_active: { type: 'boolean', default: true },
        
        // Type de compte
        account_type: { 
          type: 'string', 
          enum: ['checking', 'savings', 'business', 'other'],
          default: 'business'
        },
        
        // Solde (optionnel, pour suivi)
        //current_balance: { type: ['number', 'null'] },
        current_balance: { anyOf: [{ type: 'number' }, { type: 'null' }] },
        last_balance_update: { type: ['string', 'null'], format: 'date-time' },
        
        // Notes et description
        description: { type: ['string', 'null'] },
        notes: { type: ['string', 'null'] },
        
        // Audit
        created_by: { type: 'string' },
        updated_by: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Tenant = require('./Tenant');
    const User = require('./User');
    const Payment = require('./Payment');

    return {
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: 'bank_accounts.tenant_id',
          to: 'tenants.id'
        }
      },

      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'bank_accounts.created_by',
          to: 'users.id'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'bank_accounts.updated_by',
          to: 'users.id'
        }
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'bank_accounts.id',
          to: 'payments.bank_account_id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Méthodes utilitaires
  getAccountTypeLabel() {
    const typeLabels = {
      checking: 'Compte courant',
      savings: "Compte d'épargne",
      business: 'Compte professionnel',
      other: 'Autre'
    };
    return typeLabels[this.account_type] || this.account_type;
  }

  getMaskedAccountNumber() {
    if (!this.account_number || this.account_number.length <= 4) {
      return this.account_number;
    }
    const lastFour = this.account_number.slice(-4);
    const masked = '*'.repeat(this.account_number.length - 4);
    return masked + lastFour;
  }

  isValidIban() {
    if (!this.iban) return true; // IBAN is optional
    
    // Basic IBAN validation (simplified)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
    return ibanRegex.test(this.iban.replace(/\s/g, ''));
  }

  isValidSwift() {
    if (!this.swift_bic) return true; // SWIFT is optional
    
    // Basic SWIFT validation (8 or 11 characters)
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(this.swift_bic);
  }

  // Validation métier
  static async validateBankAccount(accountData) {
    const errors = [];

    // Vérifier le numéro de compte
    if (!accountData.account_number || accountData.account_number.trim() === '') {
      errors.push('Le numéro de compte est requis');
    }

    // Vérifier la devise
    if (!accountData.currency || accountData.currency.length !== 3) {
      errors.push('La devise doit être un code à 3 lettres (ex: EUR, USD)');
    }

    // Vérifier l'IBAN si fourni
    if (accountData.iban) {
      const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
      if (!ibanRegex.test(accountData.iban.replace(/\s/g, ''))) {
        errors.push('Format IBAN invalide');
      }
    }

    // Vérifier le SWIFT si fourni
    if (accountData.swift_bic) {
      const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
      if (!swiftRegex.test(accountData.swift_bic)) {
        errors.push('Format SWIFT/BIC invalide');
      }
    }

    return errors;
  }
}

module.exports = BankAccount;

