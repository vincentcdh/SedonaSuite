/**
 * Plan limits for Sedona.AI freemium model
 * -1 means unlimited
 */
export const PLAN_LIMITS = {
  FREE: {
    crm: {
      contacts: 100,
      companies: 20,
      pipelines: 1,
      customFields: 3,
      statsBlurred: true,
      exportEnabled: false,
      automationsEnabled: false,
    },
    invoice: {
      invoicesPerMonth: 10,
      quotesPerMonth: 10,
      watermarkPdf: true,
      recurringEnabled: false,
      remindersEnabled: false,
    },
    projects: {
      projects: 3,
      membersPerProject: 3,
      storageGb: 1,
      ganttBlurred: true,
      timeTrackingEnabled: false,
    },
    tickets: {
      ticketsPerMonth: 50,
      agents: 1,
      slaEnabled: false,
      automationsEnabled: false,
    },
    global: {
      n8nWorkflows: 0,
      apiAccess: false,
      supportLevel: 'community' as const,
    },
  },
  PRO: {
    crm: {
      contacts: 10000,
      companies: 2000,
      pipelines: 10,
      customFields: 50,
      statsBlurred: false,
      exportEnabled: true,
      automationsEnabled: true,
    },
    invoice: {
      invoicesPerMonth: -1,
      quotesPerMonth: -1,
      watermarkPdf: false,
      recurringEnabled: true,
      remindersEnabled: true,
    },
    projects: {
      projects: 50,
      membersPerProject: 20,
      storageGb: 50,
      ganttBlurred: false,
      timeTrackingEnabled: true,
    },
    tickets: {
      ticketsPerMonth: -1,
      agents: 10,
      slaEnabled: true,
      automationsEnabled: true,
    },
    global: {
      n8nWorkflows: 10,
      apiAccess: true,
      supportLevel: 'priority' as const,
    },
  },
  ENTERPRISE: {
    crm: {
      contacts: -1,
      companies: -1,
      pipelines: -1,
      customFields: -1,
      statsBlurred: false,
      exportEnabled: true,
      automationsEnabled: true,
    },
    invoice: {
      invoicesPerMonth: -1,
      quotesPerMonth: -1,
      watermarkPdf: false,
      recurringEnabled: true,
      remindersEnabled: true,
    },
    projects: {
      projects: -1,
      membersPerProject: -1,
      storageGb: -1,
      ganttBlurred: false,
      timeTrackingEnabled: true,
    },
    tickets: {
      ticketsPerMonth: -1,
      agents: -1,
      slaEnabled: true,
      automationsEnabled: true,
    },
    global: {
      n8nWorkflows: -1,
      apiAccess: true,
      supportLevel: 'dedicated' as const,
    },
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
export type ModuleName = keyof (typeof PLAN_LIMITS)['FREE']
export type SupportLevel = 'community' | 'priority' | 'dedicated'

// Helper to check if a limit is unlimited
export function isUnlimited(limit: number): boolean {
  return limit === -1
}

// Helper to get limit for a specific plan/module/feature
export function getLimit<M extends ModuleName>(
  plan: Plan,
  module: M,
  feature: keyof (typeof PLAN_LIMITS)[Plan][M]
): (typeof PLAN_LIMITS)[Plan][M][typeof feature] {
  return PLAN_LIMITS[plan][module][feature]
}
