-- ===========================================
-- SEDONA CRM - SEED DATA: INVOICE MODULE
-- ===========================================

BEGIN;

-- ===========================================
-- INVOICE CLIENTS (for PRO organization)
-- ===========================================

INSERT INTO invoice.clients (id, organization_id, name, legal_name, siret, vat_number, legal_form, billing_address_line1, billing_city, billing_postal_code, billing_country, billing_email, billing_phone, contact_name, payment_terms, payment_method, default_currency, created_at)
VALUES
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TechCorp France', 'TechCorp France SAS', '11122233344455', 'FR11122233344', 'SAS', '15 Rue de l''Innovation', 'Lyon', '69001', 'France', 'facturation@techcorp.fr', '+33 4 72 00 00 01', 'Antoine Dubois', 30, 'transfer', 'EUR', '2023-06-15'),
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Digital Solutions', 'Digital Solutions SARL', '22233344455566', 'FR22233344455', 'SARL', '8 Boulevard Haussmann', 'Paris', '75009', 'France', 'compta@digitalsolutions.fr', '+33 1 42 00 00 02', 'Marc Lefevre', 45, 'transfer', 'EUR', '2023-07-01'),
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Startup Innovation', 'Startup Innovation SAS', '33344455566677', 'FR33344455566', 'SAS', '42 Rue des Startups', 'Bordeaux', '33000', 'France', 'admin@startupinno.fr', '+33 5 56 00 00 03', 'Sophie Rousseau', 30, 'card', 'EUR', '2023-08-15'),
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Consulting Group', 'Consulting Group SA', '44455566677788', 'FR44455566677', 'SA', '100 Avenue Charles de Gaulle', 'Neuilly-sur-Seine', '92200', 'France', 'finance@consultinggroup.fr', '+33 1 46 00 00 04', 'Philippe Moreau', 60, 'transfer', 'EUR', '2023-09-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- PRODUCTS/SERVICES
-- ===========================================

INSERT INTO invoice.products (id, organization_id, name, description, sku, type, unit_price, currency, unit, vat_rate, vat_exempt, category, is_active, created_at)
VALUES
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Consultation Stratégique', 'Conseil et accompagnement strategique', 'CONS-STRAT', 'service', 1200.00, 'EUR', 'jour', 20.00, false, 'Conseil', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Développement Web', 'Developpement application web sur mesure', 'DEV-WEB', 'service', 650.00, 'EUR', 'jour', 20.00, false, 'Developpement', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Formation Utilisateurs', 'Formation aux outils et bonnes pratiques', 'FORM-USER', 'service', 800.00, 'EUR', 'jour', 20.00, false, 'Formation', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Licence Logiciel Annuelle', 'Abonnement annuel au logiciel', 'LIC-ANNUAL', 'service', 2400.00, 'EUR', 'licence', 20.00, false, 'Licences', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Support Premium', 'Support technique prioritaire', 'SUP-PREM', 'service', 500.00, 'EUR', 'mois', 20.00, false, 'Support', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Audit Securité', 'Audit complet de securite informatique', 'AUDIT-SEC', 'service', 3500.00, 'EUR', 'forfait', 20.00, false, 'Audit', true, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- NUMBER SEQUENCES
-- ===========================================

INSERT INTO invoice.number_sequences (id, organization_id, type, prefix, current_number, padding, reset_frequency)
VALUES
  ('220ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'invoice', 'FAC-', 5, 4, 'yearly'),
  ('220ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'quote', 'DEV-', 8, 4, 'yearly'),
  ('220ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'credit_note', 'AVO-', 1, 4, 'yearly')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- INVOICES
-- ===========================================

INSERT INTO invoice.invoices (id, organization_id, client_id, invoice_number, status, issue_date, due_date, subtotal, vat_amount, total, amount_paid, currency, subject, created_by, created_at)
VALUES
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'FAC-2024-0001', 'paid', '2024-01-05', '2024-02-04', 7800.00, 1560.00, 9360.00, 9360.00, 'EUR', 'Developpement module CRM', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-05'),
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'FAC-2024-0002', 'sent', '2024-01-15', '2024-03-01', 15600.00, 3120.00, 18720.00, 0.00, 'EUR', 'Contrat de maintenance annuel', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-15'),
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'FAC-2024-0003', 'partial', '2024-01-20', '2024-02-19', 4800.00, 960.00, 5760.00, 2880.00, 'EUR', 'Formation equipe technique', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-20'),
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'FAC-2024-0004', 'draft', '2024-02-01', '2024-04-01', 25000.00, 5000.00, 30000.00, 0.00, 'EUR', 'Projet transformation digitale', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-02-01'),
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'FAC-2024-0005', 'overdue', '2023-12-01', '2023-12-31', 3500.00, 700.00, 4200.00, 0.00, 'EUR', 'Audit securite Q4', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-12-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- LINE ITEMS FOR INVOICES
-- ===========================================

INSERT INTO invoice.line_items (id, document_type, document_id, position, product_id, description, quantity, unit, unit_price, vat_rate, vat_amount, line_total, line_total_with_vat)
VALUES
  -- FAC-2024-0001 lines
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 0, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Developpement Web - Module CRM', 12, 'jour', 650.00, 20.00, 1560.00, 7800.00, 9360.00),
  -- FAC-2024-0002 lines
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 0, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'Licence Logiciel Annuelle x5', 5, 'licence', 2400.00, 20.00, 2400.00, 12000.00, 14400.00),
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 1, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'Support Premium - 12 mois', 12, 'mois', 300.00, 20.00, 720.00, 3600.00, 4320.00),
  -- FAC-2024-0003 lines
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 0, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'Formation Utilisateurs', 6, 'jour', 800.00, 20.00, 960.00, 4800.00, 5760.00),
  -- FAC-2024-0004 lines
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 0, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'Consultation Strategique', 10, 'jour', 1200.00, 20.00, 2400.00, 12000.00, 14400.00),
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 1, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'Developpement Web', 20, 'jour', 650.00, 20.00, 2600.00, 13000.00, 15600.00),
  -- FAC-2024-0005 lines
  ('240ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'invoice', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 0, '210ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'Audit Securite', 1, 'forfait', 3500.00, 20.00, 700.00, 3500.00, 4200.00)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- QUOTES
-- ===========================================

INSERT INTO invoice.quotes (id, organization_id, client_id, quote_number, status, issue_date, valid_until, subtotal, vat_amount, total, currency, subject, created_by, created_at)
VALUES
  ('250ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'DEV-2024-0001', 'sent', '2024-01-25', '2024-02-25', 45000.00, 9000.00, 54000.00, 'EUR', 'Migration Cloud Infrastructure', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-25'),
  ('250ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'DEV-2024-0002', 'accepted', '2024-01-10', '2024-02-10', 8400.00, 1680.00, 10080.00, 'EUR', 'Refonte Site Web', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-10'),
  ('250ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'DEV-2024-0003', 'draft', '2024-02-01', '2024-03-01', 12500.00, 2500.00, 15000.00, 'EUR', 'Application Mobile MVP', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-02-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- ORGANIZATION SETTINGS
-- ===========================================

INSERT INTO invoice.organization_settings (id, organization_id, company_name, legal_name, siret, vat_number, legal_form, address_line1, city, postal_code, country, email, phone, website, bank_name, iban, bic, default_payment_terms, default_quote_validity, default_vat_rate, default_currency, legal_mentions)
VALUES
  ('260ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Entreprise Pro', 'Entreprise Pro SARL', '98765432109876', 'FR98765432109', 'SARL', '50 Avenue des Champs-Elysees', 'Paris', '75008', 'France', 'contact@entreprise-pro.fr', '+33 1 98 76 54 32', 'https://entreprise-pro.fr', 'BNP Paribas', 'FR76 3000 4000 0500 0012 3456 789', 'BNPAFRPP', 30, 30, 20.00, 'EUR', 'SARL au capital de 50 000 EUR - RCS Paris 987 654 321')
ON CONFLICT (organization_id) DO NOTHING;

-- ===========================================
-- PAYMENTS
-- ===========================================

INSERT INTO invoice.payments (id, organization_id, invoice_id, amount, currency, payment_date, payment_method, reference, created_by, created_at)
VALUES
  ('270ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 9360.00, 'EUR', '2024-01-25', 'transfer', 'VIR-2024-0125', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-25'),
  ('270ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '230ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 2880.00, 'EUR', '2024-01-28', 'transfer', 'VIR-2024-0128', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-28')
ON CONFLICT (id) DO NOTHING;

COMMIT;

SELECT 'Invoice seed data loaded successfully' AS status;
