import { type FC, useState } from 'react'
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { useOrganization } from '../client/hooks'
import type { Organization } from '../types'

export interface OrganizationSwitcherProps {
  onCreateNew?: () => void
  className?: string
}

/**
 * OrganizationSwitcher component for switching between organizations
 * Displays the current organization and allows switching to others
 */
export const OrganizationSwitcher: FC<OrganizationSwitcherProps> = ({
  onCreateNew,
  className,
}) => {
  const { organization, organizations, switchOrganization, isLoading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  const handleSwitch = async (org: Organization) => {
    await switchOrganization(org.id)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <Button variant="outline" className={className} disabled>
        <Building2 className="h-4 w-4 mr-2" />
        Chargement...
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Building2 className="h-4 w-4 mr-2" />
          <span className="truncate max-w-[150px]">
            {organization?.name || 'Selectionner'}
          </span>
          <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Organisations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="h-5 w-5 rounded"
                  />
                ) : (
                  <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="truncate">{org.name}</span>
              </div>
              {organization?.id === org.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        {onCreateNew && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCreateNew} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle organisation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
