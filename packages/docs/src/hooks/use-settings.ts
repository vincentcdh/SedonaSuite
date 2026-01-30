// ===========================================
// DOCS SETTINGS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDocsSettings,
  getOrCreateDocsSettings,
  updateDocsSettings,
} from '../server/settings'

// ===========================================
// QUERY KEYS
// ===========================================

export const docsSettingsKeys = {
  all: ['docs', 'settings'] as const,
  detail: (organizationId: string) => [...docsSettingsKeys.all, organizationId] as const,
}

// ===========================================
// QUERIES
// ===========================================

export function useDocsSettings(organizationId: string) {
  return useQuery({
    queryKey: docsSettingsKeys.detail(organizationId),
    queryFn: () => getOrCreateDocsSettings(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// MUTATIONS
// ===========================================

export function useUpdateDocsSettings(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Partial<{
      maxStorageBytes: number | null
      maxFileSizeBytes: number | null
      autoOcrEnabled: boolean
      versionRetentionDays: number
    }>) => updateDocsSettings(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docsSettingsKeys.detail(organizationId) })
    },
  })
}
