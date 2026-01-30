-- ===========================================
-- ANALYTICS MODULE RLS POLICIES
-- ===========================================

-- Enable RLS on all analytics tables
ALTER TABLE analytics.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.metrics_cache ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- DASHBOARDS POLICIES
-- ===========================================

-- Users can view their own dashboards or shared dashboards in their organization
CREATE POLICY dashboards_select ON analytics.dashboards
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND (created_by = auth.uid() OR is_shared = true)
  );

-- Users can create dashboards in their organization
CREATE POLICY dashboards_insert ON analytics.dashboards
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Users can update their own dashboards
CREATE POLICY dashboards_update ON analytics.dashboards
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own dashboards
CREATE POLICY dashboards_delete ON analytics.dashboards
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ===========================================
-- WIDGETS POLICIES
-- ===========================================

-- Users can view widgets on dashboards they have access to
CREATE POLICY widgets_select ON analytics.widgets
  FOR SELECT TO authenticated
  USING (
    dashboard_id IN (
      SELECT id FROM analytics.dashboards
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
      AND (created_by = auth.uid() OR is_shared = true)
    )
  );

-- Users can insert widgets on their own dashboards
CREATE POLICY widgets_insert ON analytics.widgets
  FOR INSERT TO authenticated
  WITH CHECK (
    dashboard_id IN (
      SELECT id FROM analytics.dashboards
      WHERE created_by = auth.uid()
    )
  );

-- Users can update widgets on their own dashboards
CREATE POLICY widgets_update ON analytics.widgets
  FOR UPDATE TO authenticated
  USING (
    dashboard_id IN (
      SELECT id FROM analytics.dashboards
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    dashboard_id IN (
      SELECT id FROM analytics.dashboards
      WHERE created_by = auth.uid()
    )
  );

-- Users can delete widgets on their own dashboards
CREATE POLICY widgets_delete ON analytics.widgets
  FOR DELETE TO authenticated
  USING (
    dashboard_id IN (
      SELECT id FROM analytics.dashboards
      WHERE created_by = auth.uid()
    )
  );

-- ===========================================
-- GOALS POLICIES
-- ===========================================

-- Users can view goals in their organization
CREATE POLICY goals_select ON analytics.goals
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create goals in their organization
CREATE POLICY goals_insert ON analytics.goals
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Users can update goals they created
CREATE POLICY goals_update ON analytics.goals
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete goals they created
CREATE POLICY goals_delete ON analytics.goals
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ===========================================
-- GOAL PROGRESS POLICIES
-- ===========================================

-- Users can view progress for goals in their organization
CREATE POLICY goal_progress_select ON analytics.goal_progress
  FOR SELECT TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM analytics.goals
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Goal progress is typically system-generated, but allow insert for goal creators
CREATE POLICY goal_progress_insert ON analytics.goal_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    goal_id IN (
      SELECT id FROM analytics.goals
      WHERE created_by = auth.uid()
    )
  );

-- ===========================================
-- SCHEDULED REPORTS POLICIES
-- ===========================================

-- Users can view scheduled reports in their organization
CREATE POLICY scheduled_reports_select ON analytics.scheduled_reports
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create scheduled reports in their organization
CREATE POLICY scheduled_reports_insert ON analytics.scheduled_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Users can update their own scheduled reports
CREATE POLICY scheduled_reports_update ON analytics.scheduled_reports
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own scheduled reports
CREATE POLICY scheduled_reports_delete ON analytics.scheduled_reports
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- ===========================================
-- REPORT HISTORY POLICIES
-- ===========================================

-- Users can view report history for their scheduled reports
CREATE POLICY report_history_select ON analytics.report_history
  FOR SELECT TO authenticated
  USING (
    scheduled_report_id IN (
      SELECT id FROM analytics.scheduled_reports
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- ===========================================
-- METRICS CACHE POLICIES
-- ===========================================

-- Users can view metrics cache for their organization
CREATE POLICY metrics_cache_select ON analytics.metrics_cache
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Metrics cache is system-managed, but allow insert for authenticated users
-- (in production, this would be more restricted)
CREATE POLICY metrics_cache_insert ON analytics.metrics_cache
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow update for cache refresh
CREATE POLICY metrics_cache_update ON analytics.metrics_cache
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );
