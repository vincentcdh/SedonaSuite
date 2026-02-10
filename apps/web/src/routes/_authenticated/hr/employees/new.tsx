// ===========================================
// NEW EMPLOYEE PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Briefcase,
  FileText,
  DollarSign,
  Loader2,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@sedona/ui'
import { createEmployeeSchema, type CreateEmployeeInput, useCreateEmployeeWithUser } from '@sedona/hr'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/employees/new')({
  component: NewEmployeePage,
})

function NewEmployeePage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const createEmployee = useCreateEmployeeWithUser(organizationId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      country: 'France',
      nationality: 'Francaise',
      salaryCurrency: 'EUR',
      status: 'active',
      createUserAccess: false,
      dashboardRole: 'employee',
    },
  })

  const contractType = watch('contractType')
  const createUserAccess = watch('createUserAccess')

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      const result = await createEmployee.mutateAsync(data)
      if (result.userCreated && result.temporaryPassword && data.userEmail) {
        setCredentials({
          email: data.userEmail,
          password: result.temporaryPassword,
        })
        setShowCredentialsDialog(true)
      } else {
        navigate({ to: '/hr' })
      }
    } catch (err) {
      console.error('Error creating employee:', err)
      alert(`Erreur: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    }
  }

  const handleCopyCredentials = () => {
    if (credentials) {
      const text = `Email: ${credentials.email}\nMot de passe: ${credentials.password}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCloseDialog = () => {
    setShowCredentialsDialog(false)
    navigate({ to: '/hr' })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/hr' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nouvel employe</h1>
          <p className="text-muted-foreground">Ajouter un nouveau membre a l'equipe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identite
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prenom *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Prenom"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Nom"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email personnel</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone personnel</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Lieu de naissance</Label>
              <Input
                id="birthPlace"
                {...register('birthPlace')}
                placeholder="Ville"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationalite</Label>
              <Input
                id="nationality"
                {...register('nationality')}
                placeholder="Francaise"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialSecurityNumber">Numero de securite sociale</Label>
              <Input
                id="socialSecurityNumber"
                {...register('socialSecurityNumber')}
                placeholder="1 XX XX XX XXX XXX XX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse personnelle
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Adresse</Label>
              <Input
                id="addressLine1"
                {...register('addressLine1')}
                placeholder="Numero et rue"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Complement d'adresse</Label>
              <Input
                id="addressLine2"
                {...register('addressLine2')}
                placeholder="Batiment, etage..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="75001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="France"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact d'urgence
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Nom</Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
                placeholder="Nom du contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Telephone</Label>
              <Input
                id="emergencyContactPhone"
                {...register('emergencyContactPhone')}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">Relation</Label>
              <Input
                id="emergencyContactRelation"
                {...register('emergencyContactRelation')}
                placeholder="Conjoint, parent..."
              />
            </div>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Matricule</Label>
              <Input
                id="employeeNumber"
                {...register('employeeNumber')}
                placeholder="Auto-genere si vide"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Poste</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle')}
                placeholder="Intitule du poste"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departement</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Technique, Commercial..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEmail">Email professionnel</Label>
              <Input
                id="workEmail"
                type="email"
                {...register('workEmail')}
                placeholder="prenom.nom@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workPhone">Telephone professionnel</Label>
              <Input
                id="workPhone"
                {...register('workPhone')}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contract */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contrat
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select onValueChange={(value) => setValue('contractType', value as CreateEmployeeInput['contractType'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">CDI</SelectItem>
                  <SelectItem value="cdd">CDD</SelectItem>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="alternance">Alternance</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="interim">Interim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                defaultValue="active"
                onValueChange={(value) => setValue('status', value as CreateEmployeeInput['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="trial_period">Periode d'essai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractStartDate">Date de debut</Label>
              <Input
                id="contractStartDate"
                type="date"
                {...register('contractStartDate')}
              />
            </div>
            {(contractType === 'cdd' || contractType === 'stage' || contractType === 'alternance' || contractType === 'interim') && (
              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Date de fin</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  {...register('contractEndDate')}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="trialEndDate">Fin de periode d'essai</Label>
              <Input
                id="trialEndDate"
                type="date"
                {...register('trialEndDate')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Remuneration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossSalary">Salaire brut mensuel</Label>
              <Input
                id="grossSalary"
                type="number"
                step="0.01"
                {...register('grossSalary', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Devise</Label>
              <Select
                defaultValue="EUR"
                onValueChange={(value) => setValue('salaryCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Acces au Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Creer un acces utilisateur</Label>
                <p className="text-sm text-muted-foreground">
                  Permet a l'employe de se connecter au dashboard
                </p>
              </div>
              <Switch
                checked={createUserAccess}
                onCheckedChange={(checked) => setValue('createUserAccess', checked)}
              />
            </div>

            {createUserAccess && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email de connexion *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    {...register('userEmail')}
                    placeholder="employe@entreprise.fr"
                  />
                  {errors.userEmail && (
                    <p className="text-sm text-destructive">{errors.userEmail.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    L'employe utilisera cet email pour se connecter
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Role dans le dashboard</Label>
                  <Select
                    defaultValue="employee"
                    onValueChange={(value) => setValue('dashboardRole', value as CreateEmployeeInput['dashboardRole'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employe</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="owner">Dirigeant</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Determine les permissions d'acces
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes internes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register('notes')}
              placeholder="Notes internes sur l'employe (non visibles par l'employe)..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/hr' })}>
            Annuler
          </Button>
          <Button type="submit" disabled={createEmployee.isPending}>
            {createEmployee.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {createEmployee.isPending ? 'Creation...' : 'Creer l\'employe'}
          </Button>
        </div>
      </form>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compte utilisateur cree</DialogTitle>
            <DialogDescription>
              Voici les identifiants de connexion pour le nouvel employe.
              Conservez ces informations en lieu sur et transmettez-les a l'employe.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{credentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mot de passe:</span>
                  <span className="font-medium">{credentials.password}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyCredentials}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copie !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier les identifiants
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                L'employe devra changer son mot de passe a la premiere connexion.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseDialog}>
              Terminer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
