-- ===========================================
-- ROLLBACK: 054_provision_functions.sql
-- ===========================================
-- Removes all provisioning functions
-- ===========================================

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS after_organization_created ON public.organizations;
DROP TRIGGER IF EXISTS after_organization_onboarding_completed ON public.organizations;

-- Drop functions
DROP FUNCTION IF EXISTS public.trigger_provision_organization() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_provision_organization_on_update() CASCADE;
DROP FUNCTION IF EXISTS public.provision_organization(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_organization_provisioned(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.provision_module_subscriptions(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.provision_module_usage(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.provision_crm(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.provision_invoice(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.provision_tickets(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.provision_hr(UUID) CASCADE;

COMMIT;
