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
