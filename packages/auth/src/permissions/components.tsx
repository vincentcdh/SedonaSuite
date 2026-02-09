// ===========================================
// PERMISSION UI COMPONENTS
// ===========================================

import type { ReactNode } from 'react'
import { usePermissions, useCanPerform, usePlanLimit, useHasFeature } from './index'
import type { AppModule, PermissionAction, PlanLimitName, PlanFeature } from '../types'

// ===========================================
// PERMISSION GUARD
// ===========================================

interface PermissionGuardProps {
  children: ReactNode
  module: AppModule
  action: PermissionAction
  fallback?: ReactNode
}

/**
 * Affiche le contenu uniquement si l'utilisateur a la permission requise
 */
export function PermissionGuard({
  children,
  module,
  action,
  fallback = null,
}: PermissionGuardProps) {
  const hasPermission = useCanPerform(module, action)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ===========================================
// ROLE GUARD
// ===========================================

interface RoleGuardProps {
  children: ReactNode
  roles: ('owner' | 'manager' | 'employee')[]
  fallback?: ReactNode
}

/**
 * Affiche le contenu uniquement si l'utilisateur a l'un des rôles requis
 */
export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { role } = usePermissions()

  if (!roles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ===========================================
// FEATURE GUARD
// ===========================================

interface FeatureGuardProps {
  children: ReactNode
  feature: PlanFeature
  fallback?: ReactNode
}

/**
 * Affiche le contenu uniquement si la fonctionnalité est disponible dans le plan
 */
export function FeatureGuard({ children, feature, fallback = null }: FeatureGuardProps) {
  const hasFeature = useHasFeature(feature)

  if (!hasFeature) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ===========================================
// PLAN LIMIT BANNER
// ===========================================

interface PlanLimitBannerProps {
  limitName: PlanLimitName
  currentCount: number
  warningThreshold?: number // Pourcentage (0-100) à partir duquel afficher un avertissement
  entityName: string // Ex: "contacts", "projets"
  className?: string
  onUpgrade?: () => void
}

/**
 * Affiche une bannière d'avertissement quand une limite est proche ou atteinte
 */
export function PlanLimitBanner({
  limitName,
  currentCount,
  warningThreshold = 80,
  entityName,
  className = '',
  onUpgrade,
}: PlanLimitBannerProps) {
  const limitResult = usePlanLimit(limitName, currentCount)

  // Si illimité, ne rien afficher
  if (limitResult.unlimited) {
    return null
  }

  const limit = limitResult.limit!
  const percentage = (currentCount / limit) * 100

  // Si sous le seuil d'avertissement, ne rien afficher
  if (percentage < warningThreshold) {
    return null
  }

  const isAtLimit = !limitResult.allowed
  const remaining = limitResult.remaining || 0

  return (
    <div
      className={`rounded-lg border p-4 ${
        isAtLimit
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-yellow-200 bg-yellow-50 text-yellow-800'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {isAtLimit
              ? `Limite atteinte: ${currentCount}/${limit} ${entityName}`
              : `Attention: ${currentCount}/${limit} ${entityName} utilises`}
          </p>
          <p className="text-sm opacity-80">
            {isAtLimit
              ? `Passez au plan superieur pour creer plus de ${entityName}.`
              : `Il vous reste ${remaining} ${entityName} disponibles.`}
          </p>
        </div>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isAtLimit
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            Passer au PRO
          </button>
        )}
      </div>
    </div>
  )
}

// ===========================================
// LOCKED FEATURE
// ===========================================

interface LockedFeatureProps {
  feature: PlanFeature
  title: string
  description?: string
  requiredPlan?: 'PRO' | 'ENTERPRISE'
  className?: string
  onUpgrade?: () => void
}

/**
 * Affiche un message pour une fonctionnalité verrouillée
 */
export function LockedFeature({
  feature,
  title,
  description,
  requiredPlan = 'PRO',
  className = '',
  onUpgrade,
}: LockedFeatureProps) {
  const hasFeature = useHasFeature(feature)

  // Si la fonctionnalité est disponible, ne rien afficher
  if (hasFeature) {
    return null
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50 p-6 text-center ${className}`}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
        <svg
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
      <p className="mt-3 text-sm font-medium text-primary">
        Disponible avec le plan {requiredPlan}
      </p>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Passer au {requiredPlan}
        </button>
      )}
    </div>
  )
}

// ===========================================
// LIMITED BUTTON
// ===========================================

interface LimitedButtonProps {
  children: ReactNode
  limitName: PlanLimitName
  currentCount: number
  onClick?: () => void
  onLimitReached?: () => void
  className?: string
  disabled?: boolean
}

/**
 * Bouton qui se désactive automatiquement quand une limite est atteinte
 */
export function LimitedButton({
  children,
  limitName,
  currentCount,
  onClick,
  onLimitReached,
  className = '',
  disabled = false,
}: LimitedButtonProps) {
  const limitResult = usePlanLimit(limitName, currentCount)
  const isDisabled = disabled || !limitResult.allowed

  const handleClick = () => {
    if (!limitResult.allowed) {
      onLimitReached?.()
      return
    }
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`rounded-lg px-4 py-2 font-medium transition-colors ${
        isDisabled
          ? 'cursor-not-allowed bg-gray-200 text-gray-500'
          : 'bg-primary text-white hover:bg-primary/90'
      } ${className}`}
    >
      {children}
    </button>
  )
}

// ===========================================
// NO PERMISSION MESSAGE
// ===========================================

interface NoPermissionProps {
  module?: AppModule
  action?: PermissionAction
  message?: string
  className?: string
}

/**
 * Message affiché quand l'utilisateur n'a pas la permission requise
 */
export function NoPermission({
  module,
  action,
  message,
  className = '',
}: NoPermissionProps) {
  const defaultMessage =
    module && action
      ? `Vous n'avez pas la permission de ${getActionLabel(action)} dans ce module.`
      : "Vous n'avez pas la permission d'effectuer cette action."

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-4 text-center ${className}`}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-5 w-5 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-800">{message || defaultMessage}</p>
      <p className="mt-1 text-xs text-red-600">
        Contactez votre administrateur pour obtenir les droits necessaires.
      </p>
    </div>
  )
}

// ===========================================
// HELPERS
// ===========================================

function getActionLabel(action: PermissionAction): string {
  const labels: Record<PermissionAction, string> = {
    view: 'consulter',
    create: 'creer',
    edit: 'modifier',
    delete: 'supprimer',
    export: 'exporter',
    manage_team: "gerer l'equipe",
    approve: 'approuver',
    send: 'envoyer',
    view_financial: 'voir les donnees financieres',
    manage_settings: 'gerer les parametres',
  }
  return labels[action] || action
}

// ===========================================
// EXPORTS
// ===========================================

export type {
  PermissionGuardProps,
  RoleGuardProps,
  FeatureGuardProps,
  PlanLimitBannerProps,
  LockedFeatureProps,
  LimitedButtonProps,
  NoPermissionProps,
}
