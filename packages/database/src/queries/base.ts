/**
 * Base query utilities
 * These helpers work with any Supabase client and table
 */

/**
 * Base query options for pagination and filtering
 */
export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Default query options
 */
export const DEFAULT_QUERY_OPTIONS: Required<QueryOptions> = {
  page: 1,
  limit: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
}

/**
 * Calculate pagination range for Supabase queries
 */
export function getPaginationRange(options: QueryOptions = {}): { from: number; to: number } {
  const { page = 1, limit = 20 } = options
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { from, to }
}

/**
 * Build a search filter for text columns
 * Returns a filter string compatible with Supabase .or() method
 */
export function buildSearchFilter(query: string, columns: string[]): string {
  if (!query.trim()) return ''

  const sanitizedQuery = query.replace(/[%_]/g, '\\$&')
  const conditions = columns.map((col) => `${col}.ilike.%${sanitizedQuery}%`)
  return conditions.join(',')
}

/**
 * Filter out soft-deleted records from an array
 */
export function excludeDeleted<T extends { deleted_at: string | null }>(records: T[]): T[] {
  return records.filter((record) => record.deleted_at === null)
}

/**
 * Paginated response type
 */
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

/**
 * Create a paginated result from data and count
 */
export function createPaginatedResult<T>(
  data: T[],
  count: number,
  options: QueryOptions = {}
): PaginatedResult<T> {
  const { page = 1, limit = 20 } = options
  const totalPages = Math.ceil(count / limit)

  return {
    data,
    count,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  }
}
