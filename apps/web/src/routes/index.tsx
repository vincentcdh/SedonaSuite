import { createFileRoute, redirect } from '@tanstack/react-router'

const AUTH_STORAGE_KEY = 'sedona_auth_session'
const SETUP_STORAGE_KEY = 'sedona_setup_complete'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return

    // Check if setup has been completed
    const setupComplete = localStorage.getItem(SETUP_STORAGE_KEY) !== null

    if (!setupComplete) {
      // First time: redirect to setup page
      throw redirect({
        to: '/setup',
      })
    }

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) !== null

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
