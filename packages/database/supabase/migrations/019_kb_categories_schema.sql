-- ===========================================
-- KB CATEGORIES INDEPENDENT TABLE
-- ===========================================
-- This creates a dedicated table for KB article categories,
-- separate from ticket categories

-- ===========================================
-- KB CATEGORIES TABLE
-- ===========================================

CREATE TABLE tickets.kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  icon VARCHAR(50) DEFAULT 'folder',

  -- Settings
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, name)
);

-- ===========================================
-- UPDATE KB ARTICLES TO USE NEW TABLE
-- ===========================================

-- Add new column for kb_category_id
ALTER TABLE tickets.kb_articles
  ADD COLUMN kb_category_id UUID REFERENCES tickets.kb_categories(id) ON DELETE SET NULL;

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_kb_categories_org ON tickets.kb_categories(organization_id);
CREATE INDEX idx_kb_categories_active ON tickets.kb_categories(is_active);
CREATE INDEX idx_kb_articles_kb_category ON tickets.kb_articles(kb_category_id);

-- ===========================================
-- TRIGGER FOR UPDATED_AT
-- ===========================================

CREATE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON tickets.kb_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE tickets.kb_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view kb categories"
  ON tickets.kb_categories FOR SELECT
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can manage kb categories"
  ON tickets.kb_categories FOR ALL
  USING (tickets.user_in_organization(organization_id, auth.uid()));
