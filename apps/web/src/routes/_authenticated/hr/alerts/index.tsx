// ===========================================
// HR ALERTS PAGE
// ===========================================

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  FileCheck,
  Briefcase,
  UserCheck,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@sedona/ui'
import { useHrAlerts, useHrStats, type HrAlert } from '@sedona/hr'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/alerts/')({
  component: AlertsPage,
})

// Alert type configuration
const alertTypeConfig: Record<HrAlert['type'], {
  icon: typeof AlertTriangle
  color: string
  bg: string
  label: string
}> = {
  trial_end: {
    icon: UserCheck,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    label: 'Fin de periode d\'essai',
  },
  contract_end: {
    icon: Briefcase,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Fin de contrat',
  },
  interview_due: {
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Entretien a planifier',
  },
  document_expiring: {
    icon: FileCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    label: 'Document expirant',
  },
}

// Severity based on days remaining
function getSeverity(daysRemaining: number): 'critical' | 'warning' | 'info' {
  if (daysRemaining <= 7) return 'critical'
  if (daysRemaining <= 15) return 'warning'
  return 'info'
}

const severityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Critique' },
  warning: { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle, label: 'Attention' },
  info: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Bell, label: 'Information' },
}

function AlertsPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Queries
  const { data: alerts, isLoading: isLoadingAlerts } = useHrAlerts(organizationId)
  const { data: stats, isLoading: isLoadingStats } = useHrStats(organizationId)

  const isLoading = isLoadingAlerts || isLoadingStats

  if (isLoading && !alerts) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const alertsList = alerts || []

  // Count alerts by severity
  const criticalCount = alertsList.filter(a => getSeverity(a.daysRemaining) === 'critical').length
  const warningCount = alertsList.filter(a => getSeverity(a.daysRemaining) === 'warning').length
  const infoCount = alertsList.filter(a => getSeverity(a.daysRemaining) === 'info').length

  // Group alerts by type
  const alertsByType: Record<string, HrAlert[]> = {}
  alertsList.forEach(alert => {
    if (!alertsByType[alert.type]) {
      alertsByType[alert.type] = []
    }
    alertsByType[alert.type].push(alert)
  })

  // Stats from HR
  const displayStats = stats || {
    trialEndingSoon: 0,
    contractEndingSoon: 0,
    pendingLeaveRequests: 0,
    upcomingInterviews: 0,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Alertes RH
          </h1>
          <p className="text-muted-foreground mt-1">
            Echeances importantes et actions requises
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critique</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{infoCount}</p>
                <p className="text-sm text-muted-foreground">Information</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alertsList.length}</p>
                <p className="text-sm text-muted-foreground">Total alertes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Periodes d'essai</p>
                <p className="text-2xl font-bold">{displayStats.trialEndingSoon}</p>
                <p className="text-xs text-muted-foreground">se terminent bientot</p>
              </div>
              <UserCheck className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contrats</p>
                <p className="text-2xl font-bold">{displayStats.contractEndingSoon}</p>
                <p className="text-xs text-muted-foreground">arrivent a echeance</p>
              </div>
              <Briefcase className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conges</p>
                <p className="text-2xl font-bold">{displayStats.pendingLeaveRequests}</p>
                <p className="text-xs text-muted-foreground">demandes en attente</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entretiens</p>
                <p className="text-2xl font-bold">{displayStats.upcomingInterviews}</p>
                <p className="text-xs text-muted-foreground">a venir (30j)</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical & Warning Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertes urgentes
            </CardTitle>
            <CardDescription>Actions requises dans les 15 prochains jours</CardDescription>
          </CardHeader>
          <CardContent>
            {alertsList.filter(a => getSeverity(a.daysRemaining) !== 'info').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>Aucune alerte urgente</p>
                <p className="text-sm">Tout est sous controle !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertsList
                  .filter(a => getSeverity(a.daysRemaining) !== 'info')
                  .sort((a, b) => a.daysRemaining - b.daysRemaining)
                  .map((alert) => {
                    const typeConfig = alertTypeConfig[alert.type]
                    const severity = getSeverity(alert.daysRemaining)
                    const sevConfig = severityConfig[severity]
                    const Icon = typeConfig.icon

                    return (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`p-2 rounded-lg ${sevConfig.bg}`}>
                          <Icon className={`h-4 w-4 ${sevConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{typeConfig.label}</p>
                            <Badge
                              variant={severity === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {alert.daysRemaining === 0
                                ? 'Aujourd\'hui'
                                : alert.daysRemaining === 1
                                  ? 'Demain'
                                  : `${alert.daysRemaining} jours`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {alert.employeeName}
                            </Badge>
                            <Link
                              to="/hr/employees/$employeeId"
                              params={{ employeeId: alert.employeeId }}
                            >
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                Voir le profil
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Alerts by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Toutes les alertes
            </CardTitle>
            <CardDescription>Regroupees par type d'alerte</CardDescription>
          </CardHeader>
          <CardContent>
            {alertsList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>Aucune alerte</p>
                <p className="text-sm">Aucune echeance a signaler</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(alertsByType).map(([type, typeAlerts]) => {
                  const config = alertTypeConfig[type as HrAlert['type']]
                  const Icon = config.icon

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="font-medium text-sm">{config.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {typeAlerts.length}
                        </Badge>
                      </div>
                      <div className="pl-8 space-y-1">
                        {typeAlerts.slice(0, 3).map((alert) => (
                          <div
                            key={alert.id}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <Link
                              to="/hr/employees/$employeeId"
                              params={{ employeeId: alert.employeeId }}
                              className="hover:text-primary"
                            >
                              {alert.employeeName}
                            </Link>
                            <span className="text-muted-foreground text-xs">
                              {alert.daysRemaining === 0
                                ? 'Aujourd\'hui'
                                : alert.daysRemaining === 1
                                  ? 'Demain'
                                  : `Dans ${alert.daysRemaining}j`}
                            </span>
                          </div>
                        ))}
                        {typeAlerts.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{typeAlerts.length - 3} autre{typeAlerts.length - 3 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
