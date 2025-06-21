# Documentation API - Module de Gestion des Référentiels

## Vue d'ensemble

Le module de Gestion des Référentiels fournit une API RESTful complète pour gérer les données de référence dans le système TMS. Il permet la création, lecture, mise à jour et suppression (CRUD) des entrées de référentiels, ainsi que des fonctionnalités avancées d'import/export et de synchronisation.

## Authentification

Toutes les API nécessitent une authentification JWT. Incluez le token dans l'en-tête Authorization :

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints API

### 1. Types de Référentiels

#### GET /api/v1/references/types
Récupère la liste de tous les types de référentiels disponibles.

**Réponse :**
```json
[
  {
    "id": "transport_modes",
    "name": "transport_modes", 
    "description": "Transport modes (road, rail, air, sea)"
  },
  {
    "id": "vehicle_types",
    "name": "vehicle_types",
    "description": "Types of vehicles"
  }
]
```

### 2. Entrées de Référentiels

#### GET /api/v1/references/:typeId/entries
Récupère les entrées d'un type de référentiel avec pagination, recherche et tri.

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `search` (optionnel) : Terme de recherche
- `sortBy` (optionnel) : Champ de tri (défaut: 'code')
- `sortOrder` (optionnel) : Ordre de tri 'asc' ou 'desc' (défaut: 'asc')

**Exemple :**
```
GET /api/v1/references/transport_modes/entries?page=1&limit=10&search=road&sortBy=label&sortOrder=asc
```

**Réponse :**
```json
{
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "category": "transport_modes",
      "code": "ROAD",
      "label": "Transport routier",
      "description": "Transport par route",
      "value": null,
      "metadata": null,
      "parent_id": null,
      "sort_order": 1,
      "level": 0,
      "is_active": true,
      "is_system": false,
      "is_editable": true,
      "language_code": "fr",
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/v1/references/:typeId/entries/:id
Récupère une entrée spécifique par son ID.

**Réponse :**
```json
{
  "id": 1,
  "tenant_id": 1,
  "category": "transport_modes",
  "code": "ROAD",
  "label": "Transport routier",
  "description": "Transport par route",
  "value": null,
  "metadata": null,
  "parent_id": null,
  "sort_order": 1,
  "level": 0,
  "is_active": true,
  "is_system": false,
  "is_editable": true,
  "language_code": "fr",
  "created_by": 1,
  "updated_by": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "parent": null,
  "children": []
}
```

#### POST /api/v1/references/:typeId/entries
Crée une nouvelle entrée de référentiel.

**Corps de la requête :**
```json
{
  "code": "AIR",
  "label": "Transport aérien",
  "description": "Transport par avion",
  "value": null,
  "metadata": {},
  "parent_id": null,
  "sort_order": 3,
  "is_active": true,
  "language_code": "fr"
}
```

**Réponse :** 201 Created avec l'entrée créée

#### PUT /api/v1/references/:typeId/entries/:id
Met à jour une entrée existante.

**Corps de la requête :**
```json
{
  "label": "Transport aérien mis à jour",
  "description": "Transport par avion - description mise à jour"
}
```

**Réponse :** 200 OK avec l'entrée mise à jour

#### PATCH /api/v1/references/:typeId/entries/:id/activate
Active une entrée désactivée.

**Réponse :** 200 OK avec l'entrée activée

#### PATCH /api/v1/references/:typeId/entries/:id/deactivate
Désactive une entrée active.

**Réponse :** 200 OK avec l'entrée désactivée

### 3. Import/Export

#### POST /api/v1/references/:typeId/import
Importe des données depuis un fichier CSV ou JSON.

**Paramètres :**
- `file` : Fichier à importer (multipart/form-data)

**Formats supportés :**
- CSV avec colonnes : code, label, description, value, is_active
- JSON avec tableau d'objets

**Réponse :**
```json
{
  "status": "success",
  "message": "Import completed successfully",
  "importedCount": 15,
  "errors": []
}
```

#### GET /api/v1/references/:typeId/export
Exporte les données d'un type de référentiel.

**Paramètres de requête :**
- `format` (optionnel) : Format d'export 'csv' ou 'json' (défaut: 'csv')

**Réponse :** Fichier téléchargeable

### 4. Synchronisation

#### POST /api/v1/references/:typeId/sync/configure
Configure la synchronisation externe pour un type de référentiel.

**Corps de la requête :**
```json
{
  "source": "external_api_url",
  "frequency": "daily",
  "mappingRules": [
    {
      "sourceField": "external_code",
      "targetField": "code",
      "transformation": "uppercase"
    }
  ],
  "validationRules": [
    {
      "field": "code",
      "rule": "required"
    }
  ]
}
```

#### POST /api/v1/references/:typeId/sync/trigger
Déclenche une synchronisation manuelle.

**Réponse :**
```json
{
  "status": "success",
  "message": "Synchronization triggered successfully"
}
```

#### GET /api/v1/references/:typeId/sync/history
Récupère l'historique des synchronisations.

**Réponse :**
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "success",
    "message": "Synchronization completed",
    "newEntries": 5,
    "updatedEntries": 3,
    "errors": 0
  }
]
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Erreur de validation |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur interne |

## Exemples d'utilisation

### JavaScript/Fetch
```javascript
// Récupérer les types de référentiels
const response = await fetch('/api/v1/references/types', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const types = await response.json();

// Créer une nouvelle entrée
const newEntry = {
  code: 'SEA',
  label: 'Transport maritime',
  description: 'Transport par mer',
  is_active: true,
  language_code: 'fr'
};

const createResponse = await fetch('/api/v1/references/transport_modes/entries', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newEntry)
});
```

### cURL
```bash
# Récupérer les entrées avec pagination
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3001/api/v1/references/transport_modes/entries?page=1&limit=5"

# Créer une nouvelle entrée
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"code":"PIPE","label":"Transport par pipeline","is_active":true,"language_code":"fr"}' \
     "http://localhost:3001/api/v1/references/transport_modes/entries"
```

## Validation des données

### Règles de validation
- `code` : Requis, unique par tenant et catégorie, max 50 caractères
- `label` : Requis, max 255 caractères
- `description` : Optionnel, max 1000 caractères
- `value` : Optionnel, max 255 caractères
- `language_code` : Requis, code ISO 639-1 (ex: 'fr', 'en')
- `sort_order` : Entier positif
- `is_active` : Booléen

### Messages d'erreur
```json
{
  "error": "Validation error",
  "message": "Code is required, Label cannot exceed 255 characters"
}
```

## Sécurité

- Authentification JWT obligatoire
- Isolation multi-tenant automatique
- Validation des données côté serveur
- Protection contre l'injection SQL via ORM
- Limitation des tailles de fichiers d'import (10MB max)

## Performance

- Pagination automatique des résultats
- Index sur les champs de recherche fréquents
- Cache des métadonnées des types
- Optimisation des requêtes avec Objection.js

