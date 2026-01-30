import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  Separator,
  Badge,
} from '@sedona/ui'
import { useSession } from '@/lib/auth'
import { Shield, Key, Smartphone, Monitor, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/security')({
  component: SecuritySettingsPage,
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
      .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
      .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

// Mock data
const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Chrome sur macOS',
    location: 'Paris, France',
    lastActive: 'Actif maintenant',
    current: true,
  },
  {
    id: '2',
    device: 'Safari sur iPhone',
    location: 'Paris, France',
    lastActive: 'Il y a 2 heures',
    current: false,
  },
  {
    id: '3',
    device: 'Firefox sur Windows',
    location: 'Lyon, France',
    lastActive: 'Il y a 3 jours',
    current: false,
  },
]

function SecuritySettingsPage() {
  const { data: session } = useSession()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [sessions] = useState<Session[]>(mockSessions)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    setPasswordSuccess(false)

    try {
      // TODO: Implement password change API call
      console.log('Changing password:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPasswordSuccess(true)
      reset()
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    // TODO: Implement session revocation
    console.log('Revoking session:', sessionId)
  }

  const handleRevokeAllSessions = async () => {
    // TODO: Implement revoke all sessions
    console.log('Revoking all sessions')
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>
            Choisissez un mot de passe fort que vous n'utilisez pas ailleurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mot de passe modifie avec succes
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                aria-invalid={!!errors.currentPassword}
              />
              {errors.currentPassword && (
                <p className="text-sm text-error">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                aria-invalid={!!errors.newPassword}
              />
              {errors.newPassword && (
                <p className="text-sm text-error">{errors.newPassword.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                8 caracteres minimum, avec majuscule, minuscule et chiffre
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Authentification a deux facteurs
          </CardTitle>
          <CardDescription>
            Ajoutez une couche de securite supplementaire a votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">2FA desactivee</p>
                <p className="text-sm text-muted-foreground">
                  Protegez votre compte avec une application d'authentification
                </p>
              </div>
            </div>
            <Button variant="outline">Activer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessions actives
          </CardTitle>
          <CardDescription>
            Gerez les appareils connectes a votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((s, index) => (
            <div key={s.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{s.device}</p>
                      {s.current && (
                        <Badge variant="secondary" className="text-xs">
                          Session actuelle
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.location} · {s.lastActive}
                    </p>
                  </div>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:text-error"
                    onClick={() => handleRevokeSession(s.id)}
                  >
                    Revoquer
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Separator />

          <Button
            variant="outline"
            className="w-full"
            onClick={handleRevokeAllSessions}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Deconnecter toutes les autres sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
