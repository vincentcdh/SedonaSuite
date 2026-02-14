// ===========================================
// AUTH - DEVELOPMENT MODE
// ===========================================
// Authentication linked to HR employees
// TODO: Connect to Supabase Auth in production

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@sedona/database'
import {
  TEST_ACCOUNTS,
  validateTestCredentials,
  getDefaultTestAccount,
  type TestAccount,
} from './test-accounts'
import type { Organization } from '@sedona/auth'

// ===========================================
// CURRENT USER STATE (persisted in localStorage)
// ===========================================

const STORAGE_KEY = 'sedona_auth_session'

function getCurrentAccount(): TestAccount {
  if (typeof window === 'undefined') {
    return getDefaultTestAccount()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const email = JSON.parse(stored)
      const account = TEST_ACCOUNTS.find((a) => a.email === email)
      if (account) return account
    } catch {
      // Invalid stored value, use default
    }
  }
  return getDefaultTestAccount()
}

function setCurrentAccount(account: TestAccount) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account.email))
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: account }))
  }
}

function clearCurrentAccount() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }))
  }
}

// ===========================================
// AUTH HOOKS
// ===========================================

export function useSession() {
  const [account, setAccount] = useState<TestAccount | null>(null)

  useEffect(() => {
    setAccount(getCurrentAccount())

    const handleChange = (e: CustomEvent<TestAccount | null>) => {
      setAccount(e.detail || getCurrentAccount())
    }

    window.addEventListener('auth-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-changed', handleChange as EventListener)
    }
  }, [])

  return {
    data: account ? { user: account.user } : null,
    isLoading: false,
    error: null,
  }
}

export function useAuth() {
  const [account, setAccount] = useState<TestAccount | null>(null)

  useEffect(() => {
    setAccount(getCurrentAccount())

    const handleChange = (e: CustomEvent<TestAccount | null>) => {
      setAccount(e.detail || getCurrentAccount())
    }

    window.addEventListener('auth-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-changed', handleChange as EventListener)
    }
  }, [])

  return {
    user: account?.user || null,
    employeeId: account?.employeeId || null,
    isAuthenticated: !!account,
    isLoading: false,
  }
}

// ===========================================
// ORGANIZATION HOOK - Fetches plan from Supabase
// ===========================================

export function useOrganization() {
  const [account, setAccountState] = useState<TestAccount | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch organization from Supabase to get current plan
  const fetchOrganization = useCallback(async (orgId: string, fallbackOrg: Organization) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (error) {
        console.error('Error fetching organization:', error)
        return fallbackOrg
      }

      // Map Supabase data to Organization type
      const org: Organization = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logo: data.logo_url,
        siret: data.siret,
        siren: data.siren,
        vatNumber: data.vat_number,
        legalName: data.legal_name,
        addressStreet: data.address_line1,
        addressComplement: data.address_line2,
        addressPostalCode: data.postal_code,
        addressCity: data.city,
        addressCountry: data.country,
        phone: data.phone,
        email: data.email,
        website: data.website,
        subscriptionPlan: (data.subscription_plan?.toUpperCase() || 'FREE') as 'FREE' | 'PRO' | 'ENTERPRISE',
        subscriptionStatus: data.subscription_status || 'active',
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      }

      return org
    } catch (err) {
      console.error('Error fetching organization:', err)
      return fallbackOrg
    }
  }, [])

  useEffect(() => {
    const currentAccount = getCurrentAccount()
    setAccountState(currentAccount)

    // Fetch organization from Supabase
    if (currentAccount?.organization?.id) {
      fetchOrganization(currentAccount.organization.id, currentAccount.organization).then((org) => {
        setOrganization(org)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }

    const handleChange = (e: CustomEvent<TestAccount | null>) => {
      const newAccount = e.detail || getCurrentAccount()
      setAccountState(newAccount)

      if (newAccount?.organization?.id) {
        setIsLoading(true)
        fetchOrganization(newAccount.organization.id, newAccount.organization).then((org) => {
          setOrganization(org)
          setIsLoading(false)
        })
      }
    }

    window.addEventListener('auth-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-changed', handleChange as EventListener)
    }
  }, [fetchOrganization])

  return {
    organization,
    role: account?.role || null,
    isLoading,
    createOrganization: async (_name: string) => {
      console.log('Create organization - not implemented in dev mode')
    },
    // Expose refetch for manual refresh
    refetch: async () => {
      if (account?.organization?.id) {
        const org = await fetchOrganization(account.organization.id, account.organization)
        setOrganization(org)
      }
    },
  }
}

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false)

  return {
    signIn: async (email: string, password: string, _rememberMe?: boolean) => {
      setIsLoading(true)
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const account = validateTestCredentials(email, password)
        if (account) {
          setCurrentAccount(account)
          return { success: true }
        } else {
          throw new Error('Email ou mot de passe incorrect')
        }
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
        await new Promise((resolve) => setTimeout(resolve, 300))
        clearCurrentAccount()
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
    signUp: async (_email: string, _password: string, _name: string) => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        throw new Error(
          'Inscription non disponible en mode developpement. Contactez un administrateur.'
        )
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
    forgotPassword: async (_email: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
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
  const [error] = useState<Error | null>(null)

  return {
    resetPassword: async (_token: string, _password: string) => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return true
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

// Re-export types
export type { TestAccount } from './test-accounts'
export { TEST_ACCOUNTS } from './test-accounts'
