/**
 * Seed script that inserts test data via Supabase REST API
 * Run with: npx tsx scripts/seed-via-api.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://znoeohqssztayssffiqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpub2VvaHFzc3p0YXlzc2ZmaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NjgwNzIsImV4cCI6MjA4NTM0NDA3Mn0.JN3N7n7m1PutiHRd6pC0kRRGGgnmRKGO9d8rL0oO-2U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Organization IDs
const ORG_FREE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
const ORG_PRO = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
const ORG_ENTERPRISE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03';

// User IDs
const USER_IDS = {
  ownerFree: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
  ownerPro: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
  ownerEnterprise: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03',
  managerFree: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04',
  managerPro: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05',
  managerEnterprise: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06',
  employeeFree: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07',
  employeePro: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08',
  employeeEnterprise: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09',
};

async function seedOrganizations() {
  console.log('Seeding organizations...');
  const { data, error } = await supabase.from('organizations').upsert([
    {
      id: ORG_FREE,
      name: 'Startup Demo',
      slug: 'startup-demo',
      legal_name: 'Startup Demo SAS',
      siret: '12345678901234',
      siren: '123456789',
      vat_number: 'FR12345678901',
      address_street: '10 Rue de la Demo',
      address_postal_code: '75001',
      address_city: 'Paris',
      address_country: 'France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@startup-demo.fr',
      website: 'https://startup-demo.fr',
      subscription_plan: 'FREE',
      subscription_status: 'active',
    },
    {
      id: ORG_PRO,
      name: 'Entreprise Pro',
      slug: 'entreprise-pro',
      legal_name: 'Entreprise Pro SARL',
      siret: '98765432109876',
      siren: '987654321',
      vat_number: 'FR98765432109',
      address_street: '50 Avenue des Champs-Elysees',
      address_postal_code: '75008',
      address_city: 'Paris',
      address_country: 'France',
      phone: '+33 1 98 76 54 32',
      email: 'contact@entreprise-pro.fr',
      website: 'https://entreprise-pro.fr',
      subscription_plan: 'PRO',
      subscription_status: 'active',
    },
    {
      id: ORG_ENTERPRISE,
      name: 'Grande Entreprise',
      slug: 'grande-entreprise',
      legal_name: 'Grande Entreprise SA',
      siret: '11111111111111',
      siren: '111111111',
      vat_number: 'FR11111111111',
      address_street: '1 Place de la Defense',
      address_postal_code: '92800',
      address_city: 'Puteaux',
      address_country: 'France',
      phone: '+33 1 11 11 11 11',
      email: 'contact@grande-entreprise.fr',
      website: 'https://grande-entreprise.fr',
      subscription_plan: 'ENTERPRISE',
      subscription_status: 'active',
    },
  ], { onConflict: 'id' });

  if (error) console.error('Error seeding organizations:', error);
  else console.log('✅ Organizations seeded');
  return { data, error };
}

async function seedUsers() {
  console.log('Seeding users...');
  const { data, error } = await supabase.from('users').upsert([
    { id: USER_IDS.ownerFree, email: 'owner.free@test.sedona.ai', name: 'Marie Dupont', phone: '+33 6 12 34 56 78', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString() },
    { id: USER_IDS.ownerPro, email: 'owner.pro@test.sedona.ai', name: 'Jean-Pierre Martin', phone: '+33 6 98 76 54 32', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString(), two_factor_enabled: true },
    { id: USER_IDS.ownerEnterprise, email: 'owner.enterprise@test.sedona.ai', name: 'Sophie Bernard', phone: '+33 6 11 22 33 44', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString(), two_factor_enabled: true },
    { id: USER_IDS.managerFree, email: 'manager.free@test.sedona.ai', name: 'Pierre Lambert', phone: '+33 6 55 44 33 22', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString() },
    { id: USER_IDS.managerPro, email: 'manager.pro@test.sedona.ai', name: 'Claire Moreau', phone: '+33 6 77 88 99 00', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString() },
    { id: USER_IDS.managerEnterprise, email: 'manager.enterprise@test.sedona.ai', name: 'Thomas Durand', phone: '+33 6 22 33 44 55', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString(), two_factor_enabled: true },
    { id: USER_IDS.employeeFree, email: 'employee.free@test.sedona.ai', name: 'Lucas Petit', phone: '+33 6 33 44 55 66', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString() },
    { id: USER_IDS.employeePro, email: 'employee.pro@test.sedona.ai', name: 'Emma Leroy', phone: '+33 6 44 55 66 77', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString() },
    { id: USER_IDS.employeeEnterprise, email: 'employee.enterprise@test.sedona.ai', name: 'Hugo Girard', phone: '+33 6 55 66 77 88', locale: 'fr', timezone: 'Europe/Paris', email_verified_at: new Date().toISOString() },
  ], { onConflict: 'id' });

  if (error) console.error('Error seeding users:', error);
  else console.log('✅ Users seeded');
  return { data, error };
}

async function seedOrganizationMembers() {
  console.log('Seeding organization members...');
  const { data, error } = await supabase.from('organization_members').upsert([
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', organization_id: ORG_FREE, user_id: USER_IDS.ownerFree, role: 'owner', joined_at: '2024-01-15' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', organization_id: ORG_FREE, user_id: USER_IDS.managerFree, role: 'admin', joined_at: '2024-01-20' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', organization_id: ORG_FREE, user_id: USER_IDS.employeeFree, role: 'member', joined_at: '2024-02-01' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', organization_id: ORG_PRO, user_id: USER_IDS.ownerPro, role: 'owner', joined_at: '2023-06-01' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', organization_id: ORG_PRO, user_id: USER_IDS.managerPro, role: 'admin', joined_at: '2023-07-15' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06', organization_id: ORG_PRO, user_id: USER_IDS.employeePro, role: 'member', joined_at: '2023-09-01' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07', organization_id: ORG_ENTERPRISE, user_id: USER_IDS.ownerEnterprise, role: 'owner', joined_at: '2022-01-01' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c08', organization_id: ORG_ENTERPRISE, user_id: USER_IDS.managerEnterprise, role: 'admin', joined_at: '2022-03-01' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c09', organization_id: ORG_ENTERPRISE, user_id: USER_IDS.employeeEnterprise, role: 'member', joined_at: '2022-06-01' },
  ], { onConflict: 'id' });

  if (error) console.error('Error seeding organization members:', error);
  else console.log('✅ Organization members seeded');
  return { data, error };
}

async function seedCRMCompanies() {
  console.log('Seeding CRM companies...');
  const { data, error } = await supabase.from('crm_companies').upsert([
    { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', organization_id: ORG_PRO, name: 'TechCorp France', siret: '11122233344455', website: 'https://techcorp.fr', industry: 'Technologie', size: '51-200', address_line1: '15 Rue de l\'Innovation', city: 'Lyon', postal_code: '69001', country: 'France', phone: '+33 4 72 00 00 01', email: 'contact@techcorp.fr' },
    { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', organization_id: ORG_PRO, name: 'Digital Solutions', siret: '22233344455566', website: 'https://digitalsolutions.fr', industry: 'Services', size: '11-50', address_line1: '8 Boulevard Haussmann', city: 'Paris', postal_code: '75009', country: 'France', phone: '+33 1 42 00 00 02', email: 'info@digitalsolutions.fr' },
    { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', organization_id: ORG_PRO, name: 'Startup Innovation', siret: '33344455566677', website: 'https://startupinno.fr', industry: 'Technologie', size: '1-10', address_line1: '42 Rue des Startups', city: 'Bordeaux', postal_code: '33000', country: 'France', phone: '+33 5 56 00 00 03', email: 'hello@startupinno.fr' },
    { id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', organization_id: ORG_PRO, name: 'Consulting Group', siret: '44455566677788', website: 'https://consultinggroup.fr', industry: 'Conseil', size: '201-500', address_line1: '100 Avenue Charles de Gaulle', city: 'Neuilly-sur-Seine', postal_code: '92200', country: 'France', phone: '+33 1 46 00 00 04', email: 'contact@consultinggroup.fr' },
  ], { onConflict: 'id' });

  if (error) console.error('Error seeding CRM companies:', error);
  else console.log('✅ CRM companies seeded');
  return { data, error };
}

async function seedCRMContacts() {
  console.log('Seeding CRM contacts...');
  const { data, error } = await supabase.from('crm_contacts').upsert([
    { id: '100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', organization_id: ORG_PRO, first_name: 'Antoine', last_name: 'Dubois', email: 'antoine.dubois@techcorp.fr', phone: '+33 4 72 00 00 11', mobile: '+33 6 10 00 00 01', job_title: 'Directeur Technique', company_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', source: 'linkedin', owner_id: USER_IDS.managerPro },
    { id: '100ebc99-9c0b-4ef8-bb6d-6bb9bd380002', organization_id: ORG_PRO, first_name: 'Julie', last_name: 'Martin', email: 'julie.martin@techcorp.fr', phone: '+33 4 72 00 00 12', mobile: '+33 6 10 00 00 02', job_title: 'Responsable Achats', company_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', source: 'website', owner_id: USER_IDS.managerPro },
    { id: '100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', organization_id: ORG_PRO, first_name: 'Marc', last_name: 'Lefevre', email: 'marc.lefevre@digitalsolutions.fr', phone: '+33 1 42 00 00 21', mobile: '+33 6 20 00 00 01', job_title: 'CEO', company_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', source: 'referral', owner_id: USER_IDS.ownerPro },
    { id: '100ebc99-9c0b-4ef8-bb6d-6bb9bd380004', organization_id: ORG_PRO, first_name: 'Sophie', last_name: 'Rousseau', email: 'sophie.rousseau@startupinno.fr', phone: '+33 5 56 00 00 31', mobile: '+33 6 30 00 00 01', job_title: 'Fondatrice', company_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', source: 'website', owner_id: USER_IDS.employeePro },
    { id: '100ebc99-9c0b-4ef8-bb6d-6bb9bd380005', organization_id: ORG_PRO, first_name: 'Philippe', last_name: 'Moreau', email: 'philippe.moreau@consultinggroup.fr', phone: '+33 1 46 00 00 41', mobile: '+33 6 40 00 00 01', job_title: 'Directeur General', company_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', source: 'linkedin', owner_id: USER_IDS.ownerPro },
  ], { onConflict: 'id' });

  if (error) console.error('Error seeding CRM contacts:', error);
  else console.log('✅ CRM contacts seeded');
  return { data, error };
}

async function main() {
  console.log('🌱 Starting Sedona CRM seed via API...\n');

  await seedOrganizations();
  await seedUsers();
  await seedOrganizationMembers();
  await seedCRMCompanies();
  await seedCRMContacts();

  console.log('\n✨ Seed completed!');
  console.log('\nTest accounts:');
  console.log('  owner.pro@test.sedona.ai / Owner123!');
  console.log('  manager.pro@test.sedona.ai / Manager123!');
  console.log('  employee.pro@test.sedona.ai / Employee123!');
}

main().catch(console.error);
