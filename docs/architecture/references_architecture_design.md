


### Mécanismes de Cache et Optimisation des Performances

- **Cache côté serveur (Backend Node.js):**
  - Utilisation d'un cache in-memory (ex: `node-cache` ou `lru-cache`) pour les référentiels fréquemment consultés et de petite taille (ex: `country_codes`, `unit_of_measures`, `incoterms`).
  - Stratégie de cache: Cache-aside avec invalidation explicite lors des opérations de modification (POST, PUT, PATCH) sur les référentiels concernés.
  - TTL (Time-To-Live) configurable pour chaque type de référentiel, avec possibilité de rafraîchissement manuel.
  - Pour les référentiels plus volumineux ou à forte volatilité, envisager l'utilisation d'un cache distribué (ex: Redis) si les performances deviennent un goulot d'étranglement à l'échelle.

- **Optimisation des requêtes de base de données:**
  - Utilisation d'index appropriés sur les colonnes fréquemment utilisées dans les clauses WHERE, ORDER BY et JOIN (ex: `code`, `type`, `isActive`, `validFrom`, `validTo`).
  - Optimisation des requêtes SQL générées par l'ORM (Objection.js) pour minimiser les jointures inutiles et les requêtes N+1.
  - Pagination côté serveur pour toutes les listes de référentiels afin de limiter la quantité de données transférées.
  - Utilisation de `SELECT` spécifiques pour ne récupérer que les colonnes nécessaires, évitant `SELECT *`.

- **Compression des réponses HTTP:**
  - Activation de la compression Gzip/Brotli pour les réponses de l'API RESTful afin de réduire la taille des données transférées sur le réseau.

- **Validation et Nettoyage des données:**
  - Implémentation de validations strictes côté backend pour garantir l'intégrité des données avant insertion/mise à jour, réduisant ainsi les erreurs et les données incohérentes.
  - Outils d'analyse et de nettoyage des données pour identifier et corriger les doublons ou incohérences, comme mentionné dans les spécifications.


