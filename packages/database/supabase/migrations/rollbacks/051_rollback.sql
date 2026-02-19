-- ===========================================
-- ROLLBACK: 051_modules_tables.sql
-- ===========================================
-- WARNING: This will drop all module billing data
-- ===========================================

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS set_modules_updated_at ON public.modules;
DROP TRIGGER IF EXISTS set_module_subscriptions_updated_at ON public.module_subscriptions;
DROP TRIGGER IF EXISTS set_module_usage_updated_at ON public.module_usage;

-- Drop policies
DROP POLICY IF EXISTS "modules_select" ON public.modules;
DROP POLICY IF EXISTS "module_subscriptions_select" ON public.module_subscriptions;
DROP POLICY IF EXISTS "module_subscriptions_insert" ON public.module_subscriptions;
DROP POLICY IF EXISTS "module_subscriptions_update" ON public.module_subscriptions;
DROP POLICY IF EXISTS "module_subscriptions_delete" ON public.module_subscriptions;
DROP POLICY IF EXISTS "module_limits_select" ON public.module_limits;
DROP POLICY IF EXISTS "module_usage_select" ON public.module_usage;
DROP POLICY IF EXISTS "module_usage_insert" ON public.module_usage;
DROP POLICY IF EXISTS "module_usage_update" ON public.module_usage;
DROP POLICY IF EXISTS "module_usage_delete" ON public.module_usage;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS public.module_usage CASCADE;
DROP TABLE IF EXISTS public.module_limits CASCADE;
DROP TABLE IF EXISTS public.module_subscriptions CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;

-- Drop function (only if not used elsewhere)
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

COMMIT;
