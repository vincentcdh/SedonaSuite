// ===========================================
// SUBSCRIPTION SUMMARY WIDGET
// ===========================================
// Shows a summary of active module subscriptions

import { Link } from '@tanstack/react-router'
import { Boxes, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, Badge, cn } from '@sedona/ui'
import { useModuleSubscriptions } from '@sedona/billing'
import { useOrganization } from '@/lib/auth'

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

// ===========================================
// COMPONENT
// ===========================================

export function SubscriptionSummary() {
  const { organization } = useOrganization()
  const { modules, isLoading } = useModuleSubscriptions(organization?.id)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalModules = modules.length
  const paidModules = modules.filter((m) => m.isPaid && m.status === 'active')
  const totalMonthly = paidModules.reduce((sum, m) => {
    const price = m.billingCycle === 'yearly' ? Math.round(m.priceYearly / 12) : m.priceMonthly
    return sum + price
  }, 0)

  const hasPastDue = modules.some((m) => m.status === 'past_due')
  const hasCancellation = modules.some((m) => m.cancelAtPeriodEnd)

  return (
    <Link to="/settings/modules" search={{}} className="block group">
      <Card
        className={cn(
          'transition-all hover:border-primary/50 hover:shadow-sm',
          hasPastDue && 'border-destructive/50',
          hasCancellation && !hasPastDue && 'border-orange-500/50'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2.5 rounded-lg',
                  paidModules.length > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {paidModules.length} module{paidModules.length !== 1 ? 's' : ''} Pro
                  </span>
                  <span className="text-xs text-muted-foreground">sur {totalModules}</span>
                  {hasPastDue && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Paiement requis
                    </Badge>
                  )}
                  {hasCancellation && !hasPastDue && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-500 text-orange-500">
                      Annulation prevue
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paidModules.length > 0 ? (
                    <>
                      <span className="font-medium text-foreground">{formatPrice(totalMonthly)}€</span>
                      /mois
                    </>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Passez a Pro pour debloquer plus
                    </span>
                  )}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
