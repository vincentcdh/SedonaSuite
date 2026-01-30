// ===========================================
// USER DROPDOWN COMPONENT
// ===========================================

import { type FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  LogOut,
  User,
  Settings,
  CreditCard,
  Building2,
  ChevronRight,
  Plus,
  Check,
  Bell,
  Shield,
} from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  Badge,
} from '@sedona/ui'
import { useSession, useSignOut, useOrganization } from '@/lib/auth'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Mock organizations - replace with real data
const mockOrganizations = [
  { id: '1', name: 'Mon Entreprise', role: 'owner' as const },
  { id: '2', name: 'Startup XYZ', role: 'member' as const },
]

interface UserDropdownProps {
  showName?: boolean
}

export const UserDropdown: FC<UserDropdownProps> = ({ showName = true }) => {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { signOut, isLoading: isSigningOut } = useSignOut()
  const { organization } = useOrganization()

  const user = session?.user
  const plan = organization?.subscriptionPlan || 'FREE'

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  const handleSwitchOrganization = (orgId: string) => {
    // TODO: Implement organization switch
    console.log('Switching to organization:', orgId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">
              {getInitials(user?.name)}
            </span>
          </div>
          {showName && (
            <span className="hidden md:inline text-sm font-medium">
              {user?.name || 'Utilisateur'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-medium">
                {getInitials(user?.name)}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate">{user?.name || 'Utilisateur'}</span>
              <span className="text-xs font-normal text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Organization Switcher */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="flex-1 truncate">{organization?.name || 'Mon Organisation'}</span>
              <Badge variant="outline" className="ml-2 text-[10px] px-1.5">
                {plan}
              </Badge>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Mes organisations
              </DropdownMenuLabel>
              {mockOrganizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="cursor-pointer"
                  onClick={() => handleSwitchOrganization(org.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="truncate">{org.name}</span>
                  </div>
                  {org.id === '1' && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                <span>Creer une organisation</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Quick Links */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/settings/profile">
              <User className="h-4 w-4 mr-2" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/settings/preferences">
              <Bell className="h-4 w-4 mr-2" />
              <span>Preferences</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/settings/security">
              <Shield className="h-4 w-4 mr-2" />
              <span>Securite</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/settings/billing">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Abonnement</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* All Settings */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/settings" className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span>Tous les parametres</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          className="text-error focus:text-error cursor-pointer"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>{isSigningOut ? 'Deconnexion...' : 'Deconnexion'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
