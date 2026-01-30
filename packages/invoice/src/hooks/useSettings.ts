// ===========================================
// SETTINGS HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  InvoiceSettings,
  UpdateInvoiceSettingsInput,
  VatRate,
  CreateVatRateInput,
  NumberSequence,
  UpdateNumberSequenceInput,
} from '../types'
import {
  getInvoiceSettings,
  updateInvoiceSettings,
  getVatRates,
  createVatRate,
  deleteVatRate,
  getNumberSequences,
  updateNumberSequence,
} from '../server/settings'

// Query keys
const settingsKeys = {
  all: ['invoice-settings'] as const,
  settings: (organizationId: string) => [...settingsKeys.all, 'org', organizationId] as const,
  vatRates: (organizationId: string) => [...settingsKeys.all, 'vat-rates', organizationId] as const,
  sequences: (organizationId: string) => [...settingsKeys.all, 'sequences', organizationId] as const,
}

// ===========================================
// GET INVOICE SETTINGS
// ===========================================

export function useInvoiceSettings(organizationId: string) {
  return useQuery({
    queryKey: settingsKeys.settings(organizationId),
    queryFn: () => getInvoiceSettings(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// UPDATE INVOICE SETTINGS
// ===========================================

export function useUpdateInvoiceSettings(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateInvoiceSettingsInput) => updateInvoiceSettings(organizationId, input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.settings(organizationId), data)
    },
  })
}

// ===========================================
// VAT RATES
// ===========================================

export function useVatRates(organizationId: string) {
  return useQuery({
    queryKey: settingsKeys.vatRates(organizationId),
    queryFn: () => getVatRates(organizationId),
    enabled: !!organizationId,
  })
}

export function useCreateVatRate(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateVatRateInput) => createVatRate(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.vatRates(organizationId) })
    },
  })
}

export function useDeleteVatRate(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteVatRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.vatRates(organizationId) })
    },
  })
}

// ===========================================
// NUMBER SEQUENCES
// ===========================================

export function useNumberSequences(organizationId: string) {
  return useQuery({
    queryKey: settingsKeys.sequences(organizationId),
    queryFn: () => getNumberSequences(organizationId),
    enabled: !!organizationId,
  })
}

export function useUpdateNumberSequence(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateNumberSequenceInput) => updateNumberSequence(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sequences(organizationId) })
    },
  })
}
