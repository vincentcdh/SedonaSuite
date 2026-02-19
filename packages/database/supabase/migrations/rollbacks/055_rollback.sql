-- ===========================================
-- ROLLBACK: 055_auto_usage_tracking.sql
-- ===========================================
-- Removes all auto usage tracking triggers
-- ===========================================

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_contact_usage ON crm.contacts;
DROP TRIGGER IF EXISTS trg_company_usage ON crm.companies;
DROP TRIGGER IF EXISTS trg_deal_usage ON crm.deals;
DROP TRIGGER IF EXISTS trg_pipeline_usage ON crm.pipelines;
DROP TRIGGER IF EXISTS trg_client_usage ON invoice.clients;
DROP TRIGGER IF EXISTS trg_product_usage ON invoice.products;

-- Drop functions (all in public schema now)
DROP FUNCTION IF EXISTS public.handle_crm_contact_usage() CASCADE;
DROP FUNCTION IF EXISTS public.handle_crm_company_usage() CASCADE;
DROP FUNCTION IF EXISTS public.handle_crm_deal_usage() CASCADE;
DROP FUNCTION IF EXISTS public.handle_crm_pipeline_usage() CASCADE;
DROP FUNCTION IF EXISTS public.handle_invoice_client_usage() CASCADE;
DROP FUNCTION IF EXISTS public.handle_invoice_product_usage() CASCADE;

COMMIT;
