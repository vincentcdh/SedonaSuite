-- ===========================================
-- 061_hr_views.sql
-- Public views for HR schema tables
-- ===========================================
-- Depends on: 060_hr_schema.sql
-- ===========================================

BEGIN;

-- ===========================================
-- HR EMPLOYEES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_employees CASCADE;
CREATE VIEW public.hr_employees AS SELECT * FROM hr.employees;

CREATE OR REPLACE FUNCTION public.hr_employees_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.employees (id, organization_id, user_id, first_name, last_name, email, phone, birth_date, birth_place, nationality, social_security_number, photo_url, address_line_1, address_line_2, city, postal_code, country, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, employee_number, job_title, department, manager_id, work_email, work_phone, contract_type, contract_start_date, contract_end_date, trial_end_date, gross_salary, salary_currency, annual_leave_balance, rtt_balance, status, left_date, left_reason, notes, custom_fields, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.user_id, NEW.first_name, NEW.last_name, NEW.email, NEW.phone, NEW.birth_date, NEW.birth_place, COALESCE(NEW.nationality, 'Française'), NEW.social_security_number, NEW.photo_url, NEW.address_line_1, NEW.address_line_2, NEW.city, NEW.postal_code, COALESCE(NEW.country, 'France'), NEW.emergency_contact_name, NEW.emergency_contact_phone, NEW.emergency_contact_relation, NEW.employee_number, NEW.job_title, NEW.department, NEW.manager_id, NEW.work_email, NEW.work_phone, NEW.contract_type, NEW.contract_start_date, NEW.contract_end_date, NEW.trial_end_date, NEW.gross_salary, COALESCE(NEW.salary_currency, 'EUR'), COALESCE(NEW.annual_leave_balance, 0), COALESCE(NEW.rtt_balance, 0), COALESCE(NEW.status, 'active'), NEW.left_date, NEW.left_reason, NEW.notes, COALESCE(NEW.custom_fields, '{}'), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.employees SET
      organization_id = NEW.organization_id, user_id = NEW.user_id, first_name = NEW.first_name, last_name = NEW.last_name, email = NEW.email, phone = NEW.phone, birth_date = NEW.birth_date, birth_place = NEW.birth_place, nationality = NEW.nationality, social_security_number = NEW.social_security_number, photo_url = NEW.photo_url, address_line_1 = NEW.address_line_1, address_line_2 = NEW.address_line_2, city = NEW.city, postal_code = NEW.postal_code, country = NEW.country, emergency_contact_name = NEW.emergency_contact_name, emergency_contact_phone = NEW.emergency_contact_phone, emergency_contact_relation = NEW.emergency_contact_relation, employee_number = NEW.employee_number, job_title = NEW.job_title, department = NEW.department, manager_id = NEW.manager_id, work_email = NEW.work_email, work_phone = NEW.work_phone, contract_type = NEW.contract_type, contract_start_date = NEW.contract_start_date, contract_end_date = NEW.contract_end_date, trial_end_date = NEW.trial_end_date, gross_salary = NEW.gross_salary, salary_currency = NEW.salary_currency, annual_leave_balance = NEW.annual_leave_balance, rtt_balance = NEW.rtt_balance, status = NEW.status, left_date = NEW.left_date, left_reason = NEW.left_reason, notes = NEW.notes, custom_fields = NEW.custom_fields, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.employees WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_employees_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_employees FOR EACH ROW EXECUTE FUNCTION public.hr_employees_trigger();

-- ===========================================
-- HR INTERVIEWS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_interviews CASCADE;
CREATE VIEW public.hr_interviews AS SELECT * FROM hr.interviews;

CREATE OR REPLACE FUNCTION public.hr_interviews_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.interviews (id, organization_id, employee_id, type, scheduled_date, completed_date, interviewer_id, objectives, achievements, feedback, development_plan, employee_comments, document_url, status, created_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.employee_id, NEW.type, NEW.scheduled_date, NEW.completed_date, NEW.interviewer_id, NEW.objectives, NEW.achievements, NEW.feedback, NEW.development_plan, NEW.employee_comments, NEW.document_url, COALESCE(NEW.status, 'scheduled'), NEW.created_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.interviews SET
      organization_id = NEW.organization_id, employee_id = NEW.employee_id, type = NEW.type, scheduled_date = NEW.scheduled_date, completed_date = NEW.completed_date, interviewer_id = NEW.interviewer_id, objectives = NEW.objectives, achievements = NEW.achievements, feedback = NEW.feedback, development_plan = NEW.development_plan, employee_comments = NEW.employee_comments, document_url = NEW.document_url, status = NEW.status, created_by = NEW.created_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.interviews WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_interviews_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_interviews FOR EACH ROW EXECUTE FUNCTION public.hr_interviews_trigger();

-- ===========================================
-- HR LEAVE TYPES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_leave_types CASCADE;
CREATE VIEW public.hr_leave_types AS SELECT * FROM hr.leave_types;

CREATE OR REPLACE FUNCTION public.hr_leave_types_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.leave_types (id, organization_id, name, code, color, is_paid, requires_approval, deducts_from_balance, is_system, created_at)
    VALUES (v_id, NEW.organization_id, NEW.name, NEW.code, COALESCE(NEW.color, '#0c82d6'), COALESCE(NEW.is_paid, true), COALESCE(NEW.requires_approval, true), COALESCE(NEW.deducts_from_balance, true), COALESCE(NEW.is_system, false), COALESCE(NEW.created_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.leave_types SET
      organization_id = NEW.organization_id, name = NEW.name, code = NEW.code, color = NEW.color, is_paid = NEW.is_paid, requires_approval = NEW.requires_approval, deducts_from_balance = NEW.deducts_from_balance, is_system = NEW.is_system
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.leave_types WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_leave_types_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_leave_types FOR EACH ROW EXECUTE FUNCTION public.hr_leave_types_trigger();

-- ===========================================
-- HR LEAVE REQUESTS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_leave_requests CASCADE;
CREATE VIEW public.hr_leave_requests AS SELECT * FROM hr.leave_requests;

CREATE OR REPLACE FUNCTION public.hr_leave_requests_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.leave_requests (id, organization_id, employee_id, leave_type_id, start_date, end_date, start_half_day, end_half_day, days_count, reason, status, approved_by, approved_at, rejection_reason, requested_by, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.employee_id, NEW.leave_type_id, NEW.start_date, NEW.end_date, COALESCE(NEW.start_half_day, false), COALESCE(NEW.end_half_day, false), COALESCE(NEW.days_count, 1), NEW.reason, COALESCE(NEW.status, 'pending'), NEW.approved_by, NEW.approved_at, NEW.rejection_reason, NEW.requested_by, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.leave_requests SET
      organization_id = NEW.organization_id, employee_id = NEW.employee_id, leave_type_id = NEW.leave_type_id, start_date = NEW.start_date, end_date = NEW.end_date, start_half_day = NEW.start_half_day, end_half_day = NEW.end_half_day, days_count = NEW.days_count, reason = NEW.reason, status = NEW.status, approved_by = NEW.approved_by, approved_at = NEW.approved_at, rejection_reason = NEW.rejection_reason, requested_by = NEW.requested_by, updated_at = COALESCE(NEW.updated_at, NOW()), deleted_at = NEW.deleted_at
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.leave_requests WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_leave_requests_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_leave_requests FOR EACH ROW EXECUTE FUNCTION public.hr_leave_requests_trigger();

-- ===========================================
-- HR TIME ENTRIES VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_time_entries CASCADE;
CREATE VIEW public.hr_time_entries AS SELECT * FROM hr.time_entries;

CREATE OR REPLACE FUNCTION public.hr_time_entries_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.time_entries (id, organization_id, employee_id, date, start_time, end_time, break_duration_minutes, hours_worked, overtime_hours, notes, validated_by, validated_at, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, NEW.employee_id, NEW.date, NEW.start_time, NEW.end_time, COALESCE(NEW.break_duration_minutes, 0), NEW.hours_worked, COALESCE(NEW.overtime_hours, 0), NEW.notes, NEW.validated_by, NEW.validated_at, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.time_entries SET
      organization_id = NEW.organization_id, employee_id = NEW.employee_id, date = NEW.date, start_time = NEW.start_time, end_time = NEW.end_time, break_duration_minutes = NEW.break_duration_minutes, hours_worked = NEW.hours_worked, overtime_hours = NEW.overtime_hours, notes = NEW.notes, validated_by = NEW.validated_by, validated_at = NEW.validated_at, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.time_entries WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_time_entries_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_time_entries FOR EACH ROW EXECUTE FUNCTION public.hr_time_entries_trigger();

-- ===========================================
-- HR SETTINGS VIEW
-- ===========================================

DROP VIEW IF EXISTS public.hr_settings CASCADE;
CREATE VIEW public.hr_settings AS SELECT * FROM hr.settings;

CREATE OR REPLACE FUNCTION public.hr_settings_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_id := COALESCE(NEW.id, uuid_generate_v4());
    INSERT INTO hr.settings (id, organization_id, annual_leave_days_per_year, rtt_days_per_year, leave_year_start_month, default_work_hours_per_week, work_days, alert_trial_end_days, alert_contract_end_days, alert_interview_days, employee_self_service_enabled, employees_can_request_leaves, employees_can_view_directory, employees_can_edit_profile, created_at, updated_at)
    VALUES (v_id, NEW.organization_id, COALESCE(NEW.annual_leave_days_per_year, 25), COALESCE(NEW.rtt_days_per_year, 0), COALESCE(NEW.leave_year_start_month, 6), COALESCE(NEW.default_work_hours_per_week, 35), COALESCE(NEW.work_days, '["monday","tuesday","wednesday","thursday","friday"]'), COALESCE(NEW.alert_trial_end_days, 15), COALESCE(NEW.alert_contract_end_days, 30), COALESCE(NEW.alert_interview_days, 30), COALESCE(NEW.employee_self_service_enabled, false), COALESCE(NEW.employees_can_request_leaves, true), COALESCE(NEW.employees_can_view_directory, true), COALESCE(NEW.employees_can_edit_profile, false), COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()));
    NEW.id := v_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE hr.settings SET
      organization_id = NEW.organization_id, annual_leave_days_per_year = NEW.annual_leave_days_per_year, rtt_days_per_year = NEW.rtt_days_per_year, leave_year_start_month = NEW.leave_year_start_month, default_work_hours_per_week = NEW.default_work_hours_per_week, work_days = NEW.work_days, alert_trial_end_days = NEW.alert_trial_end_days, alert_contract_end_days = NEW.alert_contract_end_days, alert_interview_days = NEW.alert_interview_days, employee_self_service_enabled = NEW.employee_self_service_enabled, employees_can_request_leaves = NEW.employees_can_request_leaves, employees_can_view_directory = NEW.employees_can_view_directory, employees_can_edit_profile = NEW.employees_can_edit_profile, updated_at = COALESCE(NEW.updated_at, NOW())
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM hr.settings WHERE id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER hr_settings_trigger INSTEAD OF INSERT OR UPDATE OR DELETE ON public.hr_settings FOR EACH ROW EXECUTE FUNCTION public.hr_settings_trigger();

-- ===========================================
-- GRANTS
-- ===========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_interviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_leave_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_leave_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_settings TO authenticated;

COMMIT;
