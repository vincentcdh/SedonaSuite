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
