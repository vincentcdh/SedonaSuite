// ===========================================
// PROJECT MEMBERS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  ProjectMember,
  AddProjectMemberInput,
  UpdateProjectMemberInput,
} from '../types'

function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET PROJECT MEMBERS
// ===========================================

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data, error } = await getClient()
    .from('projects_project_members')
    .select('*')
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true })

  if (error) throw error

  // Get user details from public schema
  const userIds = (data || []).map((m: any) => m.user_id)
  const { data: users } = await getSupabaseClient()
    .from('users')
    .select('id, email, full_name, avatar_url')
    .in('id', userIds)

  const userMap: Record<string, any> = {}
  users?.forEach((u: any) => {
    userMap[u.id] = u
  })

  return (data || []).map((m: any) => ({
    ...mapMemberFromDb(m),
    user: userMap[m.user_id] ? {
      id: userMap[m.user_id].id,
      email: userMap[m.user_id].email,
      fullName: userMap[m.user_id].full_name,
      avatarUrl: userMap[m.user_id].avatar_url,
    } : undefined,
  }))
}

// ===========================================
// ADD PROJECT MEMBER
// ===========================================

export async function addProjectMember(
  input: AddProjectMemberInput,
  invitedBy?: string
): Promise<ProjectMember> {
  const { data, error } = await getClient()
    .from('projects_project_members')
    .insert({
      project_id: input.projectId,
      user_id: input.userId,
      role: input.role || 'member',
      can_edit_project: input.canEditProject ?? false,
      can_manage_members: input.canManageMembers ?? false,
      can_delete_tasks: input.canDeleteTasks ?? false,
      invited_by: invitedBy,
    })
    .select()
    .single()

  if (error) throw error

  return mapMemberFromDb(data)
}

// ===========================================
// UPDATE PROJECT MEMBER
// ===========================================

export async function updateProjectMember(input: UpdateProjectMemberInput): Promise<ProjectMember> {
  const updateData: Record<string, unknown> = {}

  if (input.role !== undefined) updateData.role = input.role
  if (input.canEditProject !== undefined) updateData.can_edit_project = input.canEditProject
  if (input.canManageMembers !== undefined) updateData.can_manage_members = input.canManageMembers
  if (input.canDeleteTasks !== undefined) updateData.can_delete_tasks = input.canDeleteTasks

  const { data, error } = await getClient()
    .from('projects_project_members')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapMemberFromDb(data)
}

// ===========================================
// REMOVE PROJECT MEMBER
// ===========================================

export async function removeProjectMember(memberId: string): Promise<void> {
  const { error } = await getClient()
    .from('projects_project_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}

// ===========================================
// CHECK USER IS PROJECT MEMBER
// ===========================================

export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const { data, error } = await getClient()
    .from('projects_project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return !!data
}

// ===========================================
// HELPERS
// ===========================================

function mapMemberFromDb(data: Record<string, unknown>): ProjectMember {
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    userId: data.user_id as string,
    role: data.role as ProjectMember['role'],
    canEditProject: (data.can_edit_project as boolean) || false,
    canManageMembers: (data.can_manage_members as boolean) || false,
    canDeleteTasks: (data.can_delete_tasks as boolean) || false,
    joinedAt: data.joined_at as string,
    invitedBy: data.invited_by as string | null,
  }
}
