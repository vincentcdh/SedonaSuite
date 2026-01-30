import { type FC, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@sedona/ui'
import { PLANS, formatPrice, type PlanId, type BillingInterval } from '../server/plans'

export interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (planId: PlanId, interval: BillingInterval) => void
  isLoading?: boolean
  feature?: string
  suggestedPlan?: PlanId
}

export const UpgradeModal: FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  isLoading = false,
  feature,
  suggestedPlan = 'PRO',
}) => {
  const [interval, setInterval] = useState<BillingInterval>('month')
  const plan = PLANS[suggestedPlan]
  const price = interval === 'month' ? plan.prices.monthly?.amount : plan.prices.yearly?.amount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Passez a {plan.name}
          </DialogTitle>
          <DialogDescription>
            {feature
              ? `La fonctionnalite "${feature}" necessite un plan superieur.`
              : `Debloquez toutes les fonctionnalites de Sedona.AI.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interval Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-lg bg-muted p-1">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  interval === 'month'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setInterval('month')}
              >
                Mensuel
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  interval === 'year'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setInterval('year')}
              >
                Annuel (-17%)
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-bold">
              {price ? formatPrice(price) : 'Gratuit'}
            </div>
            <div className="text-muted-foreground">
              /{interval === 'month' ? 'mois' : 'an'}
            </div>
          </div>

          {/* Features Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium mb-2">Inclus dans {plan.name} :</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {plan.features
                .filter((f) => f.included)
                .slice(0, 5)
                .map((feature, index) => (
                  <li key={index}>- {feature.name}</li>
                ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={() => onUpgrade(suggestedPlan, interval)}
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Passer a ' + plan.name}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Annulez a tout moment. Satisfait ou rembourse 30 jours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
