import { createFileRoute, redirect } from '@tanstack/react-router'

const STORAGE_KEY = 'sedona_auth_session'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Check if user is authenticated via localStorage
    const isAuthenticated =
      typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== null

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
  component: () => null,
})
