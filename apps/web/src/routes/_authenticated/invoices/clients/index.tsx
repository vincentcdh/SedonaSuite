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
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/invoices/clients/')({
  component: ClientsPage,
})

// Mock data
const mockClients = [
  {
    id: '1',
    name: 'Acme Corp',
    legalName: 'Acme Corporation SAS',
    contactName: 'Marie Dupont',
    billingEmail: 'facturation@acme.fr',
    billingPhone: '01 23 45 67 89',
    billingCity: 'Paris',
    invoicesCount: 12,
    totalRevenue: 45000,
    outstandingAmount: 4500,
  },
  {
    id: '2',
    name: 'Tech Solutions',
    legalName: 'Tech Solutions SARL',
    contactName: 'Jean Martin',
    billingEmail: 'comptabilite@techsolutions.fr',
    billingPhone: '01 98 76 54 32',
    billingCity: 'Lyon',
    invoicesCount: 8,
    totalRevenue: 32000,
    outstandingAmount: 2850,
  },
  {
    id: '3',
    name: 'Design Studio',
    legalName: 'Design Studio EURL',
    contactName: 'Sophie Bernard',
    billingEmail: 'admin@designstudio.fr',
    billingPhone: '04 56 78 90 12',
    billingCity: 'Bordeaux',
    invoicesCount: 5,
    totalRevenue: 15000,
    outstandingAmount: 1200,
  },
  {
    id: '4',
    name: 'Marketing Pro',
    legalName: 'Marketing Pro SAS',
    contactName: 'Pierre Durand',
    billingEmail: 'finance@marketingpro.fr',
    billingPhone: '03 45 67 89 01',
    billingCity: 'Lille',
    invoicesCount: 15,
    totalRevenue: 78000,
    outstandingAmount: 0,
  },
  {
    id: '5',
    name: 'Finance Plus',
    legalName: 'Finance Plus SA',
    contactName: 'Claire Moreau',
    billingEmail: 'billing@financeplus.fr',
    billingPhone: '01 11 22 33 44',
    billingCity: 'Marseille',
    invoicesCount: 20,
    totalRevenue: 125000,
    outstandingAmount: 5200,
  },
]

function ClientsPage() {
  const [search, setSearch] = useState('')

  const filteredClients = mockClients.filter((client) => {
    if (search && !client.name.toLowerCase().includes(search.toLowerCase()) &&
        !client.contactName.toLowerCase().includes(search.toLowerCase()) &&
        !client.billingEmail.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const totalClients = mockClients.length
  const totalRevenue = mockClients.reduce((sum, c) => sum + c.totalRevenue, 0)
  const totalOutstanding = mockClients.reduce((sum, c) => sum + c.outstandingAmount, 0)

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.legalName}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{client.contactName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{client.billingEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.billingPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{client.billingCity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-sm">
                  <span className="text-muted-foreground">{client.invoicesCount} factures</span>
                  {client.outstandingAmount > 0 && (
                    <Badge variant="outline" className="ml-2 text-warning border-warning">
                      {client.outstandingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} du
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

        {filteredClients.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">Aucun client trouve</p>
            <p className="text-sm text-muted-foreground">
              Modifiez votre recherche ou ajoutez un nouveau client
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
