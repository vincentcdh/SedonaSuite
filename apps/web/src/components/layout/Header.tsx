import { type FC } from 'react'
import {
  Bell,
  Search,
  Moon,
  Sun,
} from 'lucide-react'
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { useTheme } from '@/lib/theme'
import { UserDropdown } from './UserDropdown'
import { OrganizationSelector } from './OrganizationSelector'

export const Header: FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  return (
    <header className="flex items-center justify-between h-header px-6 bg-background border-b">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher contacts, factures, projets..."
            className="pl-10 w-full"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Organization Selector */}
        <OrganizationSelector />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {[
                {
                  title: 'Nouveau contact',
                  description: 'Marie Dupont a ete ajoutee a vos contacts',
                  time: 'Il y a 5 min',
                },
                {
                  title: 'Facture payee',
                  description: 'La facture FAC-2024-0042 a ete reglee',
                  time: 'Il y a 1h',
                },
                {
                  title: 'Rappel',
                  description: 'Reunion projet a 14h00',
                  time: 'Il y a 2h',
                },
              ].map((notification, index) => (
                <DropdownMenuItem key={index} className="flex flex-col items-start p-3 cursor-pointer">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <UserDropdown />
      </div>
    </header>
  )
}
