// ===========================================
// @SEDONA/HR HOOKS EXPORTS
// ===========================================

// Employee hooks
export {
  employeeKeys,
  useEmployees,
  useEmployee,
  useEmployeeByUserId,
  useDepartments,
  useEmployeeCount,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useRestoreEmployee,
} from './use-employees'

// Contract hooks
export {
  contractKeys,
  useContracts,
  useContractsByEmployee,
  useContract,
  useCurrentContract,
  useExpiringContracts,
  useTrialPeriodsEndingSoon,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
} from './use-contracts'

// Leave hooks
export {
  leaveKeys,
  // Leave Types
  useLeaveTypes,
  useLeaveType,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
  // Leave Requests
  useLeaveRequests,
  useLeaveRequest,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useCancelLeaveRequest,
  useDeleteLeaveRequest,
  // Absences
  useAbsences,
  useAbsence,
  useCreateAbsence,
  useUpdateAbsence,
  useDeleteAbsence,
  // Balance & Calendar
  useLeaveBalance,
  useLeaveCalendar,
} from './use-leaves'

// Interview hooks
export {
  interviewKeys,
  useInterviews,
  useInterviewsByEmployee,
  useInterview,
  useUpcomingInterviews,
  useEmployeesNeedingProfessionalInterview,
  useCreateInterview,
  useUpdateInterview,
  useCompleteInterview,
  useCancelInterview,
  useDeleteInterview,
} from './use-interviews'

// Document hooks
export {
  documentKeys,
  useDocumentsByEmployee,
  useDocument,
  useExpiringDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from './use-documents'

// Note hooks
export {
  noteKeys,
  useNotesByEmployee,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from './use-notes'

// Settings hooks
export {
  settingsKeys,
  useHrSettings,
  useOrCreateHrSettings,
  useUpdateHrSettings,
} from './use-settings'

// Time entry hooks (PRO)
export {
  timeEntryKeys,
  useTimeEntries,
  useTimeEntriesByEmployee,
  useTimeEntry,
  useTimeEntryByDate,
  useWeeklySummary,
  useMonthlySummary,
  useOrganizationTimeStats,
  useEmployeesTimeStatus,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useValidateTimeEntry,
  useUnvalidateTimeEntry,
  useDeleteTimeEntry,
  // Badge / Clock In-Out
  useBadges,
  useBadgesByEmployee,
  useEmployeeBadgeStatus,
  useAllEmployeesBadgeStatus,
  useDailyWorkSummary,
  useCreateBadge,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
  useDeleteBadge,
} from './use-time-entries'

// Stats hooks
export {
  statsKeys,
  useHrStats,
  useEmployeeCountByDepartment,
  useEmployeeCountByContractType,
  useHrAlerts,
  useHeadcountHistory,
} from './use-stats'
