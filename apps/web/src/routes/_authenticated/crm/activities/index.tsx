import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@sedona/ui'
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  User,
  Building2,
  Check,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/crm/activities/')({
  component: ActivitiesPage,
})

// Mock data
const mockActivities = [
  {
    id: '1',
    type: 'task',
    subject: 'Preparer la proposition commerciale',
    description: 'Finaliser le devis pour le projet Alpha',
    contactName: 'Marie Dupont',
    companyName: 'Acme Corp',
    dueDate: '2025-01-30',
    completed: false,
    overdue: true,
  },
  {
    id: '2',
    type: 'call',
    subject: 'Appel de suivi',
    description: 'Discuter des termes du contrat',
    contactName: 'Jean Martin',
    companyName: 'Tech Solutions',
    dueDate: '2025-01-29',
    completed: false,
    overdue: false,
  },
  {
    id: '3',
    type: 'meeting',
    subject: 'Reunion de presentation',
    description: 'Presentation de la solution',
    contactName: 'Sophie Bernard',
    companyName: 'Design Studio',
    dueDate: '2025-01-31',
    completed: false,
    overdue: false,
  },
  {
    id: '4',
    type: 'email',
    subject: 'Envoi du contrat',
    description: 'Envoyer le contrat signe',
    contactName: 'Pierre Durand',
    companyName: 'Finance Plus',
    dueDate: '2025-01-28',
    completed: true,
    overdue: false,
  },
  {
    id: '5',
    type: 'note',
    subject: 'Note de reunion',
    description: 'Points cles de la reunion du 25/01',
    contactName: 'Claire Moreau',
    companyName: 'Marketing Pro',
    dueDate: null,
    completed: true,
    overdue: false,
  },
]

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

  const filteredActivities = mockActivities.filter((activity) => {
    if (typeFilter !== 'all' && activity.type !== typeFilter) return false
    if (!showCompleted && activity.completed) return false
    if (search && !activity.subject.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const overdueCount = mockActivities.filter(a => a.overdue && !a.completed).length
  const todayCount = mockActivities.filter(a => !a.completed && !a.overdue).length
  const completedCount = mockActivities.filter(a => a.completed).length

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
          <div className="divide-y">
            {filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${
                    activity.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.overdue && !activity.completed
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
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                      </div>
                      {!activity.completed && (
                        <Button variant="outline" size="sm">
                          Terminer
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.contactName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {activity.companyName}
                      </div>
                      {activity.dueDate && (
                        <div
                          className={`flex items-center gap-1 ${
                            activity.overdue && !activity.completed ? 'text-error' : ''
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {new Date(activity.dueDate).toLocaleDateString('fr-FR')}
                          {activity.overdue && !activity.completed && ' (en retard)'}
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
        </CardContent>
      </Card>
    </div>
  )
}
