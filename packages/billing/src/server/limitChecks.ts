// ===========================================
// MODULE LIMIT CHECKS
// ===========================================
// Server-side functions to check module limits before operations
// Uses Supabase RPC functions defined in migration 043

import { getSupabaseClient } from '@sedona/database'
import type { ModuleId } from './modules'

// Type assertion helper - RPC functions and module_usage table exist in DB
// but TypeScript types haven't been regenerated after migration 043
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any

// ===========================================
// TYPES
// ===========================================

export interface LimitCheckResult {
  allowed: boolean
  currentUsage: number
  limit: number
  isUnlimited: boolean
}

export interface ModuleLimitInfo {
  moduleId: ModuleId
  limitKey: string
  current: number
  limit: number
  isUnlimited: boolean
}

export class ModuleLimitExceededError extends Error {
  public readonly moduleId: ModuleId
  public readonly limitKey: string
  public readonly currentUsage: number
  public readonly limit: number

  constructor(moduleId: ModuleId, limitKey: string, currentUsage: number, limit: number) {
    const friendlyLimitName = formatLimitKey(limitKey)
    super(
      `Limite atteinte pour ${friendlyLimitName}. ` +
      `Utilisation: ${currentUsage}/${limit}. ` +
      `Passez au plan Pro pour debloquer des limites illimitees.`
    )
    this.name = 'ModuleLimitExceededError'
    this.moduleId = moduleId
    this.limitKey = limitKey
    this.currentUsage = currentUsage
    this.limit = limit
  }
}

// ===========================================
// LIMIT KEY LABELS (French)
// ===========================================

const LIMIT_KEY_LABELS: Record<string, string> = {
  // CRM
  max_contacts: 'contacts',
  max_companies: 'entreprises',
  max_deals: 'opportunites',
  max_pipelines: 'pipelines',
  max_custom_fields: 'champs personnalises',
  // Invoice
  max_invoices_per_month: 'factures ce mois',
  max_quotes_per_month: 'devis ce mois',
  max_clients: 'clients',
  max_products: 'produits',
  recurring_invoices: 'factures recurrentes',
  // Projects
  max_projects: 'projets',
  max_tasks_per_project: 'taches par projet',
  max_members_per_project: 'membres par projet',
  time_tracking: 'suivi du temps',
  // Tickets
  max_tickets_per_month: 'tickets ce mois',
  max_kb_articles: 'articles de base de connaissances',
  max_canned_responses: 'reponses predefinies',
  sla_policies: 'politiques SLA',
  automation_rules: 'regles d\'automatisation',
  // HR
  max_employees: 'employes',
  max_leave_types: 'types de conges',
  max_contracts_per_employee: 'contrats par employe',
  document_storage: 'stockage de documents',
  // Docs
  max_storage_mb: 'stockage (Mo)',
  max_folders: 'dossiers',
  max_file_size_mb: 'taille de fichier (Mo)',
  version_history: 'historique des versions',
  // Analytics
  max_dashboards: 'tableaux de bord',
  max_widgets_per_dashboard: 'widgets par tableau de bord',
  data_retention_days: 'jours de retention des donnees',
  export_reports: 'export de rapports',
}

function formatLimitKey(limitKey: string): string {
  return LIMIT_KEY_LABELS[limitKey] || limitKey.replace(/_/g, ' ')
}

// ===========================================
// SERVER-SIDE LIMIT CHECK FUNCTIONS
// ===========================================

/**
 * Check if an action is allowed based on module limits
 * Calls the check_module_limit RPC function
 */
export async function checkModuleLimit(
  organizationId: string,
  moduleId: ModuleId,
  limitKey: string
): Promise<LimitCheckResult> {
  // Cast to any - RPC functions exist but TypeScript types not regenerated
  const supabase = getSupabaseClient() as SupabaseClientAny

  // Call the RPC function to check if limit allows action
  const { data: allowed, error: checkError } = await supabase.rpc('check_module_limit', {
    p_org_id: organizationId,
    p_module_id: moduleId,
    p_limit_key: limitKey,
  })

  if (checkError) {
    console.error('Error checking module limit:', checkError)
    // On error, allow the action (fail open for better UX, DB constraints will catch abuse)
    return {
      allowed: true,
      currentUsage: 0,
      limit: -1,
      isUnlimited: true,
    }
  }

  // Get current limit value for detailed info
  const { data: limit, error: limitError } = await supabase.rpc('get_module_limit', {
    p_org_id: organizationId,
    p_module_id: moduleId,
    p_limit_key: limitKey,
  })

  if (limitError) {
    console.error('Error getting module limit:', limitError)
  }

  // Get current usage (approximation from module_usage table)
  const { data: usageData } = await supabase
    .from('module_usage')
    .select('current_count')
    .eq('organization_id', organizationId)
    .eq('module_id', moduleId)
    .eq('limit_key', limitKey)
    .lte('period_start', new Date().toISOString())
    .gt('period_end', new Date().toISOString())
    .single()

  const currentUsage = usageData?.current_count ?? 0
  const limitValue = limit ?? 0
  const isUnlimited = limitValue === -1

  return {
    allowed: allowed ?? true,
    currentUsage,
    limit: limitValue,
    isUnlimited,
  }
}

/**
 * Assert that an action is allowed, throw ModuleLimitExceededError if not
 * Use this before creating resources to enforce limits
 */
export async function assertModuleLimit(
  organizationId: string,
  moduleId: ModuleId,
  limitKey: string
): Promise<void> {
  const result = await checkModuleLimit(organizationId, moduleId, limitKey)

  if (!result.allowed) {
    throw new ModuleLimitExceededError(
      moduleId,
      limitKey,
      result.currentUsage,
      result.limit
    )
  }
}

/**
 * Get detailed limit info for a module feature
 */
export async function getModuleLimitInfo(
  organizationId: string,
  moduleId: ModuleId,
  limitKey: string
): Promise<ModuleLimitInfo> {
  const result = await checkModuleLimit(organizationId, moduleId, limitKey)

  return {
    moduleId,
    limitKey,
    current: result.currentUsage,
    limit: result.limit,
    isUnlimited: result.isUnlimited,
  }
}

/**
 * Check multiple limits at once (for complex operations)
 */
export async function checkMultipleLimits(
  organizationId: string,
  checks: Array<{ moduleId: ModuleId; limitKey: string }>
): Promise<{ allAllowed: boolean; results: Map<string, LimitCheckResult> }> {
  const results = new Map<string, LimitCheckResult>()
  let allAllowed = true

  for (const check of checks) {
    const key = `${check.moduleId}:${check.limitKey}`
    const result = await checkModuleLimit(organizationId, check.moduleId, check.limitKey)
    results.set(key, result)
    if (!result.allowed) {
      allAllowed = false
    }
  }

  return { allAllowed, results }
}

/**
 * Check if a paid feature is available (limit > 0 or isPaid)
 * For features like recurring_invoices where 0 = disabled, -1 = enabled
 */
export async function isPaidFeatureEnabled(
  organizationId: string,
  moduleId: ModuleId,
  featureKey: string
): Promise<boolean> {
  // Cast to any - RPC functions exist but TypeScript types not regenerated
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data: limit } = await supabase.rpc('get_module_limit', {
    p_org_id: organizationId,
    p_module_id: moduleId,
    p_limit_key: featureKey,
  })

  // For features: 0 = disabled, -1 = unlimited/enabled, >0 = limited quantity
  return (limit ?? 0) !== 0
}

// ===========================================
// CRM-SPECIFIC LIMIT CHECKS
// ===========================================

export async function assertCrmContactLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'crm', 'max_contacts')
}

export async function assertCrmCompanyLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'crm', 'max_companies')
}

export async function assertCrmDealLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'crm', 'max_deals')
}

export async function assertCrmPipelineLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'crm', 'max_pipelines')
}

// ===========================================
// INVOICE-SPECIFIC LIMIT CHECKS
// ===========================================

export async function assertInvoiceLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'invoice', 'max_invoices_per_month')
}

export async function assertQuoteLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'invoice', 'max_quotes_per_month')
}

export async function assertInvoiceClientLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'invoice', 'max_clients')
}

export async function assertInvoiceProductLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'invoice', 'max_products')
}

export async function isRecurringInvoicesEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'invoice', 'recurring_invoices')
}

// ===========================================
// PROJECTS-SPECIFIC LIMIT CHECKS
// ===========================================

export async function assertProjectLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'projects', 'max_projects')
}

export async function assertProjectTaskLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'projects', 'max_tasks_per_project')
}

export async function assertProjectMemberLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'projects', 'max_members_per_project')
}

export async function isGanttViewEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'projects', 'gantt_view')
}

export async function isAdvancedTimeTrackingEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'projects', 'advanced_time_tracking')
}

export async function isTaskDependenciesEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'projects', 'task_dependencies')
}

export async function isBudgetTrackingEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'projects', 'budget_tracking')
}

export async function isClientPortalEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'projects', 'client_portal')
}

// ===========================================
// TICKETS-SPECIFIC LIMIT CHECKS
// ===========================================

export async function assertTicketLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'tickets', 'max_tickets_per_month')
}

export async function assertKbArticleLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'tickets', 'max_kb_articles')
}

export async function assertCannedResponseLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'tickets', 'max_canned_responses')
}

export async function isKnowledgeBaseEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'tickets', 'knowledge_base')
}

export async function isTicketAutomationEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'tickets', 'automation_rules')
}

export async function isCustomSlaEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'tickets', 'custom_sla')
}

export async function isMultiChannelEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'tickets', 'multi_channel')
}

export async function isCustomerSatisfactionEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'tickets', 'customer_satisfaction')
}

export async function isTicketReportsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'tickets', 'ticket_reports')
}

// ===========================================
// HR-SPECIFIC LIMIT CHECKS
// ===========================================

export async function assertEmployeeLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'hr', 'max_employees')
}

export async function assertLeaveTypeLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'hr', 'max_leave_types')
}

export async function assertContractLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'hr', 'max_contracts_per_employee')
}

export async function isHrTimeTrackingEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'time_tracking')
}

export async function isHrAlertsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'alerts')
}

export async function isPeriodicInterviewsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'periodic_interviews')
}

export async function isEmployeeDocumentsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'document_storage')
}

export async function isConfidentialNotesEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'confidential_notes')
}

export async function isHrReportsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'hr_reports')
}

export async function isOrgChartEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'hr', 'org_chart')
}

// ===========================================
// DOCS-SPECIFIC LIMIT CHECKS
// ===========================================

/**
 * Check if storage limit allows adding a file of given size
 * IMPORTANT: Call this BEFORE uploading a file
 */
export async function checkDocsStorageLimit(
  organizationId: string,
  fileSizeBytes: number
): Promise<LimitCheckResult> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  // Get current storage usage
  const { data: usageData, error: usageError } = await supabase
    .from('module_usage')
    .select('current_count')
    .eq('organization_id', organizationId)
    .eq('module_id', 'docs')
    .eq('limit_key', 'storage_bytes')
    .single()

  if (usageError && usageError.code !== 'PGRST116') {
    console.error('Error getting storage usage:', usageError)
  }

  const currentUsageBytes = usageData?.current_count ?? 0

  // Get limit in MB and convert to bytes
  const { data: limitMb } = await supabase.rpc('get_module_limit', {
    p_org_id: organizationId,
    p_module_id: 'docs',
    p_limit_key: 'max_storage_mb',
  })

  const limitBytes = (limitMb ?? 500) * 1024 * 1024 // Default 500MB for free
  const isUnlimited = limitMb === -1
  const newUsage = currentUsageBytes + fileSizeBytes
  const allowed = isUnlimited || newUsage <= limitBytes

  return {
    allowed,
    currentUsage: currentUsageBytes,
    limit: limitBytes,
    isUnlimited,
  }
}

/**
 * Assert storage limit allows file upload, throw if not
 * IMPORTANT: Call this BEFORE uploading a file
 */
export async function assertDocsStorageLimit(
  organizationId: string,
  fileSizeBytes: number
): Promise<void> {
  const result = await checkDocsStorageLimit(organizationId, fileSizeBytes)

  if (!result.allowed) {
    const usedMb = Math.round(result.currentUsage / (1024 * 1024))
    const limitMb = Math.round(result.limit / (1024 * 1024))
    const fileSizeMb = Math.round(fileSizeBytes / (1024 * 1024) * 10) / 10
    throw new ModuleLimitExceededError(
      'docs',
      'max_storage_mb',
      usedMb,
      limitMb
    )
  }
}

export async function assertDocsFolderLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'docs', 'max_folders')
}

export async function assertDocsFileSizeLimit(
  organizationId: string,
  fileSizeBytes: number
): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data: limitMb } = await supabase.rpc('get_module_limit', {
    p_org_id: organizationId,
    p_module_id: 'docs',
    p_limit_key: 'max_file_size_mb',
  })

  const maxFileSizeBytes = (limitMb ?? 50) * 1024 * 1024 // Default 50MB for free
  const isUnlimited = limitMb === -1

  if (!isUnlimited && fileSizeBytes > maxFileSizeBytes) {
    const fileSizeMb = Math.round(fileSizeBytes / (1024 * 1024))
    throw new ModuleLimitExceededError(
      'docs',
      'max_file_size_mb',
      fileSizeMb,
      limitMb ?? 50
    )
  }
}

export async function isVersionHistoryEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'docs', 'version_history')
}

export async function isFileLockingEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'docs', 'file_locking')
}

export async function isExternalSharingEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'docs', 'external_sharing')
}

export async function isAdvancedPermissionsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'docs', 'advanced_permissions')
}

export async function isDocumentWorkflowsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'docs', 'document_workflows')
}

// ===========================================
// ANALYTICS-SPECIFIC LIMIT CHECKS
// ===========================================

export async function assertDashboardLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'analytics', 'max_dashboards')
}

export async function assertWidgetLimit(organizationId: string): Promise<void> {
  await assertModuleLimit(organizationId, 'analytics', 'max_widgets_per_dashboard')
}

export async function isCustomDashboardsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'custom_dashboards')
}

export async function isCustomWidgetsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'custom_widgets')
}

export async function isExportReportsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'export_reports')
}

export async function isScheduledReportsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'scheduled_reports')
}

export async function isAiInsightsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'ai_insights')
}

export async function isDataExportEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'data_export')
}

export async function isCrossModuleAnalyticsEnabled(organizationId: string): Promise<boolean> {
  return isPaidFeatureEnabled(organizationId, 'analytics', 'cross_module_analytics')
}

/**
 * Get inter-module analytics notices
 * Returns which modules are available/subscribed for analytics
 */
export async function getAnalyticsModuleAvailability(
  organizationId: string
): Promise<Record<string, { available: boolean; isPaid: boolean }>> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const modules: ModuleId[] = ['crm', 'invoice', 'projects', 'tickets', 'hr', 'docs']
  const result: Record<string, { available: boolean; isPaid: boolean }> = {}

  for (const moduleId of modules) {
    const { data: subscription } = await supabase
      .from('module_subscriptions')
      .select('status')
      .eq('organization_id', organizationId)
      .eq('module_id', moduleId)
      .single()

    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
    const isPaid = subscription?.status === 'active'

    result[moduleId] = {
      available: isActive,
      isPaid,
    }
  }

  return result
}
