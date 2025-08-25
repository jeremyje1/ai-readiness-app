import ComplianceWatchlist from '@/components/ComplianceWatchlist'

export default function CompliancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComplianceWatchlist />
    </div>
  )
}

export const metadata = {
  title: 'Compliance Watchlist - AI Readiness',
  description: 'Monitor AI-related compliance items, vendor renewals, policy approvals, and training requirements.'
}
