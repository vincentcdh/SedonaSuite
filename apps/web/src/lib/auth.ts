// ===========================================
// AUTH - SUPABASE AUTH MODE
// ===========================================
// Authentication using Supabase Auth
// RLS policies use auth.uid() from Supabase session

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@sedona/database'
import type { User, Session } from '@supabase/supabase-js'
import type { Organization, OrganizationAddress } from '@sedona/auth'

// ===========================================
// CONSTANTS
// ===========================================

const CURRENT_ORG_STORAGE_KEY = 'sedona-current-org-id'

// ===========================================
// TYPES
// ===========================================

export interface AuthUser {
  id: string
  name: string | null
  email: string
  emailVerified: boolean
  image: string | null
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  industry?: string
  siret?: string
  siren?: string
  vatNumber?: string
  address?: OrganizationAddress
  phone?: string
  email?: string
}

// ===========================================
// AUTH HOOKS
// ===========================================

/**
 * Main auth hook - uses Supabase session
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState({
          user: mapSupabaseUser(session.user),
          session,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setState({
            user: mapSupabaseUser(session.user),
            session,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return state
}

/**
 * Session hook for compatibility
 */
export function useSession() {
  const auth = useAuth()

  return {
    data: auth.user ? { user: auth.user } : null,
    isLoading: auth.isLoading,
    error: null,
  }
}

/**
 * Helper function to map database organization to Organization type
 */
function mapOrganization(org: Record<string, unknown>): Organization {
  // Parse address JSONB if available
  const addressData = org.address as OrganizationAddress | null

  return {
    id: org.id as string,
    name: org.name as string,
    slug: org.slug as string,
    logo: org.logo_url as string | undefined,
    industry: org.industry as string | undefined,
    siret: org.siret as string | undefined,
    siren: org.siren as string | undefined,
    vatNumber: org.vat_number as string | undefined,
    legalName: org.legal_name as string | undefined,
    // New JSONB address
    address: addressData || undefined,
    // Legacy address fields (fallback)
    addressStreet: org.address_street as string | undefined,
    addressComplement: org.address_complement as string | undefined,
    addressPostalCode: org.address_postal_code as string | undefined,
    addressCity: org.address_city as string | undefined,
    addressCountry: org.address_country as string | undefined,
    phone: org.phone as string | undefined,
    email: org.email as string | undefined,
    website: org.website as string | undefined,
    createdBy: org.created_by as string | undefined,
    onboardingCompleted: org.onboarding_completed as boolean | undefined,
    // Subscription fields - default to FREE during transition
    subscriptionPlan: 'FREE' as const,
    subscriptionStatus: 'active',
    createdAt: new Date(org.created_at as string),
    updatedAt: org.updated_at ? new Date(org.updated_at as string) : undefined,
  }
}

/**
 * Organization hook - fetches ALL user organizations from Supabase
 * Returns current organization, list of all orgs, and role in current org
 */
export function useOrganization() {
  const auth = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrganizations = useCallback(async () => {
    if (!auth.user?.id) {
      setOrganization(null)
      setOrganizations([])
      setRole(null)
      setIsLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()

      // Get ALL user's organization memberships
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization:organizations(*)
        `)
        .eq('user_id', auth.user.id)

      if (memberError || !memberships) {
        console.error('Error fetching organizations:', memberError)
        setOrganization(null)
        setOrganizations([])
        setRole(null)
        setIsLoading(false)
        return
      }

      // Map all organizations
      const orgs = memberships
        .filter(m => m.organization !== null)
        .map(m => mapOrganization(m.organization as Record<string, unknown>))

      setOrganizations(orgs)

      // Determine current organization
      // 1. Check localStorage for saved preference
      const savedOrgId = localStorage.getItem(CURRENT_ORG_STORAGE_KEY)

      // 2. Find the saved org or fall back to first org
      let currentOrg = savedOrgId
        ? orgs.find(o => o.id === savedOrgId)
        : null

      // 3. If no saved preference or saved org not found, use first org
      if (!currentOrg && orgs.length > 0) {
        currentOrg = orgs[0]
        // Save this as the current org
        localStorage.setItem(CURRENT_ORG_STORAGE_KEY, currentOrg.id)
      }

      if (currentOrg) {
        setOrganization(currentOrg)
        // Get role for current organization
        const membership = memberships.find(
          m => (m.organization as Record<string, unknown>)?.id === currentOrg?.id
        )
        setRole(membership?.role || null)
      } else {
        setOrganization(null)
        setRole(null)
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setOrganization(null)
      setOrganizations([])
      setRole(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.user?.id])

  useEffect(() => {
    if (!auth.isLoading) {
      fetchOrganizations()
    }
  }, [auth.isLoading, auth.user?.id, fetchOrganizations])

  return {
    organization,
    organizations,
    role,
    isLoading: auth.isLoading || isLoading,
    refetch: fetchOrganizations,
  }
}

/**
 * Hook to switch between organizations
 */
export function useSwitchOrganization() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const switchOrganization = useCallback(async (organizationId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Vous devez être connecté')
      }

      // Verify user is a member of this organization
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('id, role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single()

      if (memberError || !membership) {
        throw new Error('Vous n\'êtes pas membre de cette organisation')
      }

      // Save to localStorage
      localStorage.setItem(CURRENT_ORG_STORAGE_KEY, organizationId)

      // Reload the page to refresh all data with new org context
      window.location.reload()

      return { success: true }
    } catch (err) {
      const error = err as Error
      setError(error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { switchOrganization, isLoading, error }
}

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createOrganization = useCallback(async (input: CreateOrganizationInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Call the RPC function
      const { data, error: rpcError } = await supabase.rpc('create_organization_with_owner', {
        p_name: input.name,
        p_slug: input.slug,
        p_industry: input.industry || null,
        p_siret: input.siret || null,
        p_siren: input.siren || null,
        p_vat_number: input.vatNumber || null,
        p_address: input.address || {},
        p_phone: input.phone || null,
        p_email: input.email || null,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      const result = data as { success: boolean; error?: string; organization?: Record<string, unknown> }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de l\'organisation')
      }

      // Switch to the new organization
      if (result.organization?.id) {
        localStorage.setItem(CURRENT_ORG_STORAGE_KEY, result.organization.id as string)
      }

      return {
        success: true,
        organization: result.organization ? mapOrganization(result.organization) : null,
      }
    } catch (err) {
      const error = err as Error
      setError(error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { createOrganization, isLoading, error }
}

// ===========================================
// ORGANIZATION HEALTH TYPES
// ===========================================

export interface ModuleHealth {
  provisioned: boolean
  items_count: number
  details?: Record<string, unknown>
}

export interface OrganizationHealthStatus {
  organization_id: string
  is_fully_provisioned: boolean
  modules: {
    crm: ModuleHealth
    invoice: ModuleHealth
    tickets: ModuleHealth
    hr: ModuleHealth
  }
  checked_at: string
}

/**
 * Hook to check organization provisioning health
 * Calls the check_organization_provisioned RPC function
 */
export function useOrganizationHealth(organizationId: string | undefined) {
  const [health, setHealth] = useState<OrganizationHealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const checkHealth = useCallback(async () => {
    if (!organizationId) {
      setHealth(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      const { data, error: rpcError } = await supabase.rpc('check_organization_provisioned', {
        p_org_id: organizationId,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      setHealth(data as OrganizationHealthStatus)
    } catch (err) {
      const error = err as Error
      setError(error)
      console.error('Error checking organization health:', error)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  // Check health on mount and when organizationId changes
  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  const reprovision = useCallback(async () => {
    if (!organizationId) return { success: false, error: 'No organization ID' }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      const { data, error: rpcError } = await supabase.rpc('provision_organization', {
        p_org_id: organizationId,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      const result = data as { success: boolean; error?: string }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du provisionnement')
      }

      // Refresh health status
      await checkHealth()

      return { success: true }
    } catch (err) {
      const error = err as Error
      setError(error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, checkHealth])

  return {
    health,
    isLoading,
    error,
    refetch: checkHealth,
    reprovision,
  }
}

// ===========================================
// AUTH ACTIONS
// ===========================================

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false)

  return {
    signIn: async (email: string, password: string, _rememberMe?: boolean) => {
      setIsLoading(true)
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw new Error(
            error.message === 'Invalid login credentials'
              ? 'Email ou mot de passe incorrect'
              : error.message
          )
        }

        return { success: true }
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
  }
}

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false)

  return {
    signOut: async () => {
      setIsLoading(true)
      try {
        const supabase = getSupabaseClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
  }
}

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false)

  return {
    signUp: async (email: string, password: string, name: string) => {
      setIsLoading(true)
      try {
        const supabase = getSupabaseClient()

        // Get the redirect URL for email confirmation
        const emailRedirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}/verify-email`
          : undefined

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo,
          },
        })

        if (error) {
          throw new Error(error.message)
        }

        return { success: true }
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
  }
}

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  return {
    forgotPassword: async (email: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const supabase = getSupabaseClient()

        // Get the current origin for redirect URL
        const redirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : undefined

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        })

        if (resetError) {
          throw new Error(resetError.message)
        }

        setSuccess(true)
        return { success: true }
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
    error,
    success,
  }
}

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  return {
    resetPassword: async (_token: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const supabase = getSupabaseClient()
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        })

        if (updateError) {
          throw new Error(updateError.message)
        }

        return true
      } catch (err) {
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    isLoading,
    error,
  }
}

export function useTwoFactor() {
  return {
    enable: async () => ({ success: true }),
    disable: async () => ({ success: true }),
    isLoading: false,
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || null,
    email: user.email || '',
    emailVerified: !!user.email_confirmed_at,
    image: user.user_metadata?.avatar_url || null,
  }
}

// ===========================================
// RE-EXPORT SCHEMAS
// ===========================================

export {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignInFormData,
  type SignUpFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from '@sedona/auth'
