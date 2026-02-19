-- ===========================================
-- ROLLBACK: 056_seed_existing_orgs.sql
-- ===========================================
-- This rollback clears module subscriptions and usage for all orgs
-- WARNING: This will remove all module subscription data
-- ===========================================

BEGIN;

-- Clear all module usage
DELETE FROM public.module_usage;

-- Clear all module subscriptions (this resets all orgs to unprovisioned state)
DELETE FROM public.module_subscriptions;

RAISE NOTICE 'All module subscriptions and usage data cleared';

COMMIT;
