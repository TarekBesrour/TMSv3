# Guide de Déploiement Docker pour le TMS

Ce guide détaille les étapes pour déployer votre Transport Management System (TMS) en utilisant Docker et Docker Compose.

## Table des matières

1. [Prérequis](#prérequis)
2. [Structure des fichiers Docker](#structure-des-fichiers-docker)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Déploiement avec Docker Compose](#déploiement-avec-docker-compose)
5. [Accès à l'application](#accès-à-lapplication)
6. [Maintenance et mises à jour](#maintenance-et-mises-à-jour)

## Prérequis

- Docker et Docker Compose installés sur votre serveur
- Accès à votre base de données Neon PostgreSQL
- Nom de domaine configuré (optionnel pour la production)

## Structure des fichiers Docker

Voici la structure des fichiers Docker pour votre TMS :

```
/home/ubuntu/tms_project/
├── docker-compose.yml
├── .env
├── code/
│   ├── frontend/
│   │   └── Dockerfile
│   ├── backend/
│   │   └── Dockerfile
│   └── ia_services/
│       └── Dockerfile
└── nginx/
    └── nginx.conf
```

## Configuration de l'environnement

### Fichier .env principal

Créez un fichier `.env` à la racine du projet :

```
# Configuration générale
NODE_ENV=production
TZ=Europe/Paris

# Configuration Neon PostgreSQL
DATABASE_URL=postgres://username:password@db.neon.tech/tms_db?sslmode=require

# Configuration JWT
JWT_SECRET=votre_secret_jwt_très_sécurisé
JWT_EXPIRATION=24h

# Configuration des ports
BACKEND_PORT=3000
FRONTEND_PORT=80
IA_SERVICES_PORT=5000

# Configuration des services IA
AI_SERVICES_URL=http://ia-services:5000
AI_API_KEY=votre_clé_api_ia_sécurisée
```

## Déploiement avec Docker Compose

### Fichier docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./code/backend
    restart: always
    environment:
      - NODE_ENV=${NODE_ENV}
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=${JWT_EXPIRATION}
      - AI_SERVICES_URL=${AI_SERVICES_URL}
      - TZ=${TZ}
    ports:
      - "${BACKEND_PORT}:3000"
    networks:
      - tms-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./code/frontend/tms-frontend
    restart: always
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - backend
    networks:
      - tms-network
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf

  ia-services:
    build:
      context: ./code/ia_services
    restart: always
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - API_KEY=${AI_API_KEY}
      - TZ=${TZ}
    ports:
      - "${IA_SERVICES_PORT}:5000"
    networks:
      - tms-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  tms-network:
    driver: bridge
```

### Dockerfile pour le backend

Créez un fichier `Dockerfile` dans le répertoire `code/backend` :

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

### Dockerfile pour le frontend

Créez un fichier `Dockerfile` dans le répertoire `code/frontend/tms-frontend` :

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

### Dockerfile pour les services IA

Créez un fichier `Dockerfile` dans le répertoire `code/ia_services` :

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

### Configuration Nginx

Créez un répertoire `nginx` à la racine du projet et un fichier `nginx.conf` :

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

## Déploiement

Pour déployer l'application :

```bash
# Se placer à la racine du projet
cd /home/ubuntu/tms_project

# Construire et démarrer les conteneurs
docker-compose up -d

# Vérifier que les conteneurs sont en cours d'exécution
docker-compose ps
```

## Accès à l'application

Une fois déployée, votre application sera accessible aux adresses suivantes :

- **Frontend** : http://votre-serveur:80
- **Backend API** : http://votre-serveur:3000/api
- **Services IA** : http://votre-serveur:5000

## Maintenance et mises à jour

### Mise à jour de l'application

Pour mettre à jour l'application avec de nouvelles versions :

```bash
# Arrêter les conteneurs
docker-compose down

# Tirer les dernières modifications du code
git pull

# Reconstruire et redémarrer les conteneurs
docker-compose up -d --build
```

### Visualisation des logs

Pour voir les logs des conteneurs :

```bash
# Logs de tous les services
docker-compose logs

# Logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ia-services

# Suivre les logs en temps réel
docker-compose logs -f
```

### Sauvegarde des données

Les données sont stockées dans votre base de données Neon PostgreSQL, qui dispose de ses propres mécanismes de sauvegarde. Assurez-vous de configurer des sauvegardes régulières via l'interface Neon.

## Conclusion

Votre TMS est maintenant déployé en utilisant Docker et Docker Compose, avec une connexion à votre base de données Neon PostgreSQL. Cette configuration vous permet de gérer facilement votre application et de la mettre à l'échelle selon vos besoins.

Pour toute assistance supplémentaire ou pour des configurations avancées, n'hésitez pas à consulter la documentation détaillée ou à contacter l'équipe de support.
