# Documentation d'Installation et de Configuration

## Module de Gestion des Référentiels - TMS

### Prérequis

#### Backend
- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

#### Frontend  
- React 18+
- TypeScript 4.5+
- Tailwind CSS

### Installation Backend

1. **Installation des dépendances**
```bash
cd backend
npm install express objection knex pg cors helmet morgan
npm install --save-dev jest supertest nodemon
```

2. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb tms_database

# Exécuter les migrations
npx knex migrate:latest
```

3. **Variables d'environnement**
Créer un fichier `.env` :
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tms_database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
```

4. **Démarrage du serveur**
```bash
npm run dev
```

### Installation Frontend

1. **Installation des dépendances**
```bash
cd frontend
npm install react react-dom react-router-dom
npm install @heroicons/react
npm install --save-dev @types/react @types/react-dom typescript
```

2. **Configuration**
Créer un fichier `.env` :
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
```

3. **Démarrage de l'application**
```bash
npm start
```

### Structure des Fichiers

#### Backend
```
backend/
├── controllers/
│   └── ReferenceDataController.js
├── services/
│   └── ReferenceDataService.js
├── routes/
│   └── referenceDataRoutes.js
├── models/
│   └── ReferenceData.js (existant)
└── tests/
    ├── ReferenceDataService.test.js
    └── referenceDataApi.integration.test.js
```

#### Frontend
```
frontend/
├── pages/
│   ├── References.tsx
│   └── ReferenceEntries.tsx
├── components/
│   ├── ReferenceTypeList.tsx
│   ├── ReferenceEntryTable.tsx
│   └── ReferenceEntryForm.tsx
├── types/
│   └── referenceData.ts
├── services/
│   └── referenceDataApi.ts
└── hooks/
    └── useReferenceData.ts
```

### Configuration des Routes

#### Backend (app.js)
```javascript
const referenceDataRoutes = require('./routes/referenceDataRoutes');
app.use('/api/v1/references', referenceDataRoutes);
```

#### Frontend (App.tsx)
```typescript
import References from './pages/References';
import ReferenceEntries from './pages/ReferenceEntries';

// Dans le Router
<Route path="/admin/references" element={<References />} />
<Route path="/admin/references/:typeId" element={<ReferenceEntries />} />
<Route path="/admin/references/:typeId/new" element={<ReferenceEntryForm mode="create" />} />
<Route path="/admin/references/:typeId/:id/edit" element={<ReferenceEntryForm mode="edit" />} />
```

### Tests

#### Exécution des tests backend
```bash
cd backend
npm test
```

#### Tests disponibles
- Tests unitaires du service ReferenceDataService
- Tests d'intégration des API REST
- Tests de validation des données
- Tests d'import/export

### Fonctionnalités Implémentées

#### Backend
- ✅ API RESTful complète (CRUD)
- ✅ Pagination, recherche, tri
- ✅ Import/Export CSV et JSON
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ Authentification et autorisation
- ✅ Support multi-tenant

#### Frontend
- ✅ Interface utilisateur responsive
- ✅ Gestion des types de référentiels
- ✅ Tableau avec recherche et filtres
- ✅ Formulaires de création/modification
- ✅ Import/Export de données
- ✅ Gestion des états de chargement
- ✅ Typage TypeScript strict

### API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/references/types` | Liste des types de référentiels |
| GET | `/api/v1/references/:typeId/entries` | Entrées d'un type (avec pagination) |
| GET | `/api/v1/references/:typeId/entries/:id` | Détail d'une entrée |
| POST | `/api/v1/references/:typeId/entries` | Créer une entrée |
| PUT | `/api/v1/references/:typeId/entries/:id` | Modifier une entrée |
| PATCH | `/api/v1/references/:typeId/entries/:id/activate` | Activer une entrée |
| PATCH | `/api/v1/references/:typeId/entries/:id/deactivate` | Désactiver une entrée |
| POST | `/api/v1/references/:typeId/import` | Importer des données |
| GET | `/api/v1/references/:typeId/export` | Exporter des données |

### Types de Référentiels Supportés

- `transport_modes` - Modes de Transport
- `vehicle_types` - Types de Véhicules  
- `cargo_types` - Types de Marchandises
- `incoterms` - Incoterms
- `currencies` - Devises
- `countries` - Pays
- `units_of_measure` - Unités de Mesure
- `document_types` - Types de Documents
- `payment_terms` - Conditions de Paiement
- `shipment_status` - Statuts d'Expédition
- `order_status` - Statuts de Commande
- `invoice_status` - Statuts de Facture
- `partner_types` - Types de Partenaires
- `contact_types` - Types de Contacts
- `address_types` - Types d'Adresses

### Sécurité

- Authentification JWT requise
- Validation des données côté serveur
- Protection CORS configurée
- Gestion des erreurs sécurisée
- Isolation multi-tenant

### Performance

- Pagination des résultats
- Index sur les champs de recherche
- Cache des types de référentiels
- Optimisation des requêtes SQL

### Maintenance

- Logs structurés
- Tests automatisés
- Documentation API
- Monitoring des erreurs

