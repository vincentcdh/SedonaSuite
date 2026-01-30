import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
} from '@sedona/ui'
import { User, Mail, Phone, Building2, MapPin, Save } from 'lucide-react'
import type { Contact, CreateContactInput, ContactSource } from '../../types'

const contactSchema = z.object({
  firstName: z.string().min(1, 'Le prenom est requis'),
  lastName: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  companyId: z.string().optional(),
  source: z.string().optional(),
  sourceDetails: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  contact?: Contact
  companies?: Array<{ id: string; name: string }>
  onSubmit: (data: CreateContactInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const sourceOptions: { value: ContactSource; label: string }[] = [
  { value: 'website', label: 'Site web' },
  { value: 'referral', label: 'Recommandation' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google', label: 'Google' },
  { value: 'trade_show', label: 'Salon' },
  { value: 'cold_call', label: 'Appel a froid' },
  { value: 'email_campaign', label: 'Campagne email' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'manual', label: 'Saisie manuelle' },
  { value: 'other', label: 'Autre' },
]

export const ContactForm: FC<ContactFormProps> = ({
  contact,
  companies = [],
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          email: contact.email || '',
          phone: contact.phone || '',
          mobile: contact.mobile || '',
          jobTitle: contact.jobTitle || '',
          companyId: contact.companyId || '',
          source: contact.source || '',
          sourceDetails: contact.sourceDetails || '',
          addressLine1: contact.addressLine1 || '',
          addressLine2: contact.addressLine2 || '',
          city: contact.city || '',
          postalCode: contact.postalCode || '',
          country: contact.country || 'France',
        }
      : {
          country: 'France',
        },
  })

  const handleFormSubmit = async (data: ContactFormData) => {
    await onSubmit({
      firstName: data.firstName,
      lastName: data.lastName || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      mobile: data.mobile || undefined,
      jobTitle: data.jobTitle || undefined,
      companyId: data.companyId || undefined,
      source: (data.source as ContactSource) || undefined,
      sourceDetails: data.sourceDetails || undefined,
      addressLine1: data.addressLine1 || undefined,
      addressLine2: data.addressLine2 || undefined,
      city: data.city || undefined,
      postalCode: data.postalCode || undefined,
      country: data.country || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prenom *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-error">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register('lastName')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Poste</Label>
            <Input
              id="jobTitle"
              placeholder="Directeur, Manager..."
              {...register('jobTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId">Entreprise</Label>
            <select
              id="companyId"
              {...register('companyId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Aucune entreprise</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Coordonnees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@exemple.fr"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone fixe</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                {...register('phone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Telephone mobile</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                {...register('mobile')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Adresse</Label>
            <Input
              id="addressLine1"
              placeholder="123 rue de la Paix"
              {...register('addressLine1')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Complement d'adresse</Label>
            <Input
              id="addressLine2"
              placeholder="Batiment A, 2eme etage"
              {...register('addressLine2')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input id="postalCode" placeholder="75001" {...register('postalCode')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" placeholder="Paris" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" placeholder="France" {...register('country')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source">Source d'acquisition</Label>
              <select
                id="source"
                {...register('source')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selectionner une source</option>
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceDetails">Details</Label>
              <Input
                id="sourceDetails"
                placeholder="Precisions sur la source..."
                {...register('sourceDetails')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
