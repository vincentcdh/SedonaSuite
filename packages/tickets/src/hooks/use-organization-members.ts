// ===========================================
// ORGANIZATION MEMBERS HOOKS
// ===========================================

import { useQuery } from '@tanstack/react-query'
import { getOrganizationMembers, type OrganizationMember } from '../server/organization-members'

// ===========================================
// QUERY KEYS
// ===========================================

export const organizationMemberKeys = {
  all: ['organization-members'] as const,
  lists: () => [...organizationMemberKeys.all, 'list'] as const,
  list: (organizationId: string) => [...organizationMemberKeys.lists(), organizationId] as const,
}

// ===========================================
// GET ORGANIZATION MEMBERS
// ===========================================

export function useOrganizationMembers(organizationId: string) {
  return useQuery<OrganizationMember[]>({
    queryKey: organizationMemberKeys.list(organizationId),
    queryFn: () => getOrganizationMembers(organizationId),
    enabled: !!organizationId,
  })
}
