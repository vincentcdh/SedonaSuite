// ===========================================
// AUDIT LOGGING
// ===========================================
// Tracks security-relevant events for compliance and debugging

// ===========================================
// TYPES
// ===========================================

export type AuditEventType =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.logout'
  | 'auth.session.expired'
  | 'auth.password.change'
  | 'auth.password.reset.request'
  | 'auth.rate_limit.exceeded'
  | 'access.denied'
  | 'access.resource'
  | 'data.create'
  | 'data.update'
  | 'data.delete'
  | 'data.export'
  | 'admin.role.change'
  | 'admin.user.create'
  | 'admin.user.delete'
  | 'security.csrf.failure'
  | 'security.token.invalid'

export interface AuditEvent {
  id: string
  timestamp: string
  type: AuditEventType
  userId?: string
  email?: string
  organizationId?: string
  resourceType?: string
  resourceId?: string
  action?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

// ===========================================
// STORAGE
// ===========================================

const AUDIT_LOG_KEY = 'sedona_audit_log'
const MAX_LOCAL_ENTRIES = 100 // Keep last 100 entries in localStorage

/**
 * Get audit log from localStorage
 */
function getAuditLog(): AuditEvent[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save audit log to localStorage
 */
function saveAuditLog(events: AuditEvent[]): void {
  if (typeof window === 'undefined') return

  // Keep only last MAX_LOCAL_ENTRIES
  const trimmed = events.slice(-MAX_LOCAL_ENTRIES)
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed))
}

// ===========================================
// LOGGING FUNCTIONS
// ===========================================

/**
 * Generate unique ID for audit event
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get user context from current session
 */
function getUserContext(): { userId?: string; email?: string; organizationId?: string } {
  if (typeof window === 'undefined') return {}

  try {
    const session = localStorage.getItem('sedona_auth_session')
    if (!session) return {}

    const parsed = JSON.parse(session)
    const adminAccount = localStorage.getItem('sedona_admin_account')

    if (adminAccount) {
      const account = JSON.parse(adminAccount)
      return {
        userId: account.user?.id,
        email: parsed.email || account.email,
        organizationId: account.organization?.id,
      }
    }

    return { email: parsed.email }
  } catch {
    return {}
  }
}

/**
 * Log an audit event
 */
export function logAuditEvent(
  type: AuditEventType,
  options: {
    success?: boolean
    resourceType?: string
    resourceId?: string
    action?: string
    details?: Record<string, unknown>
    errorMessage?: string
    email?: string
  } = {}
): AuditEvent {
  const userContext = getUserContext()

  const event: AuditEvent = {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    type,
    userId: userContext.userId,
    email: options.email || userContext.email,
    organizationId: userContext.organizationId,
    resourceType: options.resourceType,
    resourceId: options.resourceId,
    action: options.action,
    details: options.details,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    success: options.success ?? true,
    errorMessage: options.errorMessage,
  }

  // Store locally
  const log = getAuditLog()
  log.push(event)
  saveAuditLog(log)

  // Log to console in development
  if (import.meta.env.DEV) {
    const icon = event.success ? '✓' : '✗'
    console.log(
      `[AUDIT ${icon}] ${event.type}`,
      event.email || 'anonymous',
      event.details || ''
    )
  }

  // TODO: In production, send to Supabase or external logging service
  // sendToServer(event)

  return event
}

// ===========================================
// CONVENIENCE FUNCTIONS
// ===========================================

/**
 * Log successful login
 */
export function logLoginSuccess(email: string): void {
  logAuditEvent('auth.login.success', {
    success: true,
    email,
    details: { method: 'password' },
  })
}

/**
 * Log failed login attempt
 */
export function logLoginFailure(email: string, reason: string): void {
  logAuditEvent('auth.login.failure', {
    success: false,
    email,
    errorMessage: reason,
  })
}

/**
 * Log logout
 */
export function logLogout(): void {
  logAuditEvent('auth.logout', { success: true })
}

/**
 * Log session expiration
 */
export function logSessionExpired(): void {
  logAuditEvent('auth.session.expired', { success: false })
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(email?: string): void {
  logAuditEvent('auth.rate_limit.exceeded', {
    success: false,
    email,
    errorMessage: 'Too many attempts',
  })
}

/**
 * Log access denied
 */
export function logAccessDenied(resource: string, action: string): void {
  logAuditEvent('access.denied', {
    success: false,
    resourceType: resource,
    action,
    errorMessage: 'Permission denied',
  })
}

/**
 * Log data modification
 */
export function logDataChange(
  action: 'create' | 'update' | 'delete',
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): void {
  const typeMap = {
    create: 'data.create' as const,
    update: 'data.update' as const,
    delete: 'data.delete' as const,
  }

  logAuditEvent(typeMap[action], {
    success: true,
    resourceType,
    resourceId,
    action,
    details,
  })
}

/**
 * Log CSRF token failure
 */
export function logCsrfFailure(): void {
  logAuditEvent('security.csrf.failure', {
    success: false,
    errorMessage: 'Invalid CSRF token',
  })
}

// ===========================================
// QUERY FUNCTIONS
// ===========================================

/**
 * Get recent audit events
 */
export function getRecentAuditEvents(limit = 50): AuditEvent[] {
  return getAuditLog().slice(-limit).reverse()
}

/**
 * Get audit events by type
 */
export function getAuditEventsByType(type: AuditEventType): AuditEvent[] {
  return getAuditLog().filter((e) => e.type === type)
}

/**
 * Get failed security events
 */
export function getFailedSecurityEvents(): AuditEvent[] {
  return getAuditLog().filter(
    (e) => !e.success && ((e.type as string).startsWith('auth.') || (e.type as string).startsWith('security.'))
  )
}

/**
 * Clear audit log (admin only)
 */
export function clearAuditLog(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUDIT_LOG_KEY)
  }
}
