import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/invoices/clients/$clientId')({
  component: ClientDetailPage,
})

function ClientDetailPage() {
  const { clientId } = Route.useParams()

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold font-heading mb-6">Client {clientId}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Details du client</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le detail du client sera implemente prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
