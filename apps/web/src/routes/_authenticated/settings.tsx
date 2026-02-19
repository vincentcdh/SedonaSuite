import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  User,
  Building2,
  Boxes,
  Users,
  Shield,
  Bell,
  Database,
  Plug,
  Key,
  Lock,
} from 'lucide-react'
import { cn, Badge } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsLayout,
})

// Simulated role and plan
const userRole: 'owner' | 'admin' | 'member' = 'admin'
const isPro = false

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  requiresAdmin?: boolean
  isPro?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Compte',
    items: [
      { href: '/settings/profile', label: 'Mon profil', icon: User, description: 'Vos informations personnelles' },
      { href: '/settings/preferences', label: 'Preferences', icon: Bell, description: 'Notifications et interface' },
      { href: '/settings/security', label: 'Securite', icon: Shield, description: 'Mot de passe et sessions' },
    ],
  },
  {
    title: 'Organisation',
    items: [
      { href: '/settings/organization', label: 'Organisation', icon: Building2, description: 'Parametres entreprise', requiresAdmin: true },
      { href: '/settings/team', label: 'Equipe', icon: Users, description: 'Gerer les membres', requiresAdmin: true },
      { href: '/settings/modules', label: 'Mes Modules', icon: Boxes, description: 'Gerer vos abonnements' },
    ],
  },
  {
    title: 'Avance',
    items: [
      { href: '/settings/data', label: 'Donnees', icon: Database, description: 'Export et suppression RGPD' },
      { href: '/settings/integrations', label: 'Integrations', icon: Plug, description: 'Connexions externes', isPro: true },
      { href: '/settings/api', label: 'Cles API', icon: Key, description: 'Acces API', isPro: true },
    ],
  },
]

function SettingsLayout() {
  const location = useLocation()
  const isAdmin = userRole === 'owner' || userRole === 'admin'

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Parametres</h1>
        <p className="page-description">
          Gerez votre compte et les parametres de votre organisation
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <nav className="lg:w-64 shrink-0">
          <div className="space-y-6">
            {navSections.map((section) => {
              // Filter items based on permissions
              const visibleItems = section.items.filter((item) => {
                if (item.requiresAdmin && !isAdmin) return false
                return true
              })

              if (visibleItems.length === 0) return null

              return (
                <div key={section.title}>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {visibleItems.map((item) => {
                      const active = isActive(item.href)
                      const isLocked = item.isPro && !isPro

                      return (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                              isLocked && 'opacity-60'
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{item.label}</span>
                              {!active && item.description && (
                                <p className="text-xs opacity-70 hidden lg:block truncate">{item.description}</p>
                              )}
                            </div>
                            {item.isPro && !isPro && (
                              <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                                <Lock className="h-3 w-3" />
                                PRO
                              </Badge>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
