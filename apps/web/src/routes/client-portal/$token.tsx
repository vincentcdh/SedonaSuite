// ===========================================
// CLIENT PORTAL - SHARE LINK ACCESS
// ===========================================

import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { FolderKanban, Lock, AlertCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/client-portal/$token')({
  component: ShareLinkAccessPage,
})

function ShareLinkAccessPage() {
  const { token } = Route.useParams()
  const navigate = useNavigate()
  const [isValidating, setIsValidating] = useState(true)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    setIsValidating(true)
    setError(null)

    try {
      // TODO: Implement actual token validation
      console.log('Validating token:', token)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock response
      const mockResponse = {
        valid: true,
        passwordProtected: token.includes('protected'), // Mock: if token contains 'protected'
        projectName: 'Refonte Site Web Client A',
        projectId: 'mock-project-id',
      }

      if (!mockResponse.valid) {
        setError('Ce lien n\'est pas valide ou a expire')
        return
      }

      setProjectName(mockResponse.projectName)
      setIsPasswordProtected(mockResponse.passwordProtected)

      // If not password protected, redirect directly
      if (!mockResponse.passwordProtected) {
        navigate({
          to: '/client-portal/project/$projectId',
          params: { projectId: mockResponse.projectId },
        })
      }
    } catch (err) {
      setError('Impossible de verifier ce lien')
    } finally {
      setIsValidating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: Implement actual password verification
      console.log('Verifying password for token:', token)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock: accept any password for demo
      navigate({
        to: '/client-portal/project/$projectId',
        params: { projectId: 'mock-project-id' },
      })
    } catch (err) {
      setError('Mot de passe incorrect')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verification du lien...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !isPasswordProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Lien invalide</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/client-portal' })}
              >
                Retour a la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Password protected state
  if (isPasswordProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Portail Client</h1>
            {projectName && (
              <p className="text-muted-foreground">{projectName}</p>
            )}
          </div>

          {/* Password Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Acces protege
              </CardTitle>
              <CardDescription>
                Ce projet est protege par un mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez le mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !password}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verification...
                    </>
                  ) : (
                    'Acceder au projet'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Should not reach here, but just in case
  return null
}
