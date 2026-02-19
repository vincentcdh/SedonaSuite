import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@sedona/ui'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/auth'
import { Logo } from '@/components/Logo'
import { getSupabaseClient } from '@sedona/database'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Check if we have a valid recovery session from Supabase
  // Supabase sends tokens in the URL hash fragment (#access_token=...&type=recovery)
  // The Supabase client automatically detects and processes these tokens
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseClient()

      // Listen for auth state changes (Supabase processes hash tokens automatically)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            // Valid recovery session
            setIsValidSession(true)
          } else if (session) {
            // Check if this is a recovery session
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const type = hashParams.get('type')
            if (type === 'recovery') {
              setIsValidSession(true)
            } else {
              // Regular session, not a password reset
              setIsValidSession(true)
            }
          }
        }
      )

      // Also check current session
      const { data: { session } } = await supabase.auth.getSession()

      // Check URL hash for recovery type
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      const accessToken = hashParams.get('access_token')

      if (type === 'recovery' || accessToken || session) {
        setIsValidSession(true)
      } else {
        setIsValidSession(false)
      }

      return () => {
        subscription.unsubscribe()
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Sign out after password change to force re-login with new password
      await supabase.auth.signOut()

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Verification en cours...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Invalid or expired link
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lien invalide</CardTitle>
              <CardDescription>
                Le lien de reinitialisation est invalide ou a expire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez demander un nouveau lien de reinitialisation.
              </p>

              <Link to="/forgot-password">
                <Button className="w-full">
                  Demander un nouveau lien
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mot de passe modifie</CardTitle>
              <CardDescription>
                Votre mot de passe a ete reinitialise avec succes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>

              <Button className="w-full" onClick={() => navigate({ to: '/login' })}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-muted-foreground mt-2">Nouveau mot de passe</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reinitialiser le mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe securise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-error">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  8 caracteres minimum, avec majuscule, minuscule et chiffre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Reinitialisation...' : 'Reinitialiser le mot de passe'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Retour a la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
