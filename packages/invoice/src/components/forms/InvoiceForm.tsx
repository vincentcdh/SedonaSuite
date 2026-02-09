import type { FC } from 'react'
import { useEffect } from 'react'
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
  Textarea,
  Separator,
} from '@sedona/ui'
import {
  FileText,
  Calendar,
  Percent,
  StickyNote,
  Save,
  Loader2,
} from 'lucide-react'
import type { Invoice, InvoiceClient, Product, CreateInvoiceInput, InvoiceSettings } from '../../types'
import { invoiceFormSchema, type InvoiceFormData, type LineItemFormData } from '../schemas'
import { ClientSelector } from '../shared/ClientSelector'
import { LineItemsEditor } from '../shared/LineItemsEditor'
import { TotalsDisplay } from '../shared/TotalsDisplay'
import { useLineItems } from '../hooks/useLineItems'

interface InvoiceFormProps {
  invoice?: Invoice
  clients: InvoiceClient[]
  products: Product[]
  settings?: InvoiceSettings | null
  onSubmit: (data: CreateInvoiceInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const InvoiceForm: FC<InvoiceFormProps> = ({
  invoice,
  clients,
  products,
  settings,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditing = !!invoice

  // Initialiser les lignes
  const initialLineItems: LineItemFormData[] = invoice?.lineItems?.map((li) => ({
    id: li.id,
    productId: li.productId || undefined,
    description: li.description,
    quantity: li.quantity,
    unit: li.unit,
    unitPrice: li.unitPrice,
    discountPercent: li.discountPercent || undefined,
    vatRate: li.vatRate,
  })) || []

  const {
    items,
    addItem,
    removeItem,
    updateItem,
    selectProduct,
    subtotal,
    vatBreakdown,
    total,
  } = useLineItems({
    initialItems: initialLineItems.length > 0 ? initialLineItems : undefined,
    defaultVatRate: settings?.defaultVatRate || 20,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice
      ? {
          clientId: invoice.clientId,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate || '',
          subject: invoice.subject || '',
          introduction: invoice.introduction || '',
          terms: invoice.terms || '',
          notes: invoice.notes || '',
          footer: invoice.footer || '',
          paymentInstructions: invoice.paymentInstructions || '',
          discountAmount: invoice.discountAmount || 0,
          discountPercent: invoice.discountPercent || undefined,
          lineItems: initialLineItems,
          dealId: invoice.dealId || '',
        }
      : {
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: calculateDueDate(settings?.defaultPaymentTerms || 30),
          notes: settings?.invoiceNotesTemplate || '',
          footer: settings?.invoiceFooterTemplate || '',
          lineItems: [],
        },
  })

  const clientId = watch('clientId')
  const discountAmount = watch('discountAmount')
  const discountPercent = watch('discountPercent')

  // Mettre a jour les lineItems dans le formulaire quand items change
  useEffect(() => {
    setValue('lineItems', items)
  }, [items, setValue])

  // Calculer la date d'echeance
  function calculateDueDate(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0] as string
  }

  const handleClientSelect = (client: InvoiceClient) => {
    setValue('clientId', client.id)
    // Mettre a jour la date d'echeance selon les conditions du client
    if (client.paymentTerms) {
      setValue('dueDate', calculateDueDate(client.paymentTerms))
    }
  }

  const handleFormSubmit = async (data: InvoiceFormData) => {
    await onSubmit({
      clientId: data.clientId,
      issueDate: data.issueDate,
      dueDate: data.dueDate || undefined,
      subject: data.subject || undefined,
      introduction: data.introduction || undefined,
      terms: data.terms || undefined,
      notes: data.notes || undefined,
      footer: data.footer || undefined,
      paymentInstructions: data.paymentInstructions || undefined,
      discountAmount: data.discountAmount || undefined,
      discountPercent: data.discountPercent || undefined,
      dealId: data.dealId || undefined,
      lineItems: items.map((item) => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        vatRate: item.vatRate,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Client et Dates */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Selection du client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Selectionner un client *</Label>
              <ClientSelector
                clients={clients}
                value={clientId}
                onSelect={handleClientSelect}
              />
              {errors.clientId && (
                <p className="text-sm text-error">{errors.clientId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Date d'emission *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  {...register('issueDate')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d'echeance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Objet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Objet de la facture</Label>
            <Input
              id="subject"
              placeholder="Ex: Developpement site web - Phase 1"
              {...register('subject')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="introduction">Introduction</Label>
            <Textarea
              id="introduction"
              placeholder="Texte d'introduction..."
              rows={3}
              {...register('introduction')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lignes de facture */}
      <LineItemsEditor
        items={items}
        products={products}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
        onSelectProduct={selectProduct}
      />

      {/* Remise et Totaux */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Remise globale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Percent className="h-5 w-5" />
              Remise globale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Montant fixe</Label>
                <div className="relative">
                  <Input
                    id="discountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    className="pr-6"
                    {...register('discountAmount', { valueAsNumber: true })}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Ou pourcentage</Label>
                <div className="relative">
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    className="pr-6"
                    {...register('discountPercent', { valueAsNumber: true })}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totaux */}
        <TotalsDisplay
          subtotal={subtotal}
          vatBreakdown={vatBreakdown}
          discountAmount={discountAmount}
          discountPercent={discountPercent}
          total={total}
        />
      </div>

      {/* Conditions et Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="h-5 w-5" />
            Conditions et notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Conditions de paiement</Label>
            <Textarea
              id="terms"
              placeholder="Conditions de reglement..."
              rows={2}
              {...register('terms')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentInstructions">Instructions de paiement</Label>
            <Textarea
              id="paymentInstructions"
              placeholder="IBAN, BIC, etc."
              rows={2}
              {...register('paymentInstructions')}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              placeholder="Notes (visibles sur la facture)..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer">Pied de page</Label>
            <Textarea
              id="footer"
              placeholder="Mentions legales, etc."
              rows={2}
              {...register('footer')}
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
          {isLoading
            ? 'Enregistrement...'
            : isEditing
            ? 'Mettre a jour'
            : 'Creer la facture'}
        </Button>
      </div>
    </form>
  )
}
