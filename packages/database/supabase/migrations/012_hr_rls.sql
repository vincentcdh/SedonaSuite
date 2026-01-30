-- ===========================================
-- HR MODULE RLS POLICIES
-- Migration: 012_hr_rls.sql
-- ===========================================

-- ===========================================
-- ENABLE RLS ON ALL HR TABLES
-- ===========================================

ALTER TABLE hr.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.time_entries ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- SETTINGS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org HR settings"
  ON hr.settings FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert their org HR settings"
  ON hr.settings FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org HR settings"
  ON hr.settings FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- EMPLOYEES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org employees"
  ON hr.employees FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert employees in their org"
  ON hr.employees FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update employees in their org"
  ON hr.employees FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete employees in their org"
  ON hr.employees FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- CONTRACTS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org contracts"
  ON hr.contracts FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert contracts in their org"
  ON hr.contracts FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update contracts in their org"
  ON hr.contracts FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete contracts in their org"
  ON hr.contracts FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- EMPLOYEE DOCUMENTS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org documents"
  ON hr.employee_documents FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert documents in their org"
  ON hr.employee_documents FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update documents in their org"
  ON hr.employee_documents FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete documents in their org"
  ON hr.employee_documents FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- LEAVE TYPES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org leave types"
  ON hr.leave_types FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert leave types in their org"
  ON hr.leave_types FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update leave types in their org"
  ON hr.leave_types FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete non-system leave types in their org"
  ON hr.leave_types FOR DELETE
  USING (
    organization_id IN (SELECT get_user_organizations(auth.uid()))
    AND is_system = FALSE
  );

-- ===========================================
-- LEAVE REQUESTS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org leave requests"
  ON hr.leave_requests FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert leave requests in their org"
  ON hr.leave_requests FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update leave requests in their org"
  ON hr.leave_requests FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete leave requests in their org"
  ON hr.leave_requests FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- ABSENCES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org absences"
  ON hr.absences FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert absences in their org"
  ON hr.absences FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update absences in their org"
  ON hr.absences FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete absences in their org"
  ON hr.absences FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- INTERVIEWS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org interviews"
  ON hr.interviews FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert interviews in their org"
  ON hr.interviews FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update interviews in their org"
  ON hr.interviews FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete interviews in their org"
  ON hr.interviews FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- EMPLOYEE NOTES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org employee notes"
  ON hr.employee_notes FOR SELECT
  USING (
    organization_id IN (SELECT get_user_organizations(auth.uid()))
    AND (is_private = FALSE OR created_by = auth.uid())
  );

CREATE POLICY "Users can insert employee notes in their org"
  ON hr.employee_notes FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their own employee notes"
  ON hr.employee_notes FOR UPDATE
  USING (
    organization_id IN (SELECT get_user_organizations(auth.uid()))
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own employee notes"
  ON hr.employee_notes FOR DELETE
  USING (
    organization_id IN (SELECT get_user_organizations(auth.uid()))
    AND created_by = auth.uid()
  );

-- ===========================================
-- TIME ENTRIES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org time entries"
  ON hr.time_entries FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert time entries in their org"
  ON hr.time_entries FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update time entries in their org"
  ON hr.time_entries FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete time entries in their org"
  ON hr.time_entries FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- FUNCTION: Create default leave types for new org
-- ===========================================

CREATE OR REPLACE FUNCTION hr.create_default_leave_types()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default leave types
  INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system) VALUES
    (NEW.id, 'Congés payés', 'cp', '#10b981', TRUE, TRUE),
    (NEW.id, 'RTT', 'rtt', '#3b82f6', TRUE, TRUE),
    (NEW.id, 'Maladie', 'sick', '#f59e0b', TRUE, TRUE),
    (NEW.id, 'Sans solde', 'unpaid', '#6b7280', FALSE, TRUE),
    (NEW.id, 'Maternité', 'maternity', '#ec4899', TRUE, TRUE),
    (NEW.id, 'Paternité', 'paternity', '#8b5cf6', TRUE, TRUE);

  -- Create default HR settings
  INSERT INTO hr.settings (organization_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger should be created on the organizations table
-- Uncomment the following line if you want automatic setup:
-- CREATE TRIGGER org_create_hr_defaults AFTER INSERT ON public.organizations
-- FOR EACH ROW EXECUTE FUNCTION hr.create_default_leave_types();
