// ===========================================
// TICKETS MODULE LAYOUT
// ===========================================

import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { cn } from '@sedona/ui'
import {
  Ticket,
  MessageSquare,
  BookOpen,
  Settings,
  BarChart3,
  Zap,
  Lock,
} from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import { useIsModulePaid } from '@sedona/billing'

export const Route = createFileRoute('/_authenticated/tickets')({
  component: TicketsLayout,
})

const navItems = [
  { to: '/tickets', label: 'Tous les tickets', icon: Ticket, exact: true },
  { to: '/tickets/inbox', label: 'Boite de reception', icon: MessageSquare },
  { to: '/tickets/stats', label: 'Statistiques', icon: BarChart3 },
  { to: '/tickets/knowledge-base', label: 'Base de connaissances', icon: BookOpen, pro: true },
  { to: '/tickets/automations', label: 'Automatisations', icon: Zap, pro: true },
  { to: '/tickets/settings', label: 'Parametres', icon: Settings },
]

function TicketsLayout() {
  const location = useLocation()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''
  const { isPaid: hasPro } = useIsModulePaid(organizationId, 'tickets')

  return (
    <div className="flex flex-col h-full">
      {/* Tickets Sub-navigation */}
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
