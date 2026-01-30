import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // TODO: Check authentication status with Better Auth
    const isAuthenticated = true // Placeholder

    if (isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: () => null, // Will never render due to redirect
})
