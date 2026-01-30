import { betterAuth } from 'better-auth'
import { organization, twoFactor } from 'better-auth/plugins'

// ===========================================
// BETTER AUTH SERVER CONFIGURATION
// ===========================================

/**
 * Creates the Better Auth server instance
 * This should be called once in your API server
 */
export function createAuth(options: {
  supabaseUrl: string
  supabaseServiceKey: string
  baseUrl: string
  secret: string
  trustedOrigins?: string[]
}) {
  const { supabaseUrl, supabaseServiceKey, baseUrl, secret, trustedOrigins = [] } = options

  // Build the PostgreSQL connection URL from Supabase credentials
  const host = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
  const databaseUrl = `postgresql://postgres.${host}:${supabaseServiceKey}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

  return betterAuth({
    baseURL: baseUrl,
    secret,
    trustedOrigins,

    // ===========================================
    // DATABASE - Supabase PostgreSQL
    // ===========================================
    database: {
      type: 'postgres',
      url: databaseUrl,
    },

    // ===========================================
    // EMAIL & PASSWORD AUTH
    // ===========================================
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        // TODO: Implement with Resend
        console.log(`[Auth] Password reset for ${user.email}: ${url}`)
      },
    },

    // ===========================================
    // EMAIL VERIFICATION
    // ===========================================
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        // TODO: Implement with Resend
        console.log(`[Auth] Verify email for ${user.email}: ${url}`)
      },
      sendOnSignUp: true,
    },

    // ===========================================
    // SESSION CONFIGURATION
    // ===========================================
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    // ===========================================
    // USER CONFIGURATION
    // ===========================================
    user: {
      additionalFields: {
        phone: {
          type: 'string',
          required: false,
        },
        locale: {
          type: 'string',
          required: false,
          defaultValue: 'fr',
        },
        timezone: {
          type: 'string',
          required: false,
          defaultValue: 'Europe/Paris',
        },
      },
    },

    // ===========================================
    // PLUGINS
    // ===========================================
    plugins: [
      // Organization plugin for multi-tenancy
      organization({
        allowUserToCreateOrganization: true,
        organizationLimit: 5,
        creatorRole: 'owner',
        membershipLimit: 100,
        sendInvitationEmail: async ({ email, organization: org, inviter }) => {
          // TODO: Implement with Resend
          console.log(`[Auth] Invitation to ${email} for ${org.name} from ${inviter.user.name}`)
        },
      }),

      // Two-factor authentication
      twoFactor({
        issuer: 'Sedona.AI',
        otpOptions: {
          digits: 6,
          period: 30,
        },
      }),
    ],

    // ===========================================
    // RATE LIMITING
    // ===========================================
    rateLimit: {
      window: 60, // 1 minute
      max: 10, // 10 requests per minute
    },
  })
}

// Export type for the auth instance
export type Auth = ReturnType<typeof createAuth>
