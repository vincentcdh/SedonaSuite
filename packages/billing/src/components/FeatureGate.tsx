// ===========================================
// FEATURE GATE COMPONENT
// ===========================================
// Conditionally renders children based on paid feature availability
// Shows upgrade prompt when feature is not available

import React from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { useFeatureGuard, type FeatureGuardResult } from '../hooks/useFeatureGuards'
import type { ModuleId } from '../hooks/useModuleSubscriptions'

// ===========================================
// TYPES
// ===========================================

export interface FeatureGateProps {
  /** Organization ID */
  organizationId: string | undefined
  /** Module this feature belongs to */
  moduleId: ModuleId
  /** Feature key to check */
  feature: string
  /** Children to render when feature is available */
  children: React.ReactNode
  /** Optional fallback to render when feature is not available (instead of default prompt) */
  fallback?: React.ReactNode
  /** If true, renders children but disabled/grayed out instead of hiding */
  showDisabled?: boolean
  /** If true, renders nothing when feature is not available (no upgrade prompt) */
  hideWhenUnavailable?: boolean
  /** Custom upgrade message */
  upgradeMessage?: string
  /** Custom upgrade button text */
  upgradeButtonText?: string
  /** Custom upgrade link (defaults to /settings/modules) */
  upgradeLink?: string
}

export interface FeatureGateRenderProps {
  /** Organization ID */
  organizationId: string | undefined
  /** Module this feature belongs to */
  moduleId: ModuleId
  /** Feature key to check */
  feature: string
  /** Render function that receives feature guard result */
  children: (result: FeatureGuardResult) => React.ReactNode
}

// ===========================================
// FEATURE GATE COMPONENT
// ===========================================

/**
 * Conditionally renders children based on paid feature availability
 *
 * @example
 * <FeatureGate organizationId={orgId} moduleId="crm" feature="export_csv">
 *   <ExportButton />
 * </FeatureGate>
 */
export function FeatureGate({
  organizationId,
  moduleId,
  feature,
  children,
  fallback,
  showDisabled = false,
  hideWhenUnavailable = false,
  upgradeMessage,
  upgradeButtonText = 'Passer a Pro',
  upgradeLink = '/settings/modules',
}: FeatureGateProps): React.ReactElement | null {
  const result = useFeatureGuard(organizationId, moduleId, feature)

  // Loading state - show nothing or placeholder
  if (result.isLoading) {
    if (showDisabled) {
      return (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      )
    }
    return null
  }

  // Feature is available - render children
  if (result.isAvailable) {
    return <>{children}</>
  }

  // Feature not available - hide completely
  if (hideWhenUnavailable) {
    return null
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>
  }

  // Show disabled state
  if (showDisabled) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Pro</span>
          </div>
        </div>
      </div>
    )
  }

  // Default upgrade prompt
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {upgradeMessage || result.reason || 'Fonctionnalite Pro'}
          </p>
          <p className="text-xs text-muted-foreground">
            Debloquez cette fonctionnalite avec le plan Pro
          </p>
        </div>
      </div>
      <a href={upgradeLink}>
        <button className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          {upgradeButtonText}
        </button>
      </a>
    </div>
  )
}

// ===========================================
// FEATURE GATE RENDER PROPS
// ===========================================

/**
 * Render props version of FeatureGate for more control
 *
 * @example
 * <FeatureGateRender organizationId={orgId} moduleId="crm" feature="export_csv">
 *   {({ isAvailable, isPaid }) => (
 *     <button disabled={!isAvailable}>
 *       Export {!isAvailable && <Lock />}
 *     </button>
 *   )}
 * </FeatureGateRender>
 */
export function FeatureGateRender({
  organizationId,
  moduleId,
  feature,
  children,
}: FeatureGateRenderProps): React.ReactElement {
  const result = useFeatureGuard(organizationId, moduleId, feature)
  return <>{children(result)}</>
}

// ===========================================
// PRO BADGE COMPONENT
// ===========================================

export interface ProBadgeProps {
  /** Show only when feature is not available (i.e., user doesn't have Pro) */
  organizationId?: string | undefined
  moduleId?: ModuleId
  /** Custom class name */
  className?: string
}

/**
 * Small "Pro" badge to indicate a paid feature
 *
 * @example
 * <button>
 *   Export CSV <ProBadge organizationId={orgId} moduleId="crm" />
 * </button>
 */
export function ProBadge({
  organizationId,
  moduleId,
  className = '',
}: ProBadgeProps): React.ReactElement | null {
  // If no org/module provided, always show badge
  if (!organizationId || !moduleId) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded ${className}`}>
        PRO
      </span>
    )
  }

  const { isPaid, isLoading } = useFeatureGuard(organizationId, moduleId, '')

  if (isLoading) return null

  // Only show badge if user doesn't have Pro
  if (isPaid) return null

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded ${className}`}>
      PRO
    </span>
  )
}

// ===========================================
// LOCKED FEATURE ICON
// ===========================================

export interface LockedFeatureIconProps {
  organizationId: string | undefined
  moduleId: ModuleId
  feature: string
  /** Size of the lock icon */
  size?: 'sm' | 'md' | 'lg'
  /** Custom class name */
  className?: string
}

/**
 * Lock icon that only shows when a feature is not available
 */
export function LockedFeatureIcon({
  organizationId,
  moduleId,
  feature,
  size = 'sm',
  className = '',
}: LockedFeatureIconProps): React.ReactElement | null {
  const result = useFeatureGuard(organizationId, moduleId, feature)

  if (result.isLoading || result.isAvailable) {
    return null
  }

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <Lock className={`${sizeClasses[size]} text-muted-foreground ${className}`} />
  )
}
