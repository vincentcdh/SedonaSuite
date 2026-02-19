// ===========================================
// CLIENT PORTAL - SHARE LINK ACCESS
// ===========================================

import { useState, useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@sedona/ui'
import { FolderKanban, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { logRateLimitExceeded, logAuditEvent } from '@/lib/audit'

export const Route = createFileRoute('/client-portal/$token')({
  component: ShareLinkAccessPage,
})

// ===========================================
// TOKEN VALIDATION UTILITIES
// ===========================================

// Validate token format (UUID or base64-like string)
function isValidTokenFormat(token: string): boolean {
  // Minimum length
  if (token.length < 20) return false

  // Maximum length
  if (token.length > 128) return false

  // Only alphanumeric, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/
  return validPattern.test(token)
}

// Rate limiting for password attempts
const RATE_LIMIT_KEY = 'sedona_portal_rate_limit'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

interface RateLimitState {
  attempts: number
  lastAttempt: number
  lockedUntil?: number
}

function getRateLimitState(): RateLimitState {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return { attempts: 0, lastAttempt: 0 }
}

function updateRateLimitState(failed: boolean) {
  const state = getRateLimitState()

  // Reset if last attempt was more than 15 minutes ago
  if (Date.now() - state.lastAttempt > LOCKOUT_DURATION) {
    state.attempts = 0
    delete state.lockedUntil
  }

  if (failed) {
    state.attempts++
    state.lastAttempt = Date.now()

    // Lock if too many attempts
    if (state.attempts >= MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + LOCKOUT_DURATION
    }
  } else {
    // Reset on success
    state.attempts = 0
    delete state.lockedUntil
  }

  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state))
  return state
}

function isRateLimited(): { limited: boolean; remainingTime?: number } {
  const state = getRateLimitState()

  if (state.lockedUntil && state.lockedUntil > Date.now()) {
    return {
      limited: true,
      remainingTime: Math.ceil((state.lockedUntil - Date.now()) / 1000 / 60),
    }
  }

  return { limited: false }
}

function ShareLinkAccessPage() {
  const { token } = Route.useParams()
  const navigate = useNavigate()
  const [isValidating, setIsValidating] = useState(true)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const validationAttempted = useRef(false)

  useEffect(() => {
    // Prevent double validation in React Strict Mode
    if (validationAttempted.current) return
    validationAttempted.current = true
    validateToken()
  }, [token])

  const validateToken = async () => {
    setIsValidating(true)
    setError(null)

    try {
      // SECURITY: Validate token format first
      if (!isValidTokenFormat(token)) {
        logAuditEvent('security.token.invalid', {
          success: false,
          details: { tokenLength: token.length },
          errorMessage: 'Invalid token format',
        })
        setError('Format de lien invalide')
        setIsValidating(false)
        return
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // TODO: Replace with actual API call to validate token
      // For now, use mock validation with proper format check
      const mockResponse = {
        valid: true,
        passwordProtected: token.includes('protected'),
        projectName: 'Projet Demo',
        projectId: `project-${token.substring(0, 8)}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Mock: 24h from now
      }

      // Check expiration
      if (mockResponse.expiresAt < Date.now()) {
        setError('Ce lien a expiré')
        return
      }

      if (!mockResponse.valid) {
        setError('Ce lien n\'est pas valide ou a expiré')
        return
      }

      setProjectName(mockResponse.projectName)
      setIsPasswordProtected(mockResponse.passwordProtected)

      // If not password protected, redirect directly
      if (!mockResponse.passwordProtected) {
        navigate({
          to: '/client-portal/project/$projectId',
          params: { projectId: mockResponse.projectId },
        })
      }
    } catch {
      setError('Impossible de vérifier ce lien')
    } finally {
      setIsValidating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // SECURITY: Check rate limiting
    const rateLimit = isRateLimited()
    if (rateLimit.limited) {
      logRateLimitExceeded() // Audit log
      setError(`Trop de tentatives. Réessayez dans ${rateLimit.remainingTime} minutes.`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // TODO: Replace with actual password verification API call
      // For demo, accept "demo123" as password
      const demoPassword = 'demo123'
      if (password !== demoPassword) {
        updateRateLimitState(true)
        throw new Error('Mot de passe incorrect')
      }

      // Success - reset rate limit
      updateRateLimitState(false)

      navigate({
        to: '/client-portal/project/$projectId',
        params: { projectId: `project-${token.substring(0, 8)}` },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mot de passe incorrect')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verification du lien...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !isPasswordProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Lien invalide</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/client-portal' })}
              >
                Retour a la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Password protected state
  if (isPasswordProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Portail Client</h1>
            {projectName && (
              <p className="text-muted-foreground">{projectName}</p>
            )}
          </div>

          {/* Password Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Acces protege
              </CardTitle>
              <CardDescription>
                Ce projet est protege par un mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez le mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !password}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verification...
                    </>
                  ) : (
                    'Acceder au projet'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Should not reach here, but just in case
  return null
}
