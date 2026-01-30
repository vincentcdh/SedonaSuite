-- ===========================================
-- PHASE 4: PROJECTS MODULE SCHEMA
-- ===========================================

-- Create projects schema
CREATE SCHEMA IF NOT EXISTS projects;

-- =========================================
-- ENUM TYPES
-- =========================================

CREATE TYPE projects.project_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE projects.task_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE projects.task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'blocked');
CREATE TYPE projects.member_role AS ENUM ('owner', 'manager', 'member', 'viewer');
CREATE TYPE projects.client_access_type AS ENUM ('account', 'link');

-- =========================================
-- TABLE: PROJECTS
-- =========================================

CREATE TABLE projects.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#0c82d6',
  icon VARCHAR(50),

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Budget (optional)
  budget_amount DECIMAL(12,2),
  budget_currency VARCHAR(3) DEFAULT 'EUR',

  -- Status
  status projects.project_status DEFAULT 'draft',

  -- Link with CRM (optional)
  client_contact_id UUID,
  client_company_id UUID,

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =========================================
-- TABLE: PROJECT MEMBERS (Internal team)
-- =========================================

CREATE TABLE projects.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role projects.member_role DEFAULT 'member',

  -- Notifications
  notify_on_updates BOOLEAN DEFAULT TRUE,
  notify_on_comments BOOLEAN DEFAULT TRUE,

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, user_id)
);

-- =========================================
-- TABLE: TASK COLUMNS (Kanban)
-- =========================================

CREATE TABLE projects.task_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6b7280',
  position INTEGER NOT NULL,

  -- System column (cannot be deleted)
  is_system BOOLEAN DEFAULT FALSE,
  system_status projects.task_status,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLE: TASKS
-- =========================================

CREATE TABLE projects.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES projects.task_columns(id) ON DELETE CASCADE,

  -- Info
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Position in column
  position INTEGER NOT NULL,

  -- Status and priority
  status projects.task_status DEFAULT 'todo',
  priority projects.task_priority DEFAULT 'normal',

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Time
  estimated_hours DECIMAL(6,2),

  -- Parent task (for subtasks)
  parent_task_id UUID REFERENCES projects.tasks(id) ON DELETE CASCADE,

  -- Client visibility
  visible_to_client BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =========================================
-- TABLE: TASK ASSIGNEES
-- =========================================

CREATE TABLE projects.task_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  UNIQUE(task_id, user_id)
);

-- =========================================
-- TABLE: TASK CHECKLIST
-- =========================================

CREATE TABLE projects.task_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES projects.tasks(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLE: TIME ENTRIES (PRO)
-- =========================================

CREATE TABLE projects.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES projects.tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Time
  date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Description
  description TEXT,

  -- Billing
  is_billable BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(8,2),

  -- Timer (if used)
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLE: PROJECT FILES
-- =========================================

CREATE TABLE projects.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES projects.tasks(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100),

  -- Client visibility
  visible_to_client BOOLEAN DEFAULT TRUE,

  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =========================================
-- CLIENT PORTAL TABLES
-- =========================================

-- Table: Client access to projects
CREATE TABLE projects.client_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,

  -- Access type
  access_type projects.client_access_type NOT NULL,

  -- For access_type = 'account'
  client_email VARCHAR(255),
  client_name VARCHAR(255),
  client_password_hash TEXT,

  -- For access_type = 'link'
  share_token VARCHAR(64) UNIQUE,

  -- Security
  password_protected BOOLEAN DEFAULT FALSE,
  link_password_hash TEXT,
  expires_at TIMESTAMPTZ,

  -- Permissions
  can_comment BOOLEAN DEFAULT TRUE,
  can_upload_files BOOLEAN DEFAULT FALSE,
  can_see_time_tracking BOOLEAN DEFAULT FALSE,
  can_see_budget BOOLEAN DEFAULT FALSE,
  can_see_team_members BOOLEAN DEFAULT TRUE,

  -- Notifications
  notify_on_updates BOOLEAN DEFAULT TRUE,

  -- Stats
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, client_email)
);

-- Table: Client sessions
CREATE TABLE projects.client_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_access_id UUID NOT NULL REFERENCES projects.client_access(id) ON DELETE CASCADE,

  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Comments (team + clients)
CREATE TABLE projects.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES projects.tasks(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  -- Author (either internal user or client)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_access_id UUID REFERENCES projects.client_access(id) ON DELETE SET NULL,

  -- Reply to another comment
  parent_id UUID REFERENCES projects.comments(id) ON DELETE CASCADE,

  -- Visibility
  is_internal BOOLEAN DEFAULT FALSE,

  -- Attachment (optional)
  attachment_url TEXT,
  attachment_name VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT comment_author CHECK (user_id IS NOT NULL OR client_access_id IS NOT NULL)
);

-- Table: Client questions
CREATE TABLE projects.client_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
  client_access_id UUID NOT NULL REFERENCES projects.client_access(id) ON DELETE CASCADE,

  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'open',

  -- Team answer
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answered_at TIMESTAMPTZ,
  answer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Client validations (milestones)
CREATE TABLE projects.client_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Tasks to validate
  task_ids UUID[] DEFAULT '{}',

  -- Status
  status VARCHAR(20) DEFAULT 'pending',

  -- Validation
  validated_by_client_id UUID REFERENCES projects.client_access(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  client_feedback TEXT,

  -- Change requests
  change_requests TEXT,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Activity log (for client timeline)
CREATE TABLE projects.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,

  action VARCHAR(100) NOT NULL,

  -- Related entities
  task_id UUID REFERENCES projects.tasks(id) ON DELETE SET NULL,

  -- Author
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_access_id UUID REFERENCES projects.client_access(id) ON DELETE SET NULL,

  -- Details
  details JSONB,

  -- Client visibility
  visible_to_client BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX idx_projects_org ON projects.projects(organization_id);
CREATE INDEX idx_projects_status ON projects.projects(status);
CREATE INDEX idx_projects_deleted ON projects.projects(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_project_members_project ON projects.project_members(project_id);
CREATE INDEX idx_project_members_user ON projects.project_members(user_id);

CREATE INDEX idx_task_columns_project ON projects.task_columns(project_id);
CREATE INDEX idx_task_columns_position ON projects.task_columns(project_id, position);

CREATE INDEX idx_tasks_project ON projects.tasks(project_id);
CREATE INDEX idx_tasks_column ON projects.tasks(column_id);
CREATE INDEX idx_tasks_parent ON projects.tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON projects.tasks(status);
CREATE INDEX idx_tasks_deleted ON projects.tasks(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_task_assignees_task ON projects.task_assignees(task_id);
CREATE INDEX idx_task_assignees_user ON projects.task_assignees(user_id);

CREATE INDEX idx_task_checklist_task ON projects.task_checklist(task_id);

CREATE INDEX idx_time_entries_project ON projects.time_entries(project_id);
CREATE INDEX idx_time_entries_task ON projects.time_entries(task_id);
CREATE INDEX idx_time_entries_user ON projects.time_entries(user_id);
CREATE INDEX idx_time_entries_date ON projects.time_entries(date);

CREATE INDEX idx_files_project ON projects.files(project_id);
CREATE INDEX idx_files_task ON projects.files(task_id);

-- Client portal indexes
CREATE INDEX idx_client_access_project ON projects.client_access(project_id);
CREATE INDEX idx_client_access_email ON projects.client_access(client_email);
CREATE INDEX idx_client_access_token ON projects.client_access(share_token);
CREATE INDEX idx_client_sessions_token ON projects.client_sessions(token);
CREATE INDEX idx_comments_project ON projects.comments(project_id);
CREATE INDEX idx_comments_task ON projects.comments(task_id);
CREATE INDEX idx_questions_project ON projects.client_questions(project_id);
CREATE INDEX idx_validations_project ON projects.client_validations(project_id);
CREATE INDEX idx_activity_project ON projects.activity_log(project_id);
CREATE INDEX idx_activity_date ON projects.activity_log(created_at);

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.client_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.client_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.client_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.activity_log ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view projects in their organization"
  ON projects.projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their organization"
  ON projects.projects FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects in their organization"
  ON projects.projects FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projects in their organization"
  ON projects.projects FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Project members policies
CREATE POLICY "Users can view project members"
  ON projects.project_members FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage project members"
  ON projects.project_members FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Task columns policies
CREATE POLICY "Users can view task columns"
  ON projects.task_columns FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage task columns"
  ON projects.task_columns FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks"
  ON projects.tasks FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage tasks"
  ON projects.tasks FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Task assignees policies
CREATE POLICY "Users can view task assignees"
  ON projects.task_assignees FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM projects.tasks
      WHERE project_id IN (
        SELECT id FROM projects.projects
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage task assignees"
  ON projects.task_assignees FOR ALL
  USING (
    task_id IN (
      SELECT id FROM projects.tasks
      WHERE project_id IN (
        SELECT id FROM projects.projects
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Task checklist policies
CREATE POLICY "Users can view task checklist"
  ON projects.task_checklist FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM projects.tasks
      WHERE project_id IN (
        SELECT id FROM projects.projects
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage task checklist"
  ON projects.task_checklist FOR ALL
  USING (
    task_id IN (
      SELECT id FROM projects.tasks
      WHERE project_id IN (
        SELECT id FROM projects.projects
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Time entries policies
CREATE POLICY "Users can view time entries"
  ON projects.time_entries FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their time entries"
  ON projects.time_entries FOR ALL
  USING (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Files policies
CREATE POLICY "Users can view project files"
  ON projects.files FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage project files"
  ON projects.files FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Client access policies
CREATE POLICY "Users can view client access"
  ON projects.client_access FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage client access"
  ON projects.client_access FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Client sessions policies
CREATE POLICY "Users can view client sessions"
  ON projects.client_sessions FOR SELECT
  USING (
    client_access_id IN (
      SELECT id FROM projects.client_access
      WHERE project_id IN (
        SELECT id FROM projects.projects
        WHERE organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments"
  ON projects.comments FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage comments"
  ON projects.comments FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Client questions policies
CREATE POLICY "Users can view client questions"
  ON projects.client_questions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage client questions"
  ON projects.client_questions FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Client validations policies
CREATE POLICY "Users can view client validations"
  ON projects.client_validations FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage client validations"
  ON projects.client_validations FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Activity log policies
CREATE POLICY "Users can view activity log"
  ON projects.activity_log FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create activity log"
  ON projects.activity_log FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects.projects
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- =========================================
-- TRIGGERS
-- =========================================

-- Updated at triggers
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON projects.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER time_entries_updated_at
  BEFORE UPDATE ON projects.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER client_access_updated_at
  BEFORE UPDATE ON projects.client_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON projects.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER client_questions_updated_at
  BEFORE UPDATE ON projects.client_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER client_validations_updated_at
  BEFORE UPDATE ON projects.client_validations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =========================================
-- FUNCTION: Create default columns for new project
-- =========================================

CREATE OR REPLACE FUNCTION projects.create_default_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO projects.task_columns (project_id, name, position, is_system, system_status, color) VALUES
    (NEW.id, 'A faire', 0, TRUE, 'todo', '#6b7280'),
    (NEW.id, 'En cours', 1, TRUE, 'in_progress', '#0c82d6'),
    (NEW.id, 'En revision', 2, TRUE, 'review', '#f59e0b'),
    (NEW.id, 'Termine', 3, TRUE, 'done', '#10b981');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_create_default_columns
  AFTER INSERT ON projects.projects
  FOR EACH ROW
  EXECUTE FUNCTION projects.create_default_columns();

-- =========================================
-- FUNCTION: Add project creator as owner
-- =========================================

CREATE OR REPLACE FUNCTION projects.add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO projects.project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner')
    ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_add_creator_as_owner
  AFTER INSERT ON projects.projects
  FOR EACH ROW
  EXECUTE FUNCTION projects.add_creator_as_owner();

-- =========================================
-- FUNCTION: Log project activity
-- =========================================

CREATE OR REPLACE FUNCTION projects.log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO projects.activity_log (project_id, action, task_id, user_id, visible_to_client, details)
    VALUES (
      NEW.project_id,
      'task_created',
      NEW.id,
      NEW.created_by,
      NEW.visible_to_client,
      jsonb_build_object('title', NEW.title)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Task completed
    IF OLD.status != 'done' AND NEW.status = 'done' THEN
      INSERT INTO projects.activity_log (project_id, action, task_id, user_id, visible_to_client, details)
      VALUES (
        NEW.project_id,
        'task_completed',
        NEW.id,
        auth.uid(),
        NEW.visible_to_client,
        jsonb_build_object('title', NEW.title)
      );
    END IF;
    -- Status changed
    IF OLD.status != NEW.status AND NOT (OLD.status != 'done' AND NEW.status = 'done') THEN
      INSERT INTO projects.activity_log (project_id, action, task_id, user_id, visible_to_client, details)
      VALUES (
        NEW.project_id,
        'task_status_changed',
        NEW.id,
        auth.uid(),
        NEW.visible_to_client,
        jsonb_build_object('title', NEW.title, 'old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_log_activity
  AFTER INSERT OR UPDATE ON projects.tasks
  FOR EACH ROW
  EXECUTE FUNCTION projects.log_task_activity();

-- =========================================
-- FUNCTION: Generate share token
-- =========================================

CREATE OR REPLACE FUNCTION projects.generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- FUNCTION: Update task completed_at
-- =========================================

CREATE OR REPLACE FUNCTION projects.update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at := NOW();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_update_completed_at
  BEFORE UPDATE ON projects.tasks
  FOR EACH ROW
  EXECUTE FUNCTION projects.update_task_completed_at();

-- =========================================
-- FUNCTION: Update project completed_at
-- =========================================

CREATE OR REPLACE FUNCTION projects.update_project_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := NOW();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_update_completed_at
  BEFORE UPDATE ON projects.projects
  FOR EACH ROW
  EXECUTE FUNCTION projects.update_project_completed_at();

-- =========================================
-- HELPER FUNCTIONS
-- =========================================

-- Get project progress (percentage of completed tasks)
CREATE OR REPLACE FUNCTION projects.get_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tasks
  FROM projects.tasks
  WHERE project_id = p_project_id AND deleted_at IS NULL;

  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO completed_tasks
  FROM projects.tasks
  WHERE project_id = p_project_id
    AND deleted_at IS NULL
    AND status = 'done';

  RETURN ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
END;
$$ LANGUAGE plpgsql;

-- Get task counts by status for a project
CREATE OR REPLACE FUNCTION projects.get_task_counts(p_project_id UUID)
RETURNS TABLE(status projects.task_status, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.status, COUNT(*)
  FROM projects.tasks t
  WHERE t.project_id = p_project_id AND t.deleted_at IS NULL
  GROUP BY t.status;
END;
$$ LANGUAGE plpgsql;

-- Validate client share token
CREATE OR REPLACE FUNCTION projects.validate_share_token(p_token TEXT)
RETURNS TABLE(
  client_access_id UUID,
  project_id UUID,
  project_name TEXT,
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ca.id,
    ca.project_id,
    p.name::TEXT,
    jsonb_build_object(
      'can_comment', ca.can_comment,
      'can_upload_files', ca.can_upload_files,
      'can_see_time_tracking', ca.can_see_time_tracking,
      'can_see_budget', ca.can_see_budget,
      'can_see_team_members', ca.can_see_team_members
    )
  FROM projects.client_access ca
  JOIN projects.projects p ON p.id = ca.project_id
  WHERE ca.share_token = p_token
    AND ca.is_active = TRUE
    AND ca.access_type = 'link'
    AND (ca.expires_at IS NULL OR ca.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
