# Structure du Projet TMS

Ce document décrit la structure des répertoires et l'organisation du code pour le projet TMS (Transport Management System), développé en mode SaaS avec React.js (frontend), Node.js (backend) et PostgreSQL (base de données).

## Vue d'Ensemble

Le projet est organisé selon une architecture moderne séparant clairement le frontend et le backend :

```
tms_project/
├── frontend/         # Application React.js avec Tailwind CSS
├── backend/          # API Node.js
└── database/         # Scripts SQL et migrations PostgreSQL
```

Cette séparation permet un développement indépendant des différentes parties du système, tout en facilitant l'intégration continue et le déploiement.

## Structure Frontend (React.js + Tailwind CSS)

Le frontend est structuré selon les meilleures pratiques React, avec une organisation modulaire favorisant la réutilisation des composants et la maintenabilité du code.

```
frontend/
├── public/                    # Ressources statiques publiques
│   ├── favicon.ico
│   ├── index.html
│   └── assets/
│       ├── images/
│       └── fonts/
├── src/
│   ├── assets/                # Ressources utilisées dans le code
│   │   ├── icons/
│   │   └── styles/
│   ├── components/            # Composants React réutilisables
│   │   ├── common/            # Composants génériques (boutons, inputs, etc.)
│   │   ├── layout/            # Composants de mise en page (header, sidebar, etc.)
│   │   └── modules/           # Composants spécifiques aux modules fonctionnels
│   │       ├── partners/
│   │       ├── orders/
│   │       ├── shipments/
│   │       ├── billing/
│   │       ├── fleet/
│   │       ├── reporting/
│   │       └── admin/
│   ├── contexts/              # Contextes React pour la gestion d'état globale
│   ├── hooks/                 # Hooks React personnalisés
│   ├── pages/                 # Pages de l'application
│   │   ├── auth/              # Pages d'authentification
│   │   ├── dashboard/
│   │   ├── partners/
│   │   ├── orders/
│   │   ├── shipments/
│   │   ├── billing/
│   │   ├── fleet/
│   │   ├── reporting/
│   │   └── admin/
│   ├── services/              # Services pour les appels API
│   │   ├── api.js             # Configuration de base des appels API
│   │   ├── auth.service.js
│   │   ├── partners.service.js
│   │   └── ...
│   ├── store/                 # Configuration Redux pour la gestion d'état
│   │   ├── actions/
│   │   ├── reducers/
│   │   ├── selectors/
│   │   └── store.js
│   ├── utils/                 # Utilitaires et helpers
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── ...
│   ├── App.js                 # Composant racine de l'application
│   ├── index.js               # Point d'entrée de l'application
│   └── routes.js              # Configuration des routes
├── .env                       # Variables d'environnement (dev)
├── .env.production            # Variables d'environnement (prod)
├── .eslintrc.js               # Configuration ESLint
├── .prettierrc                # Configuration Prettier
├── tailwind.config.js         # Configuration Tailwind CSS
├── package.json               # Dépendances et scripts
└── README.md                  # Documentation
```

### Choix Techniques Frontend

- **React.js** : Bibliothèque UI pour construire des interfaces utilisateur interactives
- **Tailwind CSS** : Framework CSS utilitaire pour un design responsive et personnalisable
- **Redux** : Gestion d'état global pour les données complexes et partagées
- **React Router** : Gestion du routage côté client
- **Axios** : Client HTTP pour les appels API
- **React Query** : Gestion des requêtes, mise en cache et synchronisation avec le serveur
- **Formik + Yup** : Gestion des formulaires et validation
- **React-Table** : Tables de données interactives
- **Recharts** : Visualisation de données et graphiques
- **i18next** : Internationalisation

## Structure Backend (Node.js)

Le backend est organisé selon une architecture modulaire, avec une séparation claire des responsabilités et une structure favorisant l'extensibilité.

```
backend/
├── src/
│   ├── api/                   # Routes et contrôleurs API
│   │   ├── middlewares/       # Middlewares Express
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── tenant.middleware.js
│   │   │   └── ...
│   │   ├── routes/            # Définition des routes API
│   │   │   ├── auth.routes.js
│   │   │   ├── partners.routes.js
│   │   │   ├── orders.routes.js
│   │   │   └── ...
│   │   └── controllers/       # Contrôleurs pour chaque entité
│   │       ├── auth.controller.js
│   │       ├── partners.controller.js
│   │       ├── orders.controller.js
│   │       └── ...
│   ├── config/                # Configuration de l'application
│   │   ├── database.js
│   │   ├── server.js
│   │   ├── logger.js
│   │   └── ...
│   ├── db/                    # Couche d'accès aux données
│   │   ├── models/            # Modèles de données
│   │   │   ├── partner.model.js
│   │   │   ├── order.model.js
│   │   │   └── ...
│   │   ├── repositories/      # Repositories pour l'accès aux données
│   │   │   ├── partner.repository.js
│   │   │   ├── order.repository.js
│   │   │   └── ...
│   │   └── migrations/        # Scripts de migration de base de données
│   ├── services/              # Logique métier
│   │   ├── auth.service.js
│   │   ├── partner.service.js
│   │   ├── order.service.js
│   │   ├── shipment.service.js
│   │   ├── billing.service.js
│   │   ├── reporting.service.js
│   │   └── ...
│   ├── utils/                 # Utilitaires et helpers
│   │   ├── errors.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── ...
│   ├── jobs/                  # Tâches planifiées et workers
│   │   ├── scheduler.js
│   │   ├── email.job.js
│   │   ├── report.job.js
│   │   └── ...
│   ├── integrations/          # Intégrations avec services externes
│   │   ├── email/
│   │   ├── payment/
│   │   ├── maps/
│   │   ├── telematics/
│   │   └── edi/
│   ├── app.js                 # Configuration de l'application Express
│   └── server.js              # Point d'entrée du serveur
├── .env                       # Variables d'environnement (dev)
├── .env.production            # Variables d'environnement (prod)
├── .eslintrc.js               # Configuration ESLint
├── .prettierrc                # Configuration Prettier
├── nodemon.json               # Configuration Nodemon pour le développement
├── package.json               # Dépendances et scripts
└── README.md                  # Documentation
```

### Choix Techniques Backend

- **Node.js** : Environnement d'exécution JavaScript côté serveur
- **Express.js** : Framework web pour Node.js
- **PostgreSQL** : Base de données relationnelle
- **node-postgres (pg)** : Client PostgreSQL pour Node.js
- **Knex.js** : Query builder SQL pour les interactions avec la base de données
- **Objection.js** : ORM basé sur Knex.js
- **JWT** : Authentification basée sur les tokens
- **Winston** : Logging
- **Joi** : Validation des données
- **Bull** : File d'attente pour les tâches asynchrones et planifiées
- **Jest** : Framework de test

## Structure Base de Données (PostgreSQL)

La structure de la base de données est organisée selon l'approche multi-tenant avec un schéma par client.

```
database/
├── migrations/              # Scripts de migration pour l'évolution du schéma
│   ├── 20250528_initial.sql
│   └── ...
├── seeds/                   # Données initiales pour le développement et les tests
│   ├── reference_data.sql
│   ├── test_tenant.sql
│   └── ...
├── functions/               # Fonctions et procédures stockées
│   ├── tenant_management.sql
│   ├── reporting.sql
│   └── ...
├── triggers/                # Triggers pour l'automatisation
│   ├── audit_triggers.sql
│   └── ...
├── views/                   # Vues pour simplifier les requêtes complexes
│   ├── shipment_summary.sql
│   ├── billing_reports.sql
│   └── ...
├── indexes/                 # Index pour optimiser les performances
│   ├── performance_indexes.sql
│   └── ...
└── schema/                  # Définition du schéma de base
    ├── public.sql           # Schéma public (tables partagées)
    └── tenant_template.sql  # Template de schéma pour nouveaux tenants
```

## Configuration Multi-Tenant

L'architecture multi-tenant est implémentée à plusieurs niveaux :

### Frontend

- Personnalisation par tenant (logo, couleurs, etc.) via des thèmes dynamiques
- Routage basé sur le domaine ou sous-domaine pour identifier le tenant
- Stockage des préférences utilisateur spécifiques au tenant

### Backend

- Middleware de résolution de tenant basé sur le domaine, les en-têtes ou les tokens
- Contexte de tenant injecté dans chaque requête
- Isolation des données via le schéma PostgreSQL

### Base de Données

- Un schéma PostgreSQL distinct par tenant
- Schéma `public` pour les tables partagées (tenants, configuration globale)
- Procédures stockées pour la gestion des tenants (création, migration, sauvegarde)

## Scripts et Outils de Développement

Le projet inclut divers scripts et outils pour faciliter le développement :

```json
// package.json (backend)
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "lint": "eslint .",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "create-tenant": "node scripts/create-tenant.js"
  }
}
```

```json
// package.json (frontend)
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{js,jsx}\""
  }
}
```

## Déploiement et CI/CD

Le projet est configuré pour un déploiement moderne avec intégration et déploiement continus :

- **Docker** : Conteneurisation des applications frontend et backend
- **Docker Compose** : Orchestration locale pour le développement
- **GitHub Actions** : Pipelines CI/CD pour les tests, le build et le déploiement
- **Kubernetes** : Orchestration pour l'environnement de production

## Conclusion

Cette structure de projet offre une base solide pour le développement du TMS en mode SaaS, avec une séparation claire des responsabilités, une organisation modulaire, et une prise en compte des spécificités multi-tenant dès la conception.

L'architecture choisie permet une évolution progressive du système, avec la possibilité d'extraire certains composants en microservices indépendants si nécessaire, tout en maintenant une base cohérente et maintenable.
