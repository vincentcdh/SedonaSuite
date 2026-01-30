// ===========================================
// TICKETS STATISTICS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Avatar,
  AvatarFallback,
} from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/tickets/stats/')({
  component: TicketStatsPage,
})

// Mock stats data
const mockStats = {
  totalTickets: 1247,
  openTickets: 45,
  inProgressTickets: 23,
  waitingTickets: 12,
  resolvedTickets: 892,
  closedTickets: 275,
  slaBreachedTickets: 8,
  createdLast24h: 18,
  resolvedLast24h: 22,
  avgFirstResponseMinutes: 45,
  avgResolutionMinutes: 480,
  avgSatisfaction: 4.2,
}

// Mock trends
const mockTrends = {
  totalTicketsChange: 12,
  resolvedChange: 8,
  avgResponseChange: -15,
  satisfactionChange: 0.3,
}

// Mock agent workload
const mockAgentWorkload = [
  { id: '1', fullName: 'Alice Martin', totalAssigned: 15, openAssigned: 8, urgentTickets: 2, avgResolution: 380 },
  { id: '2', fullName: 'Bob Durand', totalAssigned: 12, openAssigned: 5, urgentTickets: 1, avgResolution: 420 },
  { id: '3', fullName: 'Claire Petit', totalAssigned: 18, openAssigned: 10, urgentTickets: 3, avgResolution: 350 },
  { id: '4', fullName: 'David Martin', totalAssigned: 10, openAssigned: 3, urgentTickets: 0, avgResolution: 520 },
]

// Mock category distribution
const mockCategoryDistribution = [
  { name: 'Support Technique', count: 45, color: '#3B82F6' },
  { name: 'Facturation', count: 28, color: '#10B981' },
  { name: 'Commercial', count: 15, color: '#F59E0B' },
  { name: 'Autre', count: 12, color: '#6B7280' },
]

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`
}

function TicketStatsPage() {
  const totalOpen = mockStats.openTickets + mockStats.inProgressTickets + mockStats.waitingTickets
  const totalCategoryTickets = mockCategoryDistribution.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">Vue d'ensemble des performances du support</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets ouverts</p>
                <p className="text-3xl font-bold">{totalOpen}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {mockTrends.totalTicketsChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={mockTrends.totalTicketsChange > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(mockTrends.totalTicketsChange)}%
              </span>
              <span className="text-muted-foreground">vs semaine derniere</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps de reponse moyen</p>
                <p className="text-3xl font-bold">{formatDuration(mockStats.avgFirstResponseMinutes)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {mockTrends.avgResponseChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
              <span className={mockTrends.avgResponseChange < 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(mockTrends.avgResponseChange)}%
              </span>
              <span className="text-muted-foreground">vs semaine derniere</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolus aujourd'hui</p>
                <p className="text-3xl font-bold">{mockStats.resolvedLast24h}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {mockTrends.resolvedChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={mockTrends.resolvedChange > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(mockTrends.resolvedChange)}%
              </span>
              <span className="text-muted-foreground">vs hier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction (CSAT)</p>
                <p className="text-3xl font-bold">{mockStats.avgSatisfaction.toFixed(1)}/5</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {mockTrends.satisfactionChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={mockTrends.satisfactionChange > 0 ? 'text-green-500' : 'text-red-500'}>
                {mockTrends.satisfactionChange > 0 ? '+' : ''}{mockTrends.satisfactionChange.toFixed(1)}
              </span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Warning */}
      {mockStats.slaBreachedTickets > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">
                <span className="font-semibold">{mockStats.slaBreachedTickets} ticket{mockStats.slaBreachedTickets > 1 ? 's' : ''}</span>
                {' '}ont depasse le SLA. Action immediate requise.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Repartition par statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Ouverts</span>
                <span className="font-medium">{mockStats.openTickets}</span>
              </div>
              <Progress value={(mockStats.openTickets / totalOpen) * 100} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">En cours</span>
                <span className="font-medium">{mockStats.inProgressTickets}</span>
              </div>
              <Progress value={(mockStats.inProgressTickets / totalOpen) * 100} className="h-2 [&>div]:bg-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">En attente</span>
                <span className="font-medium">{mockStats.waitingTickets}</span>
              </div>
              <Progress value={(mockStats.waitingTickets / totalOpen) * 100} className="h-2 [&>div]:bg-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Repartition par categorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCategoryDistribution.map(category => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="font-medium">{category.count}</span>
                </div>
                <Progress
                  value={(category.count / totalCategoryTickets) * 100}
                  className="h-2"
                  style={{ '--progress-color': category.color } as React.CSSProperties}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Agent workload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Charge de travail des agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Agent</th>
                  <th className="text-center py-3 px-4 font-medium">Assignes</th>
                  <th className="text-center py-3 px-4 font-medium">Ouverts</th>
                  <th className="text-center py-3 px-4 font-medium">Urgents</th>
                  <th className="text-center py-3 px-4 font-medium">Temps moyen resolution</th>
                </tr>
              </thead>
              <tbody>
                {mockAgentWorkload.map(agent => (
                  <tr key={agent.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {agent.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{agent.fullName}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">{agent.totalAssigned}</td>
                    <td className="text-center py-3 px-4">{agent.openAssigned}</td>
                    <td className="text-center py-3 px-4">
                      {agent.urgentTickets > 0 ? (
                        <span className="text-red-600 font-medium">{agent.urgentTickets}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">{formatDuration(agent.avgResolution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
