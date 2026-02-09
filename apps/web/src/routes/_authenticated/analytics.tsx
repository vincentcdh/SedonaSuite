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
  { to: '/analytics', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { to: '/analytics/dashboards', label: 'Mes dashboards', icon: BarChart3 },
  { to: '/analytics/goals', label: 'Objectifs', icon: Target },
  { to: '/analytics/reports', label: 'Rapports', icon: FileBarChart },
  { to: '/analytics/settings', label: 'Parametres', icon: Settings },
]

function AnalyticsLayout() {
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
