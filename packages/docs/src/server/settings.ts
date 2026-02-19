// ===========================================
// DOCS SETTINGS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type { DocsSettings, UpdateDocsSettingsInput } from '../types'

// ===========================================
// GET SETTINGS
// ===========================================

export async function getDocsSettings(organizationId: string): Promise<DocsSettings | null> {
  const { data, error } = await getSupabaseClient()
    .from('docs_settings')
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
  const { data, error } = await getSupabaseClient()
    .from('docs_settings')
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
  input: UpdateDocsSettingsInput
): Promise<DocsSettings> {
  const updateData: any = {}

  if (input.maxStorageBytes !== undefined) updateData.max_storage_bytes = input.maxStorageBytes
  if (input.maxFileSizeBytes !== undefined) updateData.max_file_size_bytes = input.maxFileSizeBytes
  if (input.autoOcrEnabled !== undefined) updateData.auto_ocr_enabled = input.autoOcrEnabled
  if (input.versionRetentionDays !== undefined) updateData.version_retention_days = input.versionRetentionDays
  if (input.allowedExtensions !== undefined) updateData.allowed_extensions = input.allowedExtensions
  if (input.blockedExtensions !== undefined) updateData.blocked_extensions = input.blockedExtensions
  if (input.requireDescription !== undefined) updateData.require_description = input.requireDescription
  if (input.autoGenerateThumbnails !== undefined) updateData.auto_generate_thumbnails = input.autoGenerateThumbnails
  if (input.enableVirusScan !== undefined) updateData.enable_virus_scan = input.enableVirusScan

  const { data, error } = await getSupabaseClient()
    .from('docs_settings')
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
  // Default allowed extensions
  const defaultAllowedExtensions = [
    'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt',
    'xls', 'xlsx', 'ods', 'csv',
    'ppt', 'pptx', 'odp',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
    'zip', 'rar', '7z', 'tar', 'gz',
    'mp3', 'wav', 'ogg', 'flac', 'aac',
    'mp4', 'avi', 'mov', 'mkv', 'webm',
    'json', 'xml', 'html', 'css', 'md',
  ]

  const defaultBlockedExtensions = [
    'exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'jar', 'msi', 'dll', 'scr', 'com',
  ]

  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    maxStorageBytes: data.max_storage_bytes as number | null,
    maxFileSizeBytes: data.max_file_size_bytes as number | null,
    autoOcrEnabled: (data.auto_ocr_enabled as boolean) || false,
    versionRetentionDays: (data.version_retention_days as number) || 90,
    allowedExtensions: (data.allowed_extensions as string[]) || defaultAllowedExtensions,
    blockedExtensions: (data.blocked_extensions as string[]) || defaultBlockedExtensions,
    requireDescription: (data.require_description as boolean) || false,
    autoGenerateThumbnails: (data.auto_generate_thumbnails as boolean) ?? true,
    enableVirusScan: (data.enable_virus_scan as boolean) ?? true,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
