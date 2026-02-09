import type { FC } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
} from '@sedona/ui'
import { Package, Briefcase, Euro, Tag, Save, Loader2 } from 'lucide-react'
import type { Product, CreateProductInput } from '../../types'
import { productFormSchema, type ProductFormData } from '../schemas'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const ProductForm: FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name || '',
          description: product.description || '',
          sku: product.sku || '',
          type: product.type || 'service',
          unitPrice: product.unitPrice || 0,
          currency: product.currency || 'EUR',
          unit: product.unit || 'unite',
          vatRate: product.vatRate || 20,
          vatExempt: product.vatExempt || false,
          category: product.category || '',
          accountingCode: product.accountingCode || '',
          isActive: product.isActive ?? true,
        }
      : {
          type: 'service',
          unitPrice: 0,
          currency: 'EUR',
          unit: 'unite',
          vatRate: 20,
          vatExempt: false,
          isActive: true,
        },
  })

  const productType = watch('type')
  const unitPrice = watch('unitPrice')
  const vatRate = watch('vatRate')
  const vatExempt = watch('vatExempt')
  const isActive = watch('isActive')

  // Calcul du prix TTC en temps reel
  const ttcPrice = useMemo(() => {
    if (vatExempt || !unitPrice) return unitPrice || 0
    return unitPrice * (1 + vatRate / 100)
  }, [unitPrice, vatRate, vatExempt])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit({
      name: data.name,
      description: data.description || undefined,
      sku: data.sku || undefined,
      type: data.type,
      unitPrice: data.unitPrice,
      currency: data.currency,
      unit: data.unit,
      vatRate: data.vatExempt ? 0 : data.vatRate,
      vatExempt: data.vatExempt,
      category: data.category || undefined,
      accountingCode: data.accountingCode || undefined,
      isActive: data.isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={productType === 'service' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue('type', 'service')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Service
            </Button>
            <Button
              type="button"
              variant={productType === 'product' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setValue('type', 'product')}
            >
              <Package className="h-4 w-4 mr-2" />
              Produit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {productType === 'service' ? (
              <Briefcase className="h-5 w-5" />
            ) : (
              <Package className="h-5 w-5" />
            )}
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                placeholder={productType === 'service' ? 'Developpement web' : 'Licence logiciel'}
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Reference (SKU)</Label>
              <Input
                id="sku"
                placeholder="DEV-001"
                {...register('sku')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description du produit ou service..."
              rows={3}
              {...register('description')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tarification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Euro className="h-5 w-5" />
            Tarification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Prix unitaire HT *</Label>
              <div className="relative">
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="pr-8"
                  {...register('unitPrice', { valueAsNumber: true })}
                  aria-invalid={!!errors.unitPrice}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              </div>
              {errors.unitPrice && (
                <p className="text-sm text-error">{errors.unitPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unite</Label>
              <Select
                value={watch('unit')}
                onValueChange={(value) => setValue('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unite">Unite</SelectItem>
                  <SelectItem value="heure">Heure</SelectItem>
                  <SelectItem value="jour">Jour</SelectItem>
                  <SelectItem value="mois">Mois</SelectItem>
                  <SelectItem value="forfait">Forfait</SelectItem>
                  <SelectItem value="kg">Kilogramme</SelectItem>
                  <SelectItem value="m2">Metre carre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="vatRate">Taux de TVA</Label>
              <Select
                value={watch('vatRate')?.toString()}
                onValueChange={(value) => setValue('vatRate', parseFloat(value))}
                disabled={vatExempt}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="2.1">2.1%</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <Switch
                id="vatExempt"
                checked={vatExempt}
                onCheckedChange={(checked) => setValue('vatExempt', checked)}
              />
              <Label htmlFor="vatExempt" className="cursor-pointer">
                Exonere de TVA
              </Label>
            </div>
          </div>

          {/* Resume prix */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Prix HT</p>
                <p className="font-medium">{formatCurrency(unitPrice || 0)}</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Prix TTC</p>
                <p className="text-lg font-bold">{formatCurrency(ttcPrice)}</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Categorisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Categorisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Input
                id="category"
                placeholder="Developpement, Design, etc."
                {...register('category')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountingCode">Code comptable</Label>
              <Input
                id="accountingCode"
                placeholder="706000"
                {...register('accountingCode')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Actif</p>
              <p className="text-sm text-muted-foreground">
                Les produits inactifs ne sont pas proposes lors de la creation de factures
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Enregistrement...' : isEditing ? 'Mettre a jour' : 'Creer le produit'}
        </Button>
      </div>
    </form>
  )
}
