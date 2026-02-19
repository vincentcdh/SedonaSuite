import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Separator,
  cn,
  toast,
} from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import {
  useModuleSubscriptions,
  useSubscribeToModule,
  useCancelModule,
  useResumeModule,
  useModuleBillingPortal,
  type ModuleId,
  type ModuleBillingCycle,
  type ModuleSubscription,
} from '@sedona/billing'
import {
  Check,
  CreditCard,
  ExternalLink,
  Sparkles,
  Users,
  FileText,
  Briefcase,
  TicketIcon,
  UserCog,
  FolderOpen,
  BarChart3,
  AlertCircle,
  Clock,
  Pause,
  Play,
  ChevronRight,
  Info,
  X,
} from 'lucide-react'

// ===========================================
// ROUTE CONFIGURATION
// ===========================================

interface ModulesSearchParams {
  success?: string
  canceled?: string
}

export const Route = createFileRoute('/_authenticated/settings/modules')({
  component: ModulesSettingsPage,
  validateSearch: (search: Record<string, unknown>): ModulesSearchParams => ({
    success: search['success'] as string | undefined,
    canceled: search['canceled'] as string | undefined,
  }),
})

// ===========================================
// MODULE METADATA
// ===========================================

interface ModuleMetadata {
  id: ModuleId
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  features: {
    free: string[]
    paid: string[]
  }
  limits: {
    free: Record<string, number | string>
    paid: Record<string, number | string>
  }
}

const MODULE_METADATA: Record<ModuleId, ModuleMetadata> = {
  crm: {
    id: 'crm',
    name: 'CRM',
    description: 'Gestion des contacts, entreprises et opportunites',
    icon: Users,
    color: 'bg-blue-500',
    features: {
      free: ['100 contacts', '50 entreprises', '10 opportunites', 'Import CSV basique'],
      paid: ['Contacts illimites', 'Entreprises illimitees', 'Opportunites illimitees', 'Import/Export avance', 'Champs personnalises', 'Historique complet'],
    },
    limits: {
      free: { max_contacts: 100, max_companies: 50, max_deals: 10 },
      paid: { max_contacts: 'Illimite', max_companies: 'Illimite', max_deals: 'Illimite' },
    },
  },
  invoice: {
    id: 'invoice',
    name: 'Facturation',
    description: 'Devis, factures et suivi des paiements',
    icon: FileText,
    color: 'bg-green-500',
    features: {
      free: ['10 factures/mois', '5 devis/mois', 'Export PDF', 'Modele basique'],
      paid: ['Factures illimitees', 'Devis illimites', 'Modeles personnalises', 'Rappels automatiques', 'Paiement en ligne', 'Multi-devises'],
    },
    limits: {
      free: { max_invoices_month: 10, max_quotes_month: 5 },
      paid: { max_invoices_month: 'Illimite', max_quotes_month: 'Illimite' },
    },
  },
  projects: {
    id: 'projects',
    name: 'Projets',
    description: 'Gestion de projets, taches et temps',
    icon: Briefcase,
    color: 'bg-purple-500',
    features: {
      free: ['3 projets actifs', 'Taches basiques', 'Vue liste'],
      paid: ['Projets illimites', 'Gantt et Kanban', 'Suivi du temps', 'Budgets', 'Jalons', 'Rapports avances'],
    },
    limits: {
      free: { max_projects: 3 },
      paid: { max_projects: 'Illimite' },
    },
  },
  tickets: {
    id: 'tickets',
    name: 'Tickets',
    description: 'Support client et base de connaissances',
    icon: TicketIcon,
    color: 'bg-orange-500',
    features: {
      free: ['50 tickets/mois', 'Email de base', '1 boite de reception'],
      paid: ['Tickets illimites', 'Multi-canaux', 'SLA', 'Base de connaissances', 'Reponses automatiques', 'Rapports'],
    },
    limits: {
      free: { max_tickets_month: 50, max_inboxes: 1 },
      paid: { max_tickets_month: 'Illimite', max_inboxes: 'Illimite' },
    },
  },
  hr: {
    id: 'hr',
    name: 'RH',
    description: 'Gestion des employes, conges et documents',
    icon: UserCog,
    color: 'bg-pink-500',
    features: {
      free: ['5 employes', 'Conges basiques', 'Fiches employes'],
      paid: ['Employes illimites', 'Gestion complete des conges', 'Documents RH', 'Onboarding', 'Evaluations', 'Rapports RH'],
    },
    limits: {
      free: { max_employees: 5 },
      paid: { max_employees: 'Illimite' },
    },
  },
  docs: {
    id: 'docs',
    name: 'Documents',
    description: 'Stockage et partage de fichiers',
    icon: FolderOpen,
    color: 'bg-yellow-500',
    features: {
      free: ['1 Go de stockage', 'Partage basique', 'Apercu fichiers'],
      paid: ['100 Go de stockage', 'Partage avance', 'Versions', 'Signatures electroniques', 'Modeles', 'Integrations'],
    },
    limits: {
      free: { max_storage_mb: 1024 },
      paid: { max_storage_mb: '100 Go' },
    },
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    description: 'Tableaux de bord et rapports avances',
    icon: BarChart3,
    color: 'bg-indigo-500',
    features: {
      free: ['3 tableaux de bord', 'Rapports basiques', 'Export PDF'],
      paid: ['Tableaux illimites', 'Rapports personnalises', 'IA predictive', 'API exports', 'Alertes automatiques', 'White-label'],
    },
    limits: {
      free: { max_dashboards: 3 },
      paid: { max_dashboards: 'Illimite' },
    },
  },
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function getStatusInfo(status: ModuleSubscription['status'], cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd) {
    return {
      label: 'Annulation prevue',
      variant: 'warning' as const,
      icon: Clock,
    }
  }

  switch (status) {
    case 'active':
      return { label: 'Actif', variant: 'success' as const, icon: Check }
    case 'trialing':
      return { label: 'Essai', variant: 'secondary' as const, icon: Clock }
    case 'past_due':
      return { label: 'Paiement en retard', variant: 'destructive' as const, icon: AlertCircle }
    case 'canceled':
      return { label: 'Annule', variant: 'outline' as const, icon: X }
    default:
      return { label: 'Gratuit', variant: 'secondary' as const, icon: Sparkles }
  }
}

// ===========================================
// COMPONENTS
// ===========================================

interface ModuleCardProps {
  module: ModuleSubscription
  metadata: ModuleMetadata
  billingCycle: ModuleBillingCycle
  onSubscribe: () => void
  onCancel: () => void
  onResume: () => void
  onManage: () => void
  isSubscribing: boolean
  isCanceling: boolean
  isResuming: boolean
  canManage: boolean
}

function ModuleCard({
  module,
  metadata,
  billingCycle,
  onSubscribe,
  onCancel,
  onResume,
  onManage,
  isSubscribing,
  isCanceling,
  isResuming,
  canManage,
}: ModuleCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const Icon = metadata.icon
  const statusInfo = getStatusInfo(module.status, module.cancelAtPeriodEnd)
  const StatusIcon = statusInfo.icon

  const price = billingCycle === 'yearly' ? module.priceYearly : module.priceMonthly
  const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(module.priceYearly / 12) : module.priceMonthly

  // Calculate usage percentage for the primary limit
  const usageKeys = Object.keys(module.usage)
  const primaryLimitKey = usageKeys.length > 0 ? usageKeys[0] : null
  const currentUsage = primaryLimitKey ? (module.usage[primaryLimitKey] || 0) : 0
  const limit = primaryLimitKey ? (module.limits[primaryLimitKey] || 0) : 0
  const usagePercent = limit > 0 ? Math.min(100, (currentUsage / limit) * 100) : 0
  const isNearLimit = usagePercent >= 80

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all',
      module.isPaid && 'border-primary/50 shadow-sm'
    )}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <Badge
          variant={statusInfo.variant}
          className="gap-1"
        >
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', metadata.color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <CardTitle className="text-lg">{metadata.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {metadata.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage indicator for primary limit */}
        {primaryLimitKey && limit > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Utilisation</span>
              <span className={cn(isNearLimit && 'text-warning font-medium')}>
                {currentUsage} / {limit === -1 ? '∞' : limit}
              </span>
            </div>
            <Progress
              value={usagePercent}
              className={cn(
                'h-2',
                isNearLimit && '[&>div]:bg-warning',
                usagePercent >= 100 && '[&>div]:bg-destructive'
              )}
            />
          </div>
        )}

        {/* Price display */}
        <div className="flex items-baseline gap-1">
          {module.isPaid ? (
            <>
              <span className="text-2xl font-bold">{formatPrice(monthlyEquivalent)}€</span>
              <span className="text-muted-foreground">/mois</span>
              {billingCycle === 'yearly' && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({formatPrice(price)}€/an)
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-2xl font-bold">Gratuit</span>
              <span className="text-muted-foreground text-sm ml-2">
                ou {formatPrice(monthlyEquivalent)}€/mois
              </span>
            </>
          )}
        </div>

        {/* Period info for active subscriptions */}
        {module.isPaid && module.currentPeriodEnd && (
          <p className="text-xs text-muted-foreground">
            {module.cancelAtPeriodEnd ? 'Actif jusqu\'au' : 'Prochain renouvellement le'}{' '}
            {new Date(module.currentPeriodEnd).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {!module.isPaid && (
            <Button
              className="flex-1"
              onClick={onSubscribe}
              disabled={!canManage || isSubscribing}
            >
              {isSubscribing ? 'Chargement...' : 'Passer a Pro'}
            </Button>
          )}

          {module.isPaid && !module.cancelAtPeriodEnd && (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onManage}
                disabled={!canManage}
              >
                Gerer
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                disabled={!canManage || isCanceling}
                title="Annuler l'abonnement"
              >
                <Pause className="h-4 w-4" />
              </Button>
            </>
          )}

          {module.isPaid && module.cancelAtPeriodEnd && (
            <Button
              className="flex-1"
              variant="outline"
              onClick={onResume}
              disabled={!canManage || isResuming}
            >
              <Play className="mr-2 h-4 w-4" />
              {isResuming ? 'Chargement...' : 'Reprendre'}
            </Button>
          )}
        </div>

        {/* View details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-sm text-primary hover:underline w-full justify-center pt-2"
        >
          <Info className="h-4 w-4" />
          {showDetails ? 'Masquer les details' : 'Voir les fonctionnalites'}
          <ChevronRight className={cn('h-4 w-4 transition-transform', showDetails && 'rotate-90')} />
        </button>

        {/* Features comparison (expandable) */}
        {showDetails && (
          <div className="pt-4 border-t space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Badge variant="secondary">Gratuit</Badge>
              </h4>
              <ul className="space-y-1">
                {metadata.features.free.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3 w-3 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Badge variant="default" className="bg-primary">Pro</Badge>
              </h4>
              <ul className="space-y-1">
                {metadata.features.paid.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* No permission warning */}
        {!canManage && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Seuls les proprietaires et administrateurs peuvent gerer les abonnements
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ===========================================
// MAIN PAGE COMPONENT
// ===========================================

function ModulesSettingsPage() {
  const { organization, role } = useOrganization()
  const search = Route.useSearch()
  const [billingCycle, setBillingCycle] = useState<ModuleBillingCycle>('monthly')
  const [subscribingModule, setSubscribingModule] = useState<ModuleId | null>(null)
  const [cancelingModule, setCancelingModule] = useState<ModuleId | null>(null)
  const [resumingModule, setResumingModule] = useState<ModuleId | null>(null)

  // Hooks
  const { modules, isLoading, refetch } = useModuleSubscriptions(organization?.id)
  const { subscribe } = useSubscribeToModule()
  const { cancel } = useCancelModule()
  const { resume } = useResumeModule()
  const { openPortal, isLoading: isPortalLoading } = useModuleBillingPortal()

  // Check if user can manage billing
  const canManage = role === 'owner' || role === 'admin'

  // Handle Stripe callback notifications
  useEffect(() => {
    if (search.success) {
      toast({
        title: 'Abonnement active avec succes !',
        description: 'Votre module Pro est maintenant actif.',
      })
      refetch()
    } else if (search.canceled) {
      toast({
        title: 'Paiement annule',
        description: 'Vous pouvez reprendre a tout moment.',
      })
    }
  }, [search.success, search.canceled, refetch])

  // Calculate totals
  const activeModules = modules.filter(m => m.isPaid && m.status === 'active')
  const totalMonthly = activeModules.reduce((sum, m) => {
    const price = m.billingCycle === 'yearly' ? Math.round(m.priceYearly / 12) : m.priceMonthly
    return sum + price
  }, 0)

  // Handlers
  const handleSubscribe = async (moduleId: ModuleId) => {
    if (!organization?.id) return

    setSubscribingModule(moduleId)
    try {
      await subscribe({
        organizationId: organization.id,
        moduleId,
        billingCycle,
      })
    } catch (error) {
      toast({
        title: 'Erreur lors de la souscription',
        description: 'Veuillez reessayer plus tard.',
        variant: 'destructive',
      })
    } finally {
      setSubscribingModule(null)
    }
  }

  const handleCancel = async (moduleId: ModuleId) => {
    if (!organization?.id) return

    setCancelingModule(moduleId)
    try {
      const result = await cancel({
        organizationId: organization.id,
        moduleId,
      })

      if (result.success) {
        toast({
          title: 'Abonnement annule',
          description: 'Vous conservez l\'acces jusqu\'a la fin de la periode.',
        })
        refetch()
      } else {
        throw new Error('Cancel failed')
      }
    } catch (error) {
      toast({
        title: 'Erreur lors de l\'annulation',
        description: 'Veuillez reessayer plus tard.',
        variant: 'destructive',
      })
    } finally {
      setCancelingModule(null)
    }
  }

  const handleResume = async (moduleId: ModuleId) => {
    if (!organization?.id) return

    setResumingModule(moduleId)
    try {
      const result = await resume({
        organizationId: organization.id,
        moduleId,
      })

      if (result.success) {
        toast({
          title: 'Abonnement repris',
          description: 'Votre abonnement continuera normalement.',
        })
        refetch()
      } else {
        throw new Error('Resume failed')
      }
    } catch (error) {
      toast({
        title: 'Erreur lors de la reprise',
        description: 'Veuillez reessayer plus tard.',
        variant: 'destructive',
      })
    } finally {
      setResumingModule(null)
    }
  }

  const handleManagePortal = async () => {
    if (!organization?.id) return

    try {
      await openPortal(organization.id)
    } catch (error) {
      toast({
        title: 'Erreur d\'ouverture du portail',
        description: 'Veuillez reessayer plus tard.',
        variant: 'destructive',
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with total */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Mes Modules
              </CardTitle>
              <CardDescription className="mt-1">
                Gerez vos abonnements aux modules Sedona
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total mensuel</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(totalMonthly)}€<span className="text-sm font-normal text-muted-foreground">/mois</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Billing cycle toggle */}
            <div className="inline-flex items-center rounded-lg bg-muted p-1">
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  billingCycle === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setBillingCycle('monthly')}
              >
                Mensuel
              </button>
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  billingCycle === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setBillingCycle('yearly')}
              >
                Annuel
                <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                  -17%
                </Badge>
              </button>
            </div>

            {/* Manage all subscriptions button */}
            {activeModules.length > 0 && canManage && (
              <Button
                variant="outline"
                onClick={handleManagePortal}
                disabled={isPortalLoading}
              >
                {isPortalLoading ? 'Chargement...' : 'Gerer la facturation'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modules grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const metadata = MODULE_METADATA[module.moduleId]
          if (!metadata) return null

          return (
            <ModuleCard
              key={module.moduleId}
              module={module}
              metadata={metadata}
              billingCycle={billingCycle}
              onSubscribe={() => handleSubscribe(module.moduleId)}
              onCancel={() => handleCancel(module.moduleId)}
              onResume={() => handleResume(module.moduleId)}
              onManage={handleManagePortal}
              isSubscribing={subscribingModule === module.moduleId}
              isCanceling={cancelingModule === module.moduleId}
              isResuming={resumingModule === module.moduleId}
              canManage={canManage}
            />
          )
        })}
      </div>

      {/* Compare all link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">Comparer les offres</h3>
              <p className="text-sm text-muted-foreground">
                Consultez le detail des fonctionnalites de chaque module
              </p>
            </div>
            <Link
              to="/settings/modules/compare"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Voir la comparaison complete
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Des questions sur nos modules ?{' '}
              <a href="mailto:support@sedona.ai" className="text-primary hover:underline">
                Contactez notre equipe
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
