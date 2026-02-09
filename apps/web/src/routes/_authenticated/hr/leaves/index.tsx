// ===========================================
// LEAVES MANAGEMENT PAGE
// ===========================================

import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getSupabaseClient } from '@sedona/database'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Calendar,
  Clock,
  Check,
  X,
  CalendarDays,
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
  useLeaveRequests,
  useLeaveTypes,
  useEmployees,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  createLeaveRequestSchema,
} from '@sedona/hr'
import type { LeaveStatus } from '@sedona/hr'
import { useOrganization, useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/leaves/')({
  component: LeavesPage,
})

const statusConfig: Record<LeaveStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approuve', className: 'bg-green-100 text-green-700', icon: Check },
  rejected: { label: 'Refuse', className: 'bg-red-100 text-red-700', icon: X },
  canceled: { label: 'Annule', className: 'bg-gray-100 text-gray-700', icon: X },
}

function LeavesPage() {
  const { organization } = useOrganization()
  const { user } = useAuth()
  const organizationId = organization?.id || ''
  const userId = user?.id || ''

  const [activeTab, setActiveTab] = useState('pending')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Queries - séparées pour éviter qu'une erreur bloque les autres
  const {
    data: leaveRequestsData,
    isLoading: isLoadingRequests,
    error: leaveRequestsError
  } = useLeaveRequests(organizationId)

  const {
    data: leaveTypesData,
    isLoading: isLoadingTypes,
    error: leaveTypesError
  } = useLeaveTypes(organizationId)

  const {
    data: employeesData,
    error: employeesError
  } = useEmployees(organizationId)

  // Mutations
  const createLeaveRequest = useCreateLeaveRequest(organizationId, userId)
  const approveLeaveRequest = useApproveLeaveRequest(userId)
  const rejectLeaveRequest = useRejectLeaveRequest(userId)

  const leaveRequests = leaveRequestsData?.data || []
  const leaveTypes = leaveTypesData || []
  const employees = employeesData?.data || []

  // Debug log - à supprimer après
  console.log('DEBUG leaves:', {
    organizationId,
    leaveTypes,
    leaveTypesData,
    leaveTypesError: leaveTypesError?.message,
    isLoadingTypes,
    employees,
    employeesError: employeesError?.message,
    leaveRequestsError: leaveRequestsError?.message,
  })

  // Test direct Supabase - à supprimer après
  useEffect(() => {
    if (organizationId) {
      getSupabaseClient()
        .from('hr_leave_types')
        .select('*')
        .eq('organization_id', organizationId)
        .then(({ data, error }) => {
          console.log('DIRECT SUPABASE TEST hr_leave_types:', { data, error, organizationId })
        })
    }
  }, [organizationId])

  // Form
  const form = useForm<z.infer<typeof createLeaveRequestSchema>>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      employeeId: '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      startHalfDay: false,
      endHalfDay: false,
      reason: '',
    },
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending')
  const allRequests = statusFilter === 'all'
    ? leaveRequests
    : leaveRequests.filter(r => r.status === statusFilter)

  const handleCreateRequest = async (data: z.infer<typeof createLeaveRequestSchema>) => {
    console.log('handleCreateRequest called with:', data)
    try {
      const result = await createLeaveRequest.mutateAsync(data)
      console.log('Leave request created:', result)
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error('Erreur lors de la creation de la demande:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  // Debug form errors
  const onFormError = (errors: any) => {
    console.log('Form validation errors:', errors)
  }

  const handleApprove = async (id: string) => {
    try {
      await approveLeaveRequest.mutateAsync({ id })
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectLeaveRequest.mutateAsync({ id, rejectionReason: '' })
    } catch (error) {
      console.error('Erreur lors du refus:', error)
    }
  }

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conges et absences</h1>
          <p className="text-muted-foreground">
            Gerez les demandes de conges de votre equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendrier
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvees ce mois</p>
                <p className="text-2xl font-bold">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </p>
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
                <p className="text-sm text-muted-foreground">Jours poses ce mois</p>
                <p className="text-2xl font-bold">
                  {leaveRequests
                    .filter(r => r.status === 'approved')
                    .reduce((acc, r) => acc + (r.daysCount || 0), 0)}
                </p>
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
                <p className="text-sm text-muted-foreground">Total demandes</p>
                <p className="text-2xl font-bold">{leaveRequests.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">
              En attente
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Toutes les demandes</TabsTrigger>
          </TabsList>

          {activeTab === 'all' && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuve</SelectItem>
                <SelectItem value="rejected">Refuse</SelectItem>
                <SelectItem value="canceled">Annule</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Aucune demande en attente
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {request.employee
                              ? getInitials(request.employee.firstName, request.employee.lastName)
                              : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            {request.employee ? (
                              <Link
                                to="/hr/employees/$employeeId"
                                params={{ employeeId: request.employee.id }}
                                className="font-medium hover:text-primary"
                              >
                                {request.employee.firstName} {request.employee.lastName}
                              </Link>
                            ) : (
                              <span className="font-medium">Employe inconnu</span>
                            )}
                            {request.leaveType && (
                              <Badge
                                style={{
                                  backgroundColor: `${request.leaveType.color}20`,
                                  color: request.leaveType.color,
                                }}
                              >
                                {request.leaveType.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Du {formatDate(request.startDate)} au {formatDate(request.endDate)}
                            <span className="mx-2">-</span>
                            <span className="font-medium">{request.daysCount} jour{request.daysCount > 1 ? 's' : ''}</span>
                          </p>
                          {request.reason && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Motif : {request.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={rejectLeaveRequest.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={approveLeaveRequest.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <div className="divide-y">
              {allRequests.map(request => {
                const StatusIcon = statusConfig[request.status].icon
                return (
                  <div key={request.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {request.employee
                            ? getInitials(request.employee.firstName, request.employee.lastName)
                            : '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          {request.employee ? (
                            <Link
                              to="/hr/employees/$employeeId"
                              params={{ employeeId: request.employee.id }}
                              className="font-medium hover:text-primary"
                            >
                              {request.employee.firstName} {request.employee.lastName}
                            </Link>
                          ) : (
                            <span className="font-medium">Employe inconnu</span>
                          )}
                          {request.leaveType && (
                            <Badge
                              style={{
                                backgroundColor: `${request.leaveType.color}20`,
                                color: request.leaveType.color,
                              }}
                            >
                              {request.leaveType.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          <span className="mx-2">({request.daysCount}j)</span>
                        </p>
                      </div>
                    </div>
                    <Badge className={cn('gap-1', statusConfig[request.status].className)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[request.status].label}
                    </Badge>
                  </div>
                )
              })}

              {allRequests.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Aucune demande trouvee
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for new leave request */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de conges</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateRequest, onFormError)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employe</Label>
              <Select
                value={form.watch('employeeId')}
                onValueChange={(value) => form.setValue('employeeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez un employe" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.employeeId && (
                <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaveTypeId">Type de conge ({leaveTypes.length} types disponibles)</Label>
              <Select
                value={form.watch('leaveTypeId')}
                onValueChange={(value) => form.setValue('leaveTypeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.length === 0 ? (
                    <SelectItem value="_empty" disabled>Aucun type disponible</SelectItem>
                  ) : (
                    leaveTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.leaveTypeId && (
                <p className="text-sm text-destructive">{form.formState.errors.leaveTypeId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de debut</Label>
                <Input
                  type="date"
                  {...form.register('startDate')}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  type="date"
                  {...form.register('endDate')}
                />
                {form.formState.errors.endDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motif (optionnel)</Label>
              <Textarea
                placeholder="Raison de la demande..."
                {...form.register('reason')}
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
              <Button type="submit" disabled={createLeaveRequest.isPending}>
                {createLeaveRequest.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Creer la demande
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
