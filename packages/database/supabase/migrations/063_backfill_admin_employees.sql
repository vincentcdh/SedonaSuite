-- ===========================================
-- 063_backfill_admin_employees.sql
-- Create employee records for existing organization owners
-- ===========================================
-- Dependencies: 062_setup_creates_admin_employee.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CREATE HR SETTINGS FOR EXISTING ORGS
-- ===========================================

INSERT INTO hr.settings (organization_id)
SELECT id FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM hr.settings)
ON CONFLICT (organization_id) DO NOTHING;

-- ===========================================
-- 2. CREATE DEFAULT LEAVE TYPES FOR EXISTING ORGS
-- ===========================================

INSERT INTO hr.leave_types (organization_id, name, code, color, is_paid, is_system)
SELECT o.id, lt.name, lt.code, lt.color, lt.is_paid, lt.is_system
FROM public.organizations o
CROSS JOIN (VALUES
  ('Conges payes', 'cp', '#22c55e', true, true),
  ('RTT', 'rtt', '#3b82f6', true, true),
  ('Maladie', 'sick', '#ef4444', true, true),
  ('Sans solde', 'unpaid', '#6b7280', false, true),
  ('Maternite', 'maternity', '#ec4899', true, true),
  ('Paternite', 'paternity', '#8b5cf6', true, true)
) AS lt(name, code, color, is_paid, is_system)
WHERE NOT EXISTS (
  SELECT 1 FROM hr.leave_types
  WHERE organization_id = o.id AND code = lt.code
)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ===========================================
-- 3. CREATE EMPLOYEE RECORDS FOR OWNERS
-- ===========================================

-- For each organization owner who doesn't have an employee record,
-- create one linked to their user account
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
SELECT
  om.organization_id,
  om.user_id,
  COALESCE(
    split_part(u.name, ' ', 1),
    split_part(u.email, '@', 1),
    'Admin'
  ) AS first_name,
  COALESCE(
    CASE
      WHEN position(' ' IN u.name) > 0
      THEN substring(u.name FROM position(' ' IN u.name) + 1)
      ELSE ''
    END,
    ''
  ) AS last_name,
  u.email,
  u.email,
  'Administrateur',
  'cdi',
  COALESCE(om.joined_at::date, CURRENT_DATE),
  'active',
  25.0,
  0.0,
  COALESCE(om.joined_at, NOW()),
  NOW()
FROM public.organization_members om
INNER JOIN public.users u ON u.id = om.user_id
WHERE om.role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM hr.employees e
    WHERE e.organization_id = om.organization_id
      AND e.user_id = om.user_id
  );

-- ===========================================
-- 4. COMMENTS
-- ===========================================

COMMENT ON TABLE hr.employees IS 'HR employees - includes all organization members with employee records';

COMMIT;
