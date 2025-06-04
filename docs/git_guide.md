# Guide d'initialisation Git pour le projet TMS

Ce guide vous explique comment initialiser et gérer le versioning Git pour votre projet TMS.

## Initialisation du repository

```bash
# Se positionner dans le répertoire du projet
cd /chemin/vers/tms_project

# Initialiser un nouveau repository Git
git init

# Ajouter tous les fichiers au staging
git add .

# Créer le premier commit
git commit -m "Initial commit: Structure complète du TMS avec intégration IA"
```

## Connexion à un repository distant

```bash
# Ajouter l'URL de votre repository distant (remplacez l'URL par la vôtre)
git remote add origin https://github.com/votre-username/tms-project.git

# Pousser le code vers la branche principale
git push -u origin main
```

## Bonnes pratiques Git pour ce projet

1. **Structure des commits** : Utilisez des messages de commit descriptifs qui expliquent clairement les changements
   - Format recommandé : `[MODULE] Description courte de la modification`
   - Exemple : `[FRONTEND] Ajout du composant de prévision de la demande`

2. **Branches** : Utilisez des branches pour les nouvelles fonctionnalités
   - `main` : Code stable et testé
   - `develop` : Intégration des nouvelles fonctionnalités
   - `feature/nom-fonctionnalite` : Développement de nouvelles fonctionnalités

3. **Pull Requests** : Pour les équipes, utilisez des pull requests pour la revue de code

4. **Tags** : Marquez les versions importantes avec des tags
   - Exemple : `git tag -a v1.0.0 -m "Version initiale du TMS"`

5. **Hooks Git** : Envisagez d'utiliser des hooks pour les tests automatiques avant les commits

## Fichiers ignorés

Un fichier `.gitignore` a été créé pour exclure :
- Les dépendances (`node_modules`)
- Les fichiers de build
- Les fichiers d'environnement (`.env`)
- Les logs et fichiers temporaires

## Workflow recommandé

1. Développez de nouvelles fonctionnalités dans des branches dédiées
2. Testez localement avant de commit
3. Fusionnez dans `develop` pour l'intégration
4. Une fois stable, fusionnez dans `main` pour la production

## Commandes Git utiles

```bash
# Voir l'état actuel
git status

# Voir l'historique des commits
git log --oneline --graph

# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Fusionner une branche
git checkout develop
git merge feature/nouvelle-fonctionnalite
```
