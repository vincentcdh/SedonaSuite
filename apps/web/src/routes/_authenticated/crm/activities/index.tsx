import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardContent, Input } from '@sedona/ui'
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  User,
  Building2,
  Check,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useActivities, useOverdueTasks, useCompleteActivity } from '@sedona/crm'

export const Route = createFileRoute('/_authenticated/crm/activities/')({
  component: ActivitiesPage,
})

const activityTypes = [
  { value: 'all', label: 'Toutes', icon: FileText },
  { value: 'task', label: 'Taches', icon: CheckSquare },
  { value: 'call', label: 'Appels', icon: Phone },
  { value: 'meeting', label: 'Reunions', icon: Calendar },
  { value: 'email', label: 'Emails', icon: Mail },
  { value: 'note', label: 'Notes', icon: FileText },
]

function ActivitiesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)

  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch activities from Supabase
  const { data: activitiesData, isLoading, error } = useActivities(
    organizationId,
    {
      type: typeFilter !== 'all' ? typeFilter as any : undefined,
      search: search || undefined,
    },
    { page: 1, pageSize: 50 }
  )

  // Fetch overdue tasks
  const { data: overdueData } = useOverdueTasks(organizationId)

  // Complete activity mutation
  const completeActivityMutation = useCompleteActivity()

  const activities = activitiesData?.data || []
  const overdueActivities = overdueData || []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return CheckSquare
      case 'call':
        return Phone
      case 'meeting':
        return Calendar
      case 'email':
        return Mail
      default:
        return FileText
    }
  }

  const isOverdue = (activity: any) => {
    if (!activity.dueDate || activity.completed) return false
    return new Date(activity.dueDate) < new Date()
  }

  const filteredActivities = activities.filter((activity: any) => {
    if (!showCompleted && activity.completed) return false
    return true
  })

  const overdueCount = overdueActivities.length
  const todayCount = activities.filter((a: any) => !a.completed && !isOverdue(a)).length
  const completedCount = activities.filter((a: any) => a.completed).length

  const handleComplete = (activityId: string) => {
    completeActivityMutation.mutate(activityId)
  }

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des activites</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Activites</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerez vos taches, appels, reunions et notes
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle activite
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-error">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">En retard</p>
              </div>
              <div className="p-3 rounded-full bg-error/10 text-error">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{todayCount}</p>
                <p className="text-sm text-muted-foreground">A faire</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Terminees</p>
              </div>
              <div className="p-3 rounded-full bg-success/10 text-success">
                <Check className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une activite..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              {activityTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    variant={typeFilter === type.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTypeFilter(type.value)}
                    className="gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </Button>
                )
              })}
            </div>
            <Button
              variant={showCompleted ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Masquer terminees' : 'Afficher terminees'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {filteredActivities.map((activity: any) => {
                const Icon = getActivityIcon(activity.type)
                const activityIsOverdue = isOverdue(activity)
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      activity.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activityIsOverdue && !activity.completed
                          ? 'bg-error/10 text-error'
                          : activity.completed
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={`font-medium ${
                              activity.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {activity.subject}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        {!activity.completed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleComplete(activity.id)}
                            disabled={completeActivityMutation.isPending}
                          >
                            Terminer
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {activity.contact && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.contact.firstName} {activity.contact.lastName}
                          </div>
                        )}
                        {activity.company && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {activity.company.name}
                          </div>
                        )}
                        {activity.dueDate && (
                          <div
                            className={`flex items-center gap-1 ${
                              activityIsOverdue && !activity.completed ? 'text-error' : ''
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {new Date(activity.dueDate).toLocaleDateString('fr-FR')}
                            {activityIsOverdue && !activity.completed && ' (en retard)'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">Aucune activite trouvee</p>
                  <p className="text-sm text-muted-foreground">
                    Essayez de modifier vos filtres ou creez une nouvelle activite
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
