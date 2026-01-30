-- ===========================================
-- CRM MODULE SCHEMA
-- ===========================================

-- Create CRM schema
CREATE SCHEMA IF NOT EXISTS crm;

-- ===========================================
-- COMPANIES (must be created before contacts)
-- ===========================================

CREATE TABLE crm.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  siret VARCHAR(20),
  website VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'

  -- Adresse
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',

  -- Contact principal
  phone VARCHAR(50),
  email VARCHAR(255),

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- CONTACTS
-- ===========================================

CREATE TABLE crm.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Infos principales
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  job_title VARCHAR(100),

  -- Rattachements
  company_id UUID REFERENCES crm.companies(id) ON DELETE SET NULL,

  -- Source & Acquisition
  source VARCHAR(50), -- 'website', 'referral', 'linkedin', 'manual', etc.
  source_details TEXT,

  -- Adresse
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',

  -- Custom fields (JSONB)
  custom_fields JSONB DEFAULT '{}',

  -- Tags (array)
  tags TEXT[] DEFAULT '{}',

  -- Metadata
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Contrainte unicite email par org
  UNIQUE(organization_id, email)
);

-- ===========================================
-- PIPELINES
-- ===========================================

CREATE TABLE crm.pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- PIPELINE STAGES
-- ===========================================

CREATE TABLE crm.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES crm.pipelines(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',
  position INTEGER NOT NULL,
  probability INTEGER DEFAULT 0, -- 0-100%

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DEALS / OPPORTUNITES
-- ===========================================

CREATE TABLE crm.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES crm.pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES crm.pipeline_stages(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  probability INTEGER, -- Override de la stage
  expected_close_date DATE,

  -- Rattachements
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm.companies(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'won', 'lost'
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,

  -- Metadata
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- ACTIVITIES
-- ===========================================

CREATE TABLE crm.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL, -- 'call', 'email', 'meeting', 'task', 'note'
  subject VARCHAR(255) NOT NULL,
  description TEXT,

  -- Rattachements (au moins un requis)
  contact_id UUID REFERENCES crm.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES crm.companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm.deals(id) ON DELETE CASCADE,

  -- Pour les taches/reunions
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- CUSTOM FIELD DEFINITIONS
-- ===========================================

CREATE TABLE crm.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  entity_type VARCHAR(20) NOT NULL, -- 'contact', 'company', 'deal'
  name VARCHAR(100) NOT NULL,
  field_key VARCHAR(100) NOT NULL, -- Cle dans le JSONB
  field_type VARCHAR(20) NOT NULL, -- 'text', 'number', 'date', 'select', 'multiselect', 'boolean'
  options JSONB, -- Pour select/multiselect
  is_required BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, entity_type, field_key)
);

-- ===========================================
-- TAGS
-- ===========================================

CREATE TABLE crm.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#0c82d6',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, name)
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_contacts_org ON crm.contacts(organization_id);
CREATE INDEX idx_contacts_company ON crm.contacts(company_id);
CREATE INDEX idx_contacts_email ON crm.contacts(email);
CREATE INDEX idx_contacts_tags ON crm.contacts USING GIN(tags);
CREATE INDEX idx_contacts_deleted ON crm.contacts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_search ON crm.contacts(organization_id, first_name, last_name, email);

CREATE INDEX idx_companies_org ON crm.companies(organization_id);
CREATE INDEX idx_companies_name ON crm.companies(organization_id, name);
CREATE INDEX idx_companies_deleted ON crm.companies(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_pipelines_org ON crm.pipelines(organization_id);
CREATE INDEX idx_pipelines_default ON crm.pipelines(organization_id, is_default) WHERE is_default = TRUE;

CREATE INDEX idx_pipeline_stages_pipeline ON crm.pipeline_stages(pipeline_id);
CREATE INDEX idx_pipeline_stages_position ON crm.pipeline_stages(pipeline_id, position);

CREATE INDEX idx_deals_org ON crm.deals(organization_id);
CREATE INDEX idx_deals_pipeline ON crm.deals(pipeline_id);
CREATE INDEX idx_deals_stage ON crm.deals(stage_id);
CREATE INDEX idx_deals_status ON crm.deals(organization_id, status);
CREATE INDEX idx_deals_deleted ON crm.deals(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_activities_org ON crm.activities(organization_id);
CREATE INDEX idx_activities_contact ON crm.activities(contact_id);
CREATE INDEX idx_activities_company ON crm.activities(company_id);
CREATE INDEX idx_activities_deal ON crm.activities(deal_id);
CREATE INDEX idx_activities_type ON crm.activities(organization_id, type);
CREATE INDEX idx_activities_due ON crm.activities(due_date) WHERE completed_at IS NULL;

CREATE INDEX idx_custom_fields_org ON crm.custom_field_definitions(organization_id);
CREATE INDEX idx_custom_fields_entity ON crm.custom_field_definitions(organization_id, entity_type);

CREATE INDEX idx_tags_org ON crm.tags(organization_id);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON crm.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_companies_updated_at
  BEFORE UPDATE ON crm.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_pipelines_updated_at
  BEFORE UPDATE ON crm.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_pipeline_stages_updated_at
  BEFORE UPDATE ON crm.pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON crm.deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON crm.activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
