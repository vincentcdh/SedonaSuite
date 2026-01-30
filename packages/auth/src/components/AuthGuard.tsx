import { type FC, type ReactNode, useEffect } from 'react'
import { useAuth } from '../client/hooks'
import { Spinner } from '@sedona/ui'

export interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  onUnauthenticated?: () => void
  requiredRole?: 'owner' | 'admin' | 'member'
}

/**
 * AuthGuard component that protects routes/content based on authentication status
 * Use this to wrap protected content that requires authentication
 */
export const AuthGuard: FC<AuthGuardProps> = ({
  children,
  fallback,
  onUnauthenticated,
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && onUnauthenticated) {
      onUnauthenticated()
    }
  }, [isLoading, isAuthenticated, onUnauthenticated])

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <Spinner className="h-8 w-8" />
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}
