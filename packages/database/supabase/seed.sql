-- ===========================================
-- SEDONA CRM - SEED DATA
-- ===========================================
-- Run with: pnpm db:seed or psql -f seed.sql

BEGIN;

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

COMMIT;

SELECT 'Base seed data (orgs, users, members) loaded successfully' AS status;
