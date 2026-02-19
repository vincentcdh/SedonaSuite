-- ===========================================
-- 052_modules_seed_data.sql
-- Seed data for modules and limits
-- ===========================================
-- Dependencies: 051_modules_tables.sql
-- Rollback: rollbacks/052_rollback.sql
-- ===========================================

BEGIN;

-- ===========================================
-- 1. POPULATE MODULES REFERENCE DATA
-- ===========================================

INSERT INTO public.modules (id, name, description, icon, color, base_price_monthly, base_price_yearly, display_order) VALUES
  ('crm', 'CRM', 'Gestion de la relation client: contacts, entreprises, opportunites', 'users', '#3B82F6', 1490, 14900, 1),
  ('invoice', 'Facturation', 'Devis, factures, avoirs et suivi des paiements', 'file-text', '#22C55E', 990, 9900, 2),
  ('projects', 'Projets', 'Gestion de projets, taches et suivi du temps', 'folder-kanban', '#F97316', 990, 9900, 3),
  ('tickets', 'Tickets & Support', 'Support client, tickets, base de connaissances', 'ticket', '#8B5CF6', 990, 9900, 4),
  ('hr', 'Ressources Humaines', 'Gestion des employes, conges, contrats', 'user-circle', '#EF4444', 1490, 14900, 5),
  ('docs', 'Documents', 'Stockage et partage de documents', 'file-stack', '#6366F1', 490, 4900, 6),
  ('analytics', 'Analytics', 'Tableaux de bord et analyses avancees', 'bar-chart-3', '#14B8A6', 990, 9900, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  base_price_monthly = EXCLUDED.base_price_monthly,
  base_price_yearly = EXCLUDED.base_price_yearly,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- ===========================================
-- 2. POPULATE MODULE LIMITS - CRM
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('crm', 'free', 'max_contacts', 100, 'Maximum number of contacts'),
  ('crm', 'free', 'max_companies', 50, 'Maximum number of companies'),
  ('crm', 'free', 'max_deals', 25, 'Maximum number of active deals'),
  ('crm', 'free', 'max_pipelines', 1, 'Maximum number of pipelines'),
  ('crm', 'free', 'max_custom_fields', 5, 'Maximum number of custom fields'),
  ('crm', 'paid', 'max_contacts', -1, 'Unlimited contacts'),
  ('crm', 'paid', 'max_companies', -1, 'Unlimited companies'),
  ('crm', 'paid', 'max_deals', -1, 'Unlimited deals'),
  ('crm', 'paid', 'max_pipelines', -1, 'Unlimited pipelines'),
  ('crm', 'paid', 'max_custom_fields', -1, 'Unlimited custom fields')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 3. POPULATE MODULE LIMITS - INVOICE
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('invoice', 'free', 'max_invoices_per_month', 10, 'Maximum invoices per month'),
  ('invoice', 'free', 'max_quotes_per_month', 15, 'Maximum quotes per month'),
  ('invoice', 'free', 'max_clients', 20, 'Maximum number of clients'),
  ('invoice', 'free', 'max_products', 50, 'Maximum number of products'),
  ('invoice', 'free', 'recurring_invoices', 0, 'Recurring invoices (0 = disabled)'),
  ('invoice', 'paid', 'max_invoices_per_month', -1, 'Unlimited invoices'),
  ('invoice', 'paid', 'max_quotes_per_month', -1, 'Unlimited quotes'),
  ('invoice', 'paid', 'max_clients', -1, 'Unlimited clients'),
  ('invoice', 'paid', 'max_products', -1, 'Unlimited products'),
  ('invoice', 'paid', 'recurring_invoices', -1, 'Unlimited recurring invoices')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 4. POPULATE MODULE LIMITS - PROJECTS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('projects', 'free', 'max_projects', 3, 'Maximum number of projects'),
  ('projects', 'free', 'max_tasks_per_project', 50, 'Maximum tasks per project'),
  ('projects', 'free', 'max_members_per_project', 5, 'Maximum members per project'),
  ('projects', 'free', 'time_tracking', 0, 'Time tracking (0 = disabled)'),
  ('projects', 'paid', 'max_projects', -1, 'Unlimited projects'),
  ('projects', 'paid', 'max_tasks_per_project', -1, 'Unlimited tasks'),
  ('projects', 'paid', 'max_members_per_project', -1, 'Unlimited members'),
  ('projects', 'paid', 'time_tracking', -1, 'Time tracking enabled')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 5. POPULATE MODULE LIMITS - TICKETS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('tickets', 'free', 'max_tickets_per_month', 50, 'Maximum tickets per month'),
  ('tickets', 'free', 'max_kb_articles', 10, 'Maximum knowledge base articles'),
  ('tickets', 'free', 'max_canned_responses', 10, 'Maximum canned responses'),
  ('tickets', 'free', 'sla_policies', 1, 'Maximum SLA policies'),
  ('tickets', 'free', 'automation_rules', 0, 'Automation rules (0 = disabled)'),
  ('tickets', 'paid', 'max_tickets_per_month', -1, 'Unlimited tickets'),
  ('tickets', 'paid', 'max_kb_articles', -1, 'Unlimited KB articles'),
  ('tickets', 'paid', 'max_canned_responses', -1, 'Unlimited canned responses'),
  ('tickets', 'paid', 'sla_policies', -1, 'Unlimited SLA policies'),
  ('tickets', 'paid', 'automation_rules', -1, 'Unlimited automation rules')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 6. POPULATE MODULE LIMITS - HR
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('hr', 'free', 'max_employees', 5, 'Maximum number of employees'),
  ('hr', 'free', 'max_leave_types', 3, 'Maximum leave types'),
  ('hr', 'free', 'max_contracts_per_employee', 1, 'Maximum contracts per employee'),
  ('hr', 'free', 'document_storage', 0, 'Document storage (0 = disabled)'),
  ('hr', 'paid', 'max_employees', -1, 'Unlimited employees'),
  ('hr', 'paid', 'max_leave_types', -1, 'Unlimited leave types'),
  ('hr', 'paid', 'max_contracts_per_employee', -1, 'Unlimited contracts'),
  ('hr', 'paid', 'document_storage', -1, 'Document storage enabled')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 7. POPULATE MODULE LIMITS - DOCS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('docs', 'free', 'max_storage_mb', 500, 'Maximum storage in MB'),
  ('docs', 'free', 'max_folders', 10, 'Maximum number of folders'),
  ('docs', 'free', 'max_file_size_mb', 10, 'Maximum file size in MB'),
  ('docs', 'free', 'version_history', 0, 'Version history (0 = disabled)'),
  ('docs', 'paid', 'max_storage_mb', -1, 'Unlimited storage'),
  ('docs', 'paid', 'max_folders', -1, 'Unlimited folders'),
  ('docs', 'paid', 'max_file_size_mb', 100, 'Max 100MB per file'),
  ('docs', 'paid', 'version_history', -1, 'Full version history')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

-- ===========================================
-- 8. POPULATE MODULE LIMITS - ANALYTICS
-- ===========================================

INSERT INTO public.module_limits (module_id, tier, limit_key, limit_value, description) VALUES
  ('analytics', 'free', 'max_dashboards', 1, 'Maximum dashboards'),
  ('analytics', 'free', 'max_widgets_per_dashboard', 4, 'Maximum widgets per dashboard'),
  ('analytics', 'free', 'data_retention_days', 30, 'Data retention in days'),
  ('analytics', 'free', 'export_reports', 0, 'Export reports (0 = disabled)'),
  ('analytics', 'paid', 'max_dashboards', -1, 'Unlimited dashboards'),
  ('analytics', 'paid', 'max_widgets_per_dashboard', -1, 'Unlimited widgets'),
  ('analytics', 'paid', 'data_retention_days', -1, 'Unlimited retention'),
  ('analytics', 'paid', 'export_reports', -1, 'Export enabled')
ON CONFLICT (module_id, tier, limit_key) DO UPDATE SET
  limit_value = EXCLUDED.limit_value,
  description = EXCLUDED.description;

COMMIT;
