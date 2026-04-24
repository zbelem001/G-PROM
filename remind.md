# Rappel technique - G-PROM

## État actuel
- Répertoire restauré sur le commit `c5178f2` (`Align avenant drawer with Avenant table fields`).
- Branche active : `main`.
- Backend et frontend sont dans l'état correspondant à ce commit.

## Spécifications techniques

### Stack technique
- Backend : NestJS 11 + Node.js + TypeScript
- Frontend : Angular 21.2.7 + Angular SSR + Express
- Base de données : schéma SQL défini dans `backend/bd.sql`
- Outils : npm, Prettier, ESLint, Jest, Vitest

### Backend
- Structure principale : `backend/src`
- Fichiers clés :
  - `backend/src/app.module.ts`
  - `backend/src/app.controller.ts`
  - `backend/src/app.service.ts`
- Package de l’application : `backend/package.json`
- Scripts disponibles :
  - `npm run start` pour démarrer le serveur NestJS
  - `npm run start:dev` pour le mode watch
  - `npm run build` pour compiler
  - tests : `npm run test`, `npm run test:e2e`

### Frontend
- Structure principale : `frontend/src`
- Application Angular / SSR : `frontend/package.json`
- Scripts disponibles :
  - `npm run start` pour lancer `ng serve`
  - `npm run build` pour compiler
  - `npm run test` pour exécuter les tests

### Base de données
Le schéma SQL se trouve dans `backend/bd.sql` et contient les tables suivantes :
- `Marche`
- `Lot`
- `Fournisseur`
- `Utilisateur`
- `Consultation`
- `Soumission`
- `Analyse`
- `Attributaire`
- `Avenant`
- `Document`

Chaque table dispose de contraintes de clé primaire, de relations par clé étrangère et de règles de validation basiques (`CHECK`, `DEFAULT`).

## Ce qui a été fait
- Mise en place du scaffold NestJS pour le backend.
- Mise en place du projet Angular frontend avec support SSR.
- Définition du modèle fonctionnel pour les marchés, lots, fournisseurs, soumissions, attribution, avenants, documents.
- Création de fichiers de service frontend pour appeler l’API et de composants pour la gestion des fournisseurs.
- Nettoyage des conflits de merge dans `frontend/src/app/api.service.ts` et `frontend/src/app/pages/fournisseurs/fournisseurs.component.ts`.
- Réinitialisation du dépôt à un état stable (`c5178f2`) à la demande.
- Ajout de routes et de composants côté frontend pour la gestion des marchés et du workflow d’avenant (via le commit cible).

## Difficultés rencontrées
- Conflits Git persistants dans le frontend, générant des erreurs TS1185 liées à des marqueurs `<<<<<<<`, `=======`, `>>>>>>>`.
- Build Angular impossible tant que les fichiers conflictuels n’étaient pas nettoyés.
- État du backend encore largement en scaffold, sans raccordement complet de tous les modules de domaine dans `AppModule`.
- Possibles différences entre la structure de fichiers affichée et le framework attendu (Angular + SSR vs `frontend/src/app` avec pages/components).

## Comment les difficultés ont été résolues
- Le dépôt a été réinitialisé au commit demandé pour repartir d’un état cohérent.
- Les conflits de merge sur les fichiers frontend critiques ont été identifiés et corrigés.
- Le point de départ est désormais un commit fonctionnel où le backend et le frontend peuvent être encore démarrés et testés proprement.

## Ce qui reste à faire
- Valider et connecter le backend aux routes métiers : `marches`, `lots`, `fournisseurs`, `soumissions`, `analyses`, `attributions`, `avenants`, `documents`.
- Implémenter les services data réels dans NestJS (connexion à une BDD, requêtes CRUD, validation des entrées).
- Finaliser l’intégration entre les composants frontend et l’API REST backend.
- Vérifier et réparer le démarrage `npm start` sur frontend et backend après le reset.
- Ajouter l’authentification et la gestion des utilisateurs (`Utilisateur`).
- Mettre en place des tests de bout en bout et de couverture pour les routes critiques.
- Documenter les règles métiers précises pour chaque table et formulaire côté frontend.
- Harmoniser la structure du frontend si des éléments Angular/SSR ne correspondent pas à l’architecture attendue.

## Prochaines étapes recommandées
1. Exécuter `npm install` dans `backend` et `frontend`.
2. Lancer `backend` avec `npm run start` pour vérifier le serveur NestJS.
3. Lancer `frontend` avec `npm run start` pour vérifier l’interface Angular.
4. Implémenter un prototype de connexion BDD et tester les endpoints.
5. Compléter les écrans métier manquants, en particulier l’avenant et l’attribution.
6. Ajouter la documentation d’architecture si nécessaire.

## Notes
- Le projet est actuellement à l’état d’un prototype fonctionnel, mais il reste à transformer en application complète avec une base de données opérationnelle et un vrai backend métier.
- Le commit de référence est `c5178f2`, il faut conserver cette base tant que le frontend et le backend n’ont pas été validés ensemble.
