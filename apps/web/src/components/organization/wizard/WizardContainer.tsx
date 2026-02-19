import { type FC, useState, useCallback } from 'react'
import { Stepper, type StepItem } from '@sedona/ui'
import { type OrganizationWizardData, type WizardStepProps } from './types'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2LegalInfo } from './Step2LegalInfo'
import { Step3ContactInfo } from './Step3ContactInfo'
import { Step4InviteMembers } from './Step4InviteMembers'

// ===========================================
// WIZARD STEPS CONFIGURATION
// ===========================================

const WIZARD_STEPS: StepItem[] = [
  {
    id: 'basic',
    label: 'Entreprise',
    description: 'Nom et secteur',
  },
  {
    id: 'legal',
    label: 'Infos legales',
    description: 'SIRET, TVA',
  },
  {
    id: 'contact',
    label: 'Coordonnees',
    description: 'Adresse, contact',
  },
  {
    id: 'invite',
    label: 'Equipe',
    description: 'Inviter des membres',
  },
]

const STEP_COMPONENTS: FC<WizardStepProps>[] = [
  Step1BasicInfo,
  Step2LegalInfo,
  Step3ContactInfo,
  Step4InviteMembers,
]

// ===========================================
// COMPONENT PROPS
// ===========================================

interface WizardContainerProps {
  initialData?: Partial<OrganizationWizardData>
  onComplete: (data: OrganizationWizardData) => Promise<void>
  onCancel?: () => void
}

// ===========================================
// COMPONENT
// ===========================================

export const WizardContainer: FC<WizardContainerProps> = ({
  initialData,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<OrganizationWizardData>>(
    initialData || {
      name: '',
      slug: '',
      industry: '',
      address: { country: 'France' },
      invitedEmails: [],
    }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goNext = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const goPrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    } else if (onCancel) {
      onCancel()
    }
  }, [currentStep, onCancel])

  const updateData = useCallback((data: Partial<OrganizationWizardData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // Ensure all required fields have defaults
      const completeData: OrganizationWizardData = {
        name: formData.name || '',
        slug: formData.slug || '',
        industry: formData.industry || '',
        siret: formData.siret,
        siren: formData.siren,
        vatNumber: formData.vatNumber,
        address: formData.address || { country: 'France' },
        phone: formData.phone,
        email: formData.email,
        invitedEmails: formData.invitedEmails || [],
      }

      await onComplete(completeData)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onComplete])

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Only allow clicking on completed steps or current step
      if (stepIndex <= currentStep) {
        setCurrentStep(stepIndex)
      }
    },
    [currentStep]
  )

  // Get current step component
  const CurrentStepComponent = STEP_COMPONENTS[currentStep]

  return (
    <div className="space-y-8">
      {/* Stepper Navigation */}
      <Stepper
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        className="mb-8"
      />

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        <CurrentStepComponent
          data={formData}
          updateData={updateData}
          goNext={goNext}
          goPrevious={goPrevious}
          isFirst={currentStep === 0}
          isLast={currentStep === WIZARD_STEPS.length - 1}
          isSubmitting={isSubmitting}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
