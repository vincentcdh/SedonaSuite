import { type FC } from 'react'
import { LogOut, User, Settings, CreditCard, Shield } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { useSession, useSignOut } from '../client/hooks'

export interface UserMenuProps {
  onProfile?: () => void
  onSettings?: () => void
  onBilling?: () => void
  onSecurity?: () => void
  onSignOut?: () => void
  className?: string
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * UserMenu component displaying user info and actions
 */
export const UserMenu: FC<UserMenuProps> = ({
  onProfile,
  onSettings,
  onBilling,
  onSecurity,
  onSignOut,
  className,
}) => {
  const { data: session } = useSession()
  const { signOut, isLoading: isSigningOut } = useSignOut()

  const user = session?.user

  const handleSignOut = async () => {
    await signOut()
    onSignOut?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={className}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-primary font-medium text-sm">
                {getInitials(user?.name)}
              </span>
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium ml-2">
            {user?.name || 'Utilisateur'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.name || 'Utilisateur'}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onProfile && (
          <DropdownMenuItem onClick={onProfile} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            <span>Mon profil</span>
          </DropdownMenuItem>
        )}
        {onSettings && (
          <DropdownMenuItem onClick={onSettings} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            <span>Parametres</span>
          </DropdownMenuItem>
        )}
        {onBilling && (
          <DropdownMenuItem onClick={onBilling} className="cursor-pointer">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Abonnement</span>
          </DropdownMenuItem>
        )}
        {onSecurity && (
          <DropdownMenuItem onClick={onSecurity} className="cursor-pointer">
            <Shield className="h-4 w-4 mr-2" />
            <span>Securite</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-error focus:text-error cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>{isSigningOut ? 'Deconnexion...' : 'Deconnexion'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
