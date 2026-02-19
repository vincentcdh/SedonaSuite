import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Building2, User, Rocket, Check } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { getSupabaseClient } from '@sedona/database'

const SETUP_STORAGE_KEY = 'sedona_setup_complete'

export const Route = createFileRoute('/setup')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return

    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    // If user is logged in, check if they have organizations
    if (session) {
      // Check if user has any organizations
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .limit(1)

      // If user has organizations, they're already set up - redirect to dashboard
      if (memberships && memberships.length > 0) {
        localStorage.setItem(SETUP_STORAGE_KEY, 'true')
        throw redirect({ to: '/dashboard' })
      }
      // If no organizations, let them see the setup page to create one
      // (but they're already logged in, so setup will just create org)
    }

    // If setup flag exists and no session, redirect to login
    const setupComplete = localStorage.getItem(SETUP_STORAGE_KEY) !== null
    if (setupComplete && !session) {
      throw redirect({ to: '/login' })
    }
  },
  component: SetupPage,
})

const setupSchema = z.object({
  // Organization
  orgName: z.string().min(2, "Le nom de l'entreprise est requis"),
  orgSlug: z.string().min(2, "L'identifiant est requis").regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets"),
  // Admin user
  adminName: z.string().min(2, 'Le nom est requis'),
  adminEmail: z.string().email('Email invalide'),
  adminPassword: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type SetupFormData = z.infer<typeof setupSchema>

function SetupPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      orgSlug: '',
    },
  })

  const orgName = watch('orgName')

  // Auto-generate slug from org name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // 1. Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.adminEmail,
        password: data.adminPassword,
        options: {
          data: {
            name: data.adminName,
          },
        },
      })

      if (signUpError) {
        throw new Error(`Erreur création compte: ${signUpError.message}`)
      }

      if (!signUpData.user) {
        throw new Error('Erreur: utilisateur non créé')
      }

      // 2. Sign in to establish session (needed for RLS)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.adminEmail,
        password: data.adminPassword,
      })

      if (signInError) {
        throw new Error(`Erreur connexion: ${signInError.message}`)
      }

      // 3. Call the setup PostgreSQL function to create org and link user
      const { data: setupResult, error: setupError } = await supabase.rpc('setup_organization', {
        p_org_name: data.orgName,
        p_org_slug: data.orgSlug,
        p_admin_name: data.adminName,
        p_admin_email: data.adminEmail,
        p_user_id: signUpData.user.id,
      })

      if (setupError) {
        // Cleanup: sign out and show error
        await supabase.auth.signOut()
        throw new Error(`Erreur configuration: ${setupError.message}`)
      }

      if (!setupResult?.success) {
        await supabase.auth.signOut()
        throw new Error(setupResult?.error || 'Erreur lors de la configuration')
      }

      // Store setup complete flag
      localStorage.setItem(SETUP_STORAGE_KEY, 'true')

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Configuration terminée !</h2>
            <p className="text-muted-foreground">
              Redirection vers le tableau de bord...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-muted-foreground mt-2">Configuration initiale</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <CardTitle>Bienvenue sur Sedona</CardTitle>
            </div>
            <CardDescription>
              Configurez votre organisation et créez votre compte administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Organization Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  Votre entreprise
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgName">Nom de l'entreprise *</Label>
                  <Input
                    id="orgName"
                    placeholder="Ma Société SAS"
                    {...register('orgName', {
                      onChange: (e) => {
                        setValue('orgSlug', generateSlug(e.target.value))
                      },
                    })}
                    aria-invalid={!!errors.orgName}
                  />
                  {errors.orgName && (
                    <p className="text-sm text-red-600">{errors.orgName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Identifiant (slug) *</Label>
                  <Input
                    id="orgSlug"
                    placeholder="ma-societe"
                    {...register('orgSlug')}
                    aria-invalid={!!errors.orgSlug}
                  />
                  {errors.orgSlug && (
                    <p className="text-sm text-red-600">{errors.orgSlug.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sera utilisé dans les URLs. Uniquement lettres minuscules, chiffres et tirets.
                  </p>
                </div>
              </div>

              {/* Admin Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="w-4 h-4" />
                  Compte administrateur
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Votre nom *</Label>
                  <Input
                    id="adminName"
                    placeholder="Jean Dupont"
                    {...register('adminName')}
                    aria-invalid={!!errors.adminName}
                  />
                  {errors.adminName && (
                    <p className="text-sm text-red-600">{errors.adminName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="vous@entreprise.fr"
                    {...register('adminEmail')}
                    aria-invalid={!!errors.adminEmail}
                  />
                  {errors.adminEmail && (
                    <p className="text-sm text-red-600">{errors.adminEmail.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Mot de passe *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="********"
                      {...register('adminPassword')}
                      aria-invalid={!!errors.adminPassword}
                    />
                    {errors.adminPassword && (
                      <p className="text-sm text-red-600">{errors.adminPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                      {...register('confirmPassword')}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Configuration en cours...' : 'Démarrer avec Sedona'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          En continuant, vous acceptez les conditions d'utilisation
        </p>
      </div>
    </div>
  )
}
