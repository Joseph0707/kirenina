# 🎮 Kirenina

Plateforme de jeux multijoueur en ligne avec animations 3D.

## 🃏 Jeux disponibles

- **Rami (Rummy)** — Jeu de cartes à 104 cartes, 2-4 joueurs

## 🏗️ Architecture

Mono-repo Turborepo avec :

| Dossier | Description | Technologie |
|---|---|---|
| `apps/web` | Frontend | Nuxt 3, TresJS (Three.js), Pinia |
| `apps/api` | Backend | NestJS, Prisma, Socket.IO |
| `packages/shared-types` | Types TypeScript partagés | TypeScript |
| `packages/game-logic` | Logique de jeu pure | TypeScript |
| `packages/utils` | Utilitaires partagés | TypeScript, Zod |

## 📋 Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10
- [Docker](https://www.docker.com/) (pour PostgreSQL et Redis)

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Lancer les services (PostgreSQL + Redis)

```bash
pnpm db:dev
```

### 3. Configurer l'environnement

```bash
cp apps/api/.env.example apps/api/.env
```

### 4. Lancer les migrations

```bash
cd apps/api
pnpm db:migrate
```

### 5. Lancer le projet

```bash
pnpm dev
```

- Frontend : http://localhost:3000
- Backend : http://localhost:3001
- PostgreSQL : localhost:5432
- Redis : localhost:6379

## 🛑 Arrêter les services

```bash
pnpm db:stop
```

## 📦 Structure du projet

```
kirenina/
├── apps/
│   ├── web/          # Frontend Nuxt 3
│   └── api/          # Backend NestJS
├── packages/
│   ├── shared-types/ # Types partagés
│   ├── game-logic/   # Logique de jeu
│   └── utils/        # Utilitaires
├── docker-compose.dev.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 📝 Licence

Privé — Tous droits réservés.
