'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, CreditCard, FileText, ArrowRight } from 'lucide-react'
import { useAnalytics } from '@/components/analytics-tracker'

interface CustomerPortalProps {
  customerId: string
  currentPlan?: {
    name: string
    billing: 'monthly' | 'yearly'
    amount: number
    nextBilling: string
  }
}

export function CustomerPortal({ customerId, currentPlan }: CustomerPortalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const analytics = useAnalytics()

  const handlePortalAccess = async () => {
    setIsLoading(true)
    analytics.trackPortalAccessed(customerId)
    
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId,
          returnUrl: window.location.href
        })
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Portal access error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Subscription */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold">{currentPlan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing</p>
                <p className="font-semibold">
                  ${currentPlan.amount} / {currentPlan.billing}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next billing date</p>
                <p className="font-semibold">{currentPlan.nextBilling}</p>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handlePortalAccess}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Loading...' : 'Manage Subscription'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePortalAccess}>
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Billing Settings</h3>
            <p className="text-sm text-gray-600">Update payment method, billing address, and invoices</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePortalAccess}>
          <CardContent className="p-6 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Change Plan</h3>
            <p className="text-sm text-gray-600">Switch between monthly and yearly billing</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePortalAccess}>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Download Invoices</h3>
            <p className="text-sm text-gray-600">Access billing history and download receipts</p>
          </CardContent>
        </Card>
      </div>

      {/* Autonomous Service Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Fully Autonomous Service</h3>
          <p className="text-blue-800 text-sm mb-4">
            Your AI implementation runs completely autonomously. No manual intervention required for core functionality.
          </p>
          <p className="text-xs text-blue-700">
            Need human consultation? Contact us about our optional consultation services available for additional fees.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
