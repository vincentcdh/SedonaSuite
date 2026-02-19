-- ===========================================
-- 057_create_organization_rpc.sql
-- RPC function to create organization with owner
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/057_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. SLUG AVAILABILITY CHECK
-- ===========================================

CREATE OR REPLACE FUNCTION public.is_slug_available(p_slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE slug = p_slug AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_slug_available(TEXT) TO authenticated;

-- ===========================================
-- 2. CREATE ORGANIZATION WITH OWNER
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
  v_org_id UUID;
  v_org RECORD;
  v_module RECORD;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

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

  -- Return created org
  SELECT * INTO v_org FROM organizations WHERE id = v_org_id;
  RETURN jsonb_build_object('success', true, 'organization', row_to_json(v_org));
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- ===========================================
-- 3. COMMENTS
-- ===========================================

COMMENT ON FUNCTION public.is_slug_available IS 'Check if an organization slug is available';
COMMENT ON FUNCTION public.create_organization_with_owner IS 'Create a new organization with the current user as owner';

COMMIT;
