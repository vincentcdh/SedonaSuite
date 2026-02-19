import { type FC, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, ArrowRight, RefreshCw } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { type WizardStepProps, INDUSTRY_OPTIONS } from './types'

// ===========================================
// VALIDATION SCHEMA
// ===========================================

const step1Schema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(100, 'Le nom ne peut pas depasser 100 caracteres'),
  slug: z
    .string()
    .min(2, 'L\'identifiant doit contenir au moins 2 caracteres')
    .max(50, 'L\'identifiant ne peut pas depasser 50 caracteres')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{1,2}$/,
      'L\'identifiant ne peut contenir que des lettres minuscules, chiffres et tirets'
    ),
  industry: z.string().min(1, 'Veuillez selectionner un secteur d\'activite'),
})

type Step1FormData = z.infer<typeof step1Schema>

// ===========================================
// SLUG GENERATION
// ===========================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 50)
}

// ===========================================
// COMPONENT
// ===========================================

export const Step1BasicInfo: FC<WizardStepProps> = ({
  data,
  updateData,
  goNext,
}) => {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: data.name || '',
      slug: data.slug || '',
      industry: data.industry || '',
    },
    mode: 'onChange',
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue && !slugManuallyEdited) {
      const generatedSlug = generateSlug(nameValue)
      setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [nameValue, slugManuallyEdited, setValue])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true)
    setValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''), {
      shouldValidate: true,
    })
  }

  const regenerateSlug = () => {
    setSlugManuallyEdited(false)
    const generatedSlug = generateSlug(nameValue)
    setValue('slug', generatedSlug, { shouldValidate: true })
  }

  const onSubmit = (formData: Step1FormData) => {
    updateData({
      name: formData.name,
      slug: formData.slug,
      industry: formData.industry,
    })
    goNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Informations de base</h2>
          <p className="text-sm text-muted-foreground">
            Commencez par donner un nom a votre organisation
          </p>
        </div>
      </div>

      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'organisation *</Label>
        <Input
          id="name"
          placeholder="Ex: Ma Super Entreprise"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Identifiant unique *</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="slug"
              placeholder="ma-super-entreprise"
              value={slugValue}
              onChange={handleSlugChange}
              className={errors.slug ? 'border-destructive' : ''}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={regenerateSlug}
            title="Regenerer depuis le nom"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cet identifiant sera utilise dans l'URL de votre espace
        </p>
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label htmlFor="industry">Secteur d'activite *</Label>
        <Select
          value={watch('industry')}
          onValueChange={(value) =>
            setValue('industry', value, { shouldValidate: true })
          }
        >
          <SelectTrigger
            className={errors.industry ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Selectionnez votre secteur" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-destructive">{errors.industry.message}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={!isValid}>
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
