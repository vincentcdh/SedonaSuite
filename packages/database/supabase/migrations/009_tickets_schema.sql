-- ===========================================
-- TICKETS MODULE SCHEMA
-- ===========================================

-- Create tickets schema
CREATE SCHEMA IF NOT EXISTS tickets;

-- ===========================================
-- TICKET CATEGORIES TABLE
-- ===========================================

CREATE TABLE tickets.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  icon VARCHAR(50) DEFAULT 'tag',

  -- Parent category for hierarchy
  parent_id UUID REFERENCES tickets.categories(id) ON DELETE SET NULL,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, name)
);

-- ===========================================
-- SLA POLICIES TABLE (PRO feature)
-- ===========================================

CREATE TABLE tickets.sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Targets (in minutes)
  first_response_time INTEGER, -- Time to first response
  resolution_time INTEGER, -- Time to resolution

  -- Priority-based targets (overrides defaults)
  urgent_first_response INTEGER,
  urgent_resolution INTEGER,
  high_first_response INTEGER,
  high_resolution INTEGER,
  normal_first_response INTEGER,
  normal_resolution INTEGER,
  low_first_response INTEGER,
  low_resolution INTEGER,

  -- Business hours
  business_hours_only BOOLEAN DEFAULT true,
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '18:00',
  business_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, name)
);

-- ===========================================
-- TICKETS TABLE
-- ===========================================

CREATE TABLE tickets.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Ticket number (auto-generated)
  ticket_number VARCHAR(20) NOT NULL,

  -- Basic info
  subject VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status and priority
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Assignment
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Category
  category_id UUID REFERENCES tickets.categories(id) ON DELETE SET NULL,

  -- SLA
  sla_policy_id UUID REFERENCES tickets.sla_policies(id) ON DELETE SET NULL,
  sla_first_response_due TIMESTAMPTZ,
  sla_resolution_due TIMESTAMPTZ,
  sla_first_response_at TIMESTAMPTZ,
  sla_resolved_at TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,

  -- Source
  source VARCHAR(20) DEFAULT 'web' CHECK (source IN ('web', 'email', 'api', 'phone', 'chat')),
  source_email VARCHAR(255),
  source_message_id VARCHAR(255), -- For email threading

  -- Requester (can be external or linked to CRM)
  requester_name VARCHAR(255),
  requester_email VARCHAR(255),
  requester_phone VARCHAR(50),
  contact_id UUID, -- Link to CRM contact
  company_id UUID, -- Link to CRM company

  -- Satisfaction
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_comment TEXT,
  satisfaction_rated_at TIMESTAMPTZ,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- ===========================================
-- TICKET MESSAGES TABLE
-- ===========================================

CREATE TABLE tickets.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets.tickets(id) ON DELETE CASCADE,

  -- Author
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('agent', 'customer', 'system')),
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),

  -- Content
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'html')),

  -- Type
  message_type VARCHAR(20) DEFAULT 'reply' CHECK (message_type IN ('reply', 'note', 'status_change', 'assignment')),
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer

  -- Email metadata
  email_message_id VARCHAR(255),
  email_in_reply_to VARCHAR(255),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

-- ===========================================
-- TICKET ATTACHMENTS TABLE
-- ===========================================

CREATE TABLE tickets.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES tickets.messages(id) ON DELETE CASCADE,

  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100),
  storage_path VARCHAR(500) NOT NULL,

  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TICKET TAGS TABLE
-- ===========================================

CREATE TABLE tickets.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, name)
);

-- ===========================================
-- TICKET WATCHERS TABLE
-- ===========================================

CREATE TABLE tickets.watchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ticket_id, user_id)
);

-- ===========================================
-- CANNED RESPONSES TABLE
-- ===========================================

CREATE TABLE tickets.canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),

  -- Scope
  is_personal BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Shortcuts
  shortcut VARCHAR(50), -- e.g., /thanks, /closing

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- AUTOMATION RULES TABLE (PRO feature)
-- ===========================================

CREATE TABLE tickets.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Trigger
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('ticket_created', 'ticket_updated', 'message_received', 'sla_breach', 'schedule')),

  -- Conditions (JSON array)
  conditions JSONB NOT NULL DEFAULT '[]',

  -- Actions (JSON array)
  actions JSONB NOT NULL DEFAULT '[]',

  -- Settings
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Execution order

  -- Stats
  times_triggered INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TICKET ACTIVITY LOG TABLE
-- ===========================================

CREATE TABLE tickets.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets.tickets(id) ON DELETE CASCADE,

  activity_type VARCHAR(50) NOT NULL, -- created, status_changed, assigned, priority_changed, etc.
  description TEXT,

  -- Changes
  old_value TEXT,
  new_value TEXT,
  field_name VARCHAR(50),

  -- Actor
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'automation')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- KNOWLEDGE BASE ARTICLES TABLE (PRO feature)
-- ===========================================

CREATE TABLE tickets.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,

  category_id UUID REFERENCES tickets.categories(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Stats
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, slug)
);

-- ===========================================
-- TICKET NUMBER SEQUENCE
-- ===========================================

CREATE TABLE tickets.number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  prefix VARCHAR(10) DEFAULT 'TKT',
  current_number INTEGER DEFAULT 0,
  padding INTEGER DEFAULT 5,

  UNIQUE(organization_id)
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Tickets
CREATE INDEX idx_tickets_organization ON tickets.tickets(organization_id);
CREATE INDEX idx_tickets_status ON tickets.tickets(status);
CREATE INDEX idx_tickets_priority ON tickets.tickets(priority);
CREATE INDEX idx_tickets_assigned ON tickets.tickets(assigned_to);
CREATE INDEX idx_tickets_category ON tickets.tickets(category_id);
CREATE INDEX idx_tickets_requester_email ON tickets.tickets(requester_email);
CREATE INDEX idx_tickets_created ON tickets.tickets(created_at);
CREATE INDEX idx_tickets_number ON tickets.tickets(ticket_number);
CREATE INDEX idx_tickets_sla_breach ON tickets.tickets(sla_breached) WHERE sla_breached = true;

-- Messages
CREATE INDEX idx_messages_ticket ON tickets.messages(ticket_id);
CREATE INDEX idx_messages_author ON tickets.messages(author_id);
CREATE INDEX idx_messages_created ON tickets.messages(created_at);

-- Activity log
CREATE INDEX idx_activity_ticket ON tickets.activity_log(ticket_id);
CREATE INDEX idx_activity_created ON tickets.activity_log(created_at);

-- KB Articles
CREATE INDEX idx_kb_articles_org ON tickets.kb_articles(organization_id);
CREATE INDEX idx_kb_articles_status ON tickets.kb_articles(status);
CREATE INDEX idx_kb_articles_slug ON tickets.kb_articles(slug);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON tickets.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON tickets.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sla_policies_updated_at
  BEFORE UPDATE ON tickets.sla_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canned_responses_updated_at
  BEFORE UPDATE ON tickets.canned_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON tickets.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON tickets.kb_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- FUNCTION: GET NEXT TICKET NUMBER
-- ===========================================

CREATE OR REPLACE FUNCTION tickets.get_next_ticket_number(org_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  seq RECORD;
  next_num INTEGER;
  result VARCHAR;
BEGIN
  -- Get or create sequence for organization
  INSERT INTO tickets.number_sequences (organization_id)
  VALUES (org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Update and get next number
  UPDATE tickets.number_sequences
  SET current_number = current_number + 1
  WHERE organization_id = org_id
  RETURNING prefix, current_number, padding INTO seq;

  -- Format the number
  result := seq.prefix || '-' || LPAD(seq.current_number::TEXT, seq.padding, '0');

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- FUNCTION: AUTO-SET TICKET NUMBER
-- ===========================================

CREATE OR REPLACE FUNCTION tickets.set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := tickets.get_next_ticket_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_on_insert
  BEFORE INSERT ON tickets.tickets
  FOR EACH ROW EXECUTE FUNCTION tickets.set_ticket_number();

-- ===========================================
-- FUNCTION: UPDATE TICKET ON MESSAGE
-- ===========================================

CREATE OR REPLACE FUNCTION tickets.update_ticket_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update first response time if this is the first agent reply
  IF NEW.author_type = 'agent' AND NEW.message_type = 'reply' THEN
    UPDATE tickets.tickets
    SET
      first_response_at = COALESCE(first_response_at, NOW()),
      sla_first_response_at = COALESCE(sla_first_response_at, NOW()),
      status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
    WHERE id = NEW.ticket_id
    AND first_response_at IS NULL;
  END IF;

  -- If customer replies to a resolved/closed ticket, reopen it
  IF NEW.author_type = 'customer' THEN
    UPDATE tickets.tickets
    SET status = 'open', resolved_at = NULL, closed_at = NULL
    WHERE id = NEW.ticket_id
    AND status IN ('resolved', 'closed');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_on_new_message
  AFTER INSERT ON tickets.messages
  FOR EACH ROW EXECUTE FUNCTION tickets.update_ticket_on_message();

-- ===========================================
-- FUNCTION: LOG TICKET ACTIVITY
-- ===========================================

CREATE OR REPLACE FUNCTION tickets.log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO tickets.activity_log (ticket_id, activity_type, field_name, old_value, new_value)
    VALUES (NEW.id, 'status_changed', 'status', OLD.status, NEW.status);

    -- Update resolved_at/closed_at
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
      NEW.resolved_at := NOW();
      NEW.sla_resolved_at := NOW();
    ELSIF NEW.status = 'closed' AND OLD.status != 'closed' THEN
      NEW.closed_at := NOW();
    END IF;
  END IF;

  -- Assignment change
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO tickets.activity_log (ticket_id, activity_type, field_name, old_value, new_value)
    VALUES (NEW.id, 'assigned', 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);

    NEW.assigned_at := NOW();
  END IF;

  -- Priority change
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO tickets.activity_log (ticket_id, activity_type, field_name, old_value, new_value)
    VALUES (NEW.id, 'priority_changed', 'priority', OLD.priority, NEW.priority);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_ticket_changes_on_update
  BEFORE UPDATE ON tickets.tickets
  FOR EACH ROW EXECUTE FUNCTION tickets.log_ticket_changes();

-- ===========================================
-- VIEWS
-- ===========================================

-- Ticket stats view
CREATE OR REPLACE VIEW tickets.ticket_stats AS
SELECT
  t.organization_id,
  COUNT(*) AS total_tickets,
  COUNT(*) FILTER (WHERE t.status = 'open') AS open_tickets,
  COUNT(*) FILTER (WHERE t.status = 'in_progress') AS in_progress_tickets,
  COUNT(*) FILTER (WHERE t.status = 'waiting') AS waiting_tickets,
  COUNT(*) FILTER (WHERE t.status = 'resolved') AS resolved_tickets,
  COUNT(*) FILTER (WHERE t.status = 'closed') AS closed_tickets,
  COUNT(*) FILTER (WHERE t.sla_breached = true) AS sla_breached_tickets,
  COUNT(*) FILTER (WHERE t.created_at >= NOW() - INTERVAL '24 hours') AS created_last_24h,
  COUNT(*) FILTER (WHERE t.resolved_at >= NOW() - INTERVAL '24 hours') AS resolved_last_24h,
  AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at)) / 60) FILTER (WHERE t.first_response_at IS NOT NULL) AS avg_first_response_minutes,
  AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60) FILTER (WHERE t.resolved_at IS NOT NULL) AS avg_resolution_minutes,
  AVG(t.satisfaction_rating) FILTER (WHERE t.satisfaction_rating IS NOT NULL) AS avg_satisfaction
FROM tickets.tickets t
GROUP BY t.organization_id;

-- Agent workload view
CREATE OR REPLACE VIEW tickets.agent_workload AS
SELECT
  t.organization_id,
  t.assigned_to AS agent_id,
  COUNT(*) AS total_assigned,
  COUNT(*) FILTER (WHERE t.status NOT IN ('resolved', 'closed')) AS open_assigned,
  COUNT(*) FILTER (WHERE t.priority = 'urgent') AS urgent_tickets,
  COUNT(*) FILTER (WHERE t.sla_breached = true AND t.status NOT IN ('resolved', 'closed')) AS breached_tickets,
  AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60) FILTER (WHERE t.resolved_at IS NOT NULL) AS avg_resolution_minutes
FROM tickets.tickets t
WHERE t.assigned_to IS NOT NULL
GROUP BY t.organization_id, t.assigned_to;
