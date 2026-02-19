-- ===========================================
-- SEDONA CRM - SEED DATA
-- ===========================================
-- Single organization with module-based billing
-- Single user: Vincent Coderch (Owner)
-- Uses existing UUIDs from database

BEGIN;

-- ===========================================
-- PART 1: ORGANIZATION
-- ===========================================

INSERT INTO public.organizations (
  id,
  name,
  slug,
  legal_name,
  siret,
  siren,
  vat_number,
  address_line1,
  city,
  postal_code,
  country,
  phone,
  email,
  website,
  industry,
  onboarding_completed
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Sedona Demo',
  'sedona-demo',
  'Sedona Demo SAS',
  '12345678900001',
  '123456789',
  'FR12345678901',
  '10 Rue de la Tech',
  'Paris',
  '75001',
  'FR',
  '+33 1 23 45 67 89',
  'contact@sedona-demo.fr',
  'https://sedona-demo.fr',
  'technology',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  legal_name = EXCLUDED.legal_name,
  siret = EXCLUDED.siret,
  siren = EXCLUDED.siren,
  vat_number = EXCLUDED.vat_number,
  address_line1 = EXCLUDED.address_line1,
  city = EXCLUDED.city,
  postal_code = EXCLUDED.postal_code,
  country = EXCLUDED.country,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  industry = EXCLUDED.industry,
  onboarding_completed = EXCLUDED.onboarding_completed;

-- ===========================================
-- PART 2: USER
-- ===========================================

INSERT INTO public.users (
  id,
  email,
  name,
  email_verified,
  locale,
  timezone
)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
  'vincent.coderch@sedona-demo.fr',
  'Vincent Coderch',
  true,
  'fr',
  'Europe/Paris'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  email_verified = EXCLUDED.email_verified,
  locale = EXCLUDED.locale,
  timezone = EXCLUDED.timezone;

-- ===========================================
-- PART 3: ORGANIZATION MEMBER
-- ===========================================

INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role,
  joined_at
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
  'owner',
  NOW()
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- ===========================================
-- PART 4: MODULE SUBSCRIPTIONS (PRO equivalent - all paid)
-- ===========================================

-- Insert module subscriptions for all modules with 'active' status
INSERT INTO public.module_subscriptions (organization_id, module_id, status, billing_cycle)
SELECT
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  m.id,
  'active',
  'monthly'
FROM public.modules m
WHERE m.is_active = true
ON CONFLICT (organization_id, module_id) DO UPDATE SET
  status = EXCLUDED.status,
  billing_cycle = EXCLUDED.billing_cycle;

COMMIT;

SELECT 'Seed data created: Sedona Demo organization with Vincent Coderch (Owner) and all modules active' AS status;
