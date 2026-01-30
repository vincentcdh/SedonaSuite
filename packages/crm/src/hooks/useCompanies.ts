import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'

// ===========================================
// COMPANIES HOOKS
// ===========================================

// Query keys
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (orgId: string, filters?: CompanyFilters, pagination?: PaginationParams) =>
    [...companyKeys.lists(), orgId, filters, pagination] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  contacts: (id: string) => [...companyKeys.detail(id), 'contacts'] as const,
}

/**
 * Hook to fetch paginated companies
 */
export function useCompanies(
  organizationId: string,
  filters: CompanyFilters = {},
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: companyKeys.list(organizationId, filters, pagination),
    queryFn: async (): Promise<PaginatedResult<Company>> => {
      const params = new URLSearchParams()
      params.set('organizationId', organizationId)

      if (filters.search) params.set('search', filters.search)
      if (filters.industry) params.set('industry', filters.industry)
      if (filters.size) params.set('size', filters.size)
      if (filters.city) params.set('city', filters.city)

      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))
      if (pagination.sortBy) params.set('sortBy', pagination.sortBy)
      if (pagination.sortOrder) params.set('sortOrder', pagination.sortOrder)

      const response = await fetch(`/api/crm/companies?${params}`)
      if (!response.ok) throw new Error('Failed to fetch companies')
      return response.json()
    },
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single company
 */
export function useCompany(companyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: async (): Promise<Company> => {
      const response = await fetch(`/api/crm/companies/${companyId}`)
      if (!response.ok) throw new Error('Failed to fetch company')
      return response.json()
    },
    enabled: options?.enabled !== false && !!companyId,
  })
}

/**
 * Hook to fetch company contacts
 */
export function useCompanyContacts(
  companyId: string,
  pagination: PaginationParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: companyKeys.contacts(companyId),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (pagination.page) params.set('page', String(pagination.page))
      if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize))

      const response = await fetch(`/api/crm/companies/${companyId}/contacts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch company contacts')
      return response.json()
    },
    enabled: options?.enabled !== false && !!companyId,
  })
}

/**
 * Hook to create a company
 */
export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateCompanyInput
    }): Promise<Company> => {
      const response = await fetch('/api/crm/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, ...data }),
      })
      if (!response.ok) throw new Error('Failed to create company')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}

/**
 * Hook to update a company
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCompanyInput): Promise<Company> => {
      const response = await fetch(`/api/crm/companies/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update company')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) })
    },
  })
}

/**
 * Hook to delete a company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (companyId: string): Promise<void> => {
      const response = await fetch(`/api/crm/companies/${companyId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete company')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}
