import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { cn } from '@sedona/ui'
import { Users, Building2, KanbanSquare, Activity } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/crm')({
  component: CrmLayout,
})

const navItems = [
  { to: '/crm/contacts', label: 'Contacts', icon: Users },
  { to: '/crm/companies', label: 'Entreprises', icon: Building2 },
  { to: '/crm/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/crm/activities', label: 'Activites', icon: Activity },
]

function CrmLayout() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full">
      {/* CRM Sub-navigation */}
      <div className="border-b bg-card">
        <div className="px-6">
          <nav className="flex items-center gap-6 -mb-px">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to)
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
