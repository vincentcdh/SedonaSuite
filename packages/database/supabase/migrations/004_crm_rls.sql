-- ===========================================
-- CRM MODULE RLS POLICIES
-- ===========================================

-- Enable RLS on all CRM tables
ALTER TABLE crm.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.tags ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CONTACTS POLICIES
-- ===========================================

CREATE POLICY "Users can view contacts in their organizations"
  ON crm.contacts FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert contacts in their organizations"
  ON crm.contacts FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update contacts in their organizations"
  ON crm.contacts FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete contacts in their organizations"
  ON crm.contacts FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- COMPANIES POLICIES
-- ===========================================

CREATE POLICY "Users can view companies in their organizations"
  ON crm.companies FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert companies in their organizations"
  ON crm.companies FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update companies in their organizations"
  ON crm.companies FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete companies in their organizations"
  ON crm.companies FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- PIPELINES POLICIES
-- ===========================================

CREATE POLICY "Users can view pipelines in their organizations"
  ON crm.pipelines FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert pipelines in their organizations"
  ON crm.pipelines FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update pipelines in their organizations"
  ON crm.pipelines FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete pipelines in their organizations"
  ON crm.pipelines FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- PIPELINE STAGES POLICIES
-- ===========================================

CREATE POLICY "Users can view pipeline stages in their organizations"
  ON crm.pipeline_stages FOR SELECT
  USING (pipeline_id IN (
    SELECT id FROM crm.pipelines
    WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
  ));

CREATE POLICY "Users can insert pipeline stages in their organizations"
  ON crm.pipeline_stages FOR INSERT
  WITH CHECK (pipeline_id IN (
    SELECT id FROM crm.pipelines
    WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
  ));

CREATE POLICY "Users can update pipeline stages in their organizations"
  ON crm.pipeline_stages FOR UPDATE
  USING (pipeline_id IN (
    SELECT id FROM crm.pipelines
    WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
  ))
  WITH CHECK (pipeline_id IN (
    SELECT id FROM crm.pipelines
    WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
  ));

CREATE POLICY "Users can delete pipeline stages in their organizations"
  ON crm.pipeline_stages FOR DELETE
  USING (pipeline_id IN (
    SELECT id FROM crm.pipelines
    WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))
  ));

-- ===========================================
-- DEALS POLICIES
-- ===========================================

CREATE POLICY "Users can view deals in their organizations"
  ON crm.deals FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert deals in their organizations"
  ON crm.deals FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update deals in their organizations"
  ON crm.deals FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete deals in their organizations"
  ON crm.deals FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- ACTIVITIES POLICIES
-- ===========================================

CREATE POLICY "Users can view activities in their organizations"
  ON crm.activities FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert activities in their organizations"
  ON crm.activities FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update activities in their organizations"
  ON crm.activities FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete activities in their organizations"
  ON crm.activities FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- CUSTOM FIELD DEFINITIONS POLICIES
-- ===========================================

CREATE POLICY "Users can view custom fields in their organizations"
  ON crm.custom_field_definitions FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert custom fields in their organizations"
  ON crm.custom_field_definitions FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update custom fields in their organizations"
  ON crm.custom_field_definitions FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete custom fields in their organizations"
  ON crm.custom_field_definitions FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- TAGS POLICIES
-- ===========================================

CREATE POLICY "Users can view tags in their organizations"
  ON crm.tags FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can insert tags in their organizations"
  ON crm.tags FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update tags in their organizations"
  ON crm.tags FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())))
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete tags in their organizations"
  ON crm.tags FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));
