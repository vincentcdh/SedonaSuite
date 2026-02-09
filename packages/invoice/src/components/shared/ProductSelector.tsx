import type { FC } from 'react'
import { useState, useMemo } from 'react'
import { Input } from '@sedona/ui'
import { Package, Briefcase, Search } from 'lucide-react'
import type { Product } from '../../types'

interface ProductSelectorProps {
  products: Product[]
  value?: string
  onSelect: (product: Product) => void
  placeholder?: string
}

export const ProductSelector: FC<ProductSelectorProps> = ({
  products,
  value,
  onSelect,
  placeholder = 'Rechercher un produit...',
}) => {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === value)
  }, [products, value])

  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 10)
    const lower = search.toLowerCase()
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.sku?.toLowerCase().includes(lower) ||
          p.category?.toLowerCase().includes(lower)
      )
      .slice(0, 10)
  }, [products, search])

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const handleSelect = (product: Product) => {
    onSelect(product)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={selectedProduct ? selectedProduct.name : search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Liste des produits */}
          <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredProducts.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Aucun produit trouve
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                  onClick={() => handleSelect(product)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {product.type === 'service' ? (
                      <Briefcase className="h-4 w-4 text-primary" />
                    ) : (
                      <Package className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">
                        Ref: {product.sku}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(product.unitPrice, product.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      / {product.unit}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
