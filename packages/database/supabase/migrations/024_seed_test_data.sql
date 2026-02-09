-- ===========================================
-- MIGRATION: Seed Test Data
-- ===========================================
-- This migration adds test data for development purposes
-- Run via: Supabase Dashboard > SQL Editor

-- ===========================================
-- PART 1: ORGANIZATIONS
-- ===========================================

INSERT INTO public.organizations (id, name, slug, legal_name, siret, siren, vat_number, address_street, address_postal_code, address_city, address_country, phone, email, website, subscription_plan, subscription_status, created_at, updated_at)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Startup Demo', 'startup-demo', 'Startup Demo SAS', '12345678901234', '123456789', 'FR12345678901', '10 Rue de la Demo', '75001', 'Paris', 'France', '+33 1 23 45 67 89', 'contact@startup-demo.fr', 'https://startup-demo.fr', 'FREE', 'active', '2024-01-15', '2024-01-15'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Entreprise Pro', 'entreprise-pro', 'Entreprise Pro SARL', '98765432109876', '987654321', 'FR98765432109', '50 Avenue des Champs-Elysees', '75008', 'Paris', 'France', '+33 1 98 76 54 32', 'contact@entreprise-pro.fr', 'https://entreprise-pro.fr', 'PRO', 'active', '2023-06-01', '2024-01-01'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Grande Entreprise', 'grande-entreprise', 'Grande Entreprise SA', '11111111111111', '111111111', 'FR11111111111', '1 Place de la Defense', '92800', 'Puteaux', 'France', '+33 1 11 11 11 11', 'contact@grande-entreprise.fr', 'https://grande-entreprise.fr', 'ENTERPRISE', 'active', '2022-01-01', '2024-01-01')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, subscription_plan = EXCLUDED.subscription_plan;

-- ===========================================
-- PART 2: USERS
-- ===========================================

INSERT INTO public.users (id, email, email_verified_at, name, phone, locale, timezone, two_factor_enabled, created_at, updated_at)
VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'owner.free@test.sedona.ai', NOW(), 'Marie Dupont', '+33 6 12 34 56 78', 'fr', 'Europe/Paris', false, '2024-01-15', '2024-01-15'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'owner.pro@test.sedona.ai', NOW(), 'Jean-Pierre Martin', '+33 6 98 76 54 32', 'fr', 'Europe/Paris', true, '2023-06-01', '2024-01-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'owner.enterprise@test.sedona.ai', NOW(), 'Sophie Bernard', '+33 6 11 22 33 44', 'fr', 'Europe/Paris', true, '2022-01-01', '2024-01-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'manager.free@test.sedona.ai', NOW(), 'Pierre Lambert', '+33 6 55 44 33 22', 'fr', 'Europe/Paris', false, '2024-01-20', '2024-01-20'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'manager.pro@test.sedona.ai', NOW(), 'Claire Moreau', '+33 6 77 88 99 00', 'fr', 'Europe/Paris', false, '2023-07-15', '2024-01-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'manager.enterprise@test.sedona.ai', NOW(), 'Thomas Durand', '+33 6 22 33 44 55', 'fr', 'Europe/Paris', true, '2022-03-01', '2024-01-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 'employee.free@test.sedona.ai', NOW(), 'Lucas Petit', '+33 6 33 44 55 66', 'fr', 'Europe/Paris', false, '2024-02-01', '2024-02-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'employee.pro@test.sedona.ai', NOW(), 'Emma Leroy', '+33 6 44 55 66 77', 'fr', 'Europe/Paris', false, '2023-09-01', '2024-01-01'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09', 'employee.enterprise@test.sedona.ai', NOW(), 'Hugo Girard', '+33 6 55 66 77 88', 'fr', 'Europe/Paris', false, '2022-06-01', '2024-01-01')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- ===========================================
-- PART 3: ORGANIZATION MEMBERS
-- ===========================================

INSERT INTO public.organization_members (id, organization_id, user_id, role, joined_at, created_at)
VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'owner', '2024-01-15', '2024-01-15'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'admin', '2024-01-20', '2024-01-20'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 'member', '2024-02-01', '2024-02-01'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'owner', '2023-06-01', '2023-06-01'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'admin', '2023-07-15', '2023-07-15'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'member', '2023-09-01', '2023-09-01'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'owner', '2022-01-01', '2022-01-01'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'admin', '2022-03-01', '2022-03-01'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09', 'member', '2022-06-01', '2022-06-01')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- ===========================================
-- CRM: PIPELINES
-- ===========================================

INSERT INTO crm.pipelines (id, organization_id, name, description, is_default, created_at)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Pipeline Commercial', 'Pipeline principal pour les ventes B2B', true, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- CRM: PIPELINE STAGES
-- ===========================================

INSERT INTO crm.pipeline_stages (id, pipeline_id, name, color, position, probability)
VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Nouveau lead', '#6B7280', 0, 10),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Qualification', '#3B82F6', 1, 20),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Proposition', '#F59E0B', 2, 50),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Negociation', '#8B5CF6', 3, 75),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Gagne', '#10B981', 4, 100),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Perdu', '#EF4444', 5, 0)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- CRM: COMPANIES
-- ===========================================

INSERT INTO crm.companies (id, organization_id, name, siret, website, industry, size, address_line1, city, postal_code, country, phone, email, created_at)
VALUES
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TechCorp France', '11122233344455', 'https://techcorp.fr', 'Technologie', '51-200', '15 Rue de l''Innovation', 'Lyon', '69001', 'France', '+33 4 72 00 00 01', 'contact@techcorp.fr', '2023-06-15'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Digital Solutions', '22233344455566', 'https://digitalsolutions.fr', 'Services', '11-50', '8 Boulevard Haussmann', 'Paris', '75009', 'France', '+33 1 42 00 00 02', 'info@digitalsolutions.fr', '2023-07-01'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Startup Innovation', '33344455566677', 'https://startupinno.fr', 'Technologie', '1-10', '42 Rue des Startups', 'Bordeaux', '33000', 'France', '+33 5 56 00 00 03', 'hello@startupinno.fr', '2023-08-15'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Consulting Group', '44455566677788', 'https://consultinggroup.fr', 'Conseil', '201-500', '100 Avenue Charles de Gaulle', 'Neuilly-sur-Seine', '92200', 'France', '+33 1 46 00 00 04', 'contact@consultinggroup.fr', '2023-09-01'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'EcoVert Industries', '55566677788899', 'https://ecovert.fr', 'Environnement', '51-200', '25 Rue Verte', 'Nantes', '44000', 'France', '+33 2 40 00 00 05', 'eco@ecovert.fr', '2023-10-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- CRM: CONTACTS
-- ===========================================

INSERT INTO crm.contacts (id, organization_id, first_name, last_name, email, phone, mobile, job_title, company_id, source, owner_id, created_at)
VALUES
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Antoine', 'Dubois', 'antoine.dubois@techcorp.fr', '+33 4 72 00 00 11', '+33 6 10 00 00 01', 'Directeur Technique', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'linkedin', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-06-20'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Julie', 'Martin', 'julie.martin@techcorp.fr', '+33 4 72 00 00 12', '+33 6 10 00 00 02', 'Responsable Achats', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'website', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-06-25'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Marc', 'Lefevre', 'marc.lefevre@digitalsolutions.fr', '+33 1 42 00 00 21', '+33 6 20 00 00 01', 'CEO', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'referral', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-07-05'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Sophie', 'Rousseau', 'sophie.rousseau@startupinno.fr', '+33 5 56 00 00 31', '+33 6 30 00 00 01', 'Fondatrice', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', 'website', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2023-08-20'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Philippe', 'Moreau', 'philippe.moreau@consultinggroup.fr', '+33 1 46 00 00 41', '+33 6 40 00 00 01', 'Directeur General', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', 'linkedin', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-09-10'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Camille', 'Bernard', 'camille.bernard@ecovert.fr', '+33 2 40 00 00 51', '+33 6 50 00 00 01', 'Responsable RSE', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f05', 'website', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-10-15')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- CRM: DEALS
-- ===========================================

INSERT INTO crm.deals (id, organization_id, pipeline_id, stage_id, name, amount, currency, expected_close_date, contact_id, company_id, status, owner_id, created_at)
VALUES
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Migration Cloud TechCorp', 45000.00, 'EUR', '2024-03-15', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'open', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-12-01'),
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'Contrat Annuel Digital Solutions', 120000.00, 'EUR', '2024-02-28', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'open', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-11-15'),
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'Formation Consulting Group', 25000.00, 'EUR', '2024-01-15', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', 'won', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-10-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- INVOICE: CLIENTS
-- ===========================================

INSERT INTO invoice.clients (id, organization_id, name, legal_name, siret, vat_number, billing_address_line1, billing_city, billing_postal_code, billing_country, billing_email, billing_phone, contact_name, payment_terms, created_at)
VALUES
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TechCorp France', 'TechCorp France SAS', '11122233344455', 'FR11122233344', '15 Rue de l''Innovation', 'Lyon', '69001', 'France', 'facturation@techcorp.fr', '+33 4 72 00 00 01', 'Antoine Dubois', 30, '2023-06-15'),
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Digital Solutions', 'Digital Solutions SARL', '22233344455566', 'FR22233344455', '8 Boulevard Haussmann', 'Paris', '75009', 'France', 'compta@digitalsolutions.fr', '+33 1 42 00 00 02', 'Marc Lefevre', 45, '2023-07-01'),
  ('200ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Startup Innovation', 'Startup Innovation SAS', '33344455566677', 'FR33344455566', '42 Rue des Startups', 'Bordeaux', '33000', 'France', 'admin@startupinno.fr', '+33 5 56 00 00 03', 'Sophie Rousseau', 30, '2023-08-15')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- INVOICE: PRODUCTS
-- ===========================================

INSERT INTO invoice.products (id, organization_id, name, description, sku, type, unit_price, currency, unit, vat_rate, category, is_active, created_at)
VALUES
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Consultation Strategique', 'Conseil et accompagnement strategique', 'CONS-STRAT', 'service', 1200.00, 'EUR', 'jour', 20.00, 'Conseil', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Developpement Web', 'Developpement application web sur mesure', 'DEV-WEB', 'service', 650.00, 'EUR', 'jour', 20.00, 'Developpement', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Formation Utilisateurs', 'Formation aux outils et bonnes pratiques', 'FORM-USER', 'service', 800.00, 'EUR', 'jour', 20.00, 'Formation', true, '2023-06-01'),
  ('210ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Licence Logiciel Annuelle', 'Abonnement annuel au logiciel', 'LIC-ANNUAL', 'service', 2400.00, 'EUR', 'licence', 20.00, 'Licences', true, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- INVOICE: INVOICES
-- ===========================================

INSERT INTO invoice.invoices (id, organization_id, client_id, invoice_number, status, issue_date, due_date, subtotal, vat_amount, total, amount_paid, currency, subject, created_by, created_at)
VALUES
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'FAC-2024-0001', 'paid', '2024-01-05', '2024-02-04', 7800.00, 1560.00, 9360.00, 9360.00, 'EUR', 'Developpement module CRM', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-05'),
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'FAC-2024-0002', 'sent', '2024-01-15', '2024-03-01', 15600.00, 3120.00, 18720.00, 0.00, 'EUR', 'Contrat de maintenance annuel', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-15'),
  ('230ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '200ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'FAC-2024-0003', 'draft', '2024-02-01', '2024-03-02', 4800.00, 960.00, 5760.00, 0.00, 'EUR', 'Formation equipe technique', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-02-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TICKETS: CATEGORIES
-- ===========================================

INSERT INTO tickets.categories (id, organization_id, name, description, color, icon, is_active, position, created_at)
VALUES
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Support Technique', 'Questions techniques et bugs', '#3B82F6', 'wrench', true, 0, '2023-06-01'),
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Facturation', 'Questions liees a la facturation', '#10B981', 'credit-card', true, 1, '2023-06-01'),
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Commercial', 'Demandes commerciales', '#F59E0B', 'shopping-cart', true, 2, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TICKETS: TICKETS
-- ===========================================

INSERT INTO tickets.tickets (id, organization_id, ticket_number, subject, description, status, priority, assigned_to, category_id, source, requester_name, requester_email, created_by, created_at)
VALUES
  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00001', 'Impossible de generer une facture PDF', 'Quand je clique sur Exporter PDF, rien ne se passe.', 'open', 'high', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'email', 'Antoine Dubois', 'antoine.dubois@techcorp.fr', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-28'),
  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00002', 'Question sur l''abonnement PRO', 'Le support prioritaire est-il inclus dans le plan PRO ?', 'in_progress', 'normal', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'web', 'Marc Lefevre', 'marc.lefevre@digitalsolutions.fr', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-27'),
  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00003', 'Erreur 500 sur le dashboard', 'Erreur 500 quand j''accede au dashboard depuis ce matin.', 'resolved', 'urgent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'email', 'Philippe Moreau', 'philippe.moreau@consultinggroup.fr', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-25')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- HR: SETTINGS
-- ===========================================

INSERT INTO hr.settings (id, organization_id, annual_leave_days_per_year, rtt_days_per_year, default_work_hours_per_week, employee_self_service_enabled, created_at)
VALUES
  ('500ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 25.0, 10.0, 35.0, true, '2023-06-01')
ON CONFLICT (organization_id) DO NOTHING;

-- ===========================================
-- HR: LEAVE TYPES
-- ===========================================

INSERT INTO hr.leave_types (id, organization_id, name, code, color, is_paid, requires_approval, deducts_from_balance, is_system, created_at)
VALUES
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Conges Payes', 'cp', '#3B82F6', true, true, true, true, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'RTT', 'rtt', '#10B981', true, true, true, true, '2023-06-01'),
  ('510ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Maladie', 'sick', '#EF4444', true, false, false, true, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- HR: EMPLOYEES
-- ===========================================

INSERT INTO hr.employees (id, organization_id, user_id, first_name, last_name, email, phone, employee_number, job_title, department, contract_type, contract_start_date, gross_salary, annual_leave_balance, rtt_balance, status, created_at)
VALUES
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Jean-Pierre', 'Martin', 'owner.pro@test.sedona.ai', '+33 6 98 76 54 32', 'EMP-00001', 'Directeur General', 'Direction', 'cdi', '2020-01-01', 8500.00, 25.0, 10.0, 'active', '2023-06-01'),
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Claire', 'Moreau', 'manager.pro@test.sedona.ai', '+33 6 77 88 99 00', 'EMP-00002', 'Responsable Commercial', 'Commercial', 'cdi', '2021-03-15', 5200.00, 22.5, 8.0, 'active', '2023-06-01'),
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'Emma', 'Leroy', 'employee.pro@test.sedona.ai', '+33 6 44 55 66 77', 'EMP-00003', 'Developpeur Full Stack', 'Technique', 'cdi', '2022-09-01', 4200.00, 18.0, 6.0, 'active', '2023-06-01'),
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Alexandre', 'Dubois', 'alexandre.dubois@entreprise-pro.fr', '+33 6 11 22 33 44', 'EMP-00004', 'Chef de Projet', 'Technique', 'cdi', '2022-01-15', 4800.00, 20.0, 7.0, 'active', '2023-06-01'),
  ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NULL, 'Marine', 'Petit', 'marine.petit@entreprise-pro.fr', '+33 6 22 33 44 55', 'EMP-00005', 'Designer UX/UI', 'Technique', 'cdd', '2023-06-01', 3500.00, 12.5, 5.0, 'active', '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- Set manager relationships
UPDATE hr.employees SET manager_id = '520ebc99-9c0b-4ef8-bb6d-6bb9bd380001' WHERE id = '520ebc99-9c0b-4ef8-bb6d-6bb9bd380002';
UPDATE hr.employees SET manager_id = '520ebc99-9c0b-4ef8-bb6d-6bb9bd380004' WHERE id IN ('520ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '520ebc99-9c0b-4ef8-bb6d-6bb9bd380005');

SELECT 'Seed data loaded successfully!' AS status;
