-- ===========================================
-- SEDONA CRM - SEED DATA
-- ===========================================
-- Single organization with PRO plan
-- Single user: Vincent Coderch (Owner)
-- Uses existing UUIDs from database

BEGIN;

-- ===========================================
-- PART 1: ORGANIZATION (already exists, just update)
-- ===========================================

UPDATE public.organizations
SET
  name = 'Sedona Demo',
  slug = 'sedona-demo',
  legal_name = 'Sedona Demo SAS',
  siret = '12345678900001',
  siren = '123456789',
  vat_number = 'FR12345678901',
  address_line1 = '10 Rue de la Tech',
  city = 'Paris',
  postal_code = '75001',
  country = 'FR',
  phone = '+33 1 23 45 67 89',
  email = 'contact@sedona-demo.fr',
  website = 'https://sedona-demo.fr',
  subscription_plan = 'pro',
  subscription_status = 'active'
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';

-- ===========================================
-- PART 2: USER (already exists, just update)
-- ===========================================

UPDATE public.users
SET
  email = 'vincent.coderch@sedona-demo.fr',
  first_name = 'Vincent',
  last_name = 'Coderch',
  email_verified = true,
  locale = 'fr',
  timezone = 'Europe/Paris'
WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01';

-- ===========================================
-- PART 3: ORGANIZATION MEMBER (ensure owner role)
-- ===========================================

UPDATE public.organization_members
SET role = 'owner'
WHERE organization_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND user_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01';

COMMIT;

SELECT 'Seed data updated: Sedona Demo organization with Vincent Coderch (Owner, PRO plan)' AS status;
