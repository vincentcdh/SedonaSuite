import { createFileRoute, redirect } from '@tanstack/react-router'

// Signup is disabled - redirect to login
// New employees are created by admins via HR module
export const Route = createFileRoute('/signup')({
  beforeLoad: () => {
    throw redirect({
      to: '/login',
    })
  },
  component: () => null,
})
