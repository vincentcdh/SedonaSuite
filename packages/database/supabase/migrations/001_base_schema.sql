-- 001_base_schema.sql
-- Sedona.AI - Base Database Schema
-- This migration creates the core tables for multi-tenant SaaS

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ENUMS
-- ===========================================

-- Plans d'abonnement
CREATE TYPE subscription_plan AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- Statut d'abonnement
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

-- Rôles dans une organisation
CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member');

-- ===========================================
-- ORGANIZATIONS (Tenants)
-- ===========================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,

  -- Informations entreprise (France)
  siret VARCHAR(14),
  siren VARCHAR(9),
  vat_number VARCHAR(20), -- Numéro TVA intracommunautaire
  legal_name VARCHAR(255),

  -- Adresse
  address_street TEXT,
  address_complement TEXT,
  address_postal_code VARCHAR(10),
  address_city VARCHAR(100),
  address_country VARCHAR(100) DEFAULT 'France',

  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Billing / Stripe
  stripe_customer_id VARCHAR(255) UNIQUE,
  subscription_plan subscription_plan DEFAULT 'FREE' NOT NULL,
  subscription_status subscription_status DEFAULT 'active' NOT NULL,
  subscription_id VARCHAR(255), -- Stripe subscription ID
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,

  -- Metadata
  settings JSONB DEFAULT '{}' NOT NULL,
  onboarding_completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- USERS
-- ===========================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMPTZ,

  -- Profile
  name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),

  -- Password (hashed with bcrypt)
  password_hash TEXT,

  -- Preferences
  locale VARCHAR(10) DEFAULT 'fr' NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris' NOT NULL,
  settings JSONB DEFAULT '{}' NOT NULL,

  -- Security
  two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  two_factor_secret TEXT,

  -- Timestamps
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- ORGANIZATION MEMBERS (jointure users <-> organizations)
-- ===========================================

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role organization_role DEFAULT 'member' NOT NULL,

  -- Invitation
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_org_user UNIQUE(organization_id, user_id)
);

-- ===========================================
-- SESSIONS (pour Better Auth)
-- ===========================================

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Token
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Device info
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'

  -- Organization context
  current_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- VERIFICATION TOKENS (email verification, password reset)
-- ===========================================

CREATE TABLE public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email VARCHAR(255), -- Pour les changements d'email

  token TEXT UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email_verification', 'password_reset', 'email_change'

  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===========================================
-- USAGE TRACKING (limites freemium)
-- ===========================================

CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- What we're tracking
  module VARCHAR(50) NOT NULL, -- 'crm', 'invoice', 'projects', 'tickets', 'hr', 'docs'
  feature VARCHAR(50) NOT NULL, -- 'contacts', 'invoices_this_month', 'projects', etc.

  -- Current usage
  current_count INTEGER DEFAULT 0 NOT NULL,

  -- Period (for monthly limits)
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_usage_tracking UNIQUE(organization_id, module, feature, period_start)
);

-- ===========================================
-- AUDIT LOGS (RGPD compliance)
-- ===========================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Action details
  action VARCHAR(100) NOT NULL, -- 'contact.created', 'invoice.sent', 'user.login', etc.
  entity_type VARCHAR(50), -- 'contact', 'invoice', 'user', etc.
  entity_id UUID,

  -- Data changes (for RGPD compliance)
  old_data JSONB,
  new_data JSONB,

  -- Request info
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_id UUID, -- Pour corréler avec les logs serveur

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_organizations_deleted ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- Organization Members
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_invitation ON organization_members(invitation_token) WHERE invitation_token IS NOT NULL;

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Verification Tokens
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user ON verification_tokens(user_id);

-- Usage Tracking
CREATE INDEX idx_usage_org_module ON usage_tracking(organization_id, module);
CREATE INDEX idx_usage_period ON usage_tracking(period_start, period_end);

-- Audit Logs
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Generate a URL-safe slug from a string
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(input_text);
  slug := regexp_replace(slug, '[^a-z0-9\-]', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if a slug is available
CREATE OR REPLACE FUNCTION is_slug_available(check_slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM organizations WHERE slug = check_slug AND deleted_at IS NULL);
END;
$$ LANGUAGE plpgsql STABLE;

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  p_org_id UUID,
  p_module VARCHAR(50),
  p_feature VARCHAR(50),
  p_increment INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_current INTEGER;
  v_period_start TIMESTAMPTZ;
BEGIN
  -- For monthly features, use the start of current month
  IF p_feature LIKE '%_this_month' OR p_feature LIKE '%_per_month' THEN
    v_period_start := date_trunc('month', NOW());
  ELSE
    v_period_start := NULL;
  END IF;

  INSERT INTO usage_tracking (organization_id, module, feature, current_count, period_start, period_end)
  VALUES (p_org_id, p_module, p_feature, p_increment, v_period_start,
          CASE WHEN v_period_start IS NOT NULL THEN v_period_start + INTERVAL '1 month' ELSE NULL END)
  ON CONFLICT (organization_id, module, feature, period_start)
  DO UPDATE SET current_count = usage_tracking.current_count + p_increment, updated_at = NOW()
  RETURNING current_count INTO v_current;

  RETURN v_current;
END;
$$ LANGUAGE plpgsql;

-- Get current usage
CREATE OR REPLACE FUNCTION get_usage(
  p_org_id UUID,
  p_module VARCHAR(50),
  p_feature VARCHAR(50)
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_period_start TIMESTAMPTZ;
BEGIN
  IF p_feature LIKE '%_this_month' OR p_feature LIKE '%_per_month' THEN
    v_period_start := date_trunc('month', NOW());
  ELSE
    v_period_start := NULL;
  END IF;

  SELECT current_count INTO v_count
  FROM usage_tracking
  WHERE organization_id = p_org_id
    AND module = p_module
    AND feature = p_feature
    AND (period_start = v_period_start OR (period_start IS NULL AND v_period_start IS NULL));

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;
