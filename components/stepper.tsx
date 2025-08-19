"use client"

import * as React from "react"
import { Check, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface Step {
  id: string
  title: string
  description?: string
  status: "completed" | "current" | "upcoming" | "error"
  optional?: boolean
  estimatedTime?: number
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "simple" | "numbered"
  showConnector?: boolean
  allowClickableSteps?: boolean
  className?: string
}

interface StepperStepProps {
  step: Step
  index: number
  isActive: boolean
  isClickable: boolean
  orientation: "horizontal" | "vertical"
  variant: "default" | "simple" | "numbered"
  showConnector: boolean
  isLast: boolean
  onStepClick?: (stepIndex: number) => void
}

const StepIcon = React.forwardRef<
  HTMLDivElement,
  {
    step: Step
    index: number
    variant: "default" | "simple" | "numbered"
    isActive: boolean
    className?: string
  }
>(({ step, index, variant, isActive, className }, ref) => {
  const getIcon = () => {
    if (step.status === "completed") {
      return <Check className="h-4 w-4" />
    }
    
    if (step.status === "error") {
      return <Circle className="h-4 w-4" />
    }
    
    if (variant === "numbered") {
      return <span className="text-sm font-semibold">{index + 1}</span>
    }
    
    if (step.status === "current") {
      return (
        <motion.div
          className="w-2 h-2 bg-current rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )
    }
    
    return <Circle className="h-4 w-4" />
  }

  const getBackgroundColor = () => {
    switch (step.status) {
      case "completed":
        return "bg-primary text-primary-foreground"
      case "current":
        return "bg-primary text-primary-foreground"
      case "error":
        return "bg-destructive text-destructive-foreground"
      case "upcoming":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
        getBackgroundColor(),
        step.status === "completed" || step.status === "current"
          ? "border-primary"
          : step.status === "error"
          ? "border-destructive"
          : "border-muted",
        isActive && "ring-2 ring-primary ring-offset-2",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {getIcon()}
    </motion.div>
  )
})
StepIcon.displayName = "StepIcon"

const StepConnector = React.forwardRef<
  HTMLDivElement,
  {
    isCompleted: boolean
    orientation: "horizontal" | "vertical"
    className?: string
  }
>(({ isCompleted, orientation, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 transition-all duration-500",
        orientation === "horizontal" ? "h-0.5" : "w-0.5 h-8 ml-4",
        className
      )}
    >
      <motion.div
        className={cn(
          "h-full transition-colors duration-500",
          isCompleted ? "bg-primary" : "bg-muted"
        )}
        initial={{ scaleX: orientation === "horizontal" ? 0 : 1, scaleY: orientation === "vertical" ? 0 : 1 }}
        animate={{ scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          transformOrigin: orientation === "horizontal" ? "left" : "top",
        }}
      />
    </div>
  )
})
StepConnector.displayName = "StepConnector"

const StepperStep = React.forwardRef<HTMLDivElement, StepperStepProps>(
  ({ step, index, isActive, isClickable, orientation, variant, showConnector, isLast, onStepClick }, ref) => {
    const handleClick = () => {
      if (isClickable && onStepClick) {
        onStepClick(index)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-col items-center" : "flex-row items-start",
          isClickable && "cursor-pointer group",
          "transition-all duration-200"
        )}
      >
        <div
          className={cn(
            "flex",
            orientation === "horizontal" ? "flex-col items-center" : "flex-row items-start gap-3"
          )}
          onClick={handleClick}
        >
          <StepIcon
            step={step}
            index={index}
            variant={variant}
            isActive={isActive}
            className={isClickable ? "group-hover:scale-110" : ""}
          />
          
          {showConnector && !isLast && (
            <StepConnector
              isCompleted={step.status === "completed"}
              orientation={orientation}
            />
          )}
        </div>
        
        <motion.div
          className={cn(
            "flex flex-col",
            orientation === "horizontal" ? "items-center text-center mt-2" : "flex-1 ml-3",
            isClickable && "group-hover:text-primary transition-colors"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
          onClick={handleClick}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
            {step.optional && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Optional
              </span>
            )}
          </div>
          
          {step.description && (
            <span
              className={cn(
                "text-xs transition-colors",
                orientation === "horizontal" ? "mt-1" : "mt-0.5",
                isActive ? "text-muted-foreground" : "text-muted-foreground/70"
              )}
            >
              {step.description}
            </span>
          )}
          
          {step.estimatedTime && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {step.estimatedTime} min
              </span>
            </div>
          )}
        </motion.div>
      </div>
    )
  }
)
StepperStep.displayName = "StepperStep"

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({
    steps,
    currentStep,
    onStepClick,
    orientation = "horizontal",
    variant = "default",
    showConnector = true,
    allowClickableSteps = false,
    className,
    ...props
  }, ref) => {
    const isStepClickable = (stepIndex: number) => {
      if (!allowClickableSteps) return false
      // Allow clicking on completed steps or current step
      return stepIndex <= currentStep || steps[stepIndex].status === "completed"
    }

    return (
      <nav
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" 
            ? "flex-row items-start justify-between" 
            : "flex-col space-y-4",
          className
        )}
        aria-label="Progress"
        {...props}
      >
        <AnimatePresence mode="wait">
          {steps.map((step, index) => (
            <StepperStep
              key={step.id}
              step={step}
              index={index}
              isActive={index === currentStep}
              isClickable={isStepClickable(index)}
              orientation={orientation}
              variant={variant}
              showConnector={showConnector}
              isLast={index === steps.length - 1}
              onStepClick={onStepClick}
            />
          ))}
        </AnimatePresence>
      </nav>
    )
  }
)
Stepper.displayName = "Stepper"

// Enhanced Stepper with progress bar
const StepperWithProgress = React.forwardRef<
  HTMLDivElement,
  StepperProps & {
    showProgress?: boolean
    progressLabel?: string
  }
>(({ showProgress = true, progressLabel, currentStep, steps, ...props }, ref) => {
  const progress = ((currentStep + 1) / steps.length) * 100
  const completedSteps = steps.filter(step => step.status === "completed").length

  return (
    <div ref={ref} className="space-y-4">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progressLabel || "Progress"}
            </span>
            <span className="font-medium">
              {completedSteps} of {steps.length} completed ({Math.round(progress)}%)
            </span>
          </div>
          <motion.div
            className="h-2 bg-muted rounded-full overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      )}
      <Stepper steps={steps} currentStep={currentStep} {...props} />
    </div>
  )
})
StepperWithProgress.displayName = "StepperWithProgress"

export { Stepper, StepperWithProgress, StepIcon, StepConnector }
export type { StepperProps, Step as StepperStep }
