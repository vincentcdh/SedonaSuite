import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
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
import { signInSchema, useSignIn, type SignInFormData } from '@/lib/auth'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading: isSigningIn } = useSignIn()
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

    try {
      await signIn(data.email, data.password, data.rememberMe)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
