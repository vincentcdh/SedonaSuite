// ===========================================
// TICKETS STATISTICS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@sedona/ui'
import { useTicketStats, useCategories, useTickets } from '@sedona/tickets'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/tickets/stats/')({
  component: TicketStatsPage,
})

function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '-'
  if (minutes < 60) return minutes + 'min'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return mins > 0 ? hours + 'h ' + mins + 'min' : hours + 'h'
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? days + 'j ' + remainingHours + 'h' : days + 'j'
}

function TicketStatsPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch real stats
  const { data: stats, isLoading: loadingStats } = useTicketStats(organizationId)
  const { data: categories = [], isLoading: loadingCategories } = useCategories(organizationId)

  // Fetch tickets to count by category
  const { data: ticketsData } = useTickets(organizationId, {}, { page: 1, pageSize: 1000 })
  const tickets = ticketsData?.data || []

  const isLoading = loadingStats

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Calculate totals
  const totalOpen = (stats?.openTickets || 0) + (stats?.inProgressTickets || 0) + (stats?.waitingTickets || 0)

  // Calculate category distribution from tickets
  const categoryDistribution = categories.map(cat => {
    const count = tickets.filter(t => t.categoryId === cat.id).length
    return {
      id: cat.id,
      name: cat.name,
      count,
      color: cat.color || '#6B7280',
    }
  }).filter(c => c.count > 0)

  const totalCategoryTickets = categoryDistribution.reduce((sum, c) => sum + c.count, 0) || 1

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
            <div className="mt-4 text-sm text-muted-foreground">
              {stats?.createdLast24h || 0} nouveau(x) aujourd'hui
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps de reponse moyen</p>
                <p className="text-3xl font-bold">{formatDuration(stats?.avgFirstResponseMinutes || null)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Objectif: {'<'} 1h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolus aujourd'hui</p>
                <p className="text-3xl font-bold">{stats?.resolvedLast24h || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {stats?.resolvedTickets || 0} total resolus
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total tickets</p>
                <p className="text-3xl font-bold">{stats?.totalTickets || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {stats?.closedTickets || 0} fermes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Warning */}
      {(stats?.slaBreachedTickets || 0) > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">
                <span className="font-semibold">{stats?.slaBreachedTickets} ticket{(stats?.slaBreachedTickets || 0) > 1 ? 's' : ''}</span>
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
            {totalOpen > 0 ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ouverts</span>
                    <span className="font-medium">{stats?.openTickets || 0}</span>
                  </div>
                  <Progress value={((stats?.openTickets || 0) / totalOpen) * 100} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">En cours</span>
                    <span className="font-medium">{stats?.inProgressTickets || 0}</span>
                  </div>
                  <Progress value={((stats?.inProgressTickets || 0) / totalOpen) * 100} className="h-2 [&>div]:bg-yellow-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">En attente</span>
                    <span className="font-medium">{stats?.waitingTickets || 0}</span>
                  </div>
                  <Progress value={((stats?.waitingTickets || 0) / totalOpen) * 100} className="h-2 [&>div]:bg-orange-500" />
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">Aucun ticket ouvert</p>
            )}
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Repartition par categorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCategories ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : categoryDistribution.length > 0 ? (
              categoryDistribution.map(category => (
                <div key={category.id} className="space-y-2">
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
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Aucune categorie avec des tickets</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
