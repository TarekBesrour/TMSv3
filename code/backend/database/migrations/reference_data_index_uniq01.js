exports.up = async function(knex) {
  await knex.schema.alterTable('reference_data', (table) => {
    table.unique(['tenant_id', 'category', 'code'], 'uniq_refdata_tenant_category_code');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('reference_data', (table) => {
    table.dropUnique(['tenant_id', 'category', 'code'], 'uniq_refdata_tenant_category_code');
  });
};
