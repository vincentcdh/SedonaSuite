// ===========================================
// MOCK AUTH - DEVELOPMENT ONLY
// ===========================================
// TEMPORARY: Mock auth for development without Supabase
// TODO: Re-enable real auth when Supabase is configured

import { useState, useEffect } from 'react'
import {
  TEST_ACCOUNTS,
  validateTestCredentials,
  getDefaultTestAccount,
  type TestAccount,
} from './test-accounts'

// ===========================================
// CURRENT USER STATE (persisted in localStorage)
// ===========================================

const STORAGE_KEY = 'sedona_test_account'

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
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('auth-account-changed', { detail: account }))
  }
}

function clearCurrentAccount() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('auth-account-changed', { detail: null }))
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

    window.addEventListener('auth-account-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-account-changed', handleChange as EventListener)
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

    window.addEventListener('auth-account-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-account-changed', handleChange as EventListener)
    }
  }, [])

  return {
    user: account?.user || null,
    isAuthenticated: !!account,
    isLoading: false,
  }
}

export function useOrganization() {
  const [account, setAccount] = useState<TestAccount | null>(null)

  useEffect(() => {
    setAccount(getCurrentAccount())

    const handleChange = (e: CustomEvent<TestAccount | null>) => {
      setAccount(e.detail || getCurrentAccount())
    }

    window.addEventListener('auth-account-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-account-changed', handleChange as EventListener)
    }
  }, [])

  return {
    organization: account?.organization || null,
    role: account?.role || null,
    isLoading: false,
    createOrganization: async (_name: string) => {
      console.log('Mock create organization')
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
        // Redirect to login
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
        console.log('Mock sign up - In test mode, use existing test accounts')
        throw new Error(
          'En mode test, veuillez utiliser un compte de test existant. Voir la liste dans le selecteur de compte.'
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
// TEST ACCOUNT SWITCHER HOOK
// ===========================================

export function useTestAccountSwitcher() {
  const [account, setAccount] = useState<TestAccount | null>(null)

  useEffect(() => {
    setAccount(getCurrentAccount())

    const handleChange = (e: CustomEvent<TestAccount | null>) => {
      setAccount(e.detail || getCurrentAccount())
    }

    window.addEventListener('auth-account-changed', handleChange as EventListener)
    return () => {
      window.removeEventListener('auth-account-changed', handleChange as EventListener)
    }
  }, [])

  return {
    currentAccount: account,
    allAccounts: TEST_ACCOUNTS,
    switchAccount: (newAccount: TestAccount) => {
      setCurrentAccount(newAccount)
      setAccount(newAccount)
    },
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

// Re-export test account types for convenience
export type { TestAccount } from './test-accounts'
export { TEST_ACCOUNTS } from './test-accounts'
