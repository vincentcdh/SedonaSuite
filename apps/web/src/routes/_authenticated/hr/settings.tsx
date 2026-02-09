// ===========================================
// HR SETTINGS PAGE
// ===========================================

import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Calendar,
  Clock,
  Bell,
  Users,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Save,
  Timer,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Switch,
  Badge,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@sedona/ui'
import {
  useOrCreateHrSettings,
  useUpdateHrSettings,
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
  type HrSettings,
  type LeaveType,
} from '@sedona/hr'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/hr/settings')({
  component: HrSettingsPage,
})

// Work days configuration
const workDaysConfig = [
  { key: 'monday', label: 'Lun' },
  { key: 'tuesday', label: 'Mar' },
  { key: 'wednesday', label: 'Mer' },
  { key: 'thursday', label: 'Jeu' },
  { key: 'friday', label: 'Ven' },
  { key: 'saturday', label: 'Sam' },
  { key: 'sunday', label: 'Dim' },
]

// Month options
const monthOptions = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Fevrier' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Aout' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Decembre' },
]

// Leave type form schema
const leaveTypeFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(1, 'Le code est requis'),
  color: z.string().min(1, 'La couleur est requise'),
  isPaid: z.boolean().default(true),
  requiresApproval: z.boolean().default(true),
  maxDaysPerYear: z.coerce.number().min(0).optional(),
})

type LeaveTypeFormData = z.infer<typeof leaveTypeFormSchema>

function HrSettingsPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // State
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLeaveTypeDialogOpen, setIsLeaveTypeDialogOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)

  // Queries
  const { data: settings, isLoading: isLoadingSettings } = useOrCreateHrSettings(organizationId)
  const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes(organizationId)

  // Mutations
  const updateSettings = useUpdateHrSettings(organizationId)
  const createLeaveType = useCreateLeaveType(organizationId)
  const updateLeaveType = useUpdateLeaveType()
  const deleteLeaveType = useDeleteLeaveType()

  // Local state for form values
  const [formValues, setFormValues] = useState<Partial<HrSettings>>({})

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      setFormValues(settings)
    }
  }, [settings])

  // Leave type form
  const leaveTypeForm = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: {
      name: '',
      code: '',
      color: '#3b82f6',
      isPaid: true,
      requiresApproval: true,
      maxDaysPerYear: undefined,
    },
  })

  const isLoading = isLoadingSettings || isLoadingLeaveTypes

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleFieldChange = (field: keyof HrSettings, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false)
  }

  const handleWorkDayToggle = (day: string) => {
    const currentDays = formValues.workDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    handleFieldChange('workDays', newDays)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateSettings.mutateAsync(formValues)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenLeaveTypeDialog = (leaveType?: LeaveType) => {
    if (leaveType) {
      setEditingLeaveType(leaveType)
      leaveTypeForm.reset({
        name: leaveType.name,
        code: leaveType.code,
        color: leaveType.color,
        isPaid: leaveType.isPaid,
        requiresApproval: leaveType.requiresApproval,
        maxDaysPerYear: leaveType.maxDaysPerYear || undefined,
      })
    } else {
      setEditingLeaveType(null)
      leaveTypeForm.reset({
        name: '',
        code: '',
        color: '#3b82f6',
        isPaid: true,
        requiresApproval: true,
        maxDaysPerYear: undefined,
      })
    }
    setIsLeaveTypeDialogOpen(true)
  }

  const handleSaveLeaveType = async (data: LeaveTypeFormData) => {
    try {
      if (editingLeaveType) {
        await updateLeaveType.mutateAsync({
          id: editingLeaveType.id,
          ...data,
        })
      } else {
        await createLeaveType.mutateAsync(data)
      }
      setIsLeaveTypeDialogOpen(false)
      leaveTypeForm.reset()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  const handleDeleteLeaveType = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer ce type de conge ?')) return
    try {
      await deleteLeaveType.mutateAsync(id)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + (error as Error).message)
    }
  }

  const leaveTypesList = leaveTypes || []

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parametres RH</h1>
          <p className="text-muted-foreground">
            Configurez les options du module ressources humaines
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saveSuccess ? (
            <Save className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saveSuccess ? 'Enregistre !' : 'Enregistrer'}
        </Button>
      </div>

      {/* Leave configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuration des conges
          </CardTitle>
          <CardDescription>
            Definissez les parametres par defaut pour les conges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="annualLeaveDays">Jours de CP par an</Label>
              <Input
                id="annualLeaveDays"
                type="number"
                value={formValues.annualLeaveDaysPerYear || 25}
                onChange={(e) => handleFieldChange('annualLeaveDaysPerYear', parseInt(e.target.value) || 25)}
              />
              <p className="text-xs text-muted-foreground">
                Nombre de jours de conges payes acquis par an
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rttDays">Jours de RTT par an</Label>
              <Input
                id="rttDays"
                type="number"
                value={formValues.rttDaysPerYear || 0}
                onChange={(e) => handleFieldChange('rttDaysPerYear', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Nombre de jours de RTT acquis par an
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaveYearStart">Debut de l'annee de reference</Label>
              <select
                id="leaveYearStart"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formValues.leaveYearStartMonth || 6}
                onChange={(e) => handleFieldChange('leaveYearStartMonth', parseInt(e.target.value))}
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Mois de debut de la periode de reference des CP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Types de conges
            </CardTitle>
            <CardDescription>
              Gerez les differents types d'absences disponibles
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenLeaveTypeDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un type
          </Button>
        </CardHeader>
        <CardContent>
          {leaveTypesList.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun type de conge configure. Ajoutez-en un pour commencer.
            </p>
          ) : (
            <div className="space-y-3">
              {leaveTypesList.map(leaveType => (
                <div
                  key={leaveType.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: leaveType.color }}
                    />
                    <div>
                      <span className="font-medium">{leaveType.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">({leaveType.code})</span>
                    </div>
                    {leaveType.isSystem && (
                      <Badge variant="secondary" className="text-xs">Systeme</Badge>
                    )}
                    {leaveType.isPaid && (
                      <Badge variant="outline" className="text-xs">Paye</Badge>
                    )}
                    {leaveType.maxDaysPerYear && (
                      <Badge variant="outline" className="text-xs">{leaveType.maxDaysPerYear}j/an</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenLeaveTypeDialog(leaveType)}
                      disabled={leaveType.isSystem}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLeaveType(leaveType.id)}
                      disabled={leaveType.isSystem}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Temps de travail
          </CardTitle>
          <CardDescription>
            Configuration par defaut du temps de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workHoursPerWeek">Heures par semaine</Label>
              <Input
                id="workHoursPerWeek"
                type="number"
                value={formValues.defaultWorkHoursPerWeek || 35}
                onChange={(e) => handleFieldChange('defaultWorkHoursPerWeek', parseInt(e.target.value) || 35)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jours travailles</Label>
              <div className="flex flex-wrap gap-2">
                {workDaysConfig.map((day) => (
                  <Button
                    key={day.key}
                    type="button"
                    variant={(formValues.workDays || []).includes(day.key) ? 'default' : 'outline'}
                    size="sm"
                    className="w-12"
                    onClick={() => handleWorkDayToggle(day.key)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Pointage / Badgeage
          </CardTitle>
          <CardDescription>
            Configuration du suivi du temps de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Activer le pointage</p>
              <p className="text-sm text-muted-foreground">
                Permettre le suivi du temps de travail via badgeage
              </p>
            </div>
            <Switch
              checked={formValues.timeTrackingEnabled ?? true}
              onCheckedChange={(checked) => handleFieldChange('timeTrackingEnabled', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Les employes peuvent badger</p>
              <p className="text-sm text-muted-foreground">
                Permettre aux employes de pointer leurs entrees/sorties
              </p>
            </div>
            <Switch
              checked={formValues.employeesCanClockInOut ?? true}
              onCheckedChange={(checked) => handleFieldChange('employeesCanClockInOut', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notes obligatoires au pointage</p>
              <p className="text-sm text-muted-foreground">
                Exiger une note lors du badgeage (entree/sortie)
              </p>
            </div>
            <Switch
              checked={formValues.requireClockInNotes || false}
              onCheckedChange={(checked) => handleFieldChange('requireClockInNotes', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Debadgeage automatique</p>
              <p className="text-sm text-muted-foreground">
                Heure de sortie automatique si l'employe oublie de badger
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={formValues.autoClockOutTime || ''}
                onChange={(e) => handleFieldChange('autoClockOutTime', e.target.value || null)}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertes automatiques
          </CardTitle>
          <CardDescription>
            Configurez les alertes automatiques pour ne rien oublier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Fin de periode d'essai</p>
              <p className="text-sm text-muted-foreground">
                Alerte avant la fin de la periode d'essai
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formValues.alertTrialEndDays || 15}
                onChange={(e) => handleFieldChange('alertTrialEndDays', parseInt(e.target.value) || 15)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Fin de contrat (CDD)</p>
              <p className="text-sm text-muted-foreground">
                Alerte avant la fin d'un CDD
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formValues.alertContractEndDays || 30}
                onChange={(e) => handleFieldChange('alertContractEndDays', parseInt(e.target.value) || 30)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Entretien professionnel</p>
              <p className="text-sm text-muted-foreground">
                Rappel si aucun entretien depuis X mois
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formValues.alertInterviewMonths || 24}
                onChange={(e) => handleFieldChange('alertInterviewMonths', parseInt(e.target.value) || 24)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">mois</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Documents expirants</p>
              <p className="text-sm text-muted-foreground">
                Alerte avant l'expiration d'un document
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formValues.alertDocumentExpiryDays || 30}
                onChange={(e) => handleFieldChange('alertDocumentExpiryDays', parseInt(e.target.value) || 30)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">jours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee self-service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Portail employe
          </CardTitle>
          <CardDescription>
            Permettez aux employes d'acceder a leur espace personnel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Activer le portail employe</p>
              <p className="text-sm text-muted-foreground">
                Les employes pourront acceder a leur espace personnel
              </p>
            </div>
            <Switch
              checked={formValues.employeeSelfServiceEnabled || false}
              onCheckedChange={(checked) => handleFieldChange('employeeSelfServiceEnabled', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Demandes de conges</p>
              <p className="text-sm text-muted-foreground">
                Les employes peuvent faire des demandes de conges
              </p>
            </div>
            <Switch
              checked={formValues.employeesCanRequestLeaves ?? true}
              onCheckedChange={(checked) => handleFieldChange('employeesCanRequestLeaves', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Consulter l'annuaire</p>
              <p className="text-sm text-muted-foreground">
                Les employes peuvent voir l'annuaire de l'equipe
              </p>
            </div>
            <Switch
              checked={formValues.employeesCanViewDirectory ?? true}
              onCheckedChange={(checked) => handleFieldChange('employeesCanViewDirectory', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modifier leur profil</p>
              <p className="text-sm text-muted-foreground">
                Les employes peuvent modifier leurs informations personnelles
              </p>
            </div>
            <Switch
              checked={formValues.employeesCanEditProfile || false}
              onCheckedChange={(checked) => handleFieldChange('employeesCanEditProfile', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Consulter les bulletins de paie</p>
              <p className="text-sm text-muted-foreground">
                Les employes peuvent voir leurs bulletins de paie
              </p>
            </div>
            <Switch
              checked={formValues.employeesCanViewPayslips || false}
              onCheckedChange={(checked) => handleFieldChange('employeesCanViewPayslips', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Consulter les contrats</p>
              <p className="text-sm text-muted-foreground">
                Les employes peuvent voir leurs contrats de travail
              </p>
            </div>
            <Switch
              checked={formValues.employeesCanViewContracts || false}
              onCheckedChange={(checked) => handleFieldChange('employeesCanViewContracts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer les modifications
        </Button>
      </div>

      {/* Leave Type Dialog */}
      <Dialog open={isLeaveTypeDialogOpen} onOpenChange={setIsLeaveTypeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingLeaveType ? 'Modifier le type de conge' : 'Nouveau type de conge'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={leaveTypeForm.handleSubmit(handleSaveLeaveType)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaveTypeName">Nom *</Label>
                <Input
                  id="leaveTypeName"
                  placeholder="Ex: Conges payes"
                  {...leaveTypeForm.register('name')}
                />
                {leaveTypeForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{leaveTypeForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveTypeCode">Code *</Label>
                <Input
                  id="leaveTypeCode"
                  placeholder="Ex: cp"
                  {...leaveTypeForm.register('code')}
                />
                {leaveTypeForm.formState.errors.code && (
                  <p className="text-sm text-red-500">{leaveTypeForm.formState.errors.code.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaveTypeColor">Couleur</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...leaveTypeForm.register('color')}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    {...leaveTypeForm.register('color')}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDays">Jours max par an</Label>
                <Input
                  id="maxDays"
                  type="number"
                  placeholder="Illimite"
                  {...leaveTypeForm.register('maxDaysPerYear')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conge paye</p>
                <p className="text-sm text-muted-foreground">Ce type de conge est remunere</p>
              </div>
              <Switch
                checked={leaveTypeForm.watch('isPaid')}
                onCheckedChange={(checked) => leaveTypeForm.setValue('isPaid', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Approbation requise</p>
                <p className="text-sm text-muted-foreground">La demande doit etre validee par un manager</p>
              </div>
              <Switch
                checked={leaveTypeForm.watch('requiresApproval')}
                onCheckedChange={(checked) => leaveTypeForm.setValue('requiresApproval', checked)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLeaveTypeDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createLeaveType.isPending || updateLeaveType.isPending}
              >
                {(createLeaveType.isPending || updateLeaveType.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingLeaveType ? 'Modifier' : 'Creer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
