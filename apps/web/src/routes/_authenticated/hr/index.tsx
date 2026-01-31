// ===========================================
// EMPLOYEES LIST PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Grid3X3,
  List,
  Mail,
  Phone,
  Briefcase,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@sedona/ui'
import { useEmployees, useDepartments, type EmployeeStatus, type ContractType } from '@sedona/hr'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/')({
  component: EmployeesListPage,
})

const statusConfig: Record<EmployeeStatus, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-green-100 text-green-700' },
  trial_period: { label: 'Periode d\'essai', className: 'bg-yellow-100 text-yellow-700' },
  notice_period: { label: 'Preavis', className: 'bg-orange-100 text-orange-700' },
  left: { label: 'Sorti', className: 'bg-gray-100 text-gray-700' },
}

const contractTypeConfig: Record<ContractType, { label: string; className: string }> = {
  cdi: { label: 'CDI', className: 'bg-blue-100 text-blue-700' },
  cdd: { label: 'CDD', className: 'bg-purple-100 text-purple-700' },
  stage: { label: 'Stage', className: 'bg-pink-100 text-pink-700' },
  alternance: { label: 'Alternance', className: 'bg-indigo-100 text-indigo-700' },
  freelance: { label: 'Freelance', className: 'bg-teal-100 text-teal-700' },
  interim: { label: 'Interim', className: 'bg-cyan-100 text-cyan-700' },
}

function EmployeesListPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Fetch employees from Supabase (returns PaginatedResult)
  const { data: employeesResult, isLoading, error } = useEmployees(organizationId)
  const employees = employeesResult?.data || []

  // Fetch departments from Supabase
  const { data: departmentsData = [] } = useDepartments(organizationId)
  const departments = departmentsData.length > 0
    ? departmentsData
    : [...new Set(employees.map(e => e.department).filter(Boolean))]

  const filteredEmployees = employees.filter(employee => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !employee.firstName.toLowerCase().includes(query) &&
        !employee.lastName.toLowerCase().includes(query) &&
        !(employee.email?.toLowerCase().includes(query)) &&
        !(employee.employeeNumber?.toLowerCase().includes(query)) &&
        !(employee.jobTitle?.toLowerCase().includes(query))
      ) {
        return false
      }
    }
    if (statusFilter !== 'all' && employee.status !== statusFilter) {
      return false
    }
    if (departmentFilter !== 'all' && employee.department !== departmentFilter) {
      return false
    }
    return true
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-destructive">Erreur lors du chargement des employes</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employes</h1>
          <p className="text-muted-foreground">
            {filteredEmployees.length} employe{filteredEmployees.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/hr/employees/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel employe
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, matricule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="trial_period">Periode d'essai</SelectItem>
            <SelectItem value="notice_period">Preavis</SelectItem>
            <SelectItem value="left">Sorti</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les departements</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Plus de filtres
        </Button>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Employees list/grid */}
      {viewMode === 'list' ? (
        <Card>
          <div className="divide-y">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 bg-muted/50 text-sm font-medium">
              <span>Employe</span>
              <span className="w-32">Departement</span>
              <span className="w-24 text-center">Statut</span>
              <span className="w-20 text-center">Contrat</span>
              <span className="w-10"></span>
            </div>

            {/* Employee rows */}
            {filteredEmployees.map(employee => (
              <div
                key={employee.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-10 w-10">
                    {employee.photoUrl && <AvatarImage src={employee.photoUrl} />}
                    <AvatarFallback>
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      to="/hr/employees/$employeeId"
                      params={{ employeeId: employee.id }}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {employee.firstName} {employee.lastName}
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {employee.jobTitle && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {employee.jobTitle}
                        </span>
                      )}
                      {employee.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-32">
                  <span className="text-sm">{employee.department}</span>
                </div>

                <div className="w-24 flex justify-center">
                  <Badge className={statusConfig[employee.status].className}>
                    {statusConfig[employee.status].label}
                  </Badge>
                </div>

                <div className="w-20 flex justify-center">
                  {employee.contractType && contractTypeConfig[employee.contractType] ? (
                    <Badge className={contractTypeConfig[employee.contractType].className}>
                      {contractTypeConfig[employee.contractType].label}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>

                <div className="w-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/hr/employees/$employeeId" params={{ employeeId: employee.id }}>
                          Voir le profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Ajouter un contrat</DropdownMenuItem>
                      <DropdownMenuItem>Planifier un entretien</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Archiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredEmployees.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Aucun employe trouve
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map(employee => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="h-12 w-12">
                    {employee.photoUrl && <AvatarImage src={employee.photoUrl} />}
                    <AvatarFallback>
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/hr/employees/$employeeId" params={{ employeeId: employee.id }}>
                          Voir le profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Archiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link
                  to="/hr/employees/$employeeId"
                  params={{ employeeId: employee.id }}
                  className="block"
                >
                  <h3 className="font-medium hover:text-primary transition-colors">
                    {employee.firstName} {employee.lastName}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-3">{employee.jobTitle || '-'}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={statusConfig[employee.status].className}>
                    {statusConfig[employee.status].label}
                  </Badge>
                  {employee.contractType && contractTypeConfig[employee.contractType] && (
                    <Badge className={contractTypeConfig[employee.contractType].className}>
                      {contractTypeConfig[employee.contractType].label}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {employee.department && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      {employee.department}
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {employee.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              Aucun employe trouve
            </div>
          )}
        </div>
      )}
    </div>
  )
}
