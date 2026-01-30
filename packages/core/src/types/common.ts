/**
 * Common types used across the application
 */

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// API Response
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Filter types
export interface DateRangeFilter {
  from?: string
  to?: string
}

export interface SearchFilter {
  query?: string
  fields?: string[]
}

// Common entity types
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface SoftDeleteEntity extends BaseEntity {
  deleted_at: string | null
}

export interface AuditableEntity extends SoftDeleteEntity {
  created_by: string
  updated_by: string | null
}

// Organization context
export interface OrganizationEntity extends AuditableEntity {
  organization_id: string
}

// Status types commonly used
export type EntityStatus = 'active' | 'inactive' | 'archived'

// Address type (French format)
export interface Address {
  street?: string
  complement?: string
  postalCode?: string
  city?: string
  country?: string
}

// Contact info type
export interface ContactInfo {
  email?: string
  phone?: string
  mobile?: string
  website?: string
}

// Social links type
export interface SocialLinks {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
}

// File attachment type
export interface FileAttachment {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
  uploadedAt: string
}

// Note type
export interface Note {
  id: string
  content: string
  createdAt: string
  createdBy: string
}

// Activity log type
export interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
  performedBy: string
  performedAt: string
}
