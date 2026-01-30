// ===========================================
// SLA POLICIES HOOKS (PRO Feature)
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  SlaPolicy,
  CreateSlaPolicyInput,
  UpdateSlaPolicyInput,
} from '../types'
import {
  getSlaPolicies,
  getActiveSlaPolicies,
  getDefaultSlaPolicy,
  getSlaPolicyById,
  createSlaPolicy,
  updateSlaPolicy,
  deleteSlaPolicy,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const slaKeys = {
  all: ['sla-policies'] as const,
  lists: () => [...slaKeys.all, 'list'] as const,
  list: (organizationId: string) => [...slaKeys.lists(), organizationId] as const,
  active: (organizationId: string) => [...slaKeys.all, 'active', organizationId] as const,
  default: (organizationId: string) => [...slaKeys.all, 'default', organizationId] as const,
  details: () => [...slaKeys.all, 'detail'] as const,
  detail: (id: string) => [...slaKeys.details(), id] as const,
}

// ===========================================
// USE SLA POLICIES
// ===========================================

export function useSlaPolicies(organizationId: string) {
  return useQuery({
    queryKey: slaKeys.list(organizationId),
    queryFn: () => getSlaPolicies(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE ACTIVE SLA POLICIES
// ===========================================

export function useActiveSlaPolicies(organizationId: string) {
  return useQuery({
    queryKey: slaKeys.active(organizationId),
    queryFn: () => getActiveSlaPolicies(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE DEFAULT SLA POLICY
// ===========================================

export function useDefaultSlaPolicy(organizationId: string) {
  return useQuery({
    queryKey: slaKeys.default(organizationId),
    queryFn: () => getDefaultSlaPolicy(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE SLA POLICY
// ===========================================

export function useSlaPolicy(id: string | undefined) {
  return useQuery({
    queryKey: slaKeys.detail(id || ''),
    queryFn: () => getSlaPolicyById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE CREATE SLA POLICY
// ===========================================

export function useCreateSlaPolicy(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSlaPolicyInput) => createSlaPolicy(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: slaKeys.default(organizationId) })
    },
  })
}

// ===========================================
// USE UPDATE SLA POLICY
// ===========================================

export function useUpdateSlaPolicy(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateSlaPolicyInput) => updateSlaPolicy(input, organizationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: slaKeys.lists() })
      queryClient.invalidateQueries({ queryKey: slaKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: slaKeys.default(organizationId) })
    },
  })
}

// ===========================================
// USE DELETE SLA POLICY
// ===========================================

export function useDeleteSlaPolicy(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSlaPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slaKeys.list(organizationId) })
      queryClient.invalidateQueries({ queryKey: slaKeys.default(organizationId) })
    },
  })
}
