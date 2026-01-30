// ===========================================
// @sedona/email - Email Package
// ===========================================

// Client
export { getResend, initResend } from './client'

// Sending
export { sendEmail, sendBatchEmails, type SendEmailOptions, type SendEmailResult } from './send'

// Templates
export {
  EmailLayout,
  WelcomeEmail,
  VerifyEmail,
  ResetPassword,
  InviteTeamMember,
  SubscriptionConfirmed,
  SubscriptionCanceled,
  type EmailLayoutProps,
  type WelcomeEmailProps,
  type VerifyEmailProps,
  type ResetPasswordProps,
  type InviteTeamMemberProps,
  type SubscriptionConfirmedProps,
  type SubscriptionCanceledProps,
} from './templates'
