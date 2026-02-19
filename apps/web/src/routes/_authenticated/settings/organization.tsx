import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Badge,
  Spinner,
  toast,
} from '@sedona/ui'
import { useOrganization, useOrganizationHealth } from '@/lib/auth'
import {
  Building2,
  Globe,
  MapPin,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Users,
  FileText,
  Ticket,
  UserCircle,
} from 'lucide-react'
import { useSession } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/settings/organization')({
  component: OrganizationSettingsPage,
})

const organizationSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  legalName: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  website: z.string().url('URL invalide').or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

function OrganizationSettingsPage() {
  const { data: session } = useSession()
  const { organization } = useOrganization()
  const { health, isLoading: healthLoading, reprovision, refetch: refetchHealth } = useOrganizationHealth(organization?.id)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isReprovisioning, setIsReprovisioning] = useState(false)

  // Mock - in reality would come from organization membership
  const isOwner = true

  const handleReprovision = async () => {
    setIsReprovisioning(true)
    const result = await reprovision()
    setIsReprovisioning(false)

    if (result.success) {
      toast({
        title: 'Provisionnement termine',
        description: 'Tous les modules ont ete initialises avec succes',
      })
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Erreur lors du provisionnement',
        variant: 'destructive',
      })
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      legalName: '',
      siret: '',
      vatNumber: '',
      website: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
  })

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true)
    setSuccess(false)

    try {
      // TODO: Implement organization update API call
      console.log('Organization update:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (error) {
      console.error('Failed to update organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo de l'entreprise</CardTitle>
          <CardDescription>
            Ce logo apparaitra sur vos factures et documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <Button variant="outline" size="sm">
                Telecharger un logo
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou SVG. 500x500px recommande.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'entreprise</CardTitle>
          <CardDescription>
            Ces informations apparaitront sur vos documents officiels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {success && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Organisation mise a jour avec succes
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informations generales
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom commercial</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalName">Raison sociale</Label>
                  <Input
                    id="legalName"
                    placeholder="Nom officiel de l'entreprise"
                    {...register('legalName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    placeholder="123 456 789 00012"
                    {...register('siret')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Numero de TVA</Label>
                  <Input
                    id="vatNumber"
                    placeholder="FR12345678901"
                    {...register('vatNumber')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Contact
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://exemple.fr"
                    {...register('website')}
                  />
                  {errors.website && (
                    <p className="text-sm text-error">{errors.website.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    {...register('phone')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="123 rue de la Paix"
                    {...register('address')}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      placeholder="75001"
                      {...register('postalCode')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Paris"
                      {...register('city')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      placeholder="France"
                      {...register('country')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !isDirty}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Organization Health / Provisioning Status */}
      {isOwner && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Etat de sante
                </CardTitle>
                <CardDescription>
                  Statut du provisionnement des modules de l'organisation
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchHealth()}
                  disabled={healthLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                {health && !health.is_fully_provisioned && (
                  <Button
                    size="sm"
                    onClick={handleReprovision}
                    disabled={isReprovisioning}
                  >
                    {isReprovisioning ? (
                      <Spinner className="h-4 w-4 mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Reprovisionner
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {healthLoading && !health ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : health ? (
              <div className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {health.is_fully_provisioned ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">Tous les modules sont configures</p>
                        <p className="text-sm text-muted-foreground">
                          L'organisation est prete a l'emploi
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium text-amber-700">Configuration incomplete</p>
                        <p className="text-sm text-muted-foreground">
                          Certains modules necessitent un provisionnement
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Module Details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <ModuleStatusCard
                    icon={Users}
                    title="CRM"
                    description="Pipeline et etapes de vente"
                    provisioned={health.modules.crm.provisioned}
                    itemsCount={health.modules.crm.items_count}
                    itemsLabel="etapes"
                  />
                  <ModuleStatusCard
                    icon={FileText}
                    title="Facturation"
                    description="Parametres et taux de TVA"
                    provisioned={health.modules.invoice.provisioned}
                    itemsCount={health.modules.invoice.items_count}
                    itemsLabel="taux TVA"
                  />
                  <ModuleStatusCard
                    icon={Ticket}
                    title="Tickets"
                    description="SLA et categories"
                    provisioned={health.modules.tickets.provisioned}
                    itemsCount={health.modules.tickets.items_count}
                    itemsLabel="categories"
                  />
                  <ModuleStatusCard
                    icon={UserCircle}
                    title="RH"
                    description="Types de conges"
                    provisioned={health.modules.hr.provisioned}
                    itemsCount={health.modules.hr.items_count}
                    itemsLabel="types de conges"
                  />
                </div>

                {/* Last Checked */}
                <p className="text-xs text-muted-foreground text-right">
                  Derniere verification: {new Date(health.checked_at).toLocaleString('fr-FR')}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Impossible de verifier l'etat de sante</p>
                <Button variant="link" onClick={() => refetchHealth()}>
                  Reessayer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone - Owner only */}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zone de danger
            </CardTitle>
            <CardDescription>
              Actions irreversibles. Procedez avec precaution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transfer Ownership */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Transferer la propriete</p>
                <p className="text-sm text-muted-foreground">
                  Transferer cette organisation a un autre membre admin
                </p>
              </div>
              <Button variant="outline">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transferer
              </Button>
            </div>

            <Separator />

            {/* Delete Organization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Supprimer l'organisation</p>
                  <p className="text-sm text-muted-foreground">
                    Supprime definitivement l'organisation et toutes ses donnees
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>

              {showDeleteConfirm && (
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-destructive">
                        Cette action est irreversible
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Toutes les donnees seront supprimees : contacts, factures,
                        projets, documents, et membres. Cette action ne peut pas
                        etre annulee.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm">
                      Tapez <span className="font-mono font-bold">{organization?.name || 'SUPPRIMER'}</span> pour confirmer
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={organization?.name || 'SUPPRIMER'}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmText !== (organization?.name || 'SUPPRIMER')}
                    >
                      Supprimer definitivement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ===========================================
// MODULE STATUS CARD COMPONENT
// ===========================================

interface ModuleStatusCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  provisioned: boolean
  itemsCount: number
  itemsLabel: string
}

function ModuleStatusCard({
  icon: Icon,
  title,
  description,
  provisioned,
  itemsCount,
  itemsLabel,
}: ModuleStatusCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className={`p-2 rounded-md ${provisioned ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {provisioned ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Configure
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Non configure
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {provisioned && itemsCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {itemsCount} {itemsLabel}
          </p>
        )}
      </div>
    </div>
  )
}
