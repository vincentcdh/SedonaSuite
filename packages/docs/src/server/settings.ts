// ===========================================
// DOCS SETTINGS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type { DocsSettings } from '../types'

function getDocsClient() {
  return getSupabaseClient().schema('docs' as any) as any
}

// ===========================================
// GET SETTINGS
// ===========================================

export async function getDocsSettings(organizationId: string): Promise<DocsSettings | null> {
  const { data, error } = await getDocsClient()
    .from('settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapSettingsFromDb(data)
}

// ===========================================
// CREATE SETTINGS
// ===========================================

export async function createDocsSettings(organizationId: string): Promise<DocsSettings> {
  const { data, error } = await getDocsClient()
    .from('settings')
    .insert({
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) throw error

  return mapSettingsFromDb(data)
}

// ===========================================
// GET OR CREATE SETTINGS
// ===========================================

export async function getOrCreateDocsSettings(organizationId: string): Promise<DocsSettings> {
  const existing = await getDocsSettings(organizationId)
  if (existing) return existing
  return createDocsSettings(organizationId)
}

// ===========================================
// UPDATE SETTINGS
// ===========================================

export async function updateDocsSettings(
  organizationId: string,
  input: Partial<{
    maxStorageBytes: number | null
    maxFileSizeBytes: number | null
    autoOcrEnabled: boolean
    versionRetentionDays: number
  }>
): Promise<DocsSettings> {
  const updateData: any = {}

  if (input.maxStorageBytes !== undefined) updateData.max_storage_bytes = input.maxStorageBytes
  if (input.maxFileSizeBytes !== undefined) updateData.max_file_size_bytes = input.maxFileSizeBytes
  if (input.autoOcrEnabled !== undefined) updateData.auto_ocr_enabled = input.autoOcrEnabled
  if (input.versionRetentionDays !== undefined) updateData.version_retention_days = input.versionRetentionDays

  const { data, error } = await getDocsClient()
    .from('settings')
    .update(updateData)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) throw error

  return mapSettingsFromDb(data)
}

// ===========================================
// HELPERS
// ===========================================

function mapSettingsFromDb(data: any): DocsSettings {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    maxStorageBytes: data.max_storage_bytes as number | null,
    maxFileSizeBytes: data.max_file_size_bytes as number | null,
    autoOcrEnabled: data.auto_ocr_enabled as boolean,
    versionRetentionDays: data.version_retention_days as number,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
