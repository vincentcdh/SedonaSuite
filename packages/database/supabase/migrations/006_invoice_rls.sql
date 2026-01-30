-- ===========================================
-- INVOICE MODULE RLS POLICIES
-- ===========================================

-- Enable RLS on all invoice tables
ALTER TABLE invoice.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.recurring_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice.vat_rates ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CLIENTS POLICIES
-- ===========================================

CREATE POLICY "Users can view clients in their organization"
  ON invoice.clients FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create clients in their organization"
  ON invoice.clients FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update clients in their organization"
  ON invoice.clients FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete clients in their organization"
  ON invoice.clients FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- PRODUCTS POLICIES
-- ===========================================

CREATE POLICY "Users can view products in their organization"
  ON invoice.products FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create products in their organization"
  ON invoice.products FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update products in their organization"
  ON invoice.products FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete products in their organization"
  ON invoice.products FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- NUMBER SEQUENCES POLICIES
-- ===========================================

CREATE POLICY "Users can view sequences in their organization"
  ON invoice.number_sequences FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage sequences in their organization"
  ON invoice.number_sequences FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- QUOTES POLICIES
-- ===========================================

CREATE POLICY "Users can view quotes in their organization"
  ON invoice.quotes FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create quotes in their organization"
  ON invoice.quotes FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update quotes in their organization"
  ON invoice.quotes FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete quotes in their organization"
  ON invoice.quotes FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- INVOICES POLICIES
-- ===========================================

CREATE POLICY "Users can view invoices in their organization"
  ON invoice.invoices FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create invoices in their organization"
  ON invoice.invoices FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update invoices in their organization"
  ON invoice.invoices FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete invoices in their organization"
  ON invoice.invoices FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- CREDIT NOTES POLICIES
-- ===========================================

CREATE POLICY "Users can view credit notes in their organization"
  ON invoice.credit_notes FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create credit notes in their organization"
  ON invoice.credit_notes FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update credit notes in their organization"
  ON invoice.credit_notes FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete credit notes in their organization"
  ON invoice.credit_notes FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- LINE ITEMS POLICIES (via document ownership)
-- ===========================================

CREATE POLICY "Users can view line items for their documents"
  ON invoice.line_items FOR SELECT
  USING (
    (document_type = 'quote' AND document_id IN (
      SELECT id FROM invoice.quotes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'invoice' AND document_id IN (
      SELECT id FROM invoice.invoices WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'credit_note' AND document_id IN (
      SELECT id FROM invoice.credit_notes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Users can create line items for their documents"
  ON invoice.line_items FOR INSERT
  WITH CHECK (
    (document_type = 'quote' AND document_id IN (
      SELECT id FROM invoice.quotes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'invoice' AND document_id IN (
      SELECT id FROM invoice.invoices WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'credit_note' AND document_id IN (
      SELECT id FROM invoice.credit_notes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Users can update line items for their documents"
  ON invoice.line_items FOR UPDATE
  USING (
    (document_type = 'quote' AND document_id IN (
      SELECT id FROM invoice.quotes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'invoice' AND document_id IN (
      SELECT id FROM invoice.invoices WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'credit_note' AND document_id IN (
      SELECT id FROM invoice.credit_notes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Users can delete line items for their documents"
  ON invoice.line_items FOR DELETE
  USING (
    (document_type = 'quote' AND document_id IN (
      SELECT id FROM invoice.quotes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'invoice' AND document_id IN (
      SELECT id FROM invoice.invoices WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    )) OR
    (document_type = 'credit_note' AND document_id IN (
      SELECT id FROM invoice.credit_notes WHERE organization_id IN (
        SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
      )
    ))
  );

-- ===========================================
-- PAYMENTS POLICIES
-- ===========================================

CREATE POLICY "Users can view payments in their organization"
  ON invoice.payments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create payments in their organization"
  ON invoice.payments FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update payments in their organization"
  ON invoice.payments FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete payments in their organization"
  ON invoice.payments FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- RECURRING TEMPLATES POLICIES
-- ===========================================

CREATE POLICY "Users can view recurring templates in their organization"
  ON invoice.recurring_templates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create recurring templates in their organization"
  ON invoice.recurring_templates FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update recurring templates in their organization"
  ON invoice.recurring_templates FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete recurring templates in their organization"
  ON invoice.recurring_templates FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- RECURRING LINE ITEMS POLICIES
-- ===========================================

CREATE POLICY "Users can view recurring line items for their templates"
  ON invoice.recurring_line_items FOR SELECT
  USING (template_id IN (
    SELECT id FROM invoice.recurring_templates WHERE organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create recurring line items for their templates"
  ON invoice.recurring_line_items FOR INSERT
  WITH CHECK (template_id IN (
    SELECT id FROM invoice.recurring_templates WHERE organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update recurring line items for their templates"
  ON invoice.recurring_line_items FOR UPDATE
  USING (template_id IN (
    SELECT id FROM invoice.recurring_templates WHERE organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete recurring line items for their templates"
  ON invoice.recurring_line_items FOR DELETE
  USING (template_id IN (
    SELECT id FROM invoice.recurring_templates WHERE organization_id IN (
      SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
    )
  ));

-- ===========================================
-- ORGANIZATION SETTINGS POLICIES
-- ===========================================

CREATE POLICY "Users can view settings for their organization"
  ON invoice.organization_settings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage settings for their organization"
  ON invoice.organization_settings FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

-- ===========================================
-- VAT RATES POLICIES
-- ===========================================

CREATE POLICY "Users can view VAT rates in their organization"
  ON invoice.vat_rates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage VAT rates in their organization"
  ON invoice.vat_rates FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.user_organizations
    WHERE user_id = auth.uid()
  ));
