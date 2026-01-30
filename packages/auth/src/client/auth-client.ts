import { createAuthClient } from 'better-auth/react'
import { organizationClient, twoFactorClient } from 'better-auth/client/plugins'

// ===========================================
// BETTER AUTH CLIENT CONFIGURATION
// ===========================================

/**
 * Creates the Better Auth client instance
 * This is used in React components and hooks
 */
export function createSedonaAuthClient(options: { baseURL: string }) {
  return createAuthClient({
    baseURL: options.baseURL,
    plugins: [
      organizationClient(),
      twoFactorClient(),
    ],
  })
}

// Default client instance (initialized lazily)
let authClient: ReturnType<typeof createSedonaAuthClient> | null = null

/**
 * Get the auth client instance
 * Lazily initializes with the provided base URL
 */
export function getAuthClient(baseURL?: string): ReturnType<typeof createSedonaAuthClient> {
  if (!authClient) {
    if (!baseURL) {
      throw new Error('Auth client not initialized. Call initAuthClient first or provide a baseURL.')
    }
    authClient = createSedonaAuthClient({ baseURL })
  }
  return authClient
}

/**
 * Initialize the auth client with configuration
 * Should be called once at app startup
 */
export function initAuthClient(baseURL: string): ReturnType<typeof createSedonaAuthClient> {
  authClient = createSedonaAuthClient({ baseURL })
  return authClient
}

// Export the client type
export type AuthClient = ReturnType<typeof createSedonaAuthClient>
