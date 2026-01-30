// ===========================================
// TICKETS HOOKS EXPORTS
// ===========================================

// Tickets
export {
  ticketKeys,
  useTickets,
  useTicket,
  useTicketByNumber,
  useTicketStats,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  useAssignTicket,
  useChangeTicketStatus,
} from './use-tickets'

// Messages
export {
  messageKeys,
  useTicketMessages,
  useCreateMessage,
  useUpdateMessage,
  useDeleteMessage,
  useAddInternalNote,
} from './use-messages'

// Categories
export {
  categoryKeys,
  useCategories,
  useActiveCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from './use-categories'

// Tags
export {
  tagKeys,
  useTags,
  useTagsWithUsageCount,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useGetOrCreateTag,
} from './use-tags'

// SLA Policies
export {
  slaKeys,
  useSlaPolicies,
  useActiveSlaPolicies,
  useDefaultSlaPolicy,
  useSlaPolicy,
  useCreateSlaPolicy,
  useUpdateSlaPolicy,
  useDeleteSlaPolicy,
} from './use-sla'

// Canned Responses
export {
  cannedResponseKeys,
  useCannedResponses,
  useCannedResponsesByCategory,
  useSearchCannedResponses,
  useCannedResponseCategories,
  useCannedResponse,
  useCannedResponseByShortcut,
  useCreateCannedResponse,
  useUpdateCannedResponse,
  useDeleteCannedResponse,
} from './use-canned-responses'

// Automation Rules
export {
  automationKeys,
  useAutomationRules,
  useActiveAutomationRules,
  useAutomationRulesByTrigger,
  useAutomationRule,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  useToggleAutomationRule,
} from './use-automation-rules'

// Knowledge Base Articles
export {
  kbArticleKeys,
  useKbArticles,
  usePublishedKbArticles,
  useKbArticlesByCategory,
  useSearchKbArticles,
  usePopularKbArticles,
  useKbArticle,
  useKbArticleBySlug,
  useCreateKbArticle,
  useUpdateKbArticle,
  useDeleteKbArticle,
  usePublishKbArticle,
  useArchiveKbArticle,
  useIncrementKbArticleViewCount,
  useRecordKbArticleFeedback,
} from './use-kb-articles'
