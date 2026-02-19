// Legacy global subscription hooks
export {
  useSubscription,
  useIsSubscriptionActive,
  useCurrentPlan,
  type Subscription,
  type UseSubscriptionResult,
} from './useSubscription'

export {
  useCheckout,
  type UseCheckoutResult,
} from './useCheckout'

export {
  useBillingPortal,
  type UseBillingPortalResult,
} from './useBillingPortal'

// ===========================================
// MODULE-BASED SUBSCRIPTION HOOKS (NEW)
// ===========================================

export {
  // Main hooks
  useModuleSubscriptions,
  useModuleSubscription,
  useSubscribeToModule,
  useCancelModule,
  useResumeModule,
  useSwitchModuleBillingCycle,
  useModuleBillingPortal,
  useCheckModuleDowngrade,
  // Helper hooks
  useIsModulePaid,
  useModuleLimit,
  useCanPerformAction,
  // Types
  type ModuleId,
  type ModuleBillingCycle,
  type ModuleStatus,
  type ModuleSubscription,
  type ModuleSubscriptionsState,
  type UseModuleSubscriptionState,
  type SubscribeToModuleOptions,
  type UseSubscribeToModuleState,
  type CancelModuleOptions,
  type UseCancelModuleState,
  type ResumeModuleOptions,
  type UseResumeModuleState,
  type SwitchBillingCycleOptions,
  type UseSwitchBillingCycleState,
  type UseModuleBillingPortalState,
  type DowngradeCheck,
  type UseCheckModuleDowngradeState,
} from './useModuleSubscriptions'

// ===========================================
// FEATURE GUARDS (Paid Feature Checks)
// ===========================================

export {
  // Generic guard
  useFeatureGuard,
  // CRM
  useCrmFeature,
  useCrmExport,
  useCrmAdvancedFilters,
  useCrmEmailTracking,
  useCrmReports,
  // Invoice
  useInvoiceFeature,
  useRecurringInvoices,
  useCustomTemplates,
  useAutoReminders,
  useMultiCurrency,
  useAccountingExport,
  useCreditNotes,
  // Projects
  useProjectsFeature,
  useGanttView,
  useAdvancedTimeTracking,
  useTaskDependencies,
  useUnlimitedSubtasks,
  useBudgetTracking,
  useClientPortal,
  useChecklists,
  useCustomLabels,
  // Tickets
  useTicketsFeature,
  useKnowledgeBase,
  useTicketAutomation,
  useCustomSla,
  useUnlimitedCannedResponses,
  useMultiChannel,
  useCustomerSatisfaction,
  useTicketReports,
  // HR
  useHrFeature,
  useHrTimeTracking,
  useHrAlerts,
  usePeriodicInterviews,
  useHrDocumentStorage,
  useConfidentialNotes,
  useHrReports,
  useOrgChart,
  // Docs
  useDocsFeature,
  useVersionHistory,
  useFileLocking,
  useAdvancedPermissions,
  useExternalSharing,
  useDocumentWorkflows,
  useUnlimitedStorage,
  // Analytics
  useAnalyticsFeature,
  useCustomDashboards,
  useReportExport,
  useCustomWidgets,
  useScheduledReports,
  useAiInsights,
  useDataExport,
  useCrossModuleAnalytics,
  // Types
  type FeatureGuardResult,
  type CrmPaidFeature,
  type InvoicePaidFeature,
  type ProjectsPaidFeature,
  type TicketsPaidFeature,
  type HrPaidFeature,
  type DocsPaidFeature,
  type AnalyticsPaidFeature,
} from './useFeatureGuards'

// ===========================================
// CROSS-MODULE ACCESS (Multi-module operations)
// ===========================================

export {
  // Generic cross-module check
  useCrossModuleAccess,
  useMultiModuleAccess,
  // Module availability
  useIsModuleAvailable,
  // Cross-module entity resolution
  useCrossModuleEntity,
  useCrossModuleEntityInfo,
  getModuleFromEntityType,
  getEntityTypeName,
  // Specific cross-module hooks
  useCanCreateInvoiceFromDeal,
  useCanCreateQuoteFromDeal,
  useCanLinkClientToCrm,
  useCanCreateProjectFromDeal,
  useCanCreateTicketFromContact,
  useCanViewDealAnalytics,
  useCanViewInvoiceAnalytics,
  useCanLinkEmployeeDocuments,
  // Types
  type CrossModuleAccessResult,
  type ModuleAccessInfo,
  type CrossModuleEntityType,
  type CrossModuleEntityResult,
} from './useCrossModuleAccess'
