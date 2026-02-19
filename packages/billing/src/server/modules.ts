// ===========================================
// MODULE SUBSCRIPTION MANAGEMENT
// ===========================================
// Handles per-module Stripe subscriptions
// Each module is a separate Stripe Product with monthly/yearly prices

import type Stripe from 'stripe'
import { getStripe } from './stripe'

// ===========================================
// TYPES
// ===========================================

export type ModuleId = 'crm' | 'invoice' | 'projects' | 'tickets' | 'hr' | 'docs' | 'analytics'
export type ModuleBillingCycle = 'monthly' | 'yearly'

export interface ModuleInfo {
  id: ModuleId
  name: string
  stripePriceMonthly: string
  stripePriceYearly: string
}

export interface CreateModuleCheckoutOptions {
  organizationId: string
  moduleId: ModuleId
  billingCycle: ModuleBillingCycle
  customerId?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}

export interface ModuleSubscriptionResult {
  success: boolean
  error?: string
  subscriptionId?: string
  status?: string
}

// ===========================================
// ENVIRONMENT VARIABLES FOR MODULE PRICES
// ===========================================

// Module Stripe Price IDs from environment
// Format: STRIPE_{MODULE}_MONTHLY_PRICE_ID, STRIPE_{MODULE}_YEARLY_PRICE_ID
function getModulePriceId(moduleId: ModuleId, billingCycle: ModuleBillingCycle): string | undefined {
  const envKey = `STRIPE_${moduleId.toUpperCase()}_${billingCycle.toUpperCase()}_PRICE_ID`
  return process.env[envKey]
}

// ===========================================
// CUSTOMER MANAGEMENT
// ===========================================

/**
 * Get or create a Stripe Customer for an organization
 * Organizations have ONE Stripe Customer but potentially MULTIPLE subscriptions (one per module)
 */
export async function getOrCreateCustomer(
  organizationId: string,
  email: string,
  name?: string,
  existingCustomerId?: string | null
): Promise<Stripe.Customer> {
  const stripe = getStripe()

  // If we have an existing customer ID, verify it exists
  if (existingCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(existingCustomerId)
      if (!existing.deleted) {
        return existing as Stripe.Customer
      }
    } catch {
      // Customer doesn't exist, will create new one
    }
  }

  // Search for existing customer by metadata
  const existingCustomers = await stripe.customers.search({
    query: `metadata["organization_id"]:"${organizationId}"`,
    limit: 1,
  })

  const foundCustomer = existingCustomers.data[0]
  if (foundCustomer) {
    return foundCustomer
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      organization_id: organizationId,
    },
    preferred_locales: ['fr'],
  })

  return customer
}

// ===========================================
// MODULE CHECKOUT
// ===========================================

/**
 * Create a Stripe Checkout Session for a module subscription
 */
export async function createModuleCheckout(
  options: CreateModuleCheckoutOptions
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe()

  // Get the price ID for this module/cycle
  const priceId = getModulePriceId(options.moduleId, options.billingCycle)

  if (!priceId) {
    throw new Error(
      `No Stripe price configured for module "${options.moduleId}" with billing cycle "${options.billingCycle}". ` +
      `Please set STRIPE_${options.moduleId.toUpperCase()}_${options.billingCycle.toUpperCase()}_PRICE_ID environment variable.`
    )
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: {
      organization_id: options.organizationId,
      module_id: options.moduleId,
      billing_cycle: options.billingCycle,
    },
    subscription_data: {
      metadata: {
        organization_id: options.organizationId,
        module_id: options.moduleId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true,
    },
    locale: 'fr',
  }

  // Use existing customer or email for new customer
  if (options.customerId) {
    sessionParams.customer = options.customerId
  } else if (options.customerEmail) {
    sessionParams.customer_email = options.customerEmail
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) {
    throw new Error('Failed to create checkout session URL')
  }

  return {
    url: session.url,
    sessionId: session.id,
  }
}

// ===========================================
// MODULE SUBSCRIPTION MANAGEMENT
// ===========================================

/**
 * Get all subscriptions for an organization's customer
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const stripe = getStripe()

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  })

  return subscriptions.data
}

/**
 * Get subscription for a specific module
 */
export async function getModuleSubscription(
  customerId: string,
  moduleId: ModuleId
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe()

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 100,
  })

  // Find subscription with matching module_id in metadata
  const moduleSub = subscriptions.data.find(
    sub => sub.metadata?.['module_id'] === moduleId
  )

  return moduleSub || null
}

/**
 * Cancel a module subscription at period end
 */
export async function cancelModuleSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Resume a module subscription (cancel the pending cancellation)
 */
export async function resumeModuleSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Switch billing cycle for a module subscription (monthly <-> yearly)
 */
export async function switchModuleBillingCycle(
  subscriptionId: string,
  moduleId: ModuleId,
  newCycle: ModuleBillingCycle
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  const newPriceId = getModulePriceId(moduleId, newCycle)

  if (!newPriceId) {
    throw new Error(
      `No Stripe price configured for module "${moduleId}" with billing cycle "${newCycle}"`
    )
  }

  // Get current subscription to find the item ID
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const itemId = subscription.items.data[0]?.id

  if (!itemId) {
    throw new Error('Subscription has no items')
  }

  // Update subscription with new price and proration
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: itemId,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
    metadata: {
      ...subscription.metadata,
      billing_cycle: newCycle,
    },
  })
}

/**
 * Immediately cancel a module subscription (for refunds, etc.)
 */
export async function cancelModuleSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe()
  return stripe.subscriptions.cancel(subscriptionId)
}

// ===========================================
// CUSTOMER PORTAL
// ===========================================

/**
 * Create a Stripe Customer Portal session
 * The portal shows all subscriptions for the customer (grouped by module)
 */
export async function createModulePortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const stripe = getStripe()

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    locale: 'fr',
  })

  return { url: session.url }
}

// ===========================================
// USAGE CHECKS (for downgrade protection)
// ===========================================

export interface UsageCheckResult {
  canDowngrade: boolean
  currentUsage: Record<string, number>
  freeLimits: Record<string, number>
  exceedingLimits: Array<{
    key: string
    current: number
    freeLimit: number
    description: string
  }>
}

/**
 * Check if an organization can safely downgrade a module to free tier
 * This should be called before allowing cancellation
 *
 * Note: This function requires database access and should be implemented
 * in the main app, not in the billing package. This is a type definition
 * for what the check should return.
 */
export function formatDowngradeWarning(checkResult: UsageCheckResult): string {
  if (checkResult.canDowngrade) {
    return ''
  }

  const warnings = checkResult.exceedingLimits.map(limit => {
    return `- ${limit.description}: vous avez ${limit.current} elements, la limite gratuite est ${limit.freeLimit}`
  })

  return `Attention: votre utilisation depasse les limites du plan gratuit:\n${warnings.join('\n')}\n\nLes donnees ne seront pas supprimees mais l'acces sera limite.`
}

// ===========================================
// STRIPE PRODUCT SYNC HELPERS
// ===========================================

/**
 * Create or update Stripe Products and Prices for all modules
 * This is typically run once during setup or when prices change
 *
 * Note: In production, you'd typically create products/prices via Stripe Dashboard
 * and then reference them via environment variables. This helper is for
 * programmatic setup in development/testing.
 */
export interface ModuleProductConfig {
  id: ModuleId
  name: string
  description: string
  monthlyPriceCents: number
  yearlyPriceCents: number
}

export async function syncModuleProducts(
  modules: ModuleProductConfig[]
): Promise<Map<ModuleId, { monthlyPriceId: string; yearlyPriceId: string }>> {
  const stripe = getStripe()
  const result = new Map<ModuleId, { monthlyPriceId: string; yearlyPriceId: string }>()

  for (const module of modules) {
    // Create or update product
    let product: Stripe.Product

    const existingProducts = await stripe.products.search({
      query: `metadata["module_id"]:"${module.id}"`,
      limit: 1,
    })

    const existingProduct = existingProducts.data[0]
    if (existingProduct) {
      product = await stripe.products.update(existingProduct.id, {
        name: `Sedona CRM - ${module.name}`,
        description: module.description,
      })
    } else {
      product = await stripe.products.create({
        name: `Sedona CRM - ${module.name}`,
        description: module.description,
        metadata: {
          module_id: module.id,
        },
      })
    }

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: module.monthlyPriceCents,
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      metadata: {
        module_id: module.id,
        billing_cycle: 'monthly',
      },
    })

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: module.yearlyPriceCents,
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      metadata: {
        module_id: module.id,
        billing_cycle: 'yearly',
      },
    })

    result.set(module.id, {
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
    })
  }

  return result
}
