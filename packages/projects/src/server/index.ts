// ===========================================
// SERVER EXPORTS
// ===========================================

// Projects
export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from './projects'

// Members
export {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  isProjectMember,
} from './members'

// Tasks
export {
  getTasks,
  getTasksByStatus,
  getTaskById,
  getSubtasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTaskStatuses,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
} from './tasks'

// Assignees
export {
  getTaskAssignees,
  assignUserToTask,
  unassignUserFromTask,
  setTaskAssignees,
} from './assignees'

// Comments
export {
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from './comments'

// Attachments
export {
  getTaskAttachments,
  createTaskAttachment,
  deleteTaskAttachment,
  getAttachmentUrl,
} from './attachments'

// Checklist
export {
  getTaskChecklistItems,
  createTaskChecklistItem,
  updateTaskChecklistItem,
  deleteTaskChecklistItem,
  toggleTaskChecklistItem,
} from './checklist'

// Time Entries
export {
  getTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  startTimer,
  stopTimer,
  getRunningTimer,
  getProjectTimeSummary,
} from './time-entries'

// Labels
export {
  getProjectLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToTask,
  removeLabelFromTask,
  getTaskLabels,
} from './labels'

// Dependencies
export {
  getTaskDependencies,
  getTaskDependents,
  createTaskDependency,
  deleteTaskDependency,
  removeDependency,
  getProjectDependencies,
} from './dependencies'

// Task Columns (Kanban)
export {
  getTaskColumns,
  getTaskColumnById,
  createTaskColumn,
  updateTaskColumn,
  deleteTaskColumn,
  reorderTaskColumns,
  type TaskColumn,
  type CreateColumnInput,
  type UpdateColumnInput,
} from './columns'

// Client Access
export {
  getClientAccess,
  getClientAccessById,
  inviteClient,
  createShareLink,
  updateClientAccess,
  revokeClientAccess,
  deleteClientAccess,
  validateShareToken,
  recordClientAccess,
} from './client-access'

// Client Questions
export {
  getClientQuestions,
  getClientQuestionById,
  createClientQuestion,
  answerClientQuestion,
  closeClientQuestion,
  reopenClientQuestion,
  getOpenQuestionsCount,
} from './client-questions'

// Client Validations
export {
  getClientValidations,
  getClientValidationById,
  getPendingValidations,
  createClientValidation,
  respondToValidation,
  deleteClientValidation,
  getPendingValidationsCount,
} from './validations'

// Activity Log
export {
  getProjectActivity,
  logActivity,
  logClientActivity,
  getActivityMessage,
  getActivityIcon,
} from './activity'
