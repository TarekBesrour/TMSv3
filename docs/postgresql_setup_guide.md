# Guide d'initialisation de la base de données PostgreSQL pour le TMS

Ce guide vous explique comment initialiser la base de données PostgreSQL pour votre Transport Management System (TMS) avec intégration IA.

## Prérequis

- PostgreSQL 12 ou supérieur installé
- Accès administrateur à PostgreSQL
- Les scripts SQL de migration dans le dossier `/home/ubuntu/tms_project/code/database/migrations`

## 1. Installation de PostgreSQL (si nécessaire)

Si PostgreSQL n'est pas encore installé sur votre système :

```bash
# Sur Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Sur macOS avec Homebrew
brew install postgresql

# Sur Windows
# Téléchargez et installez depuis https://www.postgresql.org/download/windows/
```

## 2. Création de la base de données

Connectez-vous à PostgreSQL en tant qu'utilisateur administrateur :

```bash
sudo -u postgres psql
```

Créez un utilisateur dédié pour le TMS :

```sql
CREATE USER tms_user WITH PASSWORD 'votre_mot_de_passe_sécurisé';
```

Créez la base de données principale :

```sql
CREATE DATABASE tms_db WITH OWNER tms_user;
```

Accordez les privilèges nécessaires :

```sql
GRANT ALL PRIVILEGES ON DATABASE tms_db TO tms_user;
```

Quittez la session PostgreSQL :

```sql
\q
```

## 3. Configuration pour le mode SaaS multi-tenant

Connectez-vous à la base de données TMS :

```bash
psql -U tms_user -d tms_db
```

Créez un schéma pour les tables partagées :

```sql
CREATE SCHEMA shared;
```

Créez une fonction pour générer automatiquement des schémas par tenant :

```sql
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id TEXT) 
RETURNS VOID AS $$
BEGIN
    EXECUTE 'CREATE SCHEMA tenant_' || tenant_id;
END;
$$ LANGUAGE plpgsql;
```

## 4. Exécution des scripts de migration

### 4.1 Exécution manuelle via psql

Vous pouvez exécuter les scripts SQL directement depuis le terminal :

```bash
# Pour les tables partagées
psql -U tms_user -d tms_db -f /home/ubuntu/tms_project/code/database/migrations/01_create_shared_tables.sql

# Pour les tables spécifiques aux tenants (à répéter pour chaque tenant)
psql -U tms_user -d tms_db -f /home/ubuntu/tms_project/code/database/migrations/02_create_tenant_tables.sql
```

### 4.2 Utilisation de l'outil de migration Knex.js

Si vous préférez utiliser Knex.js (inclus dans le projet) :

```bash
cd /home/ubuntu/tms_project/code/backend
npm install
npx knex migrate:latest
```

## 5. Vérification de l'installation

Connectez-vous à la base de données pour vérifier que les tables ont été créées correctement :

```bash
psql -U tms_user -d tms_db
```

Listez les schémas :

```sql
\dn
```

Listez les tables du schéma partagé :

```sql
\dt shared.*
```

## 6. Configuration de la connexion dans l'application

Modifiez le fichier de configuration de l'application pour utiliser la base de données :

```javascript
// Dans /home/ubuntu/tms_project/code/backend/src/config/database.js
module.exports = {
  client: 'postgresql',
  connection: {
    host: 'localhost',
    database: 'tms_db',
    user: 'tms_user',
    password: 'votre_mot_de_passe_sécurisé'
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

## 7. Bonnes pratiques pour la gestion multi-tenant

### 7.1 Isolation des données par schéma

Le TMS utilise une stratégie d'isolation par schéma PostgreSQL :
- Un schéma `shared` pour les données communes
- Un schéma `tenant_X` pour chaque client (où X est l'identifiant du client)

### 7.2 Middleware de sélection de schéma

Dans l'application Node.js, un middleware détermine le schéma à utiliser en fonction du tenant :

```javascript
// Exemple de middleware de sélection de schéma
app.use((req, res, next) => {
  const tenantId = getTenantIdFromRequest(req);
  req.tenantSchema = `tenant_${tenantId}`;
  next();
});
```

### 7.3 Création automatique de schéma pour nouveaux tenants

Lors de l'onboarding d'un nouveau client, l'application crée automatiquement un nouveau schéma :

```javascript
// Exemple de fonction d'onboarding
async function onboardNewTenant(tenantId, tenantName) {
  // Créer le schéma
  await db.raw(`SELECT create_tenant_schema('${tenantId}')`);
  
  // Créer les tables pour ce tenant
  await db.raw(`SET search_path TO tenant_${tenantId}`);
  await db.migrate.latest();
  
  // Enregistrer le tenant dans la table des tenants
  await db('shared.tenants').insert({
    id: tenantId,
    name: tenantName,
    created_at: new Date()
  });
}
```

## 8. Sauvegarde et restauration

### 8.1 Sauvegarde de la base de données

```bash
pg_dump -U tms_user -d tms_db -F c -f tms_backup.dump
```

### 8.2 Restauration de la base de données

```bash
pg_restore -U tms_user -d tms_db -c tms_backup.dump
```

## 9. Dépannage

### 9.1 Problèmes de connexion

Si vous rencontrez des problèmes de connexion, vérifiez le fichier `pg_hba.conf` pour vous assurer que les connexions locales sont autorisées.

### 9.2 Réinitialisation de la base de données

Pour réinitialiser complètement la base de données :

```sql
DROP DATABASE tms_db;
CREATE DATABASE tms_db WITH OWNER tms_user;
```

### 9.3 Logs PostgreSQL

Consultez les logs PostgreSQL pour diagnostiquer les problèmes :

```bash
sudo tail -f /var/log/postgresql/postgresql-12-main.log
```
