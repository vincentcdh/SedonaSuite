-- ===========================================
-- 060_hr_schema.sql
-- HR Module Schema
-- ===========================================

BEGIN;

-- ===========================================
-- CREATE HR SCHEMA
-- ===========================================

CREATE SCHEMA IF NOT EXISTS hr;
GRANT USAGE ON SCHEMA hr TO anon, authenticated;

-- ===========================================
-- ENUM TYPES
-- ===========================================

DO $$ BEGIN
  CREATE TYPE hr.contract_type AS ENUM ('cdi', 'cdd', 'stage', 'alternance', 'freelance', 'interim');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.employee_status AS ENUM ('active', 'trial_period', 'notice_period', 'left');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.leave_type_code AS ENUM ('cp', 'rtt', 'sick', 'unpaid', 'maternity', 'paternity', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.leave_status AS ENUM ('pending', 'approved', 'rejected', 'canceled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.document_type AS ENUM ('contract', 'id_card', 'diploma', 'rib', 'medical', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.interview_type AS ENUM ('annual', 'professional', 'trial_end', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE hr.interview_status AS ENUM ('scheduled', 'completed', 'canceled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- TABLE: HR Settings
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  annual_leave_days_per_year DECIMAL(4,1) DEFAULT 25,
  rtt_days_per_year DECIMAL(4,1) DEFAULT 0,
  leave_year_start_month INTEGER DEFAULT 6,
  default_work_hours_per_week DECIMAL(4,1) DEFAULT 35,
  work_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
  alert_trial_end_days INTEGER DEFAULT 15,
  alert_contract_end_days INTEGER DEFAULT 30,
  alert_interview_days INTEGER DEFAULT 30,
  employee_self_service_enabled BOOLEAN DEFAULT FALSE,
  employees_can_request_leaves BOOLEAN DEFAULT TRUE,
  employees_can_view_directory BOOLEAN DEFAULT TRUE,
  employees_can_edit_profile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TABLE: Employees
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  birth_date DATE,
  birth_place VARCHAR(255),
  nationality VARCHAR(100) DEFAULT 'Française',
  social_security_number VARCHAR(21),
  photo_url TEXT,
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relation VARCHAR(100),
  employee_number VARCHAR(50),
  job_title VARCHAR(255),
  department VARCHAR(100),
  manager_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
  work_email VARCHAR(255),
  work_phone VARCHAR(50),
  contract_type hr.contract_type,
  contract_start_date DATE,
  contract_end_date DATE,
  trial_end_date DATE,
  gross_salary DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  annual_leave_balance DECIMAL(5,2) DEFAULT 0,
  rtt_balance DECIMAL(5,2) DEFAULT 0,
  status hr.employee_status DEFAULT 'active',
  left_date DATE,
  left_reason TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Interviews
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,
  type hr.interview_type NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  interviewer_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
  objectives TEXT,
  achievements TEXT,
  feedback TEXT,
  development_plan TEXT,
  employee_comments TEXT,
  document_url TEXT,
  status hr.interview_status DEFAULT 'scheduled',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Leave Types
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  deducts_from_balance BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- ===========================================
-- TABLE: Leave Requests
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES hr.leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_half_day BOOLEAN DEFAULT FALSE,
  end_half_day BOOLEAN DEFAULT FALSE,
  days_count DECIMAL(4,1) NOT NULL DEFAULT 1,
  reason TEXT,
  status hr.leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Time Entries
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  break_duration_minutes INTEGER DEFAULT 0,
  hours_worked DECIMAL(4,2) NOT NULL,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  notes TEXT,
  validated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, employee_id, date)
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_hr_employees_org ON hr.employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_status ON hr.employees(status);
CREATE INDEX IF NOT EXISTS idx_hr_employees_manager ON hr.employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_hr_employees_deleted ON hr.employees(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hr_interviews_employee ON hr.interviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_interviews_org ON hr.interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_employee ON hr.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_org ON hr.leave_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_entries_employee ON hr.time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_entries_org ON hr.time_entries(organization_id);

-- ===========================================
-- RLS
-- ===========================================

ALTER TABLE hr.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.time_entries ENABLE ROW LEVEL SECURITY;

-- HR Settings policies
CREATE POLICY "hr_settings_select" ON hr.settings FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_settings_insert" ON hr.settings FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_settings_update" ON hr.settings FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Employees policies
CREATE POLICY "hr_employees_select" ON hr.employees FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()) AND deleted_at IS NULL);
CREATE POLICY "hr_employees_insert" ON hr.employees FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_employees_update" ON hr.employees FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_employees_delete" ON hr.employees FOR DELETE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Interviews policies
CREATE POLICY "hr_interviews_select" ON hr.interviews FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_interviews_insert" ON hr.interviews FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_interviews_update" ON hr.interviews FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_interviews_delete" ON hr.interviews FOR DELETE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Leave Types policies
CREATE POLICY "hr_leave_types_select" ON hr.leave_types FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_leave_types_insert" ON hr.leave_types FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_admin_organization_ids()));
CREATE POLICY "hr_leave_types_update" ON hr.leave_types FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_admin_organization_ids()));

-- Leave Requests policies
CREATE POLICY "hr_leave_requests_select" ON hr.leave_requests FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_leave_requests_insert" ON hr.leave_requests FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_leave_requests_update" ON hr.leave_requests FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- Time Entries policies
CREATE POLICY "hr_time_entries_select" ON hr.time_entries FOR SELECT
  USING (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_time_entries_insert" ON hr.time_entries FOR INSERT
  WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
CREATE POLICY "hr_time_entries_update" ON hr.time_entries FOR UPDATE
  USING (organization_id IN (SELECT public.get_user_organization_ids()));

-- ===========================================
-- GRANTS
-- ===========================================

GRANT ALL ON ALL TABLES IN SCHEMA hr TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA hr TO authenticated;

COMMIT;
