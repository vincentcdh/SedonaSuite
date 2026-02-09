# SEDONA CRM - Documentation Technique Complete

> Document de reference pour le contexte du projet Sedona CRM
> Version: 1.0 | Date: Fevrier 2026

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture technique](#2-architecture-technique)
3. [Structure des packages](#3-structure-des-packages)
4. [Base de donnees](#4-base-de-donnees)
5. [Modules fonctionnels](#5-modules-fonctionnels)
6. [Systeme d'authentification](#6-systeme-dauthentification)
7. [Routes et navigation](#7-routes-et-navigation)
8. [Types TypeScript](#8-types-typescript)
9. [Hooks et Server Functions](#9-hooks-et-server-functions)
10. [Plans et limites](#10-plans-et-limites)

---

## 1. Vue d'ensemble

### Description du projet

Sedona CRM est une application SaaS multi-tenant complete comprenant :
- **CRM** : Gestion des contacts, entreprises, pipeline de vente
- **Facturation** : Devis, factures, avoirs, paiements
- **Projets** : Gestion de projets, taches, temps, Kanban, Gantt
- **Tickets** : Support client, SLA, base de connaissances
- **RH** : Employes, conges, entretiens, pointage
- **Documents** : Gestion de fichiers, versions, partage
- **Analytics** : Tableaux de bord, KPIs, objectifs, rapports

### Stack technologique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, TypeScript, TanStack Router, TanStack Query |
| UI | Tailwind CSS, Radix UI, Shadcn/ui (@sedona/ui) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Monorepo | PNPM Workspaces, Turborepo |
| Validation | Zod |
| Formulaires | React Hook Form |
| Graphiques | (Charts library - a implementer) |

### Structure du monorepo

```
sedona-crm/
├── apps/
│   └── web/                    # Application principale React
├── packages/
│   ├── analytics/              # Module Analytics
│   ├── auth/                   # Module Authentification
│   ├── core/                   # Types et utilitaires partages
│   ├── crm/                    # Module CRM
│   ├── database/               # Configuration Supabase + migrations
│   ├── docs/                   # Module Documents
│   ├── hr/                     # Module RH
│   ├── invoice/                # Module Facturation
│   ├── projects/               # Module Projets
│   ├── tickets/                # Module Tickets
│   └── ui/                     # Composants UI partages
└── package.json
```

---

## 2. Architecture technique

### Pattern multi-tenant

Toutes les tables incluent une colonne `organization_id` pour l'isolation des donnees. Les Row Level Security (RLS) policies garantissent que les utilisateurs ne peuvent acceder qu'aux donnees de leur organisation.

### Schemas PostgreSQL

L'application utilise 8 schemas distincts :

| Schema | Description |
|--------|-------------|
| `public` | Infrastructure de base (organizations, users, sessions) |
| `crm` | Contacts, entreprises, deals, activites |
| `invoice` | Clients, produits, devis, factures, paiements |
| `projects` | Projets, taches, temps, membres |
| `tickets` | Tickets, messages, SLA, base de connaissances |
| `hr` | Employes, contrats, conges, pointage |
| `docs` | Dossiers, fichiers, versions, partages |
| `analytics` | Dashboards, widgets, objectifs, rapports |

### Flux de donnees

```
Frontend (React)
    ↓ TanStack Query
Package Hooks (useContacts, useInvoices, etc.)
    ↓ Appel fonction serveur
Package Server Functions (getContacts, createInvoice, etc.)
    ↓ Supabase Client
Supabase (PostgreSQL + RLS)
```

---

## 3. Structure des packages

### Package: @sedona/database

Configuration Supabase et migrations SQL.

**Fichiers cles:**
- `supabase/config.toml` - Configuration Supabase CLI
- `supabase/migrations/` - 22 fichiers de migration SQL
- `src/index.ts` - Export du client Supabase

**Configuration exposee (config.toml):**
```toml
project_id = "sedona-crm"
schemas = ["public", "graphql_public", "hr", "docs"]
extra_search_path = ["public", "extensions", "hr", "docs"]
```

### Package: @sedona/auth

Gestion de l'authentification et des organisations.

**Exports:**
- Types: `AuthUser`, `AuthSession`, `Organization`, `OrganizationMember`
- Hooks: `useSession`, `useAuth`, `useOrganization`, `useSignIn`, `useSignOut`

### Package: @sedona/crm

Gestion des contacts, entreprises et pipeline commercial.

**Exports:**
- Types: `Contact`, `Company`, `Deal`, `Pipeline`, `Activity`
- Hooks: `useContacts`, `useCompanies`, `useDeals`, `usePipelines`, `useActivities`
- Server: `getContacts`, `createContact`, `updateContact`, `deleteContact`, etc.

### Package: @sedona/invoice

Module de facturation complet.

**Exports:**
- Types: `InvoiceClient`, `Product`, `Quote`, `Invoice`, `Payment`
- Hooks: `useClients`, `useProducts`, `useQuotes`, `useInvoices`, `usePayments`
- Components: `ClientForm`, `ProductForm`, `InvoiceForm`, `QuoteForm`

### Package: @sedona/projects

Gestion de projets et taches.

**Exports:**
- Types: `Project`, `Task`, `TaskStatus`, `TimeEntry`, `ProjectMember`
- Hooks: `useProjects`, `useTasks`, `useTimeEntries`, `useProjectMembers`
- Features: Kanban, Gantt, Time tracking, Client portal

### Package: @sedona/tickets

Systeme de support client.

**Exports:**
- Types: `Ticket`, `TicketMessage`, `SlaPolicy`, `KbArticle`
- Hooks: `useTickets`, `useTicketMessages`, `useSlaPolices`, `useKbArticles`
- Features: SLA, Automations, Knowledge base

### Package: @sedona/hr

Gestion des ressources humaines.

**Exports:**
- Types: `Employee`, `Contract`, `LeaveRequest`, `Interview`, `Badge`
- Hooks: `useEmployees`, `useContracts`, `useLeaveRequests`, `useBadges`
- Features: Pointage, Conges, Entretiens, Alertes

### Package: @sedona/docs

Gestion documentaire.

**Exports:**
- Types: `Folder`, `DocFile`, `FileVersion`, `ExternalShare`
- Hooks: `useFolders`, `useFiles`, `useFavorites`, `useActivity`
- Features: Versions, Partage externe, Preview

### Package: @sedona/analytics

Tableaux de bord et reporting.

**Exports:**
- Types: `Dashboard`, `Widget`, `Goal`, `ScheduledReport`
- Hooks: `useDashboards`, `useWidgets`, `useGoals`, `useKPIData`, `useWeeklyActivity`
- Server: `getDashboardStats`, `getRecentActivity`, `getKPIData`

---

## 4. Base de donnees

### Tables principales par schema

#### Schema PUBLIC

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `organizations` | Organisations/tenants | id, name, slug, siret, subscription_plan |
| `users` | Utilisateurs | id, email, name, locale, timezone |
| `organization_members` | Membres d'organisation | organization_id, user_id, role |
| `sessions` | Sessions utilisateurs | user_id, token, expires_at |
| `user_preferences` | Preferences utilisateur | theme, language, notifications |
| `invitations` | Invitations en attente | email, role, token, status |
| `api_keys` | Cles API | key_hash, scopes, rate_limit |
| `audit_logs` | Journal d'audit RGPD | action, entity_type, old_data, new_data |

#### Schema CRM

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `crm.contacts` | Contacts | first_name, last_name, email, company_id |
| `crm.companies` | Entreprises | name, siret, industry, size |
| `crm.pipelines` | Pipelines de vente | name, is_default |
| `crm.pipeline_stages` | Etapes du pipeline | name, position, probability |
| `crm.deals` | Affaires/Opportunites | name, amount, stage_id, status |
| `crm.activities` | Activites | type, subject, contact_id, deal_id |
| `crm.tags` | Tags | name, color |
| `crm.custom_field_definitions` | Champs personnalises | entity_type, field_type, options |

#### Schema INVOICE

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `invoice.clients` | Clients de facturation | name, siret, billing_address, payment_terms |
| `invoice.products` | Produits/Services | name, unit_price, vat_rate, type |
| `invoice.quotes` | Devis | quote_number, status, total, valid_until |
| `invoice.invoices` | Factures | invoice_number, status, total, due_date |
| `invoice.line_items` | Lignes de document | document_id, quantity, unit_price, vat_rate |
| `invoice.payments` | Paiements | invoice_id, amount, payment_date |
| `invoice.credit_notes` | Avoirs | invoice_id, total, reason |
| `invoice.recurring_templates` | Factures recurrentes | frequency, next_invoice_date |
| `invoice.organization_settings` | Parametres facturation | company_info, bank_details, templates |

#### Schema PROJECTS

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `projects.projects` | Projets | name, status, budget_amount, deal_id |
| `projects.project_members` | Membres du projet | user_id, role, permissions |
| `projects.task_statuses` | Statuts des taches | name, position, is_completed |
| `projects.tasks` | Taches | title, status_id, priority, due_date |
| `projects.task_assignees` | Assignations | task_id, user_id |
| `projects.task_dependencies` | Dependances | task_id, depends_on_task_id |
| `projects.time_entries` | Temps passe | task_id, duration_minutes, is_billable |
| `projects.labels` | Labels | name, color |

#### Schema TICKETS

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `tickets.tickets` | Tickets | ticket_number, subject, status, priority |
| `tickets.messages` | Messages | ticket_id, content, author_type |
| `tickets.categories` | Categories | name, parent_id |
| `tickets.sla_policies` | Politiques SLA | response_time, resolution_time |
| `tickets.kb_articles` | Articles KB | title, content, status |
| `tickets.kb_categories` | Categories KB | name, position |
| `tickets.canned_responses` | Reponses types | name, content, shortcut |
| `tickets.automation_rules` | Regles d'automatisation | trigger_type, conditions, actions |

#### Schema HR

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `hr.employees` | Employes | first_name, last_name, contract_type, status |
| `hr.contracts` | Contrats | employee_id, start_date, salary |
| `hr.leave_types` | Types de conges | name, code, is_paid |
| `hr.leave_requests` | Demandes de conges | employee_id, start_date, status |
| `hr.absences` | Absences | employee_id, leave_type_id, days_count |
| `hr.interviews` | Entretiens | employee_id, type, scheduled_date |
| `hr.time_entries` | Temps de travail | employee_id, date, hours_worked |
| `hr.badges` | Pointages | employee_id, badge_type, badge_time |
| `hr.settings` | Parametres RH | leave_days, work_hours, time_tracking |

#### Schema DOCS

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `docs.folders` | Dossiers | name, parent_id, path, depth |
| `docs.files` | Fichiers | name, extension, size_bytes, folder_id |
| `docs.file_versions` | Versions | file_id, version_number, storage_path |
| `docs.file_thumbnails` | Miniatures | file_id, size, storage_path |
| `docs.external_shares` | Partages externes | share_token, expires_at, password_hash |
| `docs.comments` | Commentaires | file_id, content, parent_id |
| `docs.favorites` | Favoris | user_id, file_id/folder_id |
| `docs.activity_log` | Journal d'activite | action, file_id, user_id |
| `docs.settings` | Parametres | max_storage_bytes, allowed_extensions |

#### Schema ANALYTICS

| Table | Description | Colonnes cles |
|-------|-------------|---------------|
| `analytics.dashboards` | Tableaux de bord | name, layout, is_default |
| `analytics.widgets` | Widgets | dashboard_id, widget_type, metric_key |
| `analytics.goals` | Objectifs | name, metric_key, target_value, period |
| `analytics.goal_progress` | Progression objectifs | goal_id, recorded_at, value |
| `analytics.scheduled_reports` | Rapports planifies | frequency, recipients, format |
| `analytics.report_history` | Historique rapports | generated_at, file_url, status |
| `analytics.metrics_cache` | Cache metriques | metric_key, value, expires_at |

### Relations principales

```
organizations (1) ←→ (N) organization_members ←→ (1) users
organizations (1) ←→ (N) [toutes les tables de chaque schema]

crm.contacts (N) ←→ (1) crm.companies
crm.deals (N) ←→ (1) crm.pipeline_stages ←→ (1) crm.pipelines
crm.deals (N) ←→ (1) crm.contacts
crm.deals (N) ←→ (1) crm.companies

invoice.invoices (N) ←→ (1) invoice.clients
invoice.invoices (1) ←→ (N) invoice.line_items ←→ (N) invoice.products
invoice.invoices (1) ←→ (N) invoice.payments
invoice.quotes → invoice.invoices (conversion)

projects.projects (1) ←→ (N) projects.tasks
projects.tasks (1) ←→ (N) projects.task_assignees ←→ users
projects.tasks (N) ←→ (1) projects.task_statuses
projects.projects ←→ crm.deals (lien optionnel)

tickets.tickets (1) ←→ (N) tickets.messages
tickets.tickets (N) ←→ (1) tickets.categories
tickets.tickets ←→ crm.contacts (lien optionnel)

hr.employees (1) ←→ (N) hr.contracts
hr.employees (1) ←→ (N) hr.leave_requests
hr.employees (1) ←→ (N) hr.badges
hr.employees ←→ users (lien optionnel pour self-service)

docs.folders (1) ←→ (N) docs.files
docs.files (1) ←→ (N) docs.file_versions
docs.files ←→ [any entity] (lien polymorphe via linked_entity_type/id)
```

### Triggers et fonctions

| Fonction | Description |
|----------|-------------|
| `trigger_set_updated_at()` | Met a jour automatiquement updated_at |
| `invoice.get_next_number()` | Genere le prochain numero de facture |
| `invoice.calculate_line_totals()` | Calcule les totaux des lignes |
| `tickets.get_next_ticket_number()` | Genere le prochain numero de ticket |
| `tickets.update_ticket_on_message()` | Met a jour le ticket lors d'un message |
| `hr.calculate_leave_days()` | Calcule le nombre de jours de conge |
| `docs.update_folder_stats()` | Met a jour les stats des dossiers |

---

## 5. Modules fonctionnels

### CRM - Gestion de la relation client

**Fonctionnalites:**
- Gestion des contacts avec champs personnalises
- Gestion des entreprises
- Pipeline de vente avec Kanban
- Suivi des activites (appels, emails, reunions, taches)
- Tags et segmentation
- Import/Export

**Entites principales:**
- Contact → Entreprise (N:1)
- Deal → Pipeline Stage → Pipeline
- Activite → Contact/Entreprise/Deal

### Facturation

**Fonctionnalites:**
- Gestion des clients de facturation
- Catalogue produits/services
- Creation de devis avec conversion en facture
- Facturation avec suivi des paiements
- Avoirs
- Factures recurrentes
- Numerotation automatique configurable
- Templates email personnalisables

**Workflow devis:**
```
Brouillon → Envoye → Accepte/Rejete/Expire → Converti en facture
```

**Workflow facture:**
```
Brouillon → Envoyee → Payee/Partiellement payee/En retard → Annulee
```

### Projets

**Fonctionnalites:**
- Creation et gestion de projets
- Taches avec sous-taches
- Statuts personnalisables par projet
- Vue liste, Kanban, Gantt (PRO)
- Time tracking (PRO)
- Dependances entre taches
- Membres avec roles et permissions
- Portail client externe
- Commentaires et pieces jointes

**Roles projet:**
- Owner : Tous les droits
- Manager : Gestion complete sauf suppression projet
- Member : CRUD sur taches assignees
- Viewer : Lecture seule

### Tickets / Support

**Fonctionnalites:**
- Creation de tickets multi-canal (web, email, API)
- Assignation et workflow
- SLA avec alertes
- Categories hierarchiques
- Base de connaissances
- Reponses predefinies
- Automatisations (PRO)
- Satisfaction client

**Statuts ticket:**
```
Ouvert → En cours → En attente → Resolu → Ferme
```

### Ressources Humaines

**Fonctionnalites:**
- Fiche employe complete
- Gestion des contrats
- Demandes de conges avec workflow d'approbation
- Entretiens periodiques
- Documents RH
- Pointage/Badgeuse (PRO)
- Alertes (fin periode essai, fin contrat, etc.)
- Rapports

**Types de contrat:** CDI, CDD, Stage, Alternance, Freelance, Interim

**Types de conge:** CP, RTT, Maladie, Sans solde, Maternite, Paternite, Autre

### Documents

**Fonctionnalites:**
- Arborescence de dossiers
- Upload multi-fichiers
- Versioning des fichiers
- Preview des documents
- Partage externe avec lien securise
- Commentaires sur fichiers
- Favoris
- Corbeille avec restauration
- Recherche full-text

**Types de fichiers supportes:**
Document, Tableur, Presentation, PDF, Image, Video, Audio, Archive

### Analytics

**Fonctionnalites:**
- Tableau de bord principal avec KPIs temps reel
- Dashboards personnalisables
- Widgets configurables (KPI, graphiques, tableaux)
- Objectifs avec suivi de progression
- Rapports planifies (PRO)
- Export PDF/CSV/Excel

**Sources de metriques:**
- CRM : Contacts, entreprises, deals, activites
- Facturation : Revenus, factures, devis
- Projets : Projets, taches, temps
- Tickets : Tickets, resolution, satisfaction
- RH : Employes, conges, absences
- Documents : Fichiers, stockage

---

## 6. Systeme d'authentification

### Roles utilisateur

| Role | Description | Permissions |
|------|-------------|-------------|
| `owner` | Proprietaire de l'organisation | Tous les droits, gestion organisation |
| `admin` | Administrateur | Gestion des membres, parametres |
| `member` | Membre standard | Acces aux fonctionnalites de base |

### Flow d'authentification

```
1. Connexion (email + password)
   ↓
2. Verification credentials
   ↓
3. Creation session + token
   ↓
4. Redirection vers /dashboard
   ↓
5. Selection organisation (si multiple)
```

### Hooks d'authentification

```typescript
// Session courante
const { data: session, isLoading } = useSession()

// Etat authentification
const { user, isAuthenticated, isLoading } = useAuth()

// Organisation courante
const { organization, role, isLoading } = useOrganization()

// Actions
const { signIn } = useSignIn()
const { signOut } = useSignOut()
const { signUp } = useSignUp()
```

### Securite

- Mots de passe hashes (Supabase Auth)
- Sessions avec expiration
- Row Level Security sur toutes les tables
- Tokens de verification email
- Support 2FA (a implementer)

---

## 7. Routes et navigation

### Routes publiques

| Route | Description |
|-------|-------------|
| `/` | Redirection vers dashboard ou login |
| `/login` | Page de connexion |
| `/signup` | Page d'inscription |
| `/forgot-password` | Demande de reinitialisation |
| `/reset-password` | Reinitialisation du mot de passe |
| `/verify-email` | Verification email |
| `/client-portal` | Portail client externe |

### Routes protegees

```
/_authenticated/
├── dashboard                    # Tableau de bord principal
│
├── crm/
│   ├── contacts/               # Liste contacts
│   │   ├── new                 # Nouveau contact
│   │   └── $contactId          # Detail contact
│   ├── companies/              # Liste entreprises
│   │   ├── new
│   │   └── $companyId
│   ├── pipeline/               # Vue pipeline
│   └── activities/             # Journal activites
│
├── invoices/
│   ├── (index)                 # Liste factures
│   ├── new                     # Nouvelle facture
│   ├── $invoiceId              # Detail facture
│   ├── quotes/                 # Devis
│   ├── clients/                # Clients
│   ├── products/               # Produits
│   └── settings/               # Parametres
│
├── projects/
│   ├── (index)                 # Liste projets
│   ├── new                     # Nouveau projet
│   ├── $projectId              # Detail projet
│   ├── kanban/                 # Vue Kanban (PRO)
│   ├── gantt/                  # Vue Gantt (PRO)
│   └── time/                   # Time tracking (PRO)
│
├── tickets/
│   ├── (index)                 # Tous les tickets
│   ├── new                     # Nouveau ticket
│   ├── $ticketId               # Detail ticket
│   ├── inbox/                  # Boite de reception
│   ├── stats/                  # Statistiques
│   ├── knowledge-base/         # Base de connaissances (PRO)
│   ├── automations/            # Automatisations (PRO)
│   └── settings/               # Parametres
│
├── docs/
│   ├── (index)                 # Fichiers
│   ├── folder/$folderId        # Dossier
│   ├── file/$fileId            # Fichier
│   ├── recent/                 # Recents
│   ├── favorites/              # Favoris
│   ├── trash/                  # Corbeille
│   ├── activity/               # Activite
│   └── settings/               # Parametres
│
├── hr/
│   ├── (index)                 # Employes
│   ├── employees/new           # Nouvel employe
│   ├── employees/$employeeId   # Fiche employe
│   ├── leaves/                 # Conges
│   ├── interviews/             # Entretiens
│   ├── time-tracking/          # Pointage (PRO)
│   ├── reports/                # Rapports
│   ├── alerts/                 # Alertes (PRO)
│   └── settings/               # Parametres
│
├── analytics/
│   ├── (index)                 # Dashboard principal
│   ├── dashboards/             # Mes dashboards
│   ├── dashboard/$dashboardId  # Dashboard personnalise
│   ├── goals/                  # Objectifs
│   ├── reports/                # Rapports (PRO)
│   └── settings/               # Parametres
│
└── settings/
    ├── profile/                # Profil utilisateur
    ├── preferences/            # Preferences
    ├── security/               # Securite
    ├── organization/           # Organisation (Admin)
    ├── team/                   # Equipe (Admin)
    ├── billing/                # Abonnement
    └── data/                   # Donnees/RGPD (Admin)
```

### Structure de layout

```
__root.tsx                      # Layout racine (Toaster)
└── _authenticated.tsx          # Layout authentifie (Sidebar + Header)
    ├── crm.tsx                 # Layout CRM (tabs)
    ├── projects.tsx            # Layout Projets (tabs)
    ├── invoices.tsx            # Layout Facturation (tabs)
    ├── tickets.tsx             # Layout Tickets (tabs)
    ├── docs.tsx                # Layout Documents (tabs)
    ├── hr.tsx                  # Layout RH (tabs)
    ├── analytics.tsx           # Layout Analytics (tabs)
    └── settings.tsx            # Layout Parametres (sidebar)
```

---

## 8. Types TypeScript

### Types partages

```typescript
// Pagination
interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

### Types par module

#### CRM
```typescript
interface Contact {
  id: string
  organizationId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  companyId: string | null
  company: Company | null
  source: 'website' | 'referral' | 'linkedin' | 'manual' | null
  tags: string[]
  customFields: Record<string, unknown>
  ownerId: string | null
  createdAt: string
  updatedAt: string
}

interface Deal {
  id: string
  organizationId: string
  pipelineId: string
  stageId: string
  name: string
  amount: number
  currency: string
  probability: number
  status: 'open' | 'won' | 'lost'
  contactId: string | null
  companyId: string | null
  expectedCloseDate: string | null
  ownerId: string | null
}
```

#### Facturation
```typescript
interface Invoice {
  id: string
  organizationId: string
  clientId: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string | null
  subtotal: number
  discountAmount: number
  discountPercent: number
  vatAmount: number
  total: number
  amountPaid: number
  amountDue: number
  currency: string
  lineItems: LineItem[]
}

interface LineItem {
  id: string
  documentType: 'quote' | 'invoice' | 'credit_note'
  documentId: string
  productId: string | null
  description: string
  quantity: number
  unit: string
  unitPrice: number
  vatRate: number
  lineTotal: number
}
```

#### Projets
```typescript
interface Project {
  id: string
  organizationId: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  startDate: string | null
  dueDate: string | null
  budgetAmount: number | null
  budgetCurrency: string
  dealId: string | null
  clientId: string | null
  allowTimeTracking: boolean
}

interface Task {
  id: string
  projectId: string
  parentTaskId: string | null
  title: string
  description: string | null
  statusId: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: string | null
  dueDate: string | null
  estimatedHours: number | null
  completedAt: string | null
}
```

#### Tickets
```typescript
interface Ticket {
  id: string
  organizationId: string
  ticketNumber: string
  subject: string
  description: string | null
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assignedTo: string | null
  categoryId: string | null
  slaPolicyId: string | null
  source: 'web' | 'email' | 'api' | 'phone' | 'chat'
  requesterName: string | null
  requesterEmail: string | null
  satisfactionRating: number | null
}
```

#### RH
```typescript
interface Employee {
  id: string
  organizationId: string
  userId: string | null
  firstName: string
  lastName: string
  email: string
  employeeNumber: string
  jobTitle: string | null
  department: string | null
  managerId: string | null
  contractType: 'cdi' | 'cdd' | 'stage' | 'alternance' | 'freelance' | 'interim'
  status: 'active' | 'trial_period' | 'notice_period' | 'left'
  annualLeaveBalance: number
  rttBalance: number
}
```

---

## 9. Hooks et Server Functions

### Pattern standard

Chaque module suit le meme pattern :

```typescript
// Server function (packages/[module]/src/server/[entity].ts)
export async function getEntities(
  organizationId: string,
  filters?: EntityFilters,
  pagination?: PaginationParams
): Promise<PaginatedResult<Entity>> {
  const client = getSupabaseClient()
  // ... query construction
  return { data, total, page, pageSize, totalPages }
}

// Hook (packages/[module]/src/hooks/use[Entity].ts)
export function useEntities(
  organizationId: string,
  filters?: EntityFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: entityKeys.list(organizationId, filters, pagination),
    queryFn: () => getEntities(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// Mutation hook
export function useCreateEntity(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEntityInput) => createEntity(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.lists() })
    },
  })
}
```

### Liste des hooks par module

| Module | Hooks principaux |
|--------|-----------------|
| CRM | `useContacts`, `useCompanies`, `useDeals`, `usePipelines`, `useActivities` |
| Invoice | `useClients`, `useProducts`, `useQuotes`, `useInvoices`, `usePayments` |
| Projects | `useProjects`, `useTasks`, `useTimeEntries`, `useProjectMembers` |
| Tickets | `useTickets`, `useTicketMessages`, `useSlaPolices`, `useCategories` |
| HR | `useEmployees`, `useContracts`, `useLeaveRequests`, `useBadges` |
| Docs | `useFolders`, `useFiles`, `useFavorites`, `useActivity` |
| Analytics | `useDashboards`, `useWidgets`, `useGoals`, `useKPIData` |

---

## 10. Plans et limites

### Comparaison des plans

| Fonctionnalite | FREE | PRO | ENTERPRISE |
|----------------|------|-----|------------|
| **Contacts** | 500 | Illimite | Illimite |
| **Utilisateurs** | 3 | 20 | Illimite |
| **Projets** | 3 | 50 | Illimite |
| **Stockage** | 1 Go | 50 Go | 500 Go |
| Kanban/Gantt | - | ✓ | ✓ |
| Time tracking | - | ✓ | ✓ |
| Automatisations | - | ✓ | ✓ |
| Base de connaissances | - | ✓ | ✓ |
| Rapports planifies | - | ✓ | ✓ |
| API Access | - | ✓ | ✓ |
| Support prioritaire | - | - | ✓ |
| SSO/SAML | - | - | ✓ |

### Limites Analytics

| Limite | FREE | PRO |
|--------|------|-----|
| Dashboards | 1 | 10 |
| Widgets/dashboard | 6 | 20 |
| Objectifs | 3 | 50 |
| Rapports planifies | Non | Oui |
| Retention donnees | 90 jours | 365 jours |
| Export | PDF | PDF, CSV, Excel |

### Limites Projets

| Limite | FREE | PRO |
|--------|------|-----|
| Projets | 3 | 50 |
| Membres/projet | 3 | 20 |
| Stockage | 1 Go | 50 Go |
| Gantt | Non | Oui |
| Time tracking | Non | Oui |
| Portail client | 1 | Illimite |

---

## Annexes

### Comptes de test (developpement)

| Email | Password | Role | Plan |
|-------|----------|------|------|
| owner.free@test.sedona.ai | Owner123! | Owner | FREE |
| owner.pro@test.sedona.ai | Owner123! | Owner | PRO |
| admin.pro@test.sedona.ai | Admin123! | Admin | PRO |
| member.pro@test.sedona.ai | Member123! | Member | PRO |

### Configuration Supabase

```toml
# config.toml
project_id = "sedona-crm"

[api]
schemas = ["public", "graphql_public", "hr", "docs"]
extra_search_path = ["public", "extensions", "hr", "docs"]
max_rows = 1000

[storage]
file_size_limit = "50MiB"
```

### Commandes utiles

```bash
# Demarrer Supabase local
cd packages/database && supabase start

# Appliquer les migrations
supabase db push

# Generer les types TypeScript
supabase gen types typescript --local > src/types/database.types.ts

# Reset base de donnees
supabase db reset
```

---

## Notes importantes

1. **Multi-tenancy** : Toutes les requetes doivent inclure `organization_id`
2. **RLS** : Ne jamais desactiver les Row Level Security policies
3. **Soft delete** : Utiliser `deleted_at` au lieu de DELETE
4. **Audit** : Les actions critiques sont loguees dans `audit_logs`
5. **Schemas** : Les schemas `hr` et `docs` doivent etre exposes dans config.toml

---

*Document genere automatiquement - Fevrier 2026*
