// ===========================================
// SUBSCRIPTION PLANS CONFIGURATION
// ===========================================

export type PlanId = 'FREE' | 'PRO' | 'ENTERPRISE'
export type BillingInterval = 'month' | 'year'

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number | 'unlimited'
}

export interface Plan {
  id: PlanId
  name: string
  description: string
  features: PlanFeature[]
  prices: {
    monthly?: {
      amount: number
      stripePriceId: string
    }
    yearly?: {
      amount: number
      stripePriceId: string
      savings?: number // Percentage saved compared to monthly
    }
  }
  limits: {
    contacts: number | 'unlimited'
    invoicesPerMonth: number | 'unlimited'
    projects: number | 'unlimited'
    tickets: number | 'unlimited'
    employees: number | 'unlimited'
    storage: number // In GB
    users: number | 'unlimited'
  }
  highlighted?: boolean
}

/**
 * Sedona.AI Plans Configuration
 * Prices in EUR cents
 */
export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: 'FREE',
    name: 'Gratuit',
    description: 'Pour demarrer et tester Sedona.AI',
    features: [
      { name: 'CRM basique', included: true, limit: 100 },
      { name: 'Facturation', included: true, limit: 5 },
      { name: 'Projets', included: true, limit: 3 },
      { name: 'Tickets support', included: true, limit: 10 },
      { name: 'Gestion RH', included: false },
      { name: 'Documents', included: true, limit: 50 },
      { name: 'Analytics', included: false },
      { name: 'Support email', included: true },
      { name: 'API access', included: false },
    ],
    prices: {},
    limits: {
      contacts: 100,
      invoicesPerMonth: 5,
      projects: 3,
      tickets: 10,
      employees: 0,
      storage: 1,
      users: 1,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'Pour les TPE en croissance',
    features: [
      { name: 'CRM complet', included: true, limit: 'unlimited' },
      { name: 'Facturation', included: true, limit: 'unlimited' },
      { name: 'Projets', included: true, limit: 'unlimited' },
      { name: 'Tickets support', included: true, limit: 'unlimited' },
      { name: 'Gestion RH', included: true, limit: 10 },
      { name: 'Documents', included: true, limit: 'unlimited' },
      { name: 'Analytics basique', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'API access', included: true },
    ],
    prices: {
      monthly: {
        amount: 2900, // 29 EUR
        stripePriceId: 'price_pro_monthly',
      },
      yearly: {
        amount: 29000, // 290 EUR (2 months free)
        stripePriceId: 'price_pro_yearly',
        savings: 17,
      },
    },
    limits: {
      contacts: 'unlimited',
      invoicesPerMonth: 'unlimited',
      projects: 'unlimited',
      tickets: 'unlimited',
      employees: 10,
      storage: 10,
      users: 5,
    },
    highlighted: true,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Pour les entreprises etablies',
    features: [
      { name: 'Tout illimite', included: true, limit: 'unlimited' },
      { name: 'Analytics avance', included: true },
      { name: 'SSO / SAML', included: true },
      { name: 'Support dedie', included: true },
      { name: 'SLA garanti', included: true },
      { name: 'Formation personnalisee', included: true },
      { name: 'API avancee', included: true },
      { name: 'Integrations custom', included: true },
    ],
    prices: {
      monthly: {
        amount: 9900, // 99 EUR
        stripePriceId: 'price_enterprise_monthly',
      },
      yearly: {
        amount: 99000, // 990 EUR (2 months free)
        stripePriceId: 'price_enterprise_yearly',
        savings: 17,
      },
    },
    limits: {
      contacts: 'unlimited',
      invoicesPerMonth: 'unlimited',
      projects: 'unlimited',
      tickets: 'unlimited',
      employees: 'unlimited',
      storage: 100,
      users: 'unlimited',
    },
  },
}

/**
 * Get plan by ID
 */
export function getPlan(planId: PlanId): Plan {
  return PLANS[planId]
}

/**
 * Get price ID for a plan and interval
 */
export function getPriceId(planId: PlanId, interval: BillingInterval): string | null {
  const plan = PLANS[planId]
  if (!plan.prices) return null

  if (interval === 'month') {
    return plan.prices.monthly?.stripePriceId || null
  }

  return plan.prices.yearly?.stripePriceId || null
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, interval?: BillingInterval): string {
  const euros = amount / 100
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(euros)

  if (interval === 'month') {
    return `${formatted}/mois`
  }
  if (interval === 'year') {
    return `${formatted}/an`
  }

  return formatted
}

/**
 * Check if a feature is available for a plan
 */
export function isFeatureAvailable(planId: PlanId, featureName: string): boolean {
  const plan = PLANS[planId]
  const feature = plan.features.find((f) => f.name === featureName)
  return feature?.included || false
}

/**
 * Get limit for a feature in a plan
 */
export function getFeatureLimit(
  planId: PlanId,
  limitKey: keyof Plan['limits']
): number | 'unlimited' {
  const plan = PLANS[planId]
  return plan.limits[limitKey]
}
