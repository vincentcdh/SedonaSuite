// ===========================================
// PREFERENCES PAGE
// ===========================================

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
  Switch,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import {
  Mail,
  Bell,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Target,
  Calendar,
  CheckCircle2,
  Layout,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/preferences')({
  component: PreferencesPage,
})

// Mock preferences
const initialPreferences = {
  // Email notifications
  emailNotifications: true,
  emailMarketing: false,
  emailWeeklyDigest: true,

  // In-app notifications - CRM
  notifyMentions: true,
  notifyComments: true,
  notifyDealsUpdates: true,

  // In-app notifications - Facturation
  notifyInvoicePaid: true,
  notifyInvoiceOverdue: true,

  // In-app notifications - Équipe
  notifyAssignments: true,
  notifyLeaveRequests: true,

  // Interface
  itemsPerPage: '25',
  defaultModule: 'dashboard',
}

const defaultModuleOptions = [
  { value: 'dashboard', label: 'Tableau de bord' },
  { value: 'crm', label: 'CRM' },
  { value: 'invoices', label: 'Facturation' },
  { value: 'projects', label: 'Projets' },
  { value: 'tickets', label: 'Tickets' },
  { value: 'hr', label: 'Equipe' },
  { value: 'docs', label: 'Documents' },
]

const itemsPerPageOptions = [
  { value: '10', label: '10 elements' },
  { value: '25', label: '25 elements' },
  { value: '50', label: '50 elements' },
  { value: '100', label: '100 elements' },
]

function PreferencesPage() {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const updatePreference = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Save preferences to database
      console.log('Saving preferences:', preferences)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success toast */}
      {success && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Preferences enregistrees avec succes
        </div>
      )}

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notifications Email
          </CardTitle>
          <CardDescription>
            Configurez les emails que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recevoir les notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Activez pour recevoir des emails de notification
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(v) => updatePreference('emailNotifications', v)}
            />
          </div>

          <Separator />

          <div className={`space-y-4 ${!preferences.emailNotifications ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Emails marketing et nouveautes</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des informations sur les nouvelles fonctionnalites
                </p>
              </div>
              <Switch
                checked={preferences.emailMarketing}
                onCheckedChange={(v) => updatePreference('emailMarketing', v)}
                disabled={!preferences.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resume hebdomadaire d'activite</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez un recap chaque semaine de votre activite
                </p>
              </div>
              <Switch
                checked={preferences.emailWeeklyDigest}
                onCheckedChange={(v) => updatePreference('emailWeeklyDigest', v)}
                disabled={!preferences.emailNotifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications - CRM */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications In-App - CRM
          </CardTitle>
          <CardDescription>
            Notifications relatives a vos contacts et opportunites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Mentions (@moi)</Label>
                <p className="text-sm text-muted-foreground">
                  Quand quelqu'un vous mentionne dans un commentaire
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyMentions}
              onCheckedChange={(v) => updatePreference('notifyMentions', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Commentaires sur mes elements</Label>
                <p className="text-sm text-muted-foreground">
                  Nouveau commentaire sur un contact ou opportunite que vous suivez
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyComments}
              onCheckedChange={(v) => updatePreference('notifyComments', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Mises a jour de mes deals</Label>
                <p className="text-sm text-muted-foreground">
                  Changement de statut sur vos opportunites
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyDealsUpdates}
              onCheckedChange={(v) => updatePreference('notifyDealsUpdates', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications - Facturation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications In-App - Facturation
          </CardTitle>
          <CardDescription>
            Notifications relatives a vos factures et paiements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Factures payees</Label>
                <p className="text-sm text-muted-foreground">
                  Quand une facture est reglee par un client
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyInvoicePaid}
              onCheckedChange={(v) => updatePreference('notifyInvoicePaid', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Factures en retard</Label>
                <p className="text-sm text-muted-foreground">
                  Quand une facture depasse la date d'echeance
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyInvoiceOverdue}
              onCheckedChange={(v) => updatePreference('notifyInvoiceOverdue', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications - Équipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications In-App - Equipe
          </CardTitle>
          <CardDescription>
            Notifications relatives a votre equipe et aux taches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Assignations de taches</Label>
                <p className="text-sm text-muted-foreground">
                  Quand une tache ou un ticket vous est assigne
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyAssignments}
              onCheckedChange={(v) => updatePreference('notifyAssignments', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label>Demandes de conges</Label>
                <p className="text-sm text-muted-foreground">
                  Nouvelles demandes de conges a approuver (managers uniquement)
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyLeaveRequests}
              onCheckedChange={(v) => updatePreference('notifyLeaveRequests', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interface preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Interface
          </CardTitle>
          <CardDescription>
            Personnalisez l'affichage de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Elements par page</Label>
              <Select
                value={preferences.itemsPerPage}
                onValueChange={(v) => updatePreference('itemsPerPage', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Nombre d'elements affiches dans les listes et tableaux
              </p>
            </div>

            <div className="space-y-2">
              <Label>Module par defaut</Label>
              <Select
                value={preferences.defaultModule}
                onValueChange={(v) => updatePreference('defaultModule', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultModuleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Page affichee a la connexion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer les preferences'}
        </Button>
      </div>
    </div>
  )
}
