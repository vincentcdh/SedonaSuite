// ===========================================
// HR MODULE TYPES
// ===========================================

import { z } from 'zod'

// ===========================================
// ENUMS
// ===========================================

export type ContractType = 'cdi' | 'cdd' | 'stage' | 'alternance' | 'freelance' | 'interim'
export type EmployeeStatus = 'active' | 'trial_period' | 'notice_period' | 'left'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'canceled'
export type DocumentType = 'contract' | 'id_card' | 'diploma' | 'rib' | 'medical' | 'other'
export type InterviewType = 'annual' | 'professional' | 'trial_end' | 'other'
export type InterviewStatus = 'scheduled' | 'completed' | 'canceled'

// ===========================================
// HR SETTINGS
// ===========================================

export interface HrSettings {
  id: string
  organizationId: string
  // Leave configuration
  annualLeaveDaysPerYear: number
  rttDaysPerYear: number
  leaveYearStartMonth: number
  // Work time configuration
  defaultWorkHoursPerWeek: number
  workDays: string[]
  // Alert configuration
  alertTrialEndDays: number
  alertContractEndDays: number
  alertInterviewMonths: number
  alertDocumentExpiryDays: number
  // Time tracking configuration
  timeTrackingEnabled: boolean
  employeesCanClockInOut: boolean
  autoClockOutTime: string | null
  requireClockInNotes: boolean
  // Employee portal configuration
  employeeSelfServiceEnabled: boolean
  employeesCanRequestLeaves: boolean
  employeesCanViewDirectory: boolean
  employeesCanEditProfile: boolean
  employeesCanViewPayslips: boolean
  employeesCanViewContracts: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateHrSettingsInput {
  // Leave configuration
  annualLeaveDaysPerYear?: number
  rttDaysPerYear?: number
  leaveYearStartMonth?: number
  // Work time configuration
  defaultWorkHoursPerWeek?: number
  workDays?: string[]
  // Alert configuration
  alertTrialEndDays?: number
  alertContractEndDays?: number
  alertInterviewMonths?: number
  alertDocumentExpiryDays?: number
  // Time tracking configuration
  timeTrackingEnabled?: boolean
  employeesCanClockInOut?: boolean
  autoClockOutTime?: string | null
  requireClockInNotes?: boolean
  // Employee portal configuration
  employeeSelfServiceEnabled?: boolean
  employeesCanRequestLeaves?: boolean
  employeesCanViewDirectory?: boolean
  employeesCanEditProfile?: boolean
  employeesCanViewPayslips?: boolean
  employeesCanViewContracts?: boolean
}

// ===========================================
// EMPLOYEE
// ===========================================

export interface Employee {
  id: string
  organizationId: string
  userId: string | null
  // Identity
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  birthDate: string | null
  birthPlace: string | null
  nationality: string | null
  socialSecurityNumber: string | null
  photoUrl: string | null
  // Address
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  // Emergency contact
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelation: string | null
  // Professional
  employeeNumber: string | null
  jobTitle: string | null
  department: string | null
  managerId: string | null
  workEmail: string | null
  workPhone: string | null
  // Contract
  contractType: ContractType | null
  contractStartDate: string | null
  contractEndDate: string | null
  trialEndDate: string | null
  // Compensation
  grossSalary: number | null
  salaryCurrency: string
  // Leave balances
  annualLeaveBalance: number
  rttBalance: number
  // Status
  status: EmployeeStatus
  leftDate: string | null
  leftReason: string | null
  // Metadata
  notes: string | null
  customFields: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface EmployeeWithRelations extends Employee {
  manager?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'> | null
  directReports?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>[]
}

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  birthPlace: z.string().max(255).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  socialSecurityNumber: z.string().max(21).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  // Address
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  // Emergency contact
  emergencyContactName: z.string().max(255).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  emergencyContactRelation: z.string().max(100).optional().nullable(),
  // Professional
  employeeNumber: z.string().max(50).optional().nullable(),
  jobTitle: z.string().max(255).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  workEmail: z.string().email().optional().nullable(),
  workPhone: z.string().max(50).optional().nullable(),
  // Contract
  contractType: z.enum(['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'interim']).optional().nullable(),
  contractStartDate: z.string().optional().nullable(),
  contractEndDate: z.string().optional().nullable(),
  trialEndDate: z.string().optional().nullable(),
  // Compensation
  grossSalary: z.number().positive().optional().nullable(),
  salaryCurrency: z.string().length(3).optional(),
  // Leave balances
  annualLeaveBalance: z.number().optional(),
  rttBalance: z.number().optional(),
  // Status
  status: z.enum(['active', 'trial_period', 'notice_period', 'left']).optional(),
  // Metadata
  notes: z.string().optional().nullable(),
  customFields: z.record(z.unknown()).optional(),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string
  leftDate?: string | null
  leftReason?: string | null
}

// ===========================================
// CONTRACT
// ===========================================

export interface Contract {
  id: string
  organizationId: string
  employeeId: string
  contractType: ContractType
  startDate: string
  endDate: string | null
  trialDurationDays: number | null
  trialEndDate: string | null
  trialRenewed: boolean
  jobTitle: string
  department: string | null
  classification: string | null
  workHoursPerWeek: number
  isFullTime: boolean
  remotePolicy: string | null
  grossSalary: number | null
  salaryCurrency: string
  salaryFrequency: string
  signedDocumentUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ContractWithEmployee extends Contract {
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>
}

export const createContractSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  contractType: z.enum(['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'interim']),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().optional().nullable(),
  trialDurationDays: z.number().int().positive().optional().nullable(),
  trialEndDate: z.string().optional().nullable(),
  trialRenewed: z.boolean().optional(),
  jobTitle: z.string().min(1, 'Le poste est requis').max(255),
  department: z.string().max(100).optional().nullable(),
  classification: z.string().max(100).optional().nullable(),
  workHoursPerWeek: z.number().positive().optional(),
  isFullTime: z.boolean().optional(),
  remotePolicy: z.string().max(50).optional().nullable(),
  grossSalary: z.number().positive().optional().nullable(),
  salaryCurrency: z.string().length(3).optional(),
  salaryFrequency: z.enum(['monthly', 'yearly', 'hourly']).optional(),
  signedDocumentUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreateContractInput = z.infer<typeof createContractSchema>

export interface UpdateContractInput extends Partial<CreateContractInput> {
  id: string
}

// ===========================================
// EMPLOYEE DOCUMENT
// ===========================================

export interface EmployeeDocument {
  id: string
  organizationId: string
  employeeId: string
  name: string
  documentType: DocumentType
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
  validFrom: string | null
  validUntil: string | null
  uploadedBy: string | null
  notes: string | null
  createdAt: string
  deletedAt: string | null
}

export const createDocumentSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  name: z.string().min(1, 'Le nom est requis').max(255),
  documentType: z.enum(['contract', 'id_card', 'diploma', 'rib', 'medical', 'other']),
  fileUrl: z.string().url('URL invalide'),
  fileSize: z.number().int().positive().optional().nullable(),
  mimeType: z.string().max(100).optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>

export interface UpdateDocumentInput {
  id: string
  name?: string
  documentType?: DocumentType
  validFrom?: string | null
  validUntil?: string | null
  notes?: string | null
}

// ===========================================
// LEAVE TYPE
// ===========================================

export interface LeaveType {
  id: string
  organizationId: string
  name: string
  code: string
  color: string
  isPaid: boolean
  requiresApproval: boolean
  deductsFromBalance: boolean
  isSystem: boolean
  createdAt: string
}

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  code: z.string().min(1, 'Le code est requis').max(20),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide').optional(),
  isPaid: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  deductsFromBalance: z.boolean().optional(),
})

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>

export interface UpdateLeaveTypeInput extends Partial<CreateLeaveTypeInput> {
  id: string
}

// ===========================================
// LEAVE REQUEST
// ===========================================

export interface LeaveRequest {
  id: string
  organizationId: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  startHalfDay: boolean
  endHalfDay: boolean
  daysCount: number
  reason: string | null
  status: LeaveStatus
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  requestedBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface LeaveRequestWithRelations extends LeaveRequest {
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>
  leaveType?: LeaveType
  approver?: {
    id: string
    email: string
    fullName: string | null
  }
}

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  leaveTypeId: z.string().uuid('Type de congé invalide'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  startHalfDay: z.boolean().optional(),
  endHalfDay: z.boolean().optional(),
  reason: z.string().optional().nullable(),
})

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>

export interface UpdateLeaveRequestInput {
  id: string
  startDate?: string
  endDate?: string
  startHalfDay?: boolean
  endHalfDay?: boolean
  reason?: string | null
}

export interface ApproveLeaveRequestInput {
  id: string
}

export interface RejectLeaveRequestInput {
  id: string
  rejectionReason?: string
}

// ===========================================
// ABSENCE
// ===========================================

export interface Absence {
  id: string
  organizationId: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  daysCount: number
  medicalCertificateUrl: string | null
  reason: string | null
  recordedBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface AbsenceWithRelations extends Absence {
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>
  leaveType?: LeaveType
}

export const createAbsenceSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  leaveTypeId: z.string().uuid('Type d\'absence invalide'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  medicalCertificateUrl: z.string().url().optional().nullable(),
  reason: z.string().optional().nullable(),
})

export type CreateAbsenceInput = z.infer<typeof createAbsenceSchema>

export interface UpdateAbsenceInput extends Partial<CreateAbsenceInput> {
  id: string
}

// ===========================================
// INTERVIEW
// ===========================================

export interface Interview {
  id: string
  organizationId: string
  employeeId: string
  type: InterviewType
  scheduledDate: string
  completedDate: string | null
  interviewerId: string | null
  objectives: string | null
  achievements: string | null
  feedback: string | null
  developmentPlan: string | null
  employeeComments: string | null
  documentUrl: string | null
  status: InterviewStatus
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface InterviewWithRelations extends Interview {
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl' | 'jobTitle'>
  interviewer?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>
}

export const createInterviewSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  type: z.enum(['annual', 'professional', 'trial_end', 'other']),
  scheduledDate: z.string().min(1, 'La date est requise'),
  interviewerId: z.string().uuid().optional().nullable(),
  objectives: z.string().optional().nullable(),
})

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>

export interface UpdateInterviewInput {
  id: string
  type?: InterviewType
  scheduledDate?: string
  completedDate?: string | null
  interviewerId?: string | null
  objectives?: string | null
  achievements?: string | null
  feedback?: string | null
  developmentPlan?: string | null
  employeeComments?: string | null
  documentUrl?: string | null
  status?: InterviewStatus
}

// ===========================================
// EMPLOYEE NOTE
// ===========================================

export interface EmployeeNote {
  id: string
  organizationId: string
  employeeId: string
  title: string | null
  content: string
  isPrivate: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface EmployeeNoteWithAuthor extends EmployeeNote {
  author?: {
    id: string
    email: string
    fullName: string | null
  }
}

export const createEmployeeNoteSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  title: z.string().max(255).optional().nullable(),
  content: z.string().min(1, 'Le contenu est requis'),
  isPrivate: z.boolean().optional(),
})

export type CreateEmployeeNoteInput = z.infer<typeof createEmployeeNoteSchema>

export interface UpdateEmployeeNoteInput {
  id: string
  title?: string | null
  content?: string
  isPrivate?: boolean
}

// ===========================================
// TIME ENTRY (PRO)
// ===========================================

export interface TimeEntry {
  id: string
  organizationId: string
  employeeId: string
  date: string
  startTime: string | null
  endTime: string | null
  breakDurationMinutes: number
  hoursWorked: number
  overtimeHours: number
  notes: string | null
  validatedBy: string | null
  validatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TimeEntryWithRelations extends TimeEntry {
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>
  validator?: {
    id: string
    email: string
    fullName: string | null
  }
}

export const createTimeEntrySchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  date: z.string().min(1, 'La date est requise'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  breakDurationMinutes: z.number().int().min(0).optional(),
  hoursWorked: z.number().positive('Les heures travaillées doivent être positives'),
  overtimeHours: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
})

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>

export interface UpdateTimeEntryInput extends Partial<CreateTimeEntryInput> {
  id: string
}

// ===========================================
// FILTERS
// ===========================================

export interface EmployeeFilters {
  search?: string
  status?: EmployeeStatus | EmployeeStatus[]
  contractType?: ContractType | ContractType[]
  department?: string
  managerId?: string | null
}

export interface LeaveRequestFilters {
  employeeId?: string
  leaveTypeId?: string
  status?: LeaveStatus | LeaveStatus[]
  startDateFrom?: string
  startDateTo?: string
}

export interface AbsenceFilters {
  employeeId?: string
  leaveTypeId?: string
  startDateFrom?: string
  startDateTo?: string
}

export interface InterviewFilters {
  employeeId?: string
  type?: InterviewType | InterviewType[]
  status?: InterviewStatus | InterviewStatus[]
  scheduledFrom?: string
  scheduledTo?: string
}

export interface TimeEntryFilters {
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  validated?: boolean
}

// ===========================================
// PAGINATION
// ===========================================

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ===========================================
// STATISTICS
// ===========================================

export interface HrStats {
  totalEmployees: number
  activeEmployees: number
  trialPeriodEmployees: number
  leftThisMonth: number
  hiredThisMonth: number
  pendingLeaveRequests: number
  upcomingInterviews: number
  trialEndingSoon: number
  contractEndingSoon: number
  absenteeismRate: number | null
  averageTenureMonths: number | null
  leaveDaysThisMonth: number
  overdueInterviews: number
  turnoverRate: number | null
}

export interface EmployeeCountByDepartment {
  department: string
  count: number
}

export interface EmployeeCountByContractType {
  contractType: ContractType
  count: number
}

export interface LeaveBalance {
  employeeId: string
  annualLeaveBalance: number
  rttBalance: number
  usedAnnualLeave: number
  usedRtt: number
  pendingAnnualLeave: number
  pendingRtt: number
}

// ===========================================
// ALERTS
// ===========================================

export interface HrAlert {
  id: string
  type: 'trial_end' | 'contract_end' | 'interview_due' | 'document_expiring'
  employeeId: string
  employeeName: string
  dueDate: string
  daysRemaining: number
  message: string
}

// ===========================================
// BADGES (Time Tracking)
// ===========================================

export type BadgeType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end'

export interface Badge {
  id: string
  organizationId: string
  employeeId: string
  badgeType: BadgeType
  badgeTime: string
  badgeDate: string
  latitude: number | null
  longitude: number | null
  locationName: string | null
  deviceType: string | null
  ipAddress: string | null
  notes: string | null
  createdBy: string | null
  createdAt: string
}

export interface BadgeWithEmployee extends Badge {
  employee?: Pick<Employee, 'id' | 'firstName' | 'lastName' | 'photoUrl'>
}

export interface EmployeeBadgeStatus {
  employeeId: string
  organizationId: string
  firstName: string
  lastName: string
  lastBadgeType: BadgeType | null
  lastBadgeTime: string | null
  badgeDate: string | null
  isClockedIn: boolean
  isOnBreak: boolean
}

export interface DailyWorkSummary {
  totalHours: number
  breakHours: number
  workHours: number
  firstClockIn: string | null
  lastClockOut: string | null
}

export const createBadgeSchema = z.object({
  employeeId: z.string().uuid('ID employé invalide'),
  badgeType: z.enum(['clock_in', 'clock_out', 'break_start', 'break_end']),
  badgeTime: z.string().optional(), // If not provided, uses current time
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationName: z.string().max(255).optional().nullable(),
  deviceType: z.string().max(50).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>

export interface BadgeFilters {
  employeeId?: string
  badgeType?: BadgeType | BadgeType[]
  dateFrom?: string
  dateTo?: string
}
