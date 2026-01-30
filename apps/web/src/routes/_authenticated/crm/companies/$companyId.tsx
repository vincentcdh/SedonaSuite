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
  Loader2,
} from 'lucide-react'
import { useCompany, useContacts, useDeals } from '@sedona/crm'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/crm/companies/$companyId')({
  component: CompanyDetailPage,
})

function CompanyDetailPage() {
  const { companyId } = Route.useParams()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch company from Supabase
  const { data: company, isLoading, error } = useCompany(companyId)

  // Fetch contacts for this company
  const { data: contactsData, isLoading: isLoadingContacts } = useContacts(
    organizationId,
    { companyId },
    { page: 1, pageSize: 10 }
  )
  const contacts = contactsData?.data || []

  // Fetch deals for this company
  const { data: dealsData, isLoading: isLoadingDeals } = useDeals(
    organizationId,
    { companyId },
    { page: 1, pageSize: 10 }
  )
  const deals = dealsData?.data || []

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement de l'entreprise</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          <Link to="/crm/companies" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux entreprises
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Entreprise non trouvee</p>
          <p className="text-sm text-muted-foreground mt-2">
            Cette entreprise n'existe pas ou a ete supprimee.
          </p>
          <Link to="/crm/companies" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux entreprises
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

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
                  <h1 className="text-2xl font-bold font-heading">{company.name}</h1>
                  <p className="text-muted-foreground">{company.industry || '-'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {company.size && <span>{company.size} employes</span>}
                    {company.siret && <span>SIRET: {company.siret}</span>}
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
                {company.website && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Site web</p>
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-primary"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Telephone</p>
                      <a href={`tel:${company.phone}`} className="text-sm hover:text-primary">
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${company.email}`} className="text-sm hover:text-primary">
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                {(company.addressLine1 || company.city) && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Adresse</p>
                      <p className="text-sm">
                        {company.addressLine1 && `${company.addressLine1}, `}
                        {company.postalCode && `${company.postalCode} `}
                        {company.city}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contacts ({contacts.length})</CardTitle>
              <Link to="/crm/contacts/new">
                <Button size="sm" variant="outline">
                  Ajouter un contact
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun contact pour cette entreprise</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact: any) => (
                    <Link
                      key={contact.id}
                      to="/crm/contacts/$contactId"
                      params={{ contactId: contact.id }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {contact.firstName?.[0] || ''}{contact.lastName?.[0] || ''}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.firstName} {contact.lastName}</p>
                        <p className="text-xs text-muted-foreground">{contact.jobTitle || '-'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Deals ({deals.length})</CardTitle>
              <Button size="sm" variant="outline">
                Nouveau deal
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingDeals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Aucun deal pour cette entreprise</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal: any) => (
                    <div key={deal.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{deal.name}</p>
                        <span className="text-xs text-muted-foreground">{deal.probability || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{deal.stage?.name || deal.status || '-'}</span>
                        <span className="font-medium">{(deal.amount || 0).toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <p className="text-sm">{company.industry || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taille</p>
                <p className="text-sm">{company.size ? `${company.size} employes` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cree le</p>
                <p className="text-sm">
                  {company.createdAt ? new Date(company.createdAt).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
