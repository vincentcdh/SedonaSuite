// ===========================================
// @sedona/billing - Billing & Subscription Package
// ===========================================

// Re-export server utilities (for API routes) - Legacy global plans
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
} from './server/plans'

// Re-export legacy hooks
export {
  useSubscription,
  useIsSubscriptionActive,
  useCurrentPlan,
  useCheckout,
  useBillingPortal,
  type Subscription,
  type UseSubscriptionResult,
  type UseCheckoutResult,
  type UseBillingPortalResult,
} from './hooks'

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
} from './hooks'

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
  // Analytics
  useAnalyticsFeature,
  useCustomDashboards,
  useReportExport,
  // Types
  type FeatureGuardResult,
  type CrmPaidFeature,
  type InvoicePaidFeature,
  type ProjectsPaidFeature,
  type TicketsPaidFeature,
  type HrPaidFeature,
  type DocsPaidFeature,
  type AnalyticsPaidFeature,
} from './hooks'

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
} from './hooks'

// Re-export components
export {
  PricingTable,
  UpgradeModal,
  CurrentPlanBadge,
  BillingSettings,
  FeatureGate,
  FeatureGateRender,
  ProBadge,
  LockedFeatureIcon,
  type PricingTableProps,
  type UpgradeModalProps,
  type CurrentPlanBadgeProps,
  type BillingSettingsProps,
  type FeatureGateProps,
  type FeatureGateRenderProps,
  type ProBadgeProps,
  type LockedFeatureIconProps,
} from './components'
