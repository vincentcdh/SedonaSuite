import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, Input, Label } from '@sedona/ui'
import { type WizardStepProps } from './types'

// ===========================================
// VALIDATION SCHEMA
// ===========================================

const step3Schema = z.object({
  street: z.string().optional(),
  complement: z.string().optional(),
  postalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{5}$/.test(val),
      'Le code postal doit contenir 5 chiffres'
    ),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}$/.test(val.replace(/\s/g, '')),
      'Format de telephone invalide (ex: 01 23 45 67 89 ou +33 1 23 45 67 89)'
    ),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
})

type Step3FormData = z.infer<typeof step3Schema>

// ===========================================
// HELPERS
// ===========================================

function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  let digits = value.replace(/[^\d+]/g, '')

  // Handle +33 prefix
  if (digits.startsWith('+33')) {
    digits = digits.slice(0, 12)
    if (digits.length > 3) {
      const rest = digits.slice(3)
      const formatted = rest.match(/.{1,2}/g)?.join(' ') || rest
      return '+33 ' + formatted
    }
    return digits
  }

  // Handle 0X format
  digits = digits.replace(/^\+/, '').slice(0, 10)
  const formatted = digits.match(/.{1,2}/g)?.join(' ') || digits
  return formatted
}

// ===========================================
// COMPONENT
// ===========================================

export const Step3ContactInfo: FC<WizardStepProps> = ({
  data,
  updateData,
  goNext,
  goPrevious,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      street: data.address?.street || '',
      complement: data.address?.complement || '',
      postalCode: data.address?.postalCode || '',
      city: data.address?.city || '',
      country: data.address?.country || 'France',
      phone: data.phone || '',
      email: data.email || '',
    },
    mode: 'onChange',
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setValue('phone', formatted, { shouldValidate: true })
  }

  const onSubmit = (formData: Step3FormData) => {
    updateData({
      address: {
        street: formData.street || undefined,
        complement: formData.complement || undefined,
        postalCode: formData.postalCode || undefined,
        city: formData.city || undefined,
        country: formData.country || 'France',
      },
      phone: formData.phone?.replace(/\s/g, '') || undefined,
      email: formData.email || undefined,
    })
    goNext()
  }

  const handleSkip = () => {
    updateData({
      address: { country: 'France' },
      phone: undefined,
      email: undefined,
    })
    goNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Coordonnees</h2>
          <p className="text-sm text-muted-foreground">
            Adresse et informations de contact de votre organisation
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p>
          Ces informations sont <strong>optionnelles</strong> mais seront
          utilisees sur vos factures et devis.
        </p>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Adresse
        </h3>

        {/* Street */}
        <div className="space-y-2">
          <Label htmlFor="street">Rue</Label>
          <Input
            id="street"
            placeholder="123 rue de la Paix"
            {...register('street')}
          />
        </div>

        {/* Complement */}
        <div className="space-y-2">
          <Label htmlFor="complement">Complement d'adresse</Label>
          <Input
            id="complement"
            placeholder="Batiment A, Etage 3..."
            {...register('complement')}
          />
        </div>

        {/* Postal Code + City */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              placeholder="75001"
              maxLength={5}
              {...register('postalCode')}
              className={errors.postalCode ? 'border-destructive' : ''}
            />
            {errors.postalCode && (
              <p className="text-sm text-destructive">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" placeholder="Paris" {...register('city')} />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            placeholder="France"
            {...register('country')}
          />
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Contact
        </h3>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telephone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="01 23 45 67 89"
            value={watch('phone') || ''}
            onChange={handlePhoneChange}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email de contact</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@monentreprise.fr"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          <p className="text-xs text-muted-foreground">
            Email public pour vos clients (different de votre email personnel)
          </p>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={goPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={handleSkip}>
            Passer cette etape
          </Button>
          <Button type="submit">
            Continuer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}
