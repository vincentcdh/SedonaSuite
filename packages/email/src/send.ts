import type { ReactElement } from 'react'
import { getResend } from './client'

// ===========================================
// EMAIL SENDING
// ===========================================

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  headers?: Record<string, string>
  tags?: Array<{ name: string; value: string }>
}

export interface SendEmailResult {
  id: string
  success: boolean
  error?: string
}

// Default sender email
const DEFAULT_FROM = process.env['EMAIL_FROM'] || 'Sedona.AI <noreply@sedona.ai>'

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResend()

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      headers: options.headers,
      tags: options.tags,
    })

    if (error) {
      console.error('[Email] Failed to send:', error)
      return {
        id: '',
        success: false,
        error: error.message,
      }
    }

    return {
      id: data?.id || '',
      success: true,
    }
  } catch (err) {
    console.error('[Email] Error sending email:', err)
    return {
      id: '',
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Send a batch of emails
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  const results = await Promise.all(emails.map(sendEmail))
  return results
}
