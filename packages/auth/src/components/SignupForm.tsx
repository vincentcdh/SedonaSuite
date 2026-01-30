import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@sedona/ui'
import { signUpSchema, type SignUpFormData } from '../schemas'
import { useSignUp, useOrganization } from '../client/hooks'

export interface SignupFormProps {
  onSuccess?: (email: string) => void
  onLogin?: () => void
  title?: string
  description?: string
  showOrganization?: boolean
  termsUrl?: string
  privacyUrl?: string
}

export const SignupForm: FC<SignupFormProps> = ({
  onSuccess,
  onLogin,
  title = 'Inscription',
  description = 'Creez votre compte gratuitement',
  showOrganization = true,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
}) => {
  const { signUp, isLoading } = useSignUp()
  const { createOrganization } = useOrganization()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const email = watch('email')

  const onSubmit = async (data: SignUpFormData) => {
    setError(null)

    try {
      await signUp(data.email, data.password, data.name)

      if (showOrganization && data.organizationName) {
        await createOrganization(data.organizationName)
      }

      onSuccess?.(email)
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
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              autoComplete="name"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          {showOrganization && (
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nom de l'entreprise</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Mon Entreprise SARL"
                autoComplete="organization"
                {...register('organizationName')}
                aria-invalid={!!errors.organizationName}
              />
              {errors.organizationName && (
                <p className="text-sm text-error">{errors.organizationName.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@entreprise.fr"
              autoComplete="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
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

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              className="h-4 w-4 rounded border-input mt-0.5"
              {...register('acceptTerms')}
            />
            <Label htmlFor="acceptTerms" className="text-sm font-normal">
              J'accepte les{' '}
              <a href={termsUrl} className="text-primary hover:underline">
                Conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href={privacyUrl} className="text-primary hover:underline">
                Politique de confidentialite
              </a>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-error">{errors.acceptTerms.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creation...' : 'Creer mon compte'}
          </Button>
        </form>

        {onLogin && (
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Deja un compte ? </span>
            <button
              type="button"
              onClick={onLogin}
              className="text-primary hover:underline font-medium"
            >
              Se connecter
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
