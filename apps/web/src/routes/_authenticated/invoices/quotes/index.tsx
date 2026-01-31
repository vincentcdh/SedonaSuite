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
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useQuotes, type QuoteStatus } from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/quotes/')({
  component: QuotesPage,
})

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
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch quotes from Supabase
  const { data: quotesData, isLoading, error } = useQuotes(
    organizationId,
    {
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter as QuoteStatus : undefined,
    },
    { page: 1, pageSize: 50 }
  )

  const quotes = quotesData?.data || []

  // Stats from fetched data
  const totalValue = quotes.filter(q => q.status === 'sent').reduce((sum, q) => sum + (q.total || 0), 0)
  const acceptedValue = quotes.filter(q => ['accepted', 'converted'].includes(q.status)).reduce((sum, q) => sum + (q.total || 0), 0)
  const nonDraftQuotes = quotes.filter(q => q.status !== 'draft')
  const acceptanceRate = nonDraftQuotes.length > 0
    ? Math.round((quotes.filter(q => ['accepted', 'converted'].includes(q.status)).length / nonDraftQuotes.length) * 100)
    : 0

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des devis</p>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <FileCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucun devis trouve</p>
                      <p className="text-sm text-muted-foreground">
                        Modifiez vos filtres ou creez un nouveau devis
                      </p>
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => {
                    const status = statusConfig[quote.status as keyof typeof statusConfig]
                    const StatusIcon = status?.icon || FileCheck
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
                        <td className="p-4">{quote.client?.name || '-'}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(quote.issueDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {(quote.total || 0).toLocaleString('fr-FR', { style: 'currency', currency: quote.currency || 'EUR' })}
                        </td>
                        <td className="p-4">
                          <Badge className={`${status?.color || 'bg-muted'} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status?.label || quote.status}
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
