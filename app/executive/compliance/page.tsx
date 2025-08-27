import ComplianceWatchlistV2 from '@/components/ComplianceWatchlistV2'

export default function CompliancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComplianceWatchlistV2 />
    </div>
  )
}

export const metadata = {
  title: 'Compliance Watchlist - AI Readiness',
  description: 'Monitor AI-related compliance items, vendor renewals, policy approvals, and training requirements.'
}
