// ===========================================
// HR TIME TRACKING PAGE (PRO FEATURE)
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Clock,
  Plus,
  Play,
  Square,
  Calendar,
  BarChart3,
  Timer,
  Coffee,
  FileSpreadsheet,
  TrendingUp,
  Loader2,
  LogIn,
  LogOut,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Avatar,
  AvatarFallback,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'
import {
  useOrganizationTimeStats,
  useEmployees,
  useEmployeeByUserId,
  useCreateTimeEntry,
  useAllEmployeesBadgeStatus,
  useClockIn,
  useClockOut,
} from '@sedona/hr'
import { useOrganization, useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/time-tracking/')({
  component: HRTimeTrackingPage,
})

// PRO features to display in upgrade card
const hrTimeFeatures = [
  { icon: Timer, label: 'Pointage en temps reel' },
  { icon: Calendar, label: 'Historique complet' },
  { icon: TrendingUp, label: 'Suivi des heures sup.' },
  { icon: FileSpreadsheet, label: 'Export Excel/PDF' },
  { icon: BarChart3, label: 'Rapports et statistiques' },
]

// Schema for time entry form
const timeEntryFormSchema = z.object({
  employeeId: z.string().min(1, 'L\'employe est requis'),
  date: z.string().min(1, 'La date est requise'),
  startTime: z.string().min(1, 'L\'heure de debut est requise'),
  endTime: z.string().min(1, 'L\'heure de fin est requise'),
  breakDurationMinutes: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
})

type TimeEntryFormData = z.infer<typeof timeEntryFormSchema>

function HRTimeTrackingPage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Temps de travail"
      description="Le suivi du temps de travail vous permet de gerer les heures de vos employes, les heures supplementaires et d'exporter des rapports detailles."
      features={hrTimeFeatures}
    >
      <HRTimeTrackingContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL HR TIME TRACKING CONTENT
// ===========================================

function HRTimeTrackingContent() {
  const { organization } = useOrganization()
  const { user } = useAuth()
  const organizationId = organization?.id || ''
  const today = new Date().toISOString().split('T')[0]

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Queries
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useOrganizationTimeStats(organizationId)

  const {
    data: badgeStatuses,
    isLoading: isLoadingBadges,
  } = useAllEmployeesBadgeStatus(organizationId, today)

  const {
    data: employeesData,
  } = useEmployees(organizationId)

  // Get current user's employee record
  const {
    data: currentUserEmployee,
  } = useEmployeeByUserId(user?.id || '')

  // Mutations
  const createTimeEntry = useCreateTimeEntry(organizationId)
  const clockInMutation = useClockIn(organizationId)
  const clockOutMutation = useClockOut(organizationId)

  // Form
  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      employeeId: '',
      date: today,
      startTime: '09:00',
      endTime: '18:00',
      breakDurationMinutes: 60,
      notes: '',
    },
  })

  const employees = employeesData?.data || []
  const badgeStatusMap = new Map(
    (badgeStatuses || []).map(s => [s.employeeId, s])
  )

  const calculateHoursWorked = (startTime: string, endTime: string, breakMinutes: number): number => {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM) - breakMinutes
    return Math.max(0, totalMinutes / 60)
  }

  const formatMinutesToDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? String(mins).padStart(2, '0') : ''}`
  }

  const handleCreateTimeEntry = async (data: TimeEntryFormData) => {
    try {
      const hoursWorked = calculateHoursWorked(data.startTime, data.endTime, data.breakDurationMinutes)
      const overtimeHours = Math.max(0, hoursWorked - 7)

      await createTimeEntry.mutateAsync({
        employeeId: data.employeeId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDurationMinutes: data.breakDurationMinutes,
        hoursWorked,
        overtimeHours,
        notes: data.notes || null,
      })
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error('Erreur lors de la creation de l\'entree:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  const handleBadge = async (employeeId: string, isClockIn: boolean) => {
    try {
      if (isClockIn) {
        await clockInMutation.mutateAsync({ employeeId })
      } else {
        await clockOutMutation.mutateAsync({ employeeId })
      }
    } catch (error) {
      console.error('Erreur lors du badgeage:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  // Badge the current logged-in user
  const handleCurrentUserBadge = async () => {
    if (!currentUserEmployee) return

    const status = badgeStatusMap.get(currentUserEmployee.id)
    const isClockIn = !status?.isClocked

    try {
      if (isClockIn) {
        await clockInMutation.mutateAsync({ employeeId: currentUserEmployee.id })
      } else {
        await clockOutMutation.mutateAsync({ employeeId: currentUserEmployee.id })
      }
    } catch (error) {
      console.error('Erreur lors du badgeage:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  // Get current user's badge status
  const currentUserBadgeStatus = currentUserEmployee
    ? badgeStatusMap.get(currentUserEmployee.id)
    : null
  const isCurrentUserClocked = currentUserBadgeStatus?.isClocked || false

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const isLoading = isLoadingStats || isLoadingBadges

  if (isLoading && !stats && !badgeStatuses) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const displayStats = stats || {
    totalHoursToday: 0,
    totalHoursWeek: 0,
    averagePerDay: 0,
    overtimeHours: 0,
  }

  // Count active employees (clocked in)
  const activeCount = (badgeStatuses || []).filter(s => s.isClocked).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Temps de travail
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez le temps de travail de vos employes en temps reel
          </p>
        </div>
        <div className="flex gap-2">
          {currentUserEmployee ? (
            <Button
              variant={isCurrentUserClocked ? 'destructive' : 'default'}
              onClick={handleCurrentUserBadge}
              disabled={clockInMutation.isPending || clockOutMutation.isPending}
            >
              {(clockInMutation.isPending || clockOutMutation.isPending) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isCurrentUserClocked ? (
                <LogOut className="h-4 w-4 mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {isCurrentUserClocked ? 'Badger sortie' : 'Badger entree'}
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <LogIn className="h-4 w-4 mr-2" />
              Badger (aucun profil employe)
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter manuellement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayStats.totalHoursToday}h</p>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayStats.totalHoursWeek}h</p>
                <p className="text-sm text-muted-foreground">Cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayStats.averagePerDay}h</p>
                <p className="text-sm text-muted-foreground">Moyenne/jour</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{displayStats.overtimeHours}h</p>
                <p className="text-sm text-muted-foreground">Heures sup.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Time with Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activite en cours</CardTitle>
              <CardDescription>Statut en temps reel de vos employes</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {activeCount} actif{activeCount > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun employe actif. Ajoutez des employes pour suivre leur temps de travail.
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => {
                const badgeStatus = badgeStatusMap.get(employee.id)
                const isClocked = badgeStatus?.isClocked || false
                const totalMinutes = badgeStatus?.totalWorkedMinutes || 0
                const badges = badgeStatus?.todayBadges || []

                // Calculate progress (based on 8h workday)
                const progressPercent = Math.min((totalMinutes / 480) * 100, 100)

                return (
                  <div key={employee.id} className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback>{getInitials(employee.firstName, employee.lastName)}</AvatarFallback>
                          </Avatar>
                          {isClocked && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                              <Play className="h-2 w-2 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to="/hr/employees/$employeeId"
                            params={{ employeeId: employee.id }}
                            className="font-medium hover:text-primary"
                          >
                            {employee.firstName} {employee.lastName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {employee.jobTitle || 'Poste non defini'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-lg">{formatMinutesToDisplay(totalMinutes)}</p>
                          <p className="text-xs text-muted-foreground">aujourd'hui</p>
                        </div>
                        <Button
                          size="sm"
                          variant={isClocked ? 'destructive' : 'default'}
                          onClick={() => handleBadge(employee.id, !isClocked)}
                          disabled={clockInMutation.isPending || clockOutMutation.isPending}
                          className="gap-1"
                        >
                          {(clockInMutation.isPending || clockOutMutation.isPending) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isClocked ? (
                            <>
                              <Square className="h-3 w-3 fill-current" />
                              Sortie
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 fill-current" />
                              Entree
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isClocked ? "bg-green-500" : "bg-blue-500"
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0h</span>
                        <span>8h</span>
                      </div>
                    </div>

                    {/* Timeline of badges */}
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {badges.map((badge, idx) => (
                          <Badge
                            key={badge.id}
                            variant={badge.type === 'in' ? 'default' : 'secondary'}
                            className="gap-1 text-xs"
                          >
                            {badge.type === 'in' ? (
                              <LogIn className="h-3 w-3" />
                            ) : (
                              <LogOut className="h-3 w-3" />
                            )}
                            {badge.badgeTime}
                          </Badge>
                        ))}
                        {isClocked && (
                          <Badge variant="outline" className="gap-1 text-xs animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            En cours...
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding time entry */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une entree de temps</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateTimeEntry)} className="space-y-4">
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

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            {/* Start and End time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Heure de debut *</Label>
                <Input
                  type="time"
                  {...form.register('startTime')}
                />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin *</Label>
                <Input
                  type="time"
                  {...form.register('endTime')}
                />
                {form.formState.errors.endTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            {/* Break duration */}
            <div className="space-y-2">
              <Label htmlFor="breakDurationMinutes">Pause (minutes)</Label>
              <Input
                type="number"
                min="0"
                {...form.register('breakDurationMinutes')}
              />
            </div>

            {/* Calculated hours preview */}
            {form.watch('startTime') && form.watch('endTime') && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">Heures travaillees: </span>
                  <span className="font-medium">
                    {calculateHoursWorked(
                      form.watch('startTime'),
                      form.watch('endTime'),
                      form.watch('breakDurationMinutes') || 0
                    ).toFixed(1)}h
                  </span>
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                placeholder="Description des taches effectuees..."
                {...form.register('notes')}
                rows={2}
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
                disabled={createTimeEntry.isPending}
              >
                {createTimeEntry.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
