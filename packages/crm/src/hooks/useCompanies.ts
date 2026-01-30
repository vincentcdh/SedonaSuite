import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilters,
  PaginationParams,
} from '../types'
import {
  getCompanies,
  getCompany as getCompanyById,
  getCompanyContacts as fetchCompanyContacts,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../server/companies'

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
    queryFn: () => getCompanies(organizationId, filters, pagination),
    enabled: options?.enabled !== false && !!organizationId,
  })
}

/**
 * Hook to fetch a single company
 */
export function useCompany(companyId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => getCompanyById(companyId),
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
    queryFn: () => fetchCompanyContacts(companyId, pagination),
    enabled: options?.enabled !== false && !!companyId,
  })
}

/**
 * Hook to create a company
 */
export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string
      data: CreateCompanyInput
    }) => createCompany(organizationId, data),
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
    mutationFn: (data: UpdateCompanyInput) => updateCompany(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: companyKeys.detail(data.id) })
      }
    },
  })
}

/**
 * Hook to delete a company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (companyId: string) => deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}
