import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@sedona/ui'
import { Loader2 } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import {
  useCreateInvoice,
  useClients,
  useProducts,
  useInvoiceSettings,
  InvoiceForm,
  type CreateInvoiceInput,
} from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/new')({
  component: NewInvoicePage,
})

function NewInvoicePage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const { data: clientsData, isLoading: isLoadingClients } = useClients(organizationId)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(organizationId, { isActive: true })
  const { data: settings } = useInvoiceSettings(organizationId)

  const createInvoice = useCreateInvoice(organizationId)

  const isLoading = isLoadingClients || isLoadingProducts

  const handleSubmit = async (data: CreateInvoiceInput) => {
    const invoice = await createInvoice.mutateAsync(data)
    navigate({ to: '/invoices/$invoiceId', params: { invoiceId: invoice.id } })
  }

  const handleCancel = () => {
    navigate({ to: '/invoices' })
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
        <h1 className="text-2xl font-bold font-heading">Nouvelle facture</h1>
      </div>

      {/* Form */}
      <InvoiceForm
        clients={clientsData?.data || []}
        products={productsData?.data || []}
        settings={settings}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createInvoice.isPending}
      />
    </div>
  )
}
