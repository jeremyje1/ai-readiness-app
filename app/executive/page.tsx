import ExecutiveDashboard from '@/components/ExecutiveDashboard'

export default function ExecutiveDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ExecutiveDashboard />
    </div>
  )
}

export const metadata = {
  title: 'Executive Dashboard - AI Readiness',
  description: 'Executive dashboard with readiness scorecards, adoption metrics, compliance watchlist, and funding opportunities for AI initiatives.'
}
