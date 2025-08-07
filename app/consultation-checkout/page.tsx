'use client'

import { useSearchParams } from 'next/navigation'
import { ConsultationCheckout } from '@/components/customer-journey'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ConsultationCheckoutPage() {
  const searchParams = useSearchParams()
  
  const serviceType = searchParams.get('service') || ''
  const serviceName = searchParams.get('name') || ''
  const servicePrice = parseInt(searchParams.get('price') || '0')
  const serviceTypeParam = searchParams.get('type') || 'one_time'
  
  const serviceDescriptions: Record<string, string> = {
    'expert_consultation_call': 'One-on-one strategy session with AI implementation expert',
    'implementation_support_package': 'Dedicated consultant support for hands-on implementation guidance', 
    'custom_policy_review': 'Expert review and refinement of your AI policies'
  }
  
  const serviceDescription = serviceDescriptions[serviceType] || 'Professional consultation service'
  const isSubscription = serviceTypeParam === 'subscription'

  if (!serviceType || !serviceName || !servicePrice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600 mb-6">The consultation service you're looking for could not be found.</p>
            <Link href="/pricing" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              NorthPath Strategies
            </Link>
            <Link href="/pricing" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Consultation Service</h1>
          <p className="text-xl text-gray-600">
            Add expert human guidance to your AI implementation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Service Benefits */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Why Add Consultation?</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Personalized guidance from AI implementation experts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Faster implementation with human oversight</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Custom solutions for unique organizational needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Direct access to industry best practices</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Complements Your Autonomous Service
                </h3>
                <p className="text-blue-800 text-sm">
                  Your core AI implementation continues to run autonomously. This consultation 
                  service provides additional human expertise when you need strategic guidance 
                  or custom solutions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <ConsultationCheckout
              serviceType={serviceType}
              serviceName={serviceName}
              servicePrice={servicePrice}
              serviceDescription={serviceDescription}
              isSubscription={isSubscription}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
