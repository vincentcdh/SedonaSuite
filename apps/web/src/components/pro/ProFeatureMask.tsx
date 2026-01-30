// ===========================================
// PRO FEATURE MASK COMPONENT
// ===========================================
// Reusable component to mask PRO features for FREE users
// Shows blurred content with upgrade overlay

import { type FC, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Lock, Sparkles, type LucideIcon } from 'lucide-react'
import { Button, Card, CardContent } from '@sedona/ui'
import { usePlan, type PlanType } from '@/hooks/usePlan'

export interface ProFeature {
  icon: LucideIcon
  label: string
}

export interface ProFeatureMaskProps {
  /**
   * The content to display (will be blurred for non-PRO users)
   */
  children: ReactNode

  /**
   * Minimum required plan to access this feature
   * @default 'PRO'
   */
  requiredPlan?: PlanType

  /**
   * Title shown in the upgrade card
   */
  title?: string

  /**
   * Description shown in the upgrade card
   */
  description?: string

  /**
   * List of features to highlight in the upgrade card
   */
  features?: ProFeature[]

  /**
   * If true, completely hides content instead of blurring
   * @default false
   */
  hideContent?: boolean
}

/**
 * ProFeatureMask - Wraps content that requires a PRO subscription
 *
 * Usage:
 * ```tsx
 * <ProFeatureMask
 *   title="Fonctionnalité PRO"
 *   description="Accédez aux automatisations avancées"
 *   features={[
 *     { icon: Zap, label: 'Auto-assignation' },
 *     { icon: Mail, label: 'Réponses automatiques' },
 *   ]}
 * >
 *   <YourActualContent />
 * </ProFeatureMask>
 * ```
 */
export const ProFeatureMask: FC<ProFeatureMaskProps> = ({
  children,
  requiredPlan = 'PRO',
  title = 'Fonctionnalité PRO',
  description = 'Cette fonctionnalité est disponible avec le plan PRO.',
  features = [],
  hideContent = false,
}) => {
  const { hasAccess } = usePlan()

  // If user has access, render children normally
  if (hasAccess(requiredPlan)) {
    return <>{children}</>
  }

  // User doesn't have access - show masked content with overlay
  return (
    <div className="relative h-full">
      {/* Blurred/Hidden Content */}
      {!hideContent ? (
        <div className="blur-sm pointer-events-none select-none h-full">
          {children}
        </div>
      ) : (
        <div className="h-full bg-muted/20" />
      )}

      {/* PRO Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <Card className="max-w-md mx-4 shadow-lg border-primary/20">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-2">{title}</h2>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{description}</p>

            {/* Features list */}
            {features.length > 0 && (
              <ul className="text-left text-sm space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <feature.icon className="h-4 w-4 text-primary" />
                    {feature.label}
                  </li>
                ))}
              </ul>
            )}

            {/* Upgrade button */}
            <Button asChild className="w-full">
              <Link to="/settings/billing">
                <Lock className="h-4 w-4 mr-2" />
                Passer au plan {requiredPlan}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Shorthand component for PRO-only features
 */
export const ProOnly: FC<Omit<ProFeatureMaskProps, 'requiredPlan'>> = (props) => (
  <ProFeatureMask {...props} requiredPlan="PRO" />
)

/**
 * Shorthand component for ENTERPRISE-only features
 */
export const EnterpriseOnly: FC<Omit<ProFeatureMaskProps, 'requiredPlan'>> = (
  props
) => <ProFeatureMask {...props} requiredPlan="ENTERPRISE" />
