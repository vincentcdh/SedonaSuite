// ===========================================
// DASHBOARDS LIST PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BarChart3,
  Plus,
  MoreHorizontal,
  Star,
  Copy,
  Trash2,
  Users,
  Lock,
  Search,
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
  Input,
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
} from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import { useModuleLimit, useIsModulePaid } from '@sedona/billing'

export const Route = createFileRoute('/_authenticated/analytics/dashboards')({
  component: DashboardsPage,
})

// Mock dashboards
const mockDashboards = [
  {
    id: '1',
    name: 'Vue d\'ensemble',
    description: 'KPIs principaux de l\'entreprise',
    isDefault: true,
    isShared: false,
    widgetCount: 6,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
  },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function DashboardsPage() {
  const [search, setSearch] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Module-based billing: check if analytics is paid and get limits
  const { isPaid: isAnalyticsPaid } = useIsModulePaid(organizationId, 'analytics')
  const { limit, usage: currentCount, isUnlimited } = useModuleLimit(organizationId, 'analytics', 'dashboards')

  const isFree = !isAnalyticsPaid
  const canCreateMore = isUnlimited || mockDashboards.length < limit

  // Usage tracking (only for free tier)
  const usagePercent = isUnlimited ? 0 : (currentCount / limit) * 100
  const isNearLimit = !isUnlimited && usagePercent >= 80
  const isAtLimit = !isUnlimited && currentCount >= limit

  const filteredDashboards = mockDashboards.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Mes dashboards
          </h1>
          <p className="text-muted-foreground mt-1">
            Creez et gerez vos tableaux de bord personnalises
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={!canCreateMore}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau dashboard
        </Button>
      </div>

      {/* Limits info - only for FREE plan */}
      {isFree && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : ''}`}>
                {currentCount}/{limit} dashboard{limit > 1 ? 's' : ''}
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
              className={`h-1.5 w-32 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
            />
          </div>
          <Link to="/settings/modules" className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto">
            <Sparkles className="h-3 w-3" />
            Illimite en PRO
          </Link>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un dashboard..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Dashboards grid */}
      {filteredDashboards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Aucun dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">
              Creez votre premier tableau de bord pour visualiser vos donnees.
            </p>
            <Button
              className="mt-4"
              onClick={() => setShowCreateDialog(true)}
              disabled={!canCreateMore}
            >
              <Plus className="h-4 w-4 mr-2" />
              Creer un dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDashboards.map((dashboard) => (
            <Card key={dashboard.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2">
                      <Link
                        to="/analytics/dashboard/$dashboardId"
                        params={{ dashboardId: dashboard.id }}
                        className="hover:text-primary truncate"
                      >
                        {dashboard.name}
                      </Link>
                      {dashboard.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {dashboard.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Definir par defaut
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        {dashboard.isShared ? 'Rendre prive' : 'Partager'}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!canCreateMore}>
                        <Copy className="h-4 w-4 mr-2" />
                        Dupliquer
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
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{dashboard.widgetCount} widgets</span>
                  <span>Modifie le {formatDate(dashboard.updatedAt)}</span>
                </div>
                {dashboard.isShared && (
                  <Badge variant="secondary" className="mt-2">
                    <Users className="h-3 w-3 mr-1" />
                    Partage
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add new card */}
          {canCreateMore && (
            <Card
              className="border-dashed hover:border-primary transition-colors cursor-pointer"
              onClick={() => setShowCreateDialog(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground hover:text-primary">
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Nouveau dashboard</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dashboard</DialogTitle>
            <DialogDescription>
              Creez un nouveau tableau de bord pour visualiser vos donnees.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du dashboard</Label>
              <Input
                id="name"
                placeholder="Ex: KPIs commerciaux"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                // Create dashboard logic
                setShowCreateDialog(false)
                setNewDashboardName('')
              }}
              disabled={!newDashboardName.trim()}
            >
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
