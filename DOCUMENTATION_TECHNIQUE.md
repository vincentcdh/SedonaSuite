# Sedona CRM - Documentation Technique Exhaustive

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Modules fonctionnels](#4-modules-fonctionnels)
5. [Base de données](#5-base-de-données)
6. [Authentification et autorisation](#6-authentification-et-autorisation)
7. [API et fonctions serveur](#7-api-et-fonctions-serveur)
8. [Interface utilisateur](#8-interface-utilisateur)
9. [Sécurité](#9-sécurité)
10. [Configuration et déploiement](#10-configuration-et-déploiement)

---

## 1. Vue d'ensemble

### Description

Sedona CRM est une application SaaS multi-tenant de gestion d'entreprise complète, développée en TypeScript avec une architecture monorepo. Elle offre des fonctionnalités de :

- **CRM** : Gestion des contacts et entreprises
- **Facturation** : Devis, factures, paiements
- **RH** : Gestion des employés, congés, présences
- **Projets** : Suivi de projets et tâches
- **Tickets** : Support et gestion des incidents
- **Documents** : Stockage et partage de fichiers
- **Analytiques** : Tableaux de bord et rapports

### Architecture multi-tenant

Chaque organisation (entreprise cliente) dispose de ses propres données, totalement isolées des autres grâce aux politiques RLS (Row Level Security) de PostgreSQL.

---

## 2. Stack technique

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19.x | Framework UI |
| TypeScript | 5.x | Typage statique |
| TanStack Router | 1.x | Routage type-safe |
| TanStack Query | 5.x | Gestion d'état serveur |
| Tailwind CSS | 4.x | Styling |
| Radix UI | - | Composants accessibles |
| Lucide React | - | Icônes |
| React Hook Form | - | Formulaires |
| Zod | - | Validation de schémas |
| Recharts | - | Graphiques |

### Backend

| Technologie | Usage |
|-------------|-------|
| Supabase | BaaS (Backend as a Service) |
| PostgreSQL | Base de données |
| Supabase Auth | Authentification |
| Supabase Storage | Stockage de fichiers |
| Supabase Realtime | Temps réel (optionnel) |

### Build et outils

| Outil | Usage |
|-------|-------|
| pnpm | Gestionnaire de paquets |
| Vite | Bundler et dev server |
| Turborepo | Orchestration monorepo |
| ESLint | Linting |
| Prettier | Formatage |

---

## 3. Architecture du projet

### Structure monorepo

```
sedona-crm/
├── apps/
│   └── web/                    # Application web principale
│       ├── src/
│       │   ├── components/     # Composants spécifiques à l'app
│       │   ├── lib/            # Utilitaires (auth, audit, etc.)
│       │   ├── routes/         # Pages TanStack Router
│       │   └── styles/         # CSS global
│       └── public/             # Assets statiques
│
├── packages/
│   ├── analytics/              # Module analytiques
│   ├── auth/                   # Authentification partagée
│   ├── crm/                    # Module CRM
│   ├── database/               # Client Supabase et migrations
│   ├── docs/                   # Module documents
│   ├── hr/                     # Module RH
│   ├── invoice/                # Module facturation
│   ├── projects/               # Module projets
│   ├── tickets/                # Module tickets
│   └── ui/                     # Bibliothèque de composants UI
│
└── turbo.json                  # Configuration Turborepo
```

### Convention de nommage des packages

Chaque package suit le pattern `@sedona/<module>` :
- `@sedona/ui` - Composants UI partagés
- `@sedona/crm` - Module CRM
- `@sedona/invoice` - Module facturation
- `@sedona/hr` - Module RH
- etc.

### Structure type d'un module

```
packages/<module>/
├── src/
│   ├── components/     # Composants React du module
│   ├── hooks/          # React Query hooks
│   ├── server/         # Fonctions côté serveur (Supabase)
│   ├── types/          # Types TypeScript
│   └── index.ts        # Exports publics
├── package.json
└── tsconfig.json
```

---

## 4. Modules fonctionnels

### 4.1 Module CRM (`@sedona/crm`)

#### Fonctionnalités

- **Contacts** : Création, modification, suppression de contacts
- **Entreprises** : Gestion des sociétés clientes/prospects
- **Tags** : Catégorisation par étiquettes
- **Recherche** : Filtrage avancé
- **Export** : Téléchargement CSV

#### Tables principales

| Table | Description |
|-------|-------------|
| `crm_contacts` | Contacts individuels |
| `crm_companies` | Entreprises |
| `crm_tags` | Étiquettes |
| `crm_contact_tags` | Relation contacts-tags |
| `crm_company_tags` | Relation entreprises-tags |

#### Hooks disponibles

```typescript
// Contacts
useContacts(orgId, filters, pagination)
useContact(orgId, contactId)
useCreateContact(orgId)
useUpdateContact(orgId)
useDeleteContact(orgId)

// Entreprises
useCompanies(orgId, filters, pagination)
useCompany(orgId, companyId)
useCreateCompany(orgId)
useUpdateCompany(orgId)
useDeleteCompany(orgId)

// Tags
useTags(orgId)
useCreateTag(orgId)
useDeleteTag(orgId)
```

#### Composants

| Composant | Description |
|-----------|-------------|
| `ContactForm` | Formulaire de contact |
| `CompanyForm` | Formulaire d'entreprise |
| `ContactsTable` | Liste des contacts |
| `CompaniesTable` | Liste des entreprises |

---

### 4.2 Module Facturation (`@sedona/invoice`)

#### Fonctionnalités

- **Clients** : Base clients de facturation (liée au CRM)
- **Produits** : Catalogue de produits/services
- **Devis** : Création et envoi de devis
- **Factures** : Facturation avec calcul TVA
- **Paiements** : Suivi des encaissements
- **PDF** : Génération de documents PDF

#### Tables principales

| Table | Description |
|-------|-------------|
| `invoice_clients` | Clients de facturation |
| `invoice_products` | Produits/services |
| `invoice_product_categories` | Catégories de produits |
| `invoices` | Factures |
| `invoice_line_items` | Lignes de facture |
| `quotes` | Devis |
| `quote_line_items` | Lignes de devis |
| `payments` | Paiements |
| `invoice_settings` | Paramètres de facturation |
| `vat_rates` | Taux de TVA |
| `number_sequences` | Séquences de numérotation |

#### Statuts des factures

```typescript
type InvoiceStatus =
  | 'draft'      // Brouillon
  | 'sent'       // Envoyée
  | 'viewed'     // Vue par le client
  | 'paid'       // Payée
  | 'partial'    // Partiellement payée
  | 'overdue'    // En retard
  | 'cancelled'  // Annulée
```

#### Statuts des devis

```typescript
type QuoteStatus =
  | 'draft'      // Brouillon
  | 'sent'       // Envoyé
  | 'viewed'     // Vu par le client
  | 'accepted'   // Accepté
  | 'rejected'   // Refusé
  | 'expired'    // Expiré
  | 'converted'  // Converti en facture
```

#### Hooks disponibles

```typescript
// Clients
useClients(orgId)
useClient(orgId, clientId)
useCreateClient(orgId)
useUpdateClient(orgId)
useDeleteClient(orgId)

// Produits
useProducts(orgId, filters)
useProduct(orgId, productId)
useProductCategories(orgId)
useCreateProduct(orgId)
useUpdateProduct(orgId)
useDeleteProduct(orgId)

// Factures
useInvoices(orgId, filters)
useInvoice(orgId, invoiceId)
useCreateInvoice(orgId)
useUpdateInvoice(orgId)
useDeleteInvoice(orgId)
useSendInvoice(orgId)
useMarkInvoiceAsPaid(orgId)
useAddInvoiceLineItem(orgId)
useDeleteInvoiceLineItem(orgId)

// Devis
useQuotes(orgId, filters)
useQuote(orgId, quoteId)
useCreateQuote(orgId)
useUpdateQuote(orgId)
useDeleteQuote(orgId)
useSendQuote(orgId)
useAcceptQuote(orgId)
useRejectQuote(orgId)
useConvertQuoteToInvoice(orgId)

// Paiements
usePayments(orgId)
usePaymentsByInvoice(orgId, invoiceId)
useCreatePayment(orgId)

// Paramètres
useInvoiceSettings(orgId)
useUpdateInvoiceSettings(orgId)
useVatRates(orgId)
useNumberSequences(orgId)
```

#### Composants

| Composant | Description |
|-----------|-------------|
| `InvoiceForm` | Formulaire de facture |
| `QuoteForm` | Formulaire de devis |
| `ClientForm` | Formulaire client |
| `ProductForm` | Formulaire produit |
| `ClientSelector` | Sélecteur de client avec recherche |
| `ProductSelector` | Sélecteur de produit |
| `LineItemsEditor` | Éditeur de lignes |
| `TotalsDisplay` | Affichage des totaux |
| `AddressFields` | Champs d'adresse |

---

### 4.3 Module RH (`@sedona/hr`)

#### Fonctionnalités

- **Employés** : Fiche employé complète
- **Départements** : Structure organisationnelle
- **Congés** : Demandes et validation
- **Présences** : Pointage (check-in/check-out)
- **Contrats** : Types et documents contractuels

#### Tables principales

| Table | Description |
|-------|-------------|
| `hr_employees` | Employés |
| `hr_departments` | Départements |
| `hr_leave_requests` | Demandes de congés |
| `hr_leave_balances` | Soldes de congés |
| `hr_attendance` | Présences |
| `hr_contract_types` | Types de contrats |

#### Types de congés

```typescript
type LeaveType =
  | 'paid'         // Congés payés
  | 'unpaid'       // Sans solde
  | 'sick'         // Maladie
  | 'maternity'    // Maternité
  | 'paternity'    // Paternité
  | 'other'        // Autre
```

#### Statuts des demandes de congés

```typescript
type LeaveRequestStatus =
  | 'pending'   // En attente
  | 'approved'  // Approuvée
  | 'rejected'  // Refusée
  | 'cancelled' // Annulée
```

#### Hooks disponibles

```typescript
// Employés
useEmployees(orgId, filters, pagination)
useEmployee(orgId, employeeId)
useCreateEmployee(orgId)
useUpdateEmployee(orgId)
useDeleteEmployee(orgId)

// Départements
useDepartments(orgId)
useDepartment(orgId, deptId)
useCreateDepartment(orgId)
useUpdateDepartment(orgId)
useDeleteDepartment(orgId)

// Congés
useLeaveRequests(orgId, filters)
useLeaveRequest(orgId, requestId)
useCreateLeaveRequest(orgId)
useApproveLeaveRequest(orgId)
useRejectLeaveRequest(orgId)
useLeaveBalances(orgId, employeeId)

// Présences
useAttendanceRecords(orgId, filters)
useCheckIn(orgId)
useCheckOut(orgId)
```

---

### 4.4 Module Projets (`@sedona/projects`)

#### Fonctionnalités

- **Projets** : Création et suivi de projets
- **Tâches** : Gestion des tâches avec assignation
- **Commentaires** : Discussions sur les tâches
- **Pièces jointes** : Fichiers liés aux tâches
- **Vue Kanban** : Tableau de bord visuel
- **Calendrier** : Vue calendrier des échéances

#### Tables principales

| Table | Description |
|-------|-------------|
| `projects` | Projets |
| `project_members` | Membres du projet |
| `tasks` | Tâches |
| `task_comments` | Commentaires |
| `task_attachments` | Pièces jointes |
| `task_labels` | Étiquettes de tâches |

#### Statuts des projets

```typescript
type ProjectStatus =
  | 'planning'    // En planification
  | 'active'      // Actif
  | 'on_hold'     // En pause
  | 'completed'   // Terminé
  | 'cancelled'   // Annulé
```

#### Statuts des tâches

```typescript
type TaskStatus =
  | 'todo'        // À faire
  | 'in_progress' // En cours
  | 'review'      // En revue
  | 'done'        // Terminée
  | 'blocked'     // Bloquée
```

#### Priorités

```typescript
type Priority =
  | 'low'      // Basse
  | 'medium'   // Moyenne
  | 'high'     // Haute
  | 'urgent'   // Urgente
```

#### Hooks disponibles

```typescript
// Projets
useProjects(orgId, filters)
useProject(orgId, projectId)
useCreateProject(orgId)
useUpdateProject(orgId)
useDeleteProject(orgId)
useProjectMembers(orgId, projectId)
useAddProjectMember(orgId)
useRemoveProjectMember(orgId)

// Tâches
useTasks(orgId, projectId, filters)
useTask(orgId, taskId)
useCreateTask(orgId)
useUpdateTask(orgId)
useDeleteTask(orgId)
useMoveTask(orgId)

// Commentaires
useTaskComments(orgId, taskId)
useCreateTaskComment(orgId)
useDeleteTaskComment(orgId)
```

---

### 4.5 Module Tickets (`@sedona/tickets`)

#### Fonctionnalités

- **Tickets** : Création et suivi des demandes
- **Catégories** : Classification des tickets
- **Assignation** : Attribution aux agents
- **Commentaires** : Historique des échanges
- **SLA** : Suivi des temps de réponse

#### Tables principales

| Table | Description |
|-------|-------------|
| `tickets` | Tickets |
| `ticket_categories` | Catégories |
| `ticket_comments` | Commentaires |
| `ticket_attachments` | Pièces jointes |

#### Statuts des tickets

```typescript
type TicketStatus =
  | 'open'        // Ouvert
  | 'in_progress' // En cours
  | 'waiting'     // En attente client
  | 'resolved'    // Résolu
  | 'closed'      // Fermé
```

#### Hooks disponibles

```typescript
// Tickets
useTickets(orgId, filters)
useTicket(orgId, ticketId)
useCreateTicket(orgId)
useUpdateTicket(orgId)
useCloseTicket(orgId)
useAssignTicket(orgId)

// Catégories
useTicketCategories(orgId)
useCreateTicketCategory(orgId)

// Commentaires
useTicketComments(orgId, ticketId)
useCreateTicketComment(orgId)
```

---

### 4.6 Module Documents (`@sedona/docs`)

#### Fonctionnalités

- **Dossiers** : Organisation hiérarchique
- **Fichiers** : Upload et téléchargement
- **Partage** : Liens de partage
- **Versions** : Historique des versions
- **Recherche** : Recherche par nom

#### Tables principales

| Table | Description |
|-------|-------------|
| `doc_folders` | Dossiers |
| `doc_files` | Fichiers |
| `doc_shares` | Partages |

#### Hooks disponibles

```typescript
// Dossiers
useFolders(orgId, parentId)
useFolder(orgId, folderId)
useCreateFolder(orgId)
useRenameFolder(orgId)
useDeleteFolder(orgId)
useMoveFolder(orgId)

// Fichiers
useFiles(orgId, folderId)
useFile(orgId, fileId)
useUploadFile(orgId)
useDownloadFile(orgId)
useDeleteFile(orgId)
useMoveFile(orgId)

// Partage
useCreateShareLink(orgId)
useDeleteShareLink(orgId)
```

---

### 4.7 Module Analytiques (`@sedona/analytics`)

#### Fonctionnalités

- **Tableaux de bord** : Widgets personnalisables
- **Rapports** : Génération de rapports
- **KPIs** : Indicateurs clés de performance
- **Graphiques** : Visualisations diverses

#### Widgets disponibles

| Widget | Description |
|--------|-------------|
| `RevenueChart` | Chiffre d'affaires |
| `InvoiceStatusChart` | Répartition des statuts factures |
| `TopClientsChart` | Meilleurs clients |
| `MonthlyTrendChart` | Tendance mensuelle |
| `TasksOverviewWidget` | Vue d'ensemble des tâches |
| `LeaveRequestsWidget` | Demandes de congés |

#### Hooks disponibles

```typescript
useAnalyticsDashboard(orgId)
useRevenueStats(orgId, dateRange)
useInvoiceStats(orgId, dateRange)
useClientStats(orgId)
useProjectStats(orgId)
useHRStats(orgId)
```

---

## 5. Base de données

### 5.1 Schéma général

La base de données utilise PostgreSQL avec Supabase. Les tables sont organisées par préfixe de module :

| Préfixe | Module |
|---------|--------|
| `crm_` | CRM |
| `invoice_`, `invoices`, `quotes`, `payments` | Facturation |
| `hr_` | Ressources Humaines |
| `projects`, `tasks` | Projets |
| `tickets`, `ticket_` | Tickets |
| `doc_` | Documents |

### 5.2 Tables système

#### `organizations`

Table centrale représentant les entreprises clientes.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  siret TEXT,
  siren TEXT,
  vat_number TEXT,
  address JSONB DEFAULT '{}',
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES users(id),
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `users`

Utilisateurs de la plateforme.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `organization_members`

Relation utilisateur-organisation avec rôle.

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
```

### 5.3 Rôles utilisateur

```typescript
type OrganizationRole =
  | 'owner'   // Propriétaire - tous les droits
  | 'admin'   // Administrateur - gestion complète
  | 'member'  // Membre - lecture/écriture limitée
  | 'viewer'  // Lecture seule
```

### 5.4 Plans et limites

#### `organization_plan_limits`

```sql
CREATE TABLE organization_plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  plan TEXT NOT NULL DEFAULT 'free',
  max_users INTEGER DEFAULT 3,
  max_contacts INTEGER DEFAULT 100,
  max_companies INTEGER DEFAULT 50,
  max_invoices_per_month INTEGER DEFAULT 10,
  max_storage_mb INTEGER DEFAULT 100,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Plans disponibles

| Plan | Utilisateurs | Contacts | Entreprises | Factures/mois | Stockage |
|------|--------------|----------|-------------|---------------|----------|
| `free` | 3 | 100 | 50 | 10 | 100 Mo |
| `starter` | 10 | 1 000 | 500 | 100 | 1 Go |
| `pro` | 50 | 10 000 | 5 000 | 1 000 | 10 Go |
| `enterprise` | Illimité | Illimité | Illimité | Illimité | 100 Go |

### 5.5 Vues PostgreSQL

Pour simplifier les requêtes et les politiques RLS, des vues ont été créées :

```sql
-- Vue contacts CRM
CREATE VIEW crm_contacts AS
SELECT * FROM crm.contacts;

-- Vue entreprises CRM
CREATE VIEW crm_companies AS
SELECT * FROM crm.companies;

-- Vue employés HR
CREATE VIEW hr_employees AS
SELECT * FROM hr.employees;

-- etc.
```

### 5.6 Triggers et fonctions

#### Mise à jour automatique `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Création d'organisation avec propriétaire

```sql
CREATE OR REPLACE FUNCTION create_organization_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_industry TEXT DEFAULT NULL,
  ...
) RETURNS JSONB;
```

---

## 6. Authentification et autorisation

### 6.1 Supabase Auth

L'authentification utilise Supabase Auth avec support pour :
- Email/mot de passe
- Magic link (lien magique)
- OAuth (Google, GitHub, etc.) - configurable

### 6.2 Flux d'authentification

```
1. Utilisateur → /login
2. Saisie email/mot de passe
3. Appel supabase.auth.signInWithPassword()
4. Redirection → /dashboard
5. _authenticated.tsx vérifie la session
6. Chargement de l'organisation via useOrganization()
```

### 6.3 Hook `useOrganization()`

```typescript
interface OrganizationState {
  organization: Organization | null;  // Org active
  organizations: Organization[];       // Toutes les orgs
  role: string | null;                 // Rôle dans l'org active
  isLoading: boolean;
  refetch: () => Promise<void>;
}

function useOrganization(): OrganizationState;
```

### 6.4 Changement d'organisation

```typescript
function useSwitchOrganization() {
  const switchOrganization = async (orgId: string) => {
    // Sauvegarde dans localStorage
    // Recharge les données
  };
  return { switchOrganization, isLoading };
}
```

### 6.5 Row Level Security (RLS)

Toutes les tables utilisent RLS pour isoler les données par organisation.

```sql
-- Exemple de politique RLS
CREATE POLICY "Users can view their organization's contacts"
ON crm_contacts
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

---

## 7. API et fonctions serveur

### 7.1 Structure des fonctions serveur

Chaque module expose des fonctions dans `src/server/` :

```typescript
// packages/crm/src/server/contacts.ts
export async function getContacts(
  supabase: SupabaseClient,
  organizationId: string,
  filters?: ContactFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Contact>>;

export async function getContact(
  supabase: SupabaseClient,
  organizationId: string,
  contactId: string
): Promise<Contact | null>;

export async function createContact(
  supabase: SupabaseClient,
  organizationId: string,
  data: CreateContactInput
): Promise<Contact>;

export async function updateContact(
  supabase: SupabaseClient,
  organizationId: string,
  contactId: string,
  data: UpdateContactInput
): Promise<Contact>;

export async function deleteContact(
  supabase: SupabaseClient,
  organizationId: string,
  contactId: string
): Promise<void>;
```

### 7.2 Gestion des erreurs

Les fonctions serveur lancent des erreurs typées :

```typescript
class NotFoundError extends Error {
  statusCode = 404;
}

class UnauthorizedError extends Error {
  statusCode = 403;
}

class ValidationError extends Error {
  statusCode = 400;
  details: Record<string, string>;
}
```

### 7.3 Pagination

```typescript
interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## 8. Interface utilisateur

### 8.1 Routes

#### Routes publiques

| Route | Description |
|-------|-------------|
| `/login` | Page de connexion |
| `/setup` | Configuration initiale |
| `/client-portal/$token` | Portail client (devis/factures) |

#### Routes authentifiées (`/_authenticated/`)

| Route | Description |
|-------|-------------|
| `/dashboard` | Tableau de bord principal |
| `/contacts` | Liste des contacts |
| `/contacts/new` | Nouveau contact |
| `/contacts/$contactId` | Détail contact |
| `/companies` | Liste des entreprises |
| `/companies/new` | Nouvelle entreprise |
| `/companies/$companyId` | Détail entreprise |
| `/invoices` | Liste des factures |
| `/invoices/new` | Nouvelle facture |
| `/invoices/$invoiceId` | Détail facture |
| `/quotes` | Liste des devis |
| `/quotes/new` | Nouveau devis |
| `/quotes/$quoteId` | Détail devis |
| `/clients` | Clients de facturation |
| `/clients/new` | Nouveau client |
| `/clients/$clientId` | Détail client |
| `/products` | Catalogue produits |
| `/products/new` | Nouveau produit |
| `/products/$productId` | Détail produit |
| `/employees` | Liste des employés |
| `/employees/new` | Nouvel employé |
| `/employees/$employeeId` | Fiche employé |
| `/leave-requests` | Demandes de congés |
| `/attendance` | Présences |
| `/projects` | Liste des projets |
| `/projects/new` | Nouveau projet |
| `/projects/$projectId` | Détail projet |
| `/projects/$projectId/board` | Vue Kanban |
| `/tickets` | Liste des tickets |
| `/tickets/new` | Nouveau ticket |
| `/tickets/$ticketId` | Détail ticket |
| `/documents` | Gestionnaire de fichiers |
| `/analytics` | Tableaux de bord |
| `/settings` | Paramètres |
| `/settings/organization` | Paramètres organisation |
| `/settings/users` | Gestion utilisateurs |
| `/settings/billing` | Facturation (paramètres) |

### 8.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header (OrganizationSelector, UserMenu, Notifications)      │
├───────────┬─────────────────────────────────────────────────┤
│           │                                                 │
│  Sidebar  │              Main Content                       │
│   (Nav)   │                                                 │
│           │                                                 │
│           │                                                 │
│           │                                                 │
│           │                                                 │
└───────────┴─────────────────────────────────────────────────┘
```

### 8.3 Composants UI (`@sedona/ui`)

#### Boutons et actions

| Composant | Description |
|-----------|-------------|
| `Button` | Bouton avec variants |
| `IconButton` | Bouton icône |
| `DropdownMenu` | Menu déroulant |
| `AlertDialog` | Dialogue de confirmation |

#### Formulaires

| Composant | Description |
|-----------|-------------|
| `Input` | Champ texte |
| `Textarea` | Zone de texte |
| `Select` | Liste déroulante |
| `Checkbox` | Case à cocher |
| `Switch` | Interrupteur |
| `DatePicker` | Sélecteur de date |
| `Combobox` | Combo avec recherche |

#### Layout

| Composant | Description |
|-----------|-------------|
| `Card` | Carte avec header/content/footer |
| `Tabs` | Onglets |
| `Accordion` | Accordéon |
| `Sheet` | Panneau latéral |
| `Dialog` | Modal |

#### Feedback

| Composant | Description |
|-----------|-------------|
| `Toast` | Notifications toast |
| `Badge` | Badge/étiquette |
| `Skeleton` | Placeholder de chargement |
| `Spinner` | Indicateur de chargement |

#### Data display

| Composant | Description |
|-----------|-------------|
| `Table` | Tableau de données |
| `DataTable` | Tableau avec tri/filtre |
| `Avatar` | Avatar utilisateur |
| `Tooltip` | Infobulle |

### 8.4 Thème

Le thème utilise les CSS custom properties de Tailwind :

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 47.4% 11.2%;
  --radius: 0.5rem;
}
```

---

## 9. Sécurité

### 9.1 Row Level Security (RLS)

Toutes les tables ont des politiques RLS activées :

```sql
-- Activation RLS
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- Politique SELECT
CREATE POLICY "select_own_org" ON crm_contacts
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Politique INSERT
CREATE POLICY "insert_own_org" ON crm_contacts
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Politique UPDATE
CREATE POLICY "update_own_org" ON crm_contacts
FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Politique DELETE
CREATE POLICY "delete_own_org" ON crm_contacts
FOR DELETE USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

### 9.2 Validation des données

Validation côté client ET serveur avec Zod :

```typescript
// packages/invoice/src/components/schemas.ts
export const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  issueDate: z.string(),
  dueDate: z.string(),
  lineItems: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
});
```

### 9.3 Protection des routes

```typescript
// apps/web/src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const session = await context.supabase.auth.getSession();
    if (!session.data.session) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});
```

### 9.4 Variables d'environnement

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 9.5 Soft delete

Les entités importantes utilisent le soft delete :

```sql
deleted_at TIMESTAMPTZ DEFAULT NULL
```

Les requêtes filtrent automatiquement :

```typescript
.is('deleted_at', null)
```

---

## 10. Configuration et déploiement

### 10.1 Scripts npm

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "db:seed": "supabase db seed"
  }
}
```

### 10.2 Configuration Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {}
  }
}
```

### 10.3 Déploiement Vercel

Le fichier `vercel.json` configure le déploiement :

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "vite",
  "outputDirectory": "apps/web/dist"
}
```

### 10.4 Variables d'environnement production

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase |
| `VITE_APP_URL` | URL de l'application |

### 10.5 Migrations Supabase

Les migrations sont dans `packages/database/supabase/migrations/` :

```
migrations/
├── 001_base_schema.sql
├── 002_rls_policies.sql
├── 003_crm_module.sql
├── 004_invoice_module.sql
├── 005_hr_module.sql
├── 006_projects_module.sql
├── 007_tickets_module.sql
├── 008_docs_module.sql
├── ...
└── 040_organization_refactor.sql
```

---

## Annexes

### A. Icônes utilisées (Lucide)

| Icône | Usage |
|-------|-------|
| `Users` | Contacts, Utilisateurs |
| `Building2` | Entreprises |
| `FileText` | Factures, Documents |
| `Calculator` | Devis |
| `CreditCard` | Paiements |
| `UserCog` | Employés |
| `Calendar` | Congés, Calendrier |
| `FolderKanban` | Projets |
| `CheckSquare` | Tâches |
| `Ticket` | Tickets |
| `Folder` | Documents |
| `BarChart3` | Analytiques |
| `Settings` | Paramètres |

### B. Codes couleur des statuts

```css
/* Factures */
.status-draft { @apply bg-gray-100 text-gray-800; }
.status-sent { @apply bg-blue-100 text-blue-800; }
.status-paid { @apply bg-green-100 text-green-800; }
.status-overdue { @apply bg-red-100 text-red-800; }

/* Tâches */
.priority-low { @apply bg-gray-100 text-gray-600; }
.priority-medium { @apply bg-yellow-100 text-yellow-800; }
.priority-high { @apply bg-orange-100 text-orange-800; }
.priority-urgent { @apply bg-red-100 text-red-800; }
```

### C. Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl/Cmd + K` | Recherche globale |
| `Ctrl/Cmd + N` | Nouveau (contexte actuel) |
| `Escape` | Fermer modal/panneau |

---

*Documentation générée le 19 février 2026*
*Version: 1.0.0*
