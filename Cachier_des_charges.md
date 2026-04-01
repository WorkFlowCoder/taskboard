# CAHIER DES CHARGES COMPLET

Application Web de Gestion de Tâches (Full-Stack React + FastAPI)

## 1. CONTEXTE & PRÉSENTATION DU PROJET

### 1.1 Contexte

Dans un environnement numérique où la productivité personnelle et la gestion des tâches sont essentielles, de nombreuses applications existent (kanban, todo list, gestion de projets).

Ce projet consiste à développer une application web moderne inspirée d’outils comme Trello, mais simplifiée, dans un objectif pédagogique et démonstratif.

### 1.2 Objectifs

#### Objectif principal

Concevoir et développer une application web permettant :

- la gestion de tâches
- leur organisation visuelle
- le suivi de progression
- Objectifs secondaires
- Démontrer des compétences full-stack
- Implémenter une architecture propre et scalable
- Produire une application déployée

### 1.3 Enjeux

- Qualité du code
- Expérience utilisateur fluide
- Sécurité des données
- Maintenabilité du projet

## 2. UTILISATEURS & BESOINS

### 2.1 Typologie des utilisateurs

- Utilisateur standard
- Crée et gère ses tâches
- Visualise leur progression
- Recruteur / évaluateur
- Analyse la qualité technique du projet
- Évalue les choix d’architecture

### 2.2 Besoins fonctionnels

- Créer un compte
- Se connecter
- Gérer ses tâches
- Organiser visuellement ses tâches
- Filtrer et rechercher

### 2.3 Besoins non fonctionnels

- Application rapide
- Interface intuitive
- Sécurité minimale (authentification)
- Compatibilité mobile

## 3. SPÉCIFICATIONS FONCTIONNELLES

### 3.1 Gestion des comptes

- Inscription
- Email unique
- Mot de passe sécurisé
- Connexion
- Authentification via JWT
- Déconnexion
- Suppression du token côté client

### 3.2 Gestion des tâches

- Structure d’une tâche
- ID (UUID)
- Titre
- Description
- Statut
- Date de création
- Date de modification
- ID utilisateur
- Actions disponibles
- Création
- Saisie titre obligatoire
- Description facultative
- Modification
- Édition des champs
- Changement de statut
- Suppression
- Suppression définitive
- Consultation
- Liste des tâches utilisateur

### 3.3 Organisation Kanban

#### Colonnes

- To Do
- Doing
- Done
- Fonctionnalités :
    - Drag & drop
    - Mise à jour automatique du statut
    - Animation fluide

### 3.4 Recherche & filtres

- Filtre par statut
- Recherche textuelle
- Tri (date, titre)

### 3.5 Fonctionnalités bonus

- Mode sombre
- Notifications
- Sauvegarde locale
- Pagination

## 4. ARCHITECTURE TECHNIQUE

### 4.1 Vue globale

[ React Frontend ]  →  [ API REST ]  →  [ Base de données ]

### 4.2 Frontend

- React
- Vite
- UI / UX
- Gestion d’état
- Appels API
- Gestion erreurs

### 4.3 Backend

- FastAPI
- SQLAlchemy
Pydantic

#### Architecture interne
```
app/
 ├── main.py
 ├── config/
 ├── routes/
 ├── models/
 ├── schemas/
 ├── services/
 ├── repositories/
 └── core/
```
#### Rôles des couches

- routes → endpoints API
- services → logique métier
- repositories → accès DB
- schemas → validation

### 4.4 Base de données

- SGBD
- PostgreSQL
- Modélisation
- Table Users
    - id
    - email
    - password_hash
- Table Tasks
    - id
    - title
    - description
    - status
    - user_id

## 5. SPÉCIFICATIONS API

### 5.1 Authentification

- POST /register
- POST /login

### 5.2 Endpoints Tasks

- POST /tasks
- PUT /tasks/{id}
- DELETE /tasks/{id}

## 6. SÉCURITÉ

### 6.1 Authentification

JWT, avec une expiration token

### 6.2 Protection des données

Accès restreint par utilisateur

### 6.3 Hashage

Utilisation de bcrypt

## 7. UX / UI

### 7.1 Principes

- Simplicité
- Lisibilité
- Feedback utilisateur

### 7.2 Responsive design

- Mobile first
- Desktop optimisé

### 7.3 Accessibilité

- Contraste
- Navigation clavier

## 8. PERFORMANCE

Backend
- Requêtes optimisées et Index DB

Frontend
- Lazy loading et Memoization

## 9. TESTS

Backend
- pytest
- tests unitaires

Frontend
- React Testing Library

## 10. MONITORING & LOGS

- Logs serveur
- Gestion erreurs
- Debug mode

## 11. LIVRABLES

- Code source GitHub
- Documentation complète

## 12. CRITÈRES DE QUALITÉ

- Code propre
- Architecture claire
- UI fonctionnelle
- API robuste

## 13. ÉVOLUTIONS FUTURES

- Collaboration multi-users
- WebSockets
- Notifications temps réel
- Mobile app