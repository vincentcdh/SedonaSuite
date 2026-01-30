import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/invoices/quotes/new')({
  component: NewQuotePage,
})

function NewQuotePage() {
  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold font-heading mb-6">Nouveau devis</h1>
      <Card>
        <CardHeader>
          <CardTitle>Formulaire de creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le formulaire de creation de devis sera implemente prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
