import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sedona/ui'
import {
  Users,
  FileText,
  FolderKanban,
  Ticket,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { useDashboardStats, useRecentActivity } from '@sedona/analytics'
import { useOrganization } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

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

function DashboardPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const { data: stats, isLoading: statsLoading } = useDashboardStats(organizationId)
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(organizationId, 5)

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-description">
          Bienvenue sur Sedona.AI. Voici un apercu de votre activite.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Contacts"
              value={formatNumber(stats?.contacts.total || 0)}
              change={stats?.contacts.change || 0}
              changeLabel="vs mois dernier"
              icon={Users}
            />
            <StatsCard
              title="Chiffre d'affaires"
              value={formatCurrency(stats?.revenue.total || 0)}
              change={stats?.revenue.change || 0}
              changeLabel="vs mois dernier"
              icon={FileText}
            />
            <StatsCard
              title="Projets actifs"
              value={formatNumber(stats?.projects.active || 0)}
              change={stats?.projects.change || 0}
              changeLabel="vs mois dernier"
              icon={FolderKanban}
            />
            <StatsCard
              title="Tickets ouverts"
              value={formatNumber(stats?.tickets.open || 0)}
              change={stats?.tickets.change || 0}
              changeLabel="vs mois dernier"
              icon={Ticket}
            />
          </>
        )}
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
              {[
                { label: 'Nouveau contact', href: '/crm/contacts/new', icon: Users },
                { label: 'Creer une facture', href: '/invoices/new', icon: FileText },
                { label: 'Nouveau projet', href: '/projects/new', icon: FolderKanban },
                { label: 'Ouvrir un ticket', href: '/tickets/new', icon: Ticket },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
}

function StatsCard({ title, value, change, changeLabel, icon: Icon }: StatsCardProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold font-heading">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
      </CardContent>
    </Card>
  )
}

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
