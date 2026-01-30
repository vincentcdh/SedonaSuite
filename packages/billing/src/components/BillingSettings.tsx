import { type FC } from 'react'
import { CreditCard, Receipt, AlertTriangle } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@sedona/ui'
import { PLANS, formatPrice, type PlanId } from '../server/plans'
import type { Subscription } from '../hooks/useSubscription'

export interface BillingSettingsProps {
  subscription: Subscription | null
  onOpenPortal: () => void
  onUpgrade: () => void
  isLoading?: boolean
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const BillingSettings: FC<BillingSettingsProps> = ({
  subscription,
  onOpenPortal,
  onUpgrade,
  isLoading = false,
}) => {
  const plan = PLANS[subscription?.planId || 'FREE']
  const isFree = plan.id === 'FREE'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.cancelAtPeriodEnd

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Plan actuel
            {isPastDue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Paiement echoue
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Gerez votre abonnement et vos informations de facturation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>
              {!isFree && subscription && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {isCanceled ? (
                    <span className="text-warning">
                      Se termine le {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  ) : (
                    <span>
                      Prochain renouvellement le{' '}
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              {plan.prices.monthly && (
                <div className="text-2xl font-bold">
                  {formatPrice(plan.prices.monthly.amount, 'month')}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {isFree ? (
              <Button onClick={onUpgrade} disabled={isLoading}>
                Passer a Pro
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onOpenPortal} disabled={isLoading}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gerer l'abonnement
                </Button>
                {!isCanceled && (
                  <Button variant="outline" onClick={onUpgrade} disabled={isLoading}>
                    Changer de plan
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {!isFree && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Moyen de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium">**** **** **** 4242</p>
                  <p className="text-sm text-muted-foreground">Expire 12/25</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onOpenPortal}>
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      {!isFree && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Consultez et telechargez vos factures depuis le portail de facturation.
            </div>
            <Button variant="link" className="px-0 mt-2" onClick={onOpenPortal}>
              Voir les factures
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
