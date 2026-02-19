-- ===========================================
-- 059_public_views.sql
-- Create public views for schema tables
-- ===========================================
-- This exposes tables from crm, invoice schemas
-- via public schema views for PostgREST access
-- Uses INSTEAD OF triggers for updatable views
-- ===========================================

BEGIN;

-- ===========================================
-- CRM CONTACTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_contacts CASCADE;
CREATE VIEW public.crm_contacts AS SELECT * FROM crm.contacts;

CREATE OR REPLACE FUNCTION public.crm_contacts_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.contacts (id, organization_id, first_name, last_name, email, phone, mobile, job_title, company_id, source, source_details, address_line1, address_line2, city, postal_code, country, custom_fields, tags, owner_id, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.first_name, NEW.last_name, NEW.email, NEW.phone, NEW.mobile, NEW.job_title, NEW.company_id, NEW.source, NEW.source_details, NEW.address_line1, NEW.address_line2, NEW.city, NEW.postal_code, COALESCE(NEW.country, 'France'), COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.tags, '{}'), NEW.owner_id, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.contacts SET
      organization_id = NEW.organization_id, first_name = NEW.first_name, last_name = NEW.last_name, email = NEW.email, phone = NEW.phone, mobile = NEW.mobile, job_title = NEW.job_title, company_id = NEW.company_id, source = NEW.source, source_details = NEW.source_details, address_line1 = NEW.address_line1, address_line2 = NEW.address_line2, city = NEW.city, postal_code = NEW.postal_code, country = NEW.country, custom_fields = NEW.custom_fields, tags = NEW.tags, owner_id = NEW.owner_id, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.contacts WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_contacts_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.crm_contacts_trigger();

-- ===========================================
-- CRM COMPANIES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_companies CASCADE;
CREATE VIEW public.crm_companies AS SELECT * FROM crm.companies;

CREATE OR REPLACE FUNCTION public.crm_companies_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.companies (id, organization_id, name, siret, website, industry, size, address_line1, address_line2, city, postal_code, country, phone, email, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.siret, NEW.website, NEW.industry, NEW.size, NEW.address_line1, NEW.address_line2, NEW.city, NEW.postal_code, COALESCE(NEW.country, 'France'), NEW.phone, NEW.email, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.companies SET
      organization_id = NEW.organization_id, name = NEW.name, siret = NEW.siret, website = NEW.website, industry = NEW.industry, size = NEW.size, address_line1 = NEW.address_line1, address_line2 = NEW.address_line2, city = NEW.city, postal_code = NEW.postal_code, country = NEW.country, phone = NEW.phone, email = NEW.email, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.companies WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_companies_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.crm_companies_trigger();

-- ===========================================
-- CRM DEALS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_deals CASCADE;
CREATE VIEW public.crm_deals AS SELECT * FROM crm.deals;

CREATE OR REPLACE FUNCTION public.crm_deals_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.deals (id, organization_id, pipeline_id, stage_id, name, amount, currency, probability, expected_close_date, contact_id, company_id, status, owner_id, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.pipeline_id, NEW.stage_id, NEW.name, NEW.amount, COALESCE(NEW.currency, 'EUR'), NEW.probability, NEW.expected_close_date, NEW.contact_id, NEW.company_id, COALESCE(NEW.status, 'open'), NEW.owner_id, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.deals SET
      organization_id = NEW.organization_id, pipeline_id = NEW.pipeline_id, stage_id = NEW.stage_id, name = NEW.name, amount = NEW.amount, currency = NEW.currency, probability = NEW.probability, expected_close_date = NEW.expected_close_date, contact_id = NEW.contact_id, company_id = NEW.company_id, status = NEW.status, won_at = NEW.won_at, lost_at = NEW.lost_at, lost_reason = NEW.lost_reason, owner_id = NEW.owner_id, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.deals WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_deals_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_deals FOR EACH ROW EXECUTE FUNCTION public.crm_deals_trigger();

-- ===========================================
-- CRM ACTIVITIES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_activities CASCADE;
CREATE VIEW public.crm_activities AS SELECT * FROM crm.activities;

CREATE OR REPLACE FUNCTION public.crm_activities_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.activities (id, organization_id, type, subject, description, contact_id, company_id, deal_id, due_date, completed_at, duration_minutes, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.type, NEW.subject, NEW.description, NEW.contact_id, NEW.company_id, NEW.deal_id, NEW.due_date, NEW.completed_at, NEW.duration_minutes, NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.activities SET
      organization_id = NEW.organization_id, type = NEW.type, subject = NEW.subject, description = NEW.description, contact_id = NEW.contact_id, company_id = NEW.company_id, deal_id = NEW.deal_id, due_date = NEW.due_date, completed_at = NEW.completed_at, duration_minutes = NEW.duration_minutes, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.activities WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_activities_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_activities FOR EACH ROW EXECUTE FUNCTION public.crm_activities_trigger();

-- ===========================================
-- CRM PIPELINES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_pipelines CASCADE;
CREATE VIEW public.crm_pipelines AS SELECT * FROM crm.pipelines;

CREATE OR REPLACE FUNCTION public.crm_pipelines_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.pipelines (id, organization_id, name, description, is_default, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.description, COALESCE(NEW.is_default, false), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.pipelines SET
      organization_id = NEW.organization_id, name = NEW.name, description = NEW.description, is_default = NEW.is_default, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.pipelines WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_pipelines_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_pipelines FOR EACH ROW EXECUTE FUNCTION public.crm_pipelines_trigger();

-- ===========================================
-- CRM PIPELINE STAGES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.crm_pipeline_stages CASCADE;
CREATE VIEW public.crm_pipeline_stages AS SELECT * FROM crm.pipeline_stages;

CREATE OR REPLACE FUNCTION public.crm_pipeline_stages_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO crm.pipeline_stages (id, pipeline_id, name, position, color, probability, is_won, is_lost, created_at, updated_at)
    VALUES (v_id, NEW.pipeline_id, NEW.name, NEW.position, NEW.color, NEW.probability, COALESCE(NEW.is_won, false), COALESCE(NEW.is_lost, false), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE crm.pipeline_stages SET
      pipeline_id = NEW.pipeline_id, name = NEW.name, position = NEW.position, color = NEW.color, probability = NEW.probability, is_won = NEW.is_won, is_lost = NEW.is_lost, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM crm.pipeline_stages WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER crm_pipeline_stages_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.crm_pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.crm_pipeline_stages_trigger();

-- ===========================================
-- INVOICE CLIENTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_clients CASCADE;
CREATE VIEW public.invoice_clients AS SELECT * FROM invoice.clients;

CREATE OR REPLACE FUNCTION public.invoice_clients_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.clients (id, organization_id, name, legal_name, siret, vat_number, legal_form, billing_address_line1, billing_address_line2, billing_city, billing_postal_code, billing_country, billing_email, billing_phone, contact_name, payment_terms, payment_method, default_currency, crm_company_id, crm_contact_id, notes, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.legal_name, NEW.siret, NEW.vat_number, NEW.legal_form, NEW.billing_address_line1, NEW.billing_address_line2, NEW.billing_city, NEW.billing_postal_code, COALESCE(NEW.billing_country, 'France'), NEW.billing_email, NEW.billing_phone, NEW.contact_name, COALESCE(NEW.payment_terms, 30), COALESCE(NEW.payment_method, 'transfer'), COALESCE(NEW.default_currency, 'EUR'), NEW.crm_company_id, NEW.crm_contact_id, NEW.notes, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.clients SET
      organization_id = NEW.organization_id, name = NEW.name, legal_name = NEW.legal_name, siret = NEW.siret, vat_number = NEW.vat_number, legal_form = NEW.legal_form, billing_address_line1 = NEW.billing_address_line1, billing_address_line2 = NEW.billing_address_line2, billing_city = NEW.billing_city, billing_postal_code = NEW.billing_postal_code, billing_country = NEW.billing_country, billing_email = NEW.billing_email, billing_phone = NEW.billing_phone, contact_name = NEW.contact_name, payment_terms = NEW.payment_terms, payment_method = NEW.payment_method, default_currency = NEW.default_currency, crm_company_id = NEW.crm_company_id, crm_contact_id = NEW.crm_contact_id, notes = NEW.notes, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.clients WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_clients_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_clients FOR EACH ROW EXECUTE FUNCTION public.invoice_clients_trigger();

-- ===========================================
-- INVOICE PRODUCTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_products CASCADE;
CREATE VIEW public.invoice_products AS SELECT * FROM invoice.products;

CREATE OR REPLACE FUNCTION public.invoice_products_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.products (id, organization_id, name, description, sku, unit_price, unit, vat_rate, category, is_active, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.description, NEW.sku, NEW.unit_price, COALESCE(NEW.unit, 'unite'), COALESCE(NEW.vat_rate, 20), NEW.category, COALESCE(NEW.is_active, true), COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.products SET
      organization_id = NEW.organization_id, name = NEW.name, description = NEW.description, sku = NEW.sku, unit_price = NEW.unit_price, unit = NEW.unit, vat_rate = NEW.vat_rate, category = NEW.category, is_active = NEW.is_active, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.products WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_products_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_products FOR EACH ROW EXECUTE FUNCTION public.invoice_products_trigger();

-- ===========================================
-- INVOICE INVOICES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_invoices CASCADE;
CREATE VIEW public.invoice_invoices AS SELECT * FROM invoice.invoices;

CREATE OR REPLACE FUNCTION public.invoice_invoices_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.invoices (id, organization_id, client_id, invoice_number, status, issue_date, due_date, subtotal, discount_amount, discount_percent, vat_amount, total, amount_paid, amount_due, currency, subject, introduction, terms, notes, footer, payment_instructions, quote_id, deal_id, custom_fields, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.client_id, NEW.invoice_number, COALESCE(NEW.status, 'draft'), NEW.issue_date, NEW.due_date, COALESCE(NEW.subtotal, 0), COALESCE(NEW.discount_amount, 0), NEW.discount_percent, COALESCE(NEW.vat_amount, 0), COALESCE(NEW.total, 0), COALESCE(NEW.amount_paid, 0), COALESCE(NEW.amount_due, 0), COALESCE(NEW.currency, 'EUR'), NEW.subject, NEW.introduction, NEW.terms, NEW.notes, NEW.footer, NEW.payment_instructions, NEW.quote_id, NEW.deal_id, COALESCE(NEW.custom_fields, '{}'), NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.invoices SET
      organization_id = NEW.organization_id, client_id = NEW.client_id, invoice_number = NEW.invoice_number, status = NEW.status, issue_date = NEW.issue_date, due_date = NEW.due_date, sent_at = NEW.sent_at, paid_at = NEW.paid_at, subtotal = NEW.subtotal, discount_amount = NEW.discount_amount, discount_percent = NEW.discount_percent, vat_amount = NEW.vat_amount, total = NEW.total, amount_paid = NEW.amount_paid, amount_due = NEW.amount_due, currency = NEW.currency, subject = NEW.subject, introduction = NEW.introduction, terms = NEW.terms, notes = NEW.notes, footer = NEW.footer, payment_instructions = NEW.payment_instructions, quote_id = NEW.quote_id, reminder_count = NEW.reminder_count, last_reminder_at = NEW.last_reminder_at, deal_id = NEW.deal_id, custom_fields = NEW.custom_fields, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.invoices WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_invoices_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_invoices FOR EACH ROW EXECUTE FUNCTION public.invoice_invoices_trigger();

-- ===========================================
-- INVOICE QUOTES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_quotes CASCADE;
CREATE VIEW public.invoice_quotes AS SELECT * FROM invoice.quotes;

CREATE OR REPLACE FUNCTION public.invoice_quotes_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.quotes (id, organization_id, client_id, quote_number, status, issue_date, valid_until, subtotal, discount_amount, discount_percent, vat_amount, total, currency, subject, introduction, terms, notes, footer, deal_id, custom_fields, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.client_id, NEW.quote_number, COALESCE(NEW.status, 'draft'), NEW.issue_date, NEW.valid_until, COALESCE(NEW.subtotal, 0), COALESCE(NEW.discount_amount, 0), NEW.discount_percent, COALESCE(NEW.vat_amount, 0), COALESCE(NEW.total, 0), COALESCE(NEW.currency, 'EUR'), NEW.subject, NEW.introduction, NEW.terms, NEW.notes, NEW.footer, NEW.deal_id, COALESCE(NEW.custom_fields, '{}'), NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.quotes SET
      organization_id = NEW.organization_id, client_id = NEW.client_id, quote_number = NEW.quote_number, status = NEW.status, issue_date = NEW.issue_date, valid_until = NEW.valid_until, accepted_at = NEW.accepted_at, rejected_at = NEW.rejected_at, subtotal = NEW.subtotal, discount_amount = NEW.discount_amount, discount_percent = NEW.discount_percent, vat_amount = NEW.vat_amount, total = NEW.total, currency = NEW.currency, subject = NEW.subject, introduction = NEW.introduction, terms = NEW.terms, notes = NEW.notes, footer = NEW.footer, deal_id = NEW.deal_id, custom_fields = NEW.custom_fields, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.quotes WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_quotes_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_quotes FOR EACH ROW EXECUTE FUNCTION public.invoice_quotes_trigger();

-- ===========================================
-- INVOICE LINE ITEMS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_line_items CASCADE;
CREATE VIEW public.invoice_line_items AS SELECT * FROM invoice.line_items;

CREATE OR REPLACE FUNCTION public.invoice_line_items_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.line_items (id, document_type, invoice_id, quote_id, credit_note_id, position, product_id, description, quantity, unit, unit_price, discount_percent, discount_amount, vat_rate, vat_amount, subtotal, total, created_at, updated_at)
    VALUES (v_id, NEW.document_type, NEW.invoice_id, NEW.quote_id, NEW.credit_note_id, COALESCE(NEW.position, 0), NEW.product_id, NEW.description, COALESCE(NEW.quantity, 1), COALESCE(NEW.unit, 'unite'), NEW.unit_price, NEW.discount_percent, NEW.discount_amount, COALESCE(NEW.vat_rate, 20), NEW.vat_amount, NEW.subtotal, NEW.total, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.line_items SET
      document_type = NEW.document_type, invoice_id = NEW.invoice_id, quote_id = NEW.quote_id, credit_note_id = NEW.credit_note_id, position = NEW.position, product_id = NEW.product_id, description = NEW.description, quantity = NEW.quantity, unit = NEW.unit, unit_price = NEW.unit_price, discount_percent = NEW.discount_percent, discount_amount = NEW.discount_amount, vat_rate = NEW.vat_rate, vat_amount = NEW.vat_amount, subtotal = NEW.subtotal, total = NEW.total, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.line_items WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_line_items_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_line_items FOR EACH ROW EXECUTE FUNCTION public.invoice_line_items_trigger();

-- ===========================================
-- INVOICE PAYMENTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_payments CASCADE;
CREATE VIEW public.invoice_payments AS SELECT * FROM invoice.payments;

CREATE OR REPLACE FUNCTION public.invoice_payments_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.payments (id, invoice_id, amount, payment_date, payment_method, reference, notes, recorded_by, created_at, updated_at)
    VALUES (v_id, NEW.invoice_id, NEW.amount, NEW.payment_date, NEW.payment_method, NEW.reference, NEW.notes, NEW.recorded_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.payments SET
      invoice_id = NEW.invoice_id, amount = NEW.amount, payment_date = NEW.payment_date, payment_method = NEW.payment_method, reference = NEW.reference, notes = NEW.notes, recorded_by = NEW.recorded_by, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.payments WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_payments_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_payments FOR EACH ROW EXECUTE FUNCTION public.invoice_payments_trigger();

-- ===========================================
-- INVOICE CREDIT NOTES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.invoice_credit_notes CASCADE;
CREATE VIEW public.invoice_credit_notes AS SELECT * FROM invoice.credit_notes;

CREATE OR REPLACE FUNCTION public.invoice_credit_notes_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO invoice.credit_notes (id, organization_id, client_id, invoice_id, credit_note_number, status, issue_date, reason, subtotal, vat_amount, total, currency, notes, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.client_id, NEW.invoice_id, NEW.credit_note_number, COALESCE(NEW.status, 'draft'), NEW.issue_date, NEW.reason, COALESCE(NEW.subtotal, 0), COALESCE(NEW.vat_amount, 0), COALESCE(NEW.total, 0), COALESCE(NEW.currency, 'EUR'), NEW.notes, NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE invoice.credit_notes SET
      organization_id = NEW.organization_id, client_id = NEW.client_id, invoice_id = NEW.invoice_id, credit_note_number = NEW.credit_note_number, status = NEW.status, issue_date = NEW.issue_date, reason = NEW.reason, subtotal = NEW.subtotal, vat_amount = NEW.vat_amount, total = NEW.total, currency = NEW.currency, notes = NEW.notes, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM invoice.credit_notes WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER invoice_credit_notes_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.invoice_credit_notes FOR EACH ROW EXECUTE FUNCTION public.invoice_credit_notes_trigger();

-- ===========================================
-- GRANTS
-- ===========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_pipelines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_pipeline_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_credit_notes TO authenticated;

COMMIT;
