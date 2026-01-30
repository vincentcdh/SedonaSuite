import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/invoices/new')({
  component: NewInvoicePage,
})

function NewInvoicePage() {
  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold font-heading mb-6">Nouvelle facture</h1>
      <Card>
        <CardHeader>
          <CardTitle>Formulaire de creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le formulaire de creation de facture sera implemente prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
