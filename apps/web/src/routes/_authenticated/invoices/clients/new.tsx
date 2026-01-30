import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/invoices/clients/new')({
  component: NewClientPage,
})

function NewClientPage() {
  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold font-heading mb-6">Nouveau client</h1>
      <Card>
        <CardHeader>
          <CardTitle>Formulaire de creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le formulaire de creation de client sera implemente prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
