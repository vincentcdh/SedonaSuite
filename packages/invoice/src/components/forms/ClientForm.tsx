import type { FC } from 'react'
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
} from '@sedona/ui'
import { Building2, User, Mail, Phone, CreditCard, FileText, Save, Loader2 } from 'lucide-react'
import type { InvoiceClient, CreateClientInput } from '../../types'
import { clientFormSchema, type ClientFormData } from '../schemas'
import { AddressFields } from '../shared/AddressFields'

interface ClientFormProps {
  client?: InvoiceClient
  onSubmit: (data: CreateClientInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const ClientForm: FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEditing = !!client

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: client
      ? {
          name: client.name || '',
          legalName: client.legalName || '',
          siret: client.siret || '',
          vatNumber: client.vatNumber || '',
          legalForm: client.legalForm || '',
          billingEmail: client.billingEmail || '',
          billingPhone: client.billingPhone || '',
          contactName: client.contactName || '',
          billingAddressLine1: client.billingAddressLine1 || '',
          billingAddressLine2: client.billingAddressLine2 || '',
          billingCity: client.billingCity || '',
          billingPostalCode: client.billingPostalCode || '',
          billingCountry: client.billingCountry || 'France',
          paymentTerms: client.paymentTerms || 30,
          paymentMethod: client.paymentMethod || 'transfer',
          defaultCurrency: client.defaultCurrency || 'EUR',
          crmCompanyId: client.crmCompanyId || '',
          crmContactId: client.crmContactId || '',
          notes: client.notes || '',
        }
      : {
          billingCountry: 'France',
          paymentTerms: 30,
          paymentMethod: 'transfer',
          defaultCurrency: 'EUR',
        },
  })

  const paymentMethod = watch('paymentMethod')

  const handleFormSubmit = async (data: ClientFormData) => {
    await onSubmit({
      name: data.name,
      legalName: data.legalName || undefined,
      siret: data.siret || undefined,
      vatNumber: data.vatNumber || undefined,
      legalForm: data.legalForm || undefined,
      billingEmail: data.billingEmail || undefined,
      billingPhone: data.billingPhone || undefined,
      contactName: data.contactName || undefined,
      billingAddressLine1: data.billingAddressLine1 || undefined,
      billingAddressLine2: data.billingAddressLine2 || undefined,
      billingCity: data.billingCity || undefined,
      billingPostalCode: data.billingPostalCode || undefined,
      billingCountry: data.billingCountry || undefined,
      paymentTerms: data.paymentTerms,
      paymentMethod: data.paymentMethod,
      defaultCurrency: data.defaultCurrency,
      crmCompanyId: data.crmCompanyId || undefined,
      crmContactId: data.crmContactId || undefined,
      notes: data.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Informations generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Informations generales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom / Raison sociale *</Label>
              <Input
                id="name"
                placeholder="Entreprise SARL"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Denomination legale</Label>
              <Input
                id="legalName"
                placeholder="Nom complet officiel"
                {...register('legalName')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                placeholder="123 456 789 00012"
                {...register('siret')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber">N° TVA intracommunautaire</Label>
              <Input
                id="vatNumber"
                placeholder="FR12345678901"
                {...register('vatNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique</Label>
              <Input
                id="legalForm"
                placeholder="SARL, SAS, etc."
                {...register('legalForm')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Nom du contact</Label>
            <Input
              id="contactName"
              placeholder="Jean Dupont"
              {...register('contactName')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billingEmail">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email de facturation
                </div>
              </Label>
              <Input
                id="billingEmail"
                type="email"
                placeholder="facturation@entreprise.fr"
                {...register('billingEmail')}
                aria-invalid={!!errors.billingEmail}
              />
              {errors.billingEmail && (
                <p className="text-sm text-error">{errors.billingEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPhone">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Telephone
                </div>
              </Label>
              <Input
                id="billingPhone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                {...register('billingPhone')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse de facturation */}
      <AddressFields register={register} errors={errors} prefix="billing" />

      {/* Conditions de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Conditions de paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Delai de paiement</Label>
              <Select
                value={watch('paymentTerms')?.toString()}
                onValueChange={(value) => setValue('paymentTerms', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Comptant</SelectItem>
                  <SelectItem value="15">15 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="45">45 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setValue('paymentMethod', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Virement bancaire</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="cash">Especes</SelectItem>
                  <SelectItem value="direct_debit">Prelevement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Devise</Label>
              <Select
                value={watch('defaultCurrency')}
                onValueChange={(value) => setValue('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Notes internes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Notes internes (non visibles par le client)..."
            rows={4}
            {...register('notes')}
          />
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
          {isLoading ? 'Enregistrement...' : isEditing ? 'Mettre a jour' : 'Creer le client'}
        </Button>
      </div>
    </form>
  )
}
