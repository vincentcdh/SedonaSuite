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
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
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
