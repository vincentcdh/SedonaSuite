// ===========================================
// HR TIME TRACKING PAGE (PRO FEATURE - hr module)
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
  ModulePaidGuard,
} from '@sedona/ui'
import {
  useOrganizationTimeStats,
  useEmployees,
  useEmployeeByUserId,
  useCreateTimeEntry,
  useAllEmployeesBadgeStatus,
  useClockIn,
  useClockOut,
  type Badge as HrBadge,
} from '@sedona/hr'
import { useOrganization, useAuth } from '@/lib/auth'
import { useModuleAccess, useUpgradeModule } from '@/hooks/useModuleAccess'

export const Route = createFileRoute('/_authenticated/hr/time-tracking/')({
  component: HRTimeTrackingPage,
})

// ===========================================
// TIMELINE BAR COMPONENT
// ===========================================
// Shows worked periods (green) and gaps (gray) on a 24h timeline

interface TimelineBarProps {
  badges: HrBadge[]
  isClockedIn: boolean
}

function TimelineBar({ badges, isClockedIn }: TimelineBarProps) {
  // Working hours: 6h to 22h (16 hours displayed)
  const startHour = 6
  const endHour = 22
  const totalHours = endHour - startHour

  // Parse time string (HH:MM:SS or HH:MM) to minutes since midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number)
    return (parts[0] || 0) * 60 + (parts[1] || 0)
  }

  // Convert minutes since midnight to percentage position on timeline
  const minutesToPercent = (minutes: number): number => {
    const startMinutes = startHour * 60
    const endMinutes = endHour * 60
    const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes, minutes))
    return ((clampedMinutes - startMinutes) / (totalHours * 60)) * 100
  }

  // Build work periods from badges
  const workPeriods: { start: number; end: number }[] = []
  let clockInMinutes: number | null = null

  for (const badge of badges) {
    const badgeMinutes = parseTimeToMinutes(badge.badgeTime)

    if (badge.badgeType === 'clock_in') {
      clockInMinutes = badgeMinutes
    } else if (badge.badgeType === 'clock_out' && clockInMinutes !== null) {
      workPeriods.push({ start: clockInMinutes, end: badgeMinutes })
      clockInMinutes = null
    }
  }

  // If still clocked in, add period until now
  if (isClockedIn && clockInMinutes !== null) {
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    workPeriods.push({ start: clockInMinutes, end: nowMinutes })
  }

  // Generate hour markers
  const hourMarkers = []
  for (let h = startHour; h <= endHour; h += 2) {
    hourMarkers.push(h)
  }

  return (
    <div className="space-y-2">
      {/* Timeline bar */}
      <div className="relative h-6 bg-muted rounded-md overflow-hidden">
        {/* Work periods (green bars) */}
        {workPeriods.map((period, idx) => {
          const leftPercent = minutesToPercent(period.start)
          const rightPercent = minutesToPercent(period.end)
          const widthPercent = rightPercent - leftPercent

          return (
            <div
              key={idx}
              className={cn(
                "absolute top-0 h-full rounded-sm",
                isClockedIn && idx === workPeriods.length - 1
                  ? "bg-green-500 animate-pulse"
                  : "bg-green-500"
              )}
              style={{
                left: `${leftPercent}%`,
                width: `${Math.max(widthPercent, 0.5)}%`,
              }}
              title={`${Math.floor(period.start / 60)}:${String(period.start % 60).padStart(2, '0')} - ${Math.floor(period.end / 60)}:${String(period.end % 60).padStart(2, '0')}`}
            />
          )
        })}

        {/* Current time indicator (red line) */}
        {(() => {
          const now = new Date()
          const nowMinutes = now.getHours() * 60 + now.getMinutes()
          const nowPercent = minutesToPercent(nowMinutes)
          if (nowPercent > 0 && nowPercent < 100) {
            return (
              <div
                className="absolute top-0 h-full w-0.5 bg-red-500 z-10"
                style={{ left: `${nowPercent}%` }}
                title={`Maintenant: ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`}
              />
            )
          }
          return null
        })()}
      </div>

      {/* Hour labels */}
      <div className="relative h-4">
        {hourMarkers.map((hour) => {
          const percent = ((hour - startHour) / totalHours) * 100
          return (
            <span
              key={hour}
              className="absolute text-[10px] text-muted-foreground transform -translate-x-1/2"
              style={{ left: `${percent}%` }}
            >
              {hour}h
            </span>
          )
        })}
      </div>

      {/* Badge list below timeline */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {badges.map((badge) => (
            <Badge
              key={badge.id}
              variant={badge.badgeType === 'clock_in' ? 'default' : 'secondary'}
              className="gap-1 text-[10px] px-1.5 py-0"
            >
              {badge.badgeType === 'clock_in' ? (
                <LogIn className="h-2.5 w-2.5" />
              ) : (
                <LogOut className="h-2.5 w-2.5" />
              )}
              {badge.badgeTime.substring(0, 5)}
            </Badge>
          ))}
          {isClockedIn && (
            <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 animate-pulse border-green-500 text-green-600">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              En cours
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

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
  const { isPaid, isLoading: isLoadingAccess } = useModuleAccess('hr')
  const { upgrade } = useUpgradeModule()

  const handleUpgrade = async () => {
    await upgrade('hr', 'monthly')
  }

  return (
    <ModulePaidGuard
      moduleId="hr"
      isPaid={isPaid}
      isLoading={isLoadingAccess}
      title="Temps de travail"
      description="Le suivi du temps de travail vous permet de gerer les heures de vos employes, les heures supplementaires et d'exporter des rapports detailles."
      onUpgrade={handleUpgrade}
    >
      <HRTimeTrackingContent />
    </ModulePaidGuard>
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
    const isClockIn = !status?.isClockedIn

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
  const isCurrentUserClocked = currentUserBadgeStatus?.isClockedIn || false

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
  const activeCount = (badgeStatuses || []).filter(s => s.isClockedIn).length

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
                const isClockedIn = badgeStatus?.isClockedIn || false
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
                          {isClockedIn && (
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
                          variant={isClockedIn ? 'destructive' : 'default'}
                          onClick={() => handleBadge(employee.id, !isClockedIn)}
                          disabled={clockInMutation.isPending || clockOutMutation.isPending}
                          className="gap-1"
                        >
                          {(clockInMutation.isPending || clockOutMutation.isPending) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isClockedIn ? (
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

                    {/* Visual Timeline - shows worked periods */}
                    <TimelineBar badges={badges} isClockedIn={isClockedIn} />
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
