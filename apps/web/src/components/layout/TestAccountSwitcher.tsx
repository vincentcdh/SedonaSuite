// ===========================================
// TEST ACCOUNT SWITCHER - DEVELOPMENT ONLY
// ===========================================
// This component allows easy switching between test accounts
// to test different roles and subscription plans

import { type FC } from 'react'
import {
  Users,
  Crown,
  Shield,
  User,
  Check,
  Building2,
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
import { useTestAccountSwitcher, type TestAccount } from '@/lib/auth'

// Role icons and labels
const ROLE_CONFIG = {
  owner: { icon: Crown, label: 'Proprietaire', color: 'text-amber-500' },
  manager: { icon: Shield, label: 'Manager', color: 'text-blue-500' },
  employee: { icon: User, label: 'Employe', color: 'text-gray-500' },
}

// Plan colors
const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  PRO: 'bg-blue-100 text-blue-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
}

export const TestAccountSwitcher: FC = () => {
  const { currentAccount, allAccounts, switchAccount } = useTestAccountSwitcher()

  if (!currentAccount) return null

  const RoleIcon = ROLE_CONFIG[currentAccount.role].icon
  const roleColor = ROLE_CONFIG[currentAccount.role].color

  // Group accounts by plan
  const accountsByPlan = {
    FREE: allAccounts.filter((a) => a.organization.subscriptionPlan === 'FREE'),
    PRO: allAccounts.filter((a) => a.organization.subscriptionPlan === 'PRO'),
    ENTERPRISE: allAccounts.filter((a) => a.organization.subscriptionPlan === 'ENTERPRISE'),
  }

  const handleSwitch = (account: TestAccount) => {
    switchAccount(account)
    // Refresh the page to apply changes
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100"
        >
          <Users className="h-4 w-4 text-orange-500" />
          <span className="hidden md:inline text-orange-700">Test:</span>
          <RoleIcon className={`h-4 w-4 ${roleColor}`} />
          <span className="hidden lg:inline text-xs">
            {currentAccount.organization.subscriptionPlan}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="h-4 w-4 text-orange-500" />
          Comptes de test
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Current account info */}
        <div className="px-2 py-2 mb-2 bg-muted/50 rounded-md mx-2">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{currentAccount.organization.name}</span>
            <Badge variant="secondary" className={`text-xs ${PLAN_COLORS[currentAccount.organization.subscriptionPlan || 'FREE']}`}>
              {currentAccount.organization.subscriptionPlan || 'FREE'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RoleIcon className={`h-3 w-3 ${roleColor}`} />
            {currentAccount.user.name} ({ROLE_CONFIG[currentAccount.role].label})
          </div>
        </div>

        {/* FREE Plan */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-gray-500">
            Plan FREE
          </DropdownMenuLabel>
          {accountsByPlan.FREE.map((account) => (
            <AccountMenuItem
              key={account.email}
              account={account}
              isSelected={account.email === currentAccount.email}
              onSelect={handleSwitch}
            />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* PRO Plan */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-blue-500">
            Plan PRO
          </DropdownMenuLabel>
          {accountsByPlan.PRO.map((account) => (
            <AccountMenuItem
              key={account.email}
              account={account}
              isSelected={account.email === currentAccount.email}
              onSelect={handleSwitch}
            />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ENTERPRISE Plan */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-purple-500">
            Plan ENTERPRISE
          </DropdownMenuLabel>
          {accountsByPlan.ENTERPRISE.map((account) => (
            <AccountMenuItem
              key={account.email}
              account={account}
              isSelected={account.email === currentAccount.email}
              onSelect={handleSwitch}
            />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Credentials hint */}
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Mots de passe:</p>
          <p>Owner: <code className="bg-muted px-1 rounded">Owner123!</code></p>
          <p>Admin: <code className="bg-muted px-1 rounded">Admin123!</code></p>
          <p>Member: <code className="bg-muted px-1 rounded">Member123!</code></p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Account menu item component
interface AccountMenuItemProps {
  account: TestAccount
  isSelected: boolean
  onSelect: (account: TestAccount) => void
}

const AccountMenuItem: FC<AccountMenuItemProps> = ({ account, isSelected, onSelect }) => {
  const RoleIcon = ROLE_CONFIG[account.role].icon
  const roleColor = ROLE_CONFIG[account.role].color

  return (
    <DropdownMenuItem
      onClick={() => onSelect(account)}
      className="flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <RoleIcon className={`h-4 w-4 ${roleColor}`} />
        <div className="flex flex-col">
          <span className="text-sm">{account.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {ROLE_CONFIG[account.role].label}
          </span>
        </div>
      </div>
      {isSelected && <Check className="h-4 w-4 text-primary" />}
    </DropdownMenuItem>
  )
}
