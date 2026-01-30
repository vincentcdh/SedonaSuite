-- ===========================================
-- DOCS MODULE SCHEMA
-- Migration: 013_docs_schema.sql
-- ===========================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS docs;

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE docs.file_type AS ENUM (
  'document', 'spreadsheet', 'presentation', 'pdf',
  'image', 'video', 'audio', 'archive', 'other'
);

-- ===========================================
-- TABLE: FOLDERS
-- ===========================================

CREATE TABLE docs.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES docs.folders(id) ON DELETE CASCADE,

  -- Materialized path for fast queries (e.g., "/root/folder1/folder2")
  path TEXT NOT NULL DEFAULT '/',
  depth INTEGER DEFAULT 0,

  -- Metadata
  color VARCHAR(7), -- Optional folder color
  icon VARCHAR(50), -- Optional icon

  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Only one folder with this name in the same parent
  UNIQUE(organization_id, parent_id, name)
);

-- ===========================================
-- TABLE: FILES
-- ===========================================

CREATE TABLE docs.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES docs.folders(id) ON DELETE SET NULL,

  -- File info
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL, -- Original name on upload
  extension VARCHAR(20),
  mime_type VARCHAR(100),
  file_type docs.file_type DEFAULT 'other',

  -- Storage
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  size_bytes BIGINT NOT NULL,

  -- Versioning
  current_version INTEGER DEFAULT 1,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Search (PRO - content extracted by OCR/parsing)
  content_text TEXT, -- Extracted text for full-text search

  -- Links with other entities
  linked_entity_type VARCHAR(50), -- 'contact', 'project', 'employee', 'invoice', etc.
  linked_entity_id UUID,

  -- Stats
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Metadata
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: FILE VERSIONS (PRO)
-- ===========================================

CREATE TABLE docs.file_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES docs.files(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,

  -- Changes
  change_summary TEXT, -- Description of the change

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(file_id, version_number)
);

-- ===========================================
-- TABLE: EXTERNAL SHARES (PRO)
-- ===========================================

CREATE TABLE docs.external_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- What is shared (file or folder)
  file_id UUID REFERENCES docs.files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES docs.folders(id) ON DELETE CASCADE,

  -- Share link
  share_token VARCHAR(64) UNIQUE NOT NULL,

  -- Security
  password_hash TEXT, -- Optional: password protection
  expires_at TIMESTAMPTZ,
  max_downloads INTEGER, -- Download limit
  download_count INTEGER DEFAULT 0,

  -- Permissions
  allow_download BOOLEAN DEFAULT TRUE,
  allow_preview BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  -- At least one must be set
  CONSTRAINT share_target CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL)
);

-- ===========================================
-- TABLE: COMMENTS (PRO)
-- ===========================================

CREATE TABLE docs.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES docs.files(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  -- Reply to another comment
  parent_id UUID REFERENCES docs.comments(id) ON DELETE CASCADE,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- TABLE: FAVORITES
-- ===========================================

CREATE TABLE docs.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  file_id UUID REFERENCES docs.files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES docs.folders(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one favorite per user/file or user/folder
  UNIQUE(user_id, file_id),
  UNIQUE(user_id, folder_id),

  CONSTRAINT favorite_target CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL)
);

-- ===========================================
-- TABLE: ACTIVITY LOG
-- ===========================================

CREATE TABLE docs.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  action VARCHAR(50) NOT NULL, -- 'uploaded', 'downloaded', 'renamed', 'moved', 'deleted', 'restored', 'shared', 'commented'

  file_id UUID REFERENCES docs.files(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES docs.folders(id) ON DELETE SET NULL,

  -- Details
  details JSONB, -- Ex: { "old_name": "doc.pdf", "new_name": "document.pdf" }

  -- Metadata
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TABLE: SETTINGS
-- ===========================================

CREATE TABLE docs.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Limits (overrides possible for enterprise)
  max_storage_bytes BIGINT, -- NULL = use plan limit
  max_file_size_bytes BIGINT,

  -- Options
  auto_ocr_enabled BOOLEAN DEFAULT FALSE, -- PRO
  version_retention_days INTEGER DEFAULT 90,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_docs_folders_org ON docs.folders(organization_id);
CREATE INDEX idx_docs_folders_parent ON docs.folders(parent_id);
CREATE INDEX idx_docs_folders_path ON docs.folders(path);

CREATE INDEX idx_docs_files_org ON docs.files(organization_id);
CREATE INDEX idx_docs_files_folder ON docs.files(folder_id);
CREATE INDEX idx_docs_files_type ON docs.files(file_type);
CREATE INDEX idx_docs_files_tags ON docs.files USING GIN(tags);
CREATE INDEX idx_docs_files_linked ON docs.files(linked_entity_type, linked_entity_id);
CREATE INDEX idx_docs_files_search ON docs.files USING GIN(to_tsvector('french', coalesce(name, '') || ' ' || coalesce(content_text, '')));

CREATE INDEX idx_docs_versions_file ON docs.file_versions(file_id);

CREATE INDEX idx_docs_shares_token ON docs.external_shares(share_token);
CREATE INDEX idx_docs_shares_file ON docs.external_shares(file_id);
CREATE INDEX idx_docs_shares_folder ON docs.external_shares(folder_id);

CREATE INDEX idx_docs_comments_file ON docs.comments(file_id);

CREATE INDEX idx_docs_favorites_user ON docs.favorites(user_id);

CREATE INDEX idx_docs_activity_org ON docs.activity_log(organization_id);
CREATE INDEX idx_docs_activity_file ON docs.activity_log(file_id);
CREATE INDEX idx_docs_activity_date ON docs.activity_log(created_at);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Updated_at triggers
CREATE TRIGGER docs_folders_updated_at BEFORE UPDATE ON docs.folders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER docs_files_updated_at BEFORE UPDATE ON docs.files
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER docs_comments_updated_at BEFORE UPDATE ON docs.comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER docs_settings_updated_at BEFORE UPDATE ON docs.settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: Update folder path
CREATE OR REPLACE FUNCTION docs.update_folder_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT;
  parent_depth INTEGER;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := '/' || NEW.id::TEXT;
    NEW.depth := 0;
  ELSE
    SELECT path, depth INTO parent_path, parent_depth
    FROM docs.folders WHERE id = NEW.parent_id;
    NEW.path := parent_path || '/' || NEW.id::TEXT;
    NEW.depth := parent_depth + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER docs_folders_update_path BEFORE INSERT OR UPDATE ON docs.folders
FOR EACH ROW EXECUTE FUNCTION docs.update_folder_path();

-- Trigger: Log file activities
CREATE OR REPLACE FUNCTION docs.log_file_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO docs.activity_log (organization_id, action, file_id, user_id, details)
    VALUES (NEW.organization_id, 'uploaded', NEW.id, NEW.uploaded_by, jsonb_build_object('name', NEW.name, 'size', NEW.size_bytes));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO docs.activity_log (organization_id, action, file_id, user_id)
      VALUES (NEW.organization_id, 'deleted', NEW.id, auth.uid());
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      INSERT INTO docs.activity_log (organization_id, action, file_id, user_id)
      VALUES (NEW.organization_id, 'restored', NEW.id, auth.uid());
    ELSIF OLD.name != NEW.name THEN
      INSERT INTO docs.activity_log (organization_id, action, file_id, user_id, details)
      VALUES (NEW.organization_id, 'renamed', NEW.id, auth.uid(), jsonb_build_object('old_name', OLD.name, 'new_name', NEW.name));
    ELSIF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      INSERT INTO docs.activity_log (organization_id, action, file_id, user_id, details)
      VALUES (NEW.organization_id, 'moved', NEW.id, auth.uid(), jsonb_build_object('from_folder', OLD.folder_id, 'to_folder', NEW.folder_id));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER docs_files_activity_log AFTER INSERT OR UPDATE ON docs.files
FOR EACH ROW EXECUTE FUNCTION docs.log_file_activity();

-- Create default settings for new org
CREATE OR REPLACE FUNCTION docs.create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO docs.settings (organization_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
