# Architecture Générale du TMS (Transport Management System)

## Introduction

Ce document présente l'architecture générale du Transport Management System (TMS) développé en mode SaaS (Software as a Service). L'architecture proposée vise à répondre aux exigences fonctionnelles détaillées dans les spécifications, tout en assurant la scalabilité, la sécurité, la maintenabilité et la performance nécessaires pour une application d'entreprise critique.

La stack technologique principale, conformément aux exigences, s'appuie sur :
- **Frontend** : React.js avec Tailwind CSS
- **Backend** : Node.js
- **Base de données** : PostgreSQL

Cette architecture est conçue pour un déploiement en mode SaaS, permettant de servir plusieurs clients (multi-tenant) tout en garantissant l'isolation des données et la personnalisation des fonctionnalités.

## Vue d'Ensemble de l'Architecture

L'architecture du TMS suit un modèle en couches avec une séparation claire des responsabilités, combinée à une approche microservices pour certains composants spécifiques. Cette approche hybride permet de bénéficier de la simplicité et de la cohérence d'une architecture monolithique pour le cœur du système, tout en exploitant la flexibilité et l'évolutivité des microservices pour les fonctionnalités spécialisées ou à forte charge.

### Diagramme d'Architecture Générale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS / UTILISATEURS                         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                        COUCHE PRÉSENTATION / FRONTEND                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Application │  │   Portail   │  │ Application │  │ Autres Interfaces│ │
│  │    Web      │  │   Client    │  │   Mobile    │  │      API         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         COUCHE SÉCURITÉ / API GATEWAY                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Authentifi- │  │ Autorisation│  │Rate Limiting│  │   API Routing   │ │
│  │   cation    │  │             │  │             │  │                 │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         COUCHE SERVICES / BACKEND                        │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     CORE TMS SERVICES (MONOLITHIQUE)                │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │ │
│  │  │ Partenaires│  │ Commandes │  │  Coûts &  │  │ Administration &  │ │ │
│  │  │ & Entités  │  │& Expédit. │  │Facturation│  │  Configuration   │ │ │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐│
│  │    MICROSERVICES SPÉCIALISÉS│  │      SERVICES TRANSVERSAUX          ││
│  │  ┌───────────┐  ┌──────────┐│  │  ┌───────────┐  ┌───────────────┐  ││
│  │  │ Analyse & │  │Intégration││  │  │ Gestion  │  │ Notification  │  ││
│  │  │ Reporting │  │& Connect. ││  │  │des Tâches│  │               │  ││
│  │  └───────────┘  └──────────┘│  │  └───────────┘  └───────────────┘  ││
│  │  ┌───────────┐  ┌──────────┐│  │  ┌───────────┐  ┌───────────────┐  ││
│  │  │ Gestion   │  │Optimisation││ │  │ Gestion  │  │ Monitoring &  │  ││
│  │  │ de Flotte │  │de Tournées││  │  │des Médias│  │   Logging     │  ││
│  │  └───────────┘  └──────────┘│  │  └───────────┘  └───────────────┘  ││
│  └─────────────────────────────┘  └─────────────────────────────────────┘│
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         COUCHE PERSISTANCE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ PostgreSQL  │  │   Redis     │  │ Stockage    │  │  Elasticsearch  │ │
│  │ (Principal) │  │  (Cache)    │  │  Fichiers   │  │    (Logs/Search)│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         SERVICES EXTERNES                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Cartographie│  │  Paiement   │  │ Télématique │  │      Email      │ │
│  │    & Géo    │  │             │  │             │  │                 │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Description des Couches

### 1. Couche Présentation / Frontend

Cette couche englobe toutes les interfaces utilisateur du système, développées en React.js avec Tailwind CSS pour un design responsive et moderne.

#### Composants Principaux :

- **Application Web Administrative** : Interface principale pour les utilisateurs internes (exploitants, planificateurs, administrateurs), offrant l'accès à toutes les fonctionnalités du TMS selon les droits de l'utilisateur.

- **Portail Client** : Interface dédiée aux clients, leur permettant de passer des commandes, suivre leurs expéditions, consulter leurs factures et accéder à leurs rapports personnalisés.

- **Application Mobile** : Versions mobiles optimisées pour les conducteurs et les managers en déplacement, développées avec React Native pour garantir une expérience native sur iOS et Android.

- **Autres Interfaces API** : Points d'entrée pour l'intégration avec des systèmes externes ou des applications tierces.

#### Architecture Frontend :

L'architecture frontend suit les principes de conception modernes :

- **Architecture basée sur les composants** : Utilisation de composants React réutilisables et modulaires.
- **Gestion d'état centralisée** : Utilisation de Redux pour la gestion globale de l'état, complétée par Context API pour les états localisés.
- **Routage client** : Mise en œuvre avec React Router pour une navigation fluide sans rechargement de page.
- **Design System** : Bibliothèque de composants UI cohérents basés sur Tailwind CSS, assurant une expérience utilisateur uniforme.
- **Internationalisation** : Support multilingue via i18next pour servir une clientèle internationale.
- **Responsive Design** : Adaptation automatique à tous les formats d'écran, du mobile au grand écran.

### 2. Couche Sécurité / API Gateway

Cette couche sert de point d'entrée unifié pour toutes les requêtes adressées au backend, assurant la sécurité, le routage et la gestion du trafic.

#### Composants Principaux :

- **Authentification** : Gestion des identités et des sessions utilisateurs, support de multiples méthodes d'authentification (JWT, OAuth, SAML pour SSO).

- **Autorisation** : Vérification des permissions et application des politiques d'accès basées sur les rôles et attributs.

- **Rate Limiting** : Protection contre les abus et les attaques par déni de service en limitant le nombre de requêtes par client.

- **API Routing** : Acheminement des requêtes vers les services appropriés, avec support de versionnement d'API.

#### Implémentation :

- Utilisation d'Express.js comme framework principal pour l'API Gateway.
- Middleware d'authentification basé sur Passport.js pour la flexibilité des stratégies d'authentification.
- Système d'autorisation personnalisé basé sur RBAC (Role-Based Access Control) avec support d'attributs contextuels.
- Intégration de rate-limiter-flexible pour la protection contre les abus.

### 3. Couche Services / Backend

Cette couche contient la logique métier principale du TMS, organisée en services selon les domaines fonctionnels. Elle adopte une approche hybride combinant un cœur monolithique pour les fonctionnalités fortement interdépendantes et des microservices pour les fonctionnalités spécialisées ou à forte charge.

#### Core TMS Services (Monolithique) :

- **Service Partenaires & Entités** : Gestion des clients, transporteurs, sites et utilisateurs.
- **Service Commandes & Expéditions** : Traitement des commandes, planification des tournées, suivi des expéditions.
- **Service Coûts & Facturation** : Gestion des tarifs, calcul des coûts, facturation client et contrôle des factures transporteurs.
- **Service Administration & Configuration** : Gestion des paramètres, référentiels, modèles de documents et droits d'accès.

#### Microservices Spécialisés :

- **Service Analyse & Reporting** : Génération de tableaux de bord, rapports opérationnels et analyses avancées.
- **Service Intégration & Connectivité** : Gestion des API, EDI, intégrations avec systèmes externes et télématique.
- **Service Gestion de Flotte** : Suivi des véhicules, conducteurs, maintenance et équipements.
- **Service Optimisation de Tournées** : Algorithmes avancés d'optimisation des itinéraires et des chargements.

#### Services Transversaux :

- **Service Gestion des Tâches** : Orchestration des processus asynchrones et des workflows métier.
- **Service Notification** : Gestion centralisée des notifications (email, SMS, push, in-app).
- **Service Gestion des Médias** : Stockage et traitement des fichiers et images.
- **Service Monitoring & Logging** : Collecte et analyse des logs, métriques et traces d'exécution.

#### Implémentation :

- Utilisation de Node.js avec Express.js comme framework principal pour tous les services.
- Communication inter-services via API REST pour les interactions synchrones et message queue (RabbitMQ) pour les communications asynchrones.
- Adoption de principes DDD (Domain-Driven Design) pour la modélisation des services core.
- Utilisation de TypeScript pour améliorer la robustesse et la maintenabilité du code.

### 4. Couche Persistance

Cette couche gère le stockage et l'accès aux données, avec différentes technologies adaptées aux types de données et cas d'usage.

#### Composants Principaux :

- **PostgreSQL** : Base de données relationnelle principale stockant toutes les données métier structurées, avec extensions PostGIS pour les données géospatiales.

- **Redis** : Stockage en mémoire utilisé pour le caching, les sessions, et les données temporaires nécessitant un accès rapide.

- **Stockage Fichiers** : Système de stockage pour les documents, images et autres fichiers binaires, potentiellement basé sur un service cloud comme S3 ou un système de fichiers distribué.

- **Elasticsearch** : Moteur d'indexation et de recherche pour les logs, les données analytiques et la recherche full-text dans les documents métier.

#### Stratégies de Données :

- **Multi-tenancy** : Isolation des données clients via un modèle de schéma par client dans PostgreSQL.
- **Caching hiérarchique** : Mise en cache à plusieurs niveaux pour optimiser les performances.
- **Partitionnement** : Division des tables volumineuses pour améliorer les performances des requêtes.
- **Archivage** : Stratégie de déplacement des données historiques vers un stockage moins coûteux.

### 5. Services Externes

Cette couche représente les intégrations avec des services tiers essentiels au fonctionnement du TMS.

#### Composants Principaux :

- **Services Cartographiques & Géo** : Intégration avec des fournisseurs comme Google Maps, Mapbox ou OpenStreetMap pour la géolocalisation, le calcul d'itinéraires et la visualisation cartographique.

- **Services de Paiement** : Intégration avec des processeurs de paiement pour la facturation et les règlements.

- **Services Télématiques** : Connexion avec les plateformes télématiques des véhicules pour la collecte de données en temps réel.

- **Services Email** : Utilisation de services d'envoi d'emails comme SendGrid ou Mailgun pour les communications sortantes.

## Architecture Multi-Tenant pour le SaaS

Le TMS est conçu comme une solution SaaS multi-tenant, permettant de servir plusieurs clients à partir d'une infrastructure partagée tout en garantissant l'isolation et la personnalisation.

### Stratégie de Multi-Tenancy

Nous adoptons une approche hybride pour le multi-tenancy :

1. **Niveau Base de Données** : Utilisation d'un schéma PostgreSQL distinct par client, offrant une forte isolation des données tout en partageant l'infrastructure de base de données.

2. **Niveau Application** : Services partagés avec identification du tenant via un identifiant dans chaque requête, permettant de router les requêtes vers le schéma approprié et d'appliquer les personnalisations spécifiques au client.

### Personnalisation par Client

Le système permet plusieurs niveaux de personnalisation :

- **Configuration** : Paramètres spécifiques stockés dans la base de données de chaque client.
- **Workflows** : Processus métier adaptables via un moteur de règles configurable.
- **Interface** : Personnalisation visuelle (logo, couleurs) et fonctionnelle (champs, écrans) via un système de thèmes et de configuration d'interface.
- **Intégrations** : Connecteurs spécifiques pour les systèmes propres à chaque client.

## Scalabilité et Haute Disponibilité

L'architecture est conçue pour supporter une croissance significative en termes de volume de données et de nombre d'utilisateurs.

### Stratégies de Scalabilité

- **Scalabilité Horizontale** : Capacité à ajouter des instances supplémentaires des services pour répartir la charge.
- **Scalabilité Verticale** : Possibilité d'augmenter les ressources (CPU, mémoire) des instances existantes pour les services à état.
- **Autoscaling** : Ajustement automatique des ressources en fonction de la charge pour optimiser les coûts.

### Haute Disponibilité

- **Redondance** : Déploiement de multiples instances de chaque service dans différentes zones de disponibilité.
- **Failover Automatique** : Basculement automatique en cas de défaillance d'une instance ou d'une zone.
- **Résilience** : Conception des services pour tolérer les défaillances partielles du système.

## Sécurité

La sécurité est intégrée à tous les niveaux de l'architecture, suivant le principe de défense en profondeur.

### Mesures de Sécurité Principales

- **Authentification Forte** : Support de l'authentification multi-facteurs et intégration SSO.
- **Autorisation Granulaire** : Contrôle d'accès précis basé sur les rôles, les attributs et le contexte.
- **Chiffrement** : Protection des données sensibles en transit (TLS) et au repos (chiffrement sélectif).
- **Audit** : Journalisation complète des actions sensibles pour traçabilité et conformité.
- **Protection contre les Attaques** : Mesures contre les vulnérabilités web courantes (OWASP Top 10).
- **Isolation des Tenants** : Séparation stricte des données entre clients.

## Monitoring et Observabilité

L'architecture intègre des capacités avancées de monitoring et d'observabilité pour assurer la fiabilité et la performance du système.

### Composants de Monitoring

- **Collecte de Métriques** : Mesure des indicateurs de performance clés de tous les composants.
- **Logging Centralisé** : Agrégation et analyse des logs de tous les services.
- **Traçage Distribué** : Suivi des requêtes à travers les différents services pour identifier les goulots d'étranglement.
- **Alerting** : Notification proactive en cas d'anomalies ou de dégradation des performances.
- **Dashboards** : Visualisation en temps réel de l'état du système.

## Déploiement et DevOps

L'architecture supporte un modèle de déploiement moderne basé sur les conteneurs et l'infrastructure as code.

### Stratégie de Déploiement

- **Containerisation** : Encapsulation des services dans des conteneurs Docker pour la portabilité et la cohérence entre environnements.
- **Orchestration** : Utilisation de Kubernetes pour la gestion des déploiements, la scalabilité et la résilience.
- **CI/CD** : Pipeline d'intégration et déploiement continus pour automatiser les tests et les déploiements.
- **Infrastructure as Code** : Définition de l'infrastructure via des outils comme Terraform pour garantir la reproductibilité et la traçabilité.
- **Environnements Multiples** : Support de plusieurs environnements (développement, test, staging, production) avec promotion contrôlée des changements.

## Conclusion

L'architecture proposée pour le TMS offre un équilibre entre robustesse, flexibilité et évolutivité. Elle permet de répondre aux exigences fonctionnelles détaillées dans les spécifications tout en assurant les qualités non-fonctionnelles essentielles pour une application d'entreprise critique déployée en mode SaaS.

Cette architecture hybride, combinant un cœur monolithique pour les fonctionnalités fortement interdépendantes et des microservices pour les fonctionnalités spécialisées, offre un bon compromis entre simplicité de développement et capacité d'évolution. Elle permet également une adoption progressive des pratiques modernes de développement et d'exploitation, facilitant ainsi la transition vers une architecture encore plus modulaire si les besoins futurs l'exigent.
