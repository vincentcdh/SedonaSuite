// ===========================================
// TICKETS SERVER EXPORTS
// ===========================================

// Tickets
export {
  getTickets,
  getTicketById,
  getTicketByNumber,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  changeTicketStatus,
  getTicketStats,
} from './tickets'

// Messages
export {
  getTicketMessages,
  createTicketMessage,
  updateTicketMessage,
  deleteTicketMessage,
  addInternalNote,
} from './messages'

// Categories
export {
  getCategories,
  getActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from './categories'

// Tags
export {
  getTags,
  getTagById,
  getTagByName,
  createTag,
  updateTag,
  deleteTag,
  getOrCreateTag,
  getTagsWithUsageCount,
} from './tags'

// SLA Policies
export {
  getSlaPolicies,
  getActiveSlaPolicies,
  getDefaultSlaPolicy,
  getSlaPolicyById,
  createSlaPolicy,
  updateSlaPolicy,
  deleteSlaPolicy,
  calculateSlaDueDates,
  checkSlaBreachStatus,
} from './sla'

// Canned Responses
export {
  getCannedResponses,
  getCannedResponsesByCategory,
  getCannedResponseById,
  getCannedResponseByShortcut,
  searchCannedResponses,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse,
  getCannedResponseCategories,
  renderCannedResponse,
} from './canned-responses'

// Automation Rules
export {
  getAutomationRules,
  getActiveAutomationRules,
  getAutomationRulesByTrigger,
  getAutomationRuleById,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  toggleAutomationRule,
  recordRuleTrigger,
  evaluateConditions,
  parseActions,
} from './automation-rules'

// Knowledge Base Articles
export {
  getKbArticles,
  getPublishedKbArticles,
  getKbArticlesByCategory,
  getKbArticleById,
  getKbArticleBySlug,
  searchKbArticles,
  getPopularKbArticles,
  createKbArticle,
  updateKbArticle,
  deleteKbArticle,
  publishKbArticle,
  archiveKbArticle,
  incrementKbArticleViewCount,
  recordKbArticleFeedback,
} from './kb-articles'

// Organization Members
export {
  getOrganizationMembers,
  type OrganizationMember,
} from './organization-members'

// KB Categories
export {
  getKbCategories,
  getAllKbCategories,
  getKbCategoryById,
  createKbCategory,
  updateKbCategory,
  deleteKbCategory,
  reorderKbCategories,
  type KbCategory,
  type CreateKbCategoryInput,
  type UpdateKbCategoryInput,
} from './kb-categories'
