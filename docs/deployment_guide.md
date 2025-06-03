# Guide de Déploiement SaaS du TMS

Ce guide détaille les étapes nécessaires pour déployer votre Transport Management System (TMS) en mode SaaS (Software as a Service).

## Table des matières

1. [Prérequis](#prérequis)
2. [Architecture de déploiement](#architecture-de-déploiement)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Déploiement du backend](#déploiement-du-backend)
5. [Déploiement du frontend](#déploiement-du-frontend)
6. [Configuration de la base de données](#configuration-de-la-base-de-données)
7. [Déploiement des services IA](#déploiement-des-services-ia)
8. [Configuration du multi-tenant](#configuration-du-multi-tenant)
9. [Sécurité et conformité](#sécurité-et-conformité)
10. [Surveillance et maintenance](#surveillance-et-maintenance)
11. [Mise à l'échelle](#mise-à-léchelle)

## Prérequis

### Infrastructure cloud

- Compte AWS, Azure, ou Google Cloud Platform
- Connaissance de base des services cloud (VM, conteneurs, bases de données gérées)
- Nom de domaine pour votre service SaaS

### Outils et logiciels

- Docker et Docker Compose
- Kubernetes (optionnel, pour les déploiements à grande échelle)
- Client Git
- Node.js (v16+) et npm
- PostgreSQL (v12+)

## Architecture de déploiement

Le TMS est conçu pour être déployé selon une architecture moderne en couches :

```
[Clients] → [CDN/Load Balancer] → [Frontend React] → [API Gateway] → [Backend Services] → [Database]
                                                                     ↓
                                                           [Services IA]
```

### Options de déploiement

1. **Déploiement simple** (recommandé pour démarrer)
   - Serveur unique ou quelques serveurs
   - Docker Compose pour orchestrer les conteneurs
   - Base de données PostgreSQL sur un serveur dédié

2. **Déploiement à grande échelle**
   - Kubernetes pour l'orchestration des conteneurs
   - Services managés pour la base de données (AWS RDS, Azure Database, etc.)
   - Répartition de charge et haute disponibilité

## Configuration de l'environnement

### Variables d'environnement

Créez un fichier `.env` pour chaque composant avec les variables appropriées :

#### Backend (.env)

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://username:password@db-host:5432/tms_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
CORS_ORIGIN=https://votre-domaine.com
AI_SERVICES_URL=http://ai-services:5000
```

#### Frontend (.env)

```
REACT_APP_API_URL=https://api.votre-domaine.com
REACT_APP_VERSION=1.0.0
```

#### Services IA (.env)

```
MODEL_PATH=/app/models
POSTGRES_CONNECTION=postgres://username:password@db-host:5432/tms_db
API_KEY=your_ai_service_api_key
```

## Déploiement du backend

### Préparation

1. Créez un Dockerfile dans le répertoire backend :

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

2. Créez un fichier `.dockerignore` :

```
node_modules
npm-debug.log
.env
.git
.gitignore
```

### Construction et déploiement

```bash
# Construire l'image Docker
docker build -t tms-backend:latest .

# Exécuter le conteneur
docker run -d --name tms-backend -p 3000:3000 --env-file .env tms-backend:latest
```

## Déploiement du frontend

### Préparation

1. Créez un Dockerfile dans le répertoire frontend :

```dockerfile
# Étape de build
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape de production
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

2. Créez un fichier `nginx.conf` :

```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Construction et déploiement

```bash
# Construire l'image Docker
docker build -t tms-frontend:latest .

# Exécuter le conteneur
docker run -d --name tms-frontend -p 80:80 tms-frontend:latest
```

## Configuration de la base de données

### Option 1 : PostgreSQL dans un conteneur

```bash
docker run -d --name tms-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_USER=tms_user \
  -e POSTGRES_DB=tms_db \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:12
```

### Option 2 : Service de base de données géré

Pour AWS RDS :

1. Créez une instance PostgreSQL dans RDS
2. Configurez les groupes de sécurité pour permettre l'accès depuis vos services
3. Mettez à jour les variables d'environnement avec la nouvelle URL de connexion

## Déploiement des services IA

### Préparation

1. Créez un Dockerfile dans le répertoire ia_services :

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

2. Créez un fichier `requirements.txt` :

```
flask==2.0.1
numpy==1.21.0
pandas==1.3.0
scikit-learn==0.24.2
tensorflow==2.5.0
transformers==4.8.2
psycopg2-binary==2.9.1
```

### Construction et déploiement

```bash
# Construire l'image Docker
docker build -t tms-ai-services:latest .

# Exécuter le conteneur
docker run -d --name tms-ai-services -p 5000:5000 --env-file .env tms-ai-services:latest
```

## Configuration du multi-tenant

Le TMS utilise une stratégie d'isolation par schéma PostgreSQL pour gérer les multiples clients (tenants) :

1. Assurez-vous que la fonction `create_tenant_schema` est disponible dans la base de données
2. Pour chaque nouveau client, exécutez :

```sql
SELECT create_tenant_schema(tenant_id);
```

3. Configurez le middleware de sélection de schéma dans le backend :

```javascript
// src/middleware/tenantMiddleware.js
const tenantMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || 
                  req.query.tenantId || 
                  extractTenantFromSubdomain(req);
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  req.tenantId = tenantId;
  req.tenantSchema = `tenant_${tenantId}`;
  next();
};

module.exports = tenantMiddleware;
```

## Orchestration avec Docker Compose

Créez un fichier `docker-compose.yml` à la racine du projet :

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:12
    environment:
      POSTGRES_USER: tms_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: tms_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - tms-network

  backend:
    build: ./code/backend
    depends_on:
      - postgres
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://tms_user:your_password@postgres:5432/tms_db
      JWT_SECRET: your_jwt_secret_key
      JWT_EXPIRATION: 24h
      CORS_ORIGIN: http://localhost:80
      AI_SERVICES_URL: http://ai-services:5000
    ports:
      - "3000:3000"
    networks:
      - tms-network

  frontend:
    build: ./code/frontend/tms-frontend
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - tms-network

  ai-services:
    build: ./code/ia_services
    depends_on:
      - postgres
    environment:
      MODEL_PATH: /app/models
      POSTGRES_CONNECTION: postgres://tms_user:your_password@postgres:5432/tms_db
      API_KEY: your_ai_service_api_key
    ports:
      - "5000:5000"
    networks:
      - tms-network

networks:
  tms-network:

volumes:
  postgres_data:
```

Pour déployer l'ensemble du système :

```bash
docker-compose up -d
```

## Sécurité et conformité

### Sécurisation des communications

1. Configurez HTTPS avec Let's Encrypt :

```bash
# Installation de Certbot
apt-get update
apt-get install certbot python3-certbot-nginx

# Obtention du certificat
certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

2. Mettez à jour la configuration Nginx pour utiliser SSL

### Protection des données

1. Assurez-vous que les sauvegardes de la base de données sont chiffrées
2. Implémentez le chiffrement des données sensibles dans la base de données
3. Configurez des politiques de rétention des données conformes au RGPD

## Surveillance et maintenance

### Mise en place de la surveillance

1. Intégrez des outils de surveillance comme Prometheus et Grafana
2. Configurez des alertes pour les métriques critiques
3. Mettez en place des logs centralisés avec ELK Stack ou similaire

### Mises à jour et maintenance

1. Planifiez des fenêtres de maintenance régulières
2. Implémentez un processus de déploiement continu (CI/CD)
3. Testez les mises à jour dans un environnement de staging avant production

## Mise à l'échelle

### Mise à l'échelle horizontale

Pour gérer une charge croissante :

1. Ajoutez des instances supplémentaires de backend et frontend derrière un équilibreur de charge
2. Utilisez un service de cache comme Redis pour améliorer les performances
3. Configurez des répliques en lecture pour la base de données

### Migration vers Kubernetes

Pour les déploiements à grande échelle, envisagez de migrer vers Kubernetes :

1. Créez des fichiers de déploiement Kubernetes pour chaque composant
2. Utilisez Helm pour gérer les déploiements
3. Configurez l'autoscaling basé sur la charge

## Conclusion

Ce guide vous a fourni les étapes essentielles pour déployer votre TMS en mode SaaS. Adaptez ces instructions en fonction de votre environnement spécifique et de vos besoins d'échelle.

Pour toute assistance supplémentaire ou pour des scénarios de déploiement personnalisés, n'hésitez pas à consulter la documentation détaillée ou à contacter l'équipe de support.
