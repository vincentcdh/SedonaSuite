-- ===========================================
-- 058_setup_organization_rpc.sql
-- RPC function for initial setup wizard
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/058_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. SETUP ORGANIZATION FUNCTION
-- Called from /setup page during first-time setup
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

  -- Return created org
  SELECT * INTO v_org FROM public.organizations WHERE id = v_org_id;
  RETURN jsonb_build_object('success', true, 'organization', row_to_json(v_org));

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.setup_organization(TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- ===========================================
-- 2. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.setup_organization IS 'First-time setup: create organization and link user as owner';

COMMIT;
