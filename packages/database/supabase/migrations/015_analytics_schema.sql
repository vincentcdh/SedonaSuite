-- ===========================================
-- ANALYTICS MODULE SCHEMA
-- ===========================================
-- Cross-module dashboards and reporting for business intelligence

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE analytics.widget_type AS ENUM (
  'kpi',
  'line_chart',
  'bar_chart',
  'pie_chart',
  'table',
  'goal_progress',
  'heatmap'
);

CREATE TYPE analytics.metric_source AS ENUM (
  'crm',
  'invoice',
  'projects',
  'tickets',
  'hr',
  'docs'
);

CREATE TYPE analytics.period_type AS ENUM (
  'day',
  'week',
  'month',
  'quarter',
  'year'
);

CREATE TYPE analytics.comparison_type AS ENUM (
  'previous_period',
  'same_period_last_year',
  'custom',
  'none'
);

CREATE TYPE analytics.report_format AS ENUM (
  'pdf',
  'csv',
  'excel'
);

CREATE TYPE analytics.report_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly'
);

-- ===========================================
-- DASHBOARDS TABLE
-- ===========================================
-- User-created analytics dashboards

CREATE TABLE analytics.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  layout JSONB DEFAULT '[]'::jsonb, -- Grid layout configuration

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- WIDGETS TABLE
-- ===========================================
-- Individual widgets on dashboards

CREATE TABLE analytics.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics.dashboards(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  widget_type analytics.widget_type NOT NULL,
  metric_source analytics.metric_source NOT NULL,
  metric_key VARCHAR(100) NOT NULL, -- e.g., 'contacts_created', 'revenue_total'

  -- Display configuration
  config JSONB DEFAULT '{}'::jsonb,
  -- {
  --   period: 'month',
  --   comparison: 'previous_period',
  --   filters: {},
  --   colors: [],
  --   format: 'currency' | 'number' | 'percentage'
  -- }

  -- Grid position
  grid_x INTEGER DEFAULT 0,
  grid_y INTEGER DEFAULT 0,
  grid_w INTEGER DEFAULT 4,
  grid_h INTEGER DEFAULT 2,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GOALS TABLE
-- ===========================================
-- Business objectives and targets

CREATE TABLE analytics.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_source analytics.metric_source NOT NULL,
  metric_key VARCHAR(100) NOT NULL,

  target_value DECIMAL(15,2) NOT NULL,
  current_value DECIMAL(15,2) DEFAULT 0,

  period_type analytics.period_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GOAL PROGRESS TABLE
-- ===========================================
-- Historical progress tracking for goals

CREATE TABLE analytics.goal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES analytics.goals(id) ON DELETE CASCADE,

  recorded_at DATE NOT NULL,
  value DECIMAL(15,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(goal_id, recorded_at)
);

-- ===========================================
-- SCHEDULED REPORTS TABLE
-- ===========================================
-- Automated report generation and delivery (PRO)

CREATE TABLE analytics.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Report configuration
  dashboard_id UUID REFERENCES analytics.dashboards(id) ON DELETE SET NULL,
  metrics JSONB DEFAULT '[]'::jsonb, -- Array of {source, key} pairs
  filters JSONB DEFAULT '{}'::jsonb,

  -- Schedule
  frequency analytics.report_frequency NOT NULL,
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME DEFAULT '08:00:00',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',

  -- Delivery
  format analytics.report_format NOT NULL DEFAULT 'pdf',
  recipients TEXT[] DEFAULT '{}', -- Array of email addresses

  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- REPORT HISTORY TABLE
-- ===========================================
-- Generated report logs

CREATE TABLE analytics.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_report_id UUID NOT NULL REFERENCES analytics.scheduled_reports(id) ON DELETE CASCADE,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  file_url TEXT, -- Storage URL for generated report
  file_size_bytes BIGINT,

  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,

  recipients_sent TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- METRICS CACHE TABLE
-- ===========================================
-- Cached computed metrics for performance

CREATE TABLE analytics.metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  metric_source analytics.metric_source NOT NULL,
  metric_key VARCHAR(100) NOT NULL,
  period_type analytics.period_type NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  value DECIMAL(15,2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data like breakdown by category

  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  UNIQUE(organization_id, metric_source, metric_key, period_type, period_start)
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Dashboards
CREATE INDEX idx_dashboards_organization ON analytics.dashboards(organization_id);
CREATE INDEX idx_dashboards_created_by ON analytics.dashboards(created_by);
CREATE INDEX idx_dashboards_default ON analytics.dashboards(organization_id, is_default) WHERE is_default = true;

-- Widgets
CREATE INDEX idx_widgets_dashboard ON analytics.widgets(dashboard_id);
CREATE INDEX idx_widgets_metric ON analytics.widgets(metric_source, metric_key);

-- Goals
CREATE INDEX idx_goals_organization ON analytics.goals(organization_id);
CREATE INDEX idx_goals_assigned ON analytics.goals(assigned_to);
CREATE INDEX idx_goals_active ON analytics.goals(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_goals_dates ON analytics.goals(start_date, end_date);

-- Goal Progress
CREATE INDEX idx_goal_progress_goal ON analytics.goal_progress(goal_id);
CREATE INDEX idx_goal_progress_date ON analytics.goal_progress(recorded_at);

-- Scheduled Reports
CREATE INDEX idx_scheduled_reports_organization ON analytics.scheduled_reports(organization_id);
CREATE INDEX idx_scheduled_reports_next_run ON analytics.scheduled_reports(next_run_at) WHERE is_active = true;

-- Report History
CREATE INDEX idx_report_history_report ON analytics.report_history(scheduled_report_id);
CREATE INDEX idx_report_history_generated ON analytics.report_history(generated_at);

-- Metrics Cache
CREATE INDEX idx_metrics_cache_lookup ON analytics.metrics_cache(organization_id, metric_source, metric_key, period_type);
CREATE INDEX idx_metrics_cache_expires ON analytics.metrics_cache(expires_at) WHERE expires_at IS NOT NULL;

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Updated at trigger function (reuse from public schema if exists)
CREATE OR REPLACE FUNCTION analytics.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_dashboards_updated_at
  BEFORE UPDATE ON analytics.dashboards
  FOR EACH ROW EXECUTE FUNCTION analytics.set_updated_at();

CREATE TRIGGER set_widgets_updated_at
  BEFORE UPDATE ON analytics.widgets
  FOR EACH ROW EXECUTE FUNCTION analytics.set_updated_at();

CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON analytics.goals
  FOR EACH ROW EXECUTE FUNCTION analytics.set_updated_at();

CREATE TRIGGER set_scheduled_reports_updated_at
  BEFORE UPDATE ON analytics.scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION analytics.set_updated_at();

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Calculate next run time for scheduled reports
CREATE OR REPLACE FUNCTION analytics.calculate_next_run(
  p_frequency analytics.report_frequency,
  p_day_of_week INTEGER,
  p_day_of_month INTEGER,
  p_time_of_day TIME,
  p_timezone VARCHAR
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
  v_now TIMESTAMPTZ;
BEGIN
  v_now := NOW() AT TIME ZONE p_timezone;

  CASE p_frequency
    WHEN 'daily' THEN
      v_next_run := (DATE(v_now) + INTERVAL '1 day' + p_time_of_day)::TIMESTAMPTZ;

    WHEN 'weekly' THEN
      v_next_run := (DATE(v_now) +
        ((7 + p_day_of_week - EXTRACT(DOW FROM v_now)::INTEGER) % 7) * INTERVAL '1 day' +
        p_time_of_day)::TIMESTAMPTZ;
      IF v_next_run <= v_now THEN
        v_next_run := v_next_run + INTERVAL '7 days';
      END IF;

    WHEN 'monthly' THEN
      v_next_run := (DATE_TRUNC('month', v_now) +
        (LEAST(p_day_of_month, EXTRACT(DAY FROM (DATE_TRUNC('month', v_now) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER) - 1) * INTERVAL '1 day' +
        p_time_of_day)::TIMESTAMPTZ;
      IF v_next_run <= v_now THEN
        v_next_run := (DATE_TRUNC('month', v_now + INTERVAL '1 month') +
          (LEAST(p_day_of_month, EXTRACT(DAY FROM (DATE_TRUNC('month', v_now + INTERVAL '1 month') + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER) - 1) * INTERVAL '1 day' +
          p_time_of_day)::TIMESTAMPTZ;
      END IF;
  END CASE;

  RETURN v_next_run AT TIME ZONE p_timezone;
END;
$$ LANGUAGE plpgsql;

-- Update goal current value (to be called by triggers or cron)
CREATE OR REPLACE FUNCTION analytics.update_goal_current_value(p_goal_id UUID)
RETURNS VOID AS $$
DECLARE
  v_goal RECORD;
  v_value DECIMAL(15,2);
BEGIN
  SELECT * INTO v_goal FROM analytics.goals WHERE id = p_goal_id;

  IF v_goal IS NULL THEN
    RETURN;
  END IF;

  -- Get cached value for the goal's period
  SELECT value INTO v_value
  FROM analytics.metrics_cache
  WHERE organization_id = v_goal.organization_id
    AND metric_source = v_goal.metric_source
    AND metric_key = v_goal.metric_key
    AND period_start = v_goal.start_date
    AND period_end = v_goal.end_date
  ORDER BY computed_at DESC
  LIMIT 1;

  IF v_value IS NOT NULL THEN
    UPDATE analytics.goals
    SET current_value = v_value
    WHERE id = p_goal_id;

    -- Record progress
    INSERT INTO analytics.goal_progress (goal_id, recorded_at, value)
    VALUES (p_goal_id, CURRENT_DATE, v_value)
    ON CONFLICT (goal_id, recorded_at)
    DO UPDATE SET value = EXCLUDED.value;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ensure only one default dashboard per organization
CREATE OR REPLACE FUNCTION analytics.ensure_single_default_dashboard()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE analytics.dashboards
    SET is_default = false
    WHERE organization_id = NEW.organization_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_dashboard
  BEFORE INSERT OR UPDATE ON analytics.dashboards
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION analytics.ensure_single_default_dashboard();

-- ===========================================
-- GRANTS
-- ===========================================

GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA analytics TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA analytics TO authenticated;
