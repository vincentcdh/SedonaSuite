-- ===========================================
-- SETTINGS MODULE SCHEMA
-- ===========================================
-- User preferences, team invitations, API keys, and data exports

-- ===========================================
-- USER PREFERENCES TABLE
-- ===========================================

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Apparence
  theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
  language VARCHAR(10) DEFAULT 'fr',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(20) DEFAULT 'fr-FR',

  -- Notifications email
  email_notifications BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,

  -- Notifications in-app par type
  notify_mentions BOOLEAN DEFAULT TRUE,
  notify_comments BOOLEAN DEFAULT TRUE,
  notify_assignments BOOLEAN DEFAULT TRUE,
  notify_deals_updates BOOLEAN DEFAULT TRUE,
  notify_invoice_paid BOOLEAN DEFAULT TRUE,
  notify_invoice_overdue BOOLEAN DEFAULT TRUE,
  notify_leave_requests BOOLEAN DEFAULT TRUE,

  -- Interface
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  default_module VARCHAR(50) DEFAULT 'dashboard',
  items_per_page INTEGER DEFAULT 25,

  -- Données
  last_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- TEAM INVITATIONS TABLE
-- ===========================================

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'

  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,

  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'cancelled', 'expired'
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, email)
);

-- ===========================================
-- API KEYS TABLE (PRO)
-- ===========================================

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL, -- First 8 chars for display: "sk_live_Ab"
  key_hash TEXT NOT NULL, -- bcrypt hash of full key

  scopes TEXT[] DEFAULT '{}', -- ['read:contacts', 'write:invoices', etc.]
  rate_limit_per_minute INTEGER DEFAULT 60,

  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DATA EXPORTS TABLE (RGPD)
-- ===========================================

CREATE TABLE public.data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  file_url TEXT,
  file_size_bytes BIGINT,
  expires_at TIMESTAMPTZ,

  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ
);

-- ===========================================
-- USER SESSIONS TABLE
-- ===========================================

CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  session_token TEXT UNIQUE NOT NULL,

  -- Device info
  user_agent TEXT,
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),

  -- Location (approximative via IP)
  ip_address INET,
  city VARCHAR(100),
  country VARCHAR(100),

  -- Status
  is_current BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX idx_invitations_org ON public.invitations(organization_id);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_status ON public.invitations(status) WHERE status = 'pending';
CREATE INDEX idx_api_keys_org ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_active ON public.api_keys(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_data_exports_user ON public.data_exports(user_id);
CREATE INDEX idx_data_exports_status ON public.data_exports(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Updated at trigger for user_preferences
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- User preferences: users can only manage their own
CREATE POLICY "Users can view their preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Invitations: org members can view, admins/owners can manage
CREATE POLICY "Org members can view invitations"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- API keys: org admins/owners can manage
CREATE POLICY "Org members can view API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Data exports: users can only view their own
CREATE POLICY "Users can view their data exports"
  ON public.data_exports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can request data exports"
  ON public.data_exports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User sessions: users can only manage their own
CREATE POLICY "Users can view their sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their sessions"
  ON public.user_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Generate secure random token for invitations
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Auto-expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS VOID AS $$
BEGIN
  UPDATE public.invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Clean up expired data exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.data_exports
  WHERE expires_at < NOW()
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql;
