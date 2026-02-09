// ===========================================
// INTERVIEWS PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Textarea,
} from '@sedona/ui'
import {
  useInterviews,
  useUpcomingInterviews,
  useEmployees,
  useCreateInterview,
  useCompleteInterview,
  useEmployeesNeedingProfessionalInterview,
  createInterviewSchema,
} from '@sedona/hr'
import type { InterviewType, InterviewStatus, InterviewWithRelations } from '@sedona/hr'
import { useOrganization, useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/interviews/')({
  component: InterviewsPage,
})

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

// Schema for the form
const interviewFormSchema = z.object({
  employeeId: z.string().min(1, 'L\'employe est requis'),
  type: z.enum(['annual', 'professional', 'trial_end', 'other']),
  scheduledDate: z.string().min(1, 'La date est requise'),
  interviewerId: z.string().optional(),
  objectives: z.string().optional(),
})

type InterviewFormData = z.infer<typeof interviewFormSchema>

// Schema for completing an interview
const completeInterviewFormSchema = z.object({
  achievements: z.string().optional(),
  feedback: z.string().min(1, 'Le compte-rendu est requis'),
  developmentPlan: z.string().optional(),
})

type CompleteInterviewFormData = z.infer<typeof completeInterviewFormSchema>

function InterviewsPage() {
  const { organization } = useOrganization()
  const { user } = useAuth()
  const organizationId = organization?.id || ''
  const userId = user?.id || ''

  const [activeTab, setActiveTab] = useState('upcoming')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithRelations | null>(null)

  // Queries
  const {
    data: interviewsData,
    isLoading: isLoadingInterviews,
    error: interviewsError,
  } = useInterviews(organizationId, {
    status: activeTab === 'upcoming' ? 'scheduled' : 'completed',
  })

  const {
    data: upcomingData,
  } = useUpcomingInterviews(organizationId, 30)

  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
  } = useEmployees(organizationId)

  const {
    data: needingProfessionalData,
  } = useEmployeesNeedingProfessionalInterview(organizationId)

  // Mutations
  const createInterview = useCreateInterview(organizationId, userId)
  const completeInterview = useCompleteInterview()

  // Form for creating interview
  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      employeeId: '',
      type: 'annual',
      scheduledDate: '',
      interviewerId: '',
      objectives: '',
    },
  })

  // Form for completing interview
  const completeForm = useForm<CompleteInterviewFormData>({
    resolver: zodResolver(completeInterviewFormSchema),
    defaultValues: {
      achievements: '',
      feedback: '',
      developmentPlan: '',
    },
  })

  const interviews = interviewsData?.data || []
  const employees = employeesData?.data || []
  const upcomingInterviews = upcomingData || []
  const needingProfessional = needingProfessionalData || []

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

  // Filter interviews
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled')
  const completedInterviews = interviews.filter(i => i.status === 'completed')

  const filteredScheduled = typeFilter === 'all'
    ? scheduledInterviews
    : scheduledInterviews.filter(i => i.type === typeFilter)

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

  const handleCreateInterview = async (data: InterviewFormData) => {
    try {
      await createInterview.mutateAsync({
        employeeId: data.employeeId,
        type: data.type,
        scheduledDate: data.scheduledDate,
        interviewerId: data.interviewerId || null,
        objectives: data.objectives || null,
      })
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error('Erreur lors de la creation de l\'entretien:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  const handleOpenCompleteDialog = (interview: InterviewWithRelations) => {
    setSelectedInterview(interview)
    completeForm.reset({
      achievements: '',
      feedback: '',
      developmentPlan: '',
    })
    setIsCompleteDialogOpen(true)
  }

  const handleCompleteInterview = async (data: CompleteInterviewFormData) => {
    if (!selectedInterview) return

    try {
      await completeInterview.mutateAsync({
        id: selectedInterview.id,
        report: {
          achievements: data.achievements || undefined,
          feedback: data.feedback,
          developmentPlan: data.developmentPlan || undefined,
        },
      })
      setIsCompleteDialogOpen(false)
      setSelectedInterview(null)
      completeForm.reset()
    } catch (error) {
      console.error('Erreur lors de la completion de l\'entretien:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  if (isLoadingInterviews && !interviewsData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
        <Button onClick={() => setIsDialogOpen(true)}>
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
                <p className="text-2xl font-bold">{completedInterviews.length}</p>
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
                <p className="text-2xl font-bold text-orange-600">{needingProfessional.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for overdue professional interviews */}
      {needingProfessional.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Entretiens professionnels en retard</p>
                <p className="text-sm text-orange-700 mt-1">
                  {needingProfessional.length} employe{needingProfessional.length > 1 ? 's n\'ont' : ' n\'a'} pas eu d'entretien professionnel depuis plus de 2 ans.
                  L'entretien professionnel est obligatoire tous les 2 ans.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Voir les employes concernes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {interviewsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">Erreur lors du chargement des entretiens: {(interviewsError as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">
              A venir
              {scheduledInterviews.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {scheduledInterviews.length}
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
          {filteredScheduled.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Aucun entretien a venir
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredScheduled.map(interview => {
                const daysUntil = getDaysUntil(interview.scheduledDate)
                return (
                  <Card key={interview.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {interview.employee
                                ? getInitials(interview.employee.firstName, interview.employee.lastName)
                                : '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              {interview.employee ? (
                                <Link
                                  to="/hr/employees/$employeeId"
                                  params={{ employeeId: interview.employee.id }}
                                  className="font-medium hover:text-primary"
                                >
                                  {interview.employee.firstName} {interview.employee.lastName}
                                </Link>
                              ) : (
                                <span className="font-medium text-muted-foreground">Employe inconnu</span>
                              )}
                              <Badge className={interviewTypeConfig[interview.type].className}>
                                {interviewTypeConfig[interview.type].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {interview.employee?.jobTitle || 'Poste non defini'}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(interview.scheduledDate)} a {formatTime(interview.scheduledDate)}
                              </span>
                              {interview.interviewer && (
                                <span className="text-muted-foreground">
                                  Avec {interview.interviewer.firstName} {interview.interviewer.lastName}
                                </span>
                              )}
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
                            {daysUntil < 0 && 'Passe'}
                          </Badge>
                          <div className="mt-3 space-x-2">
                            <Button variant="outline" size="sm">
                              Reporter
                            </Button>
                            <Button size="sm" onClick={() => handleOpenCompleteDialog(interview)}>
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
                        {interview.employee
                          ? getInitials(interview.employee.firstName, interview.employee.lastName)
                          : '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {interview.employee ? (
                          <Link
                            to="/hr/employees/$employeeId"
                            params={{ employeeId: interview.employee.id }}
                            className="font-medium hover:text-primary"
                          >
                            {interview.employee.firstName} {interview.employee.lastName}
                          </Link>
                        ) : (
                          <span className="font-medium text-muted-foreground">Employe inconnu</span>
                        )}
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

      {/* Dialog for creating interview */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Planifier un entretien</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateInterview)} className="space-y-4">
            {/* Employee selection */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employe *</Label>
              <Select
                value={form.watch('employeeId')}
                onValueChange={(value) => form.setValue('employeeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner un employe" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.employeeId && (
                <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
              )}
            </div>

            {/* Interview type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type d'entretien *</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as InterviewType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Entretien annuel</SelectItem>
                  <SelectItem value="professional">Entretien professionnel</SelectItem>
                  <SelectItem value="trial_end">Fin de periode d'essai</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
            </div>

            {/* Date and time */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date et heure *</Label>
              <Input
                type="datetime-local"
                {...form.register('scheduledDate')}
              />
              {form.formState.errors.scheduledDate && (
                <p className="text-sm text-red-500">{form.formState.errors.scheduledDate.message}</p>
              )}
            </div>

            {/* Interviewer selection */}
            <div className="space-y-2">
              <Label htmlFor="interviewerId">Responsable de l'entretien</Label>
              <Select
                value={form.watch('interviewerId') || ''}
                onValueChange={(value) => form.setValue('interviewerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <Label htmlFor="objectives">Objectifs de l'entretien</Label>
              <Textarea
                placeholder="Decrivez les objectifs de cet entretien..."
                {...form.register('objectives')}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createInterview.isPending}
              >
                {createInterview.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Planifier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for completing interview */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Completer l'entretien</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedInterview.employee
                      ? getInitials(selectedInterview.employee.firstName, selectedInterview.employee.lastName)
                      : '??'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedInterview.employee
                      ? `${selectedInterview.employee.firstName} ${selectedInterview.employee.lastName}`
                      : 'Employe inconnu'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {interviewTypeConfig[selectedInterview.type].label} - {formatDate(selectedInterview.scheduledDate)}
                  </p>
                </div>
              </div>
              {selectedInterview.objectives && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Objectifs prevus :</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedInterview.objectives}</p>
                </div>
              )}
            </div>
          )}
          <form onSubmit={completeForm.handleSubmit(handleCompleteInterview)} className="space-y-4">
            {/* Achievements */}
            <div className="space-y-2">
              <Label htmlFor="achievements">Realisations et points abordes</Label>
              <Textarea
                placeholder="Decrivez les realisations de l'employe et les points abordes durant l'entretien..."
                {...completeForm.register('achievements')}
                rows={3}
              />
            </div>

            {/* Feedback / Report */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Compte-rendu de l'entretien *</Label>
              <Textarea
                placeholder="Redigez le compte-rendu de l'entretien. Ce texte sera visible par l'employe qui pourra le valider et ajouter ses commentaires..."
                {...completeForm.register('feedback')}
                rows={5}
              />
              {completeForm.formState.errors.feedback && (
                <p className="text-sm text-red-500">{completeForm.formState.errors.feedback.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                L'employe pourra consulter ce compte-rendu et ajouter ses commentaires pour validation.
              </p>
            </div>

            {/* Development plan */}
            <div className="space-y-2">
              <Label htmlFor="developmentPlan">Plan de developpement</Label>
              <Textarea
                placeholder="Objectifs et actions a mettre en place pour le developpement de l'employe..."
                {...completeForm.register('developmentPlan')}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCompleteDialogOpen(false)
                  setSelectedInterview(null)
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={completeInterview.isPending}
              >
                {completeInterview.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Terminer l'entretien
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
