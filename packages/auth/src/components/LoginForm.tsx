import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@sedona/ui'
import { signInSchema, type SignInFormData } from '../schemas'
import { useSignIn } from '../client/hooks'

export interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
  onSignUp?: () => void
  title?: string
  description?: string
}

export const LoginForm: FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onSignUp,
  title = 'Connexion',
  description = 'Connectez-vous a votre compte',
}) => {
  const { signIn, isLoading } = useSignIn()
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
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublie ?
                </button>
              )}
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        {onSignUp && (
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Pas encore de compte ? </span>
            <button
              type="button"
              onClick={onSignUp}
              className="text-primary hover:underline font-medium"
            >
              Creer un compte
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
