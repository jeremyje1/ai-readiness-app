'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Shield, 
  ArrowRight,
  Star,
  Users,
  Phone,
  Calendar
} from 'lucide-react'
import { useAnalytics } from '@/components/analytics-tracker'
import { AI_SERVICE_COMPLETE } from '@/lib/unified-pricing-config'

interface ConsultationCheckoutProps {
  serviceType: string
  serviceName: string
  servicePrice: number
  serviceDescription: string
  isSubscription?: boolean
}

export function ConsultationCheckout({ 
  serviceType, 
  serviceName, 
  servicePrice, 
  serviceDescription,
  isSubscription = false 
}: ConsultationCheckoutProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailValid, setEmailValid] = useState(false)
  const analytics = useAnalytics()

  useEffect(() => {
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  }, [email])

  const handleCheckout = async () => {
    if (!emailValid || !name.trim()) return

    setIsLoading(true)
    analytics.trackConsultationRequested(serviceName)

    try {
      const response = await fetch('/api/stripe/consultation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: serviceType,
          userEmail: email,
          customerName: name
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Consultation checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto border-2 border-blue-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl mb-2">{serviceName}</CardTitle>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          ${servicePrice}
          {isSubscription && <span className="text-lg text-gray-600">/month</span>}
        </div>
        <p className="text-gray-600 text-sm">{serviceDescription}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1"
          />
          {email && !emailValid && (
            <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
            <Shield className="h-4 w-4" />
            What's Included
          </div>
          <ul className="space-y-1 text-sm text-green-700">
            {serviceType === 'expert_consultation_call' && (
              <>
                <li>• 60-minute strategy session</li>
                <li>• AI implementation roadmap</li>
                <li>• Q&A with expert consultant</li>
                <li>• Follow-up summary report</li>
              </>
            )}
            {serviceType === 'implementation_support_package' && (
              <>
                <li>• Dedicated consultant access</li>
                <li>• Weekly progress reviews</li>
                <li>• Implementation guidance</li>
                <li>• Priority email support</li>
              </>
            )}
            {serviceType === 'custom_policy_review' && (
              <>
                <li>• Expert policy analysis</li>
                <li>• Detailed recommendations</li>
                <li>• Compliance review</li>
                <li>• Revised policy documents</li>
              </>
            )}
          </ul>
        </div>

        <Button 
          onClick={handleCheckout}
          disabled={!emailValid || !name.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? 'Processing...' : `Purchase ${serviceName}`}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CreditCard className="h-3 w-3" />
            Secure payment powered by Stripe
          </div>
          <p>You'll be redirected to complete your purchase securely</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Trial Experience Component with Credit Card Collection
export function TrialExperienceFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [email, setEmail] = useState('')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const analytics = useAnalytics()

  const steps = [
    {
      id: 1,
      title: 'Choose Your Plan',
      description: 'Select monthly or yearly billing',
      icon: Star
    },
    {
      id: 2,
      title: 'Secure Trial Setup',
      description: 'Add payment method (no charge for 7 days)',
      icon: CreditCard
    },
    {
      id: 3,
      title: 'Instant Access',
      description: 'Start using AI implementation immediately',
      icon: CheckCircle2
    }
  ]

  const handleTrialStart = async () => {
    analytics.trackCheckoutInitiated(billingPeriod, billingPeriod === 'yearly' ? 999.99 : 99.99)
    
    try {
      const response = await fetch('/api/stripe/unified-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingPeriod: billingPeriod,
          userEmail: email
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Trial checkout error:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">{steps[currentStep - 1].title}</CardTitle>
          <p className="text-gray-600">{steps[currentStep - 1].description}</p>
        </CardHeader>
        
        <CardContent className="max-w-md mx-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`p-4 border-2 rounded-lg text-center ${
                    billingPeriod === 'monthly' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-semibold">Monthly</div>
                  <div className="text-2xl font-bold">$99.99</div>
                  <div className="text-sm text-gray-600">per month</div>
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`p-4 border-2 rounded-lg text-center relative ${
                    billingPeriod === 'yearly' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <Badge className="absolute -top-2 -right-2 bg-green-600">Save $200</Badge>
                  <div className="font-semibold">Yearly</div>
                  <div className="text-2xl font-bold">$999.99</div>
                  <div className="text-sm text-gray-600">per year</div>
                </button>
              </div>
              <Button onClick={() => setCurrentStep(2)} className="w-full">
                Continue to Setup
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="trial-email">Email Address</Label>
                <Input
                  id="trial-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <Clock className="h-4 w-4" />
                  7-Day Free Trial
                </div>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Full access to all features</li>
                  <li>• No charge for 7 days</li>
                  <li>• Cancel anytime during trial</li>
                  <li>• Billing starts only after trial ends</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Why we need your payment method:</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  This ensures seamless service continuation after your trial. You can cancel anytime during the 7-day trial period.
                </p>
              </div>

              <Button 
                onClick={handleTrialStart}
                disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="w-full"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
