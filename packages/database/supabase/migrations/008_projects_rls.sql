-- ===========================================
-- PROJECTS MODULE - ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.task_labels ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTION: Check project membership
-- ===========================================

CREATE OR REPLACE FUNCTION projects.user_is_project_member(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects.project_members
    WHERE project_id = project_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION projects.user_can_edit_project(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects.project_members
    WHERE project_id = project_uuid
      AND user_id = user_uuid
      AND (role IN ('owner', 'manager') OR can_edit_project = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- PROJECTS POLICIES
-- ===========================================

-- Select: org members can see their org projects (if public or member)
CREATE POLICY "Users can view projects they are member of or public projects"
  ON projects.projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    )
    AND (
      is_public = true
      OR projects.user_is_project_member(id, auth.uid())
      OR created_by = auth.uid()
    )
  );

-- Insert: org members can create projects
CREATE POLICY "Org members can create projects"
  ON projects.projects FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    )
  );

-- Update: project owners/managers or those with edit permission
CREATE POLICY "Project managers can update projects"
  ON projects.projects FOR UPDATE
  USING (
    projects.user_can_edit_project(id, auth.uid())
  );

-- Delete: only project owners
CREATE POLICY "Project owners can delete projects"
  ON projects.projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects.project_members
      WHERE project_id = id AND user_id = auth.uid() AND role = 'owner'
    )
  );

-- ===========================================
-- PROJECT MEMBERS POLICIES
-- ===========================================

CREATE POLICY "Project members can view other members"
  ON projects.project_members FOR SELECT
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Project managers can add members"
  ON projects.project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects.project_members
      WHERE project_id = project_members.project_id
        AND user_id = auth.uid()
        AND (role IN ('owner', 'manager') OR can_manage_members = true)
    )
    OR NOT EXISTS (
      SELECT 1 FROM projects.project_members WHERE project_id = project_members.project_id
    ) -- First member (creator)
  );

CREATE POLICY "Project managers can update members"
  ON projects.project_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND (pm.role IN ('owner', 'manager') OR pm.can_manage_members = true)
    )
  );

CREATE POLICY "Project managers can remove members"
  ON projects.project_members FOR DELETE
  USING (
    user_id = auth.uid() -- Can remove self
    OR EXISTS (
      SELECT 1 FROM projects.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND (pm.role IN ('owner', 'manager') OR pm.can_manage_members = true)
    )
  );

-- ===========================================
-- TASK STATUSES POLICIES
-- ===========================================

CREATE POLICY "Project members can view task statuses"
  ON projects.task_statuses FOR SELECT
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Project managers can manage task statuses"
  ON projects.task_statuses FOR ALL
  USING (
    projects.user_can_edit_project(project_id, auth.uid())
  );

-- ===========================================
-- TASKS POLICIES
-- ===========================================

CREATE POLICY "Project members can view tasks"
  ON projects.tasks FOR SELECT
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Project members can create tasks"
  ON projects.tasks FOR INSERT
  WITH CHECK (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Project members can update tasks"
  ON projects.tasks FOR UPDATE
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Task creators or managers can delete tasks"
  ON projects.tasks FOR DELETE
  USING (
    created_by = auth.uid()
    OR projects.user_can_edit_project(project_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM projects.project_members
      WHERE project_id = tasks.project_id
        AND user_id = auth.uid()
        AND can_delete_tasks = true
    )
  );

-- ===========================================
-- TASK ASSIGNEES POLICIES
-- ===========================================

CREATE POLICY "Project members can view task assignees"
  ON projects.task_assignees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Project members can manage task assignees"
  ON projects.task_assignees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

-- ===========================================
-- TASK DEPENDENCIES POLICIES
-- ===========================================

CREATE POLICY "Project members can view task dependencies"
  ON projects.task_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Project members can manage task dependencies"
  ON projects.task_dependencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

-- ===========================================
-- TASK COMMENTS POLICIES
-- ===========================================

CREATE POLICY "Project members can view comments"
  ON projects.task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Project members can create comments"
  ON projects.task_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Comment authors can update their comments"
  ON projects.task_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Comment authors or managers can delete comments"
  ON projects.task_comments FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_can_edit_project(t.project_id, auth.uid())
    )
  );

-- ===========================================
-- TASK ATTACHMENTS POLICIES
-- ===========================================

CREATE POLICY "Project members can view attachments"
  ON projects.task_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Project members can upload attachments"
  ON projects.task_attachments FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Uploaders or managers can delete attachments"
  ON projects.task_attachments FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_can_edit_project(t.project_id, auth.uid())
    )
  );

-- ===========================================
-- TASK CHECKLIST ITEMS POLICIES
-- ===========================================

CREATE POLICY "Project members can view checklist items"
  ON projects.task_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Project members can manage checklist items"
  ON projects.task_checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

-- ===========================================
-- TIME ENTRIES POLICIES
-- ===========================================

CREATE POLICY "Project members can view time entries"
  ON projects.time_entries FOR SELECT
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Users can create their own time entries"
  ON projects.time_entries FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Users can update their own time entries"
  ON projects.time_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
  ON projects.time_entries FOR DELETE
  USING (
    user_id = auth.uid()
    OR projects.user_can_edit_project(project_id, auth.uid())
  );

-- ===========================================
-- LABELS POLICIES
-- ===========================================

CREATE POLICY "Project members can view labels"
  ON projects.labels FOR SELECT
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

CREATE POLICY "Project members can manage labels"
  ON projects.labels FOR ALL
  USING (
    projects.user_is_project_member(project_id, auth.uid())
  );

-- ===========================================
-- TASK LABELS POLICIES
-- ===========================================

CREATE POLICY "Project members can view task labels"
  ON projects.task_labels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );

CREATE POLICY "Project members can manage task labels"
  ON projects.task_labels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects.tasks t
      WHERE t.id = task_id
        AND projects.user_is_project_member(t.project_id, auth.uid())
    )
  );
