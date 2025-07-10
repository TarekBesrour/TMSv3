exports.up = async function(knex) {
  // Création des types ENUM nécessaires
  await knex.schema.raw(`CREATE TYPE enum_payments_payment_type AS ENUM ('incoming', 'outgoing')`);
  await knex.schema.raw(`CREATE TYPE enum_payments_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')`);
  await knex.schema.raw(`CREATE TYPE enum_payments_payment_method AS ENUM ('bank_transfer', 'credit_card', 'check', 'cash', 'direct_debit', 'other')`);

  // Création de la table payments
  await knex.schema.createTable('payments', table => {
    table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
    table.bigInteger('tenant_id').notNullable();

    table.specificType('payment_type', 'enum_payments_payment_type').notNullable();
    table.string('reference', 100);

    table.bigInteger('invoice_id').nullable();
    table.bigInteger('carrier_invoice_id').nullable();
    table.bigInteger('partner_id').notNullable();

    table.decimal('amount', 18, 2).notNullable();
    table.string('currency', 3).notNullable();
    table.decimal('exchange_rate', 18, 6).nullable();
    table.decimal('amount_base_currency', 18, 2).nullable();

    table.date('payment_date').notNullable();
    table.date('due_date').nullable();

    table.specificType('status', 'enum_payments_status').notNullable();
    table.specificType('payment_method', 'enum_payments_payment_method');

    table.bigInteger('bank_account_id').nullable();
    table.string('transaction_reference', 255).nullable();

    table.text('description').nullable();
    table.text('notes').nullable();

    table.bigInteger('created_by').notNullable();
    table.bigInteger('updated_by').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

     // Indexes et clés étrangères (optionnel, à adapter selon tes besoins)
    // table.foreign('invoice_id').references('invoices.id');
    // table.foreign('carrier_invoice_id').references('carrier_invoices.id');
    // table.foreign('partner_id').references('partners.id');
    // table.foreign('bank_account_id').references('bank_accounts.id');
    // table.foreign('created_by').references('users.id');
    // table.foreign('updated_by').references('users.id');
    // table.foreign('tenant_id').references('tenants.id');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.raw(`DROP TYPE IF EXISTS enum_payments_payment_type CASCADE;`);
  await knex.schema.raw(`DROP TYPE IF EXISTS enum_payments_status CASCADE;`);
  await knex.schema.raw(`DROP TYPE IF EXISTS enum_payments_payment_method CASCADE;`);
};