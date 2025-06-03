# Database PostgreSQL - README

## TMS (Transport Management System) - Database

Ce répertoire contient les scripts de base de données du TMS (Transport Management System), développés pour PostgreSQL avec une architecture multi-tenant.

## Structure du Projet

Les scripts de base de données sont organisés selon une structure logique :

```
database/
├── migrations/              # Scripts de migration pour l'évolution du schéma
├── seeds/                   # Données initiales pour le développement et les tests
├── functions/               # Fonctions et procédures stockées
├── triggers/                # Triggers pour l'automatisation
├── views/                   # Vues pour simplifier les requêtes complexes
├── indexes/                 # Index pour optimiser les performances
└── schema/                  # Définition du schéma de base
    ├── public.sql           # Schéma public (tables partagées)
    └── tenant_template.sql  # Template de schéma pour nouveaux tenants
```

## Prérequis

- PostgreSQL (v13+)
- psql (client PostgreSQL en ligne de commande)

## Configuration

1. Créer une base de données PostgreSQL :

```bash
createdb tms_db
```

2. Configurer les variables d'environnement ou un fichier `.env` avec les informations de connexion :

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tms_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Initialisation de la Base de Données

Pour initialiser la base de données avec le schéma de base :

```bash
psql -U postgres -d tms_db -f schema/public.sql
```

## Migrations

Les migrations permettent de faire évoluer le schéma de la base de données de manière contrôlée :

1. Chaque migration est numérotée et datée (ex: `20250528_initial.sql`)
2. Les migrations sont appliquées séquentiellement
3. Une table `migrations` dans le schéma `public` garde trace des migrations appliquées

Pour appliquer les migrations :

```bash
# Via le script Node.js du backend
cd ../backend
npm run migrate

# Ou directement avec psql
psql -U postgres -d tms_db -f migrations/20250528_initial.sql
```

## Données de Test

Pour peupler la base de données avec des données de test :

```bash
# Via le script Node.js du backend
cd ../backend
npm run seed

# Ou directement avec psql
psql -U postgres -d tms_db -f seeds/reference_data.sql
psql -U postgres -d tms_db -f seeds/test_tenant.sql
```

## Architecture Multi-Tenant

La base de données utilise une approche "schéma par tenant" pour l'isolation des données :

- Le schéma `public` contient les tables partagées (tenants, configuration globale)
- Chaque client (tenant) dispose de son propre schéma nommé `client_[id]`
- Les requêtes sont automatiquement routées vers le schéma approprié via un middleware de résolution de tenant dans le backend

## Création d'un Nouveau Tenant

Pour créer un nouveau tenant (client) dans le système :

```bash
# Via le script Node.js du backend
cd ../backend
npm run create-tenant -- --name="Company Name" --code=company

# Ou directement avec psql et la fonction dédiée
psql -U postgres -d tms_db -c "SELECT create_tenant('company', 'Company Name');"
```

## Sauvegarde et Restauration

Pour sauvegarder la base de données complète :

```bash
pg_dump -U postgres -d tms_db > tms_backup_$(date +%Y%m%d).sql
```

Pour sauvegarder uniquement les données d'un tenant spécifique :

```bash
pg_dump -U postgres -d tms_db -n client_1 > tenant1_backup_$(date +%Y%m%d).sql
```

Pour restaurer une sauvegarde :

```bash
psql -U postgres -d tms_db < tms_backup_20250528.sql
```

## Modèle de Données

Le schéma de base de données est organisé en plusieurs groupes fonctionnels :

1. **Partenaires et Entités** - Gestion des clients, transporteurs, sites et utilisateurs
2. **Commandes et Expéditions** - Gestion des commandes, tournées et livraisons
3. **Coûts et Facturation** - Gestion des tarifs, factures et paiements
4. **Flotte et Ressources** - Gestion des véhicules, conducteurs et équipements
5. **Analyse et Reporting** - Tables pour le reporting et l'analyse
6. **Intégration et Connectivité** - Tables pour les intégrations et l'EDI
7. **Administration et Configuration** - Tables système et de configuration

Pour une description détaillée du modèle de données, consultez le document `schema_base_donnees.md` dans le dossier `docs/architecture/`.

## Optimisation des Performances

Plusieurs stratégies sont mises en place pour optimiser les performances :

1. **Indexation** - Index sur les colonnes fréquemment utilisées dans les requêtes
2. **Partitionnement** - Tables volumineuses partitionnées par date ou autre critère
3. **Vues matérialisées** - Pour les requêtes analytiques complexes
4. **Fonctions optimisées** - Utilisation de PL/pgSQL pour les opérations complexes

## Maintenance

Tâches de maintenance recommandées :

1. **VACUUM ANALYZE** - Régulièrement pour optimiser les performances
2. **Vérification des index** - S'assurer que les index sont utilisés efficacement
3. **Monitoring des requêtes lentes** - Identifier et optimiser les requêtes problématiques
4. **Archivage des données anciennes** - Stratégie pour gérer la croissance des données

## Bonnes Pratiques

- Utiliser les transactions pour maintenir l'intégrité des données
- Documenter toutes les modifications de schéma via des migrations
- Tester les migrations sur un environnement de staging avant production
- Maintenir des sauvegardes régulières
- Utiliser des contraintes pour garantir l'intégrité des données
