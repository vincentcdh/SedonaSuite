// ===========================================
// DOCS LAYOUT
// ===========================================

import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import {
  FolderOpen,
  Star,
  Clock,
  Trash2,
  Settings,
  Activity,
} from 'lucide-react'
import { cn } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/docs')({
  component: DocsLayout,
})

const navItems = [
  { to: '/docs', label: 'Fichiers', icon: FolderOpen, exact: true },
  { to: '/docs/recent', label: 'Recents', icon: Clock },
  { to: '/docs/favorites', label: 'Favoris', icon: Star },
  { to: '/docs/trash', label: 'Corbeille', icon: Trash2 },
  { to: '/docs/activity', label: 'Activite', icon: Activity },
  { to: '/docs/settings', label: 'Parametres', icon: Settings },
]

function DocsLayout() {
  const location = useLocation()

  const isActive = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to
    }
    return location.pathname.startsWith(to)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="border-b bg-card">
        <div className="px-6">
          <nav className="flex items-center gap-6 -mb-px">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors',
                  isActive(item.to, item.exact)
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
