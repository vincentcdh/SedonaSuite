// ===========================================
// MODULE ALERTS BANNER
// ===========================================
// Shows alerts for module subscription issues in the header

import { Link } from '@tanstack/react-router'
import { AlertTriangle, CreditCard, Clock, X } from 'lucide-react'
import { Button, cn } from '@sedona/ui'
import { useModuleSubscriptions, type ModuleSubscription } from '@sedona/billing'
import { useOrganization } from '@/lib/auth'
import { useState } from 'react'

// ===========================================
// TYPES
// ===========================================

interface AlertInfo {
  type: 'past_due' | 'limit_warning' | 'cancellation'
  moduleId: string
  moduleName: string
  message: string
  linkText: string
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function getModuleAlerts(modules: ModuleSubscription[]): AlertInfo[] {
  const alerts: AlertInfo[] = []

  for (const module of modules) {
    // Check for past_due status
    if (module.status === 'past_due') {
      alerts.push({
        type: 'past_due',
        moduleId: module.moduleId,
        moduleName: module.name,
        message: `Paiement en retard pour le module ${module.name}. Mettez a jour votre moyen de paiement.`,
        linkText: 'Mettre a jour',
      })
    }

    // Check for scheduled cancellation
    if (module.cancelAtPeriodEnd && module.status === 'active') {
      alerts.push({
        type: 'cancellation',
        moduleId: module.moduleId,
        moduleName: module.name,
        message: `Le module ${module.name} sera desactive a la fin de la periode.`,
        linkText: 'Reprendre',
      })
    }

    // Check for approaching limits (>90%)
    if (!module.isPaid && module.usage && module.limits) {
      for (const [key, usage] of Object.entries(module.usage)) {
        const limit = module.limits[key]
        if (limit && limit > 0 && limit !== -1) {
          const percentage = (usage / limit) * 100
          if (percentage >= 90) {
            const limitLabel = key.replace('max_', '').replace(/_/g, ' ')
            alerts.push({
              type: 'limit_warning',
              moduleId: module.moduleId,
              moduleName: module.name,
              message: `${module.name}: ${usage}/${limit} ${limitLabel} utilises (${Math.round(percentage)}%)`,
              linkText: 'Passer a Pro',
            })
          }
        }
      }
    }
  }

  return alerts
}

// ===========================================
// COMPONENT
// ===========================================

export function ModuleAlertsBanner() {
  const { organization } = useOrganization()
  const { modules, isLoading } = useModuleSubscriptions(organization?.id)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  if (isLoading || !modules.length) {
    return null
  }

  const alerts = getModuleAlerts(modules).filter(
    (alert) => !dismissedAlerts.has(`${alert.type}-${alert.moduleId}`)
  )

  if (alerts.length === 0) {
    return null
  }

  // Show the most critical alert first (past_due > limit_warning > cancellation)
  const priorityOrder: Record<AlertInfo['type'], number> = { past_due: 0, limit_warning: 1, cancellation: 2 }
  const sortedAlerts = [...alerts].sort(
    (a, b) => priorityOrder[a.type] - priorityOrder[b.type]
  )
  const alert = sortedAlerts[0]!

  const handleDismiss = () => {
    setDismissedAlerts((prev) => new Set([...prev, `${alert.type}-${alert.moduleId}`]))
  }

  const bgColorMap: Record<AlertInfo['type'], string> = {
    past_due: 'bg-destructive text-destructive-foreground',
    limit_warning: 'bg-warning text-warning-foreground',
    cancellation: 'bg-orange-500 text-white',
  }
  const bgColor = bgColorMap[alert.type]

  const iconMap: Record<AlertInfo['type'], typeof CreditCard> = {
    past_due: CreditCard,
    limit_warning: AlertTriangle,
    cancellation: Clock,
  }
  const Icon = iconMap[alert.type]

  return (
    <div className={cn('flex items-center justify-between px-4 py-2', bgColor)}>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">{alert.message}</span>
        {alerts.length > 1 && (
          <span className="text-xs opacity-80">
            (+{alerts.length - 1} autre{alerts.length > 2 ? 's' : ''})
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link to="/settings/modules" search={{}}>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs bg-white/20 hover:bg-white/30 border-0"
          >
            {alert.linkText}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-white/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
