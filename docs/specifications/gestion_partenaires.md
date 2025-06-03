# Spécification Détaillée : Gestion des Partenaires et Entités

## Introduction

Le module de Gestion des Partenaires et Entités constitue la pierre angulaire d'un Transport Management System (TMS) efficace. Il permet de centraliser et de gérer l'ensemble des informations relatives aux différents acteurs impliqués dans la chaîne logistique. Cette spécification détaillée vise à définir précisément les objectifs, les cas d'utilisation, les flux utilisateurs et les exigences techniques de chaque composante de ce module.

## Gestion des Clients

### Objectifs

La gestion des clients vise à centraliser toutes les informations relatives aux donneurs d'ordre et destinataires des services de transport. Elle permet d'établir une base de données complète et à jour des clients, facilitant ainsi la personnalisation des services, l'optimisation des opérations et le développement des relations commerciales. Ce module doit offrir une vision à 360° de chaque client, intégrant aussi bien les données administratives que les préférences opérationnelles et l'historique des interactions.

### Cas d'Utilisation

La gestion des clients répond à de nombreux cas d'utilisation essentiels dans le quotidien des entreprises de transport et logistique. Les équipes commerciales l'utilisent pour consulter rapidement les informations clients lors des interactions commerciales, pour analyser les volumes d'activité et identifier les opportunités de développement. Les équipes opérationnelles s'appuient sur les données clients pour personnaliser les services de transport selon les exigences spécifiques de chaque client, comme les horaires de livraison préférentiels ou les contraintes d'accès aux sites. Les équipes financières exploitent les informations contractuelles et tarifaires pour assurer une facturation précise et conforme aux accords commerciaux. Enfin, la direction utilise les données agrégées pour analyser la répartition du portefeuille clients, évaluer la dépendance à certains clients clés et orienter la stratégie commerciale.

### Flux Utilisateurs

Le flux utilisateur typique pour la gestion des clients commence par la création d'une nouvelle fiche client, généralement initiée par un commercial ou un administrateur suite à la signature d'un nouveau contrat. L'utilisateur accède au module de gestion des clients via le menu principal, puis sélectionne l'option "Nouveau client". Il remplit alors un formulaire structuré en plusieurs sections : informations générales (raison sociale, numéro SIRET, secteur d'activité), coordonnées (adresse du siège, téléphone, email), contacts (liste des interlocuteurs avec leurs rôles et coordonnées), sites (adresses de chargement et de livraison), et paramètres commerciaux (conditions de paiement, grilles tarifaires, accords de niveau de service).

Une fois la fiche client créée, elle devient accessible à tous les utilisateurs autorisés. Les commerciaux peuvent la consulter et la mettre à jour lors des revues périodiques avec le client. Les opérationnels peuvent y ajouter des annotations concernant les spécificités opérationnelles. Les administrateurs peuvent modifier les paramètres contractuels suite à des renégociations. Le système conserve un historique complet des modifications pour assurer la traçabilité.

Pour faciliter la gestion quotidienne, les utilisateurs peuvent effectuer des recherches multicritères (par nom, zone géographique, volume d'activité), filtrer les clients selon différents attributs, et exporter les données pour des analyses externes. Ils peuvent également accéder directement depuis la fiche client à l'historique des expéditions, aux factures émises, et aux indicateurs de performance spécifiques à ce client.

### Exigences Techniques

D'un point de vue technique, le module de gestion des clients doit s'appuyer sur une architecture robuste et évolutive. La base de données PostgreSQL stockera les informations clients dans un modèle relationnel optimisé, avec des tables principales pour les entités clients et des tables associées pour les contacts, sites, contrats et préférences. Des index appropriés seront créés pour garantir des performances optimales lors des recherches fréquentes.

Le backend Node.js implémentera une API RESTful complète pour la manipulation des données clients, avec des endpoints pour la création, la consultation, la modification et la suppression des fiches clients et de leurs composantes. Cette API intégrera des validations avancées pour garantir l'intégrité des données (unicité des identifiants, format des coordonnées, cohérence des relations). Des mécanismes de journalisation enregistreront toutes les modifications pour des besoins d'audit.

Le frontend React.js offrira une interface utilisateur intuitive et responsive, organisée en onglets thématiques pour faciliter la navigation dans les différentes sections de la fiche client. Des formulaires dynamiques avec validation en temps réel guideront les utilisateurs lors de la saisie des informations. Des composants de visualisation avancés (cartes pour les sites, graphiques pour l'activité) enrichiront l'expérience utilisateur. L'interface s'adaptera automatiquement aux différents appareils (ordinateurs, tablettes) utilisés par les équipes terrain.

Pour assurer l'interopérabilité, le module implémentera des fonctionnalités d'import/export dans différents formats (CSV, Excel, JSON), ainsi que des connecteurs vers les principaux CRM du marché. Un système de gestion des doublons avec algorithmes de détection et workflows de fusion permettra de maintenir la qualité de la base clients. Enfin, des mécanismes de cache et de chargement différé optimiseront les performances même avec un volume important de clients.

## Gestion des Transporteurs

### Objectifs

La gestion des transporteurs vise à centraliser toutes les informations relatives aux prestataires de transport avec lesquels l'entreprise collabore. Elle permet d'établir une base de données complète des transporteurs disponibles, facilitant ainsi la sélection optimale pour chaque opération de transport, le suivi des performances et la gestion des relations contractuelles. Ce module doit offrir une vision exhaustive de chaque transporteur, intégrant aussi bien les capacités opérationnelles que les conditions commerciales et l'historique des prestations.

### Cas d'Utilisation

La gestion des transporteurs répond à de nombreux cas d'utilisation critiques dans l'organisation des opérations de transport. Les équipes d'exploitation l'utilisent quotidiennement pour identifier et sélectionner les transporteurs les plus adaptés à chaque besoin de transport, en fonction des zones géographiques couvertes, des types de véhicules disponibles, des certifications détenues et des performances historiques. Les équipes d'approvisionnement s'appuient sur les données transporteurs pour négocier les contrats et les tarifs, comparer les offres et optimiser le panel de prestataires. Les équipes qualité exploitent les informations de performance pour évaluer régulièrement les transporteurs, identifier les axes d'amélioration et gérer les plans d'action correctifs. Enfin, les équipes financières utilisent les données contractuelles pour vérifier la conformité des factures reçues et gérer les litiges éventuels.

### Flux Utilisateurs

Le flux utilisateur typique pour la gestion des transporteurs commence par l'ajout d'un nouveau transporteur, généralement initié par un responsable transport ou un acheteur suite à l'identification d'un nouveau prestataire potentiel. L'utilisateur accède au module de gestion des transporteurs via le menu principal, puis sélectionne l'option "Nouveau transporteur". Il remplit alors un formulaire structuré en plusieurs sections : informations générales (raison sociale, numéro SIRET, taille de la flotte), coordonnées (adresse du siège, téléphone, email), contacts (liste des interlocuteurs avec leurs rôles et coordonnées), capacités opérationnelles (zones de couverture, types de véhicules, services proposés, certifications), et paramètres commerciaux (grilles tarifaires, conditions de paiement, pénalités).

Une fois la fiche transporteur créée, elle est soumise à un processus de validation impliquant différents services (juridique, qualité, finance) avant d'être activée dans le système. Les utilisateurs autorisés peuvent ensuite consulter et mettre à jour la fiche transporteur selon leurs responsabilités. Les exploitants peuvent ajouter des annotations opérationnelles, les acheteurs peuvent modifier les conditions tarifaires suite à des renégociations, et les responsables qualité peuvent mettre à jour les évaluations de performance.

Pour faciliter la gestion quotidienne, les utilisateurs peuvent effectuer des recherches multicritères (par zone géographique, type de véhicule, certification), comparer plusieurs transporteurs sur des critères clés, et exporter les données pour des analyses externes. Ils peuvent également accéder directement depuis la fiche transporteur à l'historique des prestations réalisées, aux incidents signalés, et aux indicateurs de performance.

### Exigences Techniques

D'un point de vue technique, le module de gestion des transporteurs doit s'appuyer sur une architecture robuste et sécurisée. La base de données PostgreSQL stockera les informations transporteurs dans un modèle relationnel optimisé, avec des tables principales pour les entités transporteurs et des tables associées pour les contacts, capacités, tarifs et évaluations. Des contraintes d'intégrité garantiront la cohérence des données, notamment pour les relations entre transporteurs et zones géographiques ou types de véhicules.

Le backend Node.js implémentera une API RESTful complète pour la manipulation des données transporteurs, avec des endpoints pour la création, la consultation, la modification et la désactivation des fiches transporteurs et de leurs composantes. Cette API intégrera des mécanismes d'autorisation granulaires pour contrôler précisément les droits d'accès selon les profils utilisateurs. Des webhooks permettront de notifier les systèmes externes (comme les plateformes de communication transporteurs) lors de modifications importantes.

Le frontend React.js offrira une interface utilisateur intuitive et fonctionnelle, avec des tableaux de bord personnalisables présentant les informations les plus pertinentes selon le profil de l'utilisateur. Des formulaires contextuels avec validation en temps réel guideront les utilisateurs lors de la saisie des informations. Des composants de visualisation avancés (cartes pour les zones de couverture, graphiques pour les performances) enrichiront l'expérience utilisateur. Des fonctionnalités de comparaison côte à côte faciliteront la sélection des transporteurs pour des besoins spécifiques.

Pour assurer l'interopérabilité, le module implémentera des fonctionnalités d'import/export dans différents formats, ainsi que des connecteurs vers les principales plateformes de transport du marché. Un système de notation automatique basé sur les performances historiques (ponctualité, qualité de service, réactivité) permettra d'évaluer objectivement chaque transporteur. Enfin, des mécanismes d'alerte signaleront automatiquement les expirations imminentes de documents obligatoires (assurances, licences) ou les dégradations significatives de performance.

## Gestion des Sites et Entrepôts

### Objectifs

La gestion des sites et entrepôts vise à centraliser toutes les informations relatives aux lieux physiques impliqués dans la chaîne logistique. Elle permet d'établir une base de données précise et détaillée de tous les points d'origine, de transit et de destination des marchandises, facilitant ainsi la planification optimale des opérations de transport, le respect des contraintes spécifiques à chaque site, et la communication efficace avec les équipes terrain. Ce module doit offrir une vision complète de chaque site, intégrant aussi bien les données géographiques que les caractéristiques opérationnelles et les règles d'accès.

### Cas d'Utilisation

La gestion des sites et entrepôts répond à de nombreux cas d'utilisation essentiels dans l'organisation des flux logistiques. Les planificateurs de transport l'utilisent quotidiennement pour intégrer les contraintes spécifiques de chaque site (horaires d'ouverture, équipements disponibles, règles de circulation) dans l'optimisation des tournées. Les conducteurs et livreurs s'appuient sur les informations détaillées des sites pour préparer leurs interventions, localiser précisément les points de chargement/déchargement et respecter les procédures locales. Les équipes commerciales exploitent les données sites pour évaluer la faisabilité de nouvelles demandes clients et proposer des solutions adaptées. Enfin, les responsables d'exploitation utilisent les informations consolidées pour analyser les performances par site, identifier les goulets d'étranglement et optimiser le réseau logistique global.

### Flux Utilisateurs

Le flux utilisateur typique pour la gestion des sites commence par la création d'une nouvelle fiche site, généralement initiée par un administrateur ou un responsable d'exploitation suite à l'intégration d'un nouveau point dans le réseau logistique. L'utilisateur accède au module de gestion des sites via le menu principal, puis sélectionne l'option "Nouveau site". Il remplit alors un formulaire structuré en plusieurs sections : informations générales (nom du site, type, entreprise propriétaire), localisation (adresse complète, coordonnées GPS, zone d'activité), caractéristiques opérationnelles (surface, nombre de quais, capacité de stockage, équipements disponibles), règles d'accès (horaires d'ouverture, restrictions de circulation, procédures de sécurité), et contacts sur site (liste des interlocuteurs avec leurs rôles et coordonnées).

L'utilisateur peut également télécharger des documents associés au site (plan d'accès, règlement intérieur, certifications) et ajouter des photos pour faciliter l'identification visuelle. Une fonctionnalité de géolocalisation permet de positionner précisément le site sur une carte interactive, avec la possibilité de définir des zones spécifiques (entrée principale, zone de stationnement, quais de chargement).

Une fois la fiche site créée, elle devient accessible à tous les utilisateurs autorisés. Les exploitants peuvent la consulter lors de la planification des opérations, les conducteurs peuvent y accéder via l'application mobile pendant leurs tournées, et les administrateurs peuvent la mettre à jour en cas de modification des caractéristiques ou des règles d'accès.

Pour faciliter la gestion quotidienne, les utilisateurs peuvent effectuer des recherches multicritères (par zone géographique, type de site, équipements disponibles), visualiser les sites sur une carte interactive, et exporter les données pour des analyses externes. Ils peuvent également accéder directement depuis la fiche site à l'historique des opérations réalisées, aux incidents signalés, et aux indicateurs de performance spécifiques à ce site.

### Exigences Techniques

D'un point de vue technique, le module de gestion des sites et entrepôts doit s'appuyer sur une architecture performante et évolutive. La base de données PostgreSQL stockera les informations sites dans un modèle relationnel optimisé, avec des tables principales pour les entités sites et des tables associées pour les contacts, équipements, horaires et documents. Des extensions géospatiales (PostGIS) seront utilisées pour stocker et interroger efficacement les données de localisation, permettant des recherches par proximité et des calculs de distance précis.

Le backend Node.js implémentera une API RESTful complète pour la manipulation des données sites, avec des endpoints pour la création, la consultation, la modification et la désactivation des fiches sites et de leurs composantes. Cette API intégrera des services de géocodage pour convertir automatiquement les adresses en coordonnées GPS et valider la cohérence des données géographiques. Des mécanismes de mise en cache optimiseront les performances pour les requêtes fréquentes, comme la recherche de sites à proximité d'un point donné.

Le frontend React.js offrira une interface utilisateur intuitive et visuelle, avec une forte composante cartographique basée sur des bibliothèques comme Leaflet ou Mapbox. Les utilisateurs pourront naviguer sur la carte, zoomer sur des zones d'intérêt, et accéder directement aux fiches sites depuis les marqueurs. Des formulaires contextuels avec assistance à la saisie (autocomplétion des adresses, suggestions basées sur les données existantes) guideront les utilisateurs lors de la création ou modification des sites. Des composants de visualisation avancés (vues 3D, plans interactifs) enrichiront l'expérience utilisateur pour les sites complexes.

Pour les utilisateurs mobiles, une version optimisée de l'interface sera proposée, avec des fonctionnalités de navigation GPS intégrées pour guider les conducteurs jusqu'aux sites, et la possibilité de consulter les informations essentielles même en mode hors ligne. Des notifications contextuelles pourront alerter les conducteurs à l'approche d'un site sur les spécificités à prendre en compte.

Pour assurer l'interopérabilité, le module implémentera des fonctionnalités d'import/export dans différents formats (CSV, KML, GeoJSON), ainsi que des connecteurs vers les principaux systèmes d'information géographique et GPS du marché. Un système de mise à jour collaborative permettra aux utilisateurs terrain de signaler des modifications nécessaires (changement d'horaires, nouveau contact), qui seront ensuite validées par les administrateurs avant intégration définitive.

## Gestion des Utilisateurs et Rôles

### Objectifs

La gestion des utilisateurs et rôles vise à contrôler et sécuriser l'accès au système TMS en fonction des responsabilités et des besoins de chaque collaborateur. Elle permet d'établir une structure d'autorisation fine et adaptable, garantissant que chaque utilisateur dispose exactement des droits nécessaires à l'accomplissement de ses tâches, tout en préservant la confidentialité des données sensibles et l'intégrité des opérations critiques. Ce module doit offrir une administration centralisée des comptes utilisateurs, des profils de sécurité et des périmètres d'accès, tout en facilitant l'évolution de l'organisation et la traçabilité des actions.

### Cas d'Utilisation

La gestion des utilisateurs et rôles répond à de nombreux cas d'utilisation essentiels dans la gouvernance et la sécurité du système TMS. Les administrateurs système l'utilisent pour créer et configurer les comptes des nouveaux collaborateurs, définir leurs droits d'accès en fonction de leur poste, et gérer les modifications liées aux évolutions de carrière ou aux réorganisations. Les responsables de département s'appuient sur les profils de rôles prédéfinis pour standardiser les accès au sein de leurs équipes, tout en demandant des ajustements spécifiques pour certains collaborateurs aux responsabilités particulières. Les équipes de conformité et de sécurité exploitent les fonctionnalités d'audit pour vérifier régulièrement l'adéquation des droits attribués avec les politiques de l'entreprise, identifier les accès inhabituels et documenter les contrôles pour les audits externes. Enfin, les utilisateurs eux-mêmes interagissent avec ce module pour gérer leurs informations personnelles, leurs préférences d'interface et leurs paramètres de notification.

### Flux Utilisateurs

Le flux utilisateur typique pour la gestion des utilisateurs commence par la création d'un nouveau compte, généralement initiée par un administrateur système suite à l'arrivée d'un nouveau collaborateur. L'administrateur accède au module de gestion des utilisateurs via le menu d'administration, puis sélectionne l'option "Nouvel utilisateur". Il remplit alors un formulaire avec les informations essentielles : données d'identification (nom, prénom, email professionnel), informations organisationnelles (service, fonction, responsable hiérarchique), et paramètres d'accès (identifiant, mot de passe temporaire, date d'expiration éventuelle).

L'administrateur attribue ensuite un ou plusieurs rôles prédéfinis à l'utilisateur, correspondant à ses responsabilités principales. Ces rôles déterminent automatiquement un ensemble cohérent de permissions sur les différentes fonctionnalités du système. Si nécessaire, l'administrateur peut affiner ces permissions en ajoutant ou retirant des droits spécifiques, ou en définissant des périmètres d'accès particuliers (restriction à certains clients, transporteurs ou zones géographiques).

Une fois le compte créé, l'utilisateur reçoit une notification par email avec les instructions de première connexion. Lors de cette connexion initiale, il est invité à personnaliser son mot de passe, à vérifier ses informations personnelles et à configurer ses préférences d'utilisation (langue, fuseau horaire, notifications). Il peut également consulter la liste des fonctionnalités auxquelles il a accès et demander des droits supplémentaires si nécessaire, déclenchant ainsi un workflow d'approbation impliquant son responsable hiérarchique.

Au quotidien, les administrateurs peuvent gérer les comptes existants : modification des informations, ajustement des droits, désactivation temporaire ou définitive, réinitialisation des mots de passe. Ils peuvent également gérer les rôles : création de nouveaux profils, modification des permissions associées, analyse de l'utilisation. Des fonctionnalités de gestion en masse facilitent les opérations sur de multiples utilisateurs, comme l'attribution d'un nouveau droit à toute une équipe ou la désactivation des comptes inactifs depuis plus de trois mois.

### Exigences Techniques

D'un point de vue technique, le module de gestion des utilisateurs et rôles doit s'appuyer sur une architecture sécurisée et conforme aux meilleures pratiques. La base de données PostgreSQL stockera les informations utilisateurs dans un modèle relationnel optimisé, avec des tables principales pour les entités utilisateurs et rôles, et des tables associées pour les permissions, les périmètres d'accès et l'historique des connexions. Les mots de passe seront stockés sous forme hachée avec des algorithmes robustes (bcrypt) et des mécanismes de salage, conformément aux standards de sécurité.

Le backend Node.js implémentera une API RESTful sécurisée pour la manipulation des données utilisateurs, avec des endpoints protégés par authentification et autorisation strictes. Cette API intégrera des mécanismes d'authentification avancés, supportant différentes méthodes selon les besoins de l'entreprise : authentification locale, intégration avec des services d'identité d'entreprise (LDAP, Active Directory), authentification unique (SSO) via des protocoles standards (SAML, OAuth), et authentification multifacteur pour les accès sensibles. Un système complet de journalisation enregistrera toutes les opérations liées à la gestion des utilisateurs et des droits, ainsi que les tentatives d'accès infructueuses, pour des besoins d'audit et de détection d'intrusion.

Le frontend React.js offrira une interface utilisateur intuitive et sécurisée, avec des tableaux de bord d'administration pour la gestion des comptes et des rôles, et des écrans personnalisés pour la gestion du profil utilisateur. Des composants spécialisés faciliteront la définition et la visualisation des permissions complexes, comme des matrices de droits ou des arbres de fonctionnalités. L'interface s'adaptera dynamiquement aux droits de l'utilisateur connecté, n'affichant que les fonctionnalités auxquelles il a accès et personnalisant les menus en conséquence.

Pour assurer l'interopérabilité et la conformité, le module implémentera des fonctionnalités d'import/export des données utilisateurs dans des formats standards, des connecteurs vers les principaux systèmes de gestion des identités, et des rapports prédéfinis pour les audits de sécurité. Un système de gestion des sessions contrôlera la durée de validité des connexions, forcera la déconnexion après une période d'inactivité, et permettra la révocation immédiate des sessions en cas de compromission suspectée. Enfin, des mécanismes de limitation de tentatives et de détection des comportements suspects renforceront la protection contre les attaques par force brute et autres menaces de sécurité.
