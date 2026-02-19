-- ===========================================
-- ROLLBACK: 052_modules_seed_data.sql
-- ===========================================
-- Removes seed data from modules and limits tables
-- ===========================================

BEGIN;

-- Delete all limits
DELETE FROM public.module_limits;

-- Delete all modules
DELETE FROM public.modules;

COMMIT;
