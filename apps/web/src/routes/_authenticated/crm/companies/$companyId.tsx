import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'
import {
  ArrowLeft,
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Users,
  FileText,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/crm/companies/$companyId')({
  component: CompanyDetailPage,
})

// Mock company data
const mockCompany = {
  id: '1',
  name: 'Acme Corp',
  siret: '123 456 789 00012',
  industry: 'Technologie',
  size: '51-200',
  website: 'www.acme.com',
  phone: '+33 1 23 45 67 89',
  email: 'contact@acme.com',
  address: {
    line1: '10 Avenue des Champs-Elysees',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
  },
  createdAt: '2024-01-10',
}

const mockContacts = [
  { id: '1', name: 'Marie Dupont', jobTitle: 'Directrice Marketing', email: 'marie@acme.com' },
  { id: '2', name: 'Jean Martin', jobTitle: 'CTO', email: 'jean@acme.com' },
  { id: '3', name: 'Sophie Bernard', jobTitle: 'Responsable RH', email: 'sophie@acme.com' },
]

const mockDeals = [
  { id: '1', name: 'Contrat annuel', amount: 50000, stage: 'Negociation', probability: 60 },
  { id: '2', name: 'Extension licence', amount: 15000, stage: 'Proposition', probability: 40 },
]

function CompanyDetailPage() {
  const { companyId } = Route.useParams()

  return (
    <div className="page-container">
      {/* Back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/crm/companies" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour aux entreprises
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" className="text-error hover:text-error">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold font-heading">{mockCompany.name}</h1>
                  <p className="text-muted-foreground">{mockCompany.industry}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{mockCompany.size} employes</span>
                    <span>SIRET: {mockCompany.siret}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coordonnees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Site web</p>
                    <a href={`https://${mockCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                      {mockCompany.website}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telephone</p>
                    <a href={`tel:${mockCompany.phone}`} className="text-sm hover:text-primary">
                      {mockCompany.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${mockCompany.email}`} className="text-sm hover:text-primary">
                      {mockCompany.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm">
                      {mockCompany.address.line1}, {mockCompany.address.postalCode}{' '}
                      {mockCompany.address.city}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contacts ({mockContacts.length})</CardTitle>
              <Link to="/crm/contacts/new">
                <Button size="sm" variant="outline">
                  Ajouter un contact
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    to="/crm/contacts/$contactId"
                    params={{ contactId: contact.id }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Deals ({mockDeals.length})</CardTitle>
              <Button size="sm" variant="outline">
                Nouveau deal
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDeals.map((deal) => (
                  <div key={deal.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{deal.name}</p>
                      <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{deal.stage}</span>
                      <span className="font-medium">{deal.amount.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Secteur</p>
                <p className="text-sm">{mockCompany.industry}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taille</p>
                <p className="text-sm">{mockCompany.size} employes</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cree le</p>
                <p className="text-sm">{mockCompany.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
