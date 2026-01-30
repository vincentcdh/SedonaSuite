import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
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
} from '@sedona/ui'
import { useOrganization } from '@/lib/auth'
import {
  Check,
  CreditCard,
  ExternalLink,
  Sparkles,
  Zap,
  Building,
  Download,
  Lock,
  Users,
  FileText,
  HardDrive,
  Briefcase,
} from 'lucide-react'
import { cn } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/settings/billing')({
  component: BillingSettingsPage,
})

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  highlighted?: boolean
  icon: React.ComponentType<{ className?: string }>
}

const plans: Plan[] = [
  {
    id: 'FREE',
    name: 'Gratuit',
    description: 'Pour demarrer et tester Sedona.AI',
    price: 0,
    interval: 'month',
    icon: Zap,
    features: [
      '100 contacts maximum',
      '5 factures par mois',
      '3 projets actifs',
      '1 utilisateur',
      'Support email',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Pour les TPE en croissance',
    price: 29,
    interval: 'month',
    icon: Sparkles,
    highlighted: true,
    features: [
      'Contacts illimites',
      'Factures illimitees',
      'Projets illimites',
      '5 utilisateurs',
      'Support prioritaire',
      'Analytics basique',
      'API access',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Pour les entreprises etablies',
    price: 99,
    interval: 'month',
    icon: Building,
    features: [
      'Tout illimite',
      'Utilisateurs illimites',
      'Support dedie',
      'SLA garanti',
      'SSO / SAML',
      'Analytics avance',
      'Integrations custom',
    ],
  },
]

function BillingSettingsPage() {
  const { organization } = useOrganization()
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const currentPlan = organization?.subscriptionPlan || 'FREE'

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId)
    try {
      // TODO: Implement Stripe checkout
      console.log('Upgrading to:', planId)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      // Redirect to Stripe checkout
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading('portal')
    try {
      // TODO: Implement Stripe customer portal redirect
      console.log('Opening customer portal')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to open portal:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const getPrice = (plan: Plan) => {
    if (billingInterval === 'year') {
      return Math.round(plan.price * 10) // 2 months free
    }
    return plan.price
  }

  // Mock usage data
  const usageLimits = [
    { label: 'Contacts', current: 87, max: 100, icon: Users },
    { label: 'Factures ce mois', current: 3, max: 10, icon: FileText },
    { label: 'Projets actifs', current: 2, max: 3, icon: Briefcase },
    { label: 'Stockage', current: 234, max: 1024, icon: HardDrive, unit: 'MB' },
  ]

  // Mock invoices
  const mockInvoices = [
    { id: 'inv_001', date: '2024-01-01', amount: 29, status: 'paid' },
    { id: 'inv_002', date: '2023-12-01', amount: 29, status: 'paid' },
    { id: 'inv_003', date: '2023-11-01', amount: 29, status: 'paid' },
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Plan actuel</CardTitle>
          <CardDescription>
            Gerez votre abonnement et votre facturation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    Plan {plans.find((p) => p.id === currentPlan)?.name}
                  </h3>
                  {currentPlan !== 'FREE' && (
                    <Badge variant="secondary">Actif</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === 'FREE'
                    ? 'Aucune carte bancaire requise'
                    : 'Prochain renouvellement le 1er du mois'}
                </p>
              </div>
            </div>
            {currentPlan !== 'FREE' && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isLoading === 'portal'}
              >
                {isLoading === 'portal' ? 'Chargement...' : 'Gerer la facturation'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Usage limits for FREE plan */}
          {currentPlan === 'FREE' && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Utilisation</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {usageLimits.map((limit) => {
                    const percent = Math.round((limit.current / limit.max) * 100)
                    const Icon = limit.icon
                    return (
                      <div key={limit.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{limit.label}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {limit.current}{limit.unit ? ` ${limit.unit}` : ''} / {limit.max}{limit.unit ? ` ${limit.unit}` : ''}
                          </span>
                        </div>
                        <Progress
                          value={percent}
                          className={cn('h-2', percent >= 90 && '[&>div]:bg-destructive')}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Besoin de plus ?</p>
                      <p className="text-xs text-muted-foreground">
                        Passez a PRO pour debloquer des limites illimitees
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleUpgrade('PRO')}>
                      Passer a PRO
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-muted p-1">
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              billingInterval === 'month'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setBillingInterval('month')}
          >
            Mensuel
          </button>
          <button
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              billingInterval === 'year'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setBillingInterval('year')}
          >
            Annuel
            <Badge variant="secondary" className="ml-2 text-xs">
              -17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan
          const price = getPrice(plan)

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden',
                plan.highlighted && 'border-primary shadow-lg'
              )}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Populaire
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      plan.highlighted ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <plan.icon
                      className={cn(
                        'h-5 w-5',
                        plan.highlighted ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}€</span>
                    <span className="text-muted-foreground">
                      /{billingInterval === 'year' ? 'an' : 'mois'}
                    </span>
                  </div>
                  {billingInterval === 'year' && plan.price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      soit {Math.round(price / 12)}€/mois
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : plan.highlighted ? 'default' : 'outline'}
                  disabled={isCurrentPlan || isLoading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isLoading === plan.id
                    ? 'Chargement...'
                    : isCurrentPlan
                      ? 'Plan actuel'
                      : plan.id === 'FREE'
                        ? 'Passer au gratuit'
                        : 'Passer a ce plan'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Billing History - PRO only */}
      {currentPlan !== 'FREE' ? (
        <Card>
          <CardHeader>
            <CardTitle>Historique de facturation</CardTitle>
            <CardDescription>
              Vos factures et paiements passes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {mockInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Facture {new Date(invoice.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{invoice.amount}€</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Paye
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <div>
                <p className="font-medium">Historique de facturation</p>
                <p className="text-sm">
                  L'historique de facturation est disponible avec un abonnement PRO
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method - PRO only */}
      {currentPlan !== 'FREE' && (
        <Card>
          <CardHeader>
            <CardTitle>Moyen de paiement</CardTitle>
            <CardDescription>
              Gerez votre carte bancaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Visa •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expire 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ or Help */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Des questions sur nos plans ?{' '}
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
