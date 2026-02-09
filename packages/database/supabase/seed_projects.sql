-- ===========================================
-- SEDONA CRM - SEED DATA: PROJECTS MODULE
-- ===========================================

BEGIN;

-- ===========================================
-- PROJECTS (for PRO organization)
-- ===========================================

INSERT INTO projects.projects (id, organization_id, name, description, color, icon, status, start_date, end_date, budget_amount, budget_currency, is_public, allow_time_tracking, created_by, created_at)
VALUES
  ('300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Refonte Site Web', 'Refonte complete du site web corporate avec nouveau design', '#3B82F6', 'globe', 'active', '2024-01-15', '2024-04-30', 25000.00, 'EUR', true, true, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-10'),
  ('300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Application Mobile V2', 'Developpement de la v2 de l''application mobile', '#10B981', 'smartphone', 'active', '2024-02-01', '2024-06-30', 45000.00, 'EUR', true, true, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-25'),
  ('300ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Migration Cloud AWS', 'Migration de l''infrastructure vers AWS', '#F59E0B', 'cloud', 'paused', '2024-01-01', '2024-03-31', 35000.00, 'EUR', false, true, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-12-15'),
  ('300ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Formation Equipe Dev', 'Programme de formation continue equipe developpement', '#8B5CF6', 'book-open', 'completed', '2023-10-01', '2023-12-31', 8000.00, 'EUR', true, false, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-09-15')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- PROJECT MEMBERS
-- ===========================================

INSERT INTO projects.project_members (id, project_id, user_id, role, can_edit_project, can_manage_members, can_delete_tasks, joined_at)
VALUES
  -- Refonte Site Web
  ('310ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'owner', true, true, true, '2024-01-10'),
  ('310ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'manager', true, true, true, '2024-01-10'),
  ('310ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'member', false, false, false, '2024-01-15'),
  -- Application Mobile V2
  ('310ebc99-9c0b-4ef8-bb6d-6bb9bd380004', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'owner', true, true, true, '2024-01-25'),
  ('310ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'member', false, false, false, '2024-02-01'),
  -- Migration Cloud AWS
  ('310ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'owner', true, true, true, '2023-12-15')
ON CONFLICT (id) DO NOTHING;

-- Note: Task statuses are auto-created by trigger when project is created
-- We need to get the status IDs after project creation

-- ===========================================
-- TASKS (for Refonte Site Web project)
-- ===========================================

-- First, let's insert tasks with NULL status_id, then update them
INSERT INTO projects.tasks (id, project_id, title, description, priority, start_date, due_date, estimated_hours, position, created_by, created_at)
VALUES
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Maquettes UI/UX', 'Creation des maquettes Figma pour le nouveau design', 'high', '2024-01-15', '2024-01-31', 40, 0, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-10'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Integration Frontend', 'Integration HTML/CSS/JS des maquettes', 'high', '2024-02-01', '2024-02-28', 80, 1, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-10'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Backend API', 'Developpement des APIs REST', 'medium', '2024-02-15', '2024-03-15', 60, 2, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-10'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380004', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Tests et QA', 'Phase de tests et corrections', 'medium', '2024-03-15', '2024-04-15', 30, 3, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-10'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Mise en production', 'Deploiement et go-live', 'urgent', '2024-04-15', '2024-04-30', 16, 4, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-10'),
  -- Application Mobile V2 tasks
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Specification fonctionnelle', 'Redaction du cahier des charges', 'high', '2024-02-01', '2024-02-15', 24, 0, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-25'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380007', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Design System Mobile', 'Creation du design system pour l''app', 'high', '2024-02-15', '2024-03-01', 32, 1, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-25'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380008', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Developpement iOS', 'Developpement application iOS native', 'medium', '2024-03-01', '2024-05-15', 120, 2, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-25'),
  ('320ebc99-9c0b-4ef8-bb6d-6bb9bd380009', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Developpement Android', 'Developpement application Android native', 'medium', '2024-03-01', '2024-05-15', 120, 3, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-25')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TASK ASSIGNEES
-- ===========================================

INSERT INTO projects.task_assignees (id, task_id, user_id, assigned_at, assigned_by)
VALUES
  ('330ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-10', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('330ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-10', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('330ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-10', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('330ebc99-9c0b-4ef8-bb6d-6bb9bd380004', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-10', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('330ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-25', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05'),
  ('330ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-25', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- LABELS
-- ===========================================

INSERT INTO projects.labels (id, project_id, name, color, created_at)
VALUES
  ('340ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Frontend', '#3B82F6', '2024-01-10'),
  ('340ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Backend', '#10B981', '2024-01-10'),
  ('340ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Design', '#8B5CF6', '2024-01-10'),
  ('340ebc99-9c0b-4ef8-bb6d-6bb9bd380004', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Bug', '#EF4444', '2024-01-10'),
  ('340ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'iOS', '#6B7280', '2024-01-25'),
  ('340ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Android', '#22C55E', '2024-01-25')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TASK COMMENTS
-- ===========================================

INSERT INTO projects.task_comments (id, task_id, user_id, content, created_at)
VALUES
  ('350ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Premiere version des maquettes prete pour review', '2024-01-20'),
  ('350ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Super travail ! Quelques ajustements sur la page d''accueil', '2024-01-21'),
  ('350ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Integration de la page d''accueil terminee', '2024-02-10')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TIME ENTRIES
-- ===========================================

INSERT INTO projects.time_entries (id, project_id, task_id, user_id, description, start_time, end_time, duration_minutes, is_billable, hourly_rate, created_at)
VALUES
  ('360ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Wireframes page d''accueil', '2024-01-15 09:00:00', '2024-01-15 12:30:00', 210, true, 75.00, '2024-01-15'),
  ('360ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Design haute fidelite', '2024-01-16 14:00:00', '2024-01-16 18:00:00', 240, true, 75.00, '2024-01-16'),
  ('360ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '300ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '320ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Integration CSS header', '2024-02-05 09:00:00', '2024-02-05 17:00:00', 480, true, 65.00, '2024-02-05')
ON CONFLICT (id) DO NOTHING;

COMMIT;

SELECT 'Projects seed data loaded successfully' AS status;
