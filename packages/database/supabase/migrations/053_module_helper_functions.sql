-- ===========================================
-- 053_module_helper_functions.sql
-- Helper functions for module billing system
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/053_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CHECK IF MODULE IS PAID
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_module_paid(
  p_org_id UUID,
  p_module_id TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.module_subscriptions
    WHERE organization_id = p_org_id
      AND module_id = p_module_id
      AND status IN ('active', 'trialing')
  );
$$;

-- ===========================================
-- 2. GET MODULE LIMIT
-- ===========================================

CREATE OR REPLACE FUNCTION public.get_module_limit(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
BEGIN
  SELECT CASE WHEN status IN ('active', 'trialing') THEN 'paid' ELSE 'free' END
  INTO v_tier
  FROM public.module_subscriptions
  WHERE organization_id = p_org_id AND module_id = p_module_id;

  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  SELECT limit_value INTO v_limit
  FROM public.module_limits
  WHERE module_id = p_module_id
    AND tier = v_tier
    AND limit_key = p_limit_key;

  RETURN COALESCE(v_limit, 0);
END;
$$;

-- ===========================================
-- 3. CHECK MODULE LIMIT
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_module_limit(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_limit INTEGER;
  v_current_usage INTEGER;
BEGIN
  v_limit := get_module_limit(p_org_id, p_module_id, p_limit_key);

  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;

  SELECT COALESCE(current_count, 0) INTO v_current_usage
  FROM public.module_usage
  WHERE organization_id = p_org_id
    AND module_id = p_module_id
    AND limit_key = p_limit_key
    AND period_start <= NOW()
    AND period_end > NOW();

  IF v_current_usage IS NULL THEN
    v_current_usage := 0;
  END IF;

  RETURN v_current_usage < v_limit;
END;
$$;

-- ===========================================
-- 4. INCREMENT MODULE USAGE
-- ===========================================

CREATE OR REPLACE FUNCTION public.increment_module_usage(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
  VALUES (p_org_id, p_module_id, p_limit_key, p_increment, v_period_start, v_period_end)
  ON CONFLICT (organization_id, module_id, limit_key, period_start)
  DO UPDATE SET
    current_count = module_usage.current_count + p_increment,
    updated_at = NOW();
END;
$$;

-- ===========================================
-- 5. DECREMENT MODULE USAGE
-- ===========================================

CREATE OR REPLACE FUNCTION public.decrement_module_usage(
  p_org_id UUID,
  p_module_id TEXT,
  p_limit_key TEXT,
  p_decrement INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());

  UPDATE public.module_usage
  SET current_count = GREATEST(0, current_count - p_decrement),
      updated_at = NOW()
  WHERE organization_id = p_org_id
    AND module_id = p_module_id
    AND limit_key = p_limit_key
    AND period_start = v_period_start;
END;
$$;

-- ===========================================
-- 6. GET ORGANIZATION MODULES
-- ===========================================

CREATE OR REPLACE FUNCTION public.get_organization_modules(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_result JSONB := '[]'::JSONB;
  v_module RECORD;
  v_module_data JSONB;
  v_limits JSONB;
  v_usage JSONB;
BEGIN
  FOR v_module IN
    SELECT
      m.id,
      m.name,
      m.description,
      m.icon,
      m.color,
      m.base_price_monthly,
      m.base_price_yearly,
      COALESCE(ms.status, 'free') as status,
      ms.billing_cycle,
      ms.current_period_start,
      ms.current_period_end,
      ms.cancel_at_period_end,
      ms.trial_end
    FROM public.modules m
    LEFT JOIN public.module_subscriptions ms
      ON ms.module_id = m.id AND ms.organization_id = p_org_id
    WHERE m.is_active = TRUE
    ORDER BY m.display_order
  LOOP
    SELECT jsonb_object_agg(limit_key, limit_value)
    INTO v_limits
    FROM public.module_limits
    WHERE module_id = v_module.id
      AND tier = CASE WHEN v_module.status IN ('active', 'trialing') THEN 'paid' ELSE 'free' END;

    SELECT jsonb_object_agg(limit_key, current_count)
    INTO v_usage
    FROM public.module_usage
    WHERE organization_id = p_org_id
      AND module_id = v_module.id
      AND period_start <= NOW()
      AND period_end > NOW();

    v_module_data := jsonb_build_object(
      'id', v_module.id,
      'name', v_module.name,
      'description', v_module.description,
      'icon', v_module.icon,
      'color', v_module.color,
      'price_monthly', v_module.base_price_monthly,
      'price_yearly', v_module.base_price_yearly,
      'status', v_module.status,
      'billing_cycle', v_module.billing_cycle,
      'current_period_start', v_module.current_period_start,
      'current_period_end', v_module.current_period_end,
      'cancel_at_period_end', v_module.cancel_at_period_end,
      'trial_end', v_module.trial_end,
      'is_paid', v_module.status IN ('active', 'trialing'),
      'limits', COALESCE(v_limits, '{}'::JSONB),
      'usage', COALESCE(v_usage, '{}'::JSONB)
    );

    v_result := v_result || v_module_data;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ===========================================
-- 7. CHECK MODULE DOWNGRADE
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_module_downgrade(
  p_org_id UUID,
  p_module_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_exceeding_limits JSONB := '[]'::JSONB;
  v_can_downgrade BOOLEAN := TRUE;
  v_limit_record RECORD;
  v_current_count INTEGER;
BEGIN
  FOR v_limit_record IN
    SELECT limit_key, limit_value, description
    FROM public.module_limits
    WHERE module_id = p_module_id AND tier = 'free'
  LOOP
    CASE p_module_id
      WHEN 'crm' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_contacts' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.contacts WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_companies' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.companies WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_deals' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.deals WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_pipelines' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM crm.pipelines WHERE organization_id = p_org_id;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'invoice' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_clients' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM invoice.clients WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_products' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM invoice.products WHERE organization_id = p_org_id AND deleted_at IS NULL;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'projects' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_projects' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM projects.projects WHERE organization_id = p_org_id AND deleted_at IS NULL;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'tickets' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_kb_articles' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM tickets.kb_articles WHERE organization_id = p_org_id;
          WHEN 'max_canned_responses' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM tickets.canned_responses WHERE organization_id = p_org_id;
          WHEN 'sla_policies' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM tickets.sla_policies WHERE organization_id = p_org_id;
          ELSE
            v_current_count := 0;
        END CASE;

      WHEN 'hr' THEN
        CASE v_limit_record.limit_key
          WHEN 'max_employees' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM hr.employees WHERE organization_id = p_org_id AND deleted_at IS NULL;
          WHEN 'max_leave_types' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM hr.leave_types WHERE organization_id = p_org_id;
          ELSE
            v_current_count := 0;
        END CASE;

      ELSE
        v_current_count := 0;
    END CASE;

    IF v_limit_record.limit_value >= 0 AND v_current_count > v_limit_record.limit_value THEN
      v_can_downgrade := FALSE;
      v_exceeding_limits := v_exceeding_limits || jsonb_build_object(
        'key', v_limit_record.limit_key,
        'current', v_current_count,
        'free_limit', v_limit_record.limit_value,
        'description', COALESCE(v_limit_record.description, v_limit_record.limit_key)
      );
    END IF;
  END LOOP;

  IF NOT v_can_downgrade THEN
    v_result := jsonb_build_object(
      'can_downgrade', FALSE,
      'exceeding_limits', v_exceeding_limits,
      'warning_message', 'Attention: votre utilisation depasse les limites du plan gratuit.'
    );
  ELSE
    v_result := jsonb_build_object(
      'can_downgrade', TRUE,
      'exceeding_limits', '[]'::JSONB,
      'warning_message', NULL
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ===========================================
-- 8. STRIPE WEBHOOK HANDLERS
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_stripe_subscription_update(
  p_org_id UUID,
  p_module_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_stripe_customer_id TEXT,
  p_status TEXT,
  p_billing_cycle TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT FALSE,
  p_trial_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.module_subscriptions (
    organization_id,
    module_id,
    stripe_subscription_id,
    stripe_price_id,
    stripe_customer_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    trial_end
  )
  VALUES (
    p_org_id,
    p_module_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_stripe_customer_id,
    p_status,
    p_billing_cycle,
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end,
    p_trial_end
  )
  ON CONFLICT (organization_id, module_id)
  DO UPDATE SET
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    status = EXCLUDED.status,
    billing_cycle = EXCLUDED.billing_cycle,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    trial_end = EXCLUDED.trial_end,
    updated_at = NOW();

  RETURN jsonb_build_object('success', TRUE, 'module_id', p_module_id, 'status', p_status);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_stripe_subscription_canceled(
  p_stripe_subscription_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_module_id TEXT;
BEGIN
  SELECT organization_id, module_id
  INTO v_org_id, v_module_id
  FROM public.module_subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Subscription not found');
  END IF;

  UPDATE public.module_subscriptions
  SET
    status = 'canceled',
    canceled_at = NOW(),
    updated_at = NOW()
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'organization_id', v_org_id,
    'module_id', v_module_id,
    'status', 'canceled'
  );
END;
$$;

-- ===========================================
-- 9. GRANT PERMISSIONS
-- ===========================================

GRANT EXECUTE ON FUNCTION public.is_module_paid(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_module_limit(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_module_limit(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_module_usage(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_module_usage(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organization_modules(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_module_downgrade(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_stripe_subscription_update(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_stripe_subscription_canceled(TEXT) TO service_role;

-- ===========================================
-- 10. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.is_module_paid IS 'Check if a module is in paid status for an organization';
COMMENT ON FUNCTION public.get_module_limit IS 'Get the applicable limit for a module/org based on subscription tier';
COMMENT ON FUNCTION public.check_module_limit IS 'Check if an action is allowed (usage < limit)';
COMMENT ON FUNCTION public.increment_module_usage IS 'Increment usage counter for a module feature';
COMMENT ON FUNCTION public.decrement_module_usage IS 'Decrement usage counter for a module feature';
COMMENT ON FUNCTION public.get_organization_modules IS 'Get all modules with subscription status, limits and usage for an org';
COMMENT ON FUNCTION public.check_module_downgrade IS 'Check if an organization can safely downgrade a module to free tier';

COMMIT;
