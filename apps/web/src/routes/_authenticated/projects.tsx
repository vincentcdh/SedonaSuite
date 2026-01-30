// ===========================================
// PROJECTS LAYOUT
// ===========================================

import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { cn } from '@sedona/ui'
import { FolderKanban, List, Calendar, Clock, Lock } from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'

export const Route = createFileRoute('/_authenticated/projects')({
  component: ProjectsLayout,
})

const navigation = [
  { name: 'Liste', href: '/projects', icon: List, exact: true },
  { name: 'Kanban', href: '/projects/kanban', icon: FolderKanban },
  { name: 'Gantt', href: '/projects/gantt', icon: Calendar, pro: true },
  { name: 'Temps', href: '/projects/time', icon: Clock, pro: true },
]

function ProjectsLayout() {
  const location = useLocation()
  const { hasAccess } = usePlan()
  const hasPro = hasAccess('PRO')

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation tabs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <h1 className="text-lg font-semibold mr-8">Projets</h1>
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href)
              const Icon = item.icon
              const isLocked = item.pro && !hasPro

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
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
