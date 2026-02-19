// ===========================================
// FEATURE GUARDS HOOKS
// ===========================================
// React hooks for checking paid feature availability in UI
// Use these to conditionally render or disable features

import { useModuleSubscription, type ModuleId } from './useModuleSubscriptions'

// ===========================================
// TYPES
// ===========================================

export interface FeatureGuardResult {
  /** Whether the feature is available */
  isAvailable: boolean
  /** Whether data is still loading */
  isLoading: boolean
  /** Whether the module is in paid status */
  isPaid: boolean
  /** Reason why feature is unavailable (for display) */
  reason?: string
}

export type CrmPaidFeature =
  | 'export_csv'
  | 'advanced_filters'
  | 'email_tracking'
  | 'detailed_reports'
  | 'unlimited_custom_fields'
  | 'bulk_actions'
  | 'api_access'
  | 'integrations'

export type InvoicePaidFeature =
  | 'recurring_invoices'
  | 'custom_templates'
  | 'auto_reminders'
  | 'multi_currency'
  | 'accounting_export'
  | 'credit_notes'
  | 'payment_tracking'
  | 'bank_reconciliation'

export type ProjectsPaidFeature =
  | 'gantt_view'
  | 'advanced_time_tracking'
  | 'task_dependencies'
  | 'unlimited_subtasks'
  | 'budget_tracking'
  | 'client_portal'
  | 'checklists'
  | 'custom_labels'
  | 'advanced_reports'

export type TicketsPaidFeature =
  | 'knowledge_base'
  | 'automation_rules'
  | 'custom_sla'
  | 'unlimited_canned_responses'
  | 'multi_channel'
  | 'customer_satisfaction'
  | 'ticket_reports'

export type HrPaidFeature =
  | 'time_tracking'
  | 'alerts'
  | 'periodic_interviews'
  | 'document_storage'
  | 'confidential_notes'
  | 'hr_reports'
  | 'org_chart'

export type DocsPaidFeature =
  | 'version_history'
  | 'file_locking'
  | 'advanced_permissions'
  | 'external_sharing'
  | 'document_workflows'
  | 'unlimited_storage'

export type AnalyticsPaidFeature =
  | 'custom_dashboards'
  | 'custom_widgets'
  | 'export_reports'
  | 'scheduled_reports'
  | 'ai_insights'
  | 'data_export'
  | 'cross_module_analytics'

// ===========================================
// FEATURE LABELS (French)
// ===========================================

const FEATURE_LABELS: Record<string, string> = {
  // CRM
  export_csv: 'Export CSV',
  advanced_filters: 'Filtres avances',
  email_tracking: 'Suivi des emails',
  detailed_reports: 'Rapports detailles',
  unlimited_custom_fields: 'Champs personnalises illimites',
  bulk_actions: 'Actions groupees',
  api_access: 'Acces API',
  integrations: 'Integrations',
  // Invoice
  recurring_invoices: 'Factures recurrentes',
  custom_templates: 'Modeles personnalises',
  auto_reminders: 'Relances automatiques',
  multi_currency: 'Multi-devises',
  accounting_export: 'Export comptable',
  credit_notes: 'Avoirs',
  payment_tracking: 'Suivi des paiements',
  bank_reconciliation: 'Rapprochement bancaire',
  // Projects
  gantt_view: 'Vue Gantt',
  advanced_time_tracking: 'Suivi du temps avance',
  task_dependencies: 'Dependances entre taches',
  unlimited_subtasks: 'Sous-taches illimitees',
  budget_tracking: 'Suivi de budget',
  client_portal: 'Portail client',
  checklists: 'Checklists',
  custom_labels: 'Labels personnalises',
  advanced_reports: 'Rapports avances',
  // Tickets
  knowledge_base: 'Base de connaissances',
  automation_rules: 'Regles d\'automatisation',
  custom_sla: 'SLA personnalisables',
  unlimited_canned_responses: 'Reponses en template illimitees',
  multi_channel: 'Multi-canal',
  customer_satisfaction: 'Satisfaction client',
  ticket_reports: 'Rapports tickets',
  // HR
  time_tracking: 'Suivi du temps de travail',
  alerts: 'Alertes RH',
  periodic_interviews: 'Entretiens periodiques',
  document_storage: 'Documents employes',
  confidential_notes: 'Notes confidentielles',
  hr_reports: 'Rapports RH',
  org_chart: 'Organigramme',
  // Docs
  version_history: 'Historique des versions',
  file_locking: 'Verrouillage de fichiers',
  advanced_permissions: 'Permissions avancees',
  external_sharing: 'Partage externe',
  document_workflows: 'Workflows documentaires',
  unlimited_storage: 'Stockage illimite',
  // Analytics
  custom_dashboards: 'Tableaux de bord personnalises',
  custom_widgets: 'Widgets personnalises',
  export_reports: 'Export de rapports',
  scheduled_reports: 'Rapports programmes',
  ai_insights: 'Analyses IA',
  data_export: 'Export de donnees',
  cross_module_analytics: 'Analytics inter-modules',
}

function getFeatureLabel(feature: string): string {
  return FEATURE_LABELS[feature] || feature
}

// ===========================================
// GENERIC FEATURE GUARD HOOK
// ===========================================

/**
 * Generic hook to check if a paid feature is available
 */
export function useFeatureGuard(
  organizationId: string | undefined,
  moduleId: ModuleId,
  feature: string
): FeatureGuardResult {
  const { subscription, isLoading } = useModuleSubscription(organizationId, moduleId)

  if (isLoading) {
    return {
      isAvailable: false,
      isLoading: true,
      isPaid: false,
    }
  }

  const isPaid = subscription?.isPaid || false

  if (!isPaid) {
    return {
      isAvailable: false,
      isLoading: false,
      isPaid: false,
      reason: `${getFeatureLabel(feature)} est disponible avec le plan Pro`,
    }
  }

  return {
    isAvailable: true,
    isLoading: false,
    isPaid: true,
  }
}

// ===========================================
// CRM FEATURE GUARDS
// ===========================================

/**
 * Check if a CRM paid feature is available
 */
export function useCrmFeature(
  organizationId: string | undefined,
  feature: CrmPaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'crm', feature)
}

/**
 * Check if CSV export is available
 */
export function useCrmExport(organizationId: string | undefined): FeatureGuardResult {
  return useCrmFeature(organizationId, 'export_csv')
}

/**
 * Check if advanced filters are available
 */
export function useCrmAdvancedFilters(organizationId: string | undefined): FeatureGuardResult {
  return useCrmFeature(organizationId, 'advanced_filters')
}

/**
 * Check if email tracking is available
 */
export function useCrmEmailTracking(organizationId: string | undefined): FeatureGuardResult {
  return useCrmFeature(organizationId, 'email_tracking')
}

/**
 * Check if detailed reports are available
 */
export function useCrmReports(organizationId: string | undefined): FeatureGuardResult {
  return useCrmFeature(organizationId, 'detailed_reports')
}

// ===========================================
// INVOICE FEATURE GUARDS
// ===========================================

/**
 * Check if an Invoice paid feature is available
 */
export function useInvoiceFeature(
  organizationId: string | undefined,
  feature: InvoicePaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'invoice', feature)
}

/**
 * Check if recurring invoices are available
 */
export function useRecurringInvoices(organizationId: string | undefined): FeatureGuardResult {
  return useInvoiceFeature(organizationId, 'recurring_invoices')
}

/**
 * Check if custom templates are available
 */
export function useCustomTemplates(organizationId: string | undefined): FeatureGuardResult {
  return useInvoiceFeature(organizationId, 'custom_templates')
}

/**
 * Check if auto reminders are available
 */
export function useAutoReminders(organizationId: string | undefined): FeatureGuardResult {
  return useInvoiceFeature(organizationId, 'auto_reminders')
}

/**
 * Check if multi-currency is available
 */
export function useMultiCurrency(organizationId: string | undefined): FeatureGuardResult {
  return useInvoiceFeature(organizationId, 'multi_currency')
}

/**
 * Check if accounting export is available
 */
export function useAccountingExport(organizationId: string | undefined): FeatureGuardResult {
  return useInvoiceFeature(organizationId, 'accounting_export')
}

/**
 * Check if credit notes are available
 */
export function useCreditNotes(organizationId: string | undefined): FeatureGuardResult {
  return useInvoiceFeature(organizationId, 'credit_notes')
}

// ===========================================
// PROJECTS FEATURE GUARDS
// ===========================================

/**
 * Check if a Projects paid feature is available
 */
export function useProjectsFeature(
  organizationId: string | undefined,
  feature: ProjectsPaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'projects', feature)
}

/**
 * Check if Gantt view is available
 */
export function useGanttView(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'gantt_view')
}

/**
 * Check if advanced time tracking is available
 */
export function useAdvancedTimeTracking(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'advanced_time_tracking')
}

/**
 * Check if task dependencies are available
 */
export function useTaskDependencies(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'task_dependencies')
}

/**
 * Check if unlimited subtasks are available
 */
export function useUnlimitedSubtasks(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'unlimited_subtasks')
}

/**
 * Check if budget tracking is available
 */
export function useBudgetTracking(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'budget_tracking')
}

/**
 * Check if client portal is available
 */
export function useClientPortal(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'client_portal')
}

/**
 * Check if checklists are available
 */
export function useChecklists(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'checklists')
}

/**
 * Check if custom labels (more than 5) are available
 */
export function useCustomLabels(organizationId: string | undefined): FeatureGuardResult {
  return useProjectsFeature(organizationId, 'custom_labels')
}

// ===========================================
// TICKETS FEATURE GUARDS
// ===========================================

/**
 * Check if a Tickets paid feature is available
 */
export function useTicketsFeature(
  organizationId: string | undefined,
  feature: TicketsPaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'tickets', feature)
}

/**
 * Check if knowledge base is available
 */
export function useKnowledgeBase(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'knowledge_base')
}

/**
 * Check if ticket automation rules are available
 */
export function useTicketAutomation(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'automation_rules')
}

/**
 * Check if custom SLA policies are available
 */
export function useCustomSla(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'custom_sla')
}

/**
 * Check if unlimited canned responses are available
 */
export function useUnlimitedCannedResponses(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'unlimited_canned_responses')
}

/**
 * Check if multi-channel support is available
 */
export function useMultiChannel(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'multi_channel')
}

/**
 * Check if customer satisfaction surveys are available
 */
export function useCustomerSatisfaction(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'customer_satisfaction')
}

/**
 * Check if ticket reports are available
 */
export function useTicketReports(organizationId: string | undefined): FeatureGuardResult {
  return useTicketsFeature(organizationId, 'ticket_reports')
}

// ===========================================
// HR FEATURE GUARDS
// ===========================================

/**
 * Check if an HR paid feature is available
 */
export function useHrFeature(
  organizationId: string | undefined,
  feature: HrPaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'hr', feature)
}

/**
 * Check if time tracking is available
 */
export function useHrTimeTracking(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'time_tracking')
}

/**
 * Check if HR alerts are available
 */
export function useHrAlerts(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'alerts')
}

/**
 * Check if periodic interviews are available
 */
export function usePeriodicInterviews(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'periodic_interviews')
}

/**
 * Check if document storage is available
 */
export function useHrDocumentStorage(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'document_storage')
}

/**
 * Check if confidential notes are available
 */
export function useConfidentialNotes(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'confidential_notes')
}

/**
 * Check if HR reports are available
 */
export function useHrReports(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'hr_reports')
}

/**
 * Check if org chart is available
 */
export function useOrgChart(organizationId: string | undefined): FeatureGuardResult {
  return useHrFeature(organizationId, 'org_chart')
}

// ===========================================
// DOCS FEATURE GUARDS
// ===========================================

/**
 * Check if a Docs paid feature is available
 */
export function useDocsFeature(
  organizationId: string | undefined,
  feature: DocsPaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'docs', feature)
}

/**
 * Check if version history is available
 */
export function useVersionHistory(organizationId: string | undefined): FeatureGuardResult {
  return useDocsFeature(organizationId, 'version_history')
}

/**
 * Check if file locking is available
 */
export function useFileLocking(organizationId: string | undefined): FeatureGuardResult {
  return useDocsFeature(organizationId, 'file_locking')
}

/**
 * Check if advanced permissions are available
 */
export function useAdvancedPermissions(organizationId: string | undefined): FeatureGuardResult {
  return useDocsFeature(organizationId, 'advanced_permissions')
}

/**
 * Check if external sharing is available
 */
export function useExternalSharing(organizationId: string | undefined): FeatureGuardResult {
  return useDocsFeature(organizationId, 'external_sharing')
}

/**
 * Check if document workflows are available
 */
export function useDocumentWorkflows(organizationId: string | undefined): FeatureGuardResult {
  return useDocsFeature(organizationId, 'document_workflows')
}

/**
 * Check if unlimited storage is available
 */
export function useUnlimitedStorage(organizationId: string | undefined): FeatureGuardResult {
  return useDocsFeature(organizationId, 'unlimited_storage')
}

// ===========================================
// ANALYTICS FEATURE GUARDS
// ===========================================

/**
 * Check if an Analytics paid feature is available
 */
export function useAnalyticsFeature(
  organizationId: string | undefined,
  feature: AnalyticsPaidFeature
): FeatureGuardResult {
  return useFeatureGuard(organizationId, 'analytics', feature)
}

/**
 * Check if custom dashboards are available
 */
export function useCustomDashboards(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'custom_dashboards')
}

/**
 * Check if report export is available
 */
export function useReportExport(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'export_reports')
}

/**
 * Check if custom widgets are available
 */
export function useCustomWidgets(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'custom_widgets')
}

/**
 * Check if scheduled reports are available
 */
export function useScheduledReports(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'scheduled_reports')
}

/**
 * Check if AI insights are available
 */
export function useAiInsights(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'ai_insights')
}

/**
 * Check if data export is available
 */
export function useDataExport(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'data_export')
}

/**
 * Check if cross-module analytics are available
 */
export function useCrossModuleAnalytics(organizationId: string | undefined): FeatureGuardResult {
  return useAnalyticsFeature(organizationId, 'cross_module_analytics')
}
