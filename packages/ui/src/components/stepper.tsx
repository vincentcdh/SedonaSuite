"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../lib/utils"

// ===========================================
// TYPES
// ===========================================

export interface StepItem {
  id: string
  label: string
  description?: string
}

export interface StepperProps {
  steps: StepItem[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export interface StepProps {
  step: StepItem
  index: number
  isActive: boolean
  isCompleted: boolean
  isLast: boolean
  onClick?: () => void
  orientation?: 'horizontal' | 'vertical'
}

// ===========================================
// STEP INDICATOR
// ===========================================

const StepIndicator = React.forwardRef<
  HTMLDivElement,
  {
    index: number
    isActive: boolean
    isCompleted: boolean
    className?: string
  }
>(({ index, isActive, isCompleted, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
      isCompleted && "border-primary bg-primary text-primary-foreground",
      isActive && !isCompleted && "border-primary bg-background text-primary",
      !isActive && !isCompleted && "border-muted-foreground/30 bg-background text-muted-foreground",
      className
    )}
  >
    {isCompleted ? (
      <Check className="h-5 w-5" />
    ) : (
      <span>{index + 1}</span>
    )}
  </div>
))
StepIndicator.displayName = "StepIndicator"

// ===========================================
// STEP CONNECTOR
// ===========================================

const StepConnector = React.forwardRef<
  HTMLDivElement,
  {
    isCompleted: boolean
    orientation?: 'horizontal' | 'vertical'
    className?: string
  }
>(({ isCompleted, orientation = 'horizontal', className }, ref) => (
  <div
    ref={ref}
    className={cn(
      "transition-colors",
      orientation === 'horizontal' && "h-0.5 flex-1 mx-2",
      orientation === 'vertical' && "w-0.5 h-full ml-5 my-1",
      isCompleted ? "bg-primary" : "bg-muted-foreground/30",
      className
    )}
  />
))
StepConnector.displayName = "StepConnector"

// ===========================================
// STEP ITEM
// ===========================================

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ step, index, isActive, isCompleted, isLast, onClick, orientation = 'horizontal' }, ref) => {
    const isClickable = onClick && (isCompleted || isActive)

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === 'horizontal' && "flex-col items-center",
          orientation === 'vertical' && "flex-row items-start gap-4"
        )}
      >
        <button
          type="button"
          onClick={isClickable ? onClick : undefined}
          disabled={!isClickable}
          className={cn(
            "flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1",
            orientation === 'horizontal' && "text-center",
            orientation === 'vertical' && "flex-row items-start gap-4",
            isClickable && "cursor-pointer",
            !isClickable && "cursor-default"
          )}
        >
          <StepIndicator
            index={index}
            isActive={isActive}
            isCompleted={isCompleted}
          />

          <div className={cn(
            orientation === 'horizontal' && "mt-2",
            orientation === 'vertical' && "pt-1.5"
          )}>
            <p
              className={cn(
                "text-sm font-medium transition-colors",
                isActive && "text-primary",
                isCompleted && "text-foreground",
                !isActive && !isCompleted && "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p
                className={cn(
                  "text-xs mt-0.5 transition-colors",
                  isActive || isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                )}
              >
                {step.description}
              </p>
            )}
          </div>
        </button>

        {/* Connector line for vertical orientation */}
        {orientation === 'vertical' && !isLast && (
          <StepConnector isCompleted={isCompleted} orientation="vertical" />
        )}
      </div>
    )
  }
)
Step.displayName = "Step"

// ===========================================
// STEPPER
// ===========================================

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, onStepClick, className, orientation = 'horizontal' }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full",
          orientation === 'horizontal' && "flex-row items-start justify-between",
          orientation === 'vertical' && "flex-col gap-0",
          className
        )}
        role="navigation"
        aria-label="Progress"
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <Step
              step={step}
              index={index}
              isActive={index === currentStep}
              isCompleted={index < currentStep}
              isLast={index === steps.length - 1}
              onClick={onStepClick ? () => onStepClick(index) : undefined}
              orientation={orientation}
            />

            {/* Connector line for horizontal orientation */}
            {orientation === 'horizontal' && index < steps.length - 1 && (
              <StepConnector
                isCompleted={index < currentStep}
                orientation="horizontal"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

export { Stepper, Step, StepIndicator, StepConnector }
