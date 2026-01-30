// ===========================================
// ANALYTICS LAYOUT
// ===========================================

import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  Target,
  FileBarChart,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/analytics')({
  component: AnalyticsLayout,
})

const navItems = [
  { href: '/analytics', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/analytics/dashboards', label: 'Mes dashboards', icon: BarChart3 },
  { href: '/analytics/goals', label: 'Objectifs', icon: Target },
  { href: '/analytics/reports', label: 'Rapports', icon: FileBarChart },
  { href: '/analytics/settings', label: 'Parametres', icon: Settings },
]

function AnalyticsLayout() {
  const location = useLocation()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex-shrink-0 hidden md:block">
        <div className="p-4">
          <h2 className="font-semibold text-lg mb-4">Analytics</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
