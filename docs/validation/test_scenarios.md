# Scénarios de Test pour le TMS

Ce document présente des scénarios de test détaillés pour valider les fonctionnalités du Transport Management System (TMS) avec support multimodal et international.

## 1. Module d'authentification et gestion des utilisateurs

### Scénario 1.1: Inscription d'un nouvel utilisateur
**Objectif**: Vérifier que le processus d'inscription fonctionne correctement.

**Étapes**:
1. Accéder à la page d'inscription
2. Remplir le formulaire avec des informations valides:
   - Email: test.user@example.com
   - Mot de passe: SecurePass123!
   - Nom: Test User
   - Rôle: Gestionnaire de transport
3. Soumettre le formulaire
4. Vérifier la redirection vers la page de connexion ou le tableau de bord
5. Vérifier la réception d'un email de confirmation (si applicable)

**Résultat attendu**: L'utilisateur est créé dans le système et peut se connecter avec ses identifiants.

### Scénario 1.2: Connexion utilisateur
**Objectif**: Vérifier que le processus de connexion fonctionne correctement.

**Étapes**:
1. Accéder à la page de connexion
2. Entrer des identifiants valides:
   - Email: test.user@example.com
   - Mot de passe: SecurePass123!
3. Cliquer sur le bouton de connexion
4. Vérifier la redirection vers le tableau de bord
5. Vérifier que les informations de l'utilisateur sont affichées correctement

**Résultat attendu**: L'utilisateur est connecté et a accès aux fonctionnalités correspondant à son rôle.

### Scénario 1.3: Récupération de mot de passe
**Objectif**: Vérifier que le processus de récupération de mot de passe fonctionne correctement.

**Étapes**:
1. Accéder à la page de connexion
2. Cliquer sur "Mot de passe oublié"
3. Entrer l'email: test.user@example.com
4. Soumettre le formulaire
5. Vérifier la réception d'un email avec un lien de réinitialisation
6. Cliquer sur le lien et définir un nouveau mot de passe: NewSecurePass123!
7. Se connecter avec le nouveau mot de passe

**Résultat attendu**: L'utilisateur peut réinitialiser son mot de passe et se connecter avec le nouveau mot de passe.

### Scénario 1.4: Gestion des rôles et permissions
**Objectif**: Vérifier que les rôles et permissions sont correctement appliqués.

**Étapes**:
1. Se connecter en tant qu'administrateur
2. Accéder à la page de gestion des utilisateurs
3. Sélectionner l'utilisateur "Test User"
4. Modifier son rôle de "Gestionnaire de transport" à "Opérateur"
5. Enregistrer les modifications
6. Se déconnecter et se reconnecter en tant que "Test User"
7. Vérifier que les fonctionnalités accessibles correspondent au rôle "Opérateur"

**Résultat attendu**: Les permissions de l'utilisateur sont mises à jour selon son nouveau rôle.

## 2. Module de gestion des partenaires et entités

### Scénario 2.1: Création d'un nouveau client
**Objectif**: Vérifier que la création d'un nouveau client fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page des partenaires
3. Cliquer sur "Ajouter un partenaire"
4. Sélectionner le type "Client"
5. Remplir les informations:
   - Nom: Acme Corporation
   - Type d'activité: Distribution
   - Email: contact@acme.com
   - Téléphone: +33123456789
   - Adresse: 123 Rue de Paris, 75001 Paris, France
6. Soumettre le formulaire
7. Vérifier que le client apparaît dans la liste des partenaires

**Résultat attendu**: Le nouveau client est créé et visible dans la liste des partenaires.

### Scénario 2.2: Création d'un transporteur avec véhicules
**Objectif**: Vérifier que la création d'un transporteur avec véhicules fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page des partenaires
3. Cliquer sur "Ajouter un partenaire"
4. Sélectionner le type "Transporteur"
5. Remplir les informations du transporteur:
   - Nom: Express Transport
   - Type d'activité: Transport routier
   - Email: operations@express-transport.com
   - Téléphone: +33987654321
   - Adresse: 456 Avenue de Lyon, 69000 Lyon, France
6. Soumettre le formulaire
7. Accéder à la fiche du transporteur créé
8. Cliquer sur "Ajouter un véhicule"
9. Remplir les informations du véhicule:
   - Type: Camion
   - Immatriculation: AB-123-CD
   - Capacité: 24 tonnes
   - Dimensions: 13.6m x 2.4m x 2.6m
10. Soumettre le formulaire
11. Vérifier que le véhicule apparaît dans la liste des véhicules du transporteur

**Résultat attendu**: Le transporteur et son véhicule sont créés et correctement associés.

### Scénario 2.3: Gestion des contacts
**Objectif**: Vérifier que la gestion des contacts fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la fiche du client "Acme Corporation"
3. Cliquer sur "Ajouter un contact"
4. Remplir les informations:
   - Nom: Jean Dupont
   - Fonction: Responsable logistique
   - Email: jean.dupont@acme.com
   - Téléphone: +33612345678
   - Contact principal: Oui
5. Soumettre le formulaire
6. Vérifier que le contact apparaît dans la liste des contacts du client
7. Cliquer sur "Modifier" pour ce contact
8. Changer la fonction en "Directeur logistique"
9. Soumettre le formulaire
10. Vérifier que les modifications sont enregistrées

**Résultat attendu**: Le contact est créé, modifié et correctement associé au client.

### Scénario 2.4: Gestion des sites
**Objectif**: Vérifier que la gestion des sites fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la fiche du client "Acme Corporation"
3. Cliquer sur "Ajouter un site"
4. Remplir les informations:
   - Nom: Entrepôt Central
   - Type: Entrepôt
   - Adresse: 789 Rue de l'Industrie, 33000 Bordeaux, France
   - Horaires: Lun-Ven 8h-18h
   - Capacité: 5000 m²
5. Soumettre le formulaire
6. Vérifier que le site apparaît dans la liste des sites du client
7. Vérifier que le site est géolocalisé sur la carte

**Résultat attendu**: Le site est créé, géolocalisé et correctement associé au client.

## 3. Module de gestion des commandes et expéditions

### Scénario 3.1: Création d'une commande nationale (cas simple)
**Objectif**: Vérifier que la création d'une commande nationale simple fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page des commandes
3. Cliquer sur "Nouvelle commande"
4. Remplir les informations:
   - Client: Acme Corporation
   - Type d'expédition: National
   - Mode de transport: Routier
   - Origine: Paris, France
   - Destination: Lyon, France
   - Date promise: J+2
   - Description: Matériel informatique
   - Poids: 500 kg
   - Volume: 2 m³
   - Nombre de colis: 10
5. Ajouter une ligne de commande:
   - Produit: Ordinateurs portables
   - Quantité: 10
   - Poids unitaire: 50 kg
   - Volume unitaire: 0.2 m³
6. Soumettre le formulaire
7. Vérifier que la commande est créée avec un statut "Nouvelle"

**Résultat attendu**: La commande nationale est créée avec les informations correctes et un minimum de champs à remplir.

### Scénario 3.2: Création d'une expédition pour une commande nationale
**Objectif**: Vérifier que la création d'une expédition pour une commande nationale fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page de détail de la commande nationale créée précédemment
3. Cliquer sur "Créer une expédition"
4. Vérifier que les informations de la commande sont pré-remplies
5. Sélectionner le transporteur: Express Transport
6. Sélectionner le véhicule: AB-123-CD
7. Définir les dates d'enlèvement et de livraison prévues
8. Soumettre le formulaire
9. Vérifier que l'expédition est créée avec un statut "Planifiée"
10. Vérifier que l'expédition est liée à la commande

**Résultat attendu**: L'expédition est créée avec un segment unique et correctement liée à la commande.

### Scénario 3.3: Création d'une commande internationale (cas complexe)
**Objectif**: Vérifier que la création d'une commande internationale fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page des commandes
3. Cliquer sur "Nouvelle commande"
4. Remplir les informations:
   - Client: Acme Corporation
   - Type d'expédition: International
   - Mode de transport: Multimodal
   - Origine: Paris, France
   - Destination: New York, États-Unis
   - Date promise: J+10
   - Incoterm: CIF
   - Description: Équipements électroniques
   - Poids: 2000 kg
   - Volume: 8 m³
   - Nombre de colis: 40
   - Valeur en douane: 50000 EUR
5. Ajouter des lignes de commande avec codes HS et pays d'origine
6. Soumettre le formulaire
7. Vérifier que la commande est créée avec un statut "Nouvelle"
8. Vérifier que les champs spécifiques à l'international sont correctement enregistrés

**Résultat attendu**: La commande internationale est créée avec toutes les informations nécessaires pour le transport international.

### Scénario 3.4: Création d'une expédition multimodale
**Objectif**: Vérifier que la création d'une expédition multimodale fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page de détail de la commande internationale créée précédemment
3. Cliquer sur "Créer une expédition"
4. Vérifier que les informations de la commande sont pré-remplies
5. Sélectionner "Multimodal" comme type de transport
6. Ajouter un premier segment:
   - Origine: Paris, France
   - Destination: Le Havre, France
   - Mode: Routier
   - Transporteur: Express Transport
   - Dates prévues
7. Ajouter un deuxième segment:
   - Origine: Le Havre, France
   - Destination: New York, États-Unis
   - Mode: Maritime
   - Transporteur: Global Shipping
   - Dates prévues
8. Ajouter un troisième segment:
   - Origine: New York Port
   - Destination: New York City
   - Mode: Routier
   - Transporteur: US Trucking
   - Dates prévues
9. Soumettre le formulaire
10. Vérifier que l'expédition est créée avec les trois segments
11. Vérifier que les points de transfert sont correctement identifiés

**Résultat attendu**: L'expédition multimodale est créée avec tous les segments et correctement liée à la commande internationale.

### Scénario 3.5: Suivi d'une expédition
**Objectif**: Vérifier que le suivi d'une expédition fonctionne correctement.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder à la page de détail de l'expédition multimodale créée précédemment
3. Cliquer sur "Ajouter un événement de suivi"
4. Remplir les informations:
   - Type: Départ
   - Segment: Premier segment (routier)
   - Date/heure: Maintenant
   - Commentaire: Départ de l'entrepôt à Paris
5. Soumettre le formulaire
6. Vérifier que l'événement apparaît dans la chronologie de suivi
7. Vérifier que le statut du segment est mis à jour à "En cours"
8. Répéter pour d'autres événements de suivi sur différents segments

**Résultat attendu**: Les événements de suivi sont enregistrés et les statuts des segments sont mis à jour en conséquence.

### Scénario 3.6: Consultation du tableau de bord
**Objectif**: Vérifier que le tableau de bord affiche correctement les KPIs et visualisations.

**Étapes**:
1. Se connecter en tant que gestionnaire
2. Accéder au tableau de bord
3. Vérifier l'affichage des KPIs:
   - Nombre d'expéditions actives
   - Taux de livraison à l'heure
   - Temps de transit moyen
   - Émissions CO2
4. Vérifier les visualisations:
   - Répartition par mode de transport
   - Statut des expéditions
   - Performance de livraison à l'heure
5. Changer la période d'analyse (jour, semaine, mois)
6. Vérifier que les données sont mises à jour en conséquence

**Résultat attendu**: Le tableau de bord affiche correctement les KPIs et visualisations, et répond aux changements de période.

## 4. Tests de compatibilité et réactivité

### Scénario 4.1: Compatibilité navigateur
**Objectif**: Vérifier que l'application fonctionne correctement sur différents navigateurs.

**Étapes**:
1. Tester l'application sur Chrome
2. Tester l'application sur Firefox
3. Tester l'application sur Safari
4. Tester l'application sur Edge
5. Vérifier que toutes les fonctionnalités sont accessibles et fonctionnent correctement sur chaque navigateur

**Résultat attendu**: L'application fonctionne de manière cohérente sur tous les navigateurs testés.

### Scénario 4.2: Réactivité sur différents appareils
**Objectif**: Vérifier que l'application est réactive et utilisable sur différents appareils.

**Étapes**:
1. Tester l'application sur un ordinateur de bureau
2. Tester l'application sur une tablette
3. Tester l'application sur un smartphone
4. Vérifier que l'interface s'adapte correctement à chaque taille d'écran
5. Vérifier que toutes les fonctionnalités sont accessibles sur chaque appareil

**Résultat attendu**: L'application est réactive et utilisable sur tous les appareils testés.

## 5. Tests de performance

### Scénario 5.1: Chargement des pages
**Objectif**: Vérifier que les temps de chargement des pages sont acceptables.

**Étapes**:
1. Mesurer le temps de chargement de la page d'accueil
2. Mesurer le temps de chargement de la liste des commandes
3. Mesurer le temps de chargement de la liste des expéditions
4. Mesurer le temps de chargement du tableau de bord
5. Vérifier que tous les temps de chargement sont inférieurs à 3 secondes

**Résultat attendu**: Toutes les pages se chargent en moins de 3 secondes.

### Scénario 5.2: Réactivité de l'interface
**Objectif**: Vérifier que l'interface reste réactive lors de l'utilisation.

**Étapes**:
1. Effectuer des actions courantes (navigation, filtrage, tri)
2. Vérifier que l'interface répond immédiatement
3. Charger une liste avec un grand nombre d'éléments (>100)
4. Vérifier que la pagination et le filtrage fonctionnent correctement
5. Vérifier que l'interface reste fluide

**Résultat attendu**: L'interface reste réactive et fluide dans toutes les situations testées.

## 6. Rapport de validation

À l'issue de l'exécution de tous les scénarios de test, un rapport de validation sera généré avec les informations suivantes:

- Nombre total de scénarios testés
- Nombre de scénarios réussis
- Nombre de scénarios échoués
- Liste des problèmes identifiés
- Recommandations pour les corrections
- Évaluation globale de la qualité du système

Ce rapport servira de base pour valider la conformité du système aux exigences et pour planifier les éventuelles corrections nécessaires avant le déploiement en production.
