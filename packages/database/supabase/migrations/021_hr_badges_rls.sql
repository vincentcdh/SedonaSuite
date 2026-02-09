-- ===========================================
-- HR BADGES RLS POLICIES
-- Migration: 021_hr_badges_rls.sql
-- ===========================================

-- ===========================================
-- ENABLE RLS ON BADGES TABLE
-- ===========================================

ALTER TABLE hr.badges ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- BADGES POLICIES
-- ===========================================

-- Users can view badges in their organization
CREATE POLICY "Users can view their org badges"
  ON hr.badges FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- Users can insert badges in their organization
CREATE POLICY "Users can insert badges in their org"
  ON hr.badges FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- Users can update badges in their organization
CREATE POLICY "Users can update badges in their org"
  ON hr.badges FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- Users can delete badges in their organization
CREATE POLICY "Users can delete badges in their org"
  ON hr.badges FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- ADDITIONAL POLICY: Employees can badge themselves
-- (for employee self-service portal)
-- ===========================================

-- Employees linked to a user can insert their own badges
CREATE POLICY "Employees can badge themselves"
  ON hr.badges FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM hr.employees
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND deleted_at IS NULL
    )
    AND organization_id IN (
      SELECT organization_id FROM hr.employees
      WHERE user_id = auth.uid()
    )
  );

-- Employees can view their own badges
CREATE POLICY "Employees can view their own badges"
  ON hr.badges FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM hr.employees
      WHERE user_id = auth.uid()
    )
  );
