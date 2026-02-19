import { type FC, useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  Ticket,
  UserCircle,
  FileStack,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
} from 'lucide-react'
import { Button, Separator, Badge, ModuleStatusBadge } from '@sedona/ui'
import { cn } from '@sedona/ui'
import { useSession, useOrganization } from '@/lib/auth'
import { getInitials } from '@/lib/utils'
import { useTicketStats } from '@sedona/tickets'
import { Logo, LogoIcon } from '@/components/Logo'
import { useAllModulesAccess, type ModuleId } from '@/hooks/useModuleAccess'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  moduleId?: ModuleId  // Link nav item to module for status badge
}

const bottomNavItems: NavItem[] = [
  { label: 'Console Admin', href: '/admin', icon: Shield },
  { label: 'Parametres', href: '/settings', icon: Settings },
  { label: 'Aide', href: '/help', icon: HelpCircle },
]


interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export const Sidebar: FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation()
  const { data: session } = useSession()
  const { organization } = useOrganization()

  // Fetch ticket stats for badge
  const { data: ticketStats } = useTicketStats(organization?.id || '')

  // Fetch module access info for all modules
  const { modules: moduleAccess } = useAllModulesAccess()
  const moduleAccessMap = useMemo(() => {
    const map = new Map<ModuleId, boolean>()
    moduleAccess.forEach(m => map.set(m.moduleId, m.isPaid))
    return map
  }, [moduleAccess])

  const user = session?.user

  // Show upgrade CTA if any module is not paid
  const hasAnyFreeModule = moduleAccess.some(m => !m.isPaid)
  const showUpgrade = hasAnyFreeModule

  // Build navigation items with dynamic badges
  const mainNavItems: NavItem[] = useMemo(() => {
    const openTickets = ticketStats?.openTickets || 0
    return [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { label: 'CRM', href: '/crm', icon: Users, moduleId: 'crm' },
      { label: 'Facturation', href: '/invoices', icon: FileText, moduleId: 'invoice' },
      { label: 'Projets', href: '/projects', icon: FolderKanban, moduleId: 'projects' },
      { label: 'Tickets', href: '/tickets', icon: Ticket, badge: openTickets > 0 ? String(openTickets) : undefined, moduleId: 'tickets' },
      { label: 'RH', href: '/hr', icon: UserCircle, moduleId: 'hr' },
      { label: 'Documents', href: '/docs', icon: FileStack, moduleId: 'docs' },
      { label: 'Analytics', href: '/analytics', icon: BarChart3, moduleId: 'analytics' },
    ]
  }, [ticketStats])

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-header px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/dashboard">
            <Logo size="sm" />
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="mx-auto">
            <LogoIcon className="h-8 w-8 text-primary" />
          </Link>
        )}
        {onToggle && !collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                collapsed={collapsed}
                isActive={location.pathname.startsWith(item.href)}
                isPaid={item.moduleId ? moduleAccessMap.get(item.moduleId) : undefined}
              />
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      {/* Bottom Navigation */}
      <nav className="py-4 px-3">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <NavLink item={item} collapsed={collapsed} isActive={location.pathname.startsWith(item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle (when collapsed) */}
      {onToggle && collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" size="icon" onClick={onToggle} className="w-full h-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upgrade CTA */}
      {!collapsed && showUpgrade && (
        <div className="p-3 mx-3 mb-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Passer a Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Debloquez toutes les fonctionnalites
          </p>
          <Link to="/settings/modules">
            <Button size="sm" className="w-full">
              Voir les plans
            </Button>
          </Link>
        </div>
      )}

      {/* User/Organization Info */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {getInitials(user?.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {organization?.name || 'Mon Organisation'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

interface NavLinkProps {
  item: NavItem
  collapsed: boolean
  isActive: boolean
  isPaid?: boolean  // Module paid status
}

const NavLink: FC<NavLinkProps> = ({ item, collapsed, isActive, isPaid }) => {
  return (
    <Link
      to={item.href}
      className={cn(
        'sidebar-item',
        isActive && 'sidebar-item-active',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {/* Show module status badge if this nav item has a moduleId */}
          {item.moduleId && isPaid !== undefined && (
            <ModuleStatusBadge isPaid={isPaid} size="sm" />
          )}
          {/* Show ticket count badge */}
          {item.badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
