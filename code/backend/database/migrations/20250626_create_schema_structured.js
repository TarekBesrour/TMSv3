exports.config = { transaction: false };


exports.up = async function (knex) {
  // Création du type ENUM
  await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_addresses_status') THEN
        CREATE TYPE enum_addresses_status AS ENUM ('active', 'inactive');
      END IF;
    END$$;
  `);

  // Création de la table
  await knex.schema.createTable('addresses', table => {
    table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
    table.bigInteger('partner_id').notNullable();
    table.string('name', 100);
    table.string('street_line1', 255).notNullable();
    table.string('street_line2', 255);
    table.string('city', 100).notNullable();
    table.string('postal_code', 20).notNullable();
    table.string('state', 100);
    table.string('country', 100).notNullable();
    table.decimal('latitude');
    table.decimal('longitude');
    table.boolean('is_headquarters').defaultTo(false);
    table.boolean('is_billing').defaultTo(false);
    table.boolean('is_shipping').defaultTo(false);
    table.boolean('is_operational').defaultTo(false);
    table.text('notes');
    /* table.enu('status', ['active', 'inactive'], {
      useNative: true,
      enumName: 'enum_addresses_status',
    }).defaultTo('active'); */
    table.specificType('status', 'enum_addresses_status').notNullable().defaultTo('active');
    table.timestamp('created_at', { useTz: true });
    table.timestamp('updated_at', { useTz: true });
    table.bigInteger('created_by');
    table.bigInteger('updated_by');
  });
  
  await knex.schema.createTable('audit_logs', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id');
  table.bigInteger('user_id');
  table.string('action', 50).notNullable();
  table.string('entity_type', 50).notNullable();
  table.bigInteger('entity_id');
  table.string('description', 255);
  table.string('ip_address', 45);
  table.string('user_agent', 255);
  table.jsonb('previous_state');
  table.jsonb('new_state');
  table.timestamp('action_timestamp', { useTz: true }).notNullable();
  table.jsonb('additional_data');
});

// Création des ENUMS nécessaires à carrier_invoices
await knex.schema.raw(`CREATE TYPE enum_carrier_invoices_status AS ENUM ('received', 'under_review', 'validated', 'disputed', 'approved', 'rejected', 'paid')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoices_validation_status AS ENUM ('pending', 'passed', 'failed', 'manual_review')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoices_payment_method AS ENUM ('bank_transfer', 'check', 'credit_card', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoices_processing_method AS ENUM ('manual', 'ocr', 'edi', 'api', 'email')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoices_priority AS ENUM ('low', 'normal', 'high', 'urgent')`);

// Création de la table carrier_invoices
await knex.schema.createTable('carrier_invoices', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('invoice_number', 50).notNullable();
  table.bigInteger('carrier_id').notNullable();
  table.text('carrier_name');
  table.text('carrier_reference');
  table.date('invoice_date').notNullable();
  table.date('due_date');
  table.timestamp('received_date', { useTz: true });
  table.decimal('subtotal');
  table.decimal('tax_amount');
  table.decimal('discount_amount');
  table.decimal('total_amount');
  table.decimal('expected_amount');
  table.decimal('variance_amount');
  table.decimal('variance_percentage');
  table.string('currency', 3).notNullable();
  table.decimal('exchange_rate');
  table.string('base_currency', 3);
  table.specificType('status', 'enum_carrier_invoices_status').notNullable();
  table.specificType('validation_status', 'enum_carrier_invoices_validation_status');
  table.specificType('shipment_ids', 'INTEGER[]');
  table.bigInteger('contract_id');
  table.timestamp('control_date', { useTz: true });
  table.bigInteger('controlled_by');
  table.text('control_notes');
  table.specificType('anomalies', 'JSONB[]');
  table.bigInteger('approved_by');
  table.timestamp('approved_date', { useTz: true });
  table.text('approval_notes');
  table.bigInteger('rejected_by');
  table.timestamp('rejected_date', { useTz: true });
  table.text('rejection_reason');
  table.bigInteger('disputed_by');
  table.timestamp('disputed_date', { useTz: true });
  table.text('dispute_reason');
  table.text('dispute_resolution');
  table.date('payment_date');
  table.text('payment_reference');
  table.specificType('payment_method', 'enum_carrier_invoices_payment_method');
  table.text('original_document_path');
  table.text('processed_document_path');
  table.specificType('supporting_documents', 'TEXT[]');
  table.specificType('processing_method', 'enum_carrier_invoices_processing_method');
  table.decimal('ocr_confidence');
  table.boolean('requires_manual_review').defaultTo(false);
  table.text('workflow_step');
  table.text('next_action');
  table.integer('assigned_to');
  table.specificType('tags', 'TEXT[]');
  /* table.enu('priority', ['low', 'normal', 'high', 'urgent'], {
    useNative: true,
    enumName: 'enum_carrier_invoices_priority',
  }).defaultTo('normal'); */
  table.specificType('priority', 'enum_carrier_invoices_priority').defaultTo('normal');
  table.bigInteger('tenant_id');
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
});

// ENUMs pour carrier_invoice_lines
await knex.schema.raw(`CREATE TYPE enum_carrier_invoice_lines_unit_of_measure AS ENUM ('kg', 'm3', 'km', 'hour', 'day', 'pallet', 'container', 'piece', 'percentage')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoice_lines_line_type AS ENUM ('transport', 'surcharge', 'tax', 'discount', 'penalty', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoice_lines_transport_mode AS ENUM ('road', 'sea', 'air', 'rail', 'multimodal')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoice_lines_validation_status AS ENUM ('pending', 'validated', 'disputed', 'corrected')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoice_lines_anomaly_type AS ENUM ('price_variance', 'quantity_mismatch', 'service_not_contracted', 'duplicate_charge', 'missing_service', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_carrier_invoice_lines_anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical')`);

// Table carrier_invoice_lines
await knex.schema.createTable('carrier_invoice_lines', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('carrier_invoice_id').notNullable();
  table.text('description').notNullable();
  table.text('detailed_description');
  table.text('service_code');
  table.decimal('quantity').notNullable();
  table.decimal('unit_price').notNullable();
  table.decimal('line_total').notNullable();
  table.decimal('expected_unit_price');
  table.decimal('expected_line_total');
  table.decimal('price_variance');
  table.decimal('price_variance_percentage');
  table.specificType('unit_of_measure', 'enum_carrier_invoice_lines_unit_of_measure');
  table.specificType('line_type', 'enum_carrier_invoice_lines_line_type').defaultTo('transport');
  table.bigInteger('shipment_id');
  table.bigInteger('segment_id');
  table.bigInteger('rate_id');
  table.bigInteger('surcharge_id');
  table.bigInteger('contract_line_id');
  table.text('origin');
  table.text('destination');
  table.specificType('transport_mode', 'enum_carrier_invoice_lines_transport_mode');
  table.date('service_date');
  table.specificType('validation_status', 'enum_carrier_invoice_lines_validation_status').defaultTo('pending');
  table.text('validation_notes');
  table.boolean('has_anomaly').defaultTo(false);
  table.specificType('anomaly_type', 'enum_carrier_invoice_lines_anomaly_type');
  table.text('anomaly_description');
  table.specificType('anomaly_severity', 'enum_carrier_invoice_lines_anomaly_severity');
  table.decimal('tax_rate');
  table.decimal('tax_amount');
  table.boolean('is_tax_inclusive').defaultTo(false);
  table.decimal('discount_rate');
  table.decimal('discount_amount');
  table.decimal('weight');
  table.decimal('volume');
  table.decimal('distance');
  table.decimal('duration');
  table.decimal('corrected_unit_price');
  table.decimal('corrected_line_total');
  table.text('correction_reason');
  table.bigInteger('corrected_by');
  table.timestamp('corrected_date', { useTz: true });
  table.boolean('approved').defaultTo(false);
  table.bigInteger('approved_by');
  table.timestamp('approved_date', { useTz: true });
  table.text('approval_notes');
  table.integer('sort_order').defaultTo(0);
  table.boolean('is_billable').defaultTo(true);
  table.text('reference_number');
  table.bigInteger('tenant_id');
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
});

// ENUM pour contacts
await knex.schema.raw(`CREATE TYPE enum_contacts_status AS ENUM ('active', 'inactive')`);

// Table contacts
await knex.schema.createTable('contacts', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('partner_id').notNullable();
  table.string('first_name', 100).notNullable();
  table.string('last_name', 100).notNullable();
  table.string('position', 100);
  table.string('email', 255);
  table.string('phone', 20);
  table.string('mobile', 20);
  table.boolean('is_primary').defaultTo(false);
  table.text('notes');
  table.specificType('status', 'enum_contacts_status').defaultTo('active');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
});

// ENUMs pour contracts
await knex.schema.raw(`CREATE TYPE enum_contracts_contract_type AS ENUM ('client', 'carrier')`);
await knex.schema.raw(`CREATE TYPE enum_contracts_status AS ENUM ('draft', 'active', 'pending', 'expired', 'terminated', 'pending_renewal')`);

// Table contracts
await knex.schema.createTable('contracts', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id');
  table.string('contract_reference', 100).notNullable();
  table.specificType('contract_type', 'enum_contracts_contract_type').notNullable();
  table.bigInteger('partner_id').notNullable();
  table.timestamp('valid_from', { useTz: true }).notNullable();
  table.timestamp('valid_to', { useTz: true });
  table.string('payment_terms', 200);
  table.integer('payment_days');
  table.text('general_conditions');
  table.specificType('status', 'enum_contracts_status').defaultTo('draft');
  table.string('currency', 3);
  table.boolean('auto_renewal').defaultTo(false);
  table.integer('renewal_notice_days');
  table.text('notes');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
  table.boolean('is_active').defaultTo(true);
});

// ENUMs pour contract_lines
await knex.schema.raw(`CREATE TYPE enum_contract_lines_service_type AS ENUM ('transport', 'handling', 'storage', 'customs', 'insurance', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_contract_lines_rate_type AS ENUM ('per_km', 'per_kg', 'per_m3', 'per_pallet', 'per_container', 'flat_rate', 'per_hour', 'percentage')`);
await knex.schema.raw(`CREATE TYPE enum_contract_lines_transport_mode AS ENUM ('road', 'sea', 'air', 'rail', 'multimodal')`);

// Table contract_lines
await knex.schema.createTable('contract_lines', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('contract_id').notNullable();
  table.specificType('service_type', 'enum_contract_lines_service_type').notNullable();
  table.text('service_description');
  table.specificType('rate_type', 'enum_contract_lines_rate_type').notNullable();
  table.decimal('rate_value').notNullable();
  table.string('currency', 3).notNullable();
  table.specificType('transport_mode', 'enum_contract_lines_transport_mode');
  table.text('origin_zone');
  table.text('destination_zone');
  table.string('origin_country');
  table.string('destination_country');
  table.decimal('min_quantity');
  table.decimal('max_quantity');
  table.decimal('min_weight');
  table.decimal('max_weight');
  table.decimal('min_volume');
  table.decimal('max_volume');
  table.decimal('min_distance');
  table.decimal('max_distance');
  table.decimal('discount_percentage');
  table.decimal('markup_percentage');
  table.boolean('fuel_surcharge_applicable').defaultTo(false);
  table.boolean('toll_applicable').defaultTo(false);
  table.boolean('insurance_applicable').defaultTo(false);
  table.specificType('tier_pricing', 'JSONB[]');
  table.date('effective_date');
  table.date('expiry_date');
  table.boolean('is_active').defaultTo(true);
  table.integer('priority').defaultTo(5);
  table.text('notes');
  table.bigInteger('tenant_id');
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
});

// ENUMs pour customs_info
await knex.schema.raw(`CREATE TYPE enum_customs_info_declaration_type AS ENUM ('export', 'import', 'transit', 'temporary_export', 'temporary_import', 're_export', 're_import', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_customs_info_incoterm AS ENUM ('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_customs_info_status AS ENUM ('not_required', 'pending', 'submitted', 'in_progress', 'cleared', 'held', 'rejected', 'completed')`);

// Création de la table customs_info
await knex.schema.createTable('customs_info', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('order_id').nullable();
  table.bigInteger('shipment_id').nullable();
  table.string('customs_declaration_number', 100).nullable();
  table.specificType('declaration_type', 'enum_customs_info_declaration_type').nullable();
  table.string('origin_country', 2).nullable();
  table.string('destination_country', 2).nullable();
  table.specificType('transit_countries', 'TEXT[]').nullable();
  table.decimal('customs_value').nullable();
  table.string('currency', 3).nullable();
  table.decimal('insurance_value').nullable();
  table.decimal('freight_value').nullable();
  table.decimal('duties_amount').nullable();
  table.decimal('taxes_amount').nullable();
  table.decimal('vat_amount').nullable();
  table.decimal('total_duties_taxes').nullable();
  table.specificType('incoterm', 'enum_customs_info_incoterm').nullable();
  table.bigInteger('exporter_id').nullable();
  table.bigInteger('importer_id').nullable();
  table.bigInteger('declarant_id').nullable();
  table.bigInteger('customs_broker_id').nullable();
  table.specificType('status', 'enum_customs_info_status').notNullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.timestamp('submission_date', { useTz: true }).nullable();
  table.timestamp('clearance_date', { useTz: true }).nullable();
  table.text('reason_for_hold').nullable();
  table.text('notes').nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUM pour drivers
await knex.schema.raw(`CREATE TYPE enum_drivers_status AS ENUM ('active', 'inactive', 'on_leave', 'suspended')`);

// Table drivers
await knex.schema.createTable('drivers', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('partner_id').notNullable();
  table.string('first_name', 100).notNullable();
  table.string('last_name', 100).notNullable();
  table.string('license_number', 50);
  table.string('license_type', 50);
  table.date('license_expiry');
  table.string('phone', 20);
  table.string('email', 255);
  table.specificType('status', 'enum_drivers_status').defaultTo('active');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
});

// ENUMs pour invoices
await knex.schema.raw(`CREATE TYPE enum_invoices_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_invoice_type AS ENUM ('standard', 'proforma', 'credit_note', 'debit_note')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_payment_method AS ENUM ('bank_transfer', 'credit_card', 'check', 'cash', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_discount_type AS ENUM ('percentage', 'fixed_amount')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_delivery_method AS ENUM ('email', 'postal', 'portal', 'api')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_generated_from AS ENUM ('manual', 'automatic', 'recurring', 'api')`);
await knex.schema.raw(`CREATE TYPE enum_invoices_recurring_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly')`);

// Table invoices
await knex.schema.createTable('invoices', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('invoice_number', 50).notNullable();
  table.bigInteger('customer_id').notNullable();
  table.text('customer_name');
  table.text('customer_address');
  table.text('customer_tax_number');
  table.date('invoice_date').notNullable();
  table.date('due_date').notNullable();
  table.integer('payment_terms');
  table.decimal('subtotal');
  table.decimal('tax_amount');
  table.decimal('discount_amount');
  table.decimal('total_amount');
  table.decimal('paid_amount').defaultTo(0);
  table.decimal('outstanding_amount');
  table.string('currency', 3).notNullable();
  table.decimal('exchange_rate');
  table.string('base_currency', 3);
  table.specificType('status', 'enum_invoices_status').notNullable();
  table.specificType('invoice_type', 'enum_invoices_invoice_type').defaultTo('standard');
  table.specificType('order_ids', 'INTEGER[]');
  table.specificType('shipment_ids', 'INTEGER[]');
  table.bigInteger('contract_id');
  table.specificType('payment_method', 'enum_invoices_payment_method');
  table.text('payment_reference');
  table.date('payment_date');
  table.decimal('tax_rate');
  table.text('tax_type');
  table.boolean('reverse_charge').defaultTo(false);
  table.specificType('discount_type', 'enum_invoices_discount_type');
  table.decimal('discount_value');
  table.text('discount_reason');
  table.timestamp('sent_date', { useTz: true });
  table.timestamp('viewed_date', { useTz: true });
  table.timestamp('first_reminder_date', { useTz: true });
  table.timestamp('last_reminder_date', { useTz: true });
  table.specificType('delivery_method', 'enum_invoices_delivery_method');
  table.text('delivery_address');
  table.specificType('delivery_status', 'enum_invoices_delivery_status');
  table.text('notes');
  table.text('internal_notes');
  table.text('payment_instructions');
  table.specificType('generated_from', 'enum_invoices_generated_from');
  table.bigInteger('template_id');
  table.boolean('is_recurring').defaultTo(false);
  table.specificType('recurring_frequency', 'enum_invoices_recurring_frequency');
  table.date('next_invoice_date');
  table.bigInteger('tenant_id');
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
});

// ENUMs pour invoice_lines
await knex.schema.raw(`CREATE TYPE enum_invoice_lines_unit_of_measure AS ENUM ('kg', 'm3', 'km', 'hour', 'day', 'pallet', 'container', 'piece', 'percentage')`);
await knex.schema.raw(`CREATE TYPE enum_invoice_lines_line_type AS ENUM ('transport', 'surcharge', 'tax', 'discount', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_invoice_lines_transport_mode AS ENUM ('road', 'sea', 'air', 'rail', 'multimodal')`);

// Table invoice_lines
await knex.schema.createTable('invoice_lines', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('invoice_id').notNullable();
  table.text('description').notNullable();
  table.text('detailed_description');
  table.decimal('quantity').notNullable();
  table.decimal('unit_price').notNullable();
  table.decimal('line_total').notNullable();
  table.specificType('unit_of_measure', 'enum_invoice_lines_unit_of_measure');
  table.specificType('line_type', 'enum_invoice_lines_line_type').defaultTo('transport');
  table.bigInteger('order_id');
  table.bigInteger('shipment_id');
  table.bigInteger('segment_id');
  table.bigInteger('rate_id');
  table.bigInteger('surcharge_id');
  table.text('origin');
  table.text('destination');
  table.specificType('transport_mode', 'enum_invoice_lines_transport_mode');
  table.date('service_date');
  table.decimal('tax_rate');
  table.decimal('tax_amount');
  table.boolean('is_tax_inclusive').defaultTo(false);
  table.decimal('discount_rate');
  table.decimal('discount_amount');
  table.integer('sort_order').defaultTo(0);
  table.boolean('is_billable').defaultTo(true);
  table.bigInteger('tenant_id');
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
});

// ENUMs pour orders
await knex.schema.raw(`CREATE TYPE enum_orders_status AS ENUM ('draft', 'confirmed', 'planned', 'in_progress', 'completed', 'cancelled', 'on_hold')`);
await knex.schema.raw(`CREATE TYPE enum_orders_priority AS ENUM ('low', 'normal', 'high', 'urgent')`);
await knex.schema.raw(`CREATE TYPE enum_orders_service_type AS ENUM ('standard', 'express', 'economy', 'custom')`);
await knex.schema.raw(`CREATE TYPE enum_orders_incoterm AS ENUM ('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'None')`);

// Table orders
await knex.schema.createTable('orders', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id');
  table.string('reference', 50);
  table.string('external_reference', 100);
  table.bigInteger('customer_id').notNullable();
  table.string('customer_order_reference', 100);
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
  table.timestamp('requested_date', { useTz: true });
  table.timestamp('promised_date', { useTz: true });
  table.specificType('status', 'enum_orders_status').notNullable();
  table.specificType('priority', 'enum_orders_priority');
  table.specificType('service_type', 'enum_orders_service_type');
  table.specificType('incoterm', 'enum_orders_incoterm');
  table.string('incoterm_location', 255);
  table.string('currency', 3);
  table.decimal('total_value');
  table.decimal('shipping_cost');
  table.decimal('insurance_cost');
  table.decimal('customs_cost');
  table.decimal('tax_amount');
  table.decimal('total_cost');
  table.bigInteger('origin_address_id');
  table.bigInteger('destination_address_id');
  table.specificType('preferred_transport_modes', 'TEXT[]');
  table.text('special_instructions');
  table.text('notes');
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
});

// ENUMs pour order_lines
await knex.schema.raw(`CREATE TYPE enum_order_lines_weight_unit AS ENUM ('kg', 'lb', 'g', 't', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_order_lines_dimension_unit AS ENUM ('cm', 'm', 'in', 'ft', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_order_lines_volume_unit AS ENUM ('m3', 'ft3', 'l', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_order_lines_temperature_unit AS ENUM ('C', 'F', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_order_lines_status AS ENUM ('pending', 'allocated', 'partially_shipped', 'shipped', 'cancelled')`);

// Table order_lines
await knex.schema.createTable('order_lines', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id');
  table.bigInteger('order_id').notNullable();
  table.integer('line_number');
  table.bigInteger('product_id');
  table.string('product_code', 50);
  table.string('product_name', 255).notNullable();
  table.text('description');
  table.decimal('quantity').notNullable();
  table.string('unit_of_measure', 20);
  table.decimal('weight');
  table.specificType('weight_unit', 'enum_order_lines_weight_unit');
  table.decimal('length');
  table.decimal('width');
  table.decimal('height');
  table.specificType('dimension_unit', 'enum_order_lines_dimension_unit');
  table.decimal('volume');
  table.specificType('volume_unit', 'enum_order_lines_volume_unit');
  table.string('packaging_type', 50);
  table.integer('packages_count');
  table.decimal('unit_value');
  table.decimal('total_value');
  table.string('currency', 3);
  table.boolean('is_dangerous_goods').defaultTo(false);
  table.string('dangerous_goods_class', 50);
  table.string('un_number', 20);
  table.boolean('temperature_controlled').defaultTo(false);
  table.decimal('min_temperature');
  table.decimal('max_temperature');
  table.specificType('temperature_unit', 'enum_order_lines_temperature_unit');
  table.string('country_of_origin', 2);
  table.string('hs_code', 20);
  table.specificType('status', 'enum_order_lines_status');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
});

// ENUMs pour partners
await knex.schema.raw(`CREATE TYPE enum_partners_type AS ENUM ('customer', 'carrier', 'supplier', 'agent', 'broker', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_partners_industry AS ENUM ('automotive', 'retail', 'manufacturing', 'technology', 'food_beverage', 'pharmaceutical', 'construction', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_partners_status AS ENUM ('active', 'inactive', 'pending', 'blocked')`); //modifié

// Table partners
await knex.schema.createTable('partners', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id');
  table.string('name', 255).notNullable();
  table.string('short_name', 100);
  table.specificType('type', 'enum_partners_type').notNullable();
  table.string('legal_form', 50).nullable(); //new
  table.specificType('industry', 'enum_partners_industry');
  //table.string('tax_id', 100); //à supprimer
  table.string('registration_number', 100);
  table.string('vat_number', 100);
  table.string('email', 255);
  table.string('phone', 50);
  table.string('website', 255);
  table.string('logo_url', 255).nullable(); //new
  table.string('main_contact_name', 100);
  table.string('main_contact_email', 255);
  table.string('main_contact_phone', 50);
  table.text('notes');
  table.specificType('status', 'enum_partners_status').defaultTo('active');
  table.timestamp('created_at', { useTz: true });
  table.timestamp('updated_at', { useTz: true });
  table.bigInteger('created_by');
  table.bigInteger('updated_by');
});

// Création des types ENUM partner_documents
  await knex.raw(`CREATE TYPE enum_partner_documents_type AS ENUM ('CONTRACT', 'CERTIFICATE', 'LICENSE', 'INSURANCE', 'INVOICE', 'OTHER');`);
  await knex.raw(`CREATE TYPE enum_partner_documents_status AS ENUM ('active', 'archived', 'expired');`);

  // Création de la table partner_documents
  await knex.schema.createTable('partner_documents', table => {
    table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary(); // id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY
    table.bigInteger('partner_id').notNullable();
    table.bigInteger('contract_id').nullable();

    // enum type - en Knex on utilise .specificType() car l'ENUM est déjà créé
    table.specificType('type', 'enum_partner_documents_type').defaultTo('OTHER');

    table.string('name', 255).notNullable();
    table.string('file_path', 255).notNullable();
    table.string('mime_type', 100).nullable();
    table.integer('size').nullable();
    table.timestamp('upload_date', { useTz: true }).nullable();
    table.date('expiry_date').nullable();

    table.specificType('status', 'enum_partner_documents_status').defaultTo('active');

    table.timestamp('created_at', { useTz: true }).nullable();
    table.timestamp('updated_at', { useTz: true }).nullable();

    table.bigInteger('created_by').nullable();
    table.bigInteger('updated_by').nullable();
  });
// Création de la table permissions
await knex.schema.createTable('permissions', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('name', 100).notNullable();
  table.string('code', 100).notNullable();
  table.string('module', 50).notNullable();
  table.string('description', 255).nullable();
  table.boolean('is_system_permission').defaultTo(true);
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// ENUMs pour pricing_rules
await knex.schema.raw(`CREATE TYPE enum_pricing_rules_rule_type AS ENUM ('rate_selection', 'discount', 'surcharge', 'validation', 'approval')`);
//table pricing_rules
await knex.schema.createTable('pricing_rules', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('name', 255).notNullable();
  table.text('description').nullable();
  table.specificType('rule_type', 'enum_pricing_rules_rule_type').notNullable();
  table.jsonb('conditions').notNullable();
  table.jsonb('actions').notNullable();
  table.integer('priority').defaultTo(50);
  table.boolean('is_active').defaultTo(true);
  table.date('effective_date').nullable();
  table.date('expiry_date').nullable();
  table.integer('usage_count').defaultTo(0);
  table.timestamp('last_used_at', { useTz: true }).nullable();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// ENUMs pour rates
await knex.schema.raw(`CREATE TYPE enum_rates_transport_mode AS ENUM ('road', 'sea', 'air', 'rail', 'multimodal')`);
await knex.schema.raw(`CREATE TYPE enum_rates_rate_type AS ENUM ('per_km', 'per_kg', 'per_m3', 'per_pallet', 'per_container', 'flat_rate', 'per_hour')`);

// Création de la table rates
await knex.schema.createTable('rates', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('name', 255).notNullable();
  table.text('description').nullable();
  table.specificType('transport_mode', 'enum_rates_transport_mode').notNullable();
  table.specificType('rate_type', 'enum_rates_rate_type').notNullable();
  table.decimal('base_rate').notNullable();
  table.string('currency', 3).notNullable();
  table.text('origin_zone').nullable();
  table.text('destination_zone').nullable();
  table.text('origin_country').nullable();
  table.text('destination_country').nullable();
  table.decimal('min_weight').nullable();
  table.decimal('max_weight').nullable();
  table.decimal('min_volume').nullable();
  table.decimal('max_volume').nullable();
  table.decimal('min_distance').nullable();
  table.decimal('max_distance').nullable();
  table.date('effective_date').notNullable();
  table.date('expiry_date').nullable();
  table.boolean('fuel_surcharge_applicable').defaultTo(false);
  table.boolean('toll_applicable').defaultTo(false);
  table.decimal('insurance_rate').nullable();
  table.specificType('tier_rates', 'jsonb[]').nullable();
  table.boolean('is_active').defaultTo(true);
  table.integer('priority').defaultTo(5);
  table.bigInteger('partner_id').nullable();
  table.bigInteger('contract_id').nullable();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// ENUMs pour reference_data
await knex.schema.raw(`CREATE TYPE enum_rates_pricing_unit AS ENUM ('per_km', 'per_ton', 'per_pallet', 'per_container', 'per_cbm', 'per_shipment', 'per_kg', 'per_lb')`);

// Création de la table reference_data
await knex.schema.createTable('reference_data', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').notNullable();
  table.string('category', 100).notNullable();
  table.string('code', 50).notNullable();
  table.string('label', 255).notNullable();
  table.text('description').nullable();
  table.text('value').nullable();
  table.jsonb('metadata').nullable();
  table.bigInteger('parent_id').nullable();
  table.integer('sort_order').defaultTo(0);
  table.integer('level').defaultTo(0);
  table.boolean('is_active').defaultTo(true);
  table.boolean('is_system').defaultTo(false);
  table.boolean('is_editable').defaultTo(true);
  table.string('language_code', 5).defaultTo('fr');
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});
table.unique(['tenant_id', 'category', 'code'], 'uniq_refdata_tenant_category_code');

// Création de la table roles
await knex.schema.createTable('roles', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.string('name', 50).notNullable();
  table.string('description', 255).notNullable();
  table.boolean('is_system_role').defaultTo(false);
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// Création de la table role_permissions
await knex.schema.createTable('role_permissions', table => {
  table.bigInteger('role_id').notNullable();
  table.bigInteger('permission_id').notNullable();
  table.timestamp('granted_at', { useTz: true }).nullable();
  table.bigInteger('granted_by').nullable();
});

// ENUMs pour shipments
await knex.schema.raw(`CREATE TYPE enum_shipments_shipment_type AS ENUM ('domestic', 'international', 'return', 'transfer')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_service_level AS ENUM ('standard', 'express', 'economy', 'custom')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_transport_mode AS ENUM ('road', 'rail', 'sea', 'air', 'inland_waterway', 'multimodal')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_status AS ENUM ('draft', 'planned', 'booked', 'in_transit', 'customs_hold', 'delivered', 'exception', 'cancelled', 'completed')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_weight_unit AS ENUM ('kg', 'lb', 'g', 't', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_volume_unit AS ENUM ('m3', 'ft3', 'l', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_incoterm AS ENUM ('EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_customs_status AS ENUM ('not_required', 'pending', 'in_progress', 'cleared', 'held', 'rejected', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_shipments_co2_emissions_unit AS ENUM ('kg', 't', 'None')`);

// Création de la table shipments
await knex.schema.createTable('shipments', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.string('reference', 50).nullable();
  table.bigInteger('order_id').nullable();
  table.specificType('shipment_type', 'enum_shipments_shipment_type').nullable();
  table.specificType('service_level', 'enum_shipments_service_level').nullable();
  table.bigInteger('origin_address_id').nullable();
  table.bigInteger('destination_address_id').nullable();
  table.bigInteger('carrier_id').nullable();
  table.string('carrier_reference', 100).nullable();
  table.specificType('transport_mode', 'enum_shipments_transport_mode').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.timestamp('planned_pickup_date', { useTz: true }).nullable();
  table.timestamp('actual_pickup_date', { useTz: true }).nullable();
  table.timestamp('planned_delivery_date', { useTz: true }).nullable();
  table.timestamp('actual_delivery_date', { useTz: true }).nullable();
  table.timestamp('estimated_arrival_date', { useTz: true }).nullable();
  table.specificType('status', 'enum_shipments_status').notNullable();
  table.decimal('total_weight').nullable();
  table.specificType('weight_unit', 'enum_shipments_weight_unit').nullable();
  table.decimal('total_volume').nullable();
  table.specificType('volume_unit', 'enum_shipments_volume_unit').nullable();
  table.integer('package_count').nullable();
  table.integer('pallet_count').nullable();
  table.decimal('total_cost').nullable();
  table.string('currency', 3).nullable();
  table.decimal('freight_cost').nullable();
  table.decimal('fuel_surcharge').nullable();
  table.decimal('customs_cost').nullable();
  table.decimal('insurance_cost').nullable();
  table.decimal('other_costs').nullable();
  table.specificType('incoterm', 'enum_shipments_incoterm').nullable();
  table.specificType('customs_status', 'enum_shipments_customs_status').nullable();
  table.decimal('co2_emissions').nullable();
  table.specificType('co2_emissions_unit', 'enum_shipments_co2_emissions_unit').nullable();
  table.text('special_instructions').nullable();
  table.text('notes').nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUMs pour shipment_documents
await knex.schema.raw(`CREATE TYPE enum_shipment_documents_document_type AS ENUM ('bill_of_lading', 'cmr', 'air_waybill', 'sea_waybill', 'commercial_invoice', 'packing_list', 'certificate_of_origin', 'dangerous_goods_declaration', 'customs_declaration', 'import_permit', 'export_permit', 'phytosanitary_certificate', 'insurance_certificate', 'inspection_certificate', 'delivery_note', 'pickup_note', 'proof_of_delivery', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_shipment_documents_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'signed', 'submitted', 'received', 'expired', 'cancelled')`);

// Création de la table shipment_documents
await knex.schema.createTable('shipment_documents', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('shipment_id').nullable();
  table.bigInteger('order_id').nullable();
  table.bigInteger('customs_info_id').nullable();
  table.bigInteger('transport_segment_id').nullable();
  table.specificType('document_type', 'enum_shipment_documents_document_type').notNullable();
  table.string('document_number', 100).nullable();
  table.string('reference', 100).nullable();
  table.string('file_name', 255).nullable();
  table.string('file_path', 255).nullable();
  table.string('file_type', 50).nullable();
  table.integer('file_size').nullable();
  table.specificType('status', 'enum_shipment_documents_status').notNullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.timestamp('issue_date', { useTz: true }).nullable();
  table.timestamp('expiry_date', { useTz: true }).nullable();
  table.bigInteger('issuer_id').nullable();
  table.bigInteger('recipient_id').nullable();
  table.text('notes').nullable();
  table.boolean('is_original').defaultTo(true);
  table.boolean('requires_original').defaultTo(false);
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUMs pour sites
await knex.schema.raw(`CREATE TYPE enum_sites_type AS ENUM ('WAREHOUSE', 'FACTORY', 'STORE', 'DISTRIBUTION_CENTER', 'CROSS_DOCK', 'OTHER')`);
await knex.schema.raw(`CREATE TYPE enum_sites_status AS ENUM ('active', 'inactive', 'maintenance', 'closed')`);

// Création de la table sites
await knex.schema.createTable('sites', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('partner_id').notNullable();
  table.bigInteger('address_id').notNullable();
  table.string('name', 100).notNullable();
  table.specificType('type', 'enum_sites_type').notNullable();
  table.string('code', 50).nullable();
  table.string('opening_hours', 255).nullable();
  table.bigInteger('contact_id').nullable();
  table.decimal('capacity').nullable();
  table.decimal('surface_area').nullable();
  table.integer('loading_docks').nullable();
  table.text('notes').nullable();
  table.specificType('status', 'enum_sites_status').defaultTo('active');
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUMs pour surcharges
await knex.schema.raw(`CREATE TYPE enum_surcharges_surcharge_type AS ENUM ('fuel', 'toll', 'security', 'customs', 'handling', 'storage', 'insurance', 'currency', 'peak_season', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_surcharges_calculation_method AS ENUM ('percentage', 'fixed_amount', 'per_km', 'per_kg', 'per_m3', 'per_pallet', 'per_container', 'per_hour')`);
await knex.schema.raw(`CREATE TYPE enum_surcharges_transport_mode AS ENUM ('road', 'sea', 'air', 'rail', 'multimodal', 'all')`);

// Création de la table surcharges
await knex.schema.createTable('surcharges', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('name', 255).notNullable();
  table.text('description').nullable();
  table.specificType('surcharge_type', 'enum_surcharges_surcharge_type').notNullable();
  table.specificType('calculation_method', 'enum_surcharges_calculation_method').notNullable();
  table.decimal('value').notNullable();
  table.string('currency', 3).notNullable();
  table.specificType('transport_mode', 'enum_surcharges_transport_mode').nullable();
  table.text('origin_zone').nullable();
  table.text('destination_zone').nullable();
  table.text('origin_country').nullable();
  table.text('destination_country').nullable();
  table.decimal('min_weight').nullable();
  table.decimal('max_weight').nullable();
  table.decimal('min_volume').nullable();
  table.decimal('max_volume').nullable();
  table.date('effective_date').nullable();
  table.date('expiry_date').nullable();
  table.specificType('applicable_days', 'text[]').nullable();
  table.string('start_time').nullable();
  table.string('end_time').nullable();
  table.decimal('min_amount').nullable();
  table.decimal('max_amount').nullable();
  table.specificType('tier_values', 'jsonb[]').nullable();
  table.decimal('fuel_base_price').nullable();
  table.decimal('fuel_threshold').nullable();
  table.decimal('fuel_adjustment_factor').nullable();
  table.boolean('is_active').defaultTo(true);
  table.boolean('is_mandatory').defaultTo(false);
  table.integer('priority').defaultTo(5);
  table.bigInteger('rate_id').nullable();
  table.bigInteger('contract_id').nullable();
  table.bigInteger('partner_id').nullable();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// ENUMs pour tenants
await knex.schema.raw(`CREATE TYPE enum_tenants_status AS ENUM ('active', 'inactive', 'pending', 'suspended')`);

// Création de la table tenants
await knex.schema.createTable('tenants', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.string('name', 100).notNullable();
  table.string('schema_name', 50).notNullable();
  table.string('domain', 255).nullable();
  table.string('logo_url', 255).nullable();
  table.string('primary_color', 20).nullable();
  table.string('secondary_color', 20).nullable();
  table.string('contact_email', 255).nullable();
  table.string('contact_phone', 20).nullable();
  table.string('address', 255).nullable();
  table.string('city', 100).nullable();
  table.string('postal_code', 20).nullable();
  table.string('country', 100).nullable();
  table.string('subscription_plan', 50).nullable();
  table.string('subscription_status', 50).nullable();
  table.timestamp('subscription_start_date', { useTz: true }).nullable();
  table.timestamp('subscription_end_date', { useTz: true }).nullable();
  table.integer('max_users').nullable();
  table.specificType('status', 'enum_tenants_status').notNullable().defaultTo('pending');
  table.jsonb('settings').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// ENUMs pour tours
await knex.schema.raw(`CREATE TYPE enum_tours_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled')`);

// Création de la table tours
await knex.schema.createTable('tours', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').notNullable();
  table.string('tour_name', 255).notNullable();
  table.string('tour_number', 50).nullable();
  table.date('planned_date').notNullable();
  table.string('start_time').nullable();
  table.string('end_time').nullable();
  table.specificType('status', 'enum_tours_status').notNullable();
  table.bigInteger('vehicle_id').nullable();
  table.bigInteger('driver_id').nullable();
  table.decimal('total_distance').nullable();
  table.integer('estimated_duration').nullable();
  table.integer('actual_duration').nullable();
  table.decimal('total_cost').nullable();
  table.decimal('optimization_score').nullable();
  table.jsonb('route_coordinates').nullable();
  table.text('notes').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});


// ENUMs pour tour_stops
await knex.schema.raw(`CREATE TYPE enum_tour_stops_location_type AS ENUM ('pickup', 'delivery', 'intermediate')`);
await knex.schema.raw(`CREATE TYPE enum_tour_stops_status AS ENUM ('pending', 'arrived', 'completed', 'skipped')`);

// Création de la table tour_stops
await knex.schema.createTable('tour_stops', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tour_id').notNullable();
  table.integer('stop_order').notNullable();
  table.specificType('location_type', 'enum_tour_stops_location_type').notNullable();
  table.bigInteger('address_id').notNullable();
  table.bigInteger('order_id').nullable();
  table.bigInteger('shipment_id').nullable();
  table.timestamp('scheduled_time', { useTz: true }).notNullable();
  table.timestamp('arrival_time', { useTz: true }).nullable();
  table.timestamp('departure_time', { useTz: true }).nullable();
  table.integer('service_duration').nullable();
  table.text('notes').nullable();
  table.specificType('status', 'enum_tour_stops_status').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// ENUMs pour tracking_events
await knex.schema.raw(`CREATE TYPE enum_tracking_events_event_type AS ENUM ('pickup_planned', 'pickup_delayed', 'pickup_completed', 'departure', 'arrival', 'in_transit', 'customs_clearance_start', 'customs_hold', 'customs_cleared', 'delivery_planned', 'delivery_delayed', 'delivery_completed', 'exception', 'status_update', 'document_update', 'location_update')`);
await knex.schema.raw(`CREATE TYPE enum_tracking_events_location_type AS ENUM ('address', 'port', 'airport', 'terminal', 'warehouse', 'hub', 'border', 'customs', 'vehicle', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_tracking_events_source AS ENUM ('carrier_api', 'edi', 'manual', 'gps', 'iot_device', 'mobile_app', 'email', 'system', 'None')`);

// Création de la table tracking_events
await knex.schema.createTable('tracking_events', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('shipment_id').nullable();
  table.bigInteger('transport_segment_id').nullable();
  table.bigInteger('transport_unit_id').nullable();
  table.specificType('event_type', 'enum_tracking_events_event_type').notNullable();
  table.string('event_code', 50).nullable();
  table.text('description').nullable();
  table.timestamp('timestamp', { useTz: true }).notNullable();
  table.timestamp('planned_timestamp', { useTz: true }).nullable();
  table.specificType('location_type', 'enum_tracking_events_location_type').nullable();
  table.bigInteger('location_id').nullable();
  table.string('location_name', 255).nullable();
  table.string('location_code', 50).nullable();
  table.string('country', 2).nullable();
  table.decimal('latitude').nullable();
  table.decimal('longitude').nullable();
  table.string('status', 50).nullable();
  table.string('reason_code', 50).nullable();
  table.text('reason').nullable();
  table.specificType('source', 'enum_tracking_events_source').nullable();
  table.string('source_reference', 100).nullable();
  table.text('notes').nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUMs pour transport_segments
await knex.schema.raw(`CREATE TYPE enum_transport_segments_transport_mode AS ENUM ('road', 'rail', 'sea', 'air', 'inland_waterway')`);
await knex.schema.raw(`CREATE TYPE enum_transport_segments_origin_location_type AS ENUM ('address', 'port', 'airport', 'terminal', 'warehouse', 'hub', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_segments_destination_location_type AS ENUM ('address', 'port', 'airport', 'terminal', 'warehouse', 'hub', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_segments_status AS ENUM ('planned', 'booked', 'in_transit', 'arrived', 'delayed', 'cancelled', 'completed')`);
await knex.schema.raw(`CREATE TYPE enum_transport_segments_distance_unit AS ENUM ('km', 'mi', 'nm', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_segments_co2_emissions_unit AS ENUM ('kg', 't', 'None')`);

// Création de la table transport_segments
await knex.schema.createTable('transport_segments', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('shipment_id').notNullable();
  table.integer('sequence_number').notNullable();
  table.string('reference', 50).nullable();
  table.specificType('transport_mode', 'enum_transport_segments_transport_mode').notNullable();
  table.bigInteger('carrier_id').nullable();
  table.string('carrier_reference', 100).nullable();
  table.bigInteger('vehicle_id').nullable();
  table.string('vehicle_reference', 100).nullable();
  table.bigInteger('driver_id').nullable();
  table.string('vessel_name', 100).nullable();
  table.string('voyage_number', 50).nullable();
  table.string('vessel_imo', 20).nullable();
  table.string('flight_number', 20).nullable();
  table.string('train_number', 20).nullable();
  table.string('wagon_number', 20).nullable();
  table.bigInteger('origin_location_id').nullable();
  table.specificType('origin_location_type', 'enum_transport_segments_origin_location_type').nullable();
  table.string('origin_location_code', 20).nullable();
  table.string('origin_location_name', 255).nullable();
  table.string('origin_country', 2).nullable();
  table.bigInteger('destination_location_id').nullable();
  table.specificType('destination_location_type', 'enum_transport_segments_destination_location_type').nullable();
  table.string('destination_location_code', 20).nullable();
  table.string('destination_location_name', 255).nullable();
  table.string('destination_country', 2).nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.timestamp('planned_departure_date', { useTz: true }).nullable();
  table.timestamp('actual_departure_date', { useTz: true }).nullable();
  table.timestamp('planned_arrival_date', { useTz: true }).nullable();
  table.timestamp('actual_arrival_date', { useTz: true }).nullable();
  table.timestamp('estimated_arrival_date', { useTz: true }).nullable();
  table.specificType('status', 'enum_transport_segments_status').notNullable();
  table.decimal('distance').nullable();
  table.specificType('distance_unit', 'enum_transport_segments_distance_unit').nullable();
  table.decimal('duration').nullable();
  table.decimal('cost').nullable();
  table.string('currency', 3).nullable();
  table.decimal('co2_emissions').nullable();
  table.specificType('co2_emissions_unit', 'enum_transport_segments_co2_emissions_unit').nullable();
  table.text('special_instructions').nullable();
  table.text('notes').nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUMs pour transport_units
await knex.schema.raw(`CREATE TYPE enum_transport_units_type AS ENUM ('container', 'pallet', 'box', 'crate', 'bag', 'drum', 'bulk', 'parcel', 'other')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_container_type AS ENUM ('dry_20', 'dry_40', 'dry_45', 'high_cube_40', 'high_cube_45', 'reefer_20', 'reefer_40', 'open_top_20', 'open_top_40', 'flat_rack_20', 'flat_rack_40', 'tank_20', 'tank_40', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_weight_unit AS ENUM ('kg', 'lb', 'g', 't', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_dimension_unit AS ENUM ('cm', 'm', 'in', 'ft', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_volume_unit AS ENUM ('m3', 'ft3', 'l', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_temperature_unit AS ENUM ('C', 'F', 'None')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_status AS ENUM ('empty', 'loaded', 'in_transit', 'delivered', 'returned', 'damaged', 'lost')`);
await knex.schema.raw(`CREATE TYPE enum_transport_units_current_location_type AS ENUM ('address', 'port', 'airport', 'terminal', 'warehouse', 'hub', 'vehicle', 'None')`);

// Création de la table transport_units
await knex.schema.createTable('transport_units', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.bigInteger('shipment_id').notNullable();
  table.string('reference', 50).nullable();
  table.specificType('type', 'enum_transport_units_type').notNullable();
  table.string('subtype', 50).nullable();
  table.string('identifier', 50).nullable();
  table.specificType('container_type', 'enum_transport_units_container_type').nullable();
  table.string('container_owner', 100).nullable();
  table.decimal('weight').nullable();
  table.specificType('weight_unit', 'enum_transport_units_weight_unit').nullable();
  table.decimal('tare_weight').nullable();
  table.decimal('net_weight').nullable();
  table.decimal('gross_weight').nullable();
  table.decimal('length').nullable();
  table.decimal('width').nullable();
  table.decimal('height').nullable();
  table.specificType('dimension_unit', 'enum_transport_units_dimension_unit').nullable();
  table.decimal('volume').nullable();
  table.specificType('volume_unit', 'enum_transport_units_volume_unit').nullable();
  table.integer('quantity').nullable();
  table.boolean('stackable').defaultTo(true);
  table.decimal('max_stack_weight').nullable();
  table.boolean('is_dangerous_goods').defaultTo(false);
  table.string('dangerous_goods_class', 50).nullable();
  table.string('un_number', 20).nullable();
  table.boolean('temperature_controlled').defaultTo(false);
  table.decimal('min_temperature').nullable();
  table.decimal('max_temperature').nullable();
  table.specificType('temperature_unit', 'enum_transport_units_temperature_unit').nullable();
  table.string('seal_number', 50).nullable();
  table.string('seal_type', 50).nullable();
  table.string('customs_seal', 50).nullable();
  table.specificType('status', 'enum_transport_units_status').notNullable();
  table.bigInteger('current_location_id').nullable();
  table.specificType('current_location_type', 'enum_transport_units_current_location_type').nullable();
  table.string('current_location_name', 255).nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.timestamp('loaded_at', { useTz: true }).nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// ENUMs pour users
await knex.schema.raw(`CREATE TYPE enum_users_status AS ENUM ('active', 'inactive', 'pending', 'locked')`);

// Création de la table users
await knex.schema.createTable('users', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('tenant_id').nullable();
  table.string('email', 255).notNullable();
  table.string('password_hash', 255).notNullable();
  table.string('first_name', 100).notNullable();
  table.string('last_name', 100).notNullable();
  table.string('phone', 20).nullable();
  table.string('job_title', 100).nullable();
  table.string('profile_image_url', 255).nullable();
  table.specificType('status', 'enum_users_status').defaultTo('pending');
  table.integer('failed_login_attempts').defaultTo(0);
  table.timestamp('last_login_at', { useTz: true }).nullable();
  table.text('password_reset_token').nullable();
  table.timestamp('password_reset_expires_at', { useTz: true }).nullable();
  table.timestamp('email_verified_at', { useTz: true }).nullable();
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

// Création de la table user_preferences
await knex.schema.createTable('user_preferences', table => {
  table.bigInteger('user_id').primary().notNullable();
  table.string('language', 10).defaultTo('fr');
  table.string('theme', 20).defaultTo('light');
  table.string('timezone', 50).defaultTo('Europe/Paris');
  table.string('date_format', 20).defaultTo('DD/MM/YYYY');
  table.string('time_format', 20).defaultTo('HH:mm');
  table.string('start_page', 50).defaultTo('dashboard');
  table.boolean('notifications_enabled').defaultTo(true);
  table.boolean('email_notifications').defaultTo(true);
  table.boolean('push_notifications').defaultTo(false);
  table.integer('items_per_page').defaultTo(25);
  table.jsonb('preferences').nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
});

// Création de la table user_roles
await knex.schema.createTable('user_roles', table => {
  table.bigInteger('user_id').notNullable();
  table.bigInteger('role_id').notNullable();
  table.timestamp('assigned_at', { useTz: true }).nullable();
  table.bigInteger('assigned_by').nullable();
  table.bigInteger('tenant_id').nullable();
});

// ENUMs pour vehicles
await knex.schema.raw(`CREATE TYPE enum_vehicles_type AS ENUM ('TRUCK', 'VAN', 'TRAILER', 'CONTAINER', 'OTHER')`);
await knex.schema.raw(`CREATE TYPE enum_vehicles_status AS ENUM ('active', 'inactive', 'maintenance', 'out_of_service')`);

// Création de la table vehicles
await knex.schema.createTable('vehicles', table => {
  table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
  table.bigInteger('partner_id').notNullable();
  table.string('registration_number', 50).notNullable();
  table.specificType('type', 'enum_vehicles_type').notNullable();
  table.string('brand', 50).nullable();
  table.string('model', 50).nullable();
  table.integer('year').nullable();
  table.decimal('capacity_volume').nullable();
  table.decimal('capacity_weight').nullable();
  table.decimal('length').nullable();
  table.decimal('width').nullable();
  table.decimal('height').nullable();
  table.string('fuel_type', 50).nullable();
  table.string('emissions_class', 50).nullable();
  table.specificType('status', 'enum_vehicles_status').defaultTo('active');
  table.timestamp('created_at', { useTz: true }).nullable();
  table.timestamp('updated_at', { useTz: true }).nullable();
  table.bigInteger('created_by').nullable();
  table.bigInteger('updated_by').nullable();
});

};



exports.down = async function(knex) {
  await knex.raw(`DROP TYPE IF EXISTS enum_vehicles_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_vehicles_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_users_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_weight_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_volume_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_temperature_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_dimension_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_current_location_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_units_container_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_segments_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_segments_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_segments_origin_location_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_segments_distance_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_segments_destination_location_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_transport_segments_co2_emissions_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tracking_events_source CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tracking_events_location_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tracking_events_event_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tours_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tour_stops_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tour_stops_location_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_tenants_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_surcharges_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_surcharges_surcharge_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_surcharges_calculation_method CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_sites_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_sites_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_weight_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_volume_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_shipment_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_service_level CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_incoterm CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_customs_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipments_co2_emissions_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipment_documents_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_shipment_documents_document_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_rates_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_rates_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_rates_rate_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_rates_rate_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_rates_pricing_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_pricing_rules_rule_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_partners_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_partners_industry CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_partners_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_partner_documents_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_partner_documents_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_orders_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_orders_service_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_orders_priority CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_orders_incoterm CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_order_lines_weight_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_order_lines_volume_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_order_lines_temperature_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_order_lines_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_order_lines_dimension_unit CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_recurring_frequency CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_payment_method CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_invoice_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_generated_from CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_discount_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_delivery_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoices_delivery_method CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoice_lines_unit_of_measure CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoice_lines_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_invoice_lines_line_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_drivers_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_customs_info_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_customs_info_incoterm CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_customs_info_declaration_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contracts_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contracts_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contracts_contract_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contract_lines_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contract_lines_service_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contract_lines_rate_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_contacts_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoices_validation_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoices_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoices_processing_method CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoices_priority CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoices_payment_method CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoice_lines_validation_status CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoice_lines_unit_of_measure CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoice_lines_transport_mode CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoice_lines_line_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoice_lines_anomaly_type CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_carrier_invoice_lines_anomaly_severity CASCADE;`);
  await knex.raw(`DROP TYPE IF EXISTS enum_addresses_status CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS vehicles CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS users CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS user_roles CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS user_preferences CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS transport_units CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS transport_segments CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS tracking_events CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS tours CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS tour_stops CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS tenants CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS surcharges CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS sites CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS shipments CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS shipment_documents CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS roles CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS role_permissions CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS reference_data CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS rates CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS rates CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS pricing_rules CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS permissions CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS partners CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS partner_documents CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS orders CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS order_lines CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS invoices CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS invoice_lines CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS drivers CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS customs_info CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS contracts CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS contracts CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS contract_lines CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS contacts CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS carrier_invoices CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS carrier_invoice_lines CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS audit_logs CASCADE;`);
  await knex.raw(`DROP TABLE IF EXISTS addresses CASCADE;`);
};
