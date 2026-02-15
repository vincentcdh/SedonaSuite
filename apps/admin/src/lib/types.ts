// ===========================================
// ADMIN CONSOLE TYPES
// ===========================================

export interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  adminEmail: string
  adminPassword: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  status: 'pending' | 'deployed' | 'stopped'
  port: number
  createdAt: string
  deployedAt?: string
}

export interface CreateOrganizationInput {
  name: string
  slug: string
  domain?: string
  adminEmail: string
  adminPassword: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
}

export interface DockerConfig {
  composeFile: string
  envFile: string
  initSql: string
}
