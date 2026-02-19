import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  cn,
} from '@sedona/ui'
import {
  Users,
  FileText,
  FolderKanban,
  Ticket,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  UserCog,
  FolderOpen,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { useDashboardStats, useRecentActivity } from '@sedona/analytics'
import { useOrganization } from '@/lib/auth'
import { useModuleSubscriptions, type ModuleId, type ModuleSubscription } from '@sedona/billing'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { SubscriptionSummary, OnboardingChecklist } from '@/components/dashboard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

// ===========================================
// TYPES & CONSTANTS
// ===========================================

interface ModuleKPIConfig {
  moduleId: ModuleId
  title: string
  icon: React.ComponentType<{ className?: string }>
  getValue: (stats: DashboardStats | undefined) => number
  getChange: (stats: DashboardStats | undefined) => number
  formatValue: (value: number) => string
  limitKey?: string
  limitLabel?: string
  quickAction?: {
    label: string
    href: string
  }
}

interface DashboardStats {
  contacts: { total: number; change: number }
  revenue: { total: number; change: number }
  projects: { active: number; change: number }
  tickets: { open: number; change: number }
  employees?: { total: number; change: number }
  documents?: { total: number; change: number }
}

// Module KPI configurations
const MODULE_KPIS: ModuleKPIConfig[] = [
  {
    moduleId: 'crm',
    title: 'Contacts',
    icon: Users,
    getValue: (stats) => stats?.contacts.total || 0,
    getChange: (stats) => stats?.contacts.change || 0,
    formatValue: formatNumber,
    limitKey: 'max_contacts',
    limitLabel: 'contacts',
    quickAction: { label: 'Nouveau contact', href: '/crm/contacts/new' },
  },
  {
    moduleId: 'invoice',
    title: "Chiffre d'affaires",
    icon: FileText,
    getValue: (stats) => stats?.revenue.total || 0,
    getChange: (stats) => stats?.revenue.change || 0,
    formatValue: formatCurrency,
    quickAction: { label: 'Creer une facture', href: '/invoices/new' },
  },
  {
    moduleId: 'projects',
    title: 'Projets actifs',
    icon: FolderKanban,
    getValue: (stats) => stats?.projects.active || 0,
    getChange: (stats) => stats?.projects.change || 0,
    formatValue: formatNumber,
    limitKey: 'max_projects',
    limitLabel: 'projets',
    quickAction: { label: 'Nouveau projet', href: '/projects/new' },
  },
  {
    moduleId: 'tickets',
    title: 'Tickets ouverts',
    icon: Ticket,
    getValue: (stats) => stats?.tickets.open || 0,
    getChange: (stats) => stats?.tickets.change || 0,
    formatValue: formatNumber,
    quickAction: { label: 'Ouvrir un ticket', href: '/tickets/new' },
  },
  {
    moduleId: 'hr',
    title: 'Employes',
    icon: UserCog,
    getValue: (stats) => stats?.employees?.total || 0,
    getChange: (stats) => stats?.employees?.change || 0,
    formatValue: formatNumber,
    limitKey: 'max_employees',
    limitLabel: 'employes',
    quickAction: { label: 'Ajouter un employe', href: '/hr/employees/new' },
  },
  {
    moduleId: 'docs',
    title: 'Documents',
    icon: FolderOpen,
    getValue: (stats) => stats?.documents?.total || 0,
    getChange: (stats) => stats?.documents?.change || 0,
    formatValue: formatNumber,
    limitKey: 'max_files',
    limitLabel: 'fichiers',
  },
]

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

function getModuleByKPI(modules: ModuleSubscription[], moduleId: ModuleId): ModuleSubscription | undefined {
  return modules.find((m) => m.moduleId === moduleId)
}

// ===========================================
// MAIN COMPONENT
// ===========================================

function DashboardPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const { data: stats, isLoading: statsLoading } = useDashboardStats(organizationId)
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(organizationId, 5)
  const { modules, isLoading: modulesLoading } = useModuleSubscriptions(organizationId)

  // Get the analytics module to determine dashboard complexity
  const analyticsModule = modules.find((m) => m.moduleId === 'analytics')
  const hasAdvancedAnalytics = analyticsModule?.isPaid || false

  // Filter KPIs based on subscribed modules (show all modules, both free and paid)
  const activeKPIs = MODULE_KPIS.filter((kpi) => {
    const module = getModuleByKPI(modules, kpi.moduleId)
    // Show if module exists (free or paid)
    return module !== undefined
  }).slice(0, hasAdvancedAnalytics ? 6 : 4) // Show more KPIs for paid analytics

  // Get quick actions from active modules
  const quickActions = activeKPIs
    .filter((kpi) => kpi.quickAction)
    .map((kpi) => ({
      ...kpi.quickAction!,
      icon: kpi.icon,
      moduleId: kpi.moduleId,
    }))

  const isLoading = statsLoading || modulesLoading

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-description">
          Bienvenue sur Sedona.AI. Voici un apercu de votre activite.
        </p>
      </div>

      {/* Onboarding Checklist (for new users) */}
      <div className="mb-6">
        <OnboardingChecklist />
      </div>

      {/* Stats Grid */}
      <div
        className={cn(
          'grid gap-4 mb-8',
          activeKPIs.length <= 4
            ? 'md:grid-cols-2 lg:grid-cols-4'
            : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
        )}
      >
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </>
        ) : (
          activeKPIs.map((kpi) => {
            const module = getModuleByKPI(modules, kpi.moduleId)
            const isPaid = module?.isPaid || false
            const usage = module?.usage || {}
            const limits = module?.limits || {}

            // Get usage data for the limit key
            const currentUsage = kpi.limitKey ? usage[kpi.limitKey] || 0 : 0
            const limit = kpi.limitKey ? limits[kpi.limitKey] || 0 : 0
            const showUsageBar = Boolean(!isPaid && kpi.limitKey && limit > 0 && limit !== -1)

            return (
              <StatsCard
                key={kpi.moduleId}
                title={kpi.title}
                value={kpi.formatValue(kpi.getValue(stats))}
                change={kpi.getChange(stats)}
                changeLabel="vs mois dernier"
                icon={kpi.icon}
                isPaid={isPaid}
                showUsageBar={showUsageBar}
                usage={currentUsage}
                limit={limit}
                limitLabel={kpi.limitLabel}
                moduleId={kpi.moduleId}
              />
            )
          })
        )}
      </div>

      {/* Subscription Summary */}
      <div className="mb-6">
        <SubscriptionSummary />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activite recente</CardTitle>
            <CardDescription>Les dernieres actions sur votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune activite recente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
            <CardDescription>Accedez rapidement aux fonctionnalites cles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action) => {
                const module = getModuleByKPI(modules, action.moduleId)
                const isPaid = module?.isPaid || false

                return (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <Badge variant="secondary" className="text-[10px]">
                          FREE
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics CTA (for free users) */}
      {!hasAdvancedAnalytics && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Debloquez les Analytics avances
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tableaux de bord personnalises, rapports automatises et predictions IA
                  </p>
                </div>
              </div>
              <Link to="/settings/modules" search={{}}>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Voir les plans
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ===========================================
// STATS CARD COMPONENT
// ===========================================

interface StatsCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
  isPaid?: boolean
  showUsageBar?: boolean
  usage?: number
  limit?: number
  limitLabel?: string
  moduleId?: ModuleId
}

function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  isPaid = false,
  showUsageBar = false,
  usage = 0,
  limit = 0,
  limitLabel,
  moduleId,
}: StatsCardProps) {
  const isPositive = change >= 0
  const usagePercent = limit > 0 ? Math.min(100, (usage / limit) * 100) : 0
  const isNearLimit = usagePercent >= 80
  const isAtLimit = usagePercent >= 100

  return (
    <Card className={cn(isAtLimit && 'border-destructive/50')}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            {!isPaid && (
              <Badge variant="secondary" className="text-[10px] px-1.5">
                FREE
              </Badge>
            )}
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-success' : 'text-error'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold font-heading">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>

        {/* Usage bar for FREE modules */}
        {showUsageBar && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={cn('text-muted-foreground', isNearLimit && 'text-warning', isAtLimit && 'text-destructive')}>
                {usage}/{limit} {limitLabel}
              </span>
              <span className={cn('font-medium', isNearLimit && 'text-warning', isAtLimit && 'text-destructive')}>
                {Math.round(usagePercent)}%
              </span>
            </div>
            <Progress
              value={usagePercent}
              className={cn(
                'h-1.5',
                isNearLimit && '[&>div]:bg-warning',
                isAtLimit && '[&>div]:bg-destructive'
              )}
            />
            {isAtLimit && moduleId && (
              <Link
                to="/settings/modules"
                search={{}}
                className="text-[10px] text-primary hover:underline mt-1 inline-block"
              >
                Passer a Pro
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ===========================================
// SKELETON COMPONENT
// ===========================================

function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-12 rounded bg-muted animate-pulse" />
        </div>
        <div className="mt-4">
          <div className="h-8 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse mt-2" />
        </div>
        <div className="h-3 w-20 rounded bg-muted animate-pulse mt-2" />
      </CardContent>
    </Card>
  )
}
