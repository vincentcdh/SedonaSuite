import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
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
import { signInSchema, type SignInFormData } from '@/lib/auth'
import { Logo } from '@/components/Logo'
import { getSupabaseClient } from '@sedona/database'

const SETUP_STORAGE_KEY = 'sedona_setup_complete'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return

    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    // If already logged in, redirect to dashboard
    if (session) {
      throw redirect({ to: '/dashboard' })
    }

    // If setup not complete, redirect to setup
    const setupComplete = localStorage.getItem(SETUP_STORAGE_KEY) !== null
    if (!setupComplete) {
      throw redirect({ to: '/setup' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    setError(null)
    setIsSigningIn(true)

    try {
      const supabase = getSupabaseClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw new Error(authError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : authError.message
        )
      }

      // Check if email is confirmed
      if (authData.user && !authData.user.email_confirmed_at) {
        // Redirect to email verification page
        navigate({ to: '/verify-email' })
        return
      }

      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-muted-foreground mt-2">Suite SaaS pour TPE francaises</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous a votre compte Sedona.AI
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  autoComplete="email"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-error">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublie ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-error">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 rounded border-input"
                  {...register('rememberMe')}
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Se souvenir de moi
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Contactez votre administrateur si vous n'avez pas de compte.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
