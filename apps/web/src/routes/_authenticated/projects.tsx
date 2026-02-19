// ===========================================
// PROJECTS LAYOUT
// ===========================================

import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { cn } from '@sedona/ui'
import { FolderKanban, List, Calendar, Clock, Lock } from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import { useIsModulePaid } from '@sedona/billing'

export const Route = createFileRoute('/_authenticated/projects')({
  component: ProjectsLayout,
})

const navItems = [
  { to: '/projects', label: 'Liste', icon: List, exact: true },
  { to: '/projects/kanban', label: 'Kanban', icon: FolderKanban },
  { to: '/projects/gantt', label: 'Gantt', icon: Calendar, pro: true },
  { to: '/projects/time', label: 'Temps', icon: Clock, pro: true },
]

function ProjectsLayout() {
  const location = useLocation()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''
  const { isPaid: hasPro } = useIsModulePaid(organizationId, 'projects')

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="border-b bg-card">
        <div className="px-6">
          <nav className="flex items-center gap-6 -mb-px">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              const isLocked = item.pro && !hasPro

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isLocked && <Lock className="h-3 w-3" />}
                </Link>
              )
            })}
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
