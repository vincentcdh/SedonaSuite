-- 002_rls_policies.sql
-- Sedona.AI - Row Level Security Policies
-- Ensures multi-tenant data isolation

-- ===========================================
-- ENABLE RLS ON ALL TABLES
-- ===========================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTIONS FOR RLS
-- ===========================================

-- Get all organization IDs the current user belongs to
CREATE OR REPLACE FUNCTION auth.get_user_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get organization IDs where user is admin or owner
CREATE OR REPLACE FUNCTION auth.get_user_admin_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get organization IDs where user is owner
CREATE OR REPLACE FUNCTION auth.get_user_owner_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND role = 'owner'
    AND joined_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is member of organization
CREATE OR REPLACE FUNCTION auth.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND joined_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin of organization
CREATE OR REPLACE FUNCTION auth.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND joined_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is owner of organization
CREATE OR REPLACE FUNCTION auth.is_org_owner(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND joined_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===========================================
-- ORGANIZATIONS POLICIES
-- ===========================================

-- Users can view organizations they belong to
CREATE POLICY "org_select_member"
  ON public.organizations
  FOR SELECT
  USING (
    id IN (SELECT auth.get_user_organization_ids())
    AND deleted_at IS NULL
  );

-- Only owners and admins can update organization
CREATE POLICY "org_update_admin"
  ON public.organizations
  FOR UPDATE
  USING (id IN (SELECT auth.get_user_admin_organization_ids()))
  WITH CHECK (id IN (SELECT auth.get_user_admin_organization_ids()));

-- Users can create new organizations (they become owner)
CREATE POLICY "org_insert_authenticated"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can delete (soft delete) organization
CREATE POLICY "org_delete_owner"
  ON public.organizations
  FOR DELETE
  USING (id IN (SELECT auth.get_user_owner_organization_ids()));

-- ===========================================
-- USERS POLICIES
-- ===========================================

-- Users can view their own profile
CREATE POLICY "user_select_self"
  ON public.users
  FOR SELECT
  USING (id = auth.uid() AND deleted_at IS NULL);

-- Users can view other users in the same organization
CREATE POLICY "user_select_org_member"
  ON public.users
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND id IN (
      SELECT user_id FROM public.organization_members
      WHERE organization_id IN (SELECT auth.get_user_organization_ids())
    )
  );

-- Users can update their own profile
CREATE POLICY "user_update_self"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow insert during registration (service role or authenticated)
CREATE POLICY "user_insert"
  ON public.users
  FOR INSERT
  WITH CHECK (true); -- Controlled by application logic

-- ===========================================
-- ORGANIZATION MEMBERS POLICIES
-- ===========================================

-- Members can view all members of their organizations
CREATE POLICY "org_member_select"
  ON public.organization_members
  FOR SELECT
  USING (organization_id IN (SELECT auth.get_user_organization_ids()));

-- Admins can invite new members
CREATE POLICY "org_member_insert_admin"
  ON public.organization_members
  FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT auth.get_user_admin_organization_ids())
    OR user_id = auth.uid() -- Allow self-join when accepting invitation
  );

-- Admins can update member roles (except can't change owner)
CREATE POLICY "org_member_update_admin"
  ON public.organization_members
  FOR UPDATE
  USING (
    organization_id IN (SELECT auth.get_user_admin_organization_ids())
    AND role != 'owner' -- Can't demote owner
  )
  WITH CHECK (
    organization_id IN (SELECT auth.get_user_admin_organization_ids())
    AND (NEW.role != 'owner' OR auth.is_org_owner(organization_id)) -- Only owner can promote to owner
  );

-- Admins can remove members (except owner)
-- Members can remove themselves
CREATE POLICY "org_member_delete"
  ON public.organization_members
  FOR DELETE
  USING (
    (organization_id IN (SELECT auth.get_user_admin_organization_ids()) AND role != 'owner')
    OR user_id = auth.uid() -- Can leave organization
  );

-- ===========================================
-- SESSIONS POLICIES
-- ===========================================

-- Users can view their own sessions
CREATE POLICY "session_select_self"
  ON public.sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create sessions (login)
CREATE POLICY "session_insert"
  ON public.sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL); -- Allow during login

-- Users can delete their own sessions (logout)
CREATE POLICY "session_delete_self"
  ON public.sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "session_update_self"
  ON public.sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ===========================================
-- VERIFICATION TOKENS POLICIES
-- ===========================================

-- Users can view their own tokens
CREATE POLICY "verification_token_select_self"
  ON public.verification_tokens
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow insert (controlled by application)
CREATE POLICY "verification_token_insert"
  ON public.verification_tokens
  FOR INSERT
  WITH CHECK (true);

-- Allow update (marking as used)
CREATE POLICY "verification_token_update"
  ON public.verification_tokens
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow delete
CREATE POLICY "verification_token_delete"
  ON public.verification_tokens
  FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ===========================================
-- USAGE TRACKING POLICIES
-- ===========================================

-- Members can view usage of their organizations
CREATE POLICY "usage_select_member"
  ON public.usage_tracking
  FOR SELECT
  USING (organization_id IN (SELECT auth.get_user_organization_ids()));

-- System can update usage (via service role)
-- Members with admin role can view for reporting
CREATE POLICY "usage_insert"
  ON public.usage_tracking
  FOR INSERT
  WITH CHECK (organization_id IN (SELECT auth.get_user_organization_ids()));

CREATE POLICY "usage_update"
  ON public.usage_tracking
  FOR UPDATE
  USING (organization_id IN (SELECT auth.get_user_organization_ids()));

-- ===========================================
-- AUDIT LOGS POLICIES
-- ===========================================

-- Admins can view audit logs of their organizations
CREATE POLICY "audit_select_admin"
  ON public.audit_logs
  FOR SELECT
  USING (organization_id IN (SELECT auth.get_user_admin_organization_ids()));

-- System inserts audit logs (via application/service role)
CREATE POLICY "audit_insert"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true); -- Controlled by application

-- Audit logs are immutable (no update/delete)
-- This is intentional for RGPD compliance

-- ===========================================
-- SERVICE ROLE BYPASS
-- ===========================================
-- Note: The service role automatically bypasses RLS.
-- This is used for:
-- - Authentication flows (Better Auth)
-- - Background jobs
-- - Admin operations
-- - Stripe webhooks
