-- ===========================================
-- SEDONA CRM - SEED DATA: TICKETS MODULE
-- ===========================================

BEGIN;

-- ===========================================
-- TICKET CATEGORIES (for PRO organization)
-- ===========================================

INSERT INTO tickets.categories (id, organization_id, name, description, color, icon, is_active, position, created_at)
VALUES
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Support Technique', 'Questions techniques et bugs', '#3B82F6', 'wrench', true, 0, '2023-06-01'),
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Facturation', 'Questions liees a la facturation', '#10B981', 'credit-card', true, 1, '2023-06-01'),
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Commercial', 'Demandes commerciales', '#F59E0B', 'shopping-cart', true, 2, '2023-06-01'),
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Formation', 'Demandes de formation', '#8B5CF6', 'book-open', true, 3, '2023-06-01'),
  ('400ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Autre', 'Autres demandes', '#6B7280', 'help-circle', true, 4, '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TICKET NUMBER SEQUENCE
-- ===========================================

INSERT INTO tickets.number_sequences (id, organization_id, prefix, current_number, padding)
VALUES
  ('410ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT', 12, 5)
ON CONFLICT (organization_id) DO UPDATE SET current_number = 12;

-- ===========================================
-- TICKETS
-- ===========================================

INSERT INTO tickets.tickets (id, organization_id, ticket_number, subject, description, status, priority, assigned_to, category_id, source, requester_name, requester_email, requester_phone, created_by, created_at)
VALUES
  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00001', 'Impossible de generer une facture PDF', 'Quand je clique sur "Exporter PDF", rien ne se passe. J''ai essaye avec Chrome et Firefox.', 'open', 'high', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'email', 'Antoine Dubois', 'antoine.dubois@techcorp.fr', '+33 6 10 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-28'),

  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00002', 'Question sur l''abonnement PRO', 'Bonjour, je voudrais savoir si l''abonnement PRO inclut le support prioritaire ?', 'in_progress', 'normal', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'web', 'Marc Lefevre', 'marc.lefevre@digitalsolutions.fr', '+33 6 20 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-27'),

  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00003', 'Demande de demo pour notre equipe', 'Nous sommes 15 personnes et souhaiterions voir une demo de votre solution.', 'waiting', 'normal', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'web', 'Sophie Rousseau', 'sophie.rousseau@startupinno.fr', '+33 6 30 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-26'),

  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00004', 'Erreur 500 sur le dashboard', 'Je recois une erreur 500 quand j''accede au dashboard depuis ce matin.', 'resolved', 'urgent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'email', 'Philippe Moreau', 'philippe.moreau@consultinggroup.fr', '+33 6 40 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-25'),

  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00005', 'Formation sur le module CRM', 'Nous aimerions organiser une formation pour notre equipe commerciale sur le module CRM.', 'closed', 'low', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'phone', 'Camille Bernard', 'camille.bernard@ecovert.fr', '+33 6 50 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-20'),

  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00006', 'Bug affichage mobile', 'Le menu ne s''affiche pas correctement sur iPhone.', 'open', 'high', NULL, '400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'web', 'Thomas Garcia', 'thomas.garcia@gmail.com', '+33 6 60 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2024-01-30'),

  ('420ebc99-9c0b-4ef8-bb6d-6bb9bd380007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'TKT-00007', 'Integration API Stripe', 'Comment puis-je integrer Stripe pour les paiements ?', 'in_progress', 'normal', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '400ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'email', 'Laura Petit', 'laura.petit@outlook.fr', '+33 6 70 00 00 01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', '2024-01-29')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TICKET MESSAGES
-- ===========================================

INSERT INTO tickets.messages (id, ticket_id, author_type, author_id, author_name, author_email, content, content_type, message_type, is_internal, created_at)
VALUES
  -- TKT-00001 conversation
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380001', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'customer', NULL, 'Antoine Dubois', 'antoine.dubois@techcorp.fr', 'Quand je clique sur "Exporter PDF", rien ne se passe. J''ai essaye avec Chrome et Firefox.', 'text', 'reply', false, '2024-01-28 09:15:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380002', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'agent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Claire Moreau', 'manager.pro@test.sedona.ai', 'Bonjour Antoine, merci pour votre signalement. Pouvez-vous me donner le numero de la facture concernee ?', 'text', 'reply', false, '2024-01-28 10:30:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380003', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'customer', NULL, 'Antoine Dubois', 'antoine.dubois@techcorp.fr', 'Il s''agit de la facture FAC-2024-0001.', 'text', 'reply', false, '2024-01-28 11:00:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380004', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'agent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Claire Moreau', NULL, 'Note interne: Verifier les logs serveur pour cette facture', 'text', 'note', true, '2024-01-28 11:15:00'),

  -- TKT-00002 conversation
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380005', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'customer', NULL, 'Marc Lefevre', 'marc.lefevre@digitalsolutions.fr', 'Bonjour, je voudrais savoir si l''abonnement PRO inclut le support prioritaire ?', 'text', 'reply', false, '2024-01-27 14:00:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380006', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'agent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Jean-Pierre Martin', 'owner.pro@test.sedona.ai', 'Bonjour Marc, oui le plan PRO inclut le support prioritaire avec un temps de reponse garanti de 4h en jours ouvres.', 'text', 'reply', false, '2024-01-27 15:30:00'),

  -- TKT-00004 conversation (resolved)
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380007', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'customer', NULL, 'Philippe Moreau', 'philippe.moreau@consultinggroup.fr', 'Je recois une erreur 500 quand j''accede au dashboard depuis ce matin.', 'text', 'reply', false, '2024-01-25 08:00:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380008', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'agent', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Claire Moreau', NULL, 'Bonjour Philippe, nous avons identifie le probleme et nos equipes travaillent dessus. Nous vous tenons informe.', 'text', 'reply', false, '2024-01-25 08:30:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380009', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'system', NULL, 'Systeme', NULL, 'Le probleme a ete resolu. Un deploiement correctif a ete effectue.', 'text', 'status_change', false, '2024-01-25 10:00:00'),
  ('430ebc99-9c0b-4ef8-bb6d-6bb9bd380010', '420ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'customer', NULL, 'Philippe Moreau', 'philippe.moreau@consultinggroup.fr', 'Merci, ca fonctionne maintenant !', 'text', 'reply', false, '2024-01-25 10:30:00')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- TICKET TAGS
-- ===========================================

INSERT INTO tickets.tags (id, organization_id, name, color, created_at)
VALUES
  ('440ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Bug', '#EF4444', '2023-06-01'),
  ('440ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Question', '#3B82F6', '2023-06-01'),
  ('440ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Amelioration', '#10B981', '2023-06-01'),
  ('440ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Urgent', '#F59E0B', '2023-06-01'),
  ('440ebc99-9c0b-4ef8-bb6d-6bb9bd380005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Client VIP', '#8B5CF6', '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- CANNED RESPONSES
-- ===========================================

INSERT INTO tickets.canned_responses (id, organization_id, name, content, category, is_personal, shortcut, created_by, created_at)
VALUES
  ('450ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Accuse de reception', 'Bonjour,\n\nNous avons bien recu votre demande et la traitons dans les meilleurs delais.\n\nCordialement,\nL''equipe Support', 'General', false, '/accuse', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-06-01'),
  ('450ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Demande d''informations', 'Bonjour,\n\nAfin de mieux vous aider, pourriez-vous nous fournir plus de details sur votre probleme ?\n\nCordialement,\nL''equipe Support', 'General', false, '/info', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-06-01'),
  ('450ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Cloture ticket', 'Bonjour,\n\nVotre demande a ete traitee. N''hesitez pas a nous recontacter si vous avez d''autres questions.\n\nCordialement,\nL''equipe Support', 'Cloture', false, '/close', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-06-01')
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- KNOWLEDGE BASE ARTICLES
-- ===========================================

INSERT INTO tickets.kb_articles (id, organization_id, title, slug, content, excerpt, status, view_count, helpful_count, tags, created_by, created_at, published_at)
VALUES
  ('460ebc99-9c0b-4ef8-bb6d-6bb9bd380001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Comment creer une facture', 'comment-creer-une-facture', '# Comment creer une facture\n\n## Etape 1: Acceder au module Facturation\nCliquez sur "Facturation" dans le menu lateral.\n\n## Etape 2: Creer une nouvelle facture\nCliquez sur le bouton "Nouvelle facture".\n\n## Etape 3: Remplir les informations\nSelectionnez le client, ajoutez les lignes de produits/services, et validez.', 'Guide complet pour creer une facture dans Sedona CRM', 'published', 156, 42, ARRAY['facturation', 'guide'], 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-06-15', '2023-06-15'),

  ('460ebc99-9c0b-4ef8-bb6d-6bb9bd380002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Exporter vos donnees au format CSV', 'exporter-donnees-csv', '# Exporter vos donnees au format CSV\n\nVous pouvez exporter vos contacts, entreprises et opportunites au format CSV.\n\n## Depuis le module CRM\n1. Selectionnez les elements a exporter\n2. Cliquez sur "Exporter"\n3. Choisissez le format CSV', 'Guide pour exporter vos donnees CRM au format CSV', 'published', 89, 28, ARRAY['crm', 'export', 'csv'], 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2023-07-01', '2023-07-01'),

  ('460ebc99-9c0b-4ef8-bb6d-6bb9bd380003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Gerer les permissions utilisateurs', 'gerer-permissions-utilisateurs', '# Gerer les permissions utilisateurs\n\n## Roles disponibles\n- **Owner**: Acces complet\n- **Manager**: Gestion de l''equipe\n- **Employee**: Acces limite\n\n## Modifier un role\nAccedez aux parametres > Equipe > Selectionnez un membre > Modifiez son role', 'Guide de gestion des permissions et roles', 'published', 67, 18, ARRAY['permissions', 'equipe', 'roles'], 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', '2023-08-01', '2023-08-01'),

  ('460ebc99-9c0b-4ef8-bb6d-6bb9bd380004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Integrer Stripe pour les paiements', 'integrer-stripe-paiements', '# Integrer Stripe pour les paiements\n\nContenu en cours de redaction...', 'Guide d''integration de Stripe (bientot disponible)', 'draft', 0, 0, ARRAY['integration', 'stripe', 'paiement'], 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', '2024-01-15', NULL)
ON CONFLICT (id) DO NOTHING;

COMMIT;

SELECT 'Tickets seed data loaded successfully' AS status;
