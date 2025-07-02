// Exemple de migration
exports.up = function(knex) {
  return knex.schema.createTable('bank_accounts', function(table) {    
    table.specificType('id', 'BIGINT GENERATED ALWAYS AS IDENTITY').primary();
    table.bigInteger('tenant_id').notNullable();
    table.string('account_name').notNullable();
    table.string('account_number').notNullable();
    table.string('iban', 34);
    table.string('swift_bic', 11);
    table.string('bank_name').notNullable();
    table.string('bank_address');
    table.string('bank_code', 20);
    table.string('currency', 3).notNullable();
    table.boolean('is_default').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.string('account_type').defaultTo('business');
    table.decimal('current_balance', 18, 2);
    table.timestamp('last_balance_update');
    table.text('description');
    table.text('notes');
    table.bigInteger('created_by');
    table.bigInteger('updated_by');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bank_accounts');
};