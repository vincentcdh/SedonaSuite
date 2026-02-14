// ===========================================
// USER INFO DISPLAY - DEVELOPMENT MODE
// ===========================================
// Shows current user info (linked to HR employee)

import { type FC } from 'react'
import { Crown, Building2 } from 'lucide-react'
import { Badge } from '@sedona/ui'
import { useAuth, useOrganization } from '@/lib/auth'

export const TestAccountSwitcher: FC = () => {
  const { user } = useAuth()
  const { organization, role } = useOrganization()

  if (!user || !organization) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 text-sm">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{organization.name}</span>
      <Badge
        variant="secondary"
        className="text-xs bg-blue-100 text-blue-700"
      >
        {organization.subscriptionPlan}
      </Badge>
      {role === 'owner' && (
        <Crown className="h-4 w-4 text-amber-500" />
      )}
    </div>
  )
}
