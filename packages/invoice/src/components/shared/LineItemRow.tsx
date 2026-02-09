import type { FC } from 'react'
import { useMemo } from 'react'
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { Trash2, GripVertical } from 'lucide-react'
import type { Product } from '../../types'
import type { LineItemFormData } from '../schemas'
import { ProductSelector } from './ProductSelector'

interface LineItemRowProps {
  item: LineItemFormData
  index: number
  products: Product[]
  onUpdate: (data: Partial<LineItemFormData>) => void
  onSelectProduct: (product: Product) => void
  onRemove: () => void
  canRemove: boolean
}

export const LineItemRow: FC<LineItemRowProps> = ({
  item,
  index,
  products,
  onUpdate,
  onSelectProduct,
  onRemove,
  canRemove,
}) => {
  // Calcul du total de la ligne
  const lineTotal = useMemo(() => {
    const baseTotal = item.quantity * item.unitPrice
    const discount = item.discountPercent
      ? baseTotal * (item.discountPercent / 100)
      : 0
    return baseTotal - discount
  }, [item.quantity, item.unitPrice, item.discountPercent])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2 border-b last:border-0">
      {/* Grip handle */}
      <div className="col-span-1 flex items-center justify-center pt-2">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      </div>

      {/* Description / Produit */}
      <div className="col-span-4 space-y-1">
        <ProductSelector
          products={products}
          value={item.productId}
          onSelect={onSelectProduct}
          placeholder="Selectionner ou saisir..."
        />
        <Input
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Description"
          className="text-sm"
        />
      </div>

      {/* Quantite */}
      <div className="col-span-1">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={item.quantity}
          onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 1 })}
          className="text-right"
        />
      </div>

      {/* Unite */}
      <div className="col-span-1">
        <Select
          value={item.unit}
          onValueChange={(value) => onUpdate({ unit: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unite">u</SelectItem>
            <SelectItem value="heure">h</SelectItem>
            <SelectItem value="jour">j</SelectItem>
            <SelectItem value="mois">mois</SelectItem>
            <SelectItem value="forfait">forf.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prix unitaire HT */}
      <div className="col-span-2">
        <div className="relative">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => onUpdate({ unitPrice: parseFloat(e.target.value) || 0 })}
            className="text-right pr-6"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
        </div>
      </div>

      {/* TVA */}
      <div className="col-span-1">
        <Select
          value={item.vatRate.toString()}
          onValueChange={(value) => onUpdate({ vatRate: parseFloat(value) })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0%</SelectItem>
            <SelectItem value="5.5">5.5%</SelectItem>
            <SelectItem value="10">10%</SelectItem>
            <SelectItem value="20">20%</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total HT */}
      <div className="col-span-1 flex items-center justify-end pt-2">
        <span className="font-medium text-sm">{formatCurrency(lineTotal)}</span>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-center pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
