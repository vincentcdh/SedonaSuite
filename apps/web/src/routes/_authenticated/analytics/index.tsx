// ===========================================
// ANALYTICS DASHBOARD INDEX PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Users,
  FileBarChart,
  Euro,
  Ticket,
  Briefcase,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from '@sedona/ui'
import { formatCurrency, formatNumber, formatPercentage } from '@sedona/analytics/utils'
import { getPeriodTypeOptions } from '@sedona/analytics/utils'
import { useActiveGoals, useKPIData, useWeeklyActivity, type PeriodType } from '@sedona/analytics'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/analytics/')({
  component: AnalyticsIndexPage,
})

// Icon mapping for KPIs
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Users,
  Euro,
  Ticket,
  Briefcase,
}

function formatValue(value: number, format: 'number' | 'currency' | 'percentage'): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    default:
      return formatNumber(value)
  }
}

function getTrend(current: number, previous: number): { icon: typeof TrendingUp; color: string; percent: number } {
  if (previous === 0) {
    return { icon: current > 0 ? TrendingUp : Minus, color: current > 0 ? 'text-green-600' : 'text-gray-500', percent: current > 0 ? 100 : 0 }
  }
  const percent = ((current - previous) / previous) * 100

  if (percent > 1) {
    return { icon: TrendingUp, color: 'text-green-600', percent }
  } else if (percent < -1) {
    return { icon: TrendingDown, color: 'text-red-600', percent }
  }
  return { icon: Minus, color: 'text-gray-500', percent: 0 }
}

function AnalyticsIndexPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const [period, setPeriod] = useState<PeriodType>('month')
  const periodOptions = getPeriodTypeOptions()

  // Fetch real data from database
  const { data: kpis, isLoading: kpisLoading } = useKPIData(organizationId)
  const { data: weeklyActivity, isLoading: weeklyLoading } = useWeeklyActivity(organizationId)
  const { data: goals = [], isLoading: goalsLoading } = useActiveGoals(organizationId)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de vos indicateurs cles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/analytics/dashboards">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          kpis?.map((kpi) => {
            const Icon = iconMap[kpi.icon] || Users
            const trend = getTrend(kpi.value, kpi.previousValue)
            const TrendIcon = trend.icon

            return (
              <Card key={kpi.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${kpi.color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: kpi.color }} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                      <TrendIcon className="h-4 w-4" />
                      <span>{trend.percent > 0 ? '+' : ''}{trend.percent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{formatValue(kpi.value, kpi.format)}</p>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activite de la semaine</CardTitle>
            <CardDescription>Nombre d'actions par jour</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-48 flex items-end gap-2">
                {(weeklyActivity || []).map((item, index) => {
                  const maxValue = Math.max(...(weeklyActivity || []).map((d) => d.value), 1)
                  const height = (item.value / maxValue) * 100

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex-1 flex items-end">
                        <div
                          className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                          style={{ height: `${height}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                        />
                        {item.value > 0 && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                            {item.value}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objectifs
            </CardTitle>
            <Link
              to="/analytics/goals"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : goals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun objectif actif
              </p>
            ) : (
              goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {goal.daysRemaining}j restants
                    </span>
                  </div>
                  <Progress value={goal.percentComplete} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatNumber(goal.currentValue)} / {formatNumber(goal.targetValue)}
                    </span>
                    <Badge variant={goal.onTrack ? 'default' : 'destructive'} className="text-xs">
                      {goal.onTrack ? 'En bonne voie' : 'En retard'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/analytics/dashboards">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Mes dashboards</p>
                <p className="text-sm text-muted-foreground">Creer et gerer vos tableaux de bord</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics/goals">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Objectifs</p>
                <p className="text-sm text-muted-foreground">Suivre vos objectifs business</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics/reports">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileBarChart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Rapports</p>
                <p className="text-sm text-muted-foreground">Rapports automatises</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-14 rounded bg-muted animate-pulse" />
        </div>
        <div className="mt-4">
          <div className="h-8 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}
