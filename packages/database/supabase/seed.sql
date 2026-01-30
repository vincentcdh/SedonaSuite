-- Sedona.AI - Seed Data
-- This file is used to populate the database with initial data for development

-- Note: In production, seed data should be handled through migrations or admin UI
-- This file is primarily for local development and testing

-- Example seed data (uncomment and modify as needed)

-- Insert default plan types
-- INSERT INTO plan_types (id, name, slug) VALUES
--   (gen_random_uuid(), 'Free', 'free'),
--   (gen_random_uuid(), 'Pro', 'pro'),
--   (gen_random_uuid(), 'Enterprise', 'enterprise');

-- Insert demo organization
-- INSERT INTO organizations (id, name, slug, plan_type) VALUES
--   (gen_random_uuid(), 'Demo Company', 'demo-company', 'free');

SELECT 'Seed data loaded successfully' AS status;
