// ===========================================
// CLIENT PORTAL - PROJECT DASHBOARD
// ===========================================

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Separator,
} from '@sedona/ui'

export const Route = createFileRoute('/client-portal/project/$projectId/')({
  component: ClientProjectDashboard,
})

// Mock data
const mockProject = {
  id: '1',
  name: 'Refonte Site Web Client A',
  description: 'Refonte complete du site web avec nouvelle charte graphique',
  lastUpdatedAt: '2024-02-10T14:30:00',
  totalTasks: 24,
  completedTasks: 16,
  progressPercentage: 66.7,
}

const mockPendingValidations = [
  {
    id: '1',
    title: 'Maquettes finales - Phase 1',
    description: 'Merci de valider les maquettes avant le 15/02',
    createdAt: '2024-02-08T10:00:00',
    taskCount: 3,
  },
]

const mockRecentActivity = [
  {
    id: '1',
    action: 'task_completed',
    title: 'Maquette page d\'accueil terminee',
    actor: 'Marie',
    createdAt: '2024-02-10T14:30:00',
  },
  {
    id: '2',
    action: 'comment_added',
    title: 'Nouveau commentaire de Marie',
    actor: 'Marie',
    createdAt: '2024-02-10T10:15:00',
  },
  {
    id: '3',
    action: 'task_completed',
    title: 'Wireframes valides',
    actor: 'Alice',
    createdAt: '2024-02-09T16:00:00',
  },
  {
    id: '4',
    action: 'file_uploaded',
    title: 'Nouveau fichier ajoute',
    actor: 'Bob',
    createdAt: '2024-02-08T09:00:00',
  },
]

const mockRecentTasks = [
  { id: '1', title: 'Design systeme de couleurs', status: 'done' },
  { id: '2', title: 'Maquette header/navigation', status: 'done' },
  { id: '3', title: 'Integration page d\'accueil', status: 'in_progress' },
  { id: '4', title: 'Developpement formulaire contact', status: 'todo' },
]

const mockQuestions = [
  {
    id: '1',
    subject: 'Peut-on ajouter une section temoignages?',
    status: 'answered',
    createdAt: '2024-02-05T14:00:00',
  },
  {
    id: '2',
    subject: 'Quelle est la date de livraison prevue?',
    status: 'open',
    createdAt: '2024-02-09T11:00:00',
  },
]

function ClientProjectDashboard() {
  const { projectId } = Route.useParams()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'A l\'instant'
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'file_uploaded':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{mockProject.name}</h1>
              <p className="text-sm text-muted-foreground">
                Derniere mise a jour: {formatDate(mockProject.lastUpdatedAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Deconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Avancement global</p>
                <p className="text-3xl font-bold">
                  {Math.round(mockProject.progressPercentage)}%
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {mockProject.completedTasks}/{mockProject.totalTasks} taches
                terminees
              </p>
            </div>
            <Progress value={mockProject.progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Pending Validations */}
        {mockPendingValidations.length > 0 && (
          <Card className="border-warning/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
                En attente de validation ({mockPendingValidations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPendingValidations.map((validation) => (
                  <div
                    key={validation.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-warning/5"
                  >
                    <div>
                      <p className="font-medium">{validation.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {validation.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Voir les details
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Approuver
                      </Button>
                      <Button variant="destructive" size="sm">
                        Demander modifs
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activite recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getActivityIcon(activity.action)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Taches recentes</CardTitle>
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    {getTaskStatusIcon(task.status)}
                    <span
                      className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Vos questions
              </CardTitle>
              <CardDescription>
                Posez vos questions a l'equipe projet
              </CardDescription>
            </div>
            <Button>
              Poser une question
            </Button>
          </CardHeader>
          <CardContent>
            {mockQuestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucune question pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {mockQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{question.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(question.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={question.status === 'answered' ? 'default' : 'secondary'}
                      className={question.status === 'answered' ? 'bg-green-600' : ''}
                    >
                      {question.status === 'answered' ? 'Repondu' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
