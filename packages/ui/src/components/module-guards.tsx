// ===========================================
// MODULE GUARD COMPONENTS
// ===========================================
// Components to guard features based on module subscription status and limits

import * as React from 'react'
import { Lock, Sparkles, AlertTriangle, Zap } from 'lucide-react'

import { cn } from '../lib/utils'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Progress } from './progress'
import { Badge } from './badge'

// ===========================================
// TYPES
// ===========================================

export type ModuleId = 'crm' | 'invoice' | 'projects' | 'tickets' | 'hr' | 'docs' | 'analytics'

export interface ModuleInfo {
  id: ModuleId
  name: string
  priceMonthly: number // in euros
  description: string
}

// Module metadata for display
const MODULE_INFO: Record<ModuleId, ModuleInfo> = {
  crm: {
    id: 'crm',
    name: 'CRM',
    priceMonthly: 14.90,
    description: 'Gestion des contacts, entreprises et opportunites',
  },
  invoice: {
    id: 'invoice',
    name: 'Facturation',
    priceMonthly: 9.90,
    description: 'Devis, factures et suivi des paiements',
  },
  projects: {
    id: 'projects',
    name: 'Projets',
    priceMonthly: 12.90,
    description: 'Gestion de projets, taches et temps',
  },
  tickets: {
    id: 'tickets',
    name: 'Tickets',
    priceMonthly: 9.90,
    description: 'Support client et base de connaissances',
  },
  hr: {
    id: 'hr',
    name: 'RH',
    priceMonthly: 14.90,
    description: 'Gestion des employes, conges et documents',
  },
  docs: {
    id: 'docs',
    name: 'Documents',
    priceMonthly: 4.90,
    description: 'Stockage et partage de fichiers',
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    priceMonthly: 19.90,
    description: 'Tableaux de bord et rapports avances',
  },
}

// ===========================================
// ModulePaidGuard
// ===========================================

export interface ModulePaidGuardProps {
  /** The module ID to check */
  moduleId: ModuleId
  /** Whether the module is currently paid */
  isPaid: boolean
  /** Loading state */
  isLoading?: boolean
  /** Content to render when the module is paid */
  children: React.ReactNode
  /** Custom title for the upgrade card */
  title?: string
  /** Custom description for the upgrade card */
  description?: string
  /** Callback when upgrade button is clicked */
  onUpgrade?: () => void
  /** URL to redirect to for upgrade (default: /settings/billing) */
  upgradeUrl?: string
  /** Whether to completely hide content instead of blurring */
  hideContent?: boolean
}

/**
 * ModulePaidGuard - Guards content that requires a paid module subscription
 *
 * Usage:
 * ```tsx
 * <ModulePaidGuard moduleId="projects" isPaid={isPaid} onUpgrade={handleUpgrade}>
 *   <GanttChart />
 * </ModulePaidGuard>
 * ```
 */
export function ModulePaidGuard({
  moduleId,
  isPaid,
  isLoading = false,
  children,
  title,
  description,
  onUpgrade,
  upgradeUrl = '/settings/billing',
  hideContent = false,
}: ModulePaidGuardProps) {
  const moduleInfo = MODULE_INFO[moduleId]

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  // User has access - render children
  if (isPaid) {
    return <>{children}</>
  }

  // User doesn't have access - show masked content with overlay
  return (
    <div className="relative h-full min-h-[400px]">
      {/* Blurred/Hidden Content */}
      {!hideContent ? (
        <div className="blur-sm pointer-events-none select-none h-full opacity-50">
          {children}
        </div>
      ) : (
        <div className="h-full bg-muted/10" />
      )}

      {/* Upgrade Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
        <Card className="max-w-md mx-4 shadow-lg border-primary/20">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-2">
              {title || `Debloquer ${moduleInfo.name}`}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-4">
              {description || moduleInfo.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                {moduleInfo.priceMonthly.toFixed(2).replace('.', ',')}€
              </span>
              <span className="text-muted-foreground">/mois</span>
            </div>

            {/* Features */}
            <ul className="text-left text-sm space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Acces illimite aux fonctionnalites
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Limites etendues
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Support prioritaire
              </li>
            </ul>

            {/* Upgrade button */}
            {onUpgrade ? (
              <Button onClick={onUpgrade} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Debloquer {moduleInfo.name} - {moduleInfo.priceMonthly.toFixed(2).replace('.', ',')}€/mois
              </Button>
            ) : (
              <Button asChild className="w-full">
                <a href={upgradeUrl}>
                  <Lock className="h-4 w-4 mr-2" />
                  Debloquer {moduleInfo.name} - {moduleInfo.priceMonthly.toFixed(2).replace('.', ',')}€/mois
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===========================================
// ModuleLimitGuard
// ===========================================

export interface ModuleLimitGuardProps {
  /** The module ID */
  moduleId: ModuleId
  /** The limit key (e.g., 'max_contacts') */
  limitKey: string
  /** Current count/usage */
  currentCount: number
  /** Maximum limit (from subscription) */
  limit: number
  /** Whether the limit is unlimited (-1) */
  isUnlimited?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Content to render (typically a button) */
  children: React.ReactNode
  /** Callback when upgrade is requested */
  onUpgrade?: () => void
  /** Custom message when limit is reached */
  limitReachedMessage?: string
}

/**
 * ModuleLimitGuard - Disables children when a limit is reached
 *
 * Usage:
 * ```tsx
 * <ModuleLimitGuard
 *   moduleId="crm"
 *   limitKey="max_contacts"
 *   currentCount={87}
 *   limit={100}
 * >
 *   <CreateContactButton />
 * </ModuleLimitGuard>
 * ```
 */
export function ModuleLimitGuard({
  moduleId,
  limitKey,
  currentCount,
  limit,
  isUnlimited = false,
  isLoading = false,
  children,
  onUpgrade,
  limitReachedMessage,
}: ModuleLimitGuardProps) {
  const moduleInfo = MODULE_INFO[moduleId]
  const isAtLimit = !isUnlimited && currentCount >= limit

  // Loading state
  if (isLoading) {
    return (
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    )
  }

  // Within limit - render children normally
  if (!isAtLimit) {
    return <>{children}</>
  }

  // At limit - show disabled state with upgrade prompt
  return (
    <div className="space-y-2">
      {/* Disabled children */}
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>

      {/* Limit message */}
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span>
          {limitReachedMessage ||
            `Limite atteinte (${currentCount}/${limit}). Passez a la version payante.`}
        </span>
        {onUpgrade && (
          <Button variant="link" size="sm" onClick={onUpgrade} className="h-auto p-0">
            Passer a {moduleInfo.name} Pro
          </Button>
        )}
      </div>
    </div>
  )
}

// ===========================================
// ModuleLimitBanner
// ===========================================

export interface ModuleLimitBannerProps {
  /** The module ID */
  moduleId: ModuleId
  /** The limit key */
  limitKey: string
  /** Current count/usage */
  currentCount: number
  /** Maximum limit */
  limit: number
  /** Whether the limit is unlimited */
  isUnlimited?: boolean
  /** Callback when upgrade is requested */
  onUpgrade?: () => void
  /** Threshold percentage to show warning (default: 80) */
  warningThreshold?: number
  /** Custom label for what is being limited (e.g., "contacts", "factures") */
  itemLabel?: string
  /** Custom class name */
  className?: string
}

/**
 * ModuleLimitBanner - Shows a warning banner when approaching limits
 *
 * Usage:
 * ```tsx
 * <ModuleLimitBanner
 *   moduleId="crm"
 *   limitKey="max_contacts"
 *   currentCount={85}
 *   limit={100}
 *   itemLabel="contacts"
 * />
 * ```
 */
export function ModuleLimitBanner({
  moduleId,
  limitKey,
  currentCount,
  limit,
  isUnlimited = false,
  onUpgrade,
  warningThreshold = 80,
  itemLabel,
  className,
}: ModuleLimitBannerProps) {
  // Don't show for unlimited
  if (isUnlimited || limit === -1) {
    return null
  }

  const percentage = Math.min(100, (currentCount / limit) * 100)
  const isNearLimit = percentage >= warningThreshold
  const isAtLimit = currentCount >= limit

  // Don't show if not near limit
  if (!isNearLimit) {
    return null
  }

  const moduleInfo = MODULE_INFO[moduleId]
  const remaining = Math.max(0, limit - currentCount)

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-4 rounded-lg border',
        isAtLimit
          ? 'bg-destructive/10 border-destructive/20'
          : 'bg-warning/10 border-warning/20',
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={cn(
          'p-2 rounded-full',
          isAtLimit ? 'bg-destructive/20' : 'bg-warning/20'
        )}>
          <AlertTriangle className={cn(
            'h-4 w-4',
            isAtLimit ? 'text-destructive' : 'text-warning'
          )} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium">
            {isAtLimit
              ? `Limite de ${itemLabel || limitKey} atteinte`
              : `Vous approchez de la limite de ${itemLabel || limitKey}`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Progress
              value={percentage}
              className={cn(
                'h-2 flex-1 max-w-[200px]',
                isAtLimit ? '[&>div]:bg-destructive' : '[&>div]:bg-warning'
              )}
            />
            <span className="text-xs text-muted-foreground">
              {currentCount}/{limit} ({remaining} restant{remaining > 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </div>

      {onUpgrade && (
        <Button
          variant={isAtLimit ? 'destructive' : 'warning'}
          size="sm"
          onClick={onUpgrade}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Passer a {moduleInfo.name} Pro
        </Button>
      )}
    </div>
  )
}

// ===========================================
// ModuleStatusBadge
// ===========================================

export interface ModuleStatusBadgeProps {
  /** Whether the module is paid */
  isPaid: boolean
  /** Size variant */
  size?: 'sm' | 'default'
  /** Custom class name */
  className?: string
}

/**
 * ModuleStatusBadge - Shows FREE or PRO badge for a module
 *
 * Usage:
 * ```tsx
 * <ModuleStatusBadge isPaid={isPaid} />
 * ```
 */
export function ModuleStatusBadge({
  isPaid,
  size = 'default',
  className,
}: ModuleStatusBadgeProps) {
  return (
    <Badge
      variant={isPaid ? 'default' : 'secondary'}
      className={cn(
        isPaid
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground',
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
    >
      {isPaid ? 'PRO' : 'FREE'}
    </Badge>
  )
}
