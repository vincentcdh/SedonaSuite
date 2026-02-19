import { type FC, useState } from 'react'
import { Users, ArrowLeft, Plus, X, Loader2, Check } from 'lucide-react'
import { Button, Input, Label, Badge } from '@sedona/ui'
import { type WizardStepProps } from './types'
import { z } from 'zod'

// ===========================================
// VALIDATION
// ===========================================

const emailSchema = z.string().email('Email invalide')

// ===========================================
// COMPONENT
// ===========================================

export const Step4InviteMembers: FC<WizardStepProps> = ({
  data,
  updateData,
  goPrevious,
  isSubmitting,
  onComplete,
}) => {
  const [emails, setEmails] = useState<string[]>(data.invitedEmails || [])
  const [currentEmail, setCurrentEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const addEmail = () => {
    const trimmedEmail = currentEmail.trim().toLowerCase()

    // Validate email
    const result = emailSchema.safeParse(trimmedEmail)
    if (!result.success) {
      setEmailError('Veuillez entrer un email valide')
      return
    }

    // Check for duplicates
    if (emails.includes(trimmedEmail)) {
      setEmailError('Cet email a deja ete ajoute')
      return
    }

    // Add email
    const newEmails = [...emails, trimmedEmail]
    setEmails(newEmails)
    updateData({ invitedEmails: newEmails })
    setCurrentEmail('')
    setEmailError(null)
  }

  const removeEmail = (emailToRemove: string) => {
    const newEmails = emails.filter((e) => e !== emailToRemove)
    setEmails(newEmails)
    updateData({ invitedEmails: newEmails })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }

  const handleComplete = async () => {
    updateData({ invitedEmails: emails })
    await onComplete()
  }

  const handleSkipAndComplete = async () => {
    updateData({ invitedEmails: [] })
    await onComplete()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Inviter votre equipe</h2>
          <p className="text-sm text-muted-foreground">
            Ajoutez des membres pour collaborer avec vous
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 flex-shrink-0" />
          <p>
            <strong>Vous serez le proprietaire</strong> de cette organisation avec
            tous les droits d'administration.
          </p>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="collegue@entreprise.fr"
            value={currentEmail}
            onChange={(e) => {
              setCurrentEmail(e.target.value)
              setEmailError(null)
            }}
            onKeyDown={handleKeyDown}
            className={emailError ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            onClick={addEmail}
            disabled={!currentEmail.trim() || isSubmitting}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
        {emailError && (
          <p className="text-sm text-destructive">{emailError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Les membres invites recevront un email pour rejoindre l'organisation
        </p>
      </div>

      {/* Email List */}
      {emails.length > 0 && (
        <div className="space-y-2">
          <Label>Membres a inviter ({emails.length})</Label>
          <div className="flex flex-wrap gap-2 p-4 rounded-lg border bg-muted/30">
            {emails.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="pl-3 pr-1 py-1.5 text-sm"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="ml-2 hover:bg-muted rounded p-0.5"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {emails.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Aucun membre invite pour le moment
          </p>
          <p className="text-xs mt-1">
            Vous pouvez toujours inviter des membres plus tard
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={goPrevious}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="flex gap-2">
          {emails.length === 0 ? (
            <Button onClick={handleSkipAndComplete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation en cours...
                </>
              ) : (
                'Creer mon organisation'
              )}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipAndComplete}
                disabled={isSubmitting}
              >
                Sans invitations
              </Button>
              <Button onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creation en cours...
                  </>
                ) : (
                  `Creer et inviter ${emails.length} membre${emails.length > 1 ? 's' : ''}`
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
