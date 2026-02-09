import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@sedona/ui'
import { Loader2 } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import {
  useCreateQuote,
  useClients,
  useProducts,
  useInvoiceSettings,
  QuoteForm,
  type CreateQuoteInput,
} from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/quotes/new')({
  component: NewQuotePage,
})

function NewQuotePage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const { data: clientsData, isLoading: isLoadingClients } = useClients(organizationId)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(organizationId, { isActive: true })
  const { data: settings } = useInvoiceSettings(organizationId)

  const createQuote = useCreateQuote(organizationId)

  const isLoading = isLoadingClients || isLoadingProducts

  const handleSubmit = async (data: CreateQuoteInput) => {
    const quote = await createQuote.mutateAsync(data)
    navigate({ to: '/invoices/quotes/$quoteId', params: { quoteId: quote.id } })
  }

  const handleCancel = () => {
    navigate({ to: '/invoices/quotes' })
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold font-heading">Nouveau devis</h1>
      </div>

      {/* Form */}
      <QuoteForm
        clients={clientsData?.data || []}
        products={productsData?.data || []}
        settings={settings}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createQuote.isPending}
      />
    </div>
  )
}
