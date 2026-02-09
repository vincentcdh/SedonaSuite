// ===========================================
// @SEDONA/HR SERVER EXPORTS
// ===========================================

// Employees
export {
  getEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  getDepartments,
  getEmployeeCount,
} from './employees'

// Contracts
export {
  getContracts,
  getContractsByEmployee,
  getContractById,
  getCurrentContract,
  createContract,
  updateContract,
  deleteContract,
  getExpiringContracts,
  getTrialPeriodsEndingSoon,
} from './contracts'

// Leave Types, Leave Requests, Absences
export {
  // Leave Types
  getLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  // Leave Requests
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  deleteLeaveRequest,
  // Absences
  getAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence,
  // Leave Balance
  getLeaveBalance,
  // Calendar
  getLeaveCalendarData,
} from './leaves'

// Interviews
export {
  getInterviews,
  getInterviewsByEmployee,
  getInterviewById,
  createInterview,
  updateInterview,
  completeInterview,
  cancelInterview,
  deleteInterview,
  getUpcomingInterviews,
  getEmployeesNeedingProfessionalInterview,
} from './interviews'

// Documents
export {
  getDocumentsByEmployee,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getExpiringDocuments,
} from './documents'

// Notes
export {
  getNotesByEmployee,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from './notes'

// Settings
export {
  getHrSettings,
  createHrSettings,
  getOrCreateHrSettings,
  updateHrSettings,
} from './settings'

// Time Entries (PRO)
export {
  getTimeEntries,
  getTimeEntriesByEmployee,
  getTimeEntryById,
  getTimeEntryByDate,
  createTimeEntry,
  updateTimeEntry,
  validateTimeEntry,
  unvalidateTimeEntry,
  deleteTimeEntry,
  getWeeklySummary,
  getMonthlySummary,
  getOrganizationTimeStats,
  getEmployeesTimeStatus,
  type EmployeeTimeStatus,
  // Badge / Clock In-Out
  getBadges,
  getBadgesByEmployee,
  getEmployeeBadgeStatus,
  getAllEmployeesBadgeStatus,
  getDailyWorkSummary,
  createBadge,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  deleteBadge,
} from './time-entries'

// Statistics
export {
  getHrStats,
  getEmployeeCountByDepartment,
  getEmployeeCountByContractType,
  getHrAlerts,
  getHeadcountHistory,
} from './stats'
