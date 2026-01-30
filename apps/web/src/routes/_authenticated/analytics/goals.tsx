// ===========================================
// GOALS PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Target,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Lock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { formatCurrency, formatNumber, formatPercentage } from '@sedona/analytics/utils'
import { ANALYTICS_PLAN_LIMITS } from '@sedona/analytics'
import { usePlan } from '@/hooks/usePlan'
import type { MetricSource, PeriodType } from '@sedona/analytics'

export const Route = createFileRoute('/_authenticated/analytics/goals')({
  component: GoalsPage,
})

// Mock goals
const mockGoals = [
  {
    id: '1',
    name: 'Chiffre d\'affaires mensuel',
    description: 'Objectif de CA pour janvier 2024',
    metricSource: 'invoice' as MetricSource,
    metricKey: 'revenue_total',
    targetValue: 60000,
    currentValue: 45680,
    periodType: 'month' as PeriodType,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    isActive: true,
    daysRemaining: 12,
    onTrack: true,
  },
  {
    id: '2',
    name: 'Nouveaux contacts',
    description: 'Acquisition de nouveaux contacts',
    metricSource: 'crm' as MetricSource,
    metricKey: 'contacts_created',
    targetValue: 100,
    currentValue: 67,
    periodType: 'month' as PeriodType,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    isActive: true,
    daysRemaining: 12,
    onTrack: false,
  },
  {
    id: '3',
    name: 'Taux de resolution tickets',
    description: 'Tickets resolus dans les 24h',
    metricSource: 'tickets' as MetricSource,
    metricKey: 'tickets_resolved',
    targetValue: 90,
    currentValue: 78,
    periodType: 'month' as PeriodType,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    isActive: true,
    daysRemaining: 12,
    onTrack: false,
  },
]

function formatGoalValue(value: number, metricKey: string): string {
  if (metricKey.includes('revenue') || metricKey.includes('value')) {
    return formatCurrency(value)
  }
  if (metricKey.includes('rate') || metricKey.includes('percentage')) {
    return formatPercentage(value)
  }
  return formatNumber(value)
}

function getSourceLabel(source: MetricSource): string {
  const labels: Record<MetricSource, string> = {
    crm: 'CRM',
    invoice: 'Facturation',
    projects: 'Projets',
    tickets: 'Tickets',
    hr: 'RH',
    docs: 'Documents',
  }
  return labels[source]
}

function GoalsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const { isFree } = usePlan()

  const limits = isFree ? ANALYTICS_PLAN_LIMITS.FREE : ANALYTICS_PLAN_LIMITS.PRO
  const canCreateMore = mockGoals.length < limits.maxGoals

  // Usage tracking for FREE plan
  const currentCount = mockGoals.length
  const limit = limits.maxGoals
  const usagePercent = (currentCount / limit) * 100
  const isNearLimit = usagePercent >= 80
  const isAtLimit = currentCount >= limit

  const filteredGoals = mockGoals.filter((goal) => {
    if (filter === 'active') return goal.isActive
    if (filter === 'completed') return !goal.isActive
    return true
  })

  const activeGoals = mockGoals.filter((g) => g.isActive)
  const onTrackCount = activeGoals.filter((g) => g.onTrack).length
  const offTrackCount = activeGoals.filter((g) => !g.onTrack).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6" />
              Objectifs
            </h1>
            <p className="text-muted-foreground mt-1">
              Definissez et suivez vos objectifs business
            </p>
          </div>
          {isFree && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : ''}`}>
                    {currentCount}/{limit} objectifs
                  </span>
                  {isNearLimit && !isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  {isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Progress
                  value={usagePercent}
                  className={`h-1.5 w-24 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
                />
              </div>
              <Link to="/settings/billing" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Plus en PRO
              </Link>
            </div>
          )}
        </div>
        {isAtLimit && isFree ? (
          <Link to="/settings/billing">
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Passer en PRO
            </Button>
          </Link>
        ) : (
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!canCreateMore}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel objectif
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeGoals.length}</p>
              <p className="text-sm text-muted-foreground">Objectifs actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onTrackCount}</p>
              <p className="text-sm text-muted-foreground">En bonne voie</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{offTrackCount}</p>
              <p className="text-sm text-muted-foreground">En retard</p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'active' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Actifs
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Termines
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tous
        </Button>
      </div>

      {/* Goals list */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Aucun objectif</p>
            <p className="text-sm text-muted-foreground mt-2">
              Creez votre premier objectif pour suivre vos performances.
            </p>
            <Button
              className="mt-4"
              onClick={() => setShowCreateDialog(true)}
              disabled={!canCreateMore}
            >
              <Plus className="h-4 w-4 mr-2" />
              Creer un objectif
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const percent = Math.min(100, (goal.currentValue / goal.targetValue) * 100)

            return (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {goal.name}
                        {goal.onTrack ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {goal.isActive ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marquer comme termine
                            </>
                          ) : (
                            <>
                              <Target className="h-4 w-4 mr-2" />
                              Reactiver
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{getSourceLabel(goal.metricSource)}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {goal.daysRemaining} jours restants
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progression</span>
                      <span className="text-sm font-medium">{percent.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={percent}
                      className={`h-3 ${goal.onTrack ? '' : '[&>div]:bg-red-500'}`}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {formatGoalValue(goal.currentValue, goal.metricKey)}
                      </span>
                      <span className="text-muted-foreground">
                        / {formatGoalValue(goal.targetValue, goal.metricKey)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvel objectif</DialogTitle>
            <DialogDescription>
              Definissez un objectif mesurable pour suivre vos performances.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de l'objectif</Label>
              <Input placeholder="Ex: CA mensuel Q1" />
            </div>

            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Input placeholder="Description de l'objectif" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Module</Label>
                <Select defaultValue="crm">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="invoice">Facturation</SelectItem>
                    <SelectItem value="projects">Projets</SelectItem>
                    <SelectItem value="tickets">Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Metrique</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacts_created">Nouveaux contacts</SelectItem>
                    <SelectItem value="deals_won">Opportunites gagnees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valeur cible</Label>
              <Input type="number" placeholder="100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de debut</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button>Creer l'objectif</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
