-- ===========================================
-- DOCS MODULE RLS POLICIES
-- Migration: 014_docs_rls.sql
-- ===========================================

-- ===========================================
-- ENABLE RLS
-- ===========================================

ALTER TABLE docs.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.external_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs.settings ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- FOLDERS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org folders"
  ON docs.folders FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can create folders in their org"
  ON docs.folders FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org folders"
  ON docs.folders FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their org folders"
  ON docs.folders FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- FILES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org files"
  ON docs.files FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can create files in their org"
  ON docs.files FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org files"
  ON docs.files FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their org files"
  ON docs.files FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- FILE VERSIONS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org file versions"
  ON docs.file_versions FOR SELECT
  USING (file_id IN (SELECT id FROM docs.files WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))));

CREATE POLICY "Users can create file versions in their org"
  ON docs.file_versions FOR INSERT
  WITH CHECK (file_id IN (SELECT id FROM docs.files WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))));

CREATE POLICY "Users can delete their org file versions"
  ON docs.file_versions FOR DELETE
  USING (file_id IN (SELECT id FROM docs.files WHERE organization_id IN (SELECT get_user_organizations(auth.uid()))));

-- ===========================================
-- EXTERNAL SHARES POLICIES
-- ===========================================

CREATE POLICY "Users can view their org shares"
  ON docs.external_shares FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can create shares in their org"
  ON docs.external_shares FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org shares"
  ON docs.external_shares FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can delete their org shares"
  ON docs.external_shares FOR DELETE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- ===========================================
-- COMMENTS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org comments"
  ON docs.comments FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can create comments in their org"
  ON docs.comments FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their own comments"
  ON docs.comments FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON docs.comments FOR DELETE
  USING (created_by = auth.uid());

-- ===========================================
-- FAVORITES POLICIES
-- ===========================================

CREATE POLICY "Users can view their own favorites"
  ON docs.favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own favorites"
  ON docs.favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
  ON docs.favorites FOR DELETE
  USING (user_id = auth.uid());

-- ===========================================
-- ACTIVITY LOG POLICIES
-- ===========================================

CREATE POLICY "Users can view their org activity"
  ON docs.activity_log FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

-- Activity log is insert-only from triggers, no direct insert policy needed for users

-- ===========================================
-- SETTINGS POLICIES
-- ===========================================

CREATE POLICY "Users can view their org settings"
  ON docs.settings FOR SELECT
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));

CREATE POLICY "Users can update their org settings"
  ON docs.settings FOR UPDATE
  USING (organization_id IN (SELECT get_user_organizations(auth.uid())));
