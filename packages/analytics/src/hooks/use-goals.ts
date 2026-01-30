// ===========================================
// GOALS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGoals,
  getGoalById,
  getActiveGoalsWithProgress,
  createGoal,
  updateGoal,
  updateGoalCurrentValue,
  toggleGoalActive,
  deleteGoal,
} from '../server/goals'
import type {
  GoalFilters,
  CreateGoalInput,
  UpdateGoalInput,
} from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: GoalFilters) =>
    [...goalKeys.lists(), organizationId, filters] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
  active: (organizationId: string) =>
    [...goalKeys.all, 'active', organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useGoals(organizationId: string, filters?: GoalFilters) {
  return useQuery({
    queryKey: goalKeys.list(organizationId, filters),
    queryFn: () => getGoals(organizationId, filters),
    enabled: !!organizationId,
  })
}

export function useGoal(goalId: string | undefined) {
  return useQuery({
    queryKey: goalKeys.detail(goalId || ''),
    queryFn: () => getGoalById(goalId!),
    enabled: !!goalId,
  })
}

export function useActiveGoals(organizationId: string) {
  return useQuery({
    queryKey: goalKeys.active(organizationId),
    queryFn: () => getActiveGoalsWithProgress(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      data,
    }: {
      organizationId: string
      userId: string
      data: CreateGoalInput
    }) => createGoal(organizationId, userId, data),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: goalKeys.active(organizationId) })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      data,
    }: {
      goalId: string
      data: UpdateGoalInput
    }) => updateGoal(goalId, data),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goal.id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.active(goal.organizationId) })
    },
  })
}

export function useUpdateGoalValue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      currentValue,
    }: {
      goalId: string
      currentValue: number
    }) => updateGoalCurrentValue(goalId, currentValue),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goal.id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.active(goal.organizationId) })
    },
  })
}

export function useToggleGoalActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      goalId,
      isActive,
    }: {
      goalId: string
      isActive: boolean
    }) => toggleGoalActive(goalId, isActive),
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goal.id) })
      queryClient.invalidateQueries({ queryKey: goalKeys.active(goal.organizationId) })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
    },
  })
}
