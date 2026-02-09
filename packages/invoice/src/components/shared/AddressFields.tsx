import type { FC } from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input, Label, Card, CardContent, CardHeader, CardTitle } from '@sedona/ui'
import { MapPin } from 'lucide-react'

interface AddressFieldsProps {
  register: UseFormRegister<any>
  errors?: FieldErrors
  prefix?: 'billing' | 'shipping'
  showCard?: boolean
}

export const AddressFields: FC<AddressFieldsProps> = ({
  register,
  errors,
  prefix = 'billing',
  showCard = true,
}) => {
  const fieldName = (field: string) => `${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}`
  const getError = (field: string) => (errors as any)?.[fieldName(field)]

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={fieldName('addressLine1')}>Adresse</Label>
        <Input
          id={fieldName('addressLine1')}
          placeholder="123 rue de la Paix"
          {...register(fieldName('addressLine1'))}
        />
        {getError('addressLine1') && (
          <p className="text-sm text-error">{getError('addressLine1')?.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldName('addressLine2')}>Complement d'adresse</Label>
        <Input
          id={fieldName('addressLine2')}
          placeholder="Batiment A, 2eme etage"
          {...register(fieldName('addressLine2'))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={fieldName('postalCode')}>Code postal</Label>
          <Input
            id={fieldName('postalCode')}
            placeholder="75001"
            {...register(fieldName('postalCode'))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName('city')}>Ville</Label>
          <Input
            id={fieldName('city')}
            placeholder="Paris"
            {...register(fieldName('city'))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={fieldName('country')}>Pays</Label>
          <Input
            id={fieldName('country')}
            placeholder="France"
            {...register(fieldName('country'))}
          />
        </div>
      </div>
    </div>
  )

  if (!showCard) {
    return content
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          {prefix === 'billing' ? 'Adresse de facturation' : 'Adresse de livraison'}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
