import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Input, Card, CardContent, Badge, Progress, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@sedona/ui'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  Building2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { usePlan } from '@/hooks/usePlan'
import { useOrganization } from '@/lib/auth'
import { useContacts, useContactCount, useDeleteContact } from '@sedona/crm'

// Plan limits
const FREE_PLAN_LIMITS = {
  contacts: 150,
}

export const Route = createFileRoute('/_authenticated/crm/contacts/')({
  component: ContactsPage,
})

function ContactsPage() {
  const [search, setSearch] = useState('')
  const { isFree } = usePlan()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch contacts from Supabase
  const { data: contactsData, isLoading, error } = useContacts(
    organizationId,
    { search: search || undefined },
    { page: 1, pageSize: 25 }
  )

  // Fetch total contact count for usage tracking
  const { data: totalCount = 0 } = useContactCount(organizationId)

  // Delete contact mutation
  const deleteContactMutation = useDeleteContact()

  const contacts = contactsData?.data || []

  // Usage tracking for FREE plan
  const currentCount = totalCount
  const limit = FREE_PLAN_LIMITS.contacts
  const usagePercent = (currentCount / limit) * 100
  const isNearLimit = usagePercent >= 80
  const isAtLimit = currentCount >= limit

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des contacts</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Contacts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerez vos contacts et prospects
            </p>
          </div>
          {isFree && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : ''}`}>
                    {currentCount}/{limit} contacts
                  </span>
                  {isNearLimit && !isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  {isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Progress
                  value={usagePercent}
                  className={`h-1.5 w-24 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
                />
              </div>
              <Link to="/settings/billing" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Illimite en PRO
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          {isAtLimit && isFree ? (
            <Link to="/settings/billing">
              <Button size="sm" variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                Passer en PRO
              </Button>
            </Link>
          ) : (
            <Link to="/crm/contacts/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau contact
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Contact
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Telephone
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Entreprise
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Tags
                </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <p className="text-muted-foreground">Aucun contact trouve</p>
                    <Link to="/crm/contacts/new" className="mt-2 inline-block">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un contact
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        to="/crm/contacts/$contactId"
                        params={{ contactId: contact.id }}
                        className="flex items-center gap-3 group"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {(contact.firstName?.[0] || '').toUpperCase()}
                          {(contact.lastName?.[0] || '').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contact.jobTitle || '-'}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {contact.company?.name || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(contact.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/crm/contacts/$contactId" params={{ contactId: contact.id }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm('Etes-vous sur de vouloir supprimer ce contact ?')) {
                                deleteContactMutation.mutate(contact.id)
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Affichage de 1 a {contacts.length} sur {contactsData?.total || 0}{' '}
            contacts
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
