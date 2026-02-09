import { type FC, useState, useEffect } from 'react'
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
import { Phone, Mail, Calendar, CheckSquare, FileText, Save, User, Building2 } from 'lucide-react'
import type { Activity, CreateActivityInput, ActivityType, Contact, Company } from '../../types'

const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'task', 'note']),
  subject: z.string().min(1, 'Le sujet est requis'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  durationMinutes: z.number().optional(),
})

type ActivityFormData = z.infer<typeof activitySchema>

interface ActivityFormProps {
  activity?: Activity
  contactId?: string
  companyId?: string
  dealId?: string
  contacts?: Contact[]
  companies?: Company[]
  showEntitySelectors?: boolean
  onSubmit: (data: CreateActivityInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const activityTypes: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
  { value: 'call', label: 'Appel', icon: <Phone className="h-4 w-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'meeting', label: 'Reunion', icon: <Calendar className="h-4 w-4" /> },
  { value: 'task', label: 'Tache', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'note', label: 'Note', icon: <FileText className="h-4 w-4" /> },
]

export const ActivityForm: FC<ActivityFormProps> = ({
  activity,
  contactId: initialContactId,
  companyId: initialCompanyId,
  dealId,
  contacts = [],
  companies = [],
  showEntitySelectors = false,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>(initialContactId)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(initialCompanyId)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          type: activity.type,
          subject: activity.subject,
          description: activity.description || '',
          dueDate: activity.dueDate
            ? new Date(activity.dueDate).toISOString().slice(0, 16)
            : '',
          durationMinutes: activity.durationMinutes || undefined,
        }
      : {
          type: 'note',
        },
  })

  const selectedType = watch('type')

  const handleFormSubmit = async (data: ActivityFormData) => {
    const contactId = showEntitySelectors ? selectedContactId : initialContactId
    const companyId = showEntitySelectors ? selectedCompanyId : initialCompanyId

    await onSubmit({
      type: data.type,
      subject: data.subject,
      description: data.description || undefined,
      contactId,
      companyId,
      dealId,
      dueDate: data.dueDate || undefined,
      durationMinutes: data.durationMinutes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Activity Type */}
      <div className="space-y-2">
        <Label>Type d'activite</Label>
        <div className="flex flex-wrap gap-2">
          {activityTypes.map((type) => (
            <Button
              key={type.value}
              type="button"
              variant={selectedType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setValue('type', type.value)}
            >
              {type.icon}
              <span className="ml-2">{type.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Sujet *</Label>
        <Input
          id="subject"
          placeholder="Sujet de l'activite..."
          {...register('subject')}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p className="text-sm text-error">{errors.subject.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          placeholder="Details de l'activite..."
          {...register('description')}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Contact & Company selectors */}
      {showEntitySelectors && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact">
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
            <Label htmlFor="company">
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
          {!selectedContactId && !selectedCompanyId && (
            <p className="text-sm text-error col-span-2">
              Selectionnez au moins un contact ou une entreprise
            </p>
          )}
        </div>
      )}

      {/* Due Date (for tasks and meetings) */}
      {(selectedType === 'task' || selectedType === 'meeting') && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'echeance</Label>
            <Input id="dueDate" type="datetime-local" {...register('dueDate')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duree (minutes)</Label>
            <Input
              id="durationMinutes"
              type="number"
              placeholder="30"
              {...register('durationMinutes', { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
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
