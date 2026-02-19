-- ===========================================
-- 056_seed_existing_orgs.sql
-- Provision module subscriptions for existing organizations
-- ===========================================
-- Dependencies: 054_provision_functions.sql
-- Rollback: rollbacks/056_rollback.sql
-- ===========================================
-- NOTE: This migration should be run ONCE to migrate existing orgs
-- It will provision free module subscriptions for all existing organizations
-- ===========================================

BEGIN;

-- ===========================================
-- 1. MIGRATE EXISTING ORGANIZATIONS
-- ===========================================

DO $$
DECLARE
  r RECORD;
  v_result JSONB;
  v_migrated_count INTEGER := 0;
  v_failed_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Starting migration of existing organizations to module billing';
  RAISE NOTICE '====================================================';

  FOR r IN
    SELECT id, name, slug
    FROM public.organizations
    WHERE deleted_at IS NULL
  LOOP
    -- Check if already has module subscriptions
    IF EXISTS (
      SELECT 1 FROM public.module_subscriptions
      WHERE organization_id = r.id
      LIMIT 1
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      RAISE NOTICE 'Skipping org % (%): already has module subscriptions', r.name, r.id;
      CONTINUE;
    END IF;

    -- Provision module subscriptions
    BEGIN
      PERFORM public.provision_module_subscriptions(r.id);
      PERFORM public.provision_module_usage(r.id);

      v_migrated_count := v_migrated_count + 1;
      RAISE NOTICE 'Migrated org % (%): provisioned free subscriptions', r.name, r.id;

    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
      RAISE WARNING 'Failed to migrate org % (%): %', r.name, r.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  - Migrated: %', v_migrated_count;
  RAISE NOTICE '  - Skipped (already migrated): %', v_skipped_count;
  RAISE NOTICE '  - Failed: %', v_failed_count;
  RAISE NOTICE '====================================================';
END $$;

-- ===========================================
-- 2. SYNC USAGE COUNTERS WITH ACTUAL DATA
-- ===========================================

DO $$
DECLARE
  r RECORD;
  v_count INTEGER;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  v_period_start := date_trunc('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  RAISE NOTICE 'Syncing usage counters with actual data...';

  FOR r IN SELECT id FROM public.organizations WHERE deleted_at IS NULL
  LOOP
    -- CRM: Contacts
    SELECT COUNT(*) INTO v_count FROM crm.contacts WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_contacts', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- CRM: Companies
    SELECT COUNT(*) INTO v_count FROM crm.companies WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_companies', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- CRM: Deals
    SELECT COUNT(*) INTO v_count FROM crm.deals WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_deals', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- CRM: Pipelines
    SELECT COUNT(*) INTO v_count FROM crm.pipelines WHERE organization_id = r.id;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'crm', 'max_pipelines', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Invoice: Clients
    SELECT COUNT(*) INTO v_count FROM invoice.clients WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'invoice', 'max_clients', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Invoice: Products
    SELECT COUNT(*) INTO v_count FROM invoice.products WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'invoice', 'max_products', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Projects: Projects
    SELECT COUNT(*) INTO v_count FROM projects.projects WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'projects', 'max_projects', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- HR: Employees
    SELECT COUNT(*) INTO v_count FROM hr.employees WHERE organization_id = r.id AND deleted_at IS NULL;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'hr', 'max_employees', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Tickets: KB Articles
    SELECT COUNT(*) INTO v_count FROM tickets.kb_articles WHERE organization_id = r.id;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'tickets', 'max_kb_articles', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();

    -- Tickets: Canned Responses
    SELECT COUNT(*) INTO v_count FROM tickets.canned_responses WHERE organization_id = r.id;
    INSERT INTO public.module_usage (organization_id, module_id, limit_key, current_count, period_start, period_end)
    VALUES (r.id, 'tickets', 'max_canned_responses', v_count, v_period_start, v_period_end)
    ON CONFLICT (organization_id, module_id, limit_key, period_start)
    DO UPDATE SET current_count = v_count, updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Usage counters synced successfully';
END $$;

-- ===========================================
-- 3. VERIFY MIGRATION
-- ===========================================

DO $$
DECLARE
  v_org_count INTEGER;
  v_sub_count INTEGER;
  v_module_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_org_count FROM public.organizations WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_sub_count FROM public.module_subscriptions;
  SELECT COUNT(*) INTO v_module_count FROM public.modules WHERE is_active = TRUE;

  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Migration verification:';
  RAISE NOTICE '  - Total organizations: %', v_org_count;
  RAISE NOTICE '  - Total module subscriptions: %', v_sub_count;
  RAISE NOTICE '  - Expected subscriptions (orgs x modules): %', v_org_count * v_module_count;
  RAISE NOTICE '====================================================';

  IF v_sub_count < v_org_count * v_module_count THEN
    RAISE WARNING 'Some subscriptions may be missing!';
  ELSE
    RAISE NOTICE 'All organizations have module subscriptions';
  END IF;
END $$;

COMMIT;
