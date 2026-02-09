import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { PermissionProvider, type SubscriptionPlan, type OrganizationRole } from '@sedona/auth'
import { useOrganization } from '@/lib/auth'

// TEMPORARY: Auth disabled for development
// TODO: Re-enable auth when Supabase is configured
export const Route = createFileRoute('/_authenticated')({
  // beforeLoad: async ({ location }) => {
  //   // Check authentication status
  //   try {
  //     const client = getAuthClient()
  //     const session = await client.getSession()
  //
  //     if (!session.data) {
  //       throw redirect({
  //         to: '/login',
  //         search: {
  //           redirect: location.pathname,
  //         },
  //       })
  //     }
  //   } catch (error) {
  //     // If client not initialized or auth fails, redirect to login
  //     if (error instanceof Error && error.message.includes('redirect')) {
  //       throw error
  //     }
  //     throw redirect({
  //       to: '/login',
  //       search: {
  //         redirect: location.pathname,
  //       },
  //     })
  //   }
  // },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { organization, role } = useOrganization()

  // Récupérer le plan de l'organisation (défaut: FREE)
  // Cast explicite pour assurer la compatibilité des types
  const plan: SubscriptionPlan = (organization?.subscriptionPlan as SubscriptionPlan) || 'FREE'
  const userRole: OrganizationRole = (role as OrganizationRole) || 'employee'

  // TODO: Réactiver le PermissionProvider quand le problème de rendu sera résolu
  // Pour l'instant, on l'affiche sans le provider pour ne pas bloquer le développement
  const enablePermissionProvider = false

  const content = (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )

  if (enablePermissionProvider) {
    return (
      <PermissionProvider role={userRole} plan={plan}>
        {content}
      </PermissionProvider>
    )
  }

  return content
}
