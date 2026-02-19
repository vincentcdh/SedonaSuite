// ===========================================
// CROSS-MODULE LINK COMPONENT
// ===========================================
// Displays a link to an entity in another module
// Handles module availability and provides appropriate fallbacks

import { Link } from '@tanstack/react-router'
import { ExternalLink, Lock, AlertCircle } from 'lucide-react'
import { cn } from '@sedona/ui'
import {
  useCrossModuleEntityInfo,
  type CrossModuleEntityType,
} from '@sedona/billing'

// ===========================================
// TYPES
// ===========================================

interface CrossModuleLinkProps {
  /** Organization ID */
  organizationId: string
  /** Type of entity being linked */
  entityType: CrossModuleEntityType
  /** ID of the entity */
  entityId: string
  /** Display text (entity name, etc.) */
  children: React.ReactNode
  /** Optional additional class names */
  className?: string
  /** Show icon indicating cross-module link */
  showIcon?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

// ===========================================
// ROUTE MAPPINGS
// ===========================================

/**
 * Get the route path for an entity type
 */
function getEntityRoute(entityType: CrossModuleEntityType, entityId: string): string {
  switch (entityType) {
    // CRM
    case 'contact':
      return `/crm/contacts/${entityId}`
    case 'company':
      return `/crm/companies/${entityId}`
    case 'deal':
      return `/crm/deals/${entityId}`
    // Invoice
    case 'invoice':
      return `/invoice/invoices/${entityId}`
    case 'quote':
      return `/invoice/quotes/${entityId}`
    case 'client':
      return `/invoice/clients/${entityId}`
    // Projects
    case 'project':
      return `/projects/${entityId}`
    case 'task':
      return `/projects/tasks/${entityId}`
    // Tickets
    case 'ticket':
      return `/tickets/${entityId}`
    // HR
    case 'employee':
      return `/hr/employees/${entityId}`
    // Docs
    case 'file':
      return `/docs/files/${entityId}`
    case 'folder':
      return `/docs/folders/${entityId}`
    default:
      return '#'
  }
}

// ===========================================
// COMPONENT
// ===========================================

/**
 * CrossModuleLink - A link to an entity in another module
 *
 * Behavior:
 * - If module is available (free or paid) → normal clickable link
 * - If module is not available → text with title tooltip explaining why
 *
 * Since all modules have a free tier, the link should almost always be available.
 *
 * @example
 * // Link to a CRM contact from a ticket
 * <CrossModuleLink
 *   organizationId={orgId}
 *   entityType="contact"
 *   entityId={ticket.contactId}
 * >
 *   {ticket.contactName}
 * </CrossModuleLink>
 */
export function CrossModuleLink({
  organizationId,
  entityType,
  entityId,
  children,
  className,
  showIcon = false,
  size = 'md',
}: CrossModuleLinkProps) {
  const {
    moduleName,
    entityTypeName,
    isModuleAvailable,
    isLoading,
  } = useCrossModuleEntityInfo(organizationId, entityType)

  const route = getEntityRoute(entityType, entityId)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  // Loading state
  if (isLoading) {
    return (
      <span className={cn('text-muted-foreground animate-pulse', sizeClasses[size], className)}>
        {children}
      </span>
    )
  }

  // Module available - render normal link
  if (isModuleAvailable) {
    return (
      <Link
        to={route}
        className={cn(
          'text-primary hover:underline inline-flex items-center gap-1',
          sizeClasses[size],
          className
        )}
      >
        {children}
        {showIcon && <ExternalLink className="h-3 w-3 opacity-50" />}
      </Link>
    )
  }

  // Module not available - show text with title tooltip
  return (
    <span
      title={`Le module ${moduleName} n'est pas disponible. Impossible d'accéder à ce ${entityTypeName.toLowerCase()}.`}
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1 cursor-help',
        sizeClasses[size],
        className
      )}
    >
      {children}
      <AlertCircle className="h-3 w-3 text-amber-500" />
    </span>
  )
}

// ===========================================
// BADGE VARIANT
// ===========================================

interface CrossModuleBadgeProps extends Omit<CrossModuleLinkProps, 'size'> {
  /** Badge color variant */
  variant?: 'default' | 'outline' | 'secondary'
}

/**
 * CrossModuleBadge - A badge-style link to an entity in another module
 *
 * @example
 * <CrossModuleBadge
 *   organizationId={orgId}
 *   entityType="deal"
 *   entityId={project.dealId}
 *   variant="outline"
 * >
 *   Opportunité: {project.dealName}
 * </CrossModuleBadge>
 */
export function CrossModuleBadge({
  organizationId,
  entityType,
  entityId,
  children,
  className,
  variant = 'default',
}: CrossModuleBadgeProps) {
  const {
    moduleName,
    isModuleAvailable,
    isLoading,
  } = useCrossModuleEntityInfo(organizationId, entityType)

  const route = getEntityRoute(entityType, entityId)

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  }

  const baseClasses = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors'

  // Loading state
  if (isLoading) {
    return (
      <span className={cn(baseClasses, 'bg-muted animate-pulse', className)}>
        {children}
      </span>
    )
  }

  // Module available - render link badge
  if (isModuleAvailable) {
    return (
      <Link
        to={route}
        className={cn(baseClasses, variantClasses[variant], className)}
      >
        {children}
      </Link>
    )
  }

  // Module not available - show badge with title tooltip
  return (
    <span
      title={`Module ${moduleName} non disponible`}
      className={cn(
        baseClasses,
        'bg-muted text-muted-foreground cursor-help',
        className
      )}
    >
      {children}
      <Lock className="h-3 w-3" />
    </span>
  )
}

// ===========================================
// INLINE INFO VARIANT
// ===========================================

interface CrossModuleInfoProps {
  /** Organization ID */
  organizationId: string
  /** Type of entity being linked */
  entityType: CrossModuleEntityType
  /** ID of the entity */
  entityId: string | null | undefined
  /** Label to show before the entity link */
  label: string
  /** Display text for the entity */
  entityName: string | null | undefined
  /** Optional additional class names */
  className?: string
}

/**
 * CrossModuleInfo - An inline label + link for entity references
 *
 * @example
 * <CrossModuleInfo
 *   organizationId={orgId}
 *   entityType="company"
 *   entityId={ticket.companyId}
 *   label="Entreprise"
 *   entityName={ticket.companyName}
 * />
 * // Renders: "Entreprise: Acme Corp" (with link)
 */
export function CrossModuleInfo({
  organizationId,
  entityType,
  entityId,
  label,
  entityName,
  className,
}: CrossModuleInfoProps) {
  // If no entity ID or name, don't render anything
  if (!entityId || !entityName) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <span className="text-muted-foreground">{label}:</span>
      <CrossModuleLink
        organizationId={organizationId}
        entityType={entityType}
        entityId={entityId}
        size="sm"
      >
        {entityName}
      </CrossModuleLink>
    </div>
  )
}
