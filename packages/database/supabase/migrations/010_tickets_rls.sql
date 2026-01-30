-- ===========================================
-- TICKETS MODULE - ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE tickets.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets.number_sequences ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- HELPER FUNCTION: Check organization membership
-- ===========================================

CREATE OR REPLACE FUNCTION tickets.user_in_organization(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE organization_id = org_id AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- CATEGORIES POLICIES
-- ===========================================

CREATE POLICY "Org members can view categories"
  ON tickets.categories FOR SELECT
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can manage categories"
  ON tickets.categories FOR ALL
  USING (tickets.user_in_organization(organization_id, auth.uid()));

-- ===========================================
-- SLA POLICIES POLICIES
-- ===========================================

CREATE POLICY "Org members can view SLA policies"
  ON tickets.sla_policies FOR SELECT
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can manage SLA policies"
  ON tickets.sla_policies FOR ALL
  USING (tickets.user_in_organization(organization_id, auth.uid()));

-- ===========================================
-- TICKETS POLICIES
-- ===========================================

CREATE POLICY "Org members can view tickets"
  ON tickets.tickets FOR SELECT
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can create tickets"
  ON tickets.tickets FOR INSERT
  WITH CHECK (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can update tickets"
  ON tickets.tickets FOR UPDATE
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can delete tickets"
  ON tickets.tickets FOR DELETE
  USING (tickets.user_in_organization(organization_id, auth.uid()));

-- ===========================================
-- MESSAGES POLICIES
-- ===========================================

CREATE POLICY "Users can view messages for org tickets"
  ON tickets.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can create messages for org tickets"
  ON tickets.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "Message authors can update their messages"
  ON tickets.messages FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Message authors can delete their messages"
  ON tickets.messages FOR DELETE
  USING (author_id = auth.uid());

-- ===========================================
-- ATTACHMENTS POLICIES
-- ===========================================

CREATE POLICY "Users can view attachments for org tickets"
  ON tickets.attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can upload attachments to org tickets"
  ON tickets.attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "Uploaders can delete their attachments"
  ON tickets.attachments FOR DELETE
  USING (uploaded_by = auth.uid());

-- ===========================================
-- TAGS POLICIES
-- ===========================================

CREATE POLICY "Org members can view tags"
  ON tickets.tags FOR SELECT
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can manage tags"
  ON tickets.tags FOR ALL
  USING (tickets.user_in_organization(organization_id, auth.uid()));

-- ===========================================
-- WATCHERS POLICIES
-- ===========================================

CREATE POLICY "Users can view watchers for org tickets"
  ON tickets.watchers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can add themselves as watchers"
  ON tickets.watchers FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users can remove themselves as watchers"
  ON tickets.watchers FOR DELETE
  USING (user_id = auth.uid());

-- ===========================================
-- CANNED RESPONSES POLICIES
-- ===========================================

CREATE POLICY "Org members can view shared canned responses"
  ON tickets.canned_responses FOR SELECT
  USING (
    tickets.user_in_organization(organization_id, auth.uid())
    AND (is_personal = false OR created_by = auth.uid())
  );

CREATE POLICY "Org members can create canned responses"
  ON tickets.canned_responses FOR INSERT
  WITH CHECK (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Creators can update their canned responses"
  ON tickets.canned_responses FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Creators can delete their canned responses"
  ON tickets.canned_responses FOR DELETE
  USING (created_by = auth.uid());

-- ===========================================
-- AUTOMATION RULES POLICIES
-- ===========================================

CREATE POLICY "Org members can view automation rules"
  ON tickets.automation_rules FOR SELECT
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can manage automation rules"
  ON tickets.automation_rules FOR ALL
  USING (tickets.user_in_organization(organization_id, auth.uid()));

-- ===========================================
-- ACTIVITY LOG POLICIES
-- ===========================================

CREATE POLICY "Users can view activity for org tickets"
  ON tickets.activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets.tickets t
      WHERE t.id = ticket_id
      AND tickets.user_in_organization(t.organization_id, auth.uid())
    )
  );

-- Insert is allowed for system triggers
CREATE POLICY "System can insert activity logs"
  ON tickets.activity_log FOR INSERT
  WITH CHECK (true);

-- ===========================================
-- KB ARTICLES POLICIES
-- ===========================================

CREATE POLICY "Anyone can view published KB articles"
  ON tickets.kb_articles FOR SELECT
  USING (
    status = 'published'
    OR tickets.user_in_organization(organization_id, auth.uid())
  );

CREATE POLICY "Org members can create KB articles"
  ON tickets.kb_articles FOR INSERT
  WITH CHECK (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can update KB articles"
  ON tickets.kb_articles FOR UPDATE
  USING (tickets.user_in_organization(organization_id, auth.uid()));

CREATE POLICY "Org members can delete KB articles"
  ON tickets.kb_articles FOR DELETE
  USING (tickets.user_in_organization(organization_id, auth.uid()));

-- ===========================================
-- NUMBER SEQUENCES POLICIES
-- ===========================================

CREATE POLICY "Org members can access sequences"
  ON tickets.number_sequences FOR ALL
  USING (tickets.user_in_organization(organization_id, auth.uid()));
