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
import { signUpSchema, useSignUp, useOrganization, type SignUpFormData } from '@/lib/auth'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { signUp, isLoading: isSigningUp } = useSignUp()
  const { createOrganization } = useOrganization()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'verify'>('form')

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
      // Create the user account
      await signUp(data.email, data.password, data.name)

      // Create the organization if provided
      if (data.organizationName) {
        await createOrganization(data.organizationName)
      }

      // Show verification step
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verifiez votre email</CardTitle>
              <CardDescription>
                Nous avons envoye un lien de verification a {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cliquez sur le lien dans l'email pour activer votre compte.
                Si vous ne trouvez pas l'email, verifiez votre dossier spam.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/login' })}
              >
                Retour a la connexion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-muted-foreground mt-2">Creez votre compte gratuitement</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Commencez avec le plan gratuit, sans carte bancaire
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
                  <a href="/terms" className="text-primary hover:underline">
                    Conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Politique de confidentialite
                  </a>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-error">{errors.acceptTerms.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp ? 'Creation...' : 'Creer mon compte'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Deja un compte ? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
