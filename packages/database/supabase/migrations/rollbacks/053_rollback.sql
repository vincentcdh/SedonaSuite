-- ===========================================
-- ROLLBACK: 053_module_helper_functions.sql
-- ===========================================
-- Removes all helper functions for module billing
-- ===========================================

BEGIN;

DROP FUNCTION IF EXISTS public.is_module_paid(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_module_limit(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_module_limit(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.increment_module_usage(UUID, TEXT, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.decrement_module_usage(UUID, TEXT, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_organization_modules(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_module_downgrade(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_stripe_subscription_update(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS public.handle_stripe_subscription_canceled(TEXT) CASCADE;

COMMIT;
