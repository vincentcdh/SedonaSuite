-- ===========================================
-- PROJECTS MODULE SCHEMA
-- ===========================================

-- Create projects schema
CREATE SCHEMA IF NOT EXISTS projects;

-- ===========================================
-- PROJECTS TABLE
-- ===========================================

CREATE TABLE projects.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  icon VARCHAR(50) DEFAULT 'folder',

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),

  -- Dates
  start_date DATE,
  end_date DATE,

  -- Budget
  budget_amount DECIMAL(12,2),
  budget_currency VARCHAR(3) DEFAULT 'EUR',

  -- Settings
  is_public BOOLEAN DEFAULT false, -- Visible to all org members
  allow_time_tracking BOOLEAN DEFAULT true,

  -- Linking
  deal_id UUID REFERENCES crm.deals(id) ON DELETE SET NULL,
  client_id UUID, -- Reference to invoice.clients

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- ===========================================
-- PROJECT MEMBERS TABLE
-- ===========================================

CREATE TABLE projects.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Role in project
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member', 'viewer')),

  -- Permissions
  can_edit_project BOOLEAN DEFAULT false,
  can_manage_members BOOLEAN DEFAULT false,
  can_delete_tasks BOOLEAN DEFAULT false,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  UNIQUE(project_id, user_id)
);

-- ===========================================
-- TASK STATUSES TABLE
-- ===========================================

CREATE TABLE projects.task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false, -- Marks tasks as "done" for progress calculation

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, name)
);

-- ===========================================
-- TASKS TABLE
-- ===========================================

CREATE TABLE projects.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES projects.tasks(id) ON DELETE CASCADE, -- For subtasks

  -- Basic info
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status and priority
  status_id UUID REFERENCES projects.task_statuses(id) ON DELETE SET NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Time estimation
  estimated_hours DECIMAL(8,2),

  -- Position for ordering
  position INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TASK ASSIGNEES TABLE
-- ===========================================

CREATE TABLE projects.task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  UNIQUE(task_id, user_id)
);

-- ===========================================
-- TASK DEPENDENCIES TABLE
-- ===========================================

CREATE TABLE projects.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(20) DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

-- ===========================================
-- TASK COMMENTS TABLE
-- ===========================================

CREATE TABLE projects.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  -- For replies
  parent_comment_id UUID REFERENCES projects.task_comments(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

-- ===========================================
-- TASK ATTACHMENTS TABLE
-- ===========================================

CREATE TABLE projects.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,

  -- File info
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  file_type VARCHAR(100),
  storage_path VARCHAR(500) NOT NULL, -- Supabase Storage path

  -- Metadata
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TASK CHECKLIST ITEMS TABLE
-- ===========================================

CREATE TABLE projects.task_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,

  title VARCHAR(500) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TIME ENTRIES TABLE (PRO feature)
-- ===========================================

CREATE TABLE projects.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES projects.tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Time info
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculated or manual entry

  -- Billing
  is_billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),

  -- Status
  is_running BOOLEAN DEFAULT false, -- For timer feature

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- PROJECT LABELS/TAGS TABLE
-- ===========================================

CREATE TABLE projects.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, name)
);

-- ===========================================
-- TASK LABELS (junction table)
-- ===========================================

CREATE TABLE projects.task_labels (
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES projects.labels(id) ON DELETE CASCADE,

  PRIMARY KEY (task_id, label_id)
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Projects
CREATE INDEX idx_projects_organization ON projects.projects(organization_id);
CREATE INDEX idx_projects_status ON projects.projects(status);
CREATE INDEX idx_projects_deal ON projects.projects(deal_id);

-- Project members
CREATE INDEX idx_project_members_project ON projects.project_members(project_id);
CREATE INDEX idx_project_members_user ON projects.project_members(user_id);

-- Tasks
CREATE INDEX idx_tasks_project ON projects.tasks(project_id);
CREATE INDEX idx_tasks_status ON projects.tasks(status_id);
CREATE INDEX idx_tasks_parent ON projects.tasks(parent_task_id);
CREATE INDEX idx_tasks_due_date ON projects.tasks(due_date);
CREATE INDEX idx_tasks_priority ON projects.tasks(priority);
CREATE INDEX idx_tasks_position ON projects.tasks(project_id, position);

-- Task assignees
CREATE INDEX idx_task_assignees_task ON projects.task_assignees(task_id);
CREATE INDEX idx_task_assignees_user ON projects.task_assignees(user_id);

-- Time entries
CREATE INDEX idx_time_entries_project ON projects.time_entries(project_id);
CREATE INDEX idx_time_entries_task ON projects.time_entries(task_id);
CREATE INDEX idx_time_entries_user ON projects.time_entries(user_id);
CREATE INDEX idx_time_entries_date ON projects.time_entries(start_time);

-- Comments
CREATE INDEX idx_task_comments_task ON projects.task_comments(task_id);

-- Attachments
CREATE INDEX idx_task_attachments_task ON projects.task_attachments(task_id);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON projects.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON projects.task_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON projects.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- FUNCTION: CREATE DEFAULT TASK STATUSES
-- ===========================================

CREATE OR REPLACE FUNCTION projects.create_default_task_statuses()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default statuses for new project
  INSERT INTO projects.task_statuses (project_id, name, color, position, is_default, is_completed)
  VALUES
    (NEW.id, 'À faire', '#6B7280', 0, true, false),
    (NEW.id, 'En cours', '#3B82F6', 1, false, false),
    (NEW.id, 'En revue', '#F59E0B', 2, false, false),
    (NEW.id, 'Terminé', '#10B981', 3, false, true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_statuses_on_project
  AFTER INSERT ON projects.projects
  FOR EACH ROW EXECUTE FUNCTION projects.create_default_task_statuses();

-- ===========================================
-- FUNCTION: CALCULATE TIME ENTRY DURATION
-- ===========================================

CREATE OR REPLACE FUNCTION projects.calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_duration_on_time_entry
  BEFORE INSERT OR UPDATE ON projects.time_entries
  FOR EACH ROW EXECUTE FUNCTION projects.calculate_time_entry_duration();

-- ===========================================
-- FUNCTION: UPDATE TASK COMPLETED_AT
-- ===========================================

CREATE OR REPLACE FUNCTION projects.update_task_completed_at()
RETURNS TRIGGER AS $$
DECLARE
  status_is_completed BOOLEAN;
BEGIN
  -- Check if the new status is a "completed" status
  SELECT is_completed INTO status_is_completed
  FROM projects.task_statuses
  WHERE id = NEW.status_id;

  IF status_is_completed = true AND OLD.status_id IS DISTINCT FROM NEW.status_id THEN
    NEW.completed_at := NOW();
  ELSIF status_is_completed = false OR status_is_completed IS NULL THEN
    NEW.completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_completed_at_on_task
  BEFORE UPDATE ON projects.tasks
  FOR EACH ROW EXECUTE FUNCTION projects.update_task_completed_at();

-- ===========================================
-- VIEWS
-- ===========================================

-- Project progress view
CREATE OR REPLACE VIEW projects.project_progress AS
SELECT
  p.id AS project_id,
  p.organization_id,
  p.name AS project_name,
  COUNT(t.id) AS total_tasks,
  COUNT(CASE WHEN t.completed_at IS NOT NULL THEN 1 END) AS completed_tasks,
  CASE
    WHEN COUNT(t.id) > 0 THEN
      ROUND((COUNT(CASE WHEN t.completed_at IS NOT NULL THEN 1 END)::DECIMAL / COUNT(t.id)) * 100, 1)
    ELSE 0
  END AS progress_percentage,
  COALESCE(SUM(te.duration_minutes), 0) AS total_time_minutes,
  COALESCE(SUM(t.estimated_hours) * 60, 0) AS total_estimated_minutes
FROM projects.projects p
LEFT JOIN projects.tasks t ON t.project_id = p.id AND t.parent_task_id IS NULL
LEFT JOIN projects.time_entries te ON te.project_id = p.id
WHERE p.archived_at IS NULL
GROUP BY p.id, p.organization_id, p.name;

-- Member workload view
CREATE OR REPLACE VIEW projects.member_workload AS
SELECT
  pm.user_id,
  pm.project_id,
  p.organization_id,
  COUNT(DISTINCT ta.task_id) AS assigned_tasks,
  COUNT(DISTINCT CASE WHEN t.completed_at IS NULL THEN ta.task_id END) AS open_tasks,
  COALESCE(SUM(te.duration_minutes), 0) AS total_time_minutes
FROM projects.project_members pm
JOIN projects.projects p ON p.id = pm.project_id
LEFT JOIN projects.task_assignees ta ON ta.user_id = pm.user_id
LEFT JOIN projects.tasks t ON t.id = ta.task_id AND t.project_id = pm.project_id
LEFT JOIN projects.time_entries te ON te.user_id = pm.user_id AND te.project_id = pm.project_id
WHERE p.archived_at IS NULL
GROUP BY pm.user_id, pm.project_id, p.organization_id;
