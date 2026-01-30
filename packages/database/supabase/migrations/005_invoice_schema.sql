-- ===========================================
-- INVOICE MODULE SCHEMA
-- ===========================================

-- Create invoice schema
CREATE SCHEMA IF NOT EXISTS invoice;

-- ===========================================
-- CLIENTS (Entreprises facturables)
-- ===========================================

CREATE TABLE invoice.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Informations de l'entreprise
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255), -- Raison sociale si differente
  siret VARCHAR(20),
  vat_number VARCHAR(30), -- Numero TVA intracommunautaire
  legal_form VARCHAR(50), -- SARL, SAS, EURL, etc.

  -- Adresse de facturation
  billing_address_line1 VARCHAR(255),
  billing_address_line2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100) DEFAULT 'France',

  -- Contact facturation
  billing_email VARCHAR(255),
  billing_phone VARCHAR(50),
  contact_name VARCHAR(200),

  -- Conditions de paiement
  payment_terms INTEGER DEFAULT 30, -- Jours
  payment_method VARCHAR(30) DEFAULT 'transfer', -- 'transfer', 'card', 'check', 'cash', 'direct_debit'
  default_currency VARCHAR(3) DEFAULT 'EUR',

  -- Lien CRM (optionnel)
  crm_company_id UUID,
  crm_contact_id UUID,

  -- Notes internes
  notes TEXT,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- PRODUCTS / SERVICES
-- ===========================================

CREATE TABLE invoice.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Informations produit
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100), -- Reference interne
  type VARCHAR(20) DEFAULT 'service', -- 'product', 'service'

  -- Prix
  unit_price DECIMAL(15,4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  unit VARCHAR(50) DEFAULT 'unite', -- 'unite', 'heure', 'jour', 'mois', 'forfait', etc.

  -- TVA
  vat_rate DECIMAL(5,2) DEFAULT 20.00, -- Taux TVA en %
  vat_exempt BOOLEAN DEFAULT FALSE, -- Exonere de TVA

  -- Categorisation
  category VARCHAR(100),

  -- Comptabilite
  accounting_code VARCHAR(50), -- Code comptable

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(organization_id, sku)
);

-- ===========================================
-- INVOICE NUMBER SEQUENCES
-- ===========================================

CREATE TABLE invoice.number_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL, -- 'invoice', 'quote', 'credit_note'
  prefix VARCHAR(20) DEFAULT '', -- Ex: 'FAC-', 'DEV-'
  suffix VARCHAR(20) DEFAULT '',
  current_number INTEGER DEFAULT 0,
  padding INTEGER DEFAULT 4, -- Nombre de chiffres (ex: 0001)
  reset_frequency VARCHAR(20) DEFAULT 'never', -- 'never', 'yearly', 'monthly'
  last_reset_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, type)
);

-- ===========================================
-- QUOTES / DEVIS
-- ===========================================

CREATE TABLE invoice.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE RESTRICT,

  -- Numero
  quote_number VARCHAR(50) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE, -- Date d'expiration
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  -- Montants (calcules)
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  discount_percent DECIMAL(5,2),
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Informations
  subject VARCHAR(500),
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,

  -- Lien vers facture si convertie
  converted_to_invoice_id UUID,

  -- CRM links
  deal_id UUID,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(organization_id, quote_number)
);

-- ===========================================
-- INVOICES / FACTURES
-- ===========================================

CREATE TABLE invoice.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE RESTRICT,

  -- Numero
  invoice_number VARCHAR(50) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Montants
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  discount_percent DECIMAL(5,2),
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  amount_due DECIMAL(15,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Informations
  subject VARCHAR(500),
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,
  payment_instructions TEXT,

  -- Origine
  quote_id UUID REFERENCES invoice.quotes(id) ON DELETE SET NULL,

  -- Relances
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,

  -- CRM links
  deal_id UUID,

  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(organization_id, invoice_number)
);

-- ===========================================
-- CREDIT NOTES / AVOIRS
-- ===========================================

CREATE TABLE invoice.credit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoice.invoices(id) ON DELETE SET NULL,

  -- Numero
  credit_note_number VARCHAR(50) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'sent', 'applied', 'refunded'

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  applied_at TIMESTAMPTZ,

  -- Montants
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Raison
  reason TEXT,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(organization_id, credit_note_number)
);

-- ===========================================
-- LINE ITEMS (polymorphic pour quotes, invoices, credit_notes)
-- ===========================================

CREATE TABLE invoice.line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference polymorphe
  document_type VARCHAR(20) NOT NULL, -- 'quote', 'invoice', 'credit_note'
  document_id UUID NOT NULL,

  -- Position
  position INTEGER NOT NULL DEFAULT 0,

  -- Produit (optionnel)
  product_id UUID REFERENCES invoice.products(id) ON DELETE SET NULL,

  -- Details ligne
  description TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'unite',
  unit_price DECIMAL(15,4) NOT NULL,

  -- Remise ligne
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(15,2),

  -- TVA
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Totaux
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0, -- HT apres remise
  line_total_with_vat DECIMAL(15,2) NOT NULL DEFAULT 0, -- TTC

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour accelerer les lookups polymorphes
CREATE INDEX idx_line_items_document ON invoice.line_items(document_type, document_id);

-- ===========================================
-- PAYMENTS / PAIEMENTS
-- ===========================================

CREATE TABLE invoice.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoice.invoices(id) ON DELETE CASCADE,

  -- Montant
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Details
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(30) NOT NULL, -- 'transfer', 'card', 'check', 'cash', 'direct_debit'
  reference VARCHAR(100), -- Reference de paiement

  -- Notes
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- RECURRING INVOICES / FACTURES RECURRENTES
-- ===========================================

CREATE TABLE invoice.recurring_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES invoice.clients(id) ON DELETE CASCADE,

  -- Nom du template
  name VARCHAR(255) NOT NULL,

  -- Frequence
  frequency VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
  day_of_month INTEGER, -- Pour monthly (1-28)
  month_of_year INTEGER, -- Pour yearly (1-12)

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = infini
  next_invoice_date DATE,

  -- Contenu facture
  subject VARCHAR(500),
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  footer TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  invoices_generated INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Line items pour templates recurrents
CREATE TABLE invoice.recurring_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES invoice.recurring_templates(id) ON DELETE CASCADE,

  position INTEGER NOT NULL DEFAULT 0,
  product_id UUID REFERENCES invoice.products(id) ON DELETE SET NULL,

  description TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'unite',
  unit_price DECIMAL(15,4) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 20.00,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INVOICE SETTINGS (par organisation)
-- ===========================================

CREATE TABLE invoice.organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Informations entreprise
  company_name VARCHAR(255),
  legal_name VARCHAR(255),
  siret VARCHAR(20),
  vat_number VARCHAR(30),
  legal_form VARCHAR(50),
  capital VARCHAR(50), -- Capital social

  -- Adresse
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',

  -- Contact
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),

  -- Logo
  logo_url VARCHAR(500),

  -- Coordonnees bancaires
  bank_name VARCHAR(100),
  iban VARCHAR(50),
  bic VARCHAR(20),

  -- Conditions par defaut
  default_payment_terms INTEGER DEFAULT 30,
  default_quote_validity INTEGER DEFAULT 30, -- Jours
  default_vat_rate DECIMAL(5,2) DEFAULT 20.00,
  default_currency VARCHAR(3) DEFAULT 'EUR',

  -- Mentions legales
  legal_mentions TEXT,
  late_payment_penalty TEXT, -- Penalites de retard
  discount_terms TEXT, -- Escompte

  -- Templates
  invoice_notes_template TEXT,
  invoice_footer_template TEXT,
  quote_notes_template TEXT,
  quote_footer_template TEXT,

  -- Email templates
  invoice_email_subject VARCHAR(255),
  invoice_email_body TEXT,
  quote_email_subject VARCHAR(255),
  quote_email_body TEXT,
  reminder_email_subject VARCHAR(255),
  reminder_email_body TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- ===========================================
-- VAT RATES (Taux TVA personnalises)
-- ===========================================

CREATE TABLE invoice.vat_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL, -- Ex: "TVA standard", "TVA reduite", "Exonere"
  rate DECIMAL(5,2) NOT NULL, -- Ex: 20.00, 10.00, 5.50, 0.00
  is_default BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, rate)
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Clients
CREATE INDEX idx_invoice_clients_org ON invoice.clients(organization_id);
CREATE INDEX idx_invoice_clients_name ON invoice.clients(organization_id, name);
CREATE INDEX idx_invoice_clients_siret ON invoice.clients(siret) WHERE siret IS NOT NULL;
CREATE INDEX idx_invoice_clients_deleted ON invoice.clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoice_clients_crm ON invoice.clients(crm_company_id) WHERE crm_company_id IS NOT NULL;

-- Products
CREATE INDEX idx_invoice_products_org ON invoice.products(organization_id);
CREATE INDEX idx_invoice_products_active ON invoice.products(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_invoice_products_category ON invoice.products(organization_id, category);
CREATE INDEX idx_invoice_products_deleted ON invoice.products(deleted_at) WHERE deleted_at IS NULL;

-- Quotes
CREATE INDEX idx_invoice_quotes_org ON invoice.quotes(organization_id);
CREATE INDEX idx_invoice_quotes_client ON invoice.quotes(client_id);
CREATE INDEX idx_invoice_quotes_status ON invoice.quotes(organization_id, status);
CREATE INDEX idx_invoice_quotes_date ON invoice.quotes(issue_date);
CREATE INDEX idx_invoice_quotes_deleted ON invoice.quotes(deleted_at) WHERE deleted_at IS NULL;

-- Invoices
CREATE INDEX idx_invoice_invoices_org ON invoice.invoices(organization_id);
CREATE INDEX idx_invoice_invoices_client ON invoice.invoices(client_id);
CREATE INDEX idx_invoice_invoices_status ON invoice.invoices(organization_id, status);
CREATE INDEX idx_invoice_invoices_date ON invoice.invoices(issue_date);
CREATE INDEX idx_invoice_invoices_due ON invoice.invoices(due_date) WHERE status NOT IN ('paid', 'cancelled');
CREATE INDEX idx_invoice_invoices_overdue ON invoice.invoices(organization_id, due_date, status) WHERE status = 'overdue';
CREATE INDEX idx_invoice_invoices_deleted ON invoice.invoices(deleted_at) WHERE deleted_at IS NULL;

-- Credit Notes
CREATE INDEX idx_invoice_credit_notes_org ON invoice.credit_notes(organization_id);
CREATE INDEX idx_invoice_credit_notes_client ON invoice.credit_notes(client_id);
CREATE INDEX idx_invoice_credit_notes_invoice ON invoice.credit_notes(invoice_id);
CREATE INDEX idx_invoice_credit_notes_deleted ON invoice.credit_notes(deleted_at) WHERE deleted_at IS NULL;

-- Payments
CREATE INDEX idx_invoice_payments_org ON invoice.payments(organization_id);
CREATE INDEX idx_invoice_payments_invoice ON invoice.payments(invoice_id);
CREATE INDEX idx_invoice_payments_date ON invoice.payments(payment_date);

-- Recurring
CREATE INDEX idx_invoice_recurring_org ON invoice.recurring_templates(organization_id);
CREATE INDEX idx_invoice_recurring_active ON invoice.recurring_templates(organization_id, is_active, next_invoice_date) WHERE is_active = TRUE;

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

CREATE TRIGGER update_invoice_clients_updated_at
  BEFORE UPDATE ON invoice.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_products_updated_at
  BEFORE UPDATE ON invoice.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_quotes_updated_at
  BEFORE UPDATE ON invoice.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_invoices_updated_at
  BEFORE UPDATE ON invoice.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_credit_notes_updated_at
  BEFORE UPDATE ON invoice.credit_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_line_items_updated_at
  BEFORE UPDATE ON invoice.line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_payments_updated_at
  BEFORE UPDATE ON invoice.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_recurring_updated_at
  BEFORE UPDATE ON invoice.recurring_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_settings_updated_at
  BEFORE UPDATE ON invoice.organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_sequences_updated_at
  BEFORE UPDATE ON invoice.number_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- FUNCTION: Generate next document number
-- ===========================================

CREATE OR REPLACE FUNCTION invoice.get_next_number(
  p_organization_id UUID,
  p_type VARCHAR(20)
) RETURNS VARCHAR(50) AS $$
DECLARE
  v_sequence RECORD;
  v_next_number INTEGER;
  v_result VARCHAR(50);
  v_year TEXT;
  v_month TEXT;
BEGIN
  -- Get or create sequence
  SELECT * INTO v_sequence
  FROM invoice.number_sequences
  WHERE organization_id = p_organization_id AND type = p_type
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Create default sequence
    INSERT INTO invoice.number_sequences (organization_id, type, prefix, current_number, padding)
    VALUES (
      p_organization_id,
      p_type,
      CASE p_type
        WHEN 'invoice' THEN 'FAC-'
        WHEN 'quote' THEN 'DEV-'
        WHEN 'credit_note' THEN 'AVO-'
        ELSE ''
      END,
      0,
      4
    )
    RETURNING * INTO v_sequence;
  END IF;

  -- Check if reset needed
  v_year := TO_CHAR(NOW(), 'YYYY');
  v_month := TO_CHAR(NOW(), 'MM');

  IF v_sequence.reset_frequency = 'yearly' AND
     (v_sequence.last_reset_at IS NULL OR EXTRACT(YEAR FROM v_sequence.last_reset_at) < EXTRACT(YEAR FROM NOW())) THEN
    v_sequence.current_number := 0;
    v_sequence.last_reset_at := NOW();
  ELSIF v_sequence.reset_frequency = 'monthly' AND
        (v_sequence.last_reset_at IS NULL OR
         EXTRACT(YEAR FROM v_sequence.last_reset_at) < EXTRACT(YEAR FROM NOW()) OR
         EXTRACT(MONTH FROM v_sequence.last_reset_at) < EXTRACT(MONTH FROM NOW())) THEN
    v_sequence.current_number := 0;
    v_sequence.last_reset_at := NOW();
  END IF;

  -- Increment
  v_next_number := v_sequence.current_number + 1;

  -- Update sequence
  UPDATE invoice.number_sequences
  SET current_number = v_next_number,
      last_reset_at = COALESCE(v_sequence.last_reset_at, last_reset_at)
  WHERE id = v_sequence.id;

  -- Build result
  v_result := v_sequence.prefix ||
              LPAD(v_next_number::TEXT, v_sequence.padding, '0') ||
              v_sequence.suffix;

  -- Add year if resetting
  IF v_sequence.reset_frequency = 'yearly' THEN
    v_result := v_sequence.prefix || v_year || '-' ||
                LPAD(v_next_number::TEXT, v_sequence.padding, '0') ||
                v_sequence.suffix;
  ELSIF v_sequence.reset_frequency = 'monthly' THEN
    v_result := v_sequence.prefix || v_year || v_month || '-' ||
                LPAD(v_next_number::TEXT, v_sequence.padding, '0') ||
                v_sequence.suffix;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- FUNCTION: Calculate line item totals
-- ===========================================

CREATE OR REPLACE FUNCTION invoice.calculate_line_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate discount
  IF NEW.discount_percent IS NOT NULL THEN
    NEW.discount_amount := ROUND((NEW.quantity * NEW.unit_price) * (NEW.discount_percent / 100), 2);
  ELSIF NEW.discount_amount IS NULL THEN
    NEW.discount_amount := 0;
  END IF;

  -- Calculate line total HT
  NEW.line_total := ROUND((NEW.quantity * NEW.unit_price) - COALESCE(NEW.discount_amount, 0), 2);

  -- Calculate VAT
  NEW.vat_amount := ROUND(NEW.line_total * (COALESCE(NEW.vat_rate, 0) / 100), 2);

  -- Calculate line total TTC
  NEW.line_total_with_vat := NEW.line_total + NEW.vat_amount;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_line_item_totals
  BEFORE INSERT OR UPDATE ON invoice.line_items
  FOR EACH ROW
  EXECUTE FUNCTION invoice.calculate_line_totals();

-- ===========================================
-- FUNCTION: Update document totals
-- ===========================================

CREATE OR REPLACE FUNCTION invoice.update_document_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(15,2);
  v_vat_amount DECIMAL(15,2);
  v_total DECIMAL(15,2);
BEGIN
  -- Calculate totals from line items
  SELECT
    COALESCE(SUM(line_total), 0),
    COALESCE(SUM(vat_amount), 0)
  INTO v_subtotal, v_vat_amount
  FROM invoice.line_items
  WHERE document_type = TG_ARGV[0] AND document_id = COALESCE(NEW.document_id, OLD.document_id);

  -- Update the appropriate document
  IF TG_ARGV[0] = 'quote' THEN
    UPDATE invoice.quotes
    SET subtotal = v_subtotal,
        vat_amount = v_vat_amount,
        total = v_subtotal + v_vat_amount - COALESCE(discount_amount, 0)
    WHERE id = COALESCE(NEW.document_id, OLD.document_id);

  ELSIF TG_ARGV[0] = 'invoice' THEN
    UPDATE invoice.invoices
    SET subtotal = v_subtotal,
        vat_amount = v_vat_amount,
        total = v_subtotal + v_vat_amount - COALESCE(discount_amount, 0)
    WHERE id = COALESCE(NEW.document_id, OLD.document_id);

  ELSIF TG_ARGV[0] = 'credit_note' THEN
    UPDATE invoice.credit_notes
    SET subtotal = v_subtotal,
        vat_amount = v_vat_amount,
        total = v_subtotal + v_vat_amount
    WHERE id = COALESCE(NEW.document_id, OLD.document_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Les triggers pour update_document_totals seront appeles
-- manuellement via des fonctions serveur pour eviter les problemes
-- de performance avec les triggers polymorphes

-- ===========================================
-- FUNCTION: Update invoice status based on payments
-- ===========================================

CREATE OR REPLACE FUNCTION invoice.update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total_paid DECIMAL(15,2);
  v_invoice_total DECIMAL(15,2);
  v_new_status VARCHAR(20);
BEGIN
  -- Get total payments for this invoice
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_paid
  FROM invoice.payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Get invoice total
  SELECT total INTO v_invoice_total
  FROM invoice.invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Determine new status
  IF v_total_paid >= v_invoice_total THEN
    v_new_status := 'paid';
  ELSIF v_total_paid > 0 THEN
    v_new_status := 'partial';
  ELSE
    -- Keep current status if no payments
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update invoice
  UPDATE invoice.invoices
  SET amount_paid = v_total_paid,
      status = CASE
        WHEN status IN ('cancelled', 'draft') THEN status -- Don't change these statuses
        ELSE v_new_status
      END,
      paid_at = CASE
        WHEN v_new_status = 'paid' THEN NOW()
        ELSE NULL
      END
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON invoice.payments
  FOR EACH ROW
  EXECUTE FUNCTION invoice.update_invoice_payment_status();
