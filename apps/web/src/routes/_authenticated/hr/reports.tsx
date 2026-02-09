// ===========================================
// HR REPORTS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Briefcase,
  Clock,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sedona/ui'
import {
  useHrStats,
  useEmployeeCountByDepartment,
  useEmployeeCountByContractType,
  useHeadcountHistory,
} from '@sedona/hr'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/reports')({
  component: HrReportsPage,
})

// Contract type labels in French
const contractTypeLabels: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  internship: 'Stage',
  apprenticeship: 'Alternance',
  freelance: 'Freelance',
  temporary: 'Interim',
  other: 'Autre',
}

// Contract type colors
const contractTypeColors: Record<string, string> = {
  cdi: 'bg-blue-500',
  cdd: 'bg-purple-500',
  internship: 'bg-pink-500',
  apprenticeship: 'bg-indigo-500',
  freelance: 'bg-green-500',
  temporary: 'bg-orange-500',
  other: 'bg-gray-500',
}

// Month labels in French
const monthLabels = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec']

function HrReportsPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useHrStats(organizationId)
  const { data: departmentData, isLoading: isLoadingDepartments } = useEmployeeCountByDepartment(organizationId)
  const { data: contractTypeData, isLoading: isLoadingContractTypes } = useEmployeeCountByContractType(organizationId)
  const { data: headcountHistory, isLoading: isLoadingHistory } = useHeadcountHistory(organizationId, 12)

  const isLoading = isLoadingStats || isLoadingDepartments || isLoadingContractTypes || isLoadingHistory

  if (isLoading && !stats) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Default values if no data
  const displayStats = stats || {
    totalEmployees: 0,
    activeEmployees: 0,
    hiredThisMonth: 0,
    leftThisMonth: 0,
    absenteeismRate: null,
    averageTenureMonths: null,
    leaveDaysThisMonth: 0,
    overdueInterviews: 0,
    turnoverRate: null,
  }

  const departments = departmentData || []
  const contractTypes = contractTypeData || []
  const history = headcountHistory || []

  // Calculate percentages for contract types
  const totalContractTypes = contractTypes.reduce((sum, ct) => sum + ct.count, 0)

  // Calculate percentages for departments
  const totalDepartments = departments.reduce((sum, d) => sum + d.count, 0)

  // Get max count for history chart scaling
  const maxHistoryCount = Math.max(...history.map(h => h.count), 1)

  // Format average tenure
  const formatTenure = (months: number | null) => {
    if (months === null) return '-'
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (years === 0) return `${remainingMonths} mois`
    if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`
    return `${years}.${Math.round((remainingMonths / 12) * 10)} ans`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Rapports RH</h1>
        <p className="text-muted-foreground">
          Indicateurs cles et statistiques de votre equipe
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectif total</p>
                <p className="text-3xl font-bold">{displayStats.activeEmployees}</p>
                {displayStats.hiredThisMonth > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +{displayStats.hiredThisMonth} ce mois
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embauches ce mois</p>
                <p className="text-3xl font-bold">{displayStats.hiredThisMonth}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departs ce mois</p>
                <p className="text-3xl font-bold">{displayStats.leftThisMonth}</p>
                {displayStats.turnoverRate !== null && displayStats.turnoverRate > 0 && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3" />
                    Turnover: {displayStats.turnoverRate.toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux d'absenteisme</p>
                <p className="text-3xl font-bold">
                  {displayStats.absenteeismRate !== null
                    ? `${displayStats.absenteeismRate.toFixed(1)}%`
                    : '-'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Repartition par type de contrat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contractTypes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune donnee disponible
              </p>
            ) : (
              <div className="space-y-4">
                {contractTypes.map((ct) => {
                  const percentage = totalContractTypes > 0 ? (ct.count / totalContractTypes) * 100 : 0
                  const label = contractTypeLabels[ct.contractType] || ct.contractType
                  const color = contractTypeColors[ct.contractType] || 'bg-gray-500'

                  return (
                    <div key={ct.contractType}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span>{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{ct.count}</span>
                          <span className="text-muted-foreground text-sm">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className={`${color} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Repartition par departement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune donnee disponible
              </p>
            ) : (
              <div className="space-y-4">
                {departments.map((dept) => {
                  const percentage = totalDepartments > 0 ? (dept.count / totalDepartments) * 100 : 0

                  return (
                    <div key={dept.department}>
                      <div className="flex items-center justify-between">
                        <span>{dept.department}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{dept.count}</span>
                          <span className="text-muted-foreground text-sm">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Headcount evolution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolution des effectifs (12 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune donnee disponible
            </p>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {history.map((entry) => {
                const heightPercent = maxHistoryCount > 0 ? (entry.count / maxHistoryCount) * 100 : 0
                const monthIndex = parseInt(entry.month.split('-')[1]) - 1

                return (
                  <div key={entry.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium">{entry.count}</span>
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {monthLabels[monthIndex]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Anciennete moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatTenure(displayStats.averageTenureMonths)}</p>
            {displayStats.averageTenureMonths !== null && (
              <p className="text-muted-foreground">
                {displayStats.averageTenureMonths} mois
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Conges poses ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{displayStats.leaveDaysThisMonth}</p>
            <p className="text-muted-foreground">jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Entretiens en retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold ${displayStats.overdueInterviews > 0 ? 'text-orange-600' : ''}`}>
              {displayStats.overdueInterviews}
            </p>
            <p className="text-muted-foreground">entretiens pro &gt; 2 ans</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
