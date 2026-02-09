-- ===========================================
-- HR BADGES & SETTINGS UPDATE
-- Migration: 020_hr_badges_schema.sql
-- ===========================================

-- ===========================================
-- ALTER TABLE: Add new columns to hr.settings
-- ===========================================

-- Time tracking configuration
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS time_tracking_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS employees_can_clock_in_out BOOLEAN DEFAULT TRUE;
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS auto_clock_out_time TIME;
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS require_clock_in_notes BOOLEAN DEFAULT FALSE;

-- Alert configuration updates
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS alert_interview_months INTEGER DEFAULT 24;
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS alert_document_expiry_days INTEGER DEFAULT 30;

-- Employee portal configuration
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS employees_can_view_payslips BOOLEAN DEFAULT FALSE;
ALTER TABLE hr.settings ADD COLUMN IF NOT EXISTS employees_can_view_contracts BOOLEAN DEFAULT FALSE;

-- ===========================================
-- ENUM TYPE: Badge type
-- ===========================================

DO $$ BEGIN
  CREATE TYPE hr.badge_type AS ENUM ('clock_in', 'clock_out', 'break_start', 'break_end');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- TABLE: Badges (pointages)
-- ===========================================

CREATE TABLE IF NOT EXISTS hr.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hr.employees(id) ON DELETE CASCADE,

  -- Badge info
  badge_type hr.badge_type NOT NULL,
  badge_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Location (optional, for mobile badging)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name VARCHAR(255),

  -- Device info (optional)
  device_type VARCHAR(50), -- 'web', 'mobile', 'terminal'
  ip_address INET,

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For quick lookups of today's badges
  badge_date DATE GENERATED ALWAYS AS (DATE(badge_time AT TIME ZONE 'Europe/Paris')) STORED
);

-- ===========================================
-- INDEXES for badges
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_hr_badges_org ON hr.badges(organization_id);
CREATE INDEX IF NOT EXISTS idx_hr_badges_employee ON hr.badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_badges_date ON hr.badges(badge_date);
CREATE INDEX IF NOT EXISTS idx_hr_badges_time ON hr.badges(badge_time);
CREATE INDEX IF NOT EXISTS idx_hr_badges_employee_date ON hr.badges(employee_id, badge_date);

-- ===========================================
-- VIEW: Current badge status per employee
-- ===========================================

CREATE OR REPLACE VIEW hr.employee_badge_status AS
SELECT DISTINCT ON (e.id)
  e.id AS employee_id,
  e.organization_id,
  e.first_name,
  e.last_name,
  b.badge_type AS last_badge_type,
  b.badge_time AS last_badge_time,
  b.badge_date,
  CASE
    WHEN b.badge_type = 'clock_in' THEN TRUE
    WHEN b.badge_type = 'break_end' THEN TRUE
    ELSE FALSE
  END AS is_clocked_in,
  CASE
    WHEN b.badge_type = 'break_start' THEN TRUE
    ELSE FALSE
  END AS is_on_break
FROM hr.employees e
LEFT JOIN hr.badges b ON b.employee_id = e.id
  AND b.badge_date = CURRENT_DATE
WHERE e.status = 'active'
  AND e.deleted_at IS NULL
ORDER BY e.id, b.badge_time DESC NULLS LAST;

-- ===========================================
-- FUNCTION: Calculate daily worked hours from badges
-- ===========================================

CREATE OR REPLACE FUNCTION hr.calculate_daily_hours(
  p_employee_id UUID,
  p_date DATE
)
RETURNS TABLE (
  total_hours DECIMAL(5,2),
  break_hours DECIMAL(5,2),
  work_hours DECIMAL(5,2),
  first_clock_in TIMESTAMPTZ,
  last_clock_out TIMESTAMPTZ
) AS $$
DECLARE
  v_badges RECORD;
  v_clock_in_time TIMESTAMPTZ := NULL;
  v_break_start_time TIMESTAMPTZ := NULL;
  v_total_minutes INTEGER := 0;
  v_break_minutes INTEGER := 0;
  v_first_clock_in TIMESTAMPTZ := NULL;
  v_last_clock_out TIMESTAMPTZ := NULL;
BEGIN
  FOR v_badges IN
    SELECT badge_type, badge_time
    FROM hr.badges
    WHERE employee_id = p_employee_id
      AND badge_date = p_date
    ORDER BY badge_time
  LOOP
    CASE v_badges.badge_type
      WHEN 'clock_in' THEN
        v_clock_in_time := v_badges.badge_time;
        IF v_first_clock_in IS NULL THEN
          v_first_clock_in := v_badges.badge_time;
        END IF;
      WHEN 'clock_out' THEN
        IF v_clock_in_time IS NOT NULL THEN
          v_total_minutes := v_total_minutes + EXTRACT(EPOCH FROM (v_badges.badge_time - v_clock_in_time)) / 60;
          v_last_clock_out := v_badges.badge_time;
          v_clock_in_time := NULL;
        END IF;
      WHEN 'break_start' THEN
        v_break_start_time := v_badges.badge_time;
      WHEN 'break_end' THEN
        IF v_break_start_time IS NOT NULL THEN
          v_break_minutes := v_break_minutes + EXTRACT(EPOCH FROM (v_badges.badge_time - v_break_start_time)) / 60;
          v_break_start_time := NULL;
        END IF;
    END CASE;
  END LOOP;

  total_hours := ROUND(v_total_minutes / 60.0, 2);
  break_hours := ROUND(v_break_minutes / 60.0, 2);
  work_hours := ROUND((v_total_minutes - v_break_minutes) / 60.0, 2);
  first_clock_in := v_first_clock_in;
  last_clock_out := v_last_clock_out;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- FUNCTION: Auto clock-out at specified time
-- ===========================================

CREATE OR REPLACE FUNCTION hr.auto_clock_out()
RETURNS void AS $$
DECLARE
  v_org RECORD;
  v_employee RECORD;
BEGIN
  -- Get organizations with auto clock-out enabled
  FOR v_org IN
    SELECT organization_id, auto_clock_out_time
    FROM hr.settings
    WHERE auto_clock_out_time IS NOT NULL
      AND time_tracking_enabled = TRUE
  LOOP
    -- Find employees who are still clocked in
    FOR v_employee IN
      SELECT DISTINCT ON (b.employee_id) b.employee_id, b.organization_id
      FROM hr.badges b
      JOIN hr.employees e ON e.id = b.employee_id
      WHERE b.organization_id = v_org.organization_id
        AND b.badge_date = CURRENT_DATE
        AND b.badge_type IN ('clock_in', 'break_end')
        AND e.status = 'active'
        AND e.deleted_at IS NULL
      ORDER BY b.employee_id, b.badge_time DESC
    LOOP
      -- Insert auto clock-out
      INSERT INTO hr.badges (
        organization_id,
        employee_id,
        badge_type,
        badge_time,
        device_type,
        notes
      ) VALUES (
        v_employee.organization_id,
        v_employee.employee_id,
        'clock_out',
        CURRENT_DATE + v_org.auto_clock_out_time,
        'system',
        'Auto clock-out'
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- COMMENT
-- ===========================================

COMMENT ON TABLE hr.badges IS 'Employee time tracking badges (clock in/out, breaks)';
COMMENT ON VIEW hr.employee_badge_status IS 'Current badge status for each active employee';
COMMENT ON FUNCTION hr.calculate_daily_hours IS 'Calculate worked hours for an employee on a specific date';
COMMENT ON FUNCTION hr.auto_clock_out IS 'Automatically clock out employees at the configured time';
