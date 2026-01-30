import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/invoices/quotes/$quoteId')({
  component: QuoteDetailPage,
})

function QuoteDetailPage() {
  const { quoteId } = Route.useParams()

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold font-heading mb-6">Devis {quoteId}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le detail du devis sera implemente prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
