import type { FC } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'
import { Plus, List } from 'lucide-react'
import type { Product } from '../../types'
import type { LineItemFormData } from '../schemas'
import { LineItemRow } from './LineItemRow'

interface LineItemsEditorProps {
  items: LineItemFormData[]
  products: Product[]
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, data: Partial<LineItemFormData>) => void
  onSelectProduct: (index: number, product: Product) => void
}

export const LineItemsEditor: FC<LineItemsEditorProps> = ({
  items,
  products,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onSelectProduct,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="h-5 w-5" />
            Lignes
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ligne
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* En-tete */}
        <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b mb-2">
          <div className="col-span-1"></div>
          <div className="col-span-4">Description</div>
          <div className="col-span-1 text-right">Qte</div>
          <div className="col-span-1 text-center">Unite</div>
          <div className="col-span-2 text-right">Prix unit. HT</div>
          <div className="col-span-1 text-center">TVA</div>
          <div className="col-span-1 text-right">Total HT</div>
          <div className="col-span-1"></div>
        </div>

        {/* Lignes */}
        <div className="space-y-0">
          {items.map((item, index) => (
            <LineItemRow
              key={item.id || index}
              item={item}
              index={index}
              products={products}
              onUpdate={(data) => onUpdateItem(index, data)}
              onSelectProduct={(product) => onSelectProduct(index, product)}
              onRemove={() => onRemoveItem(index)}
              canRemove={items.length > 1}
            />
          ))}
        </div>

        {/* Bouton ajouter en bas */}
        <div className="mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddItem}
            className="w-full justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ligne
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
