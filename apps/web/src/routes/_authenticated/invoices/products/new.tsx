import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@sedona/ui'
import { ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import { useCreateProduct, ProductForm, type CreateProductInput } from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/products/new')({
  component: NewProductPage,
})

function NewProductPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const createProduct = useCreateProduct(organizationId)

  const handleSubmit = async (data: CreateProductInput) => {
    await createProduct.mutateAsync(data)
    navigate({ to: '/invoices/products' })
  }

  const handleCancel = () => {
    navigate({ to: '/invoices/products' })
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold font-heading">Nouveau produit</h1>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createProduct.isPending}
        />
      </div>
    </div>
  )
}
