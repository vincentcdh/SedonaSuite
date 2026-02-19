import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ModuleAlertsBanner } from '@/components/dashboard'
import { PermissionProvider, type SubscriptionPlan, type OrganizationRole } from '@sedona/auth'
import { useOrganization } from '@/lib/auth'
import { getSupabaseClient } from '@sedona/database'
import { Spinner } from '@sedona/ui'

const SETUP_STORAGE_KEY = 'sedona_setup_complete'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return

    // Check if setup is complete (first-time instance setup)
    const setupComplete = localStorage.getItem(SETUP_STORAGE_KEY) !== null
    if (!setupComplete) {
      throw redirect({ to: '/setup' })
    }

    // Check if user is authenticated via Supabase
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { organization, organizations, role, isLoading } = useOrganization()

  // Show loading state while fetching organization
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // If no organizations, show error message (should not happen in normal flow)
  if (organizations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-lg font-medium">Aucune organisation trouvée</p>
          <p className="text-sm text-muted-foreground">
            Veuillez contacter l'administrateur ou réessayer de vous connecter.
          </p>
        </div>
      </div>
    )
  }

  // Get plan and role with proper typing
  // During transition, default to FREE plan since subscription fields are removed
  const plan: SubscriptionPlan = (organization?.subscriptionPlan as SubscriptionPlan) || 'FREE'
  const userRole: OrganizationRole = (role as OrganizationRole) || 'employee'

  const content = (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Module Alerts Banner */}
        <ModuleAlertsBanner />

        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )

  // Wrap content with PermissionProvider for RBAC
  return (
    <PermissionProvider role={userRole} plan={plan}>
      {content}
    </PermissionProvider>
  )
}
