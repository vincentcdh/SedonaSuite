-- ===========================================
-- DOCS MODULE ENHANCEMENTS
-- Migration: 022_docs_enhancements.sql
-- ===========================================

-- ===========================================
-- UPDATE SETTINGS: Add file size limits
-- ===========================================

-- Add allowed file types and size limits
ALTER TABLE docs.settings ADD COLUMN IF NOT EXISTS allowed_extensions TEXT[] DEFAULT ARRAY[
  -- Documents
  'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt',
  -- Spreadsheets
  'xls', 'xlsx', 'ods', 'csv',
  -- Presentations
  'ppt', 'pptx', 'odp',
  -- Images
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
  -- Archives
  'zip', 'rar', '7z', 'tar', 'gz',
  -- Audio
  'mp3', 'wav', 'ogg', 'flac', 'aac',
  -- Video
  'mp4', 'avi', 'mov', 'mkv', 'webm',
  -- Other
  'json', 'xml', 'html', 'css', 'js', 'md'
];

-- Default max file size: 50MB
ALTER TABLE docs.settings ALTER COLUMN max_file_size_bytes SET DEFAULT 52428800;

-- Default max storage: 5GB
ALTER TABLE docs.settings ALTER COLUMN max_storage_bytes SET DEFAULT 5368709120;

-- Add blocked extensions (security)
ALTER TABLE docs.settings ADD COLUMN IF NOT EXISTS blocked_extensions TEXT[] DEFAULT ARRAY[
  'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'jar', 'msi', 'dll', 'scr', 'com'
];

-- Add upload options
ALTER TABLE docs.settings ADD COLUMN IF NOT EXISTS require_description BOOLEAN DEFAULT FALSE;
ALTER TABLE docs.settings ADD COLUMN IF NOT EXISTS auto_generate_thumbnails BOOLEAN DEFAULT TRUE;
ALTER TABLE docs.settings ADD COLUMN IF NOT EXISTS enable_virus_scan BOOLEAN DEFAULT TRUE;

-- ===========================================
-- ADD FILE THUMBNAILS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS docs.file_thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES docs.files(id) ON DELETE CASCADE,

  -- Thumbnail sizes
  size VARCHAR(20) NOT NULL, -- 'small' (100x100), 'medium' (300x300), 'large' (600x600)
  storage_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(file_id, size)
);

CREATE INDEX IF NOT EXISTS idx_docs_thumbnails_file ON docs.file_thumbnails(file_id);

-- ===========================================
-- ADD FILE PREVIEW SUPPORT
-- ===========================================

-- Add preview URL for files that can be previewed in browser
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS can_preview BOOLEAN DEFAULT FALSE;

-- ===========================================
-- UPDATE FILES TABLE: Add more metadata
-- ===========================================

-- Add checksum for duplicate detection
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS checksum VARCHAR(64);

-- Add dimensions for images/videos
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS duration_seconds INTEGER; -- For audio/video

-- Add page count for documents
ALTER TABLE docs.files ADD COLUMN IF NOT EXISTS page_count INTEGER;

-- Index for duplicate detection
CREATE INDEX IF NOT EXISTS idx_docs_files_checksum ON docs.files(organization_id, checksum) WHERE checksum IS NOT NULL;

-- ===========================================
-- ADD FOLDER SIZE TRACKING
-- ===========================================

-- Add computed size to folders (updated by trigger)
ALTER TABLE docs.folders ADD COLUMN IF NOT EXISTS total_size_bytes BIGINT DEFAULT 0;
ALTER TABLE docs.folders ADD COLUMN IF NOT EXISTS file_count INTEGER DEFAULT 0;

-- ===========================================
-- FUNCTION: Update folder stats
-- ===========================================

CREATE OR REPLACE FUNCTION docs.update_folder_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_folder_id UUID;
  v_old_folder_id UUID;
BEGIN
  -- Determine which folder(s) to update
  IF TG_OP = 'INSERT' THEN
    v_folder_id := NEW.folder_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_folder_id := NEW.folder_id;
    v_old_folder_id := OLD.folder_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_folder_id := OLD.folder_id;
  END IF;

  -- Update new folder stats
  IF v_folder_id IS NOT NULL THEN
    UPDATE docs.folders
    SET
      total_size_bytes = COALESCE((
        SELECT SUM(size_bytes)
        FROM docs.files
        WHERE folder_id = v_folder_id
        AND deleted_at IS NULL
      ), 0),
      file_count = COALESCE((
        SELECT COUNT(*)
        FROM docs.files
        WHERE folder_id = v_folder_id
        AND deleted_at IS NULL
      ), 0)
    WHERE id = v_folder_id;
  END IF;

  -- Update old folder stats (for moves)
  IF v_old_folder_id IS NOT NULL AND v_old_folder_id IS DISTINCT FROM v_folder_id THEN
    UPDATE docs.folders
    SET
      total_size_bytes = COALESCE((
        SELECT SUM(size_bytes)
        FROM docs.files
        WHERE folder_id = v_old_folder_id
        AND deleted_at IS NULL
      ), 0),
      file_count = COALESCE((
        SELECT COUNT(*)
        FROM docs.files
        WHERE folder_id = v_old_folder_id
        AND deleted_at IS NULL
      ), 0)
    WHERE id = v_old_folder_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for folder stats
DROP TRIGGER IF EXISTS docs_files_update_folder_stats ON docs.files;
CREATE TRIGGER docs_files_update_folder_stats
AFTER INSERT OR UPDATE OF folder_id, size_bytes, deleted_at OR DELETE ON docs.files
FOR EACH ROW EXECUTE FUNCTION docs.update_folder_stats();

-- ===========================================
-- FUNCTION: Check file size limit
-- ===========================================

CREATE OR REPLACE FUNCTION docs.check_file_size_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_max_file_size BIGINT;
  v_max_storage BIGINT;
  v_current_storage BIGINT;
BEGIN
  -- Get settings
  SELECT max_file_size_bytes, max_storage_bytes INTO v_max_file_size, v_max_storage
  FROM docs.settings
  WHERE organization_id = NEW.organization_id;

  -- Default limits if no settings
  IF v_max_file_size IS NULL THEN
    v_max_file_size := 52428800; -- 50MB
  END IF;
  IF v_max_storage IS NULL THEN
    v_max_storage := 5368709120; -- 5GB
  END IF;

  -- Check file size
  IF NEW.size_bytes > v_max_file_size THEN
    RAISE EXCEPTION 'File size (% bytes) exceeds maximum allowed (% bytes)', NEW.size_bytes, v_max_file_size;
  END IF;

  -- Check total storage
  SELECT COALESCE(SUM(size_bytes), 0) INTO v_current_storage
  FROM docs.files
  WHERE organization_id = NEW.organization_id
  AND deleted_at IS NULL
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  IF (v_current_storage + NEW.size_bytes) > v_max_storage THEN
    RAISE EXCEPTION 'Storage limit exceeded. Current: % bytes, Limit: % bytes', v_current_storage + NEW.size_bytes, v_max_storage;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for size check
DROP TRIGGER IF EXISTS docs_files_check_size ON docs.files;
CREATE TRIGGER docs_files_check_size
BEFORE INSERT OR UPDATE OF size_bytes ON docs.files
FOR EACH ROW EXECUTE FUNCTION docs.check_file_size_limit();

-- ===========================================
-- FUNCTION: Detect file type from extension
-- ===========================================

CREATE OR REPLACE FUNCTION docs.detect_file_type(extension VARCHAR)
RETURNS docs.file_type AS $$
BEGIN
  RETURN CASE LOWER(extension)
    -- Documents
    WHEN 'doc' THEN 'document'
    WHEN 'docx' THEN 'document'
    WHEN 'odt' THEN 'document'
    WHEN 'rtf' THEN 'document'
    WHEN 'txt' THEN 'document'
    WHEN 'md' THEN 'document'
    -- Spreadsheets
    WHEN 'xls' THEN 'spreadsheet'
    WHEN 'xlsx' THEN 'spreadsheet'
    WHEN 'ods' THEN 'spreadsheet'
    WHEN 'csv' THEN 'spreadsheet'
    -- Presentations
    WHEN 'ppt' THEN 'presentation'
    WHEN 'pptx' THEN 'presentation'
    WHEN 'odp' THEN 'presentation'
    -- PDF
    WHEN 'pdf' THEN 'pdf'
    -- Images
    WHEN 'jpg' THEN 'image'
    WHEN 'jpeg' THEN 'image'
    WHEN 'png' THEN 'image'
    WHEN 'gif' THEN 'image'
    WHEN 'webp' THEN 'image'
    WHEN 'svg' THEN 'image'
    WHEN 'bmp' THEN 'image'
    WHEN 'ico' THEN 'image'
    -- Videos
    WHEN 'mp4' THEN 'video'
    WHEN 'avi' THEN 'video'
    WHEN 'mov' THEN 'video'
    WHEN 'mkv' THEN 'video'
    WHEN 'webm' THEN 'video'
    -- Audio
    WHEN 'mp3' THEN 'audio'
    WHEN 'wav' THEN 'audio'
    WHEN 'ogg' THEN 'audio'
    WHEN 'flac' THEN 'audio'
    WHEN 'aac' THEN 'audio'
    -- Archives
    WHEN 'zip' THEN 'archive'
    WHEN 'rar' THEN 'archive'
    WHEN '7z' THEN 'archive'
    WHEN 'tar' THEN 'archive'
    WHEN 'gz' THEN 'archive'
    -- Default
    ELSE 'other'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===========================================
-- TRIGGER: Auto-set file type from extension
-- ===========================================

CREATE OR REPLACE FUNCTION docs.set_file_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extension IS NOT NULL AND (NEW.file_type IS NULL OR NEW.file_type = 'other') THEN
    NEW.file_type := docs.detect_file_type(NEW.extension);
  END IF;

  -- Set can_preview based on file type
  NEW.can_preview := NEW.file_type IN ('pdf', 'image', 'document', 'spreadsheet');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS docs_files_set_type ON docs.files;
CREATE TRIGGER docs_files_set_type
BEFORE INSERT OR UPDATE OF extension ON docs.files
FOR EACH ROW EXECUTE FUNCTION docs.set_file_type();

-- ===========================================
-- VIEW: Storage stats per organization
-- ===========================================

CREATE OR REPLACE VIEW docs.storage_stats AS
SELECT
  f.organization_id,
  COUNT(DISTINCT f.id) AS file_count,
  COUNT(DISTINCT fo.id) AS folder_count,
  COALESCE(SUM(f.size_bytes), 0) AS used_bytes,
  s.max_storage_bytes AS limit_bytes,
  ROUND(COALESCE(SUM(f.size_bytes), 0)::NUMERIC / NULLIF(s.max_storage_bytes, 0) * 100, 2) AS usage_percentage,
  -- By file type
  COUNT(DISTINCT CASE WHEN f.file_type = 'document' THEN f.id END) AS document_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'image' THEN f.id END) AS image_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'pdf' THEN f.id END) AS pdf_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'video' THEN f.id END) AS video_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'audio' THEN f.id END) AS audio_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'archive' THEN f.id END) AS archive_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'spreadsheet' THEN f.id END) AS spreadsheet_count,
  COUNT(DISTINCT CASE WHEN f.file_type = 'presentation' THEN f.id END) AS presentation_count
FROM docs.files f
LEFT JOIN docs.folders fo ON fo.organization_id = f.organization_id AND fo.deleted_at IS NULL
LEFT JOIN docs.settings s ON s.organization_id = f.organization_id
WHERE f.deleted_at IS NULL
GROUP BY f.organization_id, s.max_storage_bytes;

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON TABLE docs.file_thumbnails IS 'Thumbnails for image/video files';
COMMENT ON VIEW docs.storage_stats IS 'Storage usage statistics per organization';
COMMENT ON FUNCTION docs.detect_file_type IS 'Detect file type from extension';
COMMENT ON FUNCTION docs.check_file_size_limit IS 'Check file size against organization limits';
COMMENT ON FUNCTION docs.update_folder_stats IS 'Update folder size and file count';
