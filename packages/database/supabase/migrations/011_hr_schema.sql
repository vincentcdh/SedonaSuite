-- ===========================================
-- HR MODULE SCHEMA
-- Migration: 011_hr_schema.sql
-- ===========================================

-- Create the HR schema
CREATE SCHEMA IF NOT EXISTS hr;

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE hr.contract_type AS ENUM ('cdi', 'cdd', 'stage', 'alternance', 'freelance', 'interim');
CREATE TYPE hr.employee_status AS ENUM ('active', 'trial_period', 'notice_period', 'left');
CREATE TYPE hr.leave_type_code AS ENUM ('cp', 'rtt', 'sick', 'unpaid', 'maternity', 'paternity', 'other');
CREATE TYPE hr.leave_status AS ENUM ('pending', 'approved', 'rejected', 'canceled');
CREATE TYPE hr.document_type AS ENUM ('contract', 'id_card', 'diploma', 'rib', 'medical', 'other');
CREATE TYPE hr.interview_type AS ENUM ('annual', 'professional', 'trial_end', 'other');
CREATE TYPE hr.interview_status AS ENUM ('scheduled', 'completed', 'canceled');

-- ===========================================
-- TABLE: HR Settings (per organization)
-- ===========================================

CREATE TABLE hr.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Leave configuration
  annual_leave_days_per_year DECIMAL(4,1) DEFAULT 25,
  rtt_days_per_year DECIMAL(4,1) DEFAULT 0,
  leave_year_start_month INTEGER DEFAULT 6, -- June (French reference year)

  -- Work time
  default_work_hours_per_week DECIMAL(4,1) DEFAULT 35,
  work_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',

  -- Alerts (PRO)
  alert_trial_end_days INTEGER DEFAULT 15,
  alert_contract_end_days INTEGER DEFAULT 30,
  alert_interview_days INTEGER DEFAULT 30,

  -- Employee self-service (PRO)
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

CREATE TABLE hr.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Optional link with user (for self-service)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Identity
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  birth_date DATE,
  birth_place VARCHAR(255),
  nationality VARCHAR(100) DEFAULT 'Française',
  social_security_number VARCHAR(21), -- French format: 15 digits + key
  photo_url TEXT,

  -- Personal address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',

  -- Emergency contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relation VARCHAR(100),

  -- Professional info
  employee_number VARCHAR(50), -- Matricule
  job_title VARCHAR(255),
  department VARCHAR(100),
  manager_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
  work_email VARCHAR(255),
  work_phone VARCHAR(50),

  -- Current contract (denormalized for quick access)
  contract_type hr.contract_type,
  contract_start_date DATE,
  contract_end_date DATE, -- NULL for CDI
  trial_end_date DATE,

  -- Compensation (optional, sensitive)
  gross_salary DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'EUR',

  -- Leave balances
  annual_leave_balance DECIMAL(5,2) DEFAULT 0,
  rtt_balance DECIMAL(5,2) DEFAULT 0,

  -- Status
  status hr.employee_status DEFAULT 'active',
  left_date DATE,
  left_reason TEXT,

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(organization_id, employee_number),
  UNIQUE(organization_id, social_security_number)
);

-- ===========================================
-- TABLE: Contracts (history)
-- ===========================================

CREATE TABLE hr.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  contract_type hr.contract_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for CDI
  trial_duration_days INTEGER,
  trial_end_date DATE,
  trial_renewed BOOLEAN DEFAULT FALSE,

  -- Position
  job_title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  classification VARCHAR(100), -- Convention collective

  -- Work time
  work_hours_per_week DECIMAL(4,1) DEFAULT 35,
  is_full_time BOOLEAN DEFAULT TRUE,
  remote_policy VARCHAR(50), -- 'office', 'hybrid', 'full_remote'

  -- Compensation
  gross_salary DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  salary_frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly', 'hourly'

  -- Documents
  signed_document_url TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Employee Documents
-- ===========================================

CREATE TABLE hr.employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  document_type hr.document_type NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_size INTEGER, -- In bytes
  mime_type VARCHAR(100),

  -- Validity (for ID cards, etc.)
  valid_from DATE,
  valid_until DATE,

  -- Metadata
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Leave Types (custom per organization)
-- ===========================================

CREATE TABLE hr.leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  deducts_from_balance BOOLEAN DEFAULT TRUE, -- Deducts from leave balance?
  is_system BOOLEAN DEFAULT FALSE, -- System defaults cannot be deleted

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, code)
);

-- ===========================================
-- TABLE: Leave Requests
-- ===========================================

CREATE TABLE hr.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  leave_type_id UUID NOT NULL REFERENCES hr.leave_types(id) ON DELETE RESTRICT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_half_day BOOLEAN DEFAULT FALSE, -- Starts in the afternoon
  end_half_day BOOLEAN DEFAULT FALSE, -- Ends in the morning

  days_count DECIMAL(4,1) NOT NULL, -- Number of days (calculated)

  reason TEXT,

  -- Workflow
  status hr.leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Metadata
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Absences (sick leave, etc. - no prior request)
-- ===========================================

CREATE TABLE hr.absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  leave_type_id UUID NOT NULL REFERENCES hr.leave_types(id) ON DELETE RESTRICT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count DECIMAL(4,1) NOT NULL,

  -- For sick leave
  medical_certificate_url TEXT,

  reason TEXT,

  -- Metadata
  recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Interviews
-- ===========================================

CREATE TABLE hr.interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  type hr.interview_type NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,

  -- Participants
  interviewer_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,

  -- Content
  objectives TEXT,
  achievements TEXT,
  feedback TEXT,
  development_plan TEXT,
  employee_comments TEXT,

  -- Documents
  document_url TEXT, -- Signed report

  -- Status
  status hr.interview_status DEFAULT 'scheduled',

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Employee Notes
-- ===========================================

CREATE TABLE hr.employee_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  title VARCHAR(255),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE, -- Only visible to author?

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: Time Entries (PRO)
-- ===========================================

CREATE TABLE hr.time_entries (
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

  -- Validation
  validated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, employee_id, date)
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_hr_employees_org ON hr.employees(organization_id);
CREATE INDEX idx_hr_employees_status ON hr.employees(status);
CREATE INDEX idx_hr_employees_manager ON hr.employees(manager_id);
CREATE INDEX idx_hr_employees_user ON hr.employees(user_id);
CREATE INDEX idx_hr_employees_deleted ON hr.employees(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_hr_contracts_employee ON hr.contracts(employee_id);
CREATE INDEX idx_hr_contracts_dates ON hr.contracts(start_date, end_date);
CREATE INDEX idx_hr_contracts_org ON hr.contracts(organization_id);

CREATE INDEX idx_hr_documents_employee ON hr.employee_documents(employee_id);
CREATE INDEX idx_hr_documents_org ON hr.employee_documents(organization_id);

CREATE INDEX idx_hr_leave_types_org ON hr.leave_types(organization_id);

CREATE INDEX idx_hr_leave_requests_employee ON hr.leave_requests(employee_id);
CREATE INDEX idx_hr_leave_requests_dates ON hr.leave_requests(start_date, end_date);
CREATE INDEX idx_hr_leave_requests_status ON hr.leave_requests(status);
CREATE INDEX idx_hr_leave_requests_org ON hr.leave_requests(organization_id);

CREATE INDEX idx_hr_absences_employee ON hr.absences(employee_id);
CREATE INDEX idx_hr_absences_dates ON hr.absences(start_date, end_date);
CREATE INDEX idx_hr_absences_org ON hr.absences(organization_id);

CREATE INDEX idx_hr_interviews_employee ON hr.interviews(employee_id);
CREATE INDEX idx_hr_interviews_date ON hr.interviews(scheduled_date);
CREATE INDEX idx_hr_interviews_org ON hr.interviews(organization_id);

CREATE INDEX idx_hr_notes_employee ON hr.employee_notes(employee_id);
CREATE INDEX idx_hr_notes_org ON hr.employee_notes(organization_id);

CREATE INDEX idx_hr_time_entries_employee ON hr.time_entries(employee_id);
CREATE INDEX idx_hr_time_entries_date ON hr.time_entries(date);
CREATE INDEX idx_hr_time_entries_org ON hr.time_entries(organization_id);

-- ===========================================
-- TRIGGERS: Updated At
-- ===========================================

CREATE TRIGGER hr_settings_updated_at BEFORE UPDATE ON hr.settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_employees_updated_at BEFORE UPDATE ON hr.employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_contracts_updated_at BEFORE UPDATE ON hr.contracts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_leave_requests_updated_at BEFORE UPDATE ON hr.leave_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_absences_updated_at BEFORE UPDATE ON hr.absences
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_interviews_updated_at BEFORE UPDATE ON hr.interviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_employee_notes_updated_at BEFORE UPDATE ON hr.employee_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER hr_time_entries_updated_at BEFORE UPDATE ON hr.time_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- TRIGGER: Calculate leave days automatically
-- ===========================================

CREATE OR REPLACE FUNCTION hr.calculate_leave_days()
RETURNS TRIGGER AS $$
BEGIN
  -- Simplified calculation (to be improved with business days)
  NEW.days_count := (NEW.end_date - NEW.start_date + 1)::DECIMAL;

  -- Half-day adjustments
  IF NEW.start_half_day THEN
    NEW.days_count := NEW.days_count - 0.5;
  END IF;
  IF NEW.end_half_day THEN
    NEW.days_count := NEW.days_count - 0.5;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hr_leave_requests_calc_days BEFORE INSERT OR UPDATE ON hr.leave_requests
FOR EACH ROW EXECUTE FUNCTION hr.calculate_leave_days();

-- ===========================================
-- FUNCTION: Generate employee number
-- ===========================================

CREATE OR REPLACE FUNCTION hr.generate_employee_number(org_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  current_count INTEGER;
  new_number VARCHAR(50);
BEGIN
  SELECT COUNT(*) + 1 INTO current_count
  FROM hr.employees
  WHERE organization_id = org_id;

  new_number := 'EMP-' || LPAD(current_count::TEXT, 5, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGER: Auto-generate employee number
-- ===========================================

CREATE OR REPLACE FUNCTION hr.set_employee_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    NEW.employee_number := hr.generate_employee_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hr_employees_set_number BEFORE INSERT ON hr.employees
FOR EACH ROW EXECUTE FUNCTION hr.set_employee_number();
