# Sedona.AI

Suite SaaS B2B pour TPE françaises.

## Modules

- **Sedona CRM** : Gestion relation client
- **Sedona Invoice** : Facturation & Devis
- **Sedona Projects** : Gestion de projets
- **Sedona Tickets** : Support client / Helpdesk
- **Sedona HR** : Gestion RH simplifiée
- **Sedona Docs** : Gestion documentaire
- **Sedona Analytics** : Tableaux de bord cross-modules

## Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Compte Supabase (région eu-central-1)
- Compte Stripe (pour les paiements)

## Installation

```bash
# Cloner le repo
git clone https://github.com/your-org/sedona.git
cd sedona

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Lancer en développement
pnpm dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lance tous les apps en mode développement |
| `pnpm build` | Build tous les packages et apps |
| `pnpm lint` | Vérifie le linting |
| `pnpm lint:fix` | Corrige les erreurs de linting |
| `pnpm format` | Formate le code avec Prettier |
| `pnpm typecheck` | Vérifie les types TypeScript |
| `pnpm test` | Lance les tests |
| `pnpm test:watch` | Lance les tests en mode watch |
| `pnpm clean` | Nettoie tous les builds et node_modules |

## Structure du Monorepo

```
sedona/
├── apps/
│   └── web/                 # Application principale React
├── packages/
│   ├── ui/                  # Composants UI (@sedona/ui)
│   ├── database/            # Client Supabase et types (@sedona/database)
│   ├── core/                # Logique métier partagée (@sedona/core)
│   ├── typescript-config/   # Config TypeScript partagée
│   └── eslint-config/       # Config ESLint partagée
├── turbo.json               # Configuration Turborepo
├── pnpm-workspace.yaml      # Configuration pnpm workspaces
└── package.json             # Scripts et dépendances globales
```

## Stack Technique

- **Frontend** : React 18, Vite, TanStack Router/Query, Tailwind CSS, Shadcn/ui
- **Backend** : Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth** : Better Auth avec Supabase adapter
- **Paiements** : Stripe
- **Emails** : Resend + React Email
- **Monitoring** : Sentry, PostHog

## Licence

Propriétaire - Tous droits réservés
