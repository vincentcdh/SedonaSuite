import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@sedona/ui'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas'
import { useForgotPassword } from '../client/hooks'

export interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void
  onBack?: () => void
  title?: string
  description?: string
}

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBack,
  title = 'Mot de passe oublie ?',
  description = 'Entrez votre adresse email pour recevoir un lien de reinitialisation',
}) => {
  const { forgotPassword, isLoading, success } = useForgotPassword()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const email = watch('email')

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)

    try {
      await forgotPassword(data.email)
      onSuccess?.(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email envoye</CardTitle>
          <CardDescription>Verifiez votre boite de reception</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Si un compte existe pour {email}, vous recevrez un email avec les instructions
            pour reinitialiser votre mot de passe.
          </p>

          {onBack && (
            <Button variant="outline" className="w-full" onClick={onBack}>
              Retour a la connexion
            </Button>
          )}
        </CardContent>
      </Card>
    )
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Envoi...' : 'Envoyer le lien'}
          </Button>
        </form>

        {onBack && (
          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={onBack}
              className="text-primary hover:underline font-medium"
            >
              Retour a la connexion
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
