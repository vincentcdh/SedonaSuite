import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@sedona/ui'
import { Bell, Mail, MessageSquare, FileText, Users, CreditCard } from 'lucide-react'
import { cn } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationsSettingsPage,
})

interface NotificationSetting {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  email: boolean
  push: boolean
}

const initialSettings: NotificationSetting[] = [
  {
    id: 'new_contact',
    label: 'Nouveaux contacts',
    description: 'Quand un nouveau contact est ajoute au CRM',
    icon: Users,
    email: true,
    push: true,
  },
  {
    id: 'invoice_paid',
    label: 'Factures payees',
    description: 'Quand une facture est reglee par un client',
    icon: FileText,
    email: true,
    push: true,
  },
  {
    id: 'invoice_overdue',
    label: 'Factures en retard',
    description: 'Quand une facture depasse la date d\'echeance',
    icon: CreditCard,
    email: true,
    push: true,
  },
  {
    id: 'ticket_assigned',
    label: 'Tickets assignes',
    description: 'Quand un ticket vous est assigne',
    icon: MessageSquare,
    email: true,
    push: true,
  },
  {
    id: 'team_invite',
    label: 'Invitations equipe',
    description: 'Quand quelqu\'un rejoint votre organisation',
    icon: Users,
    email: true,
    push: false,
  },
  {
    id: 'billing_alerts',
    label: 'Alertes facturation',
    description: 'Rappels de renouvellement et notifications de paiement',
    icon: CreditCard,
    email: true,
    push: false,
  },
]

function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleSetting = (id: string, type: 'email' | 'push') => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [type]: !s[type] } : s
      )
    )
    setSuccess(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement save notification settings API call
      console.log('Saving settings:', settings)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notifications par email
          </CardTitle>
          <CardDescription>
            Choisissez les notifications que vous souhaitez recevoir par email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting, index) => (
            <div key={setting.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <setting.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={setting.email}
                  onClick={() => toggleSetting(setting.id, 'email')}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    setting.email ? 'bg-primary' : 'bg-input'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                      setting.email ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications push
          </CardTitle>
          <CardDescription>
            Recevez des notifications en temps reel dans votre navigateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting, index) => (
            <div key={setting.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <setting.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={setting.push}
                  onClick={() => toggleSetting(setting.id, 'push')}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    setting.push ? 'bg-primary' : 'bg-input'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                      setting.push ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {success && (
          <p className="text-sm text-success">Preferences enregistrees</p>
        )}
        <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
          {isLoading ? 'Enregistrement...' : 'Enregistrer les preferences'}
        </Button>
      </div>
    </div>
  )
}
