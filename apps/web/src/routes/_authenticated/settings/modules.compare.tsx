import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  cn,
  toast,
} from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import {
  useModuleSubscriptions,
  useSubscribeToModule,
  type ModuleId,
  type ModuleBillingCycle,
} from '@sedona/billing'
import { useState } from 'react'
import {
  Check,
  X,
  ArrowLeft,
  Users,
  FileText,
  Briefcase,
  TicketIcon,
  UserCog,
  FolderOpen,
  BarChart3,
  Sparkles,
} from 'lucide-react'

// ===========================================
// ROUTE CONFIGURATION
// ===========================================

export const Route = createFileRoute('/_authenticated/settings/modules/compare')({
  component: ModulesComparisonPage,
})

// ===========================================
// MODULE COMPARISON DATA
// ===========================================

interface ModuleFeature {
  name: string
  free: boolean | string
  paid: boolean | string
}

interface ModuleComparison {
  id: ModuleId
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  priceMonthly: number // in cents
  priceYearly: number // in cents
  features: ModuleFeature[]
}

const MODULE_COMPARISONS: ModuleComparison[] = [
  {
    id: 'crm',
    name: 'CRM',
    icon: Users,
    color: 'bg-blue-500',
    priceMonthly: 1490,
    priceYearly: 14900,
    features: [
      { name: 'Contacts', free: '100', paid: 'Illimite' },
      { name: 'Entreprises', free: '50', paid: 'Illimite' },
      { name: 'Opportunites', free: '10', paid: 'Illimite' },
      { name: 'Import CSV', free: true, paid: true },
      { name: 'Export avance', free: false, paid: true },
      { name: 'Champs personnalises', free: false, paid: true },
      { name: 'Historique des activites', free: '30 jours', paid: 'Illimite' },
      { name: 'Tags et segments', free: '5 tags', paid: 'Illimite' },
      { name: 'Pipelines personnalises', free: '1', paid: 'Illimite' },
      { name: 'Automatisations', free: false, paid: true },
    ],
  },
  {
    id: 'invoice',
    name: 'Facturation',
    icon: FileText,
    color: 'bg-green-500',
    priceMonthly: 990,
    priceYearly: 9900,
    features: [
      { name: 'Factures par mois', free: '10', paid: 'Illimite' },
      { name: 'Devis par mois', free: '5', paid: 'Illimite' },
      { name: 'Clients', free: '25', paid: 'Illimite' },
      { name: 'Produits/Services', free: '20', paid: 'Illimite' },
      { name: 'Export PDF', free: true, paid: true },
      { name: 'Modeles personnalises', free: '1', paid: 'Illimite' },
      { name: 'Rappels automatiques', free: false, paid: true },
      { name: 'Paiement en ligne', free: false, paid: true },
      { name: 'Multi-devises', free: false, paid: true },
      { name: 'Factures recurrentes', free: false, paid: true },
    ],
  },
  {
    id: 'projects',
    name: 'Projets',
    icon: Briefcase,
    color: 'bg-purple-500',
    priceMonthly: 1290,
    priceYearly: 12900,
    features: [
      { name: 'Projets actifs', free: '3', paid: 'Illimite' },
      { name: 'Taches par projet', free: '50', paid: 'Illimite' },
      { name: 'Vue Liste', free: true, paid: true },
      { name: 'Vue Kanban', free: false, paid: true },
      { name: 'Vue Gantt', free: false, paid: true },
      { name: 'Suivi du temps', free: false, paid: true },
      { name: 'Budgets', free: false, paid: true },
      { name: 'Jalons', free: false, paid: true },
      { name: 'Dependances de taches', free: false, paid: true },
      { name: 'Rapports de projet', free: false, paid: true },
    ],
  },
  {
    id: 'tickets',
    name: 'Tickets',
    icon: TicketIcon,
    color: 'bg-orange-500',
    priceMonthly: 990,
    priceYearly: 9900,
    features: [
      { name: 'Tickets par mois', free: '50', paid: 'Illimite' },
      { name: 'Boites de reception', free: '1', paid: 'Illimite' },
      { name: 'Email de base', free: true, paid: true },
      { name: 'Chat en direct', free: false, paid: true },
      { name: 'Base de connaissances', free: false, paid: true },
      { name: 'Reponses automatiques', free: false, paid: true },
      { name: 'SLA', free: false, paid: true },
      { name: 'Rapports de support', free: false, paid: true },
      { name: 'Satisfaction client', free: false, paid: true },
      { name: 'Multi-canaux', free: false, paid: true },
    ],
  },
  {
    id: 'hr',
    name: 'RH',
    icon: UserCog,
    color: 'bg-pink-500',
    priceMonthly: 1490,
    priceYearly: 14900,
    features: [
      { name: 'Employes', free: '5', paid: 'Illimite' },
      { name: 'Fiches employes', free: true, paid: true },
      { name: 'Demandes de conges', free: true, paid: true },
      { name: 'Types de conges personnalises', free: '3', paid: 'Illimite' },
      { name: 'Documents RH', free: false, paid: true },
      { name: 'Onboarding', free: false, paid: true },
      { name: 'Evaluations', free: false, paid: true },
      { name: 'Rapports RH', free: false, paid: true },
      { name: 'Organigramme', free: false, paid: true },
      { name: 'Signature electronique', free: false, paid: true },
    ],
  },
  {
    id: 'docs',
    name: 'Documents',
    icon: FolderOpen,
    color: 'bg-yellow-500',
    priceMonthly: 490,
    priceYearly: 4900,
    features: [
      { name: 'Stockage', free: '1 Go', paid: '100 Go' },
      { name: 'Taille max par fichier', free: '10 Mo', paid: '500 Mo' },
      { name: 'Apercu fichiers', free: true, paid: true },
      { name: 'Partage basique', free: true, paid: true },
      { name: 'Partage avec mot de passe', free: false, paid: true },
      { name: 'Historique des versions', free: false, paid: true },
      { name: 'Signatures electroniques', free: false, paid: true },
      { name: 'Modeles de documents', free: false, paid: true },
      { name: 'Integration Google Drive', free: false, paid: true },
      { name: 'API acces', free: false, paid: true },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    color: 'bg-indigo-500',
    priceMonthly: 1990,
    priceYearly: 19900,
    features: [
      { name: 'Tableaux de bord', free: '3', paid: 'Illimite' },
      { name: 'Rapports basiques', free: true, paid: true },
      { name: 'Export PDF', free: true, paid: true },
      { name: 'Rapports personnalises', free: false, paid: true },
      { name: 'Widgets personnalises', free: false, paid: true },
      { name: 'IA predictive', free: false, paid: true },
      { name: 'Alertes automatiques', free: false, paid: true },
      { name: 'API exports', free: false, paid: true },
      { name: 'Rapports planifies', free: false, paid: true },
      { name: 'White-label', free: false, paid: true },
    ],
  },
]

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )
  }
  return <span className="text-sm">{value}</span>
}

// ===========================================
// MAIN PAGE COMPONENT
// ===========================================

function ModulesComparisonPage() {
  const { organization, role } = useOrganization()
  const [billingCycle, setBillingCycle] = useState<ModuleBillingCycle>('monthly')
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(null)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const { modules, isLoading } = useModuleSubscriptions(organization?.id)
  const { subscribe } = useSubscribeToModule()

  const canManage = role === 'owner' || role === 'admin'

  const handleSubscribe = async (moduleId: ModuleId) => {
    if (!organization?.id || !canManage) return

    setSelectedModule(moduleId)
    setIsSubscribing(true)

    try {
      await subscribe({
        organizationId: organization.id,
        moduleId,
        billingCycle,
      })
    } catch (error) {
      toast({
        title: 'Erreur lors de la souscription',
        variant: 'destructive',
      })
    } finally {
      setIsSubscribing(false)
      setSelectedModule(null)
    }
  }

  const isModulePaid = (moduleId: ModuleId): boolean => {
    const module = modules.find(m => m.moduleId === moduleId)
    return module?.isPaid || false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/settings/modules">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Comparaison des offres</h1>
          <p className="text-muted-foreground">
            Decouvrez les fonctionnalites de chaque module
          </p>
        </div>
      </div>

      {/* Billing toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Selectionnez votre cycle de facturation
            </p>
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
          </div>
        </CardContent>
      </Card>

      {/* Modules comparison tables */}
      <div className="space-y-8">
        {MODULE_COMPARISONS.map((module) => {
          const Icon = module.icon
          const price = billingCycle === 'yearly' ? module.priceYearly : module.priceMonthly
          const monthlyEquivalent = billingCycle === 'yearly'
            ? Math.round(module.priceYearly / 12)
            : module.priceMonthly
          const isPaid = isModulePaid(module.id)

          return (
            <Card key={module.id} className={cn(isPaid && 'border-primary/50')}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', module.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {module.name}
                        {isPaid && (
                          <Badge variant="default" className="bg-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Pro actif
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  {!isPaid && canManage && (
                    <Button
                      onClick={() => handleSubscribe(module.id)}
                      disabled={isSubscribing && selectedModule === module.id}
                    >
                      {isSubscribing && selectedModule === module.id
                        ? 'Chargement...'
                        : `Passer a Pro - ${formatPrice(monthlyEquivalent)}€/mois`}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Comparison table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Fonctionnalite</th>
                        <th className="text-center py-3 px-4 font-medium w-32">
                          <Badge variant="secondary">Gratuit</Badge>
                        </th>
                        <th className="text-center py-3 px-4 font-medium w-32">
                          <Badge variant="default" className="bg-primary">Pro</Badge>
                          <div className="text-xs font-normal text-muted-foreground mt-1">
                            {formatPrice(monthlyEquivalent)}€/mois
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {module.features.map((feature, idx) => (
                        <tr
                          key={feature.name}
                          className={cn(idx % 2 === 0 && 'bg-muted/30')}
                        >
                          <td className="py-3 px-4 text-sm">{feature.name}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureValue value={feature.free} />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureValue value={feature.paid} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Price summary */}
                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {billingCycle === 'yearly' && (
                      <span>Facture {formatPrice(price)}€/an soit </span>
                    )}
                    <span className="font-medium text-foreground">
                      {formatPrice(monthlyEquivalent)}€/mois
                    </span>
                  </div>
                  {!isPaid && canManage && (
                    <Button
                      variant="outline"
                      onClick={() => handleSubscribe(module.id)}
                      disabled={isSubscribing && selectedModule === module.id}
                    >
                      Commencer l'essai gratuit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Puis-je changer de plan a tout moment ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Oui, vous pouvez passer a Pro ou revenir au gratuit quand vous le souhaitez.
              Les changements prennent effet immediatement.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Que se passe-t-il si je depasse mes limites ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Vous serez averti et invite a passer a Pro. Vos donnees sont conservees
              mais certaines actions seront bloquees.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Y a-t-il un engagement ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Non, aucun engagement. Vous pouvez annuler a tout moment et continuer
              a utiliser le service jusqu'a la fin de la periode payee.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back link */}
      <div className="text-center">
        <Link to="/settings/modules" className="text-primary hover:underline">
          Retour a la gestion des modules
        </Link>
      </div>
    </div>
  )
}
