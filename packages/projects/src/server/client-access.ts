// ===========================================
// CLIENT ACCESS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  ClientAccess,
  ClientPermissions,
  InviteClientInput,
  CreateShareLinkInput,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// CLIENT ACCESS CRUD
// ===========================================

export async function getClientAccess(projectId: string): Promise<ClientAccess[]> {
  const { data, error } = await getClient()
    .from('projects_client_access')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(mapClientAccessFromDb)
}

export async function getClientAccessById(id: string): Promise<ClientAccess | null> {
  const { data, error } = await getClient()
    .from('projects_client_access')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data ? mapClientAccessFromDb(data) : null
}

export async function inviteClient(input: InviteClientInput): Promise<ClientAccess> {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    project_id: input.projectId,
    access_type: 'account',
    client_email: input.clientEmail,
    client_name: input.clientName,
    can_comment: input.permissions?.canComment ?? true,
    can_upload_files: input.permissions?.canUploadFiles ?? false,
    can_see_time_tracking: input.permissions?.canSeeTimeTracking ?? false,
    can_see_budget: input.permissions?.canSeeBudget ?? false,
    can_see_team_members: input.permissions?.canSeeTeamMembers ?? true,
    created_by: user?.id,
  }

  const { data, error } = await getClient()
    .from('projects_client_access')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  // TODO: Send invitation email to client
  // await sendClientInvitationEmail(input.clientEmail, input.clientName, input.message)

  return mapClientAccessFromDb(data)
}

export async function createShareLink(input: CreateShareLinkInput): Promise<ClientAccess> {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Generate a unique share token
  const shareToken = generateRandomToken()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    project_id: input.projectId,
    access_type: 'link',
    share_token: shareToken,
    password_protected: !!input.password,
    expires_at: input.expiresAt || null,
    can_comment: input.permissions?.canComment ?? true,
    can_upload_files: input.permissions?.canUploadFiles ?? false,
    can_see_time_tracking: input.permissions?.canSeeTimeTracking ?? false,
    can_see_budget: input.permissions?.canSeeBudget ?? false,
    can_see_team_members: input.permissions?.canSeeTeamMembers ?? true,
    created_by: user?.id,
  }

  // TODO: Hash password if provided
  if (input.password) {
    insertData['link_password_hash'] = input.password // Should be hashed
  }

  const { data, error } = await getClient()
    .from('projects_client_access')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapClientAccessFromDb(data)
}

export async function updateClientAccess(
  id: string,
  updates: Partial<ClientPermissions> & { isActive?: boolean; expiresAt?: string | null }
): Promise<ClientAccess> {
  const updateData: Record<string, any> = {}

  if (updates.canComment !== undefined) updateData['can_comment'] = updates.canComment
  if (updates.canUploadFiles !== undefined) updateData['can_upload_files'] = updates.canUploadFiles
  if (updates.canSeeTimeTracking !== undefined) updateData['can_see_time_tracking'] = updates.canSeeTimeTracking
  if (updates.canSeeBudget !== undefined) updateData['can_see_budget'] = updates.canSeeBudget
  if (updates.canSeeTeamMembers !== undefined) updateData['can_see_team_members'] = updates.canSeeTeamMembers
  if (updates.isActive !== undefined) updateData['is_active'] = updates.isActive
  if (updates.expiresAt !== undefined) updateData['expires_at'] = updates.expiresAt

  const { data, error } = await getClient()
    .from('projects_client_access')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapClientAccessFromDb(data)
}

export async function revokeClientAccess(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_client_access')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}

export async function deleteClientAccess(id: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_client_access')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// SHARE TOKEN VALIDATION
// ===========================================

export async function validateShareToken(token: string): Promise<{
  clientAccessId: string
  projectId: string
  projectName: string
  permissions: ClientPermissions
} | null> {
  // Query the client_access directly with the token
  const { data, error } = await getClient()
    .from('projects_client_access')
    .select(`
      id,
      project_id,
      can_comment,
      can_upload_files,
      can_see_time_tracking,
      can_see_budget,
      can_see_team_members,
      is_active,
      expires_at,
      projects_projects!inner (
        id,
        name
      )
    `)
    .eq('share_token', token)
    .eq('access_type', 'link')
    .single()

  if (error || !data) return null

  // Check if access is valid
  if (!data.is_active) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessData = data as any
  return {
    clientAccessId: accessData.id,
    projectId: accessData.project_id,
    projectName: accessData.projects_projects?.name || '',
    permissions: {
      canComment: accessData.can_comment || false,
      canUploadFiles: accessData.can_upload_files || false,
      canSeeTimeTracking: accessData.can_see_time_tracking || false,
      canSeeBudget: accessData.can_see_budget || false,
      canSeeTeamMembers: accessData.can_see_team_members || false,
    },
  }
}

export async function recordClientAccess(clientAccessId: string): Promise<void> {
  // First get current access count
  const { data: current } = await getClient()
    .from('projects_client_access')
    .select('access_count')
    .eq('id', clientAccessId)
    .single()

  const newCount = (current?.access_count || 0) + 1

  const { error } = await getClient()
    .from('projects_client_access')
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: newCount,
    })
    .eq('id', clientAccessId)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

function generateRandomToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function mapClientAccessFromDb(data: any): ClientAccess {
  return {
    id: data.id,
    projectId: data.project_id,
    accessType: data.access_type,
    clientEmail: data.client_email,
    clientName: data.client_name,
    shareToken: data.share_token,
    passwordProtected: data.password_protected,
    expiresAt: data.expires_at,
    canComment: data.can_comment,
    canUploadFiles: data.can_upload_files,
    canSeeTimeTracking: data.can_see_time_tracking,
    canSeeBudget: data.can_see_budget,
    canSeeTeamMembers: data.can_see_team_members,
    notifyOnUpdates: data.notify_on_updates,
    lastAccessedAt: data.last_accessed_at,
    accessCount: data.access_count,
    isActive: data.is_active,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
