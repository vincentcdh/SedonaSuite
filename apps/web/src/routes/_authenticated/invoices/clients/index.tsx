import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, Input, Badge } from '@sedona/ui'
import {
  Plus,
  Search,
  Users,
  Building2,
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useClients } from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/clients/')({
  component: ClientsPage,
})

function ClientsPage() {
  const [search, setSearch] = useState('')
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch clients from Supabase
  const { data: clientsData, isLoading, error } = useClients(
    organizationId,
    { search: search || undefined },
    { page: 1, pageSize: 50 }
  )

  const clients = clientsData?.data || []

  // Stats from fetched data
  const totalClients = clientsData?.total || 0
  const totalRevenue = clients.reduce((sum, c) => sum + ((c as any).totalRevenue || 0), 0)
  const totalOutstanding = clients.reduce((sum, c) => sum + ((c as any).outstandingAmount || 0), 0)

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des clients</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerez vos clients et leurs informations de facturation
          </p>
        </div>
        <Link to="/invoices/clients/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalClients}</p>
                <p className="text-sm text-muted-foreground">Clients actifs</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">
                  {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-muted-foreground">CA total</p>
              </div>
              <div className="p-3 rounded-full bg-success/10 text-success">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">
                  {totalOutstanding.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-muted-foreground">Encours total</p>
              </div>
              <div className="p-3 rounded-full bg-warning/10 text-warning">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.legalName || '-'}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contactName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{client.billingEmail || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.billingPhone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{client.billingCity || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{(client as any).invoicesCount || 0} factures</span>
                    {(client as any).outstandingAmount > 0 && (
                      <Badge variant="outline" className="ml-2 text-warning border-warning">
                        {((client as any).outstandingAmount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} du
                      </Badge>
                    )}
                  </div>
                  <Link to="/invoices/clients/$clientId" params={{ clientId: client.id }}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {clients.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Aucun client trouve</p>
              <p className="text-sm text-muted-foreground">
                Modifiez votre recherche ou ajoutez un nouveau client
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
