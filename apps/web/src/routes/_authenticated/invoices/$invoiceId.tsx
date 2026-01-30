import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/invoices/$invoiceId')({
  component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
  const { invoiceId } = Route.useParams()

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold font-heading mb-6">Facture {invoiceId}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le detail de la facture sera implemente prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
