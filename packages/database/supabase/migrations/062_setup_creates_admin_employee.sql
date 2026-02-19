-- ===========================================
-- 062_setup_creates_admin_employee.sql
-- Modify organization creation functions to create admin employee
-- ===========================================
-- Dependencies: 057_create_organization_rpc.sql, 058_setup_organization_rpc.sql, 060_hr_schema.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. UPDATE SETUP ORGANIZATION FUNCTION
-- Now also creates an HR employee record for the admin
-- ===========================================

CREATE OR REPLACE FUNCTION public.setup_organization(
  p_org_name TEXT,
  p_org_slug TEXT,
  p_admin_name TEXT,
  p_admin_email TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
  v_employee_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Validate user_id matches current auth user
  IF p_user_id != auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'User ID mismatch');
  END IF;

  -- Validate slug is available
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = p_org_slug AND deleted_at IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slug already taken');
  END IF;

  -- 1. Create or update user in public.users table
  INSERT INTO public.users (id, email, name, email_verified, created_at, updated_at)
  VALUES (p_user_id, p_admin_email, p_admin_name, true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

  -- 2. Create organization
  INSERT INTO public.organizations (
    name,
    slug,
    created_by,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    p_org_name,
    p_org_slug,
    p_user_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_org_id;

  -- 3. Add creator as owner
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, p_user_id, 'owner', NOW());

  -- 4. Create free subscriptions for all active modules
  FOR v_module IN SELECT id FROM public.modules WHERE is_active = true
  LOOP
    INSERT INTO public.module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- 5. Create HR settings for the organization
  INSERT INTO hr.settings (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- 6. Create default leave types
  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system) VALUES
    (v_org_id, 'Conges payes', 'cp', '#22c55e', true, true),
    (v_org_id, 'RTT', 'rtt', '#3b82f6', true, true),
    (v_org_id, 'Maladie', 'sick', '#ef4444', true, true),
    (v_org_id, 'Sans solde', 'unpaid', '#6b7280', false, true),
    (v_org_id, 'Maternite', 'maternity', '#ec4899', true, true),
    (v_org_id, 'Paternite', 'paternity', '#8b5cf6', true, true)
  ON CONFLICT (organization_id, code) DO NOTHING;

  -- 7. Parse admin name into first_name and last_name
  v_name_parts := string_to_array(trim(p_admin_name), ' ');
  IF array_length(v_name_parts, 1) >= 2 THEN
    v_first_name := v_name_parts[1];
    v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
  ELSE
    v_first_name := COALESCE(p_admin_name, 'Admin');
    v_last_name := '';
  END IF;

  -- 8. Create employee record for admin
  INSERT INTO hr.employees (
    organization_id,
    user_id,
    first_name,
    last_name,
    email,
    work_email,
    job_title,
    contract_type,
    contract_start_date,
    status,
    annual_leave_balance,
    rtt_balance,
    created_at,
    updated_at
  )
  VALUES (
    v_org_id,
    p_user_id,
    v_first_name,
    v_last_name,
    p_admin_email,
    p_admin_email,
    'Administrateur',
    'cdi',
    CURRENT_DATE,
    'active',
    25.0,  -- Default annual leave balance
    0.0,   -- Default RTT balance
    NOW(),
    NOW()
  )
  RETURNING id INTO v_employee_id;

  -- Return created org
  SELECT * INTO v_org FROM public.organizations WHERE id = v_org_id;
  RETURN jsonb_build_object(
    'success', true,
    'organization', row_to_json(v_org),
    'employee_id', v_employee_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ===========================================
-- 2. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.setup_organization IS 'First-time setup: create organization, link user as owner, and create admin employee record';

-- ===========================================
-- 2. UPDATE CREATE_ORGANIZATION_WITH_OWNER FUNCTION
-- Also creates an HR employee record for the owner
-- ===========================================

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_industry TEXT DEFAULT NULL,
  p_siret TEXT DEFAULT NULL,
  p_siren TEXT DEFAULT NULL,
  p_vat_number TEXT DEFAULT NULL,
  p_address JSONB DEFAULT '{}',
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user RECORD;
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
  v_employee_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get user info
  SELECT * INTO v_user FROM public.users WHERE id = v_user_id;

  -- Validate slug
  IF NOT is_slug_available(p_slug) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slug already taken');
  END IF;

  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    industry,
    siret,
    siren,
    vat_number,
    address,
    phone,
    email,
    created_by,
    onboarding_completed
  )
  VALUES (
    p_name,
    p_slug,
    p_industry,
    p_siret,
    p_siren,
    p_vat_number,
    p_address,
    p_phone,
    p_email,
    v_user_id,
    true
  )
  RETURNING id INTO v_org_id;

  -- Add creator as owner
  INSERT INTO organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, v_user_id, 'owner', NOW());

  -- Create free subscriptions for all active modules
  FOR v_module IN SELECT id FROM modules WHERE is_active = true
  LOOP
    INSERT INTO module_subscriptions (organization_id, module_id, status)
    VALUES (v_org_id, v_module.id, 'free')
    ON CONFLICT (organization_id, module_id) DO NOTHING;
  END LOOP;

  -- Create HR settings for the organization
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

  -- Parse user name into first_name and last_name
  v_name_parts := string_to_array(trim(COALESCE(v_user.name, '')), ' ');
  IF array_length(v_name_parts, 1) >= 2 THEN
    v_first_name := v_name_parts[1];
    v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
  ELSIF array_length(v_name_parts, 1) = 1 AND v_name_parts[1] != '' THEN
    v_first_name := v_name_parts[1];
    v_last_name := '';
  ELSE
    v_first_name := split_part(COALESCE(v_user.email, 'Admin'), '@', 1);
    v_last_name := '';
  END IF;

  -- Create employee record for owner
  INSERT INTO hr.employees (
    organization_id,
    user_id,
    first_name,
    last_name,
    email,
    work_email,
    job_title,
    contract_type,
    contract_start_date,
    status,
    annual_leave_balance,
    rtt_balance,
    created_at,
    updated_at
  )
  VALUES (
    v_org_id,
    v_user_id,
    v_first_name,
    v_last_name,
    v_user.email,
    v_user.email,
    'Administrateur',
    'cdi',
    CURRENT_DATE,
    'active',
    25.0,
    0.0,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_employee_id;

  -- Return created org
  SELECT * INTO v_org FROM organizations WHERE id = v_org_id;
  RETURN jsonb_build_object(
    'success', true,
    'organization', row_to_json(v_org),
    'employee_id', v_employee_id
  );
END;
$$;

COMMENT ON FUNCTION public.create_organization_with_owner IS 'Create a new organization with the current user as owner and create admin employee record';

COMMIT;
