-- ===========================================
-- SEDONA CRM - COMPLETE DATABASE SCHEMA
-- ===========================================
-- This single migration file sets up the entire database.
-- It is idempotent (can be run multiple times safely).
-- Run this in Supabase SQL Editor.

-- ===========================================
-- EXTENSIONS
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ENUMS (with safe creation)
-- ===========================================

DO $$ BEGIN
  CREATE TYPE subscription_plan AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- HELPER FUNCTIONS (must exist before tables)
-- ===========================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alias for compatibility
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- PUBLIC SCHEMA - CORE TABLES
-- ===========================================

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  siret VARCHAR(14),
  siren VARCHAR(9),
  vat_number VARCHAR(20),
  legal_name VARCHAR(255),
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'France',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  stripe_customer_id VARCHAR(255) UNIQUE,
  subscription_plan subscription_plan DEFAULT 'FREE' NOT NULL,
  subscription_status subscription_status DEFAULT 'active' NOT NULL,
  subscription_id VARCHAR(255),
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,
  settings JSONB DEFAULT '{}' NOT NULL,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  password_hash TEXT,
  locale VARCHAR(10) DEFAULT 'fr' NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris' NOT NULL,
  settings JSONB DEFAULT '{}' NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  two_factor_secret TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Organization Members (join table)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role organization_role DEFAULT 'member' NOT NULL,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_org_user UNIQUE(organization_id, user_id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  current_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Tokens
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  token TEXT UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL,
  feature VARCHAR(50) NOT NULL,
  current_count INTEGER DEFAULT 0 NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_usage_tracking UNIQUE(organization_id, module, feature, period_start)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===========================================
-- PUBLIC SCHEMA - INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_deleted ON organizations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ===========================================
-- PUBLIC SCHEMA - TRIGGERS
-- ===========================================

DROP TRIGGER IF EXISTS set_organizations_updated_at ON organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ===========================================
-- RLS HELPER FUNCTIONS (in public schema)
-- ===========================================

-- Get all organization IDs the current user belongs to
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Alias for compatibility with various RLS policies
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_uuid UUID)
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = user_uuid
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get organization IDs where user is admin or owner
CREATE OR REPLACE FUNCTION public.get_user_admin_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get organization IDs where user is owner
CREATE OR REPLACE FUNCTION public.get_user_owner_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND role = 'owner'
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is member of organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND joined_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin of organization
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND joined_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is owner of organization
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND joined_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_organization_ids() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_organizations(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_admin_organization_ids() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_owner_organization_ids() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_org_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_org_owner(UUID) TO authenticated, anon;

-- ===========================================
-- ENABLE RLS ON PUBLIC TABLES
-- ===========================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- DROP EXISTING PUBLIC POLICIES (cleanup)
-- ===========================================

DROP POLICY IF EXISTS "org_select_member" ON public.organizations;
DROP POLICY IF EXISTS "org_update_admin" ON public.organizations;
DROP POLICY IF EXISTS "org_insert_authenticated" ON public.organizations;
DROP POLICY IF EXISTS "org_delete_owner" ON public.organizations;

DROP POLICY IF EXISTS "user_select_self" ON public.users;
DROP POLICY IF EXISTS "user_select_org_member" ON public.users;
DROP POLICY IF EXISTS "user_update_self" ON public.users;
DROP POLICY IF EXISTS "user_insert" ON public.users;

DROP POLICY IF EXISTS "org_member_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_member_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_member_insert_admin" ON public.organization_members;
DROP POLICY IF EXISTS "org_member_update_admin" ON public.organization_members;
DROP POLICY IF EXISTS "org_member_delete" ON public.organization_members;

DROP POLICY IF EXISTS "session_select_self" ON public.sessions;
DROP POLICY IF EXISTS "session_insert" ON public.sessions;
DROP POLICY IF EXISTS "session_delete_self" ON public.sessions;
DROP POLICY IF EXISTS "session_update_self" ON public.sessions;

DROP POLICY IF EXISTS "verification_token_select" ON public.verification_tokens;
DROP POLICY IF EXISTS "verification_token_select_self" ON public.verification_tokens;
DROP POLICY IF EXISTS "verification_token_insert" ON public.verification_tokens;
DROP POLICY IF EXISTS "verification_token_update" ON public.verification_tokens;
DROP POLICY IF EXISTS "verification_token_delete" ON public.verification_tokens;

DROP POLICY IF EXISTS "usage_select_member" ON public.usage_tracking;
DROP POLICY IF EXISTS "usage_insert" ON public.usage_tracking;
DROP POLICY IF EXISTS "usage_update" ON public.usage_tracking;

DROP POLICY IF EXISTS "audit_select_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert" ON public.audit_logs;

-- ===========================================
-- PUBLIC SCHEMA - RLS POLICIES
-- ===========================================

-- Organizations
CREATE POLICY "org_select_member"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT public.get_user_organization_ids()) AND deleted_at IS NULL);

CREATE POLICY "org_update_admin"
  ON public.organizations FOR UPDATE
  USING (id IN (SELECT public.get_user_admin_organization_ids()))
  WITH CHECK (id IN (SELECT public.get_user_admin_organization_ids()));

CREATE POLICY "org_insert_authenticated"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "org_delete_owner"
  ON public.organizations FOR DELETE
  USING (id IN (SELECT public.get_user_owner_organization_ids()));

-- Users
CREATE POLICY "user_select_self"
  ON public.users FOR SELECT
  USING (id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "user_select_org_member"
  ON public.users FOR SELECT
  USING (
    deleted_at IS NULL AND id IN (
      SELECT user_id FROM public.organization_members
      WHERE organization_id IN (SELECT public.get_user_organization_ids())
    )
  );

CREATE POLICY "user_update_self"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_insert"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Organization Members
CREATE POLICY "org_member_select"
  ON public.organization_members FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "org_member_insert"
  ON public.organization_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "org_member_update_admin"
  ON public.organization_members FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

CREATE POLICY "org_member_delete"
  ON public.organization_members FOR DELETE
  USING (
    organization_id IN (SELECT public.get_user_admin_organization_ids())
    OR user_id = auth.uid()
  );

-- Sessions
CREATE POLICY "session_select_self"
  ON public.sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "session_insert"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "session_delete_self"
  ON public.sessions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "session_update_self"
  ON public.sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Verification Tokens
CREATE POLICY "verification_token_select"
  ON public.verification_tokens FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "verification_token_insert"
  ON public.verification_tokens FOR INSERT
  WITH CHECK (true);

CREATE POLICY "verification_token_update"
  ON public.verification_tokens FOR UPDATE
  USING (true);

CREATE POLICY "verification_token_delete"
  ON public.verification_tokens FOR DELETE
  USING (true);

-- Usage Tracking
CREATE POLICY "usage_select_member"
  ON public.usage_tracking FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "usage_insert"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "usage_update"
  ON public.usage_tracking FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- Audit Logs
CREATE POLICY "audit_select_admin"
  ON public.audit_logs FOR SELECT
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

CREATE POLICY "audit_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ===========================================
-- GRANTS FOR PUBLIC SCHEMA
-- ===========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===========================================
-- CRM SCHEMA
-- ===========================================

CREATE SCHEMA IF NOT EXISTS crm;
GRANT USAGE ON SCHEMA crm TO anon, authenticated;

-- CRM Tables
CREATE TABLE IF NOT EXISTS crm.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  siret VARCHAR(20),
  website VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',
  phone VARCHAR(50),
  email VARCHAR(255),
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  job_title VARCHAR(100),
  company_id UUID REFERENCES crm.companies(id) ON DELETE SET NULL,
  source VARCHAR(50),
  source_details TEXT,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm.pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES crm.pipelines(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',
  position INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES crm.pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES crm.pipeline_stages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  probability INTEGER,
  expected_close_date DATE,
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm.companies(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'open',
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES crm.companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm.deals(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_type VARCHAR(20) NOT NULL,
  options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, entity_type, field_key)
);

CREATE TABLE IF NOT EXISTS crm.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- CRM Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_org ON crm.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON crm.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON crm.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON crm.contacts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_companies_org ON crm.companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_deleted ON crm.companies(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pipelines_org ON crm.pipelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline ON crm.pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_org ON crm.deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON crm.deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON crm.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_deleted ON crm.deals(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_org ON crm.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON crm.activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON crm.activities(deal_id);

-- CRM Triggers
DROP TRIGGER IF EXISTS update_crm_contacts_updated_at ON crm.contacts;
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON crm.contacts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_companies_updated_at ON crm.companies;
CREATE TRIGGER update_crm_companies_updated_at
  BEFORE UPDATE ON crm.companies FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_pipelines_updated_at ON crm.pipelines;
CREATE TRIGGER update_crm_pipelines_updated_at
  BEFORE UPDATE ON crm.pipelines FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_pipeline_stages_updated_at ON crm.pipeline_stages;
CREATE TRIGGER update_crm_pipeline_stages_updated_at
  BEFORE UPDATE ON crm.pipeline_stages FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_deals_updated_at ON crm.deals;
CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON crm.deals FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_activities_updated_at ON crm.activities;
CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON crm.activities FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CRM RLS
ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.tags ENABLE ROW LEVEL SECURITY;

-- Drop existing CRM policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'crm'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON crm.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- CRM Policies
CREATE POLICY "crm_contacts_select" ON crm.contacts FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_contacts_insert" ON crm.contacts FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_contacts_update" ON crm.contacts FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_contacts_delete" ON crm.contacts FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "crm_companies_select" ON crm.companies FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_companies_insert" ON crm.companies FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_companies_update" ON crm.companies FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_companies_delete" ON crm.companies FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "crm_pipelines_select" ON crm.pipelines FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_pipelines_insert" ON crm.pipelines FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_pipelines_update" ON crm.pipelines FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_pipelines_delete" ON crm.pipelines FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "crm_pipeline_stages_select" ON crm.pipeline_stages FOR SELECT
  USING (pipeline_id IN (SELECT id FROM crm.pipelines WHERE organization_id IN (SELECT public.get_user_organization_ids())));
CREATE POLICY "crm_pipeline_stages_insert" ON crm.pipeline_stages FOR INSERT
  WITH CHECK (pipeline_id IN (SELECT id FROM crm.pipelines WHERE organization_id IN (SELECT public.get_user_organization_ids())));
CREATE POLICY "crm_pipeline_stages_update" ON crm.pipeline_stages FOR UPDATE
  USING (pipeline_id IN (SELECT id FROM crm.pipelines WHERE organization_id IN (SELECT public.get_user_organization_ids())));
CREATE POLICY "crm_pipeline_stages_delete" ON crm.pipeline_stages FOR DELETE
  USING (pipeline_id IN (SELECT id FROM crm.pipelines WHERE organization_id IN (SELECT public.get_user_organization_ids())));

CREATE POLICY "crm_deals_select" ON crm.deals FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_deals_insert" ON crm.deals FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_deals_update" ON crm.deals FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_deals_delete" ON crm.deals FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "crm_activities_select" ON crm.activities FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_activities_insert" ON crm.activities FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_activities_update" ON crm.activities FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_activities_delete" ON crm.activities FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "crm_custom_fields_select" ON crm.custom_field_definitions FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_custom_fields_insert" ON crm.custom_field_definitions FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_custom_fields_update" ON crm.custom_field_definitions FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_custom_fields_delete" ON crm.custom_field_definitions FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "crm_tags_select" ON crm.tags FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_tags_insert" ON crm.tags FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_tags_update" ON crm.tags FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "crm_tags_delete" ON crm.tags FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- CRM Grants
GRANT ALL ON ALL TABLES IN SCHEMA crm TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA crm TO anon, authenticated;

-- ===========================================
-- INVOICE SCHEMA
-- ===========================================

CREATE SCHEMA IF NOT EXISTS invoice;
GRANT USAGE ON SCHEMA invoice TO anon, authenticated;

-- Invoice Tables
CREATE TABLE IF NOT EXISTS invoice.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  siret VARCHAR(20),
  vat_number VARCHAR(30),
  legal_form VARCHAR(50),
  billing_address_line1 VARCHAR(255),
  billing_address_line2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100) DEFAULT 'France',
  billing_email VARCHAR(255),
  billing_phone VARCHAR(50),
  contact_name VARCHAR(200),
  payment_terms INTEGER DEFAULT 30,
  payment_method VARCHAR(30) DEFAULT 'transfer',
  default_currency VARCHAR(3) DEFAULT 'EUR',
  crm_company_id UUID,
  crm_contact_id UUID,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  type VARCHAR(20) DEFAULT 'service',
  unit_price DECIMAL(15,4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  unit VARCHAR(50) DEFAULT 'unite',
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  vat_exempt BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  accounting_code VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice.number_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  prefix VARCHAR(20) DEFAULT '',
  suffix VARCHAR(20) DEFAULT '',
  current_number INTEGER DEFAULT 0,
  padding INTEGER DEFAULT 4,
  reset_frequency VARCHAR(20) DEFAULT 'never',
  last_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, type)
);

CREATE TABLE IF NOT EXISTS invoice.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE RESTRICT,
  quote_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  discount_percent DECIMAL(5,2),
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  subject VARCHAR(500),
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,
  converted_to_invoice_id UUID,
  deal_id UUID,
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, quote_number)
);

CREATE TABLE IF NOT EXISTS invoice.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  discount_percent DECIMAL(5,2),
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  amount_due DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  subject VARCHAR(500),
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,
  payment_instructions TEXT,
  quote_id UUID REFERENCES invoice.quotes(id) ON DELETE SET NULL,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  deal_id UUID,
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice.credit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoice.invoices(id) ON DELETE SET NULL,
  credit_note_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  applied_at TIMESTAMPTZ,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, credit_note_number)
);

CREATE TABLE IF NOT EXISTS invoice.line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type VARCHAR(20) NOT NULL,
  document_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  product_id UUID REFERENCES invoice.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'unite',
  unit_price DECIMAL(15,4) NOT NULL,
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(15,2),
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  line_total_with_vat DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoice.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(30) NOT NULL,
  reference VARCHAR(100),
  notes TEXT,
  recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice.recurring_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  day_of_month INTEGER,
  month_of_year INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE,
  subject VARCHAR(500),
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  invoices_generated INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice.recurring_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES invoice.recurring_templates(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  product_id UUID REFERENCES invoice.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'unite',
  unit_price DECIMAL(15,4) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice.organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  legal_name VARCHAR(255),
  siret VARCHAR(20),
  vat_number VARCHAR(30),
  legal_form VARCHAR(50),
  capital VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  logo_url VARCHAR(500),
  bank_name VARCHAR(100),
  iban VARCHAR(50),
  bic VARCHAR(20),
  default_payment_terms INTEGER DEFAULT 30,
  default_quote_validity INTEGER DEFAULT 30,
  default_vat_rate DECIMAL(5,2) DEFAULT 20.00,
  default_currency VARCHAR(3) DEFAULT 'EUR',
  legal_mentions TEXT,
  late_payment_penalty TEXT,
  discount_terms TEXT,
  invoice_notes_template TEXT,
  invoice_footer_template TEXT,
  quote_notes_template TEXT,
  quote_footer_template TEXT,
  invoice_email_subject VARCHAR(255),
  invoice_email_body TEXT,
  quote_email_subject VARCHAR(255),
  quote_email_body TEXT,
  reminder_email_subject VARCHAR(255),
  reminder_email_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE TABLE IF NOT EXISTS invoice.vat_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, rate)
);

-- Invoice Indexes
CREATE INDEX IF NOT EXISTS idx_invoice_clients_org ON invoice.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_clients_deleted ON invoice.clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_products_org ON invoice.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_products_active ON invoice.products(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_invoice_quotes_org ON invoice.quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_quotes_client ON invoice.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_quotes_status ON invoice.quotes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_invoices_org ON invoice.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_invoices_client ON invoice.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_invoices_status ON invoice.invoices(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_document ON invoice.line_items(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_org ON invoice.payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice.payments(invoice_id);

-- Invoice Triggers
DROP TRIGGER IF EXISTS update_invoice_clients_updated_at ON invoice.clients;
CREATE TRIGGER update_invoice_clients_updated_at
  BEFORE UPDATE ON invoice.clients FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_products_updated_at ON invoice.products;
CREATE TRIGGER update_invoice_products_updated_at
  BEFORE UPDATE ON invoice.products FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_quotes_updated_at ON invoice.quotes;
CREATE TRIGGER update_invoice_quotes_updated_at
  BEFORE UPDATE ON invoice.quotes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_invoices_updated_at ON invoice.invoices;
CREATE TRIGGER update_invoice_invoices_updated_at
  BEFORE UPDATE ON invoice.invoices FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_credit_notes_updated_at ON invoice.credit_notes;
CREATE TRIGGER update_invoice_credit_notes_updated_at
  BEFORE UPDATE ON invoice.credit_notes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_line_items_updated_at ON invoice.line_items;
CREATE TRIGGER update_invoice_line_items_updated_at
  BEFORE UPDATE ON invoice.line_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_payments_updated_at ON invoice.payments;
CREATE TRIGGER update_invoice_payments_updated_at
  BEFORE UPDATE ON invoice.payments FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Invoice RLS
ALTER TABLE invoice.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.recurring_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.vat_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing Invoice policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'invoice'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON invoice.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Invoice Policies
CREATE POLICY "invoice_clients_select" ON invoice.clients FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_clients_insert" ON invoice.clients FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_clients_update" ON invoice.clients FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_clients_delete" ON invoice.clients FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_products_select" ON invoice.products FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_products_insert" ON invoice.products FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_products_update" ON invoice.products FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_products_delete" ON invoice.products FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_sequences_select" ON invoice.number_sequences FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_sequences_all" ON invoice.number_sequences FOR ALL
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_quotes_select" ON invoice.quotes FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_quotes_insert" ON invoice.quotes FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_quotes_update" ON invoice.quotes FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_quotes_delete" ON invoice.quotes FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_invoices_select" ON invoice.invoices FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_invoices_insert" ON invoice.invoices FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_invoices_update" ON invoice.invoices FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_invoices_delete" ON invoice.invoices FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_credit_notes_select" ON invoice.credit_notes FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_credit_notes_insert" ON invoice.credit_notes FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_credit_notes_update" ON invoice.credit_notes FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_credit_notes_delete" ON invoice.credit_notes FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_line_items_select" ON invoice.line_items FOR SELECT
  USING (
    (document_type = 'quote' AND document_id IN (SELECT id FROM invoice.quotes WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'invoice' AND document_id IN (SELECT id FROM invoice.invoices WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'credit_note' AND document_id IN (SELECT id FROM invoice.credit_notes WHERE organization_id IN (SELECT public.get_user_organization_ids())))
  );
CREATE POLICY "invoice_line_items_insert" ON invoice.line_items FOR INSERT
  WITH CHECK (
    (document_type = 'quote' AND document_id IN (SELECT id FROM invoice.quotes WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'invoice' AND document_id IN (SELECT id FROM invoice.invoices WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'credit_note' AND document_id IN (SELECT id FROM invoice.credit_notes WHERE organization_id IN (SELECT public.get_user_organization_ids())))
  );
CREATE POLICY "invoice_line_items_update" ON invoice.line_items FOR UPDATE
  USING (
    (document_type = 'quote' AND document_id IN (SELECT id FROM invoice.quotes WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'invoice' AND document_id IN (SELECT id FROM invoice.invoices WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'credit_note' AND document_id IN (SELECT id FROM invoice.credit_notes WHERE organization_id IN (SELECT public.get_user_organization_ids())))
  );
CREATE POLICY "invoice_line_items_delete" ON invoice.line_items FOR DELETE
  USING (
    (document_type = 'quote' AND document_id IN (SELECT id FROM invoice.quotes WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'invoice' AND document_id IN (SELECT id FROM invoice.invoices WHERE organization_id IN (SELECT public.get_user_organization_ids()))) OR
    (document_type = 'credit_note' AND document_id IN (SELECT id FROM invoice.credit_notes WHERE organization_id IN (SELECT public.get_user_organization_ids())))
  );

CREATE POLICY "invoice_payments_select" ON invoice.payments FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_payments_insert" ON invoice.payments FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_payments_update" ON invoice.payments FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_payments_delete" ON invoice.payments FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_recurring_select" ON invoice.recurring_templates FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_recurring_insert" ON invoice.recurring_templates FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_recurring_update" ON invoice.recurring_templates FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_recurring_delete" ON invoice.recurring_templates FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_recurring_items_select" ON invoice.recurring_line_items FOR SELECT
  USING (template_id IN (SELECT id FROM invoice.recurring_templates WHERE organization_id IN (SELECT public.get_user_organization_ids())));
CREATE POLICY "invoice_recurring_items_insert" ON invoice.recurring_line_items FOR INSERT
  WITH CHECK (template_id IN (SELECT id FROM invoice.recurring_templates WHERE organization_id IN (SELECT public.get_user_organization_ids())));
CREATE POLICY "invoice_recurring_items_update" ON invoice.recurring_line_items FOR UPDATE
  USING (template_id IN (SELECT id FROM invoice.recurring_templates WHERE organization_id IN (SELECT public.get_user_organization_ids())));
CREATE POLICY "invoice_recurring_items_delete" ON invoice.recurring_line_items FOR DELETE
  USING (template_id IN (SELECT id FROM invoice.recurring_templates WHERE organization_id IN (SELECT public.get_user_organization_ids())));

CREATE POLICY "invoice_settings_select" ON invoice.organization_settings FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_settings_all" ON invoice.organization_settings FOR ALL
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "invoice_vat_rates_select" ON invoice.vat_rates FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "invoice_vat_rates_all" ON invoice.vat_rates FOR ALL
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- Invoice Grants
GRANT ALL ON ALL TABLES IN SCHEMA invoice TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA invoice TO anon, authenticated;

-- ===========================================
-- FINAL MESSAGE
-- ===========================================

DO $$
BEGIN
  RAISE NOTICE 'Sedona CRM database schema setup complete!';
  RAISE NOTICE 'Schemas created: public, crm, invoice';
  RAISE NOTICE 'RLS enabled on all tables with proper policies';
END $$;
-- ===========================================
-- 050_organizations_refactor.sql
-- Refactor organization system for multi-tenant SaaS
-- ===========================================
-- Dependencies: None (base schema must exist)
-- Rollback: rollbacks/050_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. ADD NEW COLUMNS TO ORGANIZATIONS
-- ===========================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS industry TEXT;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';

-- ===========================================
-- 2. MIGRATE EXISTING ADDRESS DATA TO JSONB
-- ===========================================

UPDATE public.organizations
SET address = jsonb_build_object(
  'street', COALESCE(address_line1, ''),
  'complement', COALESCE(address_line2, ''),
  'postalCode', COALESCE(postal_code, ''),
  'city', COALESCE(city, ''),
  'country', COALESCE(country, 'France')
)
WHERE address = '{}' OR address IS NULL;

-- ===========================================
-- 3. MARK EXISTING ORGS AS ONBOARDING COMPLETE
-- ===========================================

UPDATE public.organizations
SET onboarding_completed = true
WHERE onboarding_completed_at IS NOT NULL
   OR id IN (SELECT DISTINCT organization_id FROM public.organization_members);

-- ===========================================
-- 4. REMOVE SUBSCRIPTION COLUMNS
-- (Moving to module-level subscriptions)
-- ===========================================

-- Drop defaults first if they exist
DO $$
BEGIN
  ALTER TABLE public.organizations ALTER COLUMN subscription_plan DROP DEFAULT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.organizations ALTER COLUMN subscription_status DROP DEFAULT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop the columns
ALTER TABLE public.organizations
  DROP COLUMN IF EXISTS subscription_plan,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_id,
  DROP COLUMN IF EXISTS subscription_period_start,
  DROP COLUMN IF EXISTS subscription_period_end;

-- ===========================================
-- 5. ADD INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry) WHERE industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by) WHERE created_by IS NOT NULL;

-- ===========================================
-- 6. COMMENTS
-- ===========================================

COMMENT ON COLUMN public.organizations.industry IS 'Business sector/industry of the organization';
COMMENT ON COLUMN public.organizations.created_by IS 'User ID who created this organization';
COMMENT ON COLUMN public.organizations.onboarding_completed IS 'Whether the organization has completed onboarding wizard';
COMMENT ON COLUMN public.organizations.address IS 'Organization address as JSONB: {street, complement, postalCode, city, country}';

COMMIT;
-- ===========================================
-- 051_modules_tables.sql
-- Module-based subscription system tables
-- ===========================================
-- Dependencies: 050_organizations_refactor.sql
-- Rollback: rollbacks/051_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 0. CREATE HELPER FUNCTION FOR RLS
-- ===========================================

CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_user_organization_ids() TO authenticated;

-- ===========================================
-- 1. CREATE MODULE REFERENCE TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  base_price_monthly INTEGER NOT NULL,
  base_price_yearly INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- 2. CREATE MODULE SUBSCRIPTIONS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.module_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'active', 'past_due', 'canceled', 'trialing')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_customer_id TEXT,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT module_subscriptions_unique UNIQUE(organization_id, module_id)
);

-- ===========================================
-- 3. CREATE MODULE LIMITS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.module_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'paid')),
  limit_key TEXT NOT NULL,
  limit_value INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT module_limits_unique UNIQUE(module_id, tier, limit_key)
);

-- ===========================================
-- 4. CREATE MODULE USAGE TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.module_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  limit_key TEXT NOT NULL,
  current_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT module_usage_unique UNIQUE(organization_id, module_id, limit_key, period_start)
);

-- ===========================================
-- 5. CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_module_subscriptions_org_id ON public.module_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_module_subscriptions_module_id ON public.module_subscriptions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_subscriptions_status ON public.module_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_module_subscriptions_stripe_sub ON public.module_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_module_limits_module_id ON public.module_limits(module_id);
CREATE INDEX IF NOT EXISTS idx_module_limits_tier ON public.module_limits(tier);

CREATE INDEX IF NOT EXISTS idx_module_usage_org_id ON public.module_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_module_id ON public.module_usage(module_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_period ON public.module_usage(period_start, period_end);

-- ===========================================
-- 6. ENABLE RLS
-- ===========================================

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_usage ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.modules FORCE ROW LEVEL SECURITY;
ALTER TABLE public.module_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.module_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.module_usage FORCE ROW LEVEL SECURITY;

-- ===========================================
-- 7. RLS POLICIES
-- ===========================================

-- modules: readable by all authenticated users (reference data)
CREATE POLICY "modules_select" ON public.modules FOR SELECT
  TO authenticated
  USING (true);

-- module_subscriptions: organization members only
CREATE POLICY "module_subscriptions_select" ON public.module_subscriptions FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "module_subscriptions_insert" ON public.module_subscriptions FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "module_subscriptions_update" ON public.module_subscriptions FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "module_subscriptions_delete" ON public.module_subscriptions FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- module_limits: readable by all authenticated users (reference data)
CREATE POLICY "module_limits_select" ON public.module_limits FOR SELECT
  TO authenticated
  USING (true);

-- module_usage: organization members only
CREATE POLICY "module_usage_select" ON public.module_usage FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "module_usage_insert" ON public.module_usage FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "module_usage_update" ON public.module_usage FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()))
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "module_usage_delete" ON public.module_usage FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- ===========================================
-- 8. UPDATED_AT TRIGGERS
-- ===========================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_modules_updated_at ON public.modules;
CREATE TRIGGER set_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_module_subscriptions_updated_at ON public.module_subscriptions;
CREATE TRIGGER set_module_subscriptions_updated_at
  BEFORE UPDATE ON public.module_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_module_usage_updated_at ON public.module_usage;
CREATE TRIGGER set_module_usage_updated_at
  BEFORE UPDATE ON public.module_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===========================================
-- 9. COMMENTS
-- ===========================================

COMMENT ON TABLE public.modules IS 'Reference table of available modules in the platform';
COMMENT ON TABLE public.module_subscriptions IS 'Organization subscriptions to individual modules (free or paid)';
COMMENT ON TABLE public.module_limits IS 'Limits per module/tier (free vs paid)';
COMMENT ON TABLE public.module_usage IS 'Usage tracking per module per organization per period';

COMMIT;
-- ===========================================
-- 052_modules_seed_data.sql
-- Seed data for modules and limits
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/052_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. POPULATE MODULES REFERENCE DATA
-- ===========================================

INSERT INTO public.modules (id, name, description, icon, color, base_price_monthly, base_price_yearly, display_order) VALUES
  ('crm', 'CRM', 'Gestion de la relation client: contacts, entreprises, opportunites', 'users', '#3B82F6', 1490, 14900, 1),
  ('invoice', 'Facturation', 'Devis, factures, avoirs et suivi des paiements', 'file-text', '#22C55E', 990, 9900, 2),
  ('projects', 'Projets', 'Gestion de projets, taches et suivi du temps', 'folder-kanban', '#F97316', 990, 9900, 3),
  ('tickets', 'Tickets & Support', 'Support client, tickets, base de connaissances', 'ticket', '#8B5CF6', 990, 9900, 4),
  ('hr', 'Ressources Humaines', 'Gestion des employes, conges, contrats', 'user-circle', '#EF4444', 1490, 14900, 5),
  ('docs', 'Documents', 'Stockage et partage de documents', 'file-stack', '#6366F1', 490, 4900, 6),
  ('analytics', 'Analytics', 'Tableaux de bord et analyses avancees', 'bar-chart-3', '#14B8A6', 990, 9900, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  base_price_monthly = EXCLUDED.base_price_monthly,
  base_price_yearly = EXCLUDED.base_price_yearly,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- ===========================================
-- 2. POPULATE MODULE LIMITS - CRM
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('crm', 'free', 'max_contacts', 100, 'Maximum number of contacts'),
  ('crm', 'free', 'max_companies', 50, 'Maximum number of companies'),
  ('crm', 'free', 'max_deals', 25, 'Maximum number of active deals'),
  ('crm', 'free', 'max_pipelines', 1, 'Maximum number of pipelines'),
  ('crm', 'free', 'max_custom_fields', 5, 'Maximum number of custom fields'),
  ('crm', 'paid', 'max_contacts', -1, 'Unlimited contacts'),
  ('crm', 'paid', 'max_companies', -1, 'Unlimited companies'),
  ('crm', 'paid', 'max_deals', -1, 'Unlimited deals'),
  ('crm', 'paid', 'max_pipelines', -1, 'Unlimited pipelines'),
  ('crm', 'paid', 'max_custom_fields', -1, 'Unlimited custom fields')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 3. POPULATE MODULE LIMITS - INVOICE
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('invoice', 'free', 'max_invoices_per_month', 10, 'Maximum invoices per month'),
  ('invoice', 'free', 'max_quotes_per_month', 15, 'Maximum quotes per month'),
  ('invoice', 'free', 'max_clients', 20, 'Maximum number of clients'),
  ('invoice', 'free', 'max_products', 50, 'Maximum number of products'),
  ('invoice', 'free', 'recurring_invoices', 0, 'Recurring invoices (0 = disabled)'),
  ('invoice', 'paid', 'max_invoices_per_month', -1, 'Unlimited invoices'),
  ('invoice', 'paid', 'max_quotes_per_month', -1, 'Unlimited quotes'),
  ('invoice', 'paid', 'max_clients', -1, 'Unlimited clients'),
  ('invoice', 'paid', 'max_products', -1, 'Unlimited products'),
  ('invoice', 'paid', 'recurring_invoices', -1, 'Unlimited recurring invoices')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 4. POPULATE MODULE LIMITS - PROJECTS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('projects', 'free', 'max_projects', 3, 'Maximum number of projects'),
  ('projects', 'free', 'max_tasks_per_project', 50, 'Maximum tasks per project'),
  ('projects', 'free', 'max_members_per_project', 5, 'Maximum members per project'),
  ('projects', 'free', 'time_tracking', 0, 'Time tracking (0 = disabled)'),
  ('projects', 'paid', 'max_projects', -1, 'Unlimited projects'),
  ('projects', 'paid', 'max_tasks_per_project', -1, 'Unlimited tasks'),
  ('projects', 'paid', 'max_members_per_project', -1, 'Unlimited members'),
  ('projects', 'paid', 'time_tracking', -1, 'Time tracking enabled')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 5. POPULATE MODULE LIMITS - TICKETS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('tickets', 'free', 'max_tickets_per_month', 50, 'Maximum tickets per month'),
  ('tickets', 'free', 'max_kb_articles', 10, 'Maximum knowledge base articles'),
  ('tickets', 'free', 'max_canned_responses', 10, 'Maximum canned responses'),
  ('tickets', 'free', 'sla_policies', 1, 'Maximum SLA policies'),
  ('tickets', 'free', 'automation_rules', 0, 'Automation rules (0 = disabled)'),
  ('tickets', 'paid', 'max_tickets_per_month', -1, 'Unlimited tickets'),
  ('tickets', 'paid', 'max_kb_articles', -1, 'Unlimited KB articles'),
  ('tickets', 'paid', 'max_canned_responses', -1, 'Unlimited canned responses'),
  ('tickets', 'paid', 'sla_policies', -1, 'Unlimited SLA policies'),
  ('tickets', 'paid', 'automation_rules', -1, 'Unlimited automation rules')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 6. POPULATE MODULE LIMITS - HR
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('hr', 'free', 'max_employees', 5, 'Maximum number of employees'),
  ('hr', 'free', 'max_leave_types', 3, 'Maximum leave types'),
  ('hr', 'free', 'max_contracts_per_employee', 1, 'Maximum contracts per employee'),
  ('hr', 'free', 'document_storage', 0, 'Document storage (0 = disabled)'),
  ('hr', 'paid', 'max_employees', -1, 'Unlimited employees'),
  ('hr', 'paid', 'max_leave_types', -1, 'Unlimited leave types'),
  ('hr', 'paid', 'max_contracts_per_employee', -1, 'Unlimited contracts'),
  ('hr', 'paid', 'document_storage', -1, 'Document storage enabled')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 7. POPULATE MODULE LIMITS - DOCS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('docs', 'free', 'max_storage_mb', 500, 'Maximum storage in MB'),
  ('docs', 'free', 'max_folders', 10, 'Maximum number of folders'),
  ('docs', 'free', 'max_file_size_mb', 10, 'Maximum file size in MB'),
  ('docs', 'free', 'version_history', 0, 'Version history (0 = disabled)'),
  ('docs', 'paid', 'max_storage_mb', -1, 'Unlimited storage'),
  ('docs', 'paid', 'max_folders', -1, 'Unlimited folders'),
  ('docs', 'paid', 'max_file_size_mb', 100, 'Max 100MB per file'),
  ('docs', 'paid', 'version_history', -1, 'Full version history')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 8. POPULATE MODULE LIMITS - ANALYTICS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('analytics', 'free', 'max_dashboards', 1, 'Maximum dashboards'),
  ('analytics', 'free', 'max_widgets_per_dashboard', 4, 'Maximum widgets per dashboard'),
  ('analytics', 'free', 'data_retention_days', 30, 'Data retention in days'),
  ('analytics', 'free', 'export_reports', 0, 'Export reports (0 = disabled)'),
  ('analytics', 'paid', 'max_dashboards', -1, 'Unlimited dashboards'),
  ('analytics', 'paid', 'max_widgets_per_dashboard', -1, 'Unlimited widgets'),
  ('analytics', 'paid', 'data_retention_days', -1, 'Unlimited retention'),
  ('analytics', 'paid', 'export_reports', -1, 'Export enabled')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

COMMIT;
-- ===========================================
-- 053_module_helper_functions.sql
-- Helper functions for module billing system
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/053_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CHECK IF MODULE IS PAID
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_module_paid(
  p_org_id UUID,
  p_module_id TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.module_subscriptions
    WHERE organization_id = p_org_id
      AND module_id = p_module_id
      AND status IN ('active', 'trialing')
  );
$$;

-- ===========================================
-- 2. GET MODULE LIMIT
-- ===========================================

CREATE OR REPLACE FUNCTION public.get_module_limit(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
BEGIN
  SELECT CASE WHEN status IN ('active', 'trialing') THEN 'paid' ELSE 'free' END
  INTO v_tier
  FROM public.module_subscriptions
  WHERE organization_id = p_org_id AND module_id = p_module_id;

  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  SELECT limit_value INTO v_limit
  FROM public.module_limits
  WHERE module_id = p_module_id
    AND tier = v_tier
    AND limit_key = p_limit_key;

  RETURN COALESCE(v_limit, 0);
END;
$$;

-- ===========================================
-- 3. CHECK MODULE LIMIT
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_module_limit(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_limit INTEGER;
  v_current_usage INTEGER;
BEGIN
  v_limit := get_module_limit(p_org_id, p_module_id, p_limit_key);

  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;

  SELECT COALESCE(current_count, 0) INTO v_current_usage
  FROM public.module_usage
  WHERE organization_id = p_org_id
    AND module_id = p_module_id
    AND limit_key = p_limit_key
    AND period_start <= NOW()
    AND period_end > NOW();

  IF v_current_usage IS NULL THEN
    v_current_usage := 0;
  END IF;

  RETURN v_current_usage < v_limit;
END;
$$;

-- ===========================================
-- 4. INCREMENT MODULE USAGE
-- ===========================================

CREATE OR REPLACE FUNCTION public.increment_module_usage(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
  VALUES (p_org_id, p_module_id, p_limit_key, p_increment, v_period_start, v_period_end)
  ON CONFLICT (organization_id, module_id, limit_key, period_start)
  DO UPDATE SET
    current_count = module_usage.current_count + p_increment,
    updated_at = NOW();
END;
$$;

-- ===========================================
-- 5. DECREMENT MODULE USAGE
-- ===========================================

CREATE OR REPLACE FUNCTION public.decrement_module_usage(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT,
  p_decrement INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());

  UPDATE public.module_usage
  SET current_count = GREATEST(0, current_count - p_decrement),
      updated_at = NOW()
  WHERE organization_id = p_org_id
    AND module_id = p_module_id
    AND limit_key = p_limit_key
    AND period_start = v_period_start;
END;
$$;

-- ===========================================
-- 6. GET ORGANIZATION MODULES
-- ===========================================

CREATE OR REPLACE FUNCTION public.get_organization_modules(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_module RECORD;
  v_module_data JSONB;
  v_limits JSONB;
  v_usage JSONB;
BEGIN
  FOR v_module IN
    SELECT
      m.id,
      m.name,
      m.description,
      m.icon,
      m.color,
      m.base_price_monthly,
      m.base_price_yearly,
      COALESCE(ms.status, 'free') as status,
      ms.billing_cycle,
      ms.current_period_start,
      ms.current_period_end,
      ms.cancel_at_period_end,
      ms.trial_end
    FROM public.modules m
    LEFT JOIN public.module_subscriptions ms
      ON ms.module_id = m.id AND ms.organization_id = p_org_id
    WHERE m.is_active = TRUE
    ORDER BY m.display_order
  LOOP
    SELECT jsonb_object_agg(limit_key, limit_value)
    INTO v_limits
    FROM public.module_limits
    WHERE module_id = v_module.id
      AND tier = CASE WHEN v_module.status IN ('active', 'trialing') THEN 'paid' ELSE 'free' END;

    SELECT jsonb_object_agg(limit_key, current_count)
    INTO v_usage
    FROM public.module_usage
    WHERE organization_id = p_org_id
      AND module_id = v_module.id
      AND period_start <= NOW()
      AND period_end > NOW();

    v_module_data := jsonb_build_object(
      'id', v_module.id,
      'name', v_module.name,
      'description', v_module.description,
      'icon', v_module.icon,
      'color', v_module.color,
      'price_monthly', v_module.base_price_monthly,
      'price_yearly', v_module.base_price_yearly,
      'status', v_module.status,
      'billing_cycle', v_module.billing_cycle,
      'current_period_start', v_module.current_period_start,
      'current_period_end', v_module.current_period_end,
      'cancel_at_period_end', v_module.cancel_at_period_end,
      'trial_end', v_module.trial_end,
      'is_paid', v_module.status IN ('active', 'trialing'),
      'limits', COALESCE(v_limits, '{}'::JSONB),
      'usage', COALESCE(v_usage, '{}'::JSONB)
    );

    v_result := v_result || v_module_data;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ===========================================
-- 7. CHECK MODULE DOWNGRADE
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_module_downgrade(
  p_org_id UUID,
  p_module_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_exceeding_limits JSONB := '[]'::JSONB;
  v_can_downgrade BOOLEAN := TRUE;
  v_limit_record RECORD;
  v_current_count INTEGER;
BEGIN
  FOR v_limit_record IN
    SELECT limit_key, limit_value, description
    FROM public.module_limits
    WHERE module_id = p_module_id AND tier = 'free'
  LOOP
    CASE p_module_id
      WHEN 'crm' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_contacts' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.contacts WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_companies' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.companies WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_deals' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.deals WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_pipelines' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.pipelines WHERE organization_id = p_org_id;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'invoice' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_clients' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM invoice.clients WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_products' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM invoice.products WHERE organization_id = p_org_id AND deleted_at IS NULL;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'projects' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_projects' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM projects.projects WHERE organization_id = p_org_id AND deleted_at IS NULL;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'tickets' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_kb_articles' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM tickets.kb_articles WHERE organization_id = p_org_id;
          WHEN 'max_canned_responses' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM tickets.canned_responses WHERE organization_id = p_org_id;
          WHEN 'sla_policies' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM tickets.sla_policies WHERE organization_id = p_org_id;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'hr' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_employees' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM hr.employees WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_leave_types' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM hr.leave_types WHERE organization_id = p_org_id;
          ELSE
            v_current_count := 0;
        END CASE;

      ELSE
        v_current_count := 0;
    END CASE;

    IF v_limit_record.limit_value >= 0 AND v_current_count > v_limit_record.limit_value THEN
      v_can_downgrade := FALSE;
      v_exceeding_limits := v_exceeding_limits || jsonb_build_object(
        'key', v_limit_record.limit_key,
        'current', v_current_count,
        'free_limit', v_limit_record.limit_value,
        'description', COALESCE(v_limit_record.description, v_limit_record.limit_key)
      );
    END IF;
  END LOOP;

  IF NOT v_can_downgrade THEN
    v_result := jsonb_build_object(
      'can_downgrade', FALSE,
      'exceeding_limits', v_exceeding_limits,
      'warning_message', 'Attention: votre utilisation depasse les limites du plan gratuit.'
    );
  ELSE
    v_result := jsonb_build_object(
      'can_downgrade', TRUE,
      'exceeding_limits', '[]'::JSONB,
      'warning_message', NULL
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ===========================================
-- 8. STRIPE WEBHOOK HANDLERS
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_stripe_subscription_update(
  p_org_id UUID,
  p_module_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_stripe_customer_id TEXT,
  p_status TEXT,
  p_billing_cycle TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT FALSE,
  p_trial_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.module_subscriptions (
    organization_id,
    module_id,
    stripe_subscription_id,
    stripe_price_id,
    stripe_customer_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    trial_end
  )
  VALUES (
    p_org_id,
    p_module_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_stripe_customer_id,
    p_status,
    p_billing_cycle,
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end,
    p_trial_end
  )
  ON CONFLICT (organization_id, module_id)
  DO UPDATE SET
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    status = EXCLUDED.status,
    billing_cycle = EXCLUDED.billing_cycle,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    trial_end = EXCLUDED.trial_end,
    updated_at = NOW();

  RETURN jsonb_build_object('success', TRUE, 'module_id', p_module_id, 'status', p_status);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_stripe_subscription_canceled(
  p_stripe_subscription_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_module_id TEXT;
BEGIN
  SELECT organization_id, module_id
  INTO v_org_id, v_module_id
  FROM public.module_subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Subscription not found');
  END IF;

  UPDATE public.module_subscriptions
  SET
    status = 'canceled',
    canceled_at = NOW(),
    updated_at = NOW()
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'organization_id', v_org_id,
    'module_id', v_module_id,
    'status', 'canceled'
  );
END;
$$;

-- ===========================================
-- 9. GRANT PERMISSIONS
-- ===========================================

GRANT EXECUTE ON FUNCTION public.is_module_paid(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_module_limit(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_module_limit(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_module_usage(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_module_usage(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organization_modules(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_module_downgrade(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_stripe_subscription_update(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_stripe_subscription_canceled(TEXT) TO service_role;

-- ===========================================
-- 10. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.is_module_paid IS 'Check if a module is in paid status for an organization';
COMMENT ON FUNCTION public.get_module_limit IS 'Get the applicable limit for a module/org based on subscription tier';
COMMENT ON FUNCTION public.check_module_limit IS 'Check if an action is allowed (usage < limit)';
COMMENT ON FUNCTION public.increment_module_usage IS 'Increment usage counter for a module feature';
COMMENT ON FUNCTION public.decrement_module_usage IS 'Decrement usage counter for a module feature';
COMMENT ON FUNCTION public.get_organization_modules IS 'Get all modules with subscription status, limits and usage for an org';
COMMENT ON FUNCTION public.check_module_downgrade IS 'Check if an organization can safely downgrade a module to free tier';

COMMIT;
-- ===========================================
-- 054_provision_functions.sql
-- Provisioning functions for organizations
-- ===========================================
-- Dependencies: 053_module_helper_functions.sql
-- Rollback: rollbacks/054_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. PROVISION CRM DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_crm(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pipeline_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM crm.pipelines
    WHERE organization_id = p_org_id AND is_default = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  INSERT INTO crm.pipelines (organization_id, name, description, is_default)
  VALUES (
    p_org_id,
    'Pipeline de ventes',
    'Pipeline par defaut pour le suivi des opportunites commerciales',
    TRUE
  )
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm.pipeline_stages (pipeline_id, name, color, position, probability) VALUES
    (v_pipeline_id, 'Prospection', '#94A3B8', 1, 10),
    (v_pipeline_id, 'Qualification', '#60A5FA', 2, 25),
    (v_pipeline_id, 'Proposition', '#FBBF24', 3, 50),
    (v_pipeline_id, 'Negociation', '#F97316', 4, 75),
    (v_pipeline_id, 'Cloture', '#22C55E', 5, 100);

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning CRM for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 2. PROVISION INVOICE DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_invoice(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO invoice.organization_settings (
    organization_id,
    default_payment_terms,
    default_quote_validity,
    default_vat_rate,
    default_currency,
    legal_mentions,
    late_payment_penalty
  )
  VALUES (
    p_org_id,
    30,
    30,
    20.00,
    'EUR',
    'En cas de retard de paiement, des penalites de retard seront appliquees au taux legal en vigueur.',
    'Taux de penalite: 3 fois le taux d''interet legal'
  )
  ON CONFLICT (organization_id) DO NOTHING;

  INSERT INTO invoice.number_sequences (organization_id, type, prefix, current_number, padding)
  VALUES
    (p_org_id, 'invoice', 'FA-', 0, 4),
    (p_org_id, 'quote', 'DE-', 0, 4),
    (p_org_id, 'credit_note', 'AV-', 0, 4)
  ON CONFLICT (organization_id, type) DO NOTHING;

  INSERT INTO invoice.vat_rates (organization_id, name, rate, is_default) VALUES
    (p_org_id, 'TVA normale (20%)', 20.00, TRUE),
    (p_org_id, 'TVA intermediaire (10%)', 10.00, FALSE),
    (p_org_id, 'TVA reduite (5.5%)', 5.50, FALSE),
    (p_org_id, 'TVA super-reduite (2.1%)', 2.10, FALSE)
  ON CONFLICT (organization_id, rate) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning Invoice for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 3. PROVISION TICKETS DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_tickets(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sla_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tickets.sla_policies
    WHERE organization_id = p_org_id AND is_default = TRUE
  ) THEN
    INSERT INTO tickets.sla_policies (
      organization_id,
      name,
      description,
      urgent_first_response,
      urgent_resolution,
      high_first_response,
      high_resolution,
      normal_first_response,
      normal_resolution,
      low_first_response,
      low_resolution,
      business_hours_only,
      business_hours_start,
      business_hours_end,
      business_days,
      is_default,
      is_active
    )
    VALUES (
      p_org_id,
      'Standard',
      'Politique SLA par defaut',
      60, 240,
      240, 480,
      480, 1440,
      1440, 4320,
      TRUE,
      '09:00',
      '18:00',
      ARRAY[1,2,3,4,5],
      TRUE,
      TRUE
    )
    RETURNING id INTO v_sla_id;
  END IF;

  INSERT INTO tickets.categories (organization_id, name, description, color, icon, position, is_active) VALUES
    (p_org_id, 'Technique', 'Problemes techniques et bugs', '#EF4444', 'bug', 1, TRUE),
    (p_org_id, 'Commercial', 'Questions commerciales et devis', '#3B82F6', 'briefcase', 2, TRUE),
    (p_org_id, 'Administratif', 'Questions administratives et facturation', '#8B5CF6', 'file-text', 3, TRUE),
    (p_org_id, 'Autre', 'Autres demandes', '#6B7280', 'help-circle', 4, TRUE)
  ON CONFLICT (organization_id, name) DO NOTHING;

  INSERT INTO tickets.number_sequences (organization_id, prefix, current_number, padding)
  VALUES (p_org_id, 'TKT', 0, 5)
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning Tickets for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 4. PROVISION HR DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_hr(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO hr.settings (
    organization_id,
    annual_leave_days_per_year,
    rtt_days_per_year,
    leave_year_start_month,
    default_work_hours_per_week,
    work_days,
    alert_trial_end_days,
    alert_contract_end_days,
    alert_interview_days,
    employee_self_service_enabled,
    employees_can_request_leaves,
    employees_can_view_directory,
    employees_can_edit_profile
  )
  VALUES (
    p_org_id,
    25.0,
    10.0,
    6,
    35.0,
    '["monday","tuesday","wednesday","thursday","friday"]',
    15,
    30,
    30,
    TRUE,
    TRUE,
    TRUE,
    FALSE
  )
  ON CONFLICT (organization_id) DO NOTHING;

  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, requires_approval, deducts_from_balance, is_system) VALUES
    (p_org_id, 'Conges payes', 'cp', '#22C55E', TRUE, TRUE, TRUE, TRUE),
    (p_org_id, 'RTT', 'rtt', '#3B82F6', TRUE, TRUE, TRUE, TRUE),
    (p_org_id, 'Maladie', 'sick', '#EF4444', TRUE, FALSE, FALSE, TRUE),
    (p_org_id, 'Sans solde', 'unpaid', '#6B7280', FALSE, TRUE, FALSE, TRUE),
    (p_org_id, 'Conge parental', 'parental', '#8B5CF6', FALSE, TRUE, FALSE, TRUE)
  ON CONFLICT (organization_id, code) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning HR for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 5. PROVISION MODULE SUBSCRIPTIONS
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_module_subscriptions(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module RECORD;
BEGIN
  FOR v_module IN SELECT id FROM public.modules WHERE is_active = TRUE
  LOOP
    INSERT INTO public.module_subscriptions (organization_id, module_id, status)
    VALUES (p_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning module subscriptions for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 6. PROVISION MODULE USAGE
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_module_usage(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit RECORD;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  FOR v_limit IN
    SELECT DISTINCT module_id, limit_key
    FROM public.module_limits
    WHERE tier = 'free'
  LOOP
    INSERT INTO public.module_usage (
      organization_id,
      module_id,
      limit_key,
      current_count,
      period_start,
      period_end
    )
    VALUES (
      p_org_id,
      v_limit.module_id,
      v_limit.limit_key,
      0,
      v_period_start,
      v_period_end
    )
    ON CONFLICT (organization_id, module_id, limit_key, period_start) DO NOTHING;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning module usage for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 7. MAIN PROVISIONING FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_organization(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_crm_ok BOOLEAN;
  v_invoice_ok BOOLEAN;
  v_tickets_ok BOOLEAN;
  v_hr_ok BOOLEAN;
  v_modules_ok BOOLEAN;
  v_usage_ok BOOLEAN;
  v_result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_org_id) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Organization not found'
    );
  END IF;

  v_modules_ok := provision_module_subscriptions(p_org_id);
  v_usage_ok := provision_module_usage(p_org_id);
  v_crm_ok := provision_crm(p_org_id);
  v_invoice_ok := provision_invoice(p_org_id);
  v_tickets_ok := provision_tickets(p_org_id);
  v_hr_ok := provision_hr(p_org_id);

  v_result := jsonb_build_object(
    'success', (v_crm_ok AND v_invoice_ok AND v_tickets_ok AND v_hr_ok AND v_modules_ok AND v_usage_ok),
    'modules', jsonb_build_object(
      'subscriptions', v_modules_ok,
      'usage_tracking', v_usage_ok,
      'crm', v_crm_ok,
      'invoice', v_invoice_ok,
      'tickets', v_tickets_ok,
      'hr', v_hr_ok
    ),
    'provisioned_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- ===========================================
-- 8. CHECK ORGANIZATION PROVISIONED
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_organization_provisioned(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_crm_ok BOOLEAN;
  v_invoice_ok BOOLEAN;
  v_tickets_ok BOOLEAN;
  v_hr_ok BOOLEAN;
  v_modules_ok BOOLEAN;
  v_crm_count INTEGER;
  v_invoice_count INTEGER;
  v_tickets_count INTEGER;
  v_hr_count INTEGER;
  v_modules_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_org_id) THEN
    RETURN jsonb_build_object(
      'organization_id', p_org_id,
      'is_fully_provisioned', FALSE,
      'error', 'Organization not found'
    );
  END IF;

  SELECT COUNT(*) > 0, COUNT(*)
  INTO v_modules_ok, v_modules_count
  FROM public.module_subscriptions
  WHERE organization_id = p_org_id;

  SELECT
    EXISTS (SELECT 1 FROM crm.pipelines WHERE organization_id = p_org_id AND is_default = TRUE),
    (SELECT COUNT(*) FROM crm.pipeline_stages ps JOIN crm.pipelines p ON ps.pipeline_id = p.id WHERE p.organization_id = p_org_id)
  INTO v_crm_ok, v_crm_count;

  SELECT
    EXISTS (SELECT 1 FROM invoice.organization_settings WHERE organization_id = p_org_id),
    (SELECT COUNT(*) FROM invoice.vat_rates WHERE organization_id = p_org_id)
  INTO v_invoice_ok, v_invoice_count;

  SELECT
    EXISTS (SELECT 1 FROM tickets.sla_policies WHERE organization_id = p_org_id AND is_default = TRUE),
    (SELECT COUNT(*) FROM tickets.categories WHERE organization_id = p_org_id)
  INTO v_tickets_ok, v_tickets_count;

  SELECT
    EXISTS (SELECT 1 FROM hr.settings WHERE organization_id = p_org_id),
    (SELECT COUNT(*) FROM hr.leave_types WHERE organization_id = p_org_id)
  INTO v_hr_ok, v_hr_count;

  RETURN jsonb_build_object(
    'organization_id', p_org_id,
    'is_fully_provisioned', (v_crm_ok AND v_invoice_ok AND v_tickets_ok AND v_hr_ok AND v_modules_ok),
    'modules', jsonb_build_object(
      'crm', jsonb_build_object('provisioned', v_crm_ok, 'items_count', v_crm_count),
      'invoice', jsonb_build_object('provisioned', v_invoice_ok, 'items_count', v_invoice_count),
      'tickets', jsonb_build_object('provisioned', v_tickets_ok, 'items_count', v_tickets_count),
      'hr', jsonb_build_object('provisioned', v_hr_ok, 'items_count', v_hr_count)
    ),
    'subscriptions_count', v_modules_count,
    'checked_at', NOW()
  );
END;
$$;

-- ===========================================
-- 9. AUTO-PROVISION TRIGGERS
-- ===========================================

CREATE OR REPLACE FUNCTION public.trigger_provision_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NEW.onboarding_completed = TRUE THEN
    v_result := provision_organization(NEW.id);
    IF NOT (v_result->>'success')::BOOLEAN THEN
      RAISE WARNING 'Failed to provision organization %: %', NEW.id, v_result;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_organization_created ON public.organizations;
CREATE TRIGGER after_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_provision_organization();

CREATE OR REPLACE FUNCTION public.trigger_provision_organization_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NEW.onboarding_completed = TRUE AND (OLD.onboarding_completed = FALSE OR OLD.onboarding_completed IS NULL) THEN
    v_result := provision_organization(NEW.id);
    IF NOT (v_result->>'success')::BOOLEAN THEN
      RAISE WARNING 'Failed to provision organization %: %', NEW.id, v_result;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_organization_onboarding_completed ON public.organizations;
CREATE TRIGGER after_organization_onboarding_completed
  AFTER UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_provision_organization_on_update();

-- ===========================================
-- 10. GRANT PERMISSIONS
-- ===========================================

GRANT EXECUTE ON FUNCTION public.provision_organization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provision_organization(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_organization_provisioned(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_organization_provisioned(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.provision_module_subscriptions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provision_module_usage(UUID) TO authenticated;

-- ===========================================
-- 11. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.provision_organization IS 'Provisions all default data for a new organization';
COMMENT ON FUNCTION public.check_organization_provisioned IS 'Checks the provisioning status of an organization';
COMMENT ON FUNCTION public.provision_crm IS 'Provisions default CRM data (sales pipeline with 5 stages)';
COMMENT ON FUNCTION public.provision_invoice IS 'Provisions default invoice settings (FR prefixes, VAT rates)';
COMMENT ON FUNCTION public.provision_tickets IS 'Provisions default ticket settings (SLA policy, categories)';
COMMENT ON FUNCTION public.provision_hr IS 'Provisions default HR settings (FR leave types, 35h/week)';

COMMIT;
-- ===========================================
-- 055_auto_usage_tracking.sql
-- Auto increment/decrement module usage triggers
-- ===========================================
-- Dependencies: 053_module_helper_functions.sql
-- Rollback: rollbacks/055_rollback.sql
-- ===========================================
-- NOTE: Only creates triggers for existing schemas (crm, invoice)
-- Triggers for projects, hr, tickets, docs will be created
-- when those modules are implemented.
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CRM MODULE TRIGGERS
-- ===========================================

-- Contacts usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_contact_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_contacts', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_contacts', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'crm', 'max_contacts', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_contacts', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_contact_usage ON crm.contacts;
CREATE TRIGGER trg_contact_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON crm.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_contact_usage();

-- Companies usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_company_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_companies', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_companies', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'crm', 'max_companies', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_companies', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_company_usage ON crm.companies;
CREATE TRIGGER trg_company_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON crm.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_company_usage();

-- Deals usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_deal_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_deals', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_deals', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'crm', 'max_deals', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_deals', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deal_usage ON crm.deals;
CREATE TRIGGER trg_deal_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON crm.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_deal_usage();

-- Pipelines usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_pipeline_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_pipelines', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_pipelines', 1);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_pipeline_usage ON crm.pipelines;
CREATE TRIGGER trg_pipeline_usage
  AFTER INSERT OR DELETE ON crm.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_pipeline_usage();

-- ===========================================
-- 2. INVOICE MODULE TRIGGERS
-- ===========================================

-- Clients usage trigger
CREATE OR REPLACE FUNCTION public.handle_invoice_client_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_clients', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'invoice', 'max_clients', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'invoice', 'max_clients', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_clients', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_client_usage ON invoice.clients;
CREATE TRIGGER trg_client_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON invoice.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_client_usage();

-- Products usage trigger
CREATE OR REPLACE FUNCTION public.handle_invoice_product_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_products', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'invoice', 'max_products', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'invoice', 'max_products', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_products', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_product_usage ON invoice.products;
CREATE TRIGGER trg_product_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON invoice.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_product_usage();

-- ===========================================
-- 3. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.handle_crm_contact_usage IS 'Auto-increment/decrement contact usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_crm_company_usage IS 'Auto-increment/decrement company usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_crm_deal_usage IS 'Auto-increment/decrement deal usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_crm_pipeline_usage IS 'Auto-increment/decrement pipeline usage on insert/delete';
COMMENT ON FUNCTION public.handle_invoice_client_usage IS 'Auto-increment/decrement client usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_invoice_product_usage IS 'Auto-increment/decrement product usage on insert/delete/soft-delete';

-- ===========================================
-- NOTE: Future triggers for other modules
-- ===========================================
-- When implementing projects, hr, tickets, docs modules,
-- create additional migrations with their usage triggers:
--
-- projects.projects -> public.handle_projects_project_usage()
-- hr.employees -> public.handle_hr_employee_usage()
-- tickets.kb_articles -> public.handle_tickets_kb_article_usage()
-- tickets.canned_responses -> public.handle_tickets_canned_response_usage()
-- docs.files -> public.handle_docs_file_usage()
-- ===========================================

COMMIT;
-- ===========================================
-- 056_seed_existing_orgs.sql
-- Provision module subscriptions for existing organizations
-- ===========================================
-- Dependencies: 054_provision_functions.sql
-- Rollback: rollbacks/056_rollback.sql
-- ===========================================
-- NOTE: This migration should be run ONCE to migrate existing orgs
-- It will provision free module subscriptions for all existing organizations
-- ===========================================

BEGIN;

-- ===========================================
-- 1. MIGRATE EXISTING ORGANIZATIONS
-- ===========================================

DO $$
DECLARE
  r RECORD;
  v_result JSONB;
  v_migrated_count INTEGER := 0;
  v_failed_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Starting migration of existing organizations to module billing';
  RAISE NOTICE '====================================================';

  FOR r IN
    SELECT id, name, slug
    FROM public.organizations
    WHERE deleted_at IS NULL
  LOOP
    -- Check if already has module subscriptions
    IF EXISTS (
      SELECT 1 FROM public.module_subscriptions
      WHERE organization_id = r.id
      LIMIT 1
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      RAISE NOTICE 'Skipping org % (%): already has module subscriptions', r.name, r.id;
      CONTINUE;
    END IF;

    -- Provision module subscriptions
    BEGIN
      PERFORM public.provision_module_subscriptions(r.id);
      PERFORM public.provision_module_usage(r.id);

      v_migrated_count := v_migrated_count + 1;
      RAISE NOTICE 'Migrated org % (%): provisioned free subscriptions', r.name, r.id;

    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
      RAISE WARNING 'Failed to migrate org % (%): %', r.name, r.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  - Migrated: %', v_migrated_count;
  RAISE NOTICE '  - Skipped (already migrated): %', v_skipped_count;
  RAISE NOTICE '  - Failed: %', v_failed_count;
  RAISE NOTICE '====================================================';
END $$;

-- ===========================================
-- 2. SYNC USAGE COUNTERS WITH ACTUAL DATA
-- ===========================================

DO $$
DECLARE
  r RECORD;
  v_count INTEGER;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  RAISE NOTICE 'Syncing usage counters with actual data...';

  FOR r IN SELECT id FROM public.organizations WHERE deleted_at IS NULL
  LOOP
    -- CRM: Contacts
    SELECT COUNT(*) INTO v_count FROM crm.contacts WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_contacts', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- CRM: Companies
    SELECT COUNT(*) INTO v_count FROM crm.companies WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_companies', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- CRM: Deals
    SELECT COUNT(*) INTO v_count FROM crm.deals WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_deals', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- CRM: Pipelines
    SELECT COUNT(*) INTO v_count FROM crm.pipelines WHERE organization_id = r.id;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_pipelines', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Invoice: Clients
    SELECT COUNT(*) INTO v_count FROM invoice.clients WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'invoice', 'max_clients', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Invoice: Products
    SELECT COUNT(*) INTO v_count FROM invoice.products WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'invoice', 'max_products', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Projects: Projects
    SELECT COUNT(*) INTO v_count FROM projects.projects WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'projects', 'max_projects', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- HR: Employees
    SELECT COUNT(*) INTO v_count FROM hr.employees WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'hr', 'max_employees', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Tickets: KB Articles
    SELECT COUNT(*) INTO v_count FROM tickets.kb_articles WHERE organization_id = r.id;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'tickets', 'max_kb_articles', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Tickets: Canned Responses
    SELECT COUNT(*) INTO v_count FROM tickets.canned_responses WHERE organization_id = r.id;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'tickets', 'max_canned_responses', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Usage counters synced successfully';
END $$;

-- ===========================================
-- 3. VERIFY MIGRATION
-- ===========================================

DO $$
DECLARE
  v_org_count INTEGER;
  v_sub_count INTEGER;
  v_module_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_org_count FROM public.organizations WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_sub_count FROM public.module_subscriptions;
  SELECT COUNT(*) INTO v_module_count FROM public.modules WHERE is_active = TRUE;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Migration verification:';
  RAISE NOTICE '  - Total organizations: %', v_org_count;
  RAISE NOTICE '  - Total module subscriptions: %', v_sub_count;
  RAISE NOTICE '  - Expected subscriptions (orgs x modules): %', v_org_count * v_module_count;
  RAISE NOTICE '====================================================';

  IF v_sub_count < v_org_count * v_module_count THEN
    RAISE WARNING 'Some subscriptions may be missing!';
  ELSE
    RAISE NOTICE 'All organizations have module subscriptions';
  END IF;
END $$;

COMMIT;
-- ===========================================
-- 057_create_organization_rpc.sql
-- RPC function to create organization with owner
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/057_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. SLUG AVAILABILITY CHECK
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_slug_available(p_slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE slug = p_slug AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_slug_available(TEXT) TO authenticated;

-- ===========================================
-- 2. CREATE ORGANIZATION WITH OWNER
-- ===========================================

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_industry TEXT DEFAULT NULL,
  p_siret TEXT DEFAULT NULL,
  p_siren TEXT DEFAULT NULL,
  p_vat_number TEXT DEFAULT NULL,
  p_address JSONB DEFAULT '{}',
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Validate slug
  IF NOT is_slug_available(p_slug) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slug already taken');
  END IF;

  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    industry,
    siret,
    siren,
    vat_number,
    address,
    phone,
    email,
    created_by,
    onboarding_completed
  )
  VALUES (
    p_name,
    p_slug,
    p_industry,
    p_siret,
    p_siren,
    p_vat_number,
    p_address,
    p_phone,
    p_email,
    v_user_id,
    true
  )
  RETURNING id INTO v_org_id;

  -- Add creator as owner
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, v_user_id, 'owner', NOW());

  -- Create free subscriptions for all active modules
  FOR v_module IN SELECT id FROM modules WHERE is_active = true
  LOOP
    INSERT INTO module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- Return created org
  SELECT * INTO v_org FROM organizations WHERE id = v_org_id;
  RETURN jsonb_build_object('success', true, 'organization', row_to_json(v_org));
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- ===========================================
-- 3. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.is_slug_available IS 'Check if an organization slug is available';
COMMENT ON FUNCTION public.create_organization_with_owner IS 'Create a new organization with the current user as owner';

COMMIT;
-- ===========================================
-- 058_setup_organization_rpc.sql
-- RPC function for initial setup wizard
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/058_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. SETUP ORGANIZATION FUNCTION
-- Called from /setup page during first-time setup
-- ===========================================

CREATE OR REPLACE FUNCTION public.setup_organization(
  p_org_name TEXT,
  p_org_slug TEXT,
  p_admin_name TEXT,
  p_admin_email TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
BEGIN
  -- Validate user_id matches current auth user
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'User ID mismatch');
  END IF;

  -- Validate slug is available
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = p_org_slug AND deleted_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slug already taken');
  END IF;

  -- 1. Create or update user in public.users table
  INSERT INTO public.users (id, email, name, email_verified, created_at, updated_at)
  VALUES (p_user_id, p_admin_email, p_admin_name, true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

  -- 2. Create organization
  INSERT INTO public.organizations (
    name,
    slug,
    created_by,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    p_org_name,
    p_org_slug,
    p_user_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_org_id;

  -- 3. Add creator as owner
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, p_user_id, 'owner', NOW());

  -- 4. Create free subscriptions for all active modules
  FOR v_module IN SELECT id FROM public.modules WHERE is_active = true
  LOOP
    INSERT INTO public.module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- Return created org
  SELECT * INTO v_org FROM public.organizations WHERE id = v_org_id;
  RETURN jsonb_build_object('success', true, 'organization', row_to_json(v_org));

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.setup_organization(TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- ===========================================
-- 2. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.setup_organization IS 'First-time setup: create organization and link user as owner';

COMMIT;
-- ===========================================
-- 059_public_views.sql
-- Create public views for schema tables
-- ===========================================
-- This exposes tables from crm, invoice schemas
-- via public schema views for PostgREST access
-- Uses INSTEAD OF triggers for updatable views
-- ===========================================

BEGIN;

-- ===========================================
-- CRM CONTACTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_contacts CASCADE;
CREATE VIEW public.crm_contacts AS SELECT * FROM crm.contacts;

CREATE OR REPLACE FUNCTION public.crm_contacts_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.contacts (id, organization_id, first_name, last_name, email, phone, mobile, job_title, company_id, source, source_details, address_line1, address_line2, city, postal_code, country, custom_fields, tags, owner_id, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.first_name, NEW.last_name, NEW.email, NEW.phone, NEW.mobile, NEW.job_title, NEW.company_id, NEW.source, NEW.source_details, NEW.address_line1, NEW.address_line2, NEW.city, NEW.postal_code, COALESCE(NEW.country, 'France'), COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.tags, '{}'), NEW.owner_id, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.contacts SET
      organization_id = NEW.organization_id, first_name = NEW.first_name, last_name = NEW.last_name, email = NEW.email, phone = NEW.phone, mobile = NEW.mobile, job_title = NEW.job_title, company_id = NEW.company_id, source = NEW.source, source_details = NEW.source_details, address_line1 = NEW.address_line1, address_line2 = NEW.address_line2, city = NEW.city, postal_code = NEW.postal_code, country = NEW.country, custom_fields = NEW.custom_fields, tags = NEW.tags, owner_id = NEW.owner_id, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.contacts WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_contacts_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.crm_contacts_trigger();

-- ===========================================
-- CRM COMPANIES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_companies CASCADE;
CREATE VIEW public.crm_companies AS SELECT * FROM crm.companies;

CREATE OR REPLACE FUNCTION public.crm_companies_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.companies (id, organization_id, name, siret, website, industry, size, address_line1, address_line2, city, postal_code, country, phone, email, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.siret, NEW.website, NEW.industry, NEW.size, NEW.address_line1, NEW.address_line2, NEW.city, NEW.postal_code, COALESCE(NEW.country, 'France'), NEW.phone, NEW.email, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.companies SET
      organization_id = NEW.organization_id, name = NEW.name, siret = NEW.siret, website = NEW.website, industry = NEW.industry, size = NEW.size, address_line1 = NEW.address_line1, address_line2 = NEW.address_line2, city = NEW.city, postal_code = NEW.postal_code, country = NEW.country, phone = NEW.phone, email = NEW.email, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.companies WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_companies_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.crm_companies_trigger();

-- ===========================================
-- CRM DEALS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_deals CASCADE;
CREATE VIEW public.crm_deals AS SELECT * FROM crm.deals;

CREATE OR REPLACE FUNCTION public.crm_deals_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.deals (id, organization_id, pipeline_id, stage_id, name, amount, currency, probability, expected_close_date, contact_id, company_id, status, owner_id, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.pipeline_id, NEW.stage_id, NEW.name, NEW.amount, COALESCE(NEW.currency, 'EUR'), NEW.probability, NEW.expected_close_date, NEW.contact_id, NEW.company_id, COALESCE(NEW.status, 'open'), NEW.owner_id, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.deals SET
      organization_id = NEW.organization_id, pipeline_id = NEW.pipeline_id, stage_id = NEW.stage_id, name = NEW.name, amount = NEW.amount, currency = NEW.currency, probability = NEW.probability, expected_close_date = NEW.expected_close_date, contact_id = NEW.contact_id, company_id = NEW.company_id, status = NEW.status, won_at = NEW.won_at, lost_at = NEW.lost_at, lost_reason = NEW.lost_reason, owner_id = NEW.owner_id, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.deals WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_deals_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.crm_deals_trigger();

-- ===========================================
-- CRM ACTIVITIES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_activities CASCADE;
CREATE VIEW public.crm_activities AS SELECT * FROM crm.activities;

CREATE OR REPLACE FUNCTION public.crm_activities_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.activities (id, organization_id, type, subject, description, contact_id, company_id, deal_id, due_date, completed_at, duration_minutes, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.type, NEW.subject, NEW.description, NEW.contact_id, NEW.company_id, NEW.deal_id, NEW.due_date, NEW.completed_at, NEW.duration_minutes, NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.activities SET
      organization_id = NEW.organization_id, type = NEW.type, subject = NEW.subject, description = NEW.description, contact_id = NEW.contact_id, company_id = NEW.company_id, deal_id = NEW.deal_id, due_date = NEW.due_date, completed_at = NEW.completed_at, duration_minutes = NEW.duration_minutes, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.activities WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_activities_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_activities FOR EACH ROW EXECUTE FUNCTION public.crm_activities_trigger();

-- ===========================================
-- CRM PIPELINES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_pipelines CASCADE;
CREATE VIEW public.crm_pipelines AS SELECT * FROM crm.pipelines;

CREATE OR REPLACE FUNCTION public.crm_pipelines_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.pipelines (id, organization_id, name, description, is_default, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.description, COALESCE(NEW.is_default, false), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.pipelines SET
      organization_id = NEW.organization_id, name = NEW.name, description = NEW.description, is_default = NEW.is_default, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.pipelines WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_pipelines_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_pipelines FOR EACH ROW EXECUTE FUNCTION public.crm_pipelines_trigger();

-- ===========================================
-- CRM PIPELINE STAGES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_pipeline_stages CASCADE;
CREATE VIEW public.crm_pipeline_stages AS SELECT * FROM crm.pipeline_stages;

CREATE OR REPLACE FUNCTION public.crm_pipeline_stages_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.pipeline_stages (id, pipeline_id, name, position, color, probability, is_won, is_lost, created_at, updated_at)
    VALUES (v_id, NEW.pipeline_id, NEW.name, NEW.position, NEW.color, NEW.probability, COALESCE(NEW.is_won, false), COALESCE(NEW.is_lost, false), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.pipeline_stages SET
      pipeline_id = NEW.pipeline_id, name = NEW.name, position = NEW.position, color = NEW.color, probability = NEW.probability, is_won = NEW.is_won, is_lost = NEW.is_lost, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.pipeline_stages WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_pipeline_stages_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.crm_pipeline_stages_trigger();

-- ===========================================
-- INVOICE CLIENTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_clients CASCADE;
CREATE VIEW public.invoice_clients AS SELECT * FROM invoice.clients;

CREATE OR REPLACE FUNCTION public.invoice_clients_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.clients (id, organization_id, name, legal_name, siret, vat_number, legal_form, billing_address_line1, billing_address_line2, billing_city, billing_postal_code, billing_country, billing_email, billing_phone, contact_name, payment_terms, payment_method, default_currency, crm_company_id, crm_contact_id, notes, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.legal_name, NEW.siret, NEW.vat_number, NEW.legal_form, NEW.billing_address_line1, NEW.billing_address_line2, NEW.billing_city, NEW.billing_postal_code, COALESCE(NEW.billing_country, 'France'), NEW.billing_email, NEW.billing_phone, NEW.contact_name, COALESCE(NEW.payment_terms, 30), COALESCE(NEW.payment_method, 'transfer'), COALESCE(NEW.default_currency, 'EUR'), NEW.crm_company_id, NEW.crm_contact_id, NEW.notes, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.clients SET
      organization_id = NEW.organization_id, name = NEW.name, legal_name = NEW.legal_name, siret = NEW.siret, vat_number = NEW.vat_number, legal_form = NEW.legal_form, billing_address_line1 = NEW.billing_address_line1, billing_address_line2 = NEW.billing_address_line2, billing_city = NEW.billing_city, billing_postal_code = NEW.billing_postal_code, billing_country = NEW.billing_country, billing_email = NEW.billing_email, billing_phone = NEW.billing_phone, contact_name = NEW.contact_name, payment_terms = NEW.payment_terms, payment_method = NEW.payment_method, default_currency = NEW.default_currency, crm_company_id = NEW.crm_company_id, crm_contact_id = NEW.crm_contact_id, notes = NEW.notes, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.clients WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_clients_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_clients FOR EACH ROW EXECUTE FUNCTION public.invoice_clients_trigger();

-- ===========================================
-- INVOICE PRODUCTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_products CASCADE;
CREATE VIEW public.invoice_products AS SELECT * FROM invoice.products;

CREATE OR REPLACE FUNCTION public.invoice_products_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.products (id, organization_id, name, description, sku, unit_price, unit, vat_rate, category, is_active, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.description, NEW.sku, NEW.unit_price, COALESCE(NEW.unit, 'unite'), COALESCE(NEW.vat_rate, 20), NEW.category, COALESCE(NEW.is_active, true), COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.products SET
      organization_id = NEW.organization_id, name = NEW.name, description = NEW.description, sku = NEW.sku, unit_price = NEW.unit_price, unit = NEW.unit, vat_rate = NEW.vat_rate, category = NEW.category, is_active = NEW.is_active, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.products WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_products_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_products FOR EACH ROW EXECUTE FUNCTION public.invoice_products_trigger();

-- ===========================================
-- INVOICE INVOICES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_invoices CASCADE;
CREATE VIEW public.invoice_invoices AS SELECT * FROM invoice.invoices;

CREATE OR REPLACE FUNCTION public.invoice_invoices_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.invoices (id, organization_id, client_id, invoice_number, status, issue_date, due_date, subtotal, discount_amount, discount_percent, vat_amount, total, amount_paid, amount_due, currency, subject, introduction, terms, notes, footer, payment_instructions, quote_id, deal_id, custom_fields, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.client_id, NEW.invoice_number, COALESCE(NEW.status, 'draft'), NEW.issue_date, NEW.due_date, COALESCE(NEW.subtotal, 0), COALESCE(NEW.discount_amount, 0), NEW.discount_percent, COALESCE(NEW.vat_amount, 0), COALESCE(NEW.total, 0), COALESCE(NEW.amount_paid, 0), COALESCE(NEW.amount_due, 0), COALESCE(NEW.currency, 'EUR'), NEW.subject, NEW.introduction, NEW.terms, NEW.notes, NEW.footer, NEW.payment_instructions, NEW.quote_id, NEW.deal_id, COALESCE(NEW.custom_fields, '{}'), NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.invoices SET
      organization_id = NEW.organization_id, client_id = NEW.client_id, invoice_number = NEW.invoice_number, status = NEW.status, issue_date = NEW.issue_date, due_date = NEW.due_date, sent_at = NEW.sent_at, paid_at = NEW.paid_at, subtotal = NEW.subtotal, discount_amount = NEW.discount_amount, discount_percent = NEW.discount_percent, vat_amount = NEW.vat_amount, total = NEW.total, amount_paid = NEW.amount_paid, amount_due = NEW.amount_due, currency = NEW.currency, subject = NEW.subject, introduction = NEW.introduction, terms = NEW.terms, notes = NEW.notes, footer = NEW.footer, payment_instructions = NEW.payment_instructions, quote_id = NEW.quote_id, reminder_count = NEW.reminder_count, last_reminder_at = NEW.last_reminder_at, deal_id = NEW.deal_id, custom_fields = NEW.custom_fields, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.invoices WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_invoices_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_invoices FOR EACH ROW EXECUTE FUNCTION public.invoice_invoices_trigger();

-- ===========================================
-- INVOICE QUOTES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_quotes CASCADE;
CREATE VIEW public.invoice_quotes AS SELECT * FROM invoice.quotes;

CREATE OR REPLACE FUNCTION public.invoice_quotes_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.quotes (id, organization_id, client_id, quote_number, status, issue_date, valid_until, subtotal, discount_amount, discount_percent, vat_amount, total, currency, subject, introduction, terms, notes, footer, deal_id, custom_fields, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.client_id, NEW.quote_number, COALESCE(NEW.status, 'draft'), NEW.issue_date, NEW.valid_until, COALESCE(NEW.subtotal, 0), COALESCE(NEW.discount_amount, 0), NEW.discount_percent, COALESCE(NEW.vat_amount, 0), COALESCE(NEW.total, 0), COALESCE(NEW.currency, 'EUR'), NEW.subject, NEW.introduction, NEW.terms, NEW.notes, NEW.footer, NEW.deal_id, COALESCE(NEW.custom_fields, '{}'), NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.quotes SET
      organization_id = NEW.organization_id, client_id = NEW.client_id, quote_number = NEW.quote_number, status = NEW.status, issue_date = NEW.issue_date, valid_until = NEW.valid_until, accepted_at = NEW.accepted_at, rejected_at = NEW.rejected_at, subtotal = NEW.subtotal, discount_amount = NEW.discount_amount, discount_percent = NEW.discount_percent, vat_amount = NEW.vat_amount, total = NEW.total, currency = NEW.currency, subject = NEW.subject, introduction = NEW.introduction, terms = NEW.terms, notes = NEW.notes, footer = NEW.footer, deal_id = NEW.deal_id, custom_fields = NEW.custom_fields, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.quotes WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_quotes_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_quotes FOR EACH ROW EXECUTE FUNCTION public.invoice_quotes_trigger();

-- ===========================================
-- INVOICE LINE ITEMS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_line_items CASCADE;
CREATE VIEW public.invoice_line_items AS SELECT * FROM invoice.line_items;

CREATE OR REPLACE FUNCTION public.invoice_line_items_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.line_items (id, document_type, document_id, position, product_id, description, quantity, unit, unit_price, discount_percent, discount_amount, vat_rate, vat_amount, line_total, line_total_with_vat, created_at, updated_at)
    VALUES (v_id, NEW.document_type, NEW.document_id, COALESCE(NEW.position, 0), NEW.product_id, NEW.description, COALESCE(NEW.quantity, 1), COALESCE(NEW.unit, 'unite'), NEW.unit_price, NEW.discount_percent, NEW.discount_amount, COALESCE(NEW.vat_rate, 20), NEW.vat_amount, COALESCE(NEW.line_total, 0), COALESCE(NEW.line_total_with_vat, 0), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.line_items SET
      document_type = NEW.document_type, document_id = NEW.document_id, position = NEW.position, product_id = NEW.product_id, description = NEW.description, quantity = NEW.quantity, unit = NEW.unit, unit_price = NEW.unit_price, discount_percent = NEW.discount_percent, discount_amount = NEW.discount_amount, vat_rate = NEW.vat_rate, vat_amount = NEW.vat_amount, line_total = NEW.line_total, line_total_with_vat = NEW.line_total_with_vat, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.line_items WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_line_items_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_line_items FOR EACH ROW EXECUTE FUNCTION public.invoice_line_items_trigger();

-- ===========================================
-- INVOICE PAYMENTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_payments CASCADE;
CREATE VIEW public.invoice_payments AS SELECT * FROM invoice.payments;

CREATE OR REPLACE FUNCTION public.invoice_payments_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.payments (id, organization_id, invoice_id, amount, currency, payment_date, payment_method, reference, notes, recorded_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.invoice_id, NEW.amount, COALESCE(NEW.currency, 'EUR'), NEW.payment_date, NEW.payment_method, NEW.reference, NEW.notes, NEW.recorded_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.payments SET
      organization_id = NEW.organization_id, invoice_id = NEW.invoice_id, amount = NEW.amount, currency = NEW.currency, payment_date = NEW.payment_date, payment_method = NEW.payment_method, reference = NEW.reference, notes = NEW.notes, recorded_by = NEW.recorded_by, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.payments WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_payments_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_payments FOR EACH ROW EXECUTE FUNCTION public.invoice_payments_trigger();

-- ===========================================
-- INVOICE CREDIT NOTES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_credit_notes CASCADE;
CREATE VIEW public.invoice_credit_notes AS SELECT * FROM invoice.credit_notes;

CREATE OR REPLACE FUNCTION public.invoice_credit_notes_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.credit_notes (id, organization_id, client_id, invoice_id, credit_note_number, status, issue_date, reason, subtotal, vat_amount, total, currency, notes, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.client_id, NEW.invoice_id, NEW.credit_note_number, COALESCE(NEW.status, 'draft'), NEW.issue_date, NEW.reason, COALESCE(NEW.subtotal, 0), COALESCE(NEW.vat_amount, 0), COALESCE(NEW.total, 0), COALESCE(NEW.currency, 'EUR'), NEW.notes, NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.credit_notes SET
      organization_id = NEW.organization_id, client_id = NEW.client_id, invoice_id = NEW.invoice_id, credit_note_number = NEW.credit_note_number, status = NEW.status, issue_date = NEW.issue_date, reason = NEW.reason, subtotal = NEW.subtotal, vat_amount = NEW.vat_amount, total = NEW.total, currency = NEW.currency, notes = NEW.notes, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.credit_notes WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_credit_notes_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_credit_notes FOR EACH ROW EXECUTE FUNCTION public.invoice_credit_notes_trigger();

-- ===========================================
-- GRANTS
-- ===========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_pipelines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_pipeline_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_credit_notes TO authenticated;

COMMIT;
-- ===========================================
-- 060_hr_schema.sql
-- HR Module Schema
-- ===========================================

BEGIN;

-- ===========================================
-- CREATE HR SCHEMA
-- ===========================================

CREATE SCHEMA IF NOT EXISTS hr;
GRANT USAGE ON SCHEMA hr TO anon, authenticated;

-- ===========================================
-- ENUM TYPES
-- ===========================================

DO $$ BEGIN
  CREATE TYPE hr.contract_type AS ENUM ('cdi', 'cdd', 'stage', 'alternance', 'freelance', 'interim');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.employee_status AS ENUM ('active', 'trial_period', 'notice_period', 'left');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.leave_type_code AS ENUM ('cp', 'rtt', 'sick', 'unpaid', 'maternity', 'paternity', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.leave_status AS ENUM ('pending', 'approved', 'rejected', 'canceled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.document_type AS ENUM ('contract', 'id_card', 'diploma', 'rib', 'medical', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.interview_type AS ENUM ('annual', 'professional', 'trial_end', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.interview_status AS ENUM ('scheduled', 'completed', 'canceled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TABLE: HR Settings
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  annual_leave_days_per_year DECIMAL(4,1) DEFAULT 25,
  rtt_days_per_year DECIMAL(4,1) DEFAULT 0,
  leave_year_start_month INTEGER DEFAULT 6,
  default_work_hours_per_week DECIMAL(4,1) DEFAULT 35,
  work_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
  alert_trial_end_days INTEGER DEFAULT 15,
  alert_contract_end_days INTEGER DEFAULT 30,
  alert_interview_days INTEGER DEFAULT 30,
  employee_self_service_enabled BOOLEAN DEFAULT FALSE,
  employees_can_request_leaves BOOLEAN DEFAULT TRUE,
  employees_can_view_directory BOOLEAN DEFAULT TRUE,
  employees_can_edit_profile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TABLE: Employees
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  birth_date DATE,
  birth_place VARCHAR(255),
  nationality VARCHAR(100) DEFAULT 'Française',
  social_security_number VARCHAR(21),
  photo_url TEXT,
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relation VARCHAR(100),
  employee_number VARCHAR(50),
  job_title VARCHAR(255),
  department VARCHAR(100),
  manager_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
  work_email VARCHAR(255),
  work_phone VARCHAR(50),
  contract_type hr.contract_type,
  contract_start_date DATE,
  contract_end_date DATE,
  trial_end_date DATE,
  gross_salary DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  annual_leave_balance DECIMAL(5,2) DEFAULT 0,
  rtt_balance DECIMAL(5,2) DEFAULT 0,
  status hr.employee_status DEFAULT 'active',
  left_date DATE,
  left_reason TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Interviews
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,
  type hr.interview_type NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  interviewer_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
  objectives TEXT,
  achievements TEXT,
  feedback TEXT,
  development_plan TEXT,
  employee_comments TEXT,
  document_url TEXT,
  status hr.interview_status DEFAULT 'scheduled',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Leave Types
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  deducts_from_balance BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- ===========================================
-- TABLE: Leave Requests
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES hr.leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_half_day BOOLEAN DEFAULT FALSE,
  end_half_day BOOLEAN DEFAULT FALSE,
  days_count DECIMAL(4,1) NOT NULL DEFAULT 1,
  reason TEXT,
  status hr.leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Time Entries
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  break_duration_minutes INTEGER DEFAULT 0,
  hours_worked DECIMAL(4,2) NOT NULL,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  notes TEXT,
  validated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, employee_id, date)
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_hr_employees_org ON hr.employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_status ON hr.employees(status);
CREATE INDEX IF NOT EXISTS idx_hr_employees_manager ON hr.employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_deleted ON hr.employees(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hr_interviews_employee ON hr.interviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_interviews_org ON hr.interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_employee ON hr.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_org ON hr.leave_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_entries_employee ON hr.time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_entries_org ON hr.time_entries(organization_id);

-- ===========================================
-- RLS
-- ===========================================

ALTER TABLE hr.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.time_entries ENABLE ROW LEVEL SECURITY;

-- HR Settings policies
CREATE POLICY "hr_settings_select" ON hr.settings FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_settings_insert" ON hr.settings FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_settings_update" ON hr.settings FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Employees policies
CREATE POLICY "hr_employees_select" ON hr.employees FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()) AND deleted_at IS NULL);
CREATE POLICY "hr_employees_insert" ON hr.employees FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_employees_update" ON hr.employees FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_employees_delete" ON hr.employees FOR DELETE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Interviews policies
CREATE POLICY "hr_interviews_select" ON hr.interviews FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_interviews_insert" ON hr.interviews FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_interviews_update" ON hr.interviews FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_interviews_delete" ON hr.interviews FOR DELETE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Leave Types policies
CREATE POLICY "hr_leave_types_select" ON hr.leave_types FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_leave_types_insert" ON hr.leave_types FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_leave_types_update" ON hr.leave_types FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Leave Requests policies
CREATE POLICY "hr_leave_requests_select" ON hr.leave_requests FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_leave_requests_insert" ON hr.leave_requests FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_leave_requests_update" ON hr.leave_requests FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- Time Entries policies
CREATE POLICY "hr_time_entries_select" ON hr.time_entries FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_time_entries_insert" ON hr.time_entries FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_time_entries_update" ON hr.time_entries FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- ===========================================
-- GRANTS
-- ===========================================

GRANT ALL ON ALL TABLES IN SCHEMA hr TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA hr TO authenticated;

COMMIT;

-- ===========================================
-- PROJECTS SCHEMA
-- ===========================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS projects;
GRANT USAGE ON SCHEMA projects TO anon, authenticated;

-- Projects table (referenced by provisioning functions)
CREATE TABLE IF NOT EXISTS projects.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON projects.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects.projects(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON projects.projects;
CREATE POLICY "projects_select" ON projects.projects FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "projects_insert" ON projects.projects;
CREATE POLICY "projects_insert" ON projects.projects FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "projects_update" ON projects.projects;
CREATE POLICY "projects_update" ON projects.projects FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "projects_delete" ON projects.projects;
CREATE POLICY "projects_delete" ON projects.projects FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

GRANT ALL ON ALL TABLES IN SCHEMA projects TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA projects TO authenticated;

COMMIT;

-- ===========================================
-- TICKETS SCHEMA
-- ===========================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS tickets;
GRANT USAGE ON SCHEMA tickets TO anon, authenticated;

-- SLA Policies table
CREATE TABLE IF NOT EXISTS tickets.sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  urgent_first_response INTEGER DEFAULT 60,
  urgent_resolution INTEGER DEFAULT 240,
  high_first_response INTEGER DEFAULT 240,
  high_resolution INTEGER DEFAULT 480,
  normal_first_response INTEGER DEFAULT 480,
  normal_resolution INTEGER DEFAULT 1440,
  low_first_response INTEGER DEFAULT 1440,
  low_resolution INTEGER DEFAULT 4320,
  business_hours_only BOOLEAN DEFAULT TRUE,
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '18:00',
  business_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_org ON tickets.sla_policies(organization_id);

-- Categories table
CREATE TABLE IF NOT EXISTS tickets.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#6B7280',
  icon VARCHAR(50) DEFAULT 'help-circle',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_category_name UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_org ON tickets.categories(organization_id);

-- Number sequences table
CREATE TABLE IF NOT EXISTS tickets.number_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  prefix VARCHAR(10) DEFAULT 'TKT',
  current_number INTEGER DEFAULT 0,
  padding INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KB Articles table
CREATE TABLE IF NOT EXISTS tickets.kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category_id UUID REFERENCES tickets.categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_org ON tickets.kb_articles(organization_id);

-- Canned Responses table
CREATE TABLE IF NOT EXISTS tickets.canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  shortcut VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canned_responses_org ON tickets.canned_responses(organization_id);

-- Enable RLS
ALTER TABLE tickets.sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.canned_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sla_policies
DROP POLICY IF EXISTS "sla_policies_select" ON tickets.sla_policies;
CREATE POLICY "sla_policies_select" ON tickets.sla_policies FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "sla_policies_insert" ON tickets.sla_policies;
CREATE POLICY "sla_policies_insert" ON tickets.sla_policies FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "sla_policies_update" ON tickets.sla_policies;
CREATE POLICY "sla_policies_update" ON tickets.sla_policies FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "sla_policies_delete" ON tickets.sla_policies;
CREATE POLICY "sla_policies_delete" ON tickets.sla_policies FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- RLS Policies for categories
DROP POLICY IF EXISTS "categories_select" ON tickets.categories;
CREATE POLICY "categories_select" ON tickets.categories FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "categories_insert" ON tickets.categories;
CREATE POLICY "categories_insert" ON tickets.categories FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "categories_update" ON tickets.categories;
CREATE POLICY "categories_update" ON tickets.categories FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "categories_delete" ON tickets.categories;
CREATE POLICY "categories_delete" ON tickets.categories FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- RLS Policies for number_sequences
DROP POLICY IF EXISTS "number_sequences_select" ON tickets.number_sequences;
CREATE POLICY "number_sequences_select" ON tickets.number_sequences FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "number_sequences_insert" ON tickets.number_sequences;
CREATE POLICY "number_sequences_insert" ON tickets.number_sequences FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "number_sequences_update" ON tickets.number_sequences;
CREATE POLICY "number_sequences_update" ON tickets.number_sequences FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- RLS Policies for kb_articles
DROP POLICY IF EXISTS "kb_articles_select" ON tickets.kb_articles;
CREATE POLICY "kb_articles_select" ON tickets.kb_articles FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "kb_articles_insert" ON tickets.kb_articles;
CREATE POLICY "kb_articles_insert" ON tickets.kb_articles FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "kb_articles_update" ON tickets.kb_articles;
CREATE POLICY "kb_articles_update" ON tickets.kb_articles FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "kb_articles_delete" ON tickets.kb_articles;
CREATE POLICY "kb_articles_delete" ON tickets.kb_articles FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- RLS Policies for canned_responses
DROP POLICY IF EXISTS "canned_responses_select" ON tickets.canned_responses;
CREATE POLICY "canned_responses_select" ON tickets.canned_responses FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "canned_responses_insert" ON tickets.canned_responses;
CREATE POLICY "canned_responses_insert" ON tickets.canned_responses FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "canned_responses_update" ON tickets.canned_responses;
CREATE POLICY "canned_responses_update" ON tickets.canned_responses FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

DROP POLICY IF EXISTS "canned_responses_delete" ON tickets.canned_responses;
CREATE POLICY "canned_responses_delete" ON tickets.canned_responses FOR DELETE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

GRANT ALL ON ALL TABLES IN SCHEMA tickets TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tickets TO authenticated;

COMMIT;

-- ===========================================
-- 061_hr_views.sql
-- Public views for HR schema tables
-- ===========================================
-- Depends on: 060_hr_schema.sql
-- ===========================================

BEGIN;

-- ===========================================
-- HR EMPLOYEES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_employees CASCADE;
CREATE VIEW public.hr_employees AS SELECT * FROM hr.employees;

CREATE OR REPLACE FUNCTION public.hr_employees_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.employees (id, organization_id, user_id, first_name, last_name, email, phone, birth_date, birth_place, nationality, social_security_number, photo_url, address_line_1, address_line_2, city, postal_code, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, employee_number, job_title, department, manager_id, work_email, work_phone, contract_type, contract_start_date, contract_end_date, trial_end_date, gross_salary, salary_currency, annual_leave_balance, rtt_balance, status, left_date, left_reason, notes, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.user_id, NEW.first_name, NEW.last_name, NEW.email, NEW.phone, NEW.birth_date, NEW.birth_place, COALESCE(NEW.nationality, 'Française'), NEW.social_security_number, NEW.photo_url, NEW.address_line_1, NEW.address_line_2, NEW.city, NEW.postal_code, COALESCE(NEW.country, 'France'), NEW.emergency_contact_name, NEW.emergency_contact_phone, NEW.emergency_contact_relation, NEW.employee_number, NEW.job_title, NEW.department, NEW.manager_id, NEW.work_email, NEW.work_phone, NEW.contract_type, NEW.contract_start_date, NEW.contract_end_date, NEW.trial_end_date, NEW.gross_salary, COALESCE(NEW.salary_currency, 'EUR'), COALESCE(NEW.annual_leave_balance, 0), COALESCE(NEW.rtt_balance, 0), COALESCE(NEW.status, 'active'), NEW.left_date, NEW.left_reason, NEW.notes, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.employees SET
      organization_id = NEW.organization_id, user_id = NEW.user_id, first_name = NEW.first_name, last_name = NEW.last_name, email = NEW.email, phone = NEW.phone, birth_date = NEW.birth_date, birth_place = NEW.birth_place, nationality = NEW.nationality, social_security_number = NEW.social_security_number, photo_url = NEW.photo_url, address_line_1 = NEW.address_line_1, address_line_2 = NEW.address_line_2, city = NEW.city, postal_code = NEW.postal_code, country = NEW.country, emergency_contact_name = NEW.emergency_contact_name, emergency_contact_phone = NEW.emergency_contact_phone, emergency_contact_relation = NEW.emergency_contact_relation, employee_number = NEW.employee_number, job_title = NEW.job_title, department = NEW.department, manager_id = NEW.manager_id, work_email = NEW.work_email, work_phone = NEW.work_phone, contract_type = NEW.contract_type, contract_start_date = NEW.contract_start_date, contract_end_date = NEW.contract_end_date, trial_end_date = NEW.trial_end_date, gross_salary = NEW.gross_salary, salary_currency = NEW.salary_currency, annual_leave_balance = NEW.annual_leave_balance, rtt_balance = NEW.rtt_balance, status = NEW.status, left_date = NEW.left_date, left_reason = NEW.left_reason, notes = NEW.notes, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.employees WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_employees_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_employees FOR EACH ROW EXECUTE FUNCTION public.hr_employees_trigger();

-- ===========================================
-- HR INTERVIEWS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_interviews CASCADE;
CREATE VIEW public.hr_interviews AS SELECT * FROM hr.interviews;

CREATE OR REPLACE FUNCTION public.hr_interviews_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.interviews (id, organization_id, employee_id, type, scheduled_date, completed_date, interviewer_id, objectives, achievements, feedback, development_plan, employee_comments, document_url, status, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.employee_id, NEW.type, NEW.scheduled_date, NEW.completed_date, NEW.interviewer_id, NEW.objectives, NEW.achievements, NEW.feedback, NEW.development_plan, NEW.employee_comments, NEW.document_url, COALESCE(NEW.status, 'scheduled'), NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.interviews SET
      organization_id = NEW.organization_id, employee_id = NEW.employee_id, type = NEW.type, scheduled_date = NEW.scheduled_date, completed_date = NEW.completed_date, interviewer_id = NEW.interviewer_id, objectives = NEW.objectives, achievements = NEW.achievements, feedback = NEW.feedback, development_plan = NEW.development_plan, employee_comments = NEW.employee_comments, document_url = NEW.document_url, status = NEW.status, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.interviews WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_interviews_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_interviews FOR EACH ROW EXECUTE FUNCTION public.hr_interviews_trigger();

-- ===========================================
-- HR LEAVE TYPES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_leave_types CASCADE;
CREATE VIEW public.hr_leave_types AS SELECT * FROM hr.leave_types;

CREATE OR REPLACE FUNCTION public.hr_leave_types_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.leave_types (id, organization_id, name, code, color, is_paid, requires_approval, deducts_from_balance, is_system, created_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.code, COALESCE(NEW.color, '#0c82d6'), COALESCE(NEW.is_paid, true), COALESCE(NEW.requires_approval, true), COALESCE(NEW.deducts_from_balance, true), COALESCE(NEW.is_system, false), COALESCE(NEW.created_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.leave_types SET
      organization_id = NEW.organization_id, name = NEW.name, code = NEW.code, color = NEW.color, is_paid = NEW.is_paid, requires_approval = NEW.requires_approval, deducts_from_balance = NEW.deducts_from_balance, is_system = NEW.is_system
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.leave_types WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_leave_types_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_leave_types FOR EACH ROW EXECUTE FUNCTION public.hr_leave_types_trigger();

-- ===========================================
-- HR LEAVE REQUESTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_leave_requests CASCADE;
CREATE VIEW public.hr_leave_requests AS SELECT * FROM hr.leave_requests;

CREATE OR REPLACE FUNCTION public.hr_leave_requests_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.leave_requests (id, organization_id, employee_id, leave_type_id, start_date, end_date, start_half_day, end_half_day, days_count, reason, status, approved_by, approved_at, rejection_reason, requested_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.employee_id, NEW.leave_type_id, NEW.start_date, NEW.end_date, COALESCE(NEW.start_half_day, false), COALESCE(NEW.end_half_day, false), COALESCE(NEW.days_count, 1), NEW.reason, COALESCE(NEW.status, 'pending'), NEW.approved_by, NEW.approved_at, NEW.rejection_reason, NEW.requested_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.leave_requests SET
      organization_id = NEW.organization_id, employee_id = NEW.employee_id, leave_type_id = NEW.leave_type_id, start_date = NEW.start_date, end_date = NEW.end_date, start_half_day = NEW.start_half_day, end_half_day = NEW.end_half_day, days_count = NEW.days_count, reason = NEW.reason, status = NEW.status, approved_by = NEW.approved_by, approved_at = NEW.approved_at, rejection_reason = NEW.rejection_reason, requested_by = NEW.requested_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.leave_requests WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_leave_requests_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_leave_requests FOR EACH ROW EXECUTE FUNCTION public.hr_leave_requests_trigger();

-- ===========================================
-- HR TIME ENTRIES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_time_entries CASCADE;
CREATE VIEW public.hr_time_entries AS SELECT * FROM hr.time_entries;

CREATE OR REPLACE FUNCTION public.hr_time_entries_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.time_entries (id, organization_id, employee_id, date, start_time, end_time, break_duration_minutes, hours_worked, overtime_hours, notes, validated_by, validated_at, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.employee_id, NEW.date, NEW.start_time, NEW.end_time, COALESCE(NEW.break_duration_minutes, 0), NEW.hours_worked, COALESCE(NEW.overtime_hours, 0), NEW.notes, NEW.validated_by, NEW.validated_at, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.time_entries SET
      organization_id = NEW.organization_id, employee_id = NEW.employee_id, date = NEW.date, start_time = NEW.start_time, end_time = NEW.end_time, break_duration_minutes = NEW.break_duration_minutes, hours_worked = NEW.hours_worked, overtime_hours = NEW.overtime_hours, notes = NEW.notes, validated_by = NEW.validated_by, validated_at = NEW.validated_at, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.time_entries WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_time_entries_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_time_entries FOR EACH ROW EXECUTE FUNCTION public.hr_time_entries_trigger();

-- ===========================================
-- HR SETTINGS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_settings CASCADE;
CREATE VIEW public.hr_settings AS SELECT * FROM hr.settings;

CREATE OR REPLACE FUNCTION public.hr_settings_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.settings (id, organization_id, annual_leave_days_per_year, rtt_days_per_year, leave_year_start_month, default_work_hours_per_week, work_days, alert_trial_end_days, alert_contract_end_days, alert_interview_days, employee_self_service_enabled, employees_can_request_leaves, employees_can_view_directory, employees_can_edit_profile, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, COALESCE(NEW.annual_leave_days_per_year, 25), COALESCE(NEW.rtt_days_per_year, 0), COALESCE(NEW.leave_year_start_month, 6), COALESCE(NEW.default_work_hours_per_week, 35), COALESCE(NEW.work_days, '["monday","tuesday","wednesday","thursday","friday"]'), COALESCE(NEW.alert_trial_end_days, 15), COALESCE(NEW.alert_contract_end_days, 30), COALESCE(NEW.alert_interview_days, 30), COALESCE(NEW.employee_self_service_enabled, false), COALESCE(NEW.employees_can_request_leaves, true), COALESCE(NEW.employees_can_view_directory, true), COALESCE(NEW.employees_can_edit_profile, false), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.settings SET
      organization_id = NEW.organization_id, annual_leave_days_per_year = NEW.annual_leave_days_per_year, rtt_days_per_year = NEW.rtt_days_per_year, leave_year_start_month = NEW.leave_year_start_month, default_work_hours_per_week = NEW.default_work_hours_per_week, work_days = NEW.work_days, alert_trial_end_days = NEW.alert_trial_end_days, alert_contract_end_days = NEW.alert_contract_end_days, alert_interview_days = NEW.alert_interview_days, employee_self_service_enabled = NEW.employee_self_service_enabled, employees_can_request_leaves = NEW.employees_can_request_leaves, employees_can_view_directory = NEW.employees_can_view_directory, employees_can_edit_profile = NEW.employees_can_edit_profile, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.settings WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_settings_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_settings FOR EACH ROW EXECUTE FUNCTION public.hr_settings_trigger();

-- ===========================================
-- GRANTS
-- ===========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_interviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_leave_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_leave_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_settings TO authenticated;

COMMIT;
-- ===========================================
-- 062_setup_creates_admin_employee.sql
-- Modify organization creation functions to create admin employee
-- ===========================================
-- Dependencies: 057_create_organization_rpc.sql, 058_setup_organization_rpc.sql, 060_hr_schema.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. UPDATE SETUP ORGANIZATION FUNCTION
-- Now also creates an HR employee record for the admin
-- ===========================================

CREATE OR REPLACE FUNCTION public.setup_organization(
  p_org_name TEXT,
  p_org_slug TEXT,
  p_admin_name TEXT,
  p_admin_email TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
  v_employee_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Validate user_id matches current auth user
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'User ID mismatch');
  END IF;

  -- Validate slug is available
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = p_org_slug AND deleted_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slug already taken');
  END IF;

  -- 1. Create or update user in public.users table
  INSERT INTO public.users (id, email, name, email_verified, created_at, updated_at)
  VALUES (p_user_id, p_admin_email, p_admin_name, true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

  -- 2. Create organization
  INSERT INTO public.organizations (
    name,
    slug,
    created_by,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    p_org_name,
    p_org_slug,
    p_user_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_org_id;

  -- 3. Add creator as owner
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, p_user_id, 'owner', NOW());

  -- 4. Create free subscriptions for all active modules
  FOR v_module IN SELECT id FROM public.modules WHERE is_active = true
  LOOP
    INSERT INTO public.module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- 5. Create HR settings for the organization
  INSERT INTO hr.settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- 6. Create default leave types
  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system) VALUES
    (v_org_id, 'Conges payes', 'cp', '#22c55e', true, true),
    (v_org_id, 'RTT', 'rtt', '#3b82f6', true, true),
    (v_org_id, 'Maladie', 'sick', '#ef4444', true, true),
    (v_org_id, 'Sans solde', 'unpaid', '#6b7280', false, true),
    (v_org_id, 'Maternite', 'maternity', '#ec4899', true, true),
    (v_org_id, 'Paternite', 'paternity', '#8b5cf6', true, true)
  ON CONFLICT (organization_id, code) DO NOTHING;

  -- 7. Parse admin name into first_name and last_name
  v_name_parts := string_to_array(trim(p_admin_name), ' ');
  IF array_length(v_name_parts, 1) >= 2 THEN
    v_first_name := v_name_parts[1];
    v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
  ELSE
    v_first_name := COALESCE(p_admin_name, 'Admin');
    v_last_name := '';
  END IF;

  -- 8. Create employee record for admin
  INSERT INTO hr.employees (
    organization_id,
    user_id,
    first_name,
    last_name,
    email,
    work_email,
    job_title,
    contract_type,
    contract_start_date,
    status,
    annual_leave_balance,
    rtt_balance,
    created_at,
    updated_at
  )
  VALUES (
    v_org_id,
    p_user_id,
    v_first_name,
    v_last_name,
    p_admin_email,
    p_admin_email,
    'Administrateur',
    'cdi',
    CURRENT_DATE,
    'active',
    25.0,  -- Default annual leave balance
    0.0,   -- Default RTT balance
    NOW(),
    NOW()
  )
  RETURNING id INTO v_employee_id;

  -- Return created org
  SELECT * INTO v_org FROM public.organizations WHERE id = v_org_id;
  RETURN jsonb_build_object(
    'success', true,
    'organization', row_to_json(v_org),
    'employee_id', v_employee_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ===========================================
-- 2. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.setup_organization IS 'First-time setup: create organization, link user as owner, and create admin employee record';

-- ===========================================
-- 2. UPDATE CREATE_ORGANIZATION_WITH_OWNER FUNCTION
-- Also creates an HR employee record for the owner
-- ===========================================

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_industry TEXT DEFAULT NULL,
  p_siret TEXT DEFAULT NULL,
  p_siren TEXT DEFAULT NULL,
  p_vat_number TEXT DEFAULT NULL,
  p_address JSONB DEFAULT '{}',
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user RECORD;
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
  v_employee_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get user info
  SELECT * INTO v_user FROM public.users WHERE id = v_user_id;

  -- Validate slug
  IF NOT is_slug_available(p_slug) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slug already taken');
  END IF;

  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    industry,
    siret,
    siren,
    vat_number,
    address,
    phone,
    email,
    created_by,
    onboarding_completed
  )
  VALUES (
    p_name,
    p_slug,
    p_industry,
    p_siret,
    p_siren,
    p_vat_number,
    p_address,
    p_phone,
    p_email,
    v_user_id,
    true
  )
  RETURNING id INTO v_org_id;

  -- Add creator as owner
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, v_user_id, 'owner', NOW());

  -- Create free subscriptions for all active modules
  FOR v_module IN SELECT id FROM modules WHERE is_active = true
  LOOP
    INSERT INTO module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- Create HR settings for the organization
  INSERT INTO hr.settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Create default leave types
  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system) VALUES
    (v_org_id, 'Conges payes', 'cp', '#22c55e', true, true),
    (v_org_id, 'RTT', 'rtt', '#3b82f6', true, true),
    (v_org_id, 'Maladie', 'sick', '#ef4444', true, true),
    (v_org_id, 'Sans solde', 'unpaid', '#6b7280', false, true),
    (v_org_id, 'Maternite', 'maternity', '#ec4899', true, true),
    (v_org_id, 'Paternite', 'paternity', '#8b5cf6', true, true)
  ON CONFLICT (organization_id, code) DO NOTHING;

  -- Parse user name into first_name and last_name
  v_name_parts := string_to_array(trim(COALESCE(v_user.name, '')), ' ');
  IF array_length(v_name_parts, 1) >= 2 THEN
    v_first_name := v_name_parts[1];
    v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
  ELSIF array_length(v_name_parts, 1) = 1 AND v_name_parts[1] != '' THEN
    v_first_name := v_name_parts[1];
    v_last_name := '';
  ELSE
    v_first_name := split_part(COALESCE(v_user.email, 'Admin'), '@', 1);
    v_last_name := '';
  END IF;

  -- Create employee record for owner
  INSERT INTO hr.employees (
    organization_id,
    user_id,
    first_name,
    last_name,
    email,
    work_email,
    job_title,
    contract_type,
    contract_start_date,
    status,
    annual_leave_balance,
    rtt_balance,
    created_at,
    updated_at
  )
  VALUES (
    v_org_id,
    v_user_id,
    v_first_name,
    v_last_name,
    v_user.email,
    v_user.email,
    'Administrateur',
    'cdi',
    CURRENT_DATE,
    'active',
    25.0,
    0.0,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_employee_id;

  -- Return created org
  SELECT * INTO v_org FROM organizations WHERE id = v_org_id;
  RETURN jsonb_build_object(
    'success', true,
    'organization', row_to_json(v_org),
    'employee_id', v_employee_id
  );
END;
$$;

COMMENT ON FUNCTION public.create_organization_with_owner IS 'Create a new organization with the current user as owner and create admin employee record';

COMMIT;
-- ===========================================
-- 063_backfill_admin_employees.sql
-- Create employee records for existing organization owners
-- ===========================================
-- Dependencies: 062_setup_creates_admin_employee.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CREATE HR SETTINGS FOR EXISTING ORGS
-- ===========================================

INSERT INTO hr.settings (organization_id)
SELECT id FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM hr.settings)
ON CONFLICT (organization_id) DO NOTHING;

-- ===========================================
-- 2. CREATE DEFAULT LEAVE TYPES FOR EXISTING ORGS
-- ===========================================

INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system)
SELECT o.id, lt.name, lt.code, lt.color, lt.is_paid, lt.is_system
FROM public.organizations o
CROSS JOIN (VALUES
  ('Conges payes', 'cp', '#22c55e', true, true),
  ('RTT', 'rtt', '#3b82f6', true, true),
  ('Maladie', 'sick', '#ef4444', true, true),
  ('Sans solde', 'unpaid', '#6b7280', false, true),
  ('Maternite', 'maternity', '#ec4899', true, true),
  ('Paternite', 'paternity', '#8b5cf6', true, true)
) AS lt(name, code, color, is_paid, is_system)
WHERE NOT EXISTS (
  SELECT 1 FROM hr.leave_types
  WHERE organization_id = o.id AND code = lt.code
)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ===========================================
-- 3. CREATE EMPLOYEE RECORDS FOR OWNERS
-- ===========================================

-- For each organization owner who doesn't have an employee record,
-- create one linked to their user account
INSERT INTO hr.employees (
  organization_id,
  user_id,
  first_name,
  last_name,
  email,
  work_email,
  job_title,
  contract_type,
  contract_start_date,
  status,
  annual_leave_balance,
  rtt_balance,
  created_at,
  updated_at
)
SELECT
  om.organization_id,
  om.user_id,
  COALESCE(
    split_part(u.name, ' ', 1),
    split_part(u.email, '@', 1),
    'Admin'
  ) AS first_name,
  COALESCE(
    CASE
      WHEN position(' ' IN u.name) > 0
      THEN substring(u.name FROM position(' ' IN u.name) + 1)
      ELSE ''
    END,
    ''
  ) AS last_name,
  u.email,
  u.email,
  'Administrateur',
  'cdi',
  COALESCE(om.joined_at::date, CURRENT_DATE),
  'active',
  25.0,
  0.0,
  COALESCE(om.joined_at, NOW()),
  NOW()
FROM public.organization_members om
INNER JOIN public.users u ON u.id = om.user_id
WHERE om.role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM hr.employees e
    WHERE e.organization_id = om.organization_id
      AND e.user_id = om.user_id
  );

-- ===========================================
-- 4. COMMENTS
-- ===========================================

COMMENT ON TABLE hr.employees IS 'HR employees - includes all organization members with employee records';

COMMIT;
-- ===========================================
-- 064_admin_console_functions.sql
-- Admin console RPC functions for organization management
-- ===========================================

BEGIN;

-- ===========================================
-- 1. LIST ALL ORGANIZATIONS (ADMIN ONLY)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_list_organizations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  industry TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN,
  member_count BIGINT,
  owner_email TEXT,
  owner_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For now, allow any authenticated user (single-tenant mode)
  -- In multi-tenant SaaS, you'd check for super-admin role here
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name::TEXT,
    o.slug::TEXT,
    o.industry::TEXT,
    o.email::TEXT,
    o.phone::TEXT,
    o.created_at,
    o.updated_at,
    o.onboarding_completed,
    (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = o.id)::BIGINT as member_count,
    (SELECT u.email FROM organization_members om2
     JOIN users u ON u.id = om2.user_id
     WHERE om2.organization_id = o.id AND om2.role = 'owner'
     LIMIT 1)::TEXT as owner_email,
    (SELECT u.name FROM organization_members om3
     JOIN users u ON u.id = om3.user_id
     WHERE om3.organization_id = o.id AND om3.role = 'owner'
     LIMIT 1)::TEXT as owner_name
  FROM organizations o
  WHERE o.deleted_at IS NULL
  ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_organizations() TO authenticated;

-- ===========================================
-- 2. CREATE ORGANIZATION (ADMIN)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_owner_email TEXT,
  p_owner_name TEXT,
  p_owner_password TEXT,
  p_industry TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
  v_module RECORD;
  v_employee_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check slug availability
  IF EXISTS (SELECT 1 FROM organizations WHERE slug = p_slug AND deleted_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ce slug est deja utilise');
  END IF;

  -- Check if user with this email already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_owner_email;

  IF v_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Un utilisateur avec cet email existe deja');
  END IF;

  -- Create auth user (this requires service_role key, so we'll handle it differently)
  -- For now, we'll create the organization and user record, and send an invite
  v_user_id := uuid_generate_v4();

  -- Create user record
  INSERT INTO users (id, email, name, email_verified, created_at, updated_at)
  VALUES (v_user_id, p_owner_email, p_owner_name, false, NOW(), NOW());

  -- Create organization
  INSERT INTO organizations (name, slug, industry, created_by, onboarding_completed, created_at, updated_at)
  VALUES (p_name, p_slug, p_industry, v_user_id, true, NOW(), NOW())
  RETURNING id INTO v_org_id;

  -- Add owner membership
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, v_user_id, 'owner', NOW());

  -- Create module subscriptions
  FOR v_module IN SELECT id FROM modules WHERE is_active = true
  LOOP
    INSERT INTO module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- Create HR settings
  INSERT INTO hr.settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Create default leave types
  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system) VALUES
    (v_org_id, 'Conges payes', 'cp', '#22c55e', true, true),
    (v_org_id, 'RTT', 'rtt', '#3b82f6', true, true),
    (v_org_id, 'Maladie', 'sick', '#ef4444', true, true),
    (v_org_id, 'Sans solde', 'unpaid', '#6b7280', false, true),
    (v_org_id, 'Maternite', 'maternity', '#ec4899', true, true),
    (v_org_id, 'Paternite', 'paternity', '#8b5cf6', true, true)
  ON CONFLICT (organization_id, code) DO NOTHING;

  -- Parse name for employee record
  v_name_parts := string_to_array(trim(COALESCE(p_owner_name, '')), ' ');
  IF array_length(v_name_parts, 1) >= 2 THEN
    v_first_name := v_name_parts[1];
    v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
  ELSE
    v_first_name := COALESCE(p_owner_name, split_part(p_owner_email, '@', 1));
    v_last_name := '';
  END IF;

  -- Create employee record
  INSERT INTO hr.employees (
    organization_id, user_id, first_name, last_name, email, work_email,
    job_title, contract_type, contract_start_date, status,
    annual_leave_balance, rtt_balance, created_at, updated_at
  )
  VALUES (
    v_org_id, v_user_id, v_first_name, v_last_name, p_owner_email, p_owner_email,
    'Administrateur', 'cdi', CURRENT_DATE, 'active',
    25.0, 0.0, NOW(), NOW()
  )
  RETURNING id INTO v_employee_id;

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'user_id', v_user_id,
    'employee_id', v_employee_id,
    'message', 'Organisation creee. L''utilisateur doit etre cree via Supabase Auth.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_organization(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ===========================================
-- 3. DELETE ORGANIZATION (ADMIN)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_delete_organization(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org RECORD;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check organization exists
  SELECT * INTO v_org FROM organizations WHERE id = p_org_id AND deleted_at IS NULL;

  IF v_org IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Organisation non trouvee');
  END IF;

  -- Soft delete the organization
  UPDATE organizations
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_org_id;

  -- Also soft delete all related data
  -- HR employees
  UPDATE hr.employees SET deleted_at = NOW() WHERE organization_id = p_org_id;

  -- HR interviews
  UPDATE hr.interviews SET deleted_at = NOW() WHERE organization_id = p_org_id;

  -- HR leave requests
  UPDATE hr.leave_requests SET deleted_at = NOW() WHERE organization_id = p_org_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Organisation supprimee avec succes'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_organization(UUID) TO authenticated;

-- ===========================================
-- 4. GET ORGANIZATION STATS (ADMIN)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_orgs BIGINT;
  v_total_users BIGINT;
  v_total_employees BIGINT;
  v_orgs_this_month BIGINT;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO v_total_orgs FROM organizations WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_total_users FROM users;
  SELECT COUNT(*) INTO v_total_employees FROM hr.employees WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_orgs_this_month
  FROM organizations
  WHERE deleted_at IS NULL
    AND created_at >= date_trunc('month', CURRENT_DATE);

  RETURN jsonb_build_object(
    'total_organizations', v_total_orgs,
    'total_users', v_total_users,
    'total_employees', v_total_employees,
    'organizations_this_month', v_orgs_this_month
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;

-- ===========================================
-- 5. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.admin_list_organizations IS 'List all organizations for admin console';
COMMENT ON FUNCTION public.admin_create_organization IS 'Create a new organization with owner from admin console';
COMMENT ON FUNCTION public.admin_delete_organization IS 'Soft delete an organization from admin console';
COMMENT ON FUNCTION public.admin_get_stats IS 'Get global statistics for admin dashboard';

COMMIT;
