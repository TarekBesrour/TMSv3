# Guide de Configuration de Neon PostgreSQL pour le TMS

Ce guide explique comment configurer votre base de données PostgreSQL hébergée sur Neon pour votre Transport Management System (TMS).

## Table des matières

1. [Introduction à Neon](#introduction-à-neon)
2. [Configuration de la connexion](#configuration-de-la-connexion)
3. [Exécution des scripts de migration](#exécution-des-scripts-de-migration)
4. [Configuration multi-tenant sur Neon](#configuration-multi-tenant-sur-neon)
5. [Optimisation des performances](#optimisation-des-performances)
6. [Sauvegarde et restauration](#sauvegarde-et-restauration)
7. [Surveillance et maintenance](#surveillance-et-maintenance)

## Introduction à Neon

Neon est une plateforme PostgreSQL serverless qui sépare le stockage du calcul, offrant une mise à l'échelle automatique et une facturation basée sur l'utilisation. C'est un choix idéal pour les applications SaaS comme votre TMS.

### Avantages de Neon pour votre TMS

- **Architecture serverless** : pas de serveurs à gérer
- **Mise à l'échelle automatique** : s'adapte à la charge de travail
- **Séparation stockage/calcul** : optimisation des coûts
- **Branches de base de données** : parfait pour les environnements de test
- **Compatible PostgreSQL** : tous les scripts fonctionnent sans modification

## Configuration de la connexion

### Obtenir la chaîne de connexion

1. Connectez-vous à votre compte Neon
2. Sélectionnez votre projet
3. Cliquez sur "Connection Details"
4. Copiez la chaîne de connexion fournie

### Configuration du backend Node.js

Mettez à jour le fichier `.env` dans votre backend :

```
DATABASE_URL=postgres://username:password@db.neon.tech/tms_db?sslmode=require
```

### Configuration de Knex.js

Si vous utilisez Knex.js, mettez à jour le fichier de configuration :

```javascript
// Dans /home/ubuntu/tms_project/code/backend/src/config/database.js
module.exports = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: 'db.neon.tech',
    database: 'tms_db',
    user: 'your_neon_username',
    password: 'your_neon_password',
    ssl: {
      rejectUnauthorized: false
    }
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations'
  }
};
```

## Exécution des scripts de migration

### Option 1 : Utilisation de psql

```bash
# Installer le client PostgreSQL si nécessaire
sudo apt-get install postgresql-client

# Exécuter le script de création des tables
psql "postgres://username:password@db.neon.tech/tms_db?sslmode=require" -f /home/ubuntu/tms_project/code/database/migrations/01_create_tables.sql

# Exécuter le script de données de test
psql "postgres://username:password@db.neon.tech/tms_db?sslmode=require" -f /home/ubuntu/tms_project/code/database/seeds/01_seed_test_data.sql
```

### Option 2 : Utilisation de Knex.js

```bash
cd /home/ubuntu/tms_project/code/backend
npm install
npx knex migrate:latest
npx knex seed:run
```

## Configuration multi-tenant sur Neon

La stratégie d'isolation par schéma PostgreSQL fonctionne parfaitement avec Neon :

### Création de schémas pour les tenants

```sql
-- Créer le schéma partagé
CREATE SCHEMA shared;

-- Créer la fonction pour générer des schémas par tenant
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id TEXT) 
RETURNS VOID AS $$
BEGIN
    EXECUTE 'CREATE SCHEMA tenant_' || tenant_id;
END;
$$ LANGUAGE plpgsql;
```

### Considérations spécifiques à Neon

1. **Connexions pooling** : Neon limite le nombre de connexions simultanées. Configurez votre pool de connexions en conséquence :

```javascript
// Configuration du pool de connexions
const pool = {
  min: 0, // Commencer avec 0 connexion
  max: 10, // Maximum 10 connexions simultanées
  idleTimeoutMillis: 30000, // Libérer les connexions inactives après 30 secondes
  acquireTimeoutMillis: 30000 // Timeout pour l'acquisition d'une connexion
};
```

2. **Timeouts de requête** : Neon peut avoir des timeouts plus courts que PostgreSQL standard :

```javascript
// Ajouter un timeout pour les requêtes longues
const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: pool,
  acquireConnectionTimeout: 60000 // 60 secondes
});
```

## Optimisation des performances

### Indexation

Les index sont particulièrement importants sur Neon pour optimiser les performances :

```sql
-- Exemple d'index pour les tables fréquemment consultées
CREATE INDEX idx_orders_client_id ON tenant_1.orders(client_id);
CREATE INDEX idx_shipments_order_id ON tenant_1.shipments(order_id);
CREATE INDEX idx_routes_carrier_id ON tenant_1.routes(carrier_id);
```

### Requêtes optimisées

Optimisez vos requêtes pour Neon :

1. Utilisez des requêtes préparées pour réduire l'overhead d'analyse
2. Limitez les résultats avec LIMIT pour réduire la charge
3. Utilisez des jointures efficaces et évitez les sous-requêtes inutiles

```javascript
// Exemple de requête optimisée avec Knex
const results = await knex('orders')
  .select('orders.*', 'clients.name as client_name')
  .join('clients', 'orders.client_id', 'clients.id')
  .where('orders.status', 'confirmed')
  .orderBy('orders.created_at', 'desc')
  .limit(100);
```

### Mise en cache

Implémentez une couche de cache pour réduire les requêtes à la base de données :

```javascript
// Exemple avec Redis
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function getCachedData(key, fetchFunction) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchFunction();
  await redis.set(key, JSON.stringify(data), 'EX', 300); // Cache for 5 minutes
  return data;
}
```

## Sauvegarde et restauration

### Sauvegardes automatiques

Neon fournit des sauvegardes automatiques, mais vous pouvez également créer des sauvegardes manuelles :

```bash
# Sauvegarde manuelle avec pg_dump
pg_dump "postgres://username:password@db.neon.tech/tms_db?sslmode=require" -F c -f tms_backup.dump
```

### Restauration

Pour restaurer une base de données à partir d'une sauvegarde :

```bash
# Restauration avec pg_restore
pg_restore -d "postgres://username:password@db.neon.tech/tms_db?sslmode=require" -c tms_backup.dump
```

### Branches de base de données

Neon permet de créer des branches de base de données, idéales pour les tests :

1. Dans l'interface Neon, créez une nouvelle branche à partir de votre branche principale
2. Utilisez cette branche pour les tests sans affecter les données de production
3. Fusionnez ou supprimez la branche selon les besoins

## Surveillance et maintenance

### Surveillance des performances

Neon fournit des métriques de base, mais vous pouvez implémenter une surveillance supplémentaire :

```javascript
// Middleware pour surveiller les temps de requête
app.use(async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    
    // Enregistrer les requêtes lentes
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });
  
  next();
});
```

### Maintenance régulière

1. Surveillez les performances des requêtes
2. Analysez régulièrement les tables pour mettre à jour les statistiques
3. Vérifiez l'utilisation des connexions et ajustez les pools si nécessaire

```sql
-- Analyse des tables pour mettre à jour les statistiques
ANALYZE tenant_1.orders;
ANALYZE tenant_1.shipments;
```

## Conclusion

Neon PostgreSQL est un excellent choix pour votre TMS en mode SaaS. Sa nature serverless et sa compatibilité avec PostgreSQL standard permettent une intégration transparente avec votre application, tout en offrant des avantages significatifs en termes de coûts et de mise à l'échelle.

Pour toute assistance supplémentaire ou pour des optimisations spécifiques à Neon, n'hésitez pas à consulter la documentation officielle de Neon ou à contacter l'équipe de support.
