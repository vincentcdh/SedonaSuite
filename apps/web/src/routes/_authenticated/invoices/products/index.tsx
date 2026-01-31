import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, CardContent, Input, Badge } from '@sedona/ui'
import {
  Plus,
  Search,
  Package,
  Briefcase,
  MoreHorizontal,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useProducts, useProductCategories, type ProductType } from '@sedona/invoice'

export const Route = createFileRoute('/_authenticated/invoices/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all')
  const [showInactive, setShowInactive] = useState(false)
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch products from Supabase
  const { data: productsData, isLoading, error } = useProducts(
    organizationId,
    {
      search: search || undefined,
      type: typeFilter !== 'all' ? typeFilter as ProductType : undefined,
      isActive: showInactive ? undefined : true,
    },
    { page: 1, pageSize: 100 }
  )

  // Fetch categories
  const { data: categoriesData } = useProductCategories(organizationId)

  const products = productsData?.data || []
  const categories = categoriesData || []

  // Stats from fetched data
  const totalProducts = products.filter(p => p.type === 'product').length
  const totalServices = products.filter(p => p.type === 'service').length
  const activeCount = products.filter(p => p.isActive).length

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des produits</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Produits & Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerez votre catalogue de produits et services
          </p>
        </div>
        <Link to="/invoices/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalServices}</p>
                <p className="text-sm text-muted-foreground">Services</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
              <div className="p-3 rounded-full bg-success/10 text-success">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={typeFilter === 'service' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter('service')}
                className="gap-1"
              >
                <Briefcase className="h-4 w-4" />
                Services
              </Button>
              <Button
                variant={typeFilter === 'product' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter('product')}
                className="gap-1"
              >
                <Package className="h-4 w-4" />
                Produits
              </Button>
            </div>
            <Button
              variant={showInactive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className="gap-1"
            >
              {showInactive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              Inactifs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Produit</th>
                  <th className="text-left p-4 font-medium">Reference</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Categorie</th>
                  <th className="text-right p-4 font-medium">Prix HT</th>
                  <th className="text-right p-4 font-medium">TVA</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-lg font-medium">Aucun produit trouve</p>
                      <p className="text-sm text-muted-foreground">
                        Modifiez vos filtres ou ajoutez un nouveau produit
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className={`hover:bg-muted/50 transition-colors ${!product.isActive ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{product.sku || '-'}</code>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="gap-1">
                          {product.type === 'service' ? (
                            <>
                              <Briefcase className="h-3 w-3" />
                              Service
                            </>
                          ) : (
                            <>
                              <Package className="h-3 w-3" />
                              Produit
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{product.category || '-'}</td>
                      <td className="p-4 text-right font-medium">
                        {(product.unitPrice || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        <span className="text-muted-foreground font-normal">/{product.unit || 'unite'}</span>
                      </td>
                      <td className="p-4 text-right text-muted-foreground">{product.vatRate || 0}%</td>
                      <td className="p-4">
                        {product.isActive ? (
                          <Badge className="bg-green-100 text-green-700">Actif</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500">Inactif</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
