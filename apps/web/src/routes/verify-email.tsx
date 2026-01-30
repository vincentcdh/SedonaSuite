import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@sedona/ui'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { getAuthClient } from '@sedona/auth/client'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search['token'] as string) || '',
  }),
})

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setErrorMessage('Lien de verification invalide')
        return
      }

      try {
        const client = getAuthClient()
        await client.verifyEmail({ query: { token } })
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setErrorMessage(
          err instanceof Error ? err.message : 'Une erreur est survenue lors de la verification'
        )
      }
    }

    verifyEmail()
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading text-primary">Sedona.AI</h1>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  Verification de votre email en cours...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading text-primary">Sedona.AI</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>
              </div>
              <CardTitle className="text-center">Email verifie</CardTitle>
              <CardDescription className="text-center">
                Votre adresse email a ete verifiee avec succes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Vous pouvez maintenant acceder a toutes les fonctionnalites de Sedona.AI.
              </p>

              <Button className="w-full" onClick={() => navigate({ to: '/dashboard' })}>
                Acceder au tableau de bord
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary">Sedona.AI</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-error/10">
                <XCircle className="h-12 w-12 text-error" />
              </div>
            </div>
            <CardTitle className="text-center">Verification echouee</CardTitle>
            <CardDescription className="text-center">
              {errorMessage || 'Le lien de verification est invalide ou a expire'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Veuillez vous connecter pour demander un nouveau lien de verification.
            </p>

            <div className="flex flex-col gap-2">
              <Link to="/login">
                <Button className="w-full">
                  Se connecter
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  Creer un compte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
