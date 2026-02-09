// ===========================================
// ORGANIZATION MEMBERS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'

// ===========================================
// TYPES
// ===========================================

export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: string | null
  status: string | null
  joinedAt: string | null
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
  } | null
}

// ===========================================
// GET ORGANIZATION MEMBERS
// ===========================================

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  // First get the members
  const { data: membersData, error: membersError } = await getSupabaseClient()
    .from('organization_members')
    .select('id, user_id, organization_id, role, status, joined_at')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })

  if (membersError) throw membersError

  const members = membersData || []

  // Get user IDs that are not null
  const userIds = members
    .map(m => m.user_id)
    .filter((id): id is string => id !== null)

  if (userIds.length === 0) {
    return members.map(m => ({
      id: m.id,
      userId: m.user_id || '',
      organizationId: m.organization_id,
      role: m.role,
      status: m.status,
      joinedAt: m.joined_at,
      user: null,
    }))
  }

  // Fetch users separately
  const { data: usersData, error: usersError } = await getSupabaseClient()
    .from('users')
    .select('id, email, first_name, last_name, avatar_url')
    .in('id', userIds)

  if (usersError) throw usersError

  const usersMap = new Map(
    (usersData || []).map(u => [u.id, u])
  )

  return members.map(m => {
    const user = m.user_id ? usersMap.get(m.user_id) : null
    return {
      id: m.id,
      userId: m.user_id || '',
      organizationId: m.organization_id,
      role: m.role,
      status: m.status,
      joinedAt: m.joined_at,
      user: user ? {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
      } : null,
    }
  })
}
