-- ===========================================
-- SEDONA CRM - SEED DATA: CRM MODULE
-- ===========================================

BEGIN;

-- Variables for organization IDs
-- FREE: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01
-- PRO:  a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02
-- ENT:  a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03

-- ===========================================
-- PIPELINES (for PRO organization)
-- ===========================================

INSERT INTO crm.pipelines (id, organization_id, name, description, is_default, created_at)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Pipeline Commercial', 'Pipeline principal pour les ventes B2B', true, '2023-06-01'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Pipeline Partenariats', 'Pour les opportunites de partenariat', false, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- PIPELINE STAGES
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
-- COMPANIES (for PRO organization)
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
-- CONTACTS (for PRO organization)
-- ===========================================

INSERT INTO crm.contacts (id, organization_id, first_name, last_name, email, phone, mobile, job_title, company_id, source, owner_id, created_at)
VALUES
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Antoine', 'Dubois', 'antoine.dubois@techcorp.fr', '+33 4 72 00 00 11', '+33 6 10 00 00 01', 'Directeur Technique', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'linkedin', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-06-20'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Julie', 'Martin', 'julie.martin@techcorp.fr', '+33 4 72 00 00 12', '+33 6 10 00 00 02', 'Responsable Achats', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'website', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-06-25'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Marc', 'Lefevre', 'marc.lefevre@digitalsolutions.fr', '+33 1 42 00 00 21', '+33 6 20 00 00 01', 'CEO', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'referral', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-07-05'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Sophie', 'Rousseau', 'sophie.rousseau@startupinno.fr', '+33 5 56 00 00 31', '+33 6 30 00 00 01', 'Fondatrice', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', 'website', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2023-08-20'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Philippe', 'Moreau', 'philippe.moreau@consultinggroup.fr', '+33 1 46 00 00 41', '+33 6 40 00 00 01', 'Directeur General', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', 'linkedin', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-09-10'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Camille', 'Bernard', 'camille.bernard@ecovert.fr', '+33 2 40 00 00 51', '+33 6 50 00 00 01', 'Responsable RSE', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f05', 'website', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-10-15'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Thomas', 'Garcia', 'thomas.garcia@gmail.com', NULL, '+33 6 60 00 00 01', 'Consultant Independant', NULL, 'manual', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2023-11-01'),
  ('100ebc99-9c0b-4ef8-bb6d-6bb9bd380008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Laura', 'Petit', 'laura.petit@outlook.fr', NULL, '+33 6 70 00 00 01', 'Freelance Marketing', NULL, 'referral', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-11-15')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- DEALS (for PRO organization)
-- ===========================================

INSERT INTO crm.deals (id, organization_id, pipeline_id, stage_id, name, amount, currency, expected_close_date, contact_id, company_id, status, owner_id, created_at)
VALUES
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Migration Cloud TechCorp', 45000.00, 'EUR', '2024-03-15', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'open', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-12-01'),
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e04', 'Contrat Annuel Digital Solutions', 120000.00, 'EUR', '2024-02-28', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 'open', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-11-15'),
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'POC Startup Innovation', 8500.00, 'EUR', '2024-04-01', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', 'open', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-10'),
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e05', 'Formation Consulting Group', 25000.00, 'EUR', '2024-01-15', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', 'won', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-10-01'),
  ('110ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Audit Environnemental EcoVert', 15000.00, 'EUR', '2024-05-01', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f05', 'open', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-20')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- ACTIVITIES
-- ===========================================

INSERT INTO crm.activities (id, organization_id, type, subject, description, contact_id, company_id, deal_id, due_date, created_by, created_at)
VALUES
  ('120ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'call', 'Appel de decouverte', 'Premier contact pour comprendre les besoins', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', '110ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '2024-02-01 10:00:00', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-25'),
  ('120ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'meeting', 'Demo produit', 'Presentation de la solution', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', '110ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '2024-02-05 14:00:00', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-20'),
  ('120ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'email', 'Envoi proposition commerciale', 'Proposition envoyee par email', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', '110ebc99-9c0b-4ef8-bb6d-6bb9bd380001', NULL, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-28'),
  ('120ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'task', 'Preparer contrat', 'Rediger le contrat final', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', '110ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '2024-02-10 09:00:00', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-30'),
  ('120ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'note', 'Feedback positif', 'Le client a apprecie la demo, interesse par les fonctionnalites avancees', '100ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', '110ebc99-9c0b-4ef8-bb6d-6bb9bd380003', NULL, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-15')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TAGS
-- ===========================================

INSERT INTO crm.tags (id, organization_id, name, color, created_at)
VALUES
  ('130ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'VIP', '#EF4444', '2023-06-01'),
  ('130ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Prospect Chaud', '#F59E0B', '2023-06-01'),
  ('130ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Tech', '#3B82F6', '2023-06-01'),
  ('130ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Partenaire', '#10B981', '2023-06-01'),
  ('130ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'PME', '#8B5CF6', '2023-06-01')
ON CONFLICT (id) DO NOTHING;

COMMIT;

SELECT 'CRM seed data loaded successfully' AS status;
