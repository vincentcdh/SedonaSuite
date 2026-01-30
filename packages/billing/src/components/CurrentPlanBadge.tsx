import { type FC } from 'react'
import { Badge } from '@sedona/ui'
import { PLANS, type PlanId } from '../server/plans'

export interface CurrentPlanBadgeProps {
  planId: PlanId
  showUpgrade?: boolean
  onUpgrade?: () => void
  className?: string
}

const planColors: Record<PlanId, string> = {
  FREE: 'bg-muted text-muted-foreground',
  PRO: 'bg-primary text-primary-foreground',
  ENTERPRISE: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
}

export const CurrentPlanBadge: FC<CurrentPlanBadgeProps> = ({
  planId,
  showUpgrade = false,
  onUpgrade,
  className,
}) => {
  const plan = PLANS[planId]

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Badge className={planColors[planId]}>Plan {plan.name}</Badge>
      {showUpgrade && planId === 'FREE' && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="text-xs text-primary hover:underline"
        >
          Upgrader
        </button>
      )}
    </div>
  )
}
