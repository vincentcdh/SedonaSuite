import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Label } from '@sedona/ui'
import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useCreateCompany } from '@sedona/crm'

export const Route = createFileRoute('/_authenticated/crm/companies/new')({
  component: NewCompanyPage,
})

function NewCompanyPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''
  const createCompanyMutation = useCreateCompany()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      siret: formData.get('siret') as string || undefined,
      website: formData.get('website') as string || undefined,
      industry: formData.get('industry') as string || undefined,
      size: formData.get('size') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      addressLine1: formData.get('addressLine1') as string || undefined,
      postalCode: formData.get('postalCode') as string || undefined,
      city: formData.get('city') as string || undefined,
    }

    if (!data.name) {
      setError('Le nom de l\'entreprise est requis')
      return
    }

    try {
      await createCompanyMutation.mutateAsync({
        organizationId,
        data,
      })
      navigate({ to: '/crm/companies' })
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la creation de l\'entreprise')
    }
  }

  return (
    <div className="page-container max-w-3xl">
      {/* Back button */}
      <Link to="/crm/companies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour aux entreprises
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium mb-4">Informations generales</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
                  <Input id="name" name="name" placeholder="Acme Corp" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input id="siret" name="siret" placeholder="123 456 789 00012" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" name="website" type="url" placeholder="https://www.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Secteur d&apos;activite</Label>
                  <Input id="industry" name="industry" placeholder="Technologie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Taille</Label>
                  <select
                    id="size"
                    name="size"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selectionnez</option>
                    <option value="1-10">1-10 employes</option>
                    <option value="11-50">11-50 employes</option>
                    <option value="51-200">51-200 employes</option>
                    <option value="201-500">201-500 employes</option>
                    <option value="500+">500+ employes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-medium mb-4">Coordonnees</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="contact@example.com" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-medium mb-4">Adresse</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Adresse</Label>
                  <Input id="addressLine1" name="addressLine1" placeholder="10 Avenue des Champs-Elysees" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input id="postalCode" name="postalCode" placeholder="75008" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" name="city" placeholder="Paris" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Link to="/crm/companies">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={createCompanyMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createCompanyMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
