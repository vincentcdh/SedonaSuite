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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@sedona/ui'
import { useSession } from '@/lib/auth'
import { Camera, Trash2, Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSettingsPage,
})

const profileSchema = z.object({
  firstName: z.string().min(1, 'Le prenom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Mock preferences
const mockPreferences = {
  theme: 'system' as 'light' | 'dark' | 'system',
  language: 'fr',
  timezone: 'Europe/Paris',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'fr-FR',
  sidebarCollapsed: false,
}

const timezones = [
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
]

const dateFormats = [
  { value: 'DD/MM/YYYY', label: '31/12/2024 (FR)' },
  { value: 'MM/DD/YYYY', label: '12/31/2024 (US)' },
  { value: 'YYYY-MM-DD', label: '2024-12-31 (ISO)' },
]

const numberFormats = [
  { value: 'fr-FR', label: '1 234,56 (FR)' },
  { value: 'en-US', label: '1,234.56 (US)' },
  { value: 'de-DE', label: '1.234,56 (DE)' },
]

function ProfileSettingsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [preferences, setPreferences] = useState(mockPreferences)

  const user = session?.user
  const nameParts = user?.name?.split(' ') || ['', '']

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setSuccess(false)

    try {
      // TODO: Implement profile update API call
      console.log('Profile update:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    // TODO: Save to database
  }

  return (
    <div className="space-y-6">
      {/* Success toast */}
      {success && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Profil mis a jour avec succes
        </div>
      )}

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>
            Cette photo sera visible par les membres de votre equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="text-primary font-bold text-3xl">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || '?'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Changer la photo
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou GIF. 1 Mo maximum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations de profil visibles par votre equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled
                    className="bg-muted pr-20"
                  />
                  <Badge variant="default" className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600">
                    Verifie
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  {...register('phone')}
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || !isDirty}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Regional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences regionales</CardTitle>
          <CardDescription>
            Personnalisez l'affichage des dates, nombres et fuseaux horaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select
                value={preferences.language}
                onValueChange={(v) => updatePreference('language', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Francais</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(v) => updatePreference('timezone', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format de date</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(v) => updatePreference('dateFormat', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((df) => (
                    <SelectItem key={df.value} value={df.value}>
                      {df.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format des nombres</Label>
              <Select
                value={preferences.numberFormat}
                onValueChange={(v) => updatePreference('numberFormat', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {numberFormats.map((nf) => (
                    <SelectItem key={nf.value} value={nf.value}>
                      {nf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>
            Personnalisez l'interface selon vos preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-3">
              <button
                onClick={() => updatePreference('theme', 'light')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  preferences.theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <Sun className="h-5 w-5 mx-auto mb-2" />
                <p className="text-sm font-medium">Clair</p>
              </button>
              <button
                onClick={() => updatePreference('theme', 'dark')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  preferences.theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <Moon className="h-5 w-5 mx-auto mb-2" />
                <p className="text-sm font-medium">Sombre</p>
              </button>
              <button
                onClick={() => updatePreference('theme', 'system')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  preferences.theme === 'system'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <Monitor className="h-5 w-5 mx-auto mb-2" />
                <p className="text-sm font-medium">Systeme</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
