# Frontend React.js - README

## TMS (Transport Management System) - Frontend

Ce répertoire contient l'application frontend du TMS (Transport Management System), développée avec React.js et Tailwind CSS.

## Structure du Projet

L'application est organisée selon une architecture modulaire, favorisant la réutilisation des composants et la maintenabilité du code :

```
frontend/
├── public/                    # Ressources statiques publiques
├── src/
│   ├── assets/                # Ressources utilisées dans le code
│   ├── components/            # Composants React réutilisables
│   ├── contexts/              # Contextes React pour la gestion d'état
│   ├── hooks/                 # Hooks React personnalisés
│   ├── pages/                 # Pages de l'application
│   ├── services/              # Services pour les appels API
│   ├── store/                 # Configuration Redux pour la gestion d'état
│   ├── utils/                 # Utilitaires et helpers
│   ├── App.js                 # Composant racine de l'application
│   ├── index.js               # Point d'entrée de l'application
│   └── routes.js              # Configuration des routes
└── ...
```

## Prérequis

- Node.js (v16+)
- npm ou yarn

## Installation

1. Cloner le dépôt
2. Naviguer vers le dossier frontend
3. Installer les dépendances :

```bash
npm install
# ou
yarn install
```

## Configuration

Créer un fichier `.env` à la racine du projet avec les variables d'environnement nécessaires :

```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_VERSION=0.1.0
```

## Développement

Pour lancer le serveur de développement :

```bash
npm start
# ou
yarn start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Build

Pour créer une version de production :

```bash
npm run build
# ou
yarn build
```

Les fichiers de build seront générés dans le dossier `build/`.

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

## Fonctionnalités Principales

- Interface utilisateur moderne et responsive avec Tailwind CSS
- Gestion d'état centralisée avec Redux
- Routage client avec React Router
- Formulaires avec validation via Formik et Yup
- Tableaux de données interactifs avec React-Table
- Visualisations et graphiques avec Recharts
- Support multilingue avec i18next
- Thèmes personnalisables par tenant

## Architecture Multi-Tenant

L'application frontend prend en charge le mode SaaS multi-tenant via :

- Personnalisation par tenant (logo, couleurs, etc.) via des thèmes dynamiques
- Routage basé sur le domaine ou sous-domaine pour identifier le tenant
- Stockage des préférences utilisateur spécifiques au tenant

## Bonnes Pratiques

- Utilisation de composants fonctionnels et hooks React
- Code splitting pour optimiser les performances
- Tests unitaires pour les composants et services critiques
- Gestion des erreurs centralisée
- Accessibilité (WCAG)
- Documentation des composants avec JSDoc
