// 20250703_create_partners_table.js
/**
 * Migration pour la table partners conforme au modèle Partner
 *
 * BIGINT GENERATED ALWAYS AS IDENTITY pour id
 * ENUM pour type et status
 */

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Création des types ENUM si non existants
  await knex.raw(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_type') THEN
      CREATE TYPE partner_type AS ENUM ('CLIENT', 'CARRIER', 'SUPPLIER', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_status') THEN
      CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'pending', 'blocked');
    END IF;
  END$$;`);

  await knex.schema.createTable('partners', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('tenant_id').nullable();
    table.string('name', 255).notNullable();
    table.enu('type', ['CLIENT', 'CARRIER', 'SUPPLIER', 'OTHER'], { useNative: true, enumName: 'partner_type' }).notNullable();
    table.string('legal_form', 50).nullable();
    table.string('registration_number', 50).nullable();
    table.string('vat_number', 50).nullable();
    table.string('website', 255).nullable();
    table.string('logo_url', 255).nullable();
    table.text('notes').nullable();
    table.enu('status', ['active', 'inactive', 'pending', 'blocked'], { useNative: true, enumName: 'partner_status' }).notNullable().defaultTo('active');
    table.timestamp('created_at', { useTz: true }).notNullable();
    table.timestamp('updated_at', { useTz: true }).notNullable();
    table.bigInteger('created_by').nullable();
    table.bigInteger('updated_by').nullable();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('partners');
  await knex.raw("DROP TYPE IF EXISTS partner_type CASCADE;");
  await knex.raw("DROP TYPE IF EXISTS partner_status CASCADE;");
};
