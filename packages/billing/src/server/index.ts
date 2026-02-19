// Stripe client
export { getStripe, initStripe } from './stripe'

// Plans configuration (legacy global plans)
export {
  PLANS,
  getPlan,
  getPriceId,
  formatPrice,
  isFeatureAvailable,
  getFeatureLimit,
  type PlanId,
  type BillingInterval,
  type Plan,
  type PlanFeature,
} from './plans'

// Checkout & Portal (legacy global checkout)
export {
  createCheckoutSession,
  createPortalSession,
  createCustomer,
  getCustomer,
  updateCustomer,
  getActiveSubscription,
  cancelSubscription,
  resumeSubscription,
  changeSubscriptionPlan,
  type CreateCheckoutSessionOptions,
  type CreatePortalSessionOptions,
  type CreateCustomerOptions,
} from './checkout'

// Webhooks (legacy global webhooks)
export {
  constructWebhookEvent,
  handleWebhook,
  mapSubscriptionStatus,
  extractPlanId,
  getSubscriptionPeriod,
  type WebhookHandlers,
  type WebhookHandlerContext,
  type WebhookHandler,
} from './webhooks'

// ===========================================
// MODULE-BASED SUBSCRIPTIONS (NEW)
// ===========================================

// Module checkout and subscription management
export {
  createModuleCheckout,
  getOrCreateCustomer,
  getCustomerSubscriptions,
  getModuleSubscription,
  cancelModuleSubscription,
  resumeModuleSubscription,
  switchModuleBillingCycle,
  cancelModuleSubscriptionImmediately,
  createModulePortalSession,
  formatDowngradeWarning,
  syncModuleProducts,
  type ModuleId,
  type ModuleBillingCycle,
  type ModuleInfo,
  type CreateModuleCheckoutOptions,
  type ModuleSubscriptionResult,
  type UsageCheckResult,
  type ModuleProductConfig,
} from './modules'

// Module webhooks
export {
  constructModuleWebhookEvent,
  handleModuleWebhook,
  mapModuleSubscriptionStatus,
  extractModuleMetadata,
  extractBillingCycle,
  buildSubscriptionUpdate,
  createSupabaseUpdateFn,
  createSupabaseResetFn,
  type ModuleWebhookContext,
  type ModuleWebhookHandler,
  type ModuleWebhookHandlers,
  type ModuleSubscriptionUpdate,
  type HandleModuleWebhookOptions,
} from './moduleWebhooks'

// Limit checks (for server-side validation before mutations)
export {
  // Core functions
  checkModuleLimit,
  assertModuleLimit,
  getModuleLimitInfo,
  checkMultipleLimits,
  isPaidFeatureEnabled,
  // CRM-specific
  assertCrmContactLimit,
  assertCrmCompanyLimit,
  assertCrmDealLimit,
  assertCrmPipelineLimit,
  // Invoice-specific
  assertInvoiceLimit,
  assertQuoteLimit,
  assertInvoiceClientLimit,
  assertInvoiceProductLimit,
  isRecurringInvoicesEnabled,
  // Projects-specific
  assertProjectLimit,
  assertProjectTaskLimit,
  assertProjectMemberLimit,
  isGanttViewEnabled,
  isAdvancedTimeTrackingEnabled,
  isTaskDependenciesEnabled,
  isBudgetTrackingEnabled,
  isClientPortalEnabled,
  // Tickets-specific
  assertTicketLimit,
  assertKbArticleLimit,
  assertCannedResponseLimit,
  isKnowledgeBaseEnabled,
  isTicketAutomationEnabled,
  isCustomSlaEnabled,
  isMultiChannelEnabled,
  isCustomerSatisfactionEnabled,
  isTicketReportsEnabled,
  // HR-specific
  assertEmployeeLimit,
  assertLeaveTypeLimit,
  assertContractLimit,
  isHrTimeTrackingEnabled,
  isHrAlertsEnabled,
  isPeriodicInterviewsEnabled,
  isEmployeeDocumentsEnabled,
  isConfidentialNotesEnabled,
  isHrReportsEnabled,
  isOrgChartEnabled,
  // Docs-specific
  checkDocsStorageLimit,
  assertDocsStorageLimit,
  assertDocsFolderLimit,
  assertDocsFileSizeLimit,
  isVersionHistoryEnabled,
  isFileLockingEnabled,
  isExternalSharingEnabled,
  isAdvancedPermissionsEnabled,
  isDocumentWorkflowsEnabled,
  // Analytics-specific
  assertDashboardLimit,
  assertWidgetLimit,
  isCustomDashboardsEnabled,
  isCustomWidgetsEnabled,
  isExportReportsEnabled,
  isScheduledReportsEnabled,
  isAiInsightsEnabled,
  isDataExportEnabled,
  isCrossModuleAnalyticsEnabled,
  getAnalyticsModuleAvailability,
  // Error class
  ModuleLimitExceededError,
  // Types
  type LimitCheckResult,
  type ModuleLimitInfo,
} from './limitChecks'
