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
  Badge,
} from '@sedona/ui'
import { useSession, useSignOut, useOrganization } from '@/lib/auth'
import { getInitials } from '@/lib/utils'

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

        {/* Organization Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate text-sm">{organization?.name || 'Mon Organisation'}</span>
            <Badge variant="outline" className="text-[10px] px-1.5">
              {plan}
            </Badge>
          </div>
        </DropdownMenuLabel>

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
