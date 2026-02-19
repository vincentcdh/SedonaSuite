// ===========================================
// ORGANIZATION SELECTOR
// ===========================================
// Dropdown to switch between organizations in the header

import { type FC, useState } from 'react'
// import { useNavigate } from '@tanstack/react-router'
import { Check, ChevronsUpDown, Building2, Crown, Loader2 } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { useAuth, useOrganization, useSwitchOrganization } from '@/lib/auth'

export const OrganizationSelector: FC = () => {
  const { user } = useAuth()
  const { organization, organizations, role, isLoading } = useOrganization()
  const { switchOrganization, isLoading: isSwitching } = useSwitchOrganization()
  const [isOpen, setIsOpen] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <Button variant="ghost" disabled className="gap-2 px-3">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Chargement...</span>
      </Button>
    )
  }

  // No user
  if (!user) {
    return null
  }

  // No organizations - will redirect to setup
  if (!organization || organizations.length === 0) {
    return (
      <Button variant="ghost" disabled className="gap-2 px-3">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Configuration...</span>
      </Button>
    )
  }

  const handleSwitch = async (orgId: string) => {
    if (orgId === organization.id) {
      setIsOpen(false)
      return
    }
    await switchOrganization(orgId)
  }

  // Get initials for org avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 px-3 h-9 hover:bg-muted/50"
          disabled={isSwitching}
        >
          {isSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium max-w-[150px] truncate text-sm">
            {organization.name}
          </span>
          {role === 'owner' && (
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          )}
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Vos organisations ({organizations.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Organization List */}
        <div className="max-h-[300px] overflow-y-auto">
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              disabled={isSwitching}
              className="cursor-pointer py-2.5"
            >
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Org Avatar */}
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        alt=""
                        className="h-6 w-6 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-primary">
                        {getInitials(org.name)}
                      </span>
                    )}
                  </div>

                  {/* Org Info */}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">
                      {org.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {org.slug}
                    </span>
                  </div>
                </div>

                {/* Check Mark for Active */}
                {organization.id === org.id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
