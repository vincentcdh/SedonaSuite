// ===========================================
// ADMIN AUTHENTICATION
// ===========================================
// Simple single-user auth for admin console

const ADMIN_STORAGE_KEY = 'sedona_admin_auth'

// Default admin credentials (change in production!)
const ADMIN_EMAIL = 'admin@sedona.ai'
const ADMIN_PASSWORD = 'SedonaAdmin2024!'

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
}

export function login(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(ADMIN_STORAGE_KEY)
}
