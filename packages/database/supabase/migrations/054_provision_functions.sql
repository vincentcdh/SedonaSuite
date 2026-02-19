-- ===========================================
-- 054_provision_functions.sql
-- Provisioning functions for organizations
-- ===========================================
-- Dependencies: 053_module_helper_functions.sql
-- Rollback: rollbacks/054_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. PROVISION CRM DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_crm(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pipeline_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM crm.pipelines
    WHERE organization_id = p_org_id AND is_default = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  INSERT INTO crm.pipelines (organization_id, name, description, is_default)
  VALUES (
    p_org_id,
    'Pipeline de ventes',
    'Pipeline par defaut pour le suivi des opportunites commerciales',
    TRUE
  )
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm.pipeline_stages (pipeline_id, name, color, position, probability) VALUES
    (v_pipeline_id, 'Prospection', '#94A3B8', 1, 10),
    (v_pipeline_id, 'Qualification', '#60A5FA', 2, 25),
    (v_pipeline_id, 'Proposition', '#FBBF24', 3, 50),
    (v_pipeline_id, 'Negociation', '#F97316', 4, 75),
    (v_pipeline_id, 'Cloture', '#22C55E', 5, 100);

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning CRM for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 2. PROVISION INVOICE DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_invoice(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO invoice.organization_settings (
    organization_id,
    default_payment_terms,
    default_quote_validity,
    default_vat_rate,
    default_currency,
    legal_mentions,
    late_payment_penalty
  )
  VALUES (
    p_org_id,
    30,
    30,
    20.00,
    'EUR',
    'En cas de retard de paiement, des penalites de retard seront appliquees au taux legal en vigueur.',
    'Taux de penalite: 3 fois le taux d''interet legal'
  )
  ON CONFLICT (organization_id) DO NOTHING;

  INSERT INTO invoice.number_sequences (organization_id, type, prefix, current_number, padding)
  VALUES
    (p_org_id, 'invoice', 'FA-', 0, 4),
    (p_org_id, 'quote', 'DE-', 0, 4),
    (p_org_id, 'credit_note', 'AV-', 0, 4)
  ON CONFLICT (organization_id, type) DO NOTHING;

  INSERT INTO invoice.vat_rates (organization_id, name, rate, is_default) VALUES
    (p_org_id, 'TVA normale (20%)', 20.00, TRUE),
    (p_org_id, 'TVA intermediaire (10%)', 10.00, FALSE),
    (p_org_id, 'TVA reduite (5.5%)', 5.50, FALSE),
    (p_org_id, 'TVA super-reduite (2.1%)', 2.10, FALSE)
  ON CONFLICT (organization_id, rate) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning Invoice for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 3. PROVISION TICKETS DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_tickets(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sla_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tickets.sla_policies
    WHERE organization_id = p_org_id AND is_default = TRUE
  ) THEN
    INSERT INTO tickets.sla_policies (
      organization_id,
      name,
      description,
      urgent_first_response,
      urgent_resolution,
      high_first_response,
      high_resolution,
      normal_first_response,
      normal_resolution,
      low_first_response,
      low_resolution,
      business_hours_only,
      business_hours_start,
      business_hours_end,
      business_days,
      is_default,
      is_active
    )
    VALUES (
      p_org_id,
      'Standard',
      'Politique SLA par defaut',
      60, 240,
      240, 480,
      480, 1440,
      1440, 4320,
      TRUE,
      '09:00',
      '18:00',
      ARRAY[1,2,3,4,5],
      TRUE,
      TRUE
    )
    RETURNING id INTO v_sla_id;
  END IF;

  INSERT INTO tickets.categories (organization_id, name, description, color, icon, position, is_active) VALUES
    (p_org_id, 'Technique', 'Problemes techniques et bugs', '#EF4444', 'bug', 1, TRUE),
    (p_org_id, 'Commercial', 'Questions commerciales et devis', '#3B82F6', 'briefcase', 2, TRUE),
    (p_org_id, 'Administratif', 'Questions administratives et facturation', '#8B5CF6', 'file-text', 3, TRUE),
    (p_org_id, 'Autre', 'Autres demandes', '#6B7280', 'help-circle', 4, TRUE)
  ON CONFLICT (organization_id, name) DO NOTHING;

  INSERT INTO tickets.number_sequences (organization_id, prefix, current_number, padding)
  VALUES (p_org_id, 'TKT', 0, 5)
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning Tickets for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 4. PROVISION HR DATA
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_hr(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO hr.settings (
    organization_id,
    annual_leave_days_per_year,
    rtt_days_per_year,
    leave_year_start_month,
    default_work_hours_per_week,
    work_days,
    alert_trial_end_days,
    alert_contract_end_days,
    alert_interview_days,
    employee_self_service_enabled,
    employees_can_request_leaves,
    employees_can_view_directory,
    employees_can_edit_profile
  )
  VALUES (
    p_org_id,
    25.0,
    10.0,
    6,
    35.0,
    '["monday","tuesday","wednesday","thursday","friday"]',
    15,
    30,
    30,
    TRUE,
    TRUE,
    TRUE,
    FALSE
  )
  ON CONFLICT (organization_id) DO NOTHING;

  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, requires_approval, deducts_from_balance, is_system) VALUES
    (p_org_id, 'Conges payes', 'cp', '#22C55E', TRUE, TRUE, TRUE, TRUE),
    (p_org_id, 'RTT', 'rtt', '#3B82F6', TRUE, TRUE, TRUE, TRUE),
    (p_org_id, 'Maladie', 'sick', '#EF4444', TRUE, FALSE, FALSE, TRUE),
    (p_org_id, 'Sans solde', 'unpaid', '#6B7280', FALSE, TRUE, FALSE, TRUE),
    (p_org_id, 'Conge parental', 'parental', '#8B5CF6', FALSE, TRUE, FALSE, TRUE)
  ON CONFLICT (organization_id, code) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning HR for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 5. PROVISION MODULE SUBSCRIPTIONS
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_module_subscriptions(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module RECORD;
BEGIN
  FOR v_module IN SELECT id FROM public.modules WHERE is_active = TRUE
  LOOP
    INSERT INTO public.module_subscriptions (organization_id, module_id, status)
    VALUES (p_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning module subscriptions for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 6. PROVISION MODULE USAGE
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_module_usage(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit RECORD;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  FOR v_limit IN
    SELECT DISTINCT module_id, limit_key
    FROM public.module_limits
    WHERE tier = 'free'
  LOOP
    INSERT INTO public.module_usage (
      organization_id,
      module_id,
      limit_key,
      current_count,
      period_start,
      period_end
    )
    VALUES (
      p_org_id,
      v_limit.module_id,
      v_limit.limit_key,
      0,
      v_period_start,
      v_period_end
    )
    ON CONFLICT (organization_id, module_id, limit_key, period_start) DO NOTHING;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error provisioning module usage for org %: %', p_org_id, SQLERRM;
    RETURN FALSE;
END;
$$;

-- ===========================================
-- 7. MAIN PROVISIONING FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION public.provision_organization(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_crm_ok BOOLEAN;
  v_invoice_ok BOOLEAN;
  v_tickets_ok BOOLEAN;
  v_hr_ok BOOLEAN;
  v_modules_ok BOOLEAN;
  v_usage_ok BOOLEAN;
  v_result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_org_id) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Organization not found'
    );
  END IF;

  v_modules_ok := provision_module_subscriptions(p_org_id);
  v_usage_ok := provision_module_usage(p_org_id);
  v_crm_ok := provision_crm(p_org_id);
  v_invoice_ok := provision_invoice(p_org_id);
  v_tickets_ok := provision_tickets(p_org_id);
  v_hr_ok := provision_hr(p_org_id);

  v_result := jsonb_build_object(
    'success', (v_crm_ok AND v_invoice_ok AND v_tickets_ok AND v_hr_ok AND v_modules_ok AND v_usage_ok),
    'modules', jsonb_build_object(
      'subscriptions', v_modules_ok,
      'usage_tracking', v_usage_ok,
      'crm', v_crm_ok,
      'invoice', v_invoice_ok,
      'tickets', v_tickets_ok,
      'hr', v_hr_ok
    ),
    'provisioned_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- ===========================================
-- 8. CHECK ORGANIZATION PROVISIONED
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_organization_provisioned(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_crm_ok BOOLEAN;
  v_invoice_ok BOOLEAN;
  v_tickets_ok BOOLEAN;
  v_hr_ok BOOLEAN;
  v_modules_ok BOOLEAN;
  v_crm_count INTEGER;
  v_invoice_count INTEGER;
  v_tickets_count INTEGER;
  v_hr_count INTEGER;
  v_modules_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_org_id) THEN
    RETURN jsonb_build_object(
      'organization_id', p_org_id,
      'is_fully_provisioned', FALSE,
      'error', 'Organization not found'
    );
  END IF;

  SELECT COUNT(*) > 0, COUNT(*)
  INTO v_modules_ok, v_modules_count
  FROM public.module_subscriptions
  WHERE organization_id = p_org_id;

  SELECT
    EXISTS (SELECT 1 FROM crm.pipelines WHERE organization_id = p_org_id AND is_default = TRUE),
    (SELECT COUNT(*) FROM crm.pipeline_stages ps JOIN crm.pipelines p ON ps.pipeline_id = p.id WHERE p.organization_id = p_org_id)
  INTO v_crm_ok, v_crm_count;

  SELECT
    EXISTS (SELECT 1 FROM invoice.organization_settings WHERE organization_id = p_org_id),
    (SELECT COUNT(*) FROM invoice.vat_rates WHERE organization_id = p_org_id)
  INTO v_invoice_ok, v_invoice_count;

  SELECT
    EXISTS (SELECT 1 FROM tickets.sla_policies WHERE organization_id = p_org_id AND is_default = TRUE),
    (SELECT COUNT(*) FROM tickets.categories WHERE organization_id = p_org_id)
  INTO v_tickets_ok, v_tickets_count;

  SELECT
    EXISTS (SELECT 1 FROM hr.settings WHERE organization_id = p_org_id),
    (SELECT COUNT(*) FROM hr.leave_types WHERE organization_id = p_org_id)
  INTO v_hr_ok, v_hr_count;

  RETURN jsonb_build_object(
    'organization_id', p_org_id,
    'is_fully_provisioned', (v_crm_ok AND v_invoice_ok AND v_tickets_ok AND v_hr_ok AND v_modules_ok),
    'modules', jsonb_build_object(
      'crm', jsonb_build_object('provisioned', v_crm_ok, 'items_count', v_crm_count),
      'invoice', jsonb_build_object('provisioned', v_invoice_ok, 'items_count', v_invoice_count),
      'tickets', jsonb_build_object('provisioned', v_tickets_ok, 'items_count', v_tickets_count),
      'hr', jsonb_build_object('provisioned', v_hr_ok, 'items_count', v_hr_count)
    ),
    'subscriptions_count', v_modules_count,
    'checked_at', NOW()
  );
END;
$$;

-- ===========================================
-- 9. AUTO-PROVISION TRIGGERS
-- ===========================================

CREATE OR REPLACE FUNCTION public.trigger_provision_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NEW.onboarding_completed = TRUE THEN
    v_result := provision_organization(NEW.id);
    IF NOT (v_result->>'success')::BOOLEAN THEN
      RAISE WARNING 'Failed to provision organization %: %', NEW.id, v_result;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_organization_created ON public.organizations;
CREATE TRIGGER after_organization_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_provision_organization();

CREATE OR REPLACE FUNCTION public.trigger_provision_organization_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NEW.onboarding_completed = TRUE AND (OLD.onboarding_completed = FALSE OR OLD.onboarding_completed IS NULL) THEN
    v_result := provision_organization(NEW.id);
    IF NOT (v_result->>'success')::BOOLEAN THEN
      RAISE WARNING 'Failed to provision organization %: %', NEW.id, v_result;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_organization_onboarding_completed ON public.organizations;
CREATE TRIGGER after_organization_onboarding_completed
  AFTER UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_provision_organization_on_update();

-- ===========================================
-- 10. GRANT PERMISSIONS
-- ===========================================

GRANT EXECUTE ON FUNCTION public.provision_organization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provision_organization(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_organization_provisioned(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_organization_provisioned(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.provision_module_subscriptions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provision_module_usage(UUID) TO authenticated;

-- ===========================================
-- 11. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.provision_organization IS 'Provisions all default data for a new organization';
COMMENT ON FUNCTION public.check_organization_provisioned IS 'Checks the provisioning status of an organization';
COMMENT ON FUNCTION public.provision_crm IS 'Provisions default CRM data (sales pipeline with 5 stages)';
COMMENT ON FUNCTION public.provision_invoice IS 'Provisions default invoice settings (FR prefixes, VAT rates)';
COMMENT ON FUNCTION public.provision_tickets IS 'Provisions default ticket settings (SLA policy, categories)';
COMMENT ON FUNCTION public.provision_hr IS 'Provisions default HR settings (FR leave types, 35h/week)';

COMMIT;
