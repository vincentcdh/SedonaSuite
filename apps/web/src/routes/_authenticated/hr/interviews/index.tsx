// ===========================================
// INTERVIEWS PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Plus,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@sedona/ui'
import type { InterviewType, InterviewStatus } from '@sedona/hr'

export const Route = createFileRoute('/_authenticated/hr/interviews/')({
  component: InterviewsPage,
})

// Mock interviews
const mockInterviews = [
  {
    id: '1',
    employee: { id: '1', firstName: 'Alice', lastName: 'Martin', photoUrl: null, jobTitle: 'Developpeur Senior' },
    type: 'annual' as InterviewType,
    scheduledDate: '2024-03-15T14:00:00Z',
    status: 'scheduled' as InterviewStatus,
    interviewer: { id: '3', firstName: 'Pierre', lastName: 'Durand' },
  },
  {
    id: '2',
    employee: { id: '2', firstName: 'Bob', lastName: 'Dupont', photoUrl: null, jobTitle: 'Designer UI/UX' },
    type: 'trial_end' as InterviewType,
    scheduledDate: '2024-02-28T10:00:00Z',
    status: 'scheduled' as InterviewStatus,
    interviewer: { id: '3', firstName: 'Pierre', lastName: 'Durand' },
  },
  {
    id: '3',
    employee: { id: '1', firstName: 'Alice', lastName: 'Martin', photoUrl: null, jobTitle: 'Developpeur Senior' },
    type: 'professional' as InterviewType,
    scheduledDate: '2023-01-20T10:00:00Z',
    status: 'completed' as InterviewStatus,
    interviewer: { id: '3', firstName: 'Pierre', lastName: 'Durand' },
    completedDate: '2023-01-20T11:30:00Z',
  },
  {
    id: '4',
    employee: { id: '4', firstName: 'Marie', lastName: 'Bernard', photoUrl: null, jobTitle: 'Stagiaire RH' },
    type: 'annual' as InterviewType,
    scheduledDate: '2024-02-10T09:00:00Z',
    status: 'completed' as InterviewStatus,
    interviewer: { id: '3', firstName: 'Pierre', lastName: 'Durand' },
    completedDate: '2024-02-10T10:00:00Z',
  },
]

const interviewTypeConfig: Record<InterviewType, { label: string; className: string }> = {
  annual: { label: 'Entretien annuel', className: 'bg-blue-100 text-blue-700' },
  professional: { label: 'Entretien professionnel', className: 'bg-purple-100 text-purple-700' },
  trial_end: { label: 'Fin de periode d\'essai', className: 'bg-orange-100 text-orange-700' },
  other: { label: 'Autre', className: 'bg-gray-100 text-gray-700' },
}

const statusConfig: Record<InterviewStatus, { label: string; className: string; icon: typeof Clock }> = {
  scheduled: { label: 'Planifie', className: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: 'Termine', className: 'bg-green-100 text-green-700', icon: Check },
  canceled: { label: 'Annule', className: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

function InterviewsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const upcomingInterviews = mockInterviews.filter(i => i.status === 'scheduled')
  const completedInterviews = mockInterviews.filter(i => i.status === 'completed')

  const filteredUpcoming = typeFilter === 'all'
    ? upcomingInterviews
    : upcomingInterviews.filter(i => i.type === typeFilter)

  const filteredCompleted = typeFilter === 'all'
    ? completedInterviews
    : completedInterviews.filter(i => i.type === typeFilter)

  // Calculate days until interview
  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entretiens</h1>
          <p className="text-muted-foreground">
            Planifiez et suivez les entretiens de votre equipe
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Planifier un entretien
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A venir</p>
                <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Realises ce mois</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entretiens pro en retard</p>
                <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for overdue professional interviews */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Entretiens professionnels en retard</p>
              <p className="text-sm text-orange-700 mt-1">
                1 employe n'a pas eu d'entretien professionnel depuis plus de 2 ans.
                L'entretien professionnel est obligatoire tous les 2 ans.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Voir les employes concernes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">
              A venir
              {upcomingInterviews.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {upcomingInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Realises</TabsTrigger>
          </TabsList>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Type d'entretien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="annual">Entretien annuel</SelectItem>
              <SelectItem value="professional">Entretien professionnel</SelectItem>
              <SelectItem value="trial_end">Fin de periode d'essai</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="upcoming" className="mt-6">
          {filteredUpcoming.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Aucun entretien a venir
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUpcoming.map(interview => {
                const daysUntil = getDaysUntil(interview.scheduledDate)
                return (
                  <Card key={interview.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {getInitials(interview.employee.firstName, interview.employee.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                to="/hr/employees/$employeeId"
                                params={{ employeeId: interview.employee.id }}
                                className="font-medium hover:text-primary"
                              >
                                {interview.employee.firstName} {interview.employee.lastName}
                              </Link>
                              <Badge className={interviewTypeConfig[interview.type].className}>
                                {interviewTypeConfig[interview.type].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {interview.employee.jobTitle}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(interview.scheduledDate)} a {formatTime(interview.scheduledDate)}
                              </span>
                              <span className="text-muted-foreground">
                                Avec {interview.interviewer.firstName} {interview.interviewer.lastName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={daysUntil <= 7 ? 'default' : 'secondary'}
                            className={cn(daysUntil <= 3 && 'bg-orange-500')}
                          >
                            {daysUntil === 0 && "Aujourd'hui"}
                            {daysUntil === 1 && 'Demain'}
                            {daysUntil > 1 && `Dans ${daysUntil} jours`}
                          </Badge>
                          <div className="mt-3 space-x-2">
                            <Button variant="outline" size="sm">
                              Reporter
                            </Button>
                            <Button size="sm">
                              Completer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <div className="divide-y">
              {filteredCompleted.map(interview => (
                <div key={interview.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(interview.employee.firstName, interview.employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/hr/employees/$employeeId"
                          params={{ employeeId: interview.employee.id }}
                          className="font-medium hover:text-primary"
                        >
                          {interview.employee.firstName} {interview.employee.lastName}
                        </Link>
                        <Badge className={interviewTypeConfig[interview.type].className}>
                          {interviewTypeConfig[interview.type].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(interview.scheduledDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusConfig[interview.status].className}>
                      <Check className="h-3 w-3 mr-1" />
                      {statusConfig[interview.status].label}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Voir le compte-rendu
                    </Button>
                  </div>
                </div>
              ))}

              {filteredCompleted.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Aucun entretien realise
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
