import { Resend } from 'resend'

// ===========================================
// RESEND CLIENT
// ===========================================

let resendInstance: Resend | null = null

/**
 * Get or create the Resend client instance
 */
export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env['RESEND_API_KEY']

    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    resendInstance = new Resend(apiKey)
  }

  return resendInstance
}

/**
 * Initialize Resend with a custom API key
 */
export function initResend(apiKey: string): Resend {
  resendInstance = new Resend(apiKey)
  return resendInstance
}
