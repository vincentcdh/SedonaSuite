import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../types/database'

// Declare Vite env types for this module
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

/**
 * Get environment variables
 * Works in Vite and other environments
 */
function getEnvVar(key: string): string | undefined {
  // Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key as keyof ImportMetaEnv]
  }
  // Node.js environment (for SSR)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key]
  }
  return undefined
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

/**
 * Get the Supabase project URL
 * Used for calling Edge Functions
 */
export function getSupabaseUrl(): string {
  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable')
  }
  return supabaseUrl
}

let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Get the Supabase client singleton
 * Lazily initialized to avoid errors when env vars are not available at import time
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env.local file.')
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

/**
 * Supabase client for browser usage
 * Uses the anon key - RLS policies protect data
 * @deprecated Use getSupabaseClient() instead for lazy initialization
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return Reflect.get(getSupabaseClient(), prop)
  },
})

/**
 * Create a typed Supabase client with custom options
 * Useful for server-side or edge functions
 */
export function createSupabaseClientWithOptions(options: {
  supabaseUrl: string
  supabaseKey: string
}): SupabaseClient<Database> {
  return createClient<Database>(options.supabaseUrl, options.supabaseKey)
}

/**
 * Get a Supabase client configured for the CRM schema
 * CRM tables are in the public schema, so this just returns the standard client
 * @deprecated Use getSupabaseClient() directly - CRM tables are in public schema
 */
export function getCrmClient() {
  return getSupabaseClient()
}
