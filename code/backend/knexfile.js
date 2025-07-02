require('dotenv').config();

/**
 * @type { import("knex").Knex.Config }
 */
const baseConfig = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './database/seeds',
  },
  useNullAsDefault: true,
};

module.exports = {
  development: {
    ...baseConfig,
  },
  production: {
    ...baseConfig,
  },
};
