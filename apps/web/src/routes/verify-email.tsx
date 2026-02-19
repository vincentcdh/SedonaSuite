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
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import { getSupabaseClient } from '@sedona/database'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    const checkEmailVerification = async () => {
      const supabase = getSupabaseClient()

      // Check URL hash for confirmation tokens (Supabase sends them in hash fragment)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      // If we have a confirmation token in the URL, Supabase will process it automatically
      if (accessToken && type === 'signup') {
        // Wait a moment for Supabase to process the token
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user?.email_confirmed_at) {
          setStatus('success')
          return
        }
      }

      // Check if user is logged in and if their email is verified
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        // No session, redirect to login
        navigate({ to: '/login' })
        return
      }

      setUserEmail(session.user.email || null)

      if (session.user.email_confirmed_at) {
        // Email already verified
        setStatus('success')
      } else {
        // Email not verified, show pending state
        setStatus('pending')
      }
    }

    // Listen for auth state changes
    const supabase = getSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          setStatus('success')
        }
      }
    )

    checkEmailVerification()

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  const handleResendEmail = async () => {
    if (!userEmail) return

    setResendLoading(true)
    setResendSuccess(false)

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      if (error) {
        throw error
      }

      setResendSuccess(true)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setResendLoading(false)
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  Verification en cours...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
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

  // Pending state - waiting for email verification
  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Verifiez votre email</CardTitle>
              <CardDescription className="text-center">
                Un email de confirmation a ete envoye a {userEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Cliquez sur le lien dans l'email pour activer votre compte.
                Verifiez egalement votre dossier spam.
              </p>

              {resendSuccess && (
                <div className="p-3 rounded-md bg-success/10 border border-success/20 text-success text-sm text-center">
                  Email de confirmation renvoye avec succes
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Renvoyer l\'email de confirmation'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    // Check again if email was verified
                    window.location.reload()
                  }}
                >
                  J'ai confirme mon email
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-2">
                <Link to="/login" className="text-primary hover:underline">
                  Retour a la connexion
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" />
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

            <Link to="/login">
              <Button className="w-full">
                Se connecter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
