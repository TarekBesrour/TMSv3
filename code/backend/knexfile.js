// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://neondb_owner:******@ep-white-brook-a8adsqfc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    migrations: {
      directory: './database/knex_migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
    ssl: { rejectUnauthorized: false }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://neondb_owner:******@ep-white-brook-a8adsqfc-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
    migrations: {
      directory: './database/knex_migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
    ssl: { rejectUnauthorized: false }
  }

};
