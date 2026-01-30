import { type FC, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@sedona/ui'
import { PLANS, formatPrice, type PlanId, type BillingInterval } from '../server/plans'

export interface PricingTableProps {
  currentPlan?: PlanId
  onSelectPlan?: (planId: PlanId, interval: BillingInterval) => void
  isLoading?: boolean
  showFree?: boolean
}

export const PricingTable: FC<PricingTableProps> = ({
  currentPlan = 'FREE',
  onSelectPlan,
  isLoading = false,
  showFree = true,
}) => {
  const [interval, setInterval] = useState<BillingInterval>('month')

  const plans = Object.values(PLANS).filter((plan) => showFree || plan.id !== 'FREE')

  return (
    <div className="space-y-8">
      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-muted p-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              interval === 'month'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setInterval('month')}
          >
            Mensuel
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              interval === 'year'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setInterval('year')}
          >
            Annuel
            <Badge variant="secondary" className="ml-2 text-xs">
              -17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price =
            interval === 'month' ? plan.prices.monthly?.amount : plan.prices.yearly?.amount
          const isCurrentPlan = currentPlan === plan.id
          const isFree = plan.id === 'FREE'
          const canUpgrade = !isFree && !isCurrentPlan

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.highlighted ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Recommande
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrentPlan && (
                    <Badge variant="outline">Plan actuel</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  {price ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">
                        {formatPrice(price)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{interval === 'month' ? 'mois' : 'an'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold">Gratuit</div>
                  )}
                  {interval === 'year' && plan.prices.yearly?.savings && (
                    <p className="text-sm text-success mt-1">
                      Economisez {plan.prices.yearly.savings}%
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                {canUpgrade ? (
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => onSelectPlan?.(plan.id, interval)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Chargement...' : 'Passer a ' + plan.name}
                  </Button>
                ) : isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Plan gratuit
                  </Button>
                )}

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? '' : 'text-muted-foreground'
                        }
                      >
                        {feature.name}
                        {feature.limit && feature.limit !== 'unlimited' && (
                          <span className="text-muted-foreground">
                            {' '}
                            ({feature.limit})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
