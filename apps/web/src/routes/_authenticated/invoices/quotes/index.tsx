import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, Input, Badge } from '@sedona/ui'
import {
  Plus,
  Search,
  FileCheck,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Download,
  Mail,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/invoices/quotes/')({
  component: QuotesPage,
})

// Mock data
const mockQuotes = [
  {
    id: '1',
    quoteNumber: 'DEV-2025-0015',
    clientName: 'Acme Corp',
    issueDate: '2025-01-20',
    validUntil: '2025-02-20',
    total: 6500.00,
    status: 'sent',
  },
  {
    id: '2',
    quoteNumber: 'DEV-2025-0014',
    clientName: 'Tech Solutions',
    issueDate: '2025-01-18',
    validUntil: '2025-02-18',
    total: 3200.00,
    status: 'accepted',
  },
  {
    id: '3',
    quoteNumber: 'DEV-2025-0013',
    clientName: 'Design Studio',
    issueDate: '2025-01-15',
    validUntil: '2025-01-25',
    total: 1800.00,
    status: 'expired',
  },
  {
    id: '4',
    quoteNumber: 'DEV-2025-0012',
    clientName: 'Marketing Pro',
    issueDate: '2025-01-12',
    validUntil: '2025-02-12',
    total: 4200.00,
    status: 'rejected',
  },
  {
    id: '5',
    quoteNumber: 'DEV-2025-0011',
    clientName: 'Finance Plus',
    issueDate: '2025-01-10',
    validUntil: '2025-02-10',
    total: 7800.00,
    status: 'draft',
  },
  {
    id: '6',
    quoteNumber: 'DEV-2025-0010',
    clientName: 'Startup Inc',
    issueDate: '2025-01-08',
    validUntil: '2025-02-08',
    total: 2500.00,
    status: 'converted',
  },
]

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-muted text-muted-foreground', icon: FileCheck },
  sent: { label: 'Envoye', color: 'bg-blue-100 text-blue-700', icon: Send },
  accepted: { label: 'Accepte', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Refuse', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expire', color: 'bg-gray-100 text-gray-500', icon: Clock },
  converted: { label: 'Converti', color: 'bg-purple-100 text-purple-700', icon: ArrowRight },
}

function QuotesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredQuotes = mockQuotes.filter((quote) => {
    if (statusFilter !== 'all' && quote.status !== statusFilter) return false
    if (search && !quote.quoteNumber.toLowerCase().includes(search.toLowerCase()) &&
        !quote.clientName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Stats
  const totalValue = mockQuotes.filter(q => q.status === 'sent').reduce((sum, q) => sum + q.total, 0)
  const acceptedValue = mockQuotes.filter(q => ['accepted', 'converted'].includes(q.status)).reduce((sum, q) => sum + q.total, 0)
  const acceptanceRate = mockQuotes.length > 0
    ? Math.round((mockQuotes.filter(q => ['accepted', 'converted'].includes(q.status)).length / mockQuotes.filter(q => q.status !== 'draft').length) * 100)
    : 0

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Devis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Creez et gerez vos devis commerciaux
          </p>
        </div>
        <Link to="/invoices/quotes/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Send className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">
                  {acceptedValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-muted-foreground">Acceptes</p>
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
                <p className="text-2xl font-bold">{acceptanceRate}%</p>
                <p className="text-sm text-muted-foreground">Taux d'acceptation</p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <FileCheck className="h-5 w-5" />
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
                placeholder="Rechercher un devis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              {['all', 'draft', 'sent', 'accepted', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'Tous' : statusConfig[status as keyof typeof statusConfig]?.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Numero</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Validite</th>
                  <th className="text-right p-4 font-medium">Montant</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredQuotes.map((quote) => {
                  const status = statusConfig[quote.status as keyof typeof statusConfig]
                  const StatusIcon = status.icon
                  return (
                    <tr key={quote.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <Link
                          to="/invoices/quotes/$quoteId"
                          params={{ quoteId: quote.id }}
                          className="font-medium text-primary hover:underline"
                        >
                          {quote.quoteNumber}
                        </Link>
                      </td>
                      <td className="p-4">{quote.clientName}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(quote.issueDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {quote.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="p-4">
                        <Badge className={`${status.color} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
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
                          {quote.status === 'draft' && (
                            <Button variant="ghost" size="icon" title="Envoyer">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {quote.status === 'accepted' && (
                            <Button variant="ghost" size="icon" title="Convertir en facture">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <FileCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucun devis trouve</p>
                      <p className="text-sm text-muted-foreground">
                        Modifiez vos filtres ou creez un nouveau devis
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
