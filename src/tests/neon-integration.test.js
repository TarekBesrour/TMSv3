// Test d'intégration pour la connexion à Neon PostgreSQL
// Fichier: /home/ubuntu/tms_project/code/backend/src/tests/neon-integration.test.js

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion à Neon
const connectionString = process.env.DATABASE_URL || 'postgres://username:password@db.neon.tech/tms_db?sslmode=require';

// Créer un pool de connexions
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

describe('Tests d'intégration Neon PostgreSQL', () => {
  // Test de connexion de base
  test('Devrait se connecter à la base de données Neon', async () => {
    const client = await pool.connect();
    try {
      expect(client).toBeDefined();
      console.log('Connexion à Neon établie avec succès');
    } finally {
      client.release();
    }
  });

  // Test de requête simple
  test('Devrait exécuter une requête SQL simple', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 as number');
      expect(result.rows[0].number).toBe(1);
      console.log('Requête SQL simple exécutée avec succès');
    } finally {
      client.release();
    }
  });

  // Test de création de schéma
  test('Devrait créer un schéma de test', async () => {
    const client = await pool.connect();
    try {
      // Supprimer le schéma s'il existe déjà
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      
      // Créer un nouveau schéma
      await client.query('CREATE SCHEMA test_schema');
      
      // Vérifier que le schéma existe
      const result = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'test_schema'
      `);
      
      expect(result.rows.length).toBe(1);
      console.log('Schéma de test créé avec succès');
    } finally {
      // Nettoyer
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      client.release();
    }
  });

  // Test de création de table
  test('Devrait créer une table de test', async () => {
    const client = await pool.connect();
    try {
      // Créer un schéma de test
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      await client.query('CREATE SCHEMA test_schema');
      
      // Créer une table de test
      await client.query(`
        CREATE TABLE test_schema.test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Vérifier que la table existe
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'test_schema' AND table_name = 'test_table'
      `);
      
      expect(result.rows.length).toBe(1);
      console.log('Table de test créée avec succès');
    } finally {
      // Nettoyer
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      client.release();
    }
  });

  // Test d'insertion et de récupération de données
  test('Devrait insérer et récupérer des données', async () => {
    const client = await pool.connect();
    try {
      // Créer un schéma et une table de test
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      await client.query('CREATE SCHEMA test_schema');
      await client.query(`
        CREATE TABLE test_schema.test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insérer des données
      await client.query(`
        INSERT INTO test_schema.test_table (name) VALUES 
        ('Test 1'),
        ('Test 2'),
        ('Test 3')
      `);
      
      // Récupérer les données
      const result = await client.query('SELECT * FROM test_schema.test_table ORDER BY id');
      
      // Vérifier les résultats
      expect(result.rows.length).toBe(3);
      expect(result.rows[0].name).toBe('Test 1');
      expect(result.rows[1].name).toBe('Test 2');
      expect(result.rows[2].name).toBe('Test 3');
      
      console.log('Insertion et récupération de données réussies');
    } finally {
      // Nettoyer
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      client.release();
    }
  });

  // Test de la fonction de création de schéma tenant
  test('Devrait créer un schéma tenant avec la fonction create_tenant_schema', async () => {
    const client = await pool.connect();
    try {
      // Créer la fonction create_tenant_schema
      await client.query(`
        CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id TEXT) 
        RETURNS VOID AS $$
        BEGIN
            EXECUTE 'CREATE SCHEMA tenant_' || tenant_id;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      // Exécuter la fonction
      await client.query("SELECT create_tenant_schema('test')");
      
      // Vérifier que le schéma existe
      const result = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'tenant_test'
      `);
      
      expect(result.rows.length).toBe(1);
      console.log('Fonction create_tenant_schema testée avec succès');
    } finally {
      // Nettoyer
      await client.query('DROP SCHEMA IF EXISTS tenant_test CASCADE');
      await client.query('DROP FUNCTION IF EXISTS create_tenant_schema');
      client.release();
    }
  });

  // Test de performance
  test('Devrait effectuer des opérations avec des performances acceptables', async () => {
    const client = await pool.connect();
    try {
      // Créer un schéma et une table de test
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      await client.query('CREATE SCHEMA test_schema');
      await client.query(`
        CREATE TABLE test_schema.test_performance (
          id SERIAL PRIMARY KEY,
          data JSONB
        )
      `);
      
      // Mesurer le temps pour insérer 100 enregistrements
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await client.query(`
          INSERT INTO test_schema.test_performance (data) 
          VALUES ($1)
        `, [{ index: i, value: `test_${i}`, timestamp: new Date().toISOString() }]);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Temps pour insérer 100 enregistrements: ${duration}ms`);
      
      // La durée devrait être inférieure à 10 secondes (ajustez selon vos besoins)
      expect(duration).toBeLessThan(10000);
    } finally {
      // Nettoyer
      await client.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
      client.release();
    }
  });

  // Fermer le pool après tous les tests
  afterAll(async () => {
    await pool.end();
  });
});
