-- ===========================================
-- 064_admin_console_functions.sql
-- Admin console RPC functions for organization management
-- ===========================================

BEGIN;

-- ===========================================
-- 1. LIST ALL ORGANIZATIONS (ADMIN ONLY)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_list_organizations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  industry TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN,
  member_count BIGINT,
  owner_email TEXT,
  owner_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For now, allow any authenticated user (single-tenant mode)
  -- In multi-tenant SaaS, you'd check for super-admin role here
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name::TEXT,
    o.slug::TEXT,
    o.industry::TEXT,
    o.email::TEXT,
    o.phone::TEXT,
    o.created_at,
    o.updated_at,
    o.onboarding_completed,
    (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = o.id)::BIGINT as member_count,
    (SELECT u.email FROM organization_members om2
     JOIN users u ON u.id = om2.user_id
     WHERE om2.organization_id = o.id AND om2.role = 'owner'
     LIMIT 1)::TEXT as owner_email,
    (SELECT u.name FROM organization_members om3
     JOIN users u ON u.id = om3.user_id
     WHERE om3.organization_id = o.id AND om3.role = 'owner'
     LIMIT 1)::TEXT as owner_name
  FROM organizations o
  WHERE o.deleted_at IS NULL
  ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_organizations() TO authenticated;

-- ===========================================
-- 2. CREATE ORGANIZATION (ADMIN)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_owner_email TEXT,
  p_owner_name TEXT,
  p_owner_password TEXT,
  p_industry TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
  v_module RECORD;
  v_employee_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check slug availability
  IF EXISTS (SELECT 1 FROM organizations WHERE slug = p_slug AND deleted_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ce slug est deja utilise');
  END IF;

  -- Check if user with this email already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_owner_email;

  IF v_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Un utilisateur avec cet email existe deja');
  END IF;

  -- Create auth user (this requires service_role key, so we'll handle it differently)
  -- For now, we'll create the organization and user record, and send an invite
  v_user_id := uuid_generate_v4();

  -- Create user record
  INSERT INTO users (id, email, name, email_verified, created_at, updated_at)
  VALUES (v_user_id, p_owner_email, p_owner_name, false, NOW(), NOW());

  -- Create organization
  INSERT INTO organizations (name, slug, industry, created_by, onboarding_completed, created_at, updated_at)
  VALUES (p_name, p_slug, p_industry, v_user_id, true, NOW(), NOW())
  RETURNING id INTO v_org_id;

  -- Add owner membership
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, v_user_id, 'owner', NOW());

  -- Create module subscriptions
  FOR v_module IN SELECT id FROM modules WHERE is_active = true
  LOOP
    INSERT INTO module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- Create HR settings
  INSERT INTO hr.settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Create default leave types
  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system) VALUES
    (v_org_id, 'Conges payes', 'cp', '#22c55e', true, true),
    (v_org_id, 'RTT', 'rtt', '#3b82f6', true, true),
    (v_org_id, 'Maladie', 'sick', '#ef4444', true, true),
    (v_org_id, 'Sans solde', 'unpaid', '#6b7280', false, true),
    (v_org_id, 'Maternite', 'maternity', '#ec4899', true, true),
    (v_org_id, 'Paternite', 'paternity', '#8b5cf6', true, true)
  ON CONFLICT (organization_id, code) DO NOTHING;

  -- Parse name for employee record
  v_name_parts := string_to_array(trim(COALESCE(p_owner_name, '')), ' ');
  IF array_length(v_name_parts, 1) >= 2 THEN
    v_first_name := v_name_parts[1];
    v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
  ELSE
    v_first_name := COALESCE(p_owner_name, split_part(p_owner_email, '@', 1));
    v_last_name := '';
  END IF;

  -- Create employee record
  INSERT INTO hr.employees (
    organization_id, user_id, first_name, last_name, email, work_email,
    job_title, contract_type, contract_start_date, status,
    annual_leave_balance, rtt_balance, created_at, updated_at
  )
  VALUES (
    v_org_id, v_user_id, v_first_name, v_last_name, p_owner_email, p_owner_email,
    'Administrateur', 'cdi', CURRENT_DATE, 'active',
    25.0, 0.0, NOW(), NOW()
  )
  RETURNING id INTO v_employee_id;

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'user_id', v_user_id,
    'employee_id', v_employee_id,
    'message', 'Organisation creee. L''utilisateur doit etre cree via Supabase Auth.'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_organization(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ===========================================
-- 3. DELETE ORGANIZATION (ADMIN)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_delete_organization(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org RECORD;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check organization exists
  SELECT * INTO v_org FROM organizations WHERE id = p_org_id AND deleted_at IS NULL;

  IF v_org IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Organisation non trouvee');
  END IF;

  -- Soft delete the organization
  UPDATE organizations
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_org_id;

  -- Also soft delete all related data
  -- HR employees
  UPDATE hr.employees SET deleted_at = NOW() WHERE organization_id = p_org_id;

  -- HR interviews
  UPDATE hr.interviews SET deleted_at = NOW() WHERE organization_id = p_org_id;

  -- HR leave requests
  UPDATE hr.leave_requests SET deleted_at = NOW() WHERE organization_id = p_org_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Organisation supprimee avec succes'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_organization(UUID) TO authenticated;

-- ===========================================
-- 4. GET ORGANIZATION STATS (ADMIN)
-- ===========================================

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_orgs BIGINT;
  v_total_users BIGINT;
  v_total_employees BIGINT;
  v_orgs_this_month BIGINT;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO v_total_orgs FROM organizations WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_total_users FROM users;
  SELECT COUNT(*) INTO v_total_employees FROM hr.employees WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_orgs_this_month
  FROM organizations
  WHERE deleted_at IS NULL
    AND created_at >= date_trunc('month', CURRENT_DATE);

  RETURN jsonb_build_object(
    'total_organizations', v_total_orgs,
    'total_users', v_total_users,
    'total_employees', v_total_employees,
    'organizations_this_month', v_orgs_this_month
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;

-- ===========================================
-- 5. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.admin_list_organizations IS 'List all organizations for admin console';
COMMENT ON FUNCTION public.admin_create_organization IS 'Create a new organization with owner from admin console';
COMMENT ON FUNCTION public.admin_delete_organization IS 'Soft delete an organization from admin console';
COMMENT ON FUNCTION public.admin_get_stats IS 'Get global statistics for admin dashboard';

COMMIT;
