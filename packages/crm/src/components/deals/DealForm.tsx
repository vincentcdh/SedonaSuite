import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Save, User, Building2 } from 'lucide-react'
import type { CreateDealInput, Contact, Company, PipelineStage } from '../../types'

const dealSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  amount: z.number().optional(),
  expectedCloseDate: z.string().optional(),
})

type DealFormData = z.infer<typeof dealSchema>

interface DealFormProps {
  pipelineId: string
  stages: PipelineStage[]
  defaultStageId?: string
  contacts?: Contact[]
  companies?: Company[]
  onSubmit: (data: CreateDealInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const DealForm: FC<DealFormProps> = ({
  pipelineId,
  stages,
  defaultStageId,
  contacts = [],
  companies = [],
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>(defaultStageId || stages[0]?.id || '')
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      expectedCloseDate: '',
    },
  })

  const handleFormSubmit = async (data: DealFormData) => {
    await onSubmit({
      pipelineId,
      stageId: selectedStageId,
      name: data.name,
      amount: data.amount,
      expectedCloseDate: data.expectedCloseDate || undefined,
      contactId: selectedContactId,
      companyId: selectedCompanyId,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Deal Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom du deal *</Label>
        <Input
          id="name"
          placeholder="Ex: Contrat annuel Entreprise X"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-error">{errors.name.message}</p>
        )}
      </div>

      {/* Stage Selection */}
      <div className="space-y-2">
        <Label>Etape</Label>
        <Select value={selectedStageId} onValueChange={setSelectedStageId}>
          <SelectTrigger>
            <SelectValue placeholder="Selectionner une etape" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color || '#6b7280' }}
                  />
                  {stage.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Montant (EUR)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="10000"
          {...register('amount', { valueAsNumber: true })}
        />
      </div>

      {/* Expected Close Date */}
      <div className="space-y-2">
        <Label htmlFor="expectedCloseDate">Date de cloture prevue</Label>
        <Input
          id="expectedCloseDate"
          type="date"
          {...register('expectedCloseDate')}
        />
      </div>

      {/* Contact & Company selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Contact
            </div>
          </Label>
          <Select
            value={selectedContactId || ''}
            onValueChange={(value) => setSelectedContactId(value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectionner un contact" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Entreprise
            </div>
          </Label>
          <Select
            value={selectedCompanyId || ''}
            onValueChange={(value) => setSelectedCompanyId(value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectionner une entreprise" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Creation...' : 'Creer le deal'}
        </Button>
      </div>
    </form>
  )
}
