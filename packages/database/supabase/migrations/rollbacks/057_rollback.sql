-- ===========================================
-- ROLLBACK: 057_create_organization_rpc.sql
-- ===========================================

BEGIN;

DROP FUNCTION IF EXISTS public.create_organization_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.is_slug_available(TEXT) CASCADE;

COMMIT;
