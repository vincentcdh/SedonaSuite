-- 023_roles_permissions.sql
-- Sedona.AI - Système de rôles, permissions et limites par plan
-- Cette migration crée le nouveau système de permissions granulaires

-- ===========================================
-- 1. MODIFICATION DE L'ENUM organization_role
-- ===========================================

-- Renommer l'ancien enum pour pouvoir en créer un nouveau
ALTER TYPE organization_role RENAME TO organization_role_old;

-- Créer le nouvel enum avec les bons rôles
CREATE TYPE organization_role AS ENUM ('owner', 'manager', 'employee');

-- Mettre à jour la colonne organization_members.role
ALTER TABLE public.organization_members
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE organization_role USING (
    CASE
      WHEN role::text = 'owner' THEN 'owner'::organization_role
      WHEN role::text = 'admin' THEN 'manager'::organization_role
      WHEN role::text = 'member' THEN 'employee'::organization_role
      ELSE 'employee'::organization_role
    END
  ),
  ALTER COLUMN role SET DEFAULT 'employee'::organization_role;

-- Supprimer l'ancien enum
DROP TYPE organization_role_old;

-- ===========================================
-- 2. AJOUT DE manager_id À organization_members
-- ===========================================

ALTER TABLE public.organization_members
  ADD COLUMN manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Index pour la hiérarchie
CREATE INDEX idx_org_members_manager ON organization_members(manager_id) WHERE manager_id IS NOT NULL;

-- ===========================================
-- 3. TABLE role_permissions
-- ===========================================

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role organization_role NOT NULL,

  -- Module concerné
  module VARCHAR(50) NOT NULL, -- 'crm', 'invoices', 'projects', 'tickets', 'hr', 'documents', 'analytics', 'settings'

  -- Permissions granulaires
  can_view BOOLEAN DEFAULT false NOT NULL,
  can_create BOOLEAN DEFAULT false NOT NULL,
  can_edit BOOLEAN DEFAULT false NOT NULL,
  can_delete BOOLEAN DEFAULT false NOT NULL,
  can_export BOOLEAN DEFAULT false NOT NULL,

  -- Permissions spécifiques par module
  can_manage_team BOOLEAN DEFAULT false NOT NULL,     -- RH: gérer équipes
  can_approve BOOLEAN DEFAULT false NOT NULL,          -- Validations diverses
  can_send BOOLEAN DEFAULT false NOT NULL,             -- Factures: envoyer
  can_view_financial BOOLEAN DEFAULT false NOT NULL,   -- Voir données financières
  can_manage_settings BOOLEAN DEFAULT false NOT NULL,  -- Gérer paramètres module

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_org_role_module UNIQUE(organization_id, role, module)
);

-- Index
CREATE INDEX idx_role_permissions_org ON role_permissions(organization_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(organization_id, role);

-- Trigger updated_at
CREATE TRIGGER set_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ===========================================
-- 4. TABLE plan_limits
-- ===========================================

CREATE TABLE public.plan_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan subscription_plan NOT NULL UNIQUE,

  -- CRM
  max_contacts INTEGER,           -- NULL = illimité
  max_companies INTEGER,
  max_deals INTEGER,

  -- Facturation
  max_invoices_per_month INTEGER,
  max_clients INTEGER,
  max_products INTEGER,

  -- Projets
  max_projects INTEGER,
  max_tasks_per_project INTEGER,

  -- Tickets
  max_tickets_per_month INTEGER,
  max_kb_articles INTEGER,

  -- RH
  max_employees INTEGER,
  max_leave_types INTEGER,

  -- Documents
  max_storage_mb INTEGER,
  max_folders INTEGER,

  -- Membres
  max_users INTEGER,

  -- Fonctionnalités
  feature_analytics BOOLEAN DEFAULT false NOT NULL,
  feature_custom_reports BOOLEAN DEFAULT false NOT NULL,
  feature_api_access BOOLEAN DEFAULT false NOT NULL,
  feature_custom_fields BOOLEAN DEFAULT false NOT NULL,
  feature_automations BOOLEAN DEFAULT false NOT NULL,
  feature_integrations BOOLEAN DEFAULT false NOT NULL,
  feature_white_label BOOLEAN DEFAULT false NOT NULL,
  feature_priority_support BOOLEAN DEFAULT false NOT NULL,
  feature_sla BOOLEAN DEFAULT false NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger updated_at
CREATE TRIGGER set_plan_limits_updated_at
  BEFORE UPDATE ON plan_limits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ===========================================
-- 5. INSERTION DES LIMITES PAR PLAN
-- ===========================================

INSERT INTO public.plan_limits (
  plan,
  -- CRM
  max_contacts, max_companies, max_deals,
  -- Facturation
  max_invoices_per_month, max_clients, max_products,
  -- Projets
  max_projects, max_tasks_per_project,
  -- Tickets
  max_tickets_per_month, max_kb_articles,
  -- RH
  max_employees, max_leave_types,
  -- Documents
  max_storage_mb, max_folders,
  -- Membres
  max_users,
  -- Fonctionnalités
  feature_analytics, feature_custom_reports, feature_api_access,
  feature_custom_fields, feature_automations, feature_integrations,
  feature_white_label, feature_priority_support, feature_sla
) VALUES
-- Plan FREE
(
  'FREE',
  100, 50, 25,           -- CRM: 100 contacts, 50 entreprises, 25 deals
  10, 20, 50,            -- Facturation: 10 factures/mois, 20 clients, 50 produits
  3, 50,                 -- Projets: 3 projets, 50 tâches/projet
  50, 10,                -- Tickets: 50/mois, 10 articles KB
  5, 3,                  -- RH: 5 employés, 3 types de congés
  500, 10,               -- Documents: 500 MB, 10 dossiers
  3,                     -- 3 utilisateurs max
  false, false, false,   -- Pas d'analytics avancé
  false, false, false,   -- Pas de custom fields, automations, intégrations
  false, false, false    -- Pas de white label, support prioritaire, SLA
),
-- Plan PRO
(
  'PRO',
  NULL, NULL, NULL,      -- CRM: illimité
  NULL, NULL, NULL,      -- Facturation: illimité
  NULL, NULL,            -- Projets: illimité
  NULL, NULL,            -- Tickets: illimité
  NULL, NULL,            -- RH: illimité
  10000, NULL,           -- Documents: 10 GB, dossiers illimités
  NULL,                  -- Utilisateurs illimités
  true, true, true,      -- Analytics, rapports personnalisés, API
  true, true, true,      -- Custom fields, automations, intégrations
  false, true, false     -- Pas de white label, support prioritaire, pas de SLA
),
-- Plan ENTERPRISE
(
  'ENTERPRISE',
  NULL, NULL, NULL,      -- Tout illimité
  NULL, NULL, NULL,
  NULL, NULL,
  NULL, NULL,
  NULL, NULL,
  NULL, NULL,
  NULL,
  true, true, true,      -- Toutes les fonctionnalités
  true, true, true,
  true, true, true       -- White label, support prioritaire, SLA
);

-- ===========================================
-- 6. FONCTION D'INITIALISATION DES PERMISSIONS PAR DÉFAUT
-- ===========================================

CREATE OR REPLACE FUNCTION init_organization_permissions(p_org_id UUID)
RETURNS void AS $$
DECLARE
  modules TEXT[] := ARRAY['crm', 'invoices', 'projects', 'tickets', 'hr', 'documents', 'analytics', 'settings'];
  m TEXT;
BEGIN
  -- Supprimer les permissions existantes pour cette org
  DELETE FROM role_permissions WHERE organization_id = p_org_id;

  FOREACH m IN ARRAY modules LOOP
    -- OWNER: tous les droits
    INSERT INTO role_permissions (
      organization_id, role, module,
      can_view, can_create, can_edit, can_delete, can_export,
      can_manage_team, can_approve, can_send, can_view_financial, can_manage_settings
    ) VALUES (
      p_org_id, 'owner', m,
      true, true, true, true, true,
      true, true, true, true, true
    );

    -- MANAGER: presque tous les droits (pas de gestion settings globaux)
    INSERT INTO role_permissions (
      organization_id, role, module,
      can_view, can_create, can_edit, can_delete, can_export,
      can_manage_team, can_approve, can_send, can_view_financial, can_manage_settings
    ) VALUES (
      p_org_id, 'manager', m,
      true, true, true, true, true,
      true, true, true, true,
      CASE WHEN m = 'settings' THEN false ELSE true END
    );

    -- EMPLOYEE: droits limités selon le module
    INSERT INTO role_permissions (
      organization_id, role, module,
      can_view, can_create, can_edit, can_delete, can_export,
      can_manage_team, can_approve, can_send, can_view_financial, can_manage_settings
    ) VALUES (
      p_org_id, 'employee', m,
      -- View: tous sauf settings et analytics (sauf basiques)
      CASE WHEN m IN ('settings') THEN false ELSE true END,
      -- Create: CRM, tickets, projets (tâches), docs
      CASE WHEN m IN ('crm', 'tickets', 'projects', 'documents') THEN true ELSE false END,
      -- Edit: ses propres éléments uniquement (géré au niveau RLS)
      CASE WHEN m IN ('crm', 'tickets', 'projects', 'documents') THEN true ELSE false END,
      -- Delete: non
      false,
      -- Export: non
      false,
      -- Manage team: non
      false,
      -- Approve: non
      false,
      -- Send: non
      false,
      -- View financial: non
      false,
      -- Manage settings: non
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 7. TRIGGER POUR INITIALISER LES PERMISSIONS
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_init_org_permissions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM init_organization_permissions(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_organization_created_init_permissions
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_init_org_permissions();

-- ===========================================
-- 8. INITIALISER LES PERMISSIONS POUR LES ORGS EXISTANTES
-- ===========================================

DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM organizations WHERE deleted_at IS NULL LOOP
    PERFORM init_organization_permissions(org_record.id);
  END LOOP;
END $$;

-- ===========================================
-- 9. FONCTION HELPER: VÉRIFIER UNE PERMISSION
-- ===========================================

CREATE OR REPLACE FUNCTION check_permission(
  p_org_id UUID,
  p_user_id UUID,
  p_module VARCHAR(50),
  p_action VARCHAR(50)  -- 'view', 'create', 'edit', 'delete', 'export', 'manage_team', 'approve', 'send', 'view_financial', 'manage_settings'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role organization_role;
  v_has_permission BOOLEAN;
BEGIN
  -- Récupérer le rôle de l'utilisateur dans l'organisation
  SELECT role INTO v_role
  FROM organization_members
  WHERE organization_id = p_org_id AND user_id = p_user_id;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Owner a toujours tous les droits
  IF v_role = 'owner' THEN
    RETURN true;
  END IF;

  -- Vérifier la permission spécifique
  EXECUTE format(
    'SELECT can_%s FROM role_permissions WHERE organization_id = $1 AND role = $2 AND module = $3',
    p_action
  ) INTO v_has_permission
  USING p_org_id, v_role, p_module;

  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- ===========================================
-- 10. FONCTION HELPER: VÉRIFIER UNE LIMITE
-- ===========================================

CREATE OR REPLACE FUNCTION check_limit(
  p_org_id UUID,
  p_limit_name VARCHAR(100),
  p_current_count INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_plan subscription_plan;
  v_limit INTEGER;
  v_count INTEGER;
BEGIN
  -- Récupérer le plan de l'organisation
  SELECT subscription_plan INTO v_plan
  FROM organizations
  WHERE id = p_org_id;

  -- Récupérer la limite pour ce plan
  EXECUTE format(
    'SELECT %s FROM plan_limits WHERE plan = $1',
    p_limit_name
  ) INTO v_limit
  USING v_plan;

  -- Si limite NULL, c'est illimité
  IF v_limit IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'limit', null,
      'current', p_current_count,
      'unlimited', true
    );
  END IF;

  v_count := COALESCE(p_current_count, 0);

  RETURN jsonb_build_object(
    'allowed', v_count < v_limit,
    'limit', v_limit,
    'current', v_count,
    'unlimited', false,
    'remaining', GREATEST(0, v_limit - v_count)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ===========================================
-- 11. FONCTION HELPER: VÉRIFIER UNE FEATURE
-- ===========================================

CREATE OR REPLACE FUNCTION check_feature(
  p_org_id UUID,
  p_feature_name VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan subscription_plan;
  v_enabled BOOLEAN;
BEGIN
  -- Récupérer le plan de l'organisation
  SELECT subscription_plan INTO v_plan
  FROM organizations
  WHERE id = p_org_id;

  -- Vérifier si la feature est activée pour ce plan
  EXECUTE format(
    'SELECT %s FROM plan_limits WHERE plan = $1',
    p_feature_name
  ) INTO v_enabled
  USING v_plan;

  RETURN COALESCE(v_enabled, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- ===========================================
-- 12. INDEX ADDITIONNELS POUR PERFORMANCE
-- ===========================================

CREATE INDEX idx_organizations_plan ON organizations(subscription_plan);
