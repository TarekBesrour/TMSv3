# Backend Node.js - README

## TMS (Transport Management System) - Backend

Ce répertoire contient l'application backend du TMS (Transport Management System), développée avec Node.js et Express.js.

## Structure du Projet

L'application est organisée selon une architecture modulaire, avec une séparation claire des responsabilités :

```
backend/
├── src/
│   ├── api/                   # Routes et contrôleurs API
│   │   ├── middlewares/       # Middlewares Express
│   │   ├── routes/            # Définition des routes API
│   │   └── controllers/       # Contrôleurs pour chaque entité
│   ├── config/                # Configuration de l'application
│   ├── db/                    # Couche d'accès aux données
│   │   ├── models/            # Modèles de données
│   │   ├── repositories/      # Repositories pour l'accès aux données
│   │   └── migrations/        # Scripts de migration de base de données
│   ├── services/              # Logique métier
│   ├── utils/                 # Utilitaires et helpers
│   ├── jobs/                  # Tâches planifiées et workers
│   ├── integrations/          # Intégrations avec services externes
│   ├── app.js                 # Configuration de l'application Express
│   └── server.js              # Point d'entrée du serveur
└── ...
```

## Prérequis

- Node.js (v16+)
- npm ou yarn
- PostgreSQL (v13+)

## Installation

1. Cloner le dépôt
2. Naviguer vers le dossier backend
3. Installer les dépendances :

```bash
npm install
# ou
yarn install
```

## Configuration

Créer un fichier `.env` à la racine du projet avec les variables d'environnement nécessaires :

```
# Serveur
PORT=3001
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tms_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Logging
LOG_LEVEL=debug

# Autres services
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=user@example.com
EMAIL_PASSWORD=your_email_password
```

## Développement

Pour lancer le serveur de développement avec hot-reload :

```bash
npm run dev
# ou
yarn dev
```

Le serveur sera accessible à l'adresse [http://localhost:3001](http://localhost:3001).

## Production

Pour lancer le serveur en mode production :

```bash
npm start
# ou
yarn start
```

## Base de données

### Migrations

Pour créer et appliquer les migrations de base de données :

```bash
npm run migrate
# ou
yarn migrate
```

### Seeding

Pour peupler la base de données avec des données initiales :

```bash
npm run seed
# ou
yarn seed
```

### Création d'un nouveau tenant

Pour créer un nouveau tenant (client) dans le système :

```bash
npm run create-tenant -- --name="Company Name" --code=company
# ou
yarn create-tenant --name="Company Name" --code=company
```

## Tests

Pour exécuter les tests :

```bash
npm test
# ou
yarn test
```

## Linting

Pour vérifier le code avec ESLint :

```bash
npm run lint
# ou
yarn lint
```

## API Documentation

La documentation de l'API est disponible à l'adresse [http://localhost:3001/api-docs](http://localhost:3001/api-docs) lorsque le serveur est en cours d'exécution.

## Architecture Multi-Tenant

Le backend prend en charge le mode SaaS multi-tenant via :

- Middleware de résolution de tenant basé sur le domaine, les en-têtes ou les tokens
- Contexte de tenant injecté dans chaque requête
- Isolation des données via le schéma PostgreSQL (un schéma par client)

## Fonctionnalités Principales

- API RESTful complète pour toutes les entités du TMS
- Authentification et autorisation basées sur JWT
- Gestion multi-tenant avec isolation des données
- Validation des données entrantes
- Logging structuré
- Gestion des erreurs centralisée
- Tâches planifiées et asynchrones
- Intégrations avec services externes (email, paiement, cartographie, etc.)

## Bonnes Pratiques

- Architecture en couches (controllers, services, repositories)
- Injection de dépendances
- Tests unitaires et d'intégration
- Documentation de l'API avec Swagger/OpenAPI
- Gestion des erreurs robuste
- Logging complet pour le debugging et l'audit
