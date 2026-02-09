import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@sedona/ui'
import { ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import { useCreateClient, ClientForm, type CreateClientInput } from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/clients/new')({
  component: NewClientPage,
})

function NewClientPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const createClient = useCreateClient(organizationId)

  const handleSubmit = async (data: CreateClientInput) => {
    const client = await createClient.mutateAsync(data)
    navigate({ to: '/invoices/clients/$clientId', params: { clientId: client.id } })
  }

  const handleCancel = () => {
    navigate({ to: '/invoices/clients' })
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold font-heading">Nouveau client</h1>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createClient.isPending}
        />
      </div>
    </div>
  )
}
