// ===========================================
// LEAVES MANAGEMENT PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Plus,
  Calendar,
  Clock,
  Check,
  X,
  Filter,
  CalendarDays,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import type { LeaveStatus } from '@sedona/hr'

export const Route = createFileRoute('/_authenticated/hr/leaves/')({
  component: LeavesPage,
})

// Mock leave requests
const mockLeaveRequests = [
  {
    id: '1',
    employee: { id: '1', firstName: 'Alice', lastName: 'Martin', photoUrl: null },
    leaveType: { id: '1', name: 'Conges payes', code: 'cp', color: '#10b981' },
    startDate: '2024-03-01',
    endDate: '2024-03-08',
    daysCount: 6,
    status: 'pending' as LeaveStatus,
    reason: 'Vacances en famille',
    createdAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '2',
    employee: { id: '2', firstName: 'Bob', lastName: 'Dupont', photoUrl: null },
    leaveType: { id: '2', name: 'RTT', code: 'rtt', color: '#3b82f6' },
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    daysCount: 1,
    status: 'approved' as LeaveStatus,
    reason: 'RDV medical',
    createdAt: '2024-02-10T14:00:00Z',
    approvedAt: '2024-02-11T09:00:00Z',
  },
  {
    id: '3',
    employee: { id: '3', firstName: 'Marie', lastName: 'Bernard', photoUrl: null },
    leaveType: { id: '3', name: 'Maladie', code: 'sick', color: '#f59e0b' },
    startDate: '2024-02-18',
    endDate: '2024-02-19',
    daysCount: 2,
    status: 'approved' as LeaveStatus,
    reason: 'Grippe',
    createdAt: '2024-02-18T08:00:00Z',
    approvedAt: '2024-02-18T08:30:00Z',
  },
  {
    id: '4',
    employee: { id: '1', firstName: 'Alice', lastName: 'Martin', photoUrl: null },
    leaveType: { id: '1', name: 'Conges payes', code: 'cp', color: '#10b981' },
    startDate: '2024-01-15',
    endDate: '2024-01-19',
    daysCount: 5,
    status: 'rejected' as LeaveStatus,
    reason: 'Voyage',
    rejectionReason: 'Periode de forte activite',
    createdAt: '2024-01-10T10:00:00Z',
  },
]

const statusConfig: Record<LeaveStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approuve', className: 'bg-green-100 text-green-700', icon: Check },
  rejected: { label: 'Refuse', className: 'bg-red-100 text-red-700', icon: X },
  canceled: { label: 'Annule', className: 'bg-gray-100 text-gray-700', icon: X },
}

function LeavesPage() {
  const [activeTab, setActiveTab] = useState('pending')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  const pendingRequests = mockLeaveRequests.filter(r => r.status === 'pending')
  const allRequests = statusFilter === 'all'
    ? mockLeaveRequests
    : mockLeaveRequests.filter(r => r.status === statusFilter)

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
          <Button>
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
                <p className="text-2xl font-bold">12</p>
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
                <p className="text-2xl font-bold">28</p>
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
                <p className="text-sm text-muted-foreground">Absents aujourd'hui</p>
                <p className="text-2xl font-bold">2</p>
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
                            {getInitials(request.employee.firstName, request.employee.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to="/hr/employees/$employeeId"
                              params={{ employeeId: request.employee.id }}
                              className="font-medium hover:text-primary"
                            >
                              {request.employee.firstName} {request.employee.lastName}
                            </Link>
                            <Badge
                              style={{
                                backgroundColor: `${request.leaveType.color}20`,
                                color: request.leaveType.color,
                              }}
                            >
                              {request.leaveType.name}
                            </Badge>
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
                        <Button variant="outline" size="sm" className="text-destructive">
                          <X className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                        <Button size="sm">
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
                          {getInitials(request.employee.firstName, request.employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/hr/employees/$employeeId"
                            params={{ employeeId: request.employee.id }}
                            className="font-medium hover:text-primary"
                          >
                            {request.employee.firstName} {request.employee.lastName}
                          </Link>
                          <Badge
                            style={{
                              backgroundColor: `${request.leaveType.color}20`,
                              color: request.leaveType.color,
                            }}
                          >
                            {request.leaveType.name}
                          </Badge>
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
    </div>
  )
}
