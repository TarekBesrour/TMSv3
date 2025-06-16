const { Model } = require(\'objection\');

class ReferenceData extends Model {
  static get tableName() {
    return \'reference_data\';
  }

  static get idColumn() {
    return \'id\';
  }

  static get jsonSchema() {
    return {
      type: \'object\',
      required: [\'tenant_id\', \'category\', \'code\', \'label\'],
      properties: {
        id: { type: \'integer\' },
        tenant_id: { type: \'integer\' },
        
        // Reference data identification
        category: { type: \'string\', maxLength: 100 },
        code: { type: \'string\', maxLength: 50 },
        label: { type: \'string\', maxLength: 255 },
        
        // Additional data
        description: { type: [\'string\', \'null\'] },
        value: { type: [\'string\', \'null\'] },
        metadata: { type: [\'object\', \'null\'] },
        
        // Hierarchy and ordering
        parent_id: { type: [\'integer\', \'null\'] },
        sort_order: { type: \'integer\', default: 0 },
        level: { type: \'integer\', default: 0 },
        
        // Status and flags
        is_active: { type: \'boolean\', default: true },
        is_system: { type: \'boolean\', default: false },
        is_editable: { type: \'boolean\', default: true },
        
        // Localization
        language_code: { type: \'string\', maxLength: 5, default: \'fr\' },
        
        // Audit
        created_by: { type: \'integer\' },
        updated_by: { type: \'integer\' },
        created_at: { type: \'string\', format: \'date-time\' },
        updated_at: { type: \'string\', format: \'date-time\' }
      }
    };
  }

  static get relationMappings() {
    const User = require(\'./User\');

    return {
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReferenceData,
        join: {
          from: \'reference_data.parent_id\',
          to: \'reference_data.id\'
        }
      },
      children: {
        relation: Model.HasManyRelation,
        modelClass: ReferenceData,
        join: {
          from: \'reference_data.id\',
          to: \'reference_data.parent_id\'
        }
      },
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: \'reference_data.created_by\',
          to: \'users.id\'
        }
      },
      updatedBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: \'reference_data.updated_by\',
          to: \'users.id\'
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
  getFullPath() {
    // Retourne le chemin complet dans la hiérarchie
    if (!this.parent) {
      return this.label;
    }
    return `${this.parent.getFullPath()} > ${this.label}`;
  }

  hasChildren() {
    return this.children && this.children.length > 0;
  }

  isLeaf() {
    return !this.hasChildren();
  }

  // Méthodes statiques pour les catégories communes
  static getCommonCategories() {
    return {
      TRANSPORT_MODES: \'transport_modes\',
      VEHICLE_TYPES: \'vehicle_types\',
      CARGO_TYPES: \'cargo_types\',
      INCOTERMS: \'incoterms\',
      CURRENCIES: \'currencies\',
      COUNTRIES: \'countries\',
      UNITS_OF_MEASURE: \'units_of_measure\',
      DOCUMENT_TYPES: \'document_types\',
      PAYMENT_TERMS: \'payment_terms\',
      SHIPMENT_STATUS: \'shipment_status\',
      ORDER_STATUS: \'order_status\',
      INVOICE_STATUS: \'invoice_status\',
      PARTNER_TYPES: \'partner_types\',
      CONTACT_TYPES: \'contact_types\',
      ADDRESS_TYPES: \'address_types\'
    };
  }

  // Validation métier
  static async validateReferenceData(refData) {
    const errors = [];

    // Vérifier les champs requis
    if (!refData.category || refData.category.trim() === \'\') {
      errors.push(\'Category is required\');
    }

    if (!refData.code || refData.code.trim() === \'\') {
      errors.push(\'Code is required\');
    }

    if (!refData.label || refData.label.trim() === \'\') {
      errors.push(\'Label is required\');
    }

    // Vérifier l\'unicité du code dans la catégorie
    if (refData.category && refData.code && refData.tenant_id) {
      const existing = await ReferenceData.query()
        .where(\'tenant_id\', refData.tenant_id)
        .where(\'category\', refData.category)
        .where(\'code\', refData.code)
        .where(\'id\', \'!=\', refData.id || 0)
        .first();

      if (existing) {
        errors.push(\'Code must be unique within the category\');
      }
    }

    // Vérifier la hiérarchie
    if (refData.parent_id) {
      const parent = await ReferenceData.query().findById(refData.parent_id);
      if (!parent) {
        errors.push(\'Parent reference data not found\');
      } else if (parent.category !== refData.category) {
        errors.push(\'Parent must be in the same category\');
      }
    }

    return errors;
  }
}

module.exports = ReferenceData;

