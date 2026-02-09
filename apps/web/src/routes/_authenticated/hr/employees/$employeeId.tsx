// ===========================================
// EMPLOYEE DETAIL PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Award,
  AlertCircle,
  User,
  Briefcase,
  Building,
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
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
} from '@sedona/ui'
import { useEmployee, type EmployeeStatus, type ContractType } from '@sedona/hr'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/hr/employees/$employeeId')({
  component: EmployeeDetailPage,
})

const mockContracts = [
  {
    id: '1',
    contractType: 'cdi' as ContractType,
    startDate: '2022-01-15',
    endDate: null,
    jobTitle: 'Developpeur Senior',
    department: 'Technique',
    grossSalary: 4500,
  },
  {
    id: '2',
    contractType: 'cdd' as ContractType,
    startDate: '2021-01-15',
    endDate: '2021-12-31',
    jobTitle: 'Developpeur Junior',
    department: 'Technique',
    grossSalary: 3200,
  },
]

const mockInterviews = [
  {
    id: '1',
    type: 'annual',
    scheduledDate: '2024-03-15T14:00:00Z',
    status: 'scheduled',
    interviewer: { firstName: 'Pierre', lastName: 'Durand' },
  },
  {
    id: '2',
    type: 'professional',
    scheduledDate: '2023-01-20T10:00:00Z',
    status: 'completed',
    interviewer: { firstName: 'Pierre', lastName: 'Durand' },
  },
]

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

const interviewTypeLabels: Record<string, string> = {
  annual: 'Entretien annuel',
  professional: 'Entretien professionnel',
  trial_end: 'Fin de periode d\'essai',
  other: 'Autre',
}

function EmployeeDetailPage() {
  const { employeeId } = Route.useParams()
  const [activeTab, setActiveTab] = useState('info')

  const { data: employee, isLoading, error } = useEmployee(employeeId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-destructive">Employe non trouve</p>
          <Link to="/hr">
            <Button variant="outline" className="mt-4">
              Retour a la liste
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  // Calculate tenure (only if contractStartDate exists)
  let tenureYears = 0
  let tenureMonths = 0
  if (employee.contractStartDate) {
    const startDate = new Date(employee.contractStartDate)
    const now = new Date()
    tenureYears = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
    tenureMonths = Math.floor(((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) % 12)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/hr">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16">
            {employee.photoUrl && <AvatarImage src={employee.photoUrl} />}
            <AvatarFallback className="text-xl">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {employee.firstName} {employee.lastName}
              </h1>
              <Badge className={statusConfig[employee.status]?.className || 'bg-gray-100 text-gray-700'}>
                {statusConfig[employee.status]?.label || employee.status}
              </Badge>
              {employee.contractType && contractTypeConfig[employee.contractType] && (
                <Badge className={contractTypeConfig[employee.contractType].className}>
                  {contractTypeConfig[employee.contractType].label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              {employee.jobTitle && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {employee.jobTitle}
                </span>
              )}
              {employee.department && (
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {employee.department}
                </span>
              )}
              {employee.employeeNumber && (
                <span className="text-sm">#{employee.employeeNumber}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ajouter un contrat</DropdownMenuItem>
              <DropdownMenuItem>Planifier un entretien</DropdownMenuItem>
              <DropdownMenuItem>Ajouter un document</DropdownMenuItem>
              <DropdownMenuItem>Ajouter une note</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archiver</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anciennete</p>
                <p className="font-semibold">
                  {tenureYears > 0 && `${tenureYears} an${tenureYears > 1 ? 's' : ''}`}
                  {tenureYears > 0 && tenureMonths > 0 && ' et '}
                  {tenureMonths > 0 && `${tenureMonths} mois`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solde CP</p>
                <p className="font-semibold">{employee.annualLeaveBalance} jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solde RTT</p>
                <p className="font-semibold">{employee.rttBalance} jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prochain entretien</p>
                <p className="font-semibold">15 mars 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="contracts">Contrats</TabsTrigger>
          <TabsTrigger value="leaves">Conges</TabsTrigger>
          <TabsTrigger value="interviews">Entretiens</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-medium">{employee.birthDate ? formatDate(employee.birthDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lieu de naissance</p>
                    <p className="font-medium">{employee.birthPlace || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nationalite</p>
                    <p className="font-medium">{employee.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">N° Securite sociale</p>
                    <p className="font-medium">{employee.socialSecurityNumber || '-'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Contact personnel</p>
                  <div className="space-y-2">
                    {employee.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {employee.email}
                      </p>
                    )}
                    {employee.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {employee.phone}
                      </p>
                    )}
                    {!employee.email && !employee.phone && (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                </div>

                {(employee.addressLine1 || employee.city) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Adresse</p>
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>
                          {employee.addressLine1 || ''}
                          {employee.addressLine2 && <>, {employee.addressLine2}</>}
                          {(employee.postalCode || employee.city) && <br />}
                          {employee.postalCode} {employee.city}{employee.country && `, ${employee.country}`}
                        </span>
                      </p>
                    </div>
                  </>
                )}

                {(employee.emergencyContactName || employee.emergencyContactPhone) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Contact d'urgence</p>
                      <div className="space-y-1">
                        {employee.emergencyContactName && <p className="font-medium">{employee.emergencyContactName}</p>}
                        {employee.emergencyContactRelation && <p className="text-sm text-muted-foreground">{employee.emergencyContactRelation}</p>}
                        {employee.emergencyContactPhone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {employee.emergencyContactPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Informations professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Poste</p>
                    <p className="font-medium">{employee.jobTitle || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departement</p>
                    <p className="font-medium">{employee.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'entree</p>
                    <p className="font-medium">{employee.contractStartDate ? formatDate(employee.contractStartDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type de contrat</p>
                    {employee.contractType && contractTypeConfig[employee.contractType] ? (
                      <Badge className={contractTypeConfig[employee.contractType].className}>
                        {contractTypeConfig[employee.contractType].label}
                      </Badge>
                    ) : (
                      <p className="font-medium">-</p>
                    )}
                  </div>
                </div>

                {(employee.workEmail || employee.workPhone) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Contact professionnel</p>
                      <div className="space-y-2">
                        {employee.workEmail && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {employee.workEmail}
                          </p>
                        )}
                        {employee.workPhone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {employee.workPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {'manager' in employee && employee.manager && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Manager</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(employee.manager.firstName, employee.manager.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{employee.manager.firstName} {employee.manager.lastName}</span>
                      </div>
                    </div>
                  </>
                )}

                {employee.grossSalary && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Remuneration</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(employee.grossSalary, employee.salaryCurrency || 'EUR')}
                        <span className="text-sm font-normal text-muted-foreground"> / mois brut</span>
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historique des contrats
              </CardTitle>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Nouveau contrat
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContracts.map((contract, index) => (
                  <div
                    key={contract.id}
                    className={`flex items-start justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={contractTypeConfig[contract.contractType].className}>
                          {contractTypeConfig[contract.contractType].label}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="text-primary border-primary">
                            Actuel
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{contract.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.department} - {formatCurrency(contract.grossSalary, 'EUR')}/mois
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Du {formatDate(contract.startDate)}
                        {contract.endDate ? ` au ${formatDate(contract.endDate)}` : ' - En cours'}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Conges et absences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Aucun conge enregistre pour cet employe
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Entretiens
              </CardTitle>
              <Button>
                <Award className="h-4 w-4 mr-2" />
                Planifier un entretien
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInterviews.map(interview => (
                  <div
                    key={interview.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{interviewTypeLabels[interview.type]}</p>
                        <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>
                          {interview.status === 'scheduled' ? 'Planifie' : 'Termine'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(interview.scheduledDate)} - Avec {interview.interviewer.firstName} {interview.interviewer.lastName}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Aucun document pour cet employe
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Ajouter une note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Aucune note pour cet employe
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
