import { useCallback, useEffect, useState } from 'react'
import { getAuthClient } from './auth-client'
import type { AuthState, Organization, AuthUser, AuthSession } from '../types'

// ===========================================
// AUTH STATE HOOK
// ===========================================

/**
 * Hook to get the current auth state
 * Returns user, session, organization, and loading state
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    organization: null,
    organizations: [],
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const client = getAuthClient()

    // Get initial session
    const fetchSession = async () => {
      try {
        const session = await client.getSession()

        if (session.data) {
          setState({
            user: session.data.user as AuthUser,
            session: session.data.session as unknown as AuthSession,
            organization: null, // Will be fetched separately
            organizations: [],
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            session: null,
            organization: null,
            organizations: [],
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('[Auth] Failed to fetch session:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchSession()
  }, [])

  return state
}

// ===========================================
// SESSION HOOK
// ===========================================

/**
 * Hook to get session data with Better Auth's useSession
 */
export function useSession() {
  const client = getAuthClient()
  return client.useSession()
}

// ===========================================
// SIGN IN HOOK
// ===========================================

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signIn = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAuthClient()
      const result = await client.signIn.email({
        email,
        password,
        rememberMe,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { signIn, isLoading, error }
}

// ===========================================
// SIGN UP HOOK
// ===========================================

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAuthClient()
      const result = await client.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { signUp, isLoading, error }
}

// ===========================================
// SIGN OUT HOOK
// ===========================================

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false)

  const signOut = useCallback(async () => {
    setIsLoading(true)

    try {
      const client = getAuthClient()
      await client.signOut()
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { signOut, isLoading }
}

// ===========================================
// FORGOT PASSWORD HOOK
// ===========================================

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [success, setSuccess] = useState(false)

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const client = getAuthClient()
      // Use $fetch to call the password reset endpoint directly
      const result = await client.$fetch<{ status: boolean; message: string }>('/request-password-reset', {
        method: 'POST',
        body: {
          email,
          redirectTo: '/reset-password',
        },
      })

      if (!result.data?.status) {
        throw new Error('Failed to send reset email')
      }

      setSuccess(true)
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send reset email')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { forgotPassword, isLoading, error, success }
}

// ===========================================
// RESET PASSWORD HOOK
// ===========================================

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAuthClient()
      // Use $fetch to call the reset password endpoint with token
      const result = await client.$fetch<{ status: boolean; message: string }>('/reset-password', {
        method: 'POST',
        body: {
          token,
          newPassword,
        },
      })

      if (!result.data?.status) {
        throw new Error(result.data?.message || 'Failed to reset password')
      }

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reset password')
      setError(error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { resetPassword, isLoading, error }
}

// ===========================================
// ORGANIZATION HOOKS
// ===========================================

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const client = getAuthClient()
        const result = await client.organization.list()

        if (result.data) {
          setOrganizations(result.data as unknown as Organization[])

          // Set active organization (first one or from localStorage)
          const savedOrgId = localStorage.getItem('sedona-active-organization')
          const activeOrg = savedOrgId
            ? result.data.find((org: { id: string }) => org.id === savedOrgId) as Organization | undefined
            : result.data[0] as Organization | undefined

          if (activeOrg) {
            setOrganization(activeOrg)
          }
        }
      } catch (error) {
        console.error('[Auth] Failed to fetch organizations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  const switchOrganization = useCallback(async (orgId: string) => {
    const client = getAuthClient()
    const result = await client.organization.setActive({ organizationId: orgId })

    if (result.data) {
      setOrganization(result.data as unknown as Organization)
      localStorage.setItem('sedona-active-organization', orgId)
    }

    return result
  }, [])

  const createOrganization = useCallback(async (name: string, slug?: string) => {
    const client = getAuthClient()
    const result = await client.organization.create({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-') })

    if (result.data) {
      const newOrg = result.data as unknown as Organization
      setOrganizations(prev => [...prev, newOrg])
      setOrganization(newOrg)
      localStorage.setItem('sedona-active-organization', newOrg.id)
    }

    return result
  }, [])

  return {
    organization,
    organizations,
    isLoading,
    switchOrganization,
    createOrganization,
  }
}

// ===========================================
// TWO FACTOR HOOKS
// ===========================================

export function useTwoFactor() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const enable = useCallback(async (password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAuthClient()
      const result = await client.twoFactor.enable({ password })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to enable 2FA')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verify = useCallback(async (code: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAuthClient()
      const result = await client.twoFactor.verifyTotp({ code })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Invalid code')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disable = useCallback(async (password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAuthClient()
      const result = await client.twoFactor.disable({ password })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disable 2FA')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { enable, verify, disable, isLoading, error }
}
