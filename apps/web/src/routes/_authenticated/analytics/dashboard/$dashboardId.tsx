// ===========================================
// DASHBOARD DETAIL PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Plus,
  Settings,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  GripVertical,
  Trash2,
  Edit,
  Lock,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
} from '@sedona/ui'
import { formatCurrency, formatNumber, formatPercentage } from '@sedona/analytics/utils'
import { getPeriodTypeOptions } from '@sedona/analytics/utils'
import { METRICS_BY_SOURCE, getMetricDefinition } from '@sedona/analytics/metrics'
import { ANALYTICS_PLAN_LIMITS } from '@sedona/analytics'
import type { PeriodType, MetricSource, WidgetType } from '@sedona/analytics'

export const Route = createFileRoute('/_authenticated/analytics/dashboard/$dashboardId')({
  component: DashboardDetailPage,
})

// Simulated PRO status
const isPro = false
const limits = isPro ? ANALYTICS_PLAN_LIMITS.PRO : ANALYTICS_PLAN_LIMITS.FREE

// Mock dashboard
const mockDashboard = {
  id: '1',
  name: 'Vue d\'ensemble',
  description: 'KPIs principaux de l\'entreprise',
  isDefault: true,
  isShared: false,
}

// Mock widgets
const mockWidgets = [
  {
    id: 'w1',
    title: 'Contacts totaux',
    widgetType: 'kpi' as WidgetType,
    metricSource: 'crm' as MetricSource,
    metricKey: 'contacts_total',
    gridX: 0,
    gridY: 0,
    gridW: 3,
    gridH: 2,
    value: 1247,
    previousValue: 1180,
  },
  {
    id: 'w2',
    title: 'Chiffre d\'affaires',
    widgetType: 'kpi' as WidgetType,
    metricSource: 'invoice' as MetricSource,
    metricKey: 'revenue_total',
    gridX: 3,
    gridY: 0,
    gridW: 3,
    gridH: 2,
    value: 45680,
    previousValue: 42350,
  },
  {
    id: 'w3',
    title: 'Tickets ouverts',
    widgetType: 'kpi' as WidgetType,
    metricSource: 'tickets' as MetricSource,
    metricKey: 'tickets_open',
    gridX: 6,
    gridY: 0,
    gridW: 3,
    gridH: 2,
    value: 23,
    previousValue: 31,
  },
  {
    id: 'w4',
    title: 'Projets actifs',
    widgetType: 'kpi' as WidgetType,
    metricSource: 'projects' as MetricSource,
    metricKey: 'projects_active',
    gridX: 9,
    gridY: 0,
    gridW: 3,
    gridH: 2,
    value: 8,
    previousValue: 7,
  },
]

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    default:
      return formatNumber(value)
  }
}

function getTrend(current: number, previous: number) {
  const percent = ((current - previous) / previous) * 100
  if (percent > 1) return { icon: TrendingUp, color: 'text-green-600', percent }
  if (percent < -1) return { icon: TrendingDown, color: 'text-red-600', percent }
  return { icon: Minus, color: 'text-gray-500', percent: 0 }
}

function DashboardDetailPage() {
  const { dashboardId } = Route.useParams()
  const [period, setPeriod] = useState<PeriodType>('month')
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [selectedSource, setSelectedSource] = useState<MetricSource>('crm')
  const [selectedMetric, setSelectedMetric] = useState('')

  const periodOptions = getPeriodTypeOptions()
  const availableMetrics = METRICS_BY_SOURCE[selectedSource] || []
  const canAddWidget = mockWidgets.length < limits.maxWidgetsPerDashboard

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/analytics/dashboards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{mockDashboard.name}</h1>
            <p className="text-muted-foreground">{mockDashboard.description}</p>
          </div>
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
          <Button
            variant="outline"
            onClick={() => setShowAddWidget(true)}
            disabled={!canAddWidget}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un widget
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Widget limit warning */}
      {!canAddWidget && !isPro && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Limite de {limits.maxWidgetsPerDashboard} widgets atteinte.
              </span>
            </div>
            <Button variant="outline" size="sm">
              Passer a PRO pour plus
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Widgets Grid */}
      {mockWidgets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Plus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Aucun widget</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ajoutez des widgets pour visualiser vos metriques.
            </p>
            <Button className="mt-4" onClick={() => setShowAddWidget(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {mockWidgets.map((widget) => {
            const metricDef = getMetricDefinition(widget.metricSource, widget.metricKey)
            const trend = getTrend(widget.value, widget.previousValue)
            const TrendIcon = trend.icon

            return (
              <Card
                key={widget.id}
                className="group relative"
                style={{
                  gridColumn: `span ${widget.gridW}`,
                }}
              >
                {/* Drag handle (visual only for now) */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Widget menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {widget.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">
                      {formatValue(widget.value, metricDef?.format || 'number')}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                      <TrendIcon className="h-4 w-4" />
                      <span>
                        {trend.percent > 0 ? '+' : ''}
                        {trend.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {widget.metricSource}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un widget</DialogTitle>
            <DialogDescription>
              Selectionnez une metrique a afficher sur votre dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select
                value={selectedSource}
                onValueChange={(v) => {
                  setSelectedSource(v as MetricSource)
                  setSelectedMetric('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm">CRM</SelectItem>
                  <SelectItem value="invoice">Facturation</SelectItem>
                  <SelectItem value="projects">Projets</SelectItem>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="docs">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metrique</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez une metrique" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem
                      key={metric.key}
                      value={metric.key}
                      disabled={metric.isPro && !isPro}
                    >
                      <div className="flex items-center gap-2">
                        {metric.name}
                        {metric.isPro && !isPro && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMetric && (
                <p className="text-xs text-muted-foreground">
                  {availableMetrics.find((m) => m.key === selectedMetric)?.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Titre du widget</Label>
              <Input
                placeholder="Ex: Total contacts"
                defaultValue={availableMetrics.find((m) => m.key === selectedMetric)?.name}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWidget(false)}>
              Annuler
            </Button>
            <Button disabled={!selectedMetric}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
