-- ===========================================
-- SEDONA CRM - SEED DATA: HR MODULE
-- ===========================================

BEGIN;

-- ===========================================
-- HR SETTINGS (for PRO organization)
-- ===========================================

INSERT INTO hr.settings (id, organization_id, annual_leave_days_per_year, rtt_days_per_year, leave_year_start_month, default_work_hours_per_week, employee_self_service_enabled, employees_can_request_leaves, created_at)
VALUES
  ('500ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 25.0, 10.0, 6, 35.0, true, true, '2023-06-01')
ON CONFLICT (organization_id) DO NOTHING;

-- ===========================================
-- LEAVE TYPES
-- ===========================================

INSERT INTO hr.leave_types (id, organization_id, name, code, color, is_paid, requires_approval, deducts_from_balance, is_system, created_at)
VALUES
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Conges Payes', 'cp', '#3B82F6', true, true, true, true, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'RTT', 'rtt', '#10B981', true, true, true, true, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Maladie', 'sick', '#EF4444', true, false, false, true, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Sans Solde', 'unpaid', '#6B7280', false, true, false, true, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Teletravail', 'remote', '#8B5CF6', true, false, false, false, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Formation', 'training', '#F59E0B', true, true, false, false, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- EMPLOYEES
-- ===========================================

INSERT INTO hr.employees (id, organization_id, user_id, first_name, last_name, email, phone, birth_date, nationality, employee_number, job_title, department, contract_type, contract_start_date, trial_end_date, gross_salary, salary_currency, annual_leave_balance, rtt_balance, status, created_at)
VALUES
  -- Owner Pro as employee
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Jean-Pierre', 'Martin', 'owner.pro@test.sedona.ai', '+33 6 98 76 54 32', '1975-03-15', 'Francaise', 'EMP-00001', 'Directeur General', 'Direction', 'cdi', '2020-01-01', NULL, 8500.00, 'EUR', 25.0, 10.0, 'active', '2023-06-01'),

  -- Manager Pro as employee
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Claire', 'Moreau', 'manager.pro@test.sedona.ai', '+33 6 77 88 99 00', '1985-07-22', 'Francaise', 'EMP-00002', 'Responsable Commercial', 'Commercial', 'cdi', '2021-03-15', NULL, 5200.00, 'EUR', 22.5, 8.0, 'active', '2023-06-01'),

  -- Employee Pro as employee
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Emma', 'Leroy', 'employee.pro@test.sedona.ai', '+33 6 44 55 66 77', '1992-11-08', 'Francaise', 'EMP-00003', 'Developpeur Full Stack', 'Technique', 'cdi', '2022-09-01', NULL, 4200.00, 'EUR', 18.0, 6.0, 'active', '2023-06-01'),

  -- Additional employees
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Alexandre', 'Dubois', 'alexandre.dubois@entreprise-pro.fr', '+33 6 11 22 33 44', '1988-05-12', 'Francaise', 'EMP-00004', 'Chef de Projet', 'Technique', 'cdi', '2022-01-15', NULL, 4800.00, 'EUR', 20.0, 7.0, 'active', '2023-06-01'),

  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Marine', 'Petit', 'marine.petit@entreprise-pro.fr', '+33 6 22 33 44 55', '1995-09-28', 'Francaise', 'EMP-00005', 'Designer UX/UI', 'Technique', 'cdd', '2023-06-01', '2024-05-31', 3500.00, 'EUR', 12.5, 5.0, 'active', '2023-06-01'),

  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Nicolas', 'Bernard', 'nicolas.bernard@entreprise-pro.fr', '+33 6 33 44 55 66', '1990-01-18', 'Francaise', 'EMP-00006', 'Commercial', 'Commercial', 'cdi', '2023-01-02', NULL, 3200.00, 'EUR', 15.0, 6.0, 'active', '2023-06-01'),

  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Julie', 'Roux', 'julie.roux@entreprise-pro.fr', '+33 6 44 55 66 77', '1998-12-05', 'Francaise', 'EMP-00007', 'Stagiaire Developpement', 'Technique', 'stage', '2024-01-15', '2024-07-14', 1200.00, 'EUR', 2.5, 0.0, 'trial_period', '2024-01-15')
ON CONFLICT (id) DO NOTHING;

-- Set manager relationships
UPDATE hr.employees SET manager_id = '520ebc99-9c0b-4ef8-bb6d-6bb9bd380001' WHERE id IN ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380002');
UPDATE hr.employees SET manager_id = '520ebc99-9c0b-4ef8-bb6d-6bb9bd380002' WHERE id IN ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380006');
UPDATE hr.employees SET manager_id = '520ebc99-9c0b-4ef8-bb6d-6bb9bd380004' WHERE id IN ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380007');

-- ===========================================
-- CONTRACTS
-- ===========================================

INSERT INTO hr.contracts (id, organization_id, employee_id, contract_type, start_date, end_date, trial_duration_days, job_title, department, work_hours_per_week, is_full_time, remote_policy, gross_salary, salary_currency, created_at)
VALUES
  ('530ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'cdi', '2020-01-01', NULL, 120, 'Directeur General', 'Direction', 40, true, 'hybrid', 8500.00, 'EUR', '2020-01-01'),
  ('530ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'cdi', '2021-03-15', NULL, 90, 'Responsable Commercial', 'Commercial', 35, true, 'hybrid', 5200.00, 'EUR', '2021-03-15'),
  ('530ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'cdi', '2022-09-01', NULL, 60, 'Developpeur Full Stack', 'Technique', 35, true, 'full_remote', 4200.00, 'EUR', '2022-09-01'),
  ('530ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'cdd', '2023-06-01', '2024-05-31', 30, 'Designer UX/UI', 'Technique', 35, true, 'hybrid', 3500.00, 'EUR', '2023-06-01'),
  ('530ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'stage', '2024-01-15', '2024-07-14', 0, 'Stagiaire Developpement', 'Technique', 35, true, 'office', 1200.00, 'EUR', '2024-01-15')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- LEAVE REQUESTS
-- ===========================================

INSERT INTO hr.leave_requests (id, organization_id, employee_id, leave_type_id, start_date, end_date, days_count, reason, status, approved_by, approved_at, requested_by, created_at)
VALUES
  -- Approved leaves
  ('540ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '2024-02-19', '2024-02-23', 5, 'Vacances de fevrier', 'approved', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-20', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-15'),

  ('540ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '2024-01-29', '2024-01-29', 1, 'RTT', 'approved', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-22', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-20'),

  -- Pending leaves
  ('540ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380004', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '2024-03-04', '2024-03-08', 5, 'Semaine de ski', 'pending', NULL, NULL, NULL, '2024-01-28'),

  ('540ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '2024-04-22', '2024-04-26', 5, 'Vacances Paques', 'pending', NULL, NULL, NULL, '2024-01-30'),

  -- Rejected leave
  ('540ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '2024-02-12', '2024-02-16', 5, 'Voyage personnel', 'rejected', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-25', NULL, '2024-01-20')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- ABSENCES (sick leave)
-- ===========================================

INSERT INTO hr.absences (id, organization_id, employee_id, leave_type_id, start_date, end_date, days_count, reason, recorded_by, created_at)
VALUES
  ('550ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '2024-01-08', '2024-01-09', 2, 'Grippe', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-10'),
  ('550ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '510ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '2024-01-22', '2024-01-22', 1, 'Rendez-vous medical', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-23')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- INTERVIEWS
-- ===========================================

INSERT INTO hr.interviews (id, organization_id, employee_id, type, scheduled_date, interviewer_id, objectives, status, created_by, created_at)
VALUES
  ('560ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'annual', '2024-03-15 10:00:00', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'Bilan de l''annee, objectifs 2024, evolution de carriere', 'scheduled', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-15'),
  ('560ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'trial_end', '2024-03-01 14:00:00', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'Evaluation de la periode d''essai, confirmation ou non', 'scheduled', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-20'),
  ('560ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'professional', '2024-02-28 11:00:00', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Discussion sur l''evolution vers un poste de direction commerciale', 'scheduled', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-25')
ON CONFLICT (id) DO NOTHING;

COMMIT;

SELECT 'HR seed data loaded successfully' AS status;
