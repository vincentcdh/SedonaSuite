import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, Input, Badge } from '@sedona/ui'
import {
  Plus,
  Search,
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Download,
  Mail,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useInvoices, type InvoiceStatus } from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/')({
  component: InvoicesPage,
})

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-muted text-muted-foreground', icon: FileText },
  sent: { label: 'Envoyee', color: 'bg-blue-100 text-blue-700', icon: Send },
  paid: { label: 'Payee', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  partial: { label: 'Partielle', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  overdue: { label: 'En retard', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Annulee', color: 'bg-gray-100 text-gray-500', icon: FileText },
}

function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch invoices from Supabase
  const { data: invoicesData, isLoading, error } = useInvoices(
    organizationId,
    {
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter as InvoiceStatus : undefined,
    },
    { page: 1, pageSize: 50 }
  )

  const invoices = invoicesData?.data || []

  // Stats from fetched data
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
  const outstanding = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + ((i.total || 0) - (i.amountPaid || 0)), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des factures</p>
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
          <h1 className="text-2xl font-bold font-heading">Factures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerez vos factures et suivez les paiements
          </p>
        </div>
        <Link to="/invoices/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">
                  {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-muted-foreground">Encaisse ce mois</p>
              </div>
              <div className="p-3 rounded-full bg-success/10 text-success">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {outstanding.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-error">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">En retard</p>
              </div>
              <div className="p-3 rounded-full bg-error/10 text-error">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une facture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'Toutes' : statusConfig[status as keyof typeof statusConfig]?.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Numero</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Echeance</th>
                  <th className="text-right p-4 font-medium">Montant</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucune facture trouvee</p>
                      <p className="text-sm text-muted-foreground">
                        Modifiez vos filtres ou creez une nouvelle facture
                      </p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig]
                    const StatusIcon = status?.icon || FileText
                    return (
                      <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <Link
                            to="/invoices/$invoiceId"
                            params={{ invoiceId: invoice.id }}
                            className="font-medium text-primary hover:underline"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="p-4">{invoice.client?.name || '-'}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {(invoice.total || 0).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency || 'EUR' })}
                          {invoice.status === 'partial' && invoice.amountPaid > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Reste: {((invoice.total || 0) - (invoice.amountPaid || 0)).toLocaleString('fr-FR', { style: 'currency', currency: invoice.currency || 'EUR' })}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={`${status?.color || 'bg-muted'} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status?.label || invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Telecharger PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                            {invoice.status === 'draft' && (
                              <Button variant="ghost" size="icon" title="Envoyer">
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
