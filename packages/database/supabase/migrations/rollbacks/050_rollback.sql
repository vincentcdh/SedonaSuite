-- ===========================================
-- ROLLBACK: 050_organizations_refactor.sql
-- ===========================================
-- WARNING: This will restore subscription columns but data will be lost
-- Run this BEFORE running the forward migration or to undo changes
-- ===========================================

BEGIN;

-- ===========================================
-- 1. RESTORE SUBSCRIPTION COLUMNS
-- ===========================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- ===========================================
-- 2. DROP NEW COLUMNS
-- ===========================================

ALTER TABLE public.organizations
  DROP COLUMN IF EXISTS industry,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS onboarding_completed,
  DROP COLUMN IF EXISTS address;

-- ===========================================
-- 3. DROP INDEXES
-- ===========================================

DROP INDEX IF EXISTS idx_organizations_industry;
DROP INDEX IF EXISTS idx_organizations_created_by;

COMMIT;
