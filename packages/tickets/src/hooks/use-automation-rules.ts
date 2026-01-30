// ===========================================
// AUTOMATION RULES HOOKS (PRO Feature)
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  AutomationRule,
  CreateAutomationRuleInput,
  UpdateAutomationRuleInput,
} from '../types'
import {
  getAutomationRules,
  getActiveAutomationRules,
  getAutomationRulesByTrigger,
  getAutomationRuleById,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  toggleAutomationRule,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const automationKeys = {
  all: ['automation-rules'] as const,
  lists: () => [...automationKeys.all, 'list'] as const,
  list: (organizationId: string) => [...automationKeys.lists(), organizationId] as const,
  active: (organizationId: string) => [...automationKeys.all, 'active', organizationId] as const,
  byTrigger: (organizationId: string, triggerType: string) =>
    [...automationKeys.all, 'trigger', organizationId, triggerType] as const,
  details: () => [...automationKeys.all, 'detail'] as const,
  detail: (id: string) => [...automationKeys.details(), id] as const,
}

// ===========================================
// USE AUTOMATION RULES
// ===========================================

export function useAutomationRules(organizationId: string) {
  return useQuery({
    queryKey: automationKeys.list(organizationId),
    queryFn: () => getAutomationRules(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE ACTIVE AUTOMATION RULES
// ===========================================

export function useActiveAutomationRules(organizationId: string) {
  return useQuery({
    queryKey: automationKeys.active(organizationId),
    queryFn: () => getActiveAutomationRules(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE AUTOMATION RULES BY TRIGGER
// ===========================================

export function useAutomationRulesByTrigger(
  organizationId: string,
  triggerType: AutomationRule['triggerType']
) {
  return useQuery({
    queryKey: automationKeys.byTrigger(organizationId, triggerType),
    queryFn: () => getAutomationRulesByTrigger(organizationId, triggerType),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE AUTOMATION RULE
// ===========================================

export function useAutomationRule(id: string | undefined) {
  return useQuery({
    queryKey: automationKeys.detail(id || ''),
    queryFn: () => getAutomationRuleById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE CREATE AUTOMATION RULE
// ===========================================

export function useCreateAutomationRule(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, userId }: { input: CreateAutomationRuleInput; userId?: string }) =>
      createAutomationRule(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.lists() })
    },
  })
}

// ===========================================
// USE UPDATE AUTOMATION RULE
// ===========================================

export function useUpdateAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAutomationRuleInput) => updateAutomationRule(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: automationKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE DELETE AUTOMATION RULE
// ===========================================

export function useDeleteAutomationRule(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAutomationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.list(organizationId) })
    },
  })
}

// ===========================================
// USE TOGGLE AUTOMATION RULE
// ===========================================

export function useToggleAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAutomationRule(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: automationKeys.detail(data.id) })
    },
  })
}
