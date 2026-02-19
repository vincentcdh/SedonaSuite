import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button, Input, Label } from '@sedona/ui'
import { type WizardStepProps } from './types'

// ===========================================
// VALIDATION SCHEMA
// ===========================================

const step2Schema = z.object({
  siret: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{14}$/.test(val.replace(/\s/g, '')),
      'Le SIRET doit contenir 14 chiffres'
    ),
  siren: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{9}$/.test(val.replace(/\s/g, '')),
      'Le SIREN doit contenir 9 chiffres'
    ),
  vatNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^FR\d{11}$/.test(val.replace(/\s/g, '')),
      'Le numero TVA doit etre au format FR suivi de 11 chiffres (ex: FR12345678901)'
    ),
})

type Step2FormData = z.infer<typeof step2Schema>

// ===========================================
// HELPERS
// ===========================================

function formatSiret(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  // Format: 123 456 789 00012
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 14),
  ].filter(Boolean)
  return parts.join(' ')
}

function formatSiren(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  // Format: 123 456 789
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
  ].filter(Boolean)
  return parts.join(' ')
}

// ===========================================
// COMPONENT
// ===========================================

export const Step2LegalInfo: FC<WizardStepProps> = ({
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
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      siret: data.siret || '',
      siren: data.siren || '',
      vatNumber: data.vatNumber || '',
    },
    mode: 'onChange',
  })

  const handleSiretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSiret(e.target.value)
    setValue('siret', formatted, { shouldValidate: true })
  }

  const handleSirenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSiren(e.target.value)
    setValue('siren', formatted, { shouldValidate: true })

    // Auto-fill SIRET prefix if SIREN is complete and SIRET is empty
    const siretValue = watch('siret')
    if (formatted.replace(/\s/g, '').length === 9 && !siretValue) {
      setValue('siret', formatted + ' ', { shouldValidate: false })
    }
  }

  const onSubmit = (formData: Step2FormData) => {
    updateData({
      siret: formData.siret?.replace(/\s/g, '') || undefined,
      siren: formData.siren?.replace(/\s/g, '') || undefined,
      vatNumber: formData.vatNumber?.replace(/\s/g, '') || undefined,
    })
    goNext()
  }

  const handleSkip = () => {
    updateData({
      siret: undefined,
      siren: undefined,
      vatNumber: undefined,
    })
    goNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Informations legales</h2>
          <p className="text-sm text-muted-foreground">
            Ces informations sont optionnelles mais utiles pour la facturation
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p>
          Tous les champs de cette etape sont <strong>optionnels</strong>. Vous
          pourrez les renseigner plus tard dans les parametres de l'organisation.
        </p>
      </div>

      {/* SIREN */}
      <div className="space-y-2">
        <Label htmlFor="siren">Numero SIREN</Label>
        <Input
          id="siren"
          placeholder="123 456 789"
          value={watch('siren') || ''}
          onChange={handleSirenChange}
          className={errors.siren ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground">
          9 chiffres identifiant votre entreprise
        </p>
        {errors.siren && (
          <p className="text-sm text-destructive">{errors.siren.message}</p>
        )}
      </div>

      {/* SIRET */}
      <div className="space-y-2">
        <Label htmlFor="siret">Numero SIRET</Label>
        <Input
          id="siret"
          placeholder="123 456 789 00012"
          value={watch('siret') || ''}
          onChange={handleSiretChange}
          className={errors.siret ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground">
          14 chiffres identifiant votre etablissement (SIREN + NIC)
        </p>
        {errors.siret && (
          <p className="text-sm text-destructive">{errors.siret.message}</p>
        )}
      </div>

      {/* VAT Number */}
      <div className="space-y-2">
        <Label htmlFor="vatNumber">Numero de TVA intracommunautaire</Label>
        <Input
          id="vatNumber"
          placeholder="FR12345678901"
          {...register('vatNumber')}
          className={errors.vatNumber ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground">
          Format: FR suivi de 11 chiffres
        </p>
        {errors.vatNumber && (
          <p className="text-sm text-destructive">{errors.vatNumber.message}</p>
        )}
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
