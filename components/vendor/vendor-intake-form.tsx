/**
 * Vendor Intake Form Component
 * Multi-step questionnaire with conditional logic and risk assessment
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon,
  InfoIcon,
  ShieldIcon
} from 'lucide-react'
import { VENDOR_QUESTIONNAIRE } from '@/lib/config/vendor-questionnaire'
import { VendorAssessment, Question, ConditionalRule } from '@/lib/types/vendor'

interface VendorIntakeFormProps {
  onSubmit: (assessment: VendorAssessment) => void
  onSave?: (assessment: Partial<VendorAssessment>) => void
  initialData?: Partial<VendorAssessment>
  className?: string
}

export function VendorIntakeForm({ onSubmit, onSave, initialData, className = '' }: VendorIntakeFormProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState<Partial<VendorAssessment>>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [riskFlags, setRiskFlags] = useState<string[]>([])

  const sectionKeys = Object.keys(VENDOR_QUESTIONNAIRE.sections)
  const sections = Object.values(VENDOR_QUESTIONNAIRE.sections)
  const currentSectionData = sections[currentSection]
  const progress = ((currentSection + 1) / sections.length) * 100

  // Initialize form data structure
  useEffect(() => {
    if (!formData.basicInfo) {
      setFormData({
        basicInfo: {
          name: '',
          url: '',
          description: '',
          category: '',
          contactEmail: '',
          contactName: '',
          businessJustification: ''
        },
        dataHandling: {
          storesPII: false,
          piiTypes: [],
          trainsOnUserData: false,
          dataFlows: [],
          dataRetention: '',
          dataLocation: [],
          encryptionAtRest: false,
          encryptionInTransit: false
        },
        aiCapabilities: {
          isAIService: false,
          modelProvider: 'none',
          customModels: false,
          trainsOnUserData: false,
          trainingDataSources: [],
          biasAuditing: false,
          explainabilityFeatures: false
        },
        studentData: {
          handlesStudentData: false,
          ageGate: false,
          minimumAge: 13,
          parentalConsent: false,
          educationalPurpose: false,
          directoryInformation: false
        },
        compliance: {
          certifications: [],
          auditReports: false,
          privacyPolicy: false,
          termsOfService: false,
          dataProcessingAgreement: false,
          subprocessors: [],
          incidentResponse: false
        },
        technical: {
          authenticationMethod: [],
          ssoSupported: false,
          apiDocumentation: false,
          webhooks: false,
          rateLimit: '',
          uptime: '',
          supportLevel: ''
        },
        ...formData
      })
    }
  }, [])

  // Evaluate risk flags when form data changes
  useEffect(() => {
    const flags = evaluateRiskFlags(formData)
    setRiskFlags(flags)
  }, [formData])

  const evaluateRiskFlags = (data: Partial<VendorAssessment>): string[] => {
    const flags: string[] = []

    // COPPA risk evaluation
    if (data.studentData?.minimumAge && data.studentData.minimumAge < 13) {
      if (!data.studentData.ageGate) flags.push('COPPA: No age verification for users under 13')
      if (!data.studentData.parentalConsent) flags.push('COPPA: No parental consent for users under 13')
    }

    // FERPA risk evaluation
    if (data.studentData?.handlesStudentData) {
      if (!data.studentData.educationalPurpose) flags.push('FERPA: Non-educational use of student data')
      if (data.dataHandling?.storesPII && !data.compliance?.dataProcessingAgreement) {
        flags.push('FERPA: Missing data processing agreement for student PII')
      }
    }

    // PPRA risk evaluation
    const sensitivePiiTypes = data.dataHandling?.piiTypes?.filter(type => 
      type.toLowerCase().includes('psychological') ||
      type.toLowerCase().includes('behavioral') ||
      type.toLowerCase().includes('health')
    ) || []
    
    if (sensitivePiiTypes.length > 0 && !data.studentData?.parentalConsent) {
      flags.push('PPRA: Sensitive data collection without proper consent')
    }

    // General security risks
    if (data.dataHandling?.storesPII) {
      if (!data.dataHandling.encryptionAtRest) flags.push('Security: PII not encrypted at rest')
      if (!data.dataHandling.encryptionInTransit) flags.push('Security: PII not encrypted in transit')
    }

    // AI-specific risks
    if (data.aiCapabilities?.isAIService && data.aiCapabilities.trainsOnUserData && data.studentData?.handlesStudentData) {
      flags.push('AI Risk: Training on student data without adequate safeguards')
    }

    return flags
  }

  const handleFieldChange = (sectionKey: string, fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof VendorAssessment],
        [fieldId]: value
      }
    }))

    // Clear field error
    const errorKey = `${sectionKey}.${fieldId}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const checkConditionalLogic = (question: Question): boolean => {
    const section = currentSectionData
    if (!section.conditionalLogic) return true

    const applicableRules = section.conditionalLogic.filter(rule => 
      rule.action.target.includes(question.id)
    )

    for (const rule of applicableRules) {
      const { condition, action } = rule
      const sectionKey = sectionKeys[currentSection]
      const currentSectionData = formData[sectionKey as keyof VendorAssessment] as any
      const fieldValue = currentSectionData?.[condition.questionId]

      let conditionMet = false
      switch (condition.operator) {
        case 'equals':
          conditionMet = fieldValue === condition.value
          break
        case 'not_equals':
          conditionMet = fieldValue !== condition.value
          break
        case 'less_than':
          conditionMet = fieldValue < condition.value
          break
        case 'greater_than':
          conditionMet = fieldValue > condition.value
          break
        case 'contains':
          conditionMet = Array.isArray(fieldValue) && fieldValue.includes(condition.value)
          break
      }

      if (conditionMet && action.type === 'hide') return false
    }

    return true
  }

  const validateSection = (sectionIndex: number): boolean => {
    const section = sections[sectionIndex]
    const sectionKey = sectionKeys[sectionIndex]
    const sectionData = formData[sectionKey as keyof VendorAssessment] as any
    const newErrors: Record<string, string> = {}

    section.questions.forEach(question => {
      if (!checkConditionalLogic(question)) return

      const value = sectionData?.[question.id]
      const errorKey = `${sectionKey}.${question.id}`

      if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[errorKey] = `${question.label} is required`
      }

      if (question.validation && value) {
        if (question.validation.min !== undefined && value < question.validation.min) {
          newErrors[errorKey] = `${question.label} must be at least ${question.validation.min}`
        }
        if (question.validation.max !== undefined && value > question.validation.max) {
          newErrors[errorKey] = `${question.label} must be at most ${question.validation.max}`
        }
        if (question.validation.pattern && !new RegExp(question.validation.pattern).test(value)) {
          newErrors[errorKey] = question.validation.message || `${question.label} format is invalid`
        }
      }
    })

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData as VendorAssessment)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = (): boolean => {
    for (let i = 0; i < sections.length; i++) {
      if (!validateSection(i)) return false
    }
    return true
  }

  const renderField = (question: Question, sectionKey: string) => {
    if (!checkConditionalLogic(question)) return null

    const sectionData = formData[sectionKey as keyof VendorAssessment] as any
    const value = sectionData?.[question.id]
    const errorKey = `${sectionKey}.${question.id}`
    const hasError = !!errors[errorKey]

    const commonProps = {
      id: question.id,
      'data-testid': question.id
    }

    const fieldWrapper = (field: React.ReactNode) => (
      <div key={question.id} className="space-y-2">
        <Label htmlFor={question.id} className={`text-sm font-medium ${question.required ? 'after:content-["*"] after:text-red-500' : ''}`}>
          {question.label}
        </Label>
        {question.description && (
          <p className="text-sm text-gray-600">{question.description}</p>
        )}
        {field}
        {question.helpText && (
          <p className="text-xs text-gray-500">{question.helpText}</p>
        )}
        {hasError && (
          <p className="text-sm text-red-600">{errors[errorKey]}</p>
        )}
        {question.riskWeight && question.riskWeight > 10 && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangleIcon className="h-4 w-4" />
            <span className="text-xs">High risk question</span>
          </div>
        )}
      </div>
    )

    switch (question.type) {
      case 'text':
      case 'email':
      case 'url':
        return fieldWrapper(
          <Input
            {...commonProps}
            type={question.type}
            value={value || ''}
            onChange={(e) => handleFieldChange(sectionKey, question.id, e.target.value)}
            placeholder={question.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'textarea':
        return fieldWrapper(
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleFieldChange(sectionKey, question.id, e.target.value)}
            placeholder={question.placeholder}
            className={`min-h-[100px] ${hasError ? 'border-red-500' : ''}`}
          />
        )

      case 'number':
        return fieldWrapper(
          <Input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(sectionKey, question.id, parseInt(e.target.value) || 0)}
            min={question.validation?.min}
            max={question.validation?.max}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'boolean':
        return fieldWrapper(
          <div className="flex items-center space-x-2">
            <Checkbox
              {...commonProps}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(sectionKey, question.id, checked)}
            />
            <Label htmlFor={question.id} className="text-sm font-normal">
              Yes
            </Label>
          </div>
        )

      case 'select':
        return fieldWrapper(
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleFieldChange(sectionKey, question.id, newValue)}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return fieldWrapper(
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || []
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option)
                    handleFieldChange(sectionKey, question.id, newValues)
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vendor Intake Assessment</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Section {currentSection + 1} of {sections.length}: {currentSectionData.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {riskFlags.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangleIcon className="h-3 w-3" />
                  {riskFlags.length} Risk{riskFlags.length !== 1 ? 's' : ''}
                </Badge>
              )}
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Risk Flags Alert */}
      {riskFlags.length > 0 && (
        <Alert>
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Compliance risks detected:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {riskFlags.slice(0, 3).map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
                {riskFlags.length > 3 && (
                  <li>... and {riskFlags.length - 3} more</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            {currentSectionData.title}
          </CardTitle>
          <p className="text-gray-600">{currentSectionData.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentSectionData.questions.map((question) =>
            renderField(question, sectionKeys[currentSection])
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {onSave && (
            <Button
              variant="ghost"
              onClick={() => onSave(formData)}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {currentSection === sections.length - 1 ? (
              <>
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                <CheckCircleIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Section Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentSection
                    ? 'bg-blue-600 text-white'
                    : index < currentSection
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
