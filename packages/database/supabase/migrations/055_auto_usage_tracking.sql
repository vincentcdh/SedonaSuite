-- ===========================================
-- 055_auto_usage_tracking.sql
-- Auto increment/decrement module usage triggers
-- ===========================================
-- Dependencies: 053_module_helper_functions.sql
-- Rollback: rollbacks/055_rollback.sql
-- ===========================================
-- NOTE: Only creates triggers for existing schemas (crm, invoice)
-- Triggers for projects, hr, tickets, docs will be created
-- when those modules are implemented.
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CRM MODULE TRIGGERS
-- ===========================================

-- Contacts usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_contact_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_contacts', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_contacts', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'crm', 'max_contacts', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_contacts', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_contact_usage ON crm.contacts;
CREATE TRIGGER trg_contact_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON crm.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_contact_usage();

-- Companies usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_company_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_companies', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_companies', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'crm', 'max_companies', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_companies', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_company_usage ON crm.companies;
CREATE TRIGGER trg_company_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON crm.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_company_usage();

-- Deals usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_deal_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_deals', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_deals', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'crm', 'max_deals', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_deals', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deal_usage ON crm.deals;
CREATE TRIGGER trg_deal_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON crm.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_deal_usage();

-- Pipelines usage trigger
CREATE OR REPLACE FUNCTION public.handle_crm_pipeline_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'crm', 'max_pipelines', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'crm', 'max_pipelines', 1);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_pipeline_usage ON crm.pipelines;
CREATE TRIGGER trg_pipeline_usage
  AFTER INSERT OR DELETE ON crm.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_pipeline_usage();

-- ===========================================
-- 2. INVOICE MODULE TRIGGERS
-- ===========================================

-- Clients usage trigger
CREATE OR REPLACE FUNCTION public.handle_invoice_client_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_clients', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'invoice', 'max_clients', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'invoice', 'max_clients', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_clients', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_client_usage ON invoice.clients;
CREATE TRIGGER trg_client_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON invoice.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_client_usage();

-- Products usage trigger
CREATE OR REPLACE FUNCTION public.handle_invoice_product_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_products', 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_module_usage(OLD.organization_id, 'invoice', 'max_products', 1);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      PERFORM public.decrement_module_usage(NEW.organization_id, 'invoice', 'max_products', 1);
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      PERFORM public.increment_module_usage(NEW.organization_id, 'invoice', 'max_products', 1);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_product_usage ON invoice.products;
CREATE TRIGGER trg_product_usage
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON invoice.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invoice_product_usage();

-- ===========================================
-- 3. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.handle_crm_contact_usage IS 'Auto-increment/decrement contact usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_crm_company_usage IS 'Auto-increment/decrement company usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_crm_deal_usage IS 'Auto-increment/decrement deal usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_crm_pipeline_usage IS 'Auto-increment/decrement pipeline usage on insert/delete';
COMMENT ON FUNCTION public.handle_invoice_client_usage IS 'Auto-increment/decrement client usage on insert/delete/soft-delete';
COMMENT ON FUNCTION public.handle_invoice_product_usage IS 'Auto-increment/decrement product usage on insert/delete/soft-delete';

-- ===========================================
-- NOTE: Future triggers for other modules
-- ===========================================
-- When implementing projects, hr, tickets, docs modules,
-- create additional migrations with their usage triggers:
--
-- projects.projects -> public.handle_projects_project_usage()
-- hr.employees -> public.handle_hr_employee_usage()
-- tickets.kb_articles -> public.handle_tickets_kb_article_usage()
-- tickets.canned_responses -> public.handle_tickets_canned_response_usage()
-- docs.files -> public.handle_docs_file_usage()
-- ===========================================

COMMIT;
