// ===========================================
// HR MODULE LAYOUT
// ===========================================

import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { cn } from '@sedona/ui'
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Clock,
  AlertTriangle,
  Lock,
} from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'

export const Route = createFileRoute('/_authenticated/hr')({
  component: HrLayout,
})

const navItems = [
  { to: '/hr', label: 'Employes', icon: Users, exact: true },
  { to: '/hr/leaves', label: 'Conges', icon: Calendar },
  { to: '/hr/interviews', label: 'Entretiens', icon: FileText },
  { to: '/hr/time-tracking', label: 'Temps de travail', icon: Clock, pro: true },
  { to: '/hr/reports', label: 'Rapports', icon: BarChart3 },
  { to: '/hr/alerts', label: 'Alertes', icon: AlertTriangle, pro: true },
  { to: '/hr/settings', label: 'Parametres', icon: Settings },
]

function HrLayout() {
  const location = useLocation()
  const { hasAccess } = usePlan()
  const hasPro = hasAccess('PRO')

  return (
    <div className="flex flex-col h-full">
      {/* HR Sub-navigation */}
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
