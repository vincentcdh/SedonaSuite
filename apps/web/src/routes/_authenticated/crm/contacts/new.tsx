import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Label } from '@sedona/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useCreateContact } from '@sedona/crm'

export const Route = createFileRoute('/_authenticated/crm/contacts/new')({
  component: NewContactPage,
})

function NewContactPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''
  const createContactMutation = useCreateContact()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      jobTitle: formData.get('jobTitle') as string || undefined,
      addressLine1: formData.get('addressLine1') as string || undefined,
      postalCode: formData.get('postalCode') as string || undefined,
      city: formData.get('city') as string || undefined,
      source: formData.get('source') as string || undefined,
    }

    if (!data.firstName || !data.lastName) {
      setError('Le prenom et le nom sont requis')
      return
    }

    try {
      await createContactMutation.mutateAsync({
        organizationId,
        data,
      })
      navigate({ to: '/crm/contacts' })
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la creation du contact')
    }
  }

  return (
    <div className="page-container max-w-3xl">
      {/* Back button */}
      <Link to="/crm/contacts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour aux contacts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-medium mb-4">Informations personnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prenom *</Label>
                  <Input id="firstName" name="firstName" placeholder="Marie" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input id="lastName" name="lastName" placeholder="Dupont" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="marie.dupont@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div>
              <h3 className="text-sm font-medium mb-4">Informations professionnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Fonction</Label>
                  <Input id="jobTitle" name="jobTitle" placeholder="Directrice Marketing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input id="company" name="company" placeholder="Acme Corp" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-medium mb-4">Adresse</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Adresse</Label>
                  <Input id="addressLine1" name="addressLine1" placeholder="123 Rue de la Paix" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input id="postalCode" name="postalCode" placeholder="75001" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" name="city" placeholder="Paris" />
                  </div>
                </div>
              </div>
            </div>

            {/* Source */}
            <div>
              <h3 className="text-sm font-medium mb-4">Source</h3>
              <div className="space-y-2">
                <Label htmlFor="source">Source d&apos;acquisition</Label>
                <select
                  id="source"
                  name="source"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selectionnez une source</option>
                  <option value="website">Site web</option>
                  <option value="referral">Recommandation</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="trade_show">Salon</option>
                  <option value="cold_call">Prospection telephonique</option>
                  <option value="email_campaign">Campagne email</option>
                  <option value="partner">Partenaire</option>
                  <option value="manual">Saisie manuelle</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Link to="/crm/contacts">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={createContactMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createContactMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
