import Stripe from 'stripe'

// ===========================================
// STRIPE CLIENT
// ===========================================

let stripeInstance: Stripe | null = null

/**
 * Get or create the Stripe client instance
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env['STRIPE_SECRET_KEY']

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }

  return stripeInstance
}

/**
 * Initialize Stripe with a custom secret key
 */
export function initStripe(secretKey: string): Stripe {
  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  })
  return stripeInstance
}
