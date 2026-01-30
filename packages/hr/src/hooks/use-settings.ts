// ===========================================
// HR SETTINGS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHrSettings,
  getOrCreateHrSettings,
  updateHrSettings,
} from '../server/settings'
import type { UpdateHrSettingsInput } from '../types'

// ===========================================
// QUERY KEYS
// ===========================================

export const settingsKeys = {
  all: ['hr', 'settings'] as const,
  detail: (organizationId: string) => [...settingsKeys.all, organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useHrSettings(organizationId: string) {
  return useQuery({
    queryKey: settingsKeys.detail(organizationId),
    queryFn: () => getHrSettings(organizationId),
    enabled: !!organizationId,
  })
}

export function useOrCreateHrSettings(organizationId: string) {
  return useQuery({
    queryKey: settingsKeys.detail(organizationId),
    queryFn: () => getOrCreateHrSettings(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useUpdateHrSettings(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateHrSettingsInput) => updateHrSettings(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail(organizationId) })
    },
  })
}
