-- ===========================================
-- SEDONA CRM - COMPLETE SEED DATA
-- ===========================================
-- This file combines all seed files for easy execution
-- Run with: psql $DATABASE_URL -f seed_all.sql
-- Or via Supabase: supabase db reset (after adding to supabase/seed.sql)

\echo 'Starting Sedona CRM seed data import...'
\echo ''

-- Import base data
\echo 'Importing base data (organizations, users, members)...'
\i seed.sql

-- Import CRM data
\echo 'Importing CRM data...'
\i seed_crm.sql

-- Import Invoice data
\echo 'Importing Invoice data...'
\i seed_invoice.sql

-- Import Projects data
\echo 'Importing Projects data...'
\i seed_projects.sql

-- Import Tickets data
\echo 'Importing Tickets data...'
\i seed_tickets.sql

-- Import HR data
\echo 'Importing HR data...'
\i seed_hr.sql

\echo ''
\echo '✅ All seed data imported successfully!'
\echo ''
\echo 'Test accounts created:'
\echo '  Owners:    owner.free@test.sedona.ai    / Owner123!'
\echo '             owner.pro@test.sedona.ai     / Owner123!'
\echo '             owner.enterprise@test.sedona.ai / Owner123!'
\echo ''
\echo '  Managers:  manager.free@test.sedona.ai  / Manager123!'
\echo '             manager.pro@test.sedona.ai   / Manager123!'
\echo '             manager.enterprise@test.sedona.ai / Manager123!'
\echo ''
\echo '  Employees: employee.free@test.sedona.ai / Employee123!'
\echo '             employee.pro@test.sedona.ai  / Employee123!'
\echo '             employee.enterprise@test.sedona.ai / Employee123!'
