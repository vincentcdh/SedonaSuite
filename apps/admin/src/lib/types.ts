// ===========================================
// ADMIN CONSOLE TYPES
// ===========================================

export interface Organization {
  id: string
  name: string
  slug: string
  adminEmail: string
  adminPassword: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  status: 'pending' | 'configuring' | 'deployed'
  // Supabase config
  supabaseUrl?: string
  supabaseAnonKey?: string
  // Vercel deployment
  vercelUrl?: string
  createdAt: string
  deployedAt?: string
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  adminEmail: string
  adminPassword: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
}
