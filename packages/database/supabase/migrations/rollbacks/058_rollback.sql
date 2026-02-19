-- ===========================================
-- ROLLBACK: 058_setup_organization_rpc.sql
-- ===========================================

BEGIN;

DROP FUNCTION IF EXISTS public.setup_organization(TEXT, TEXT, TEXT, TEXT, UUID) CASCADE;

COMMIT;
