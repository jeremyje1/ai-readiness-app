import FundingJustificationGeneratorV2 from '@/components/FundingJustificationGeneratorV2'

export default function FundingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FundingJustificationGeneratorV2 />
    </div>
  )
}

export const metadata = {
  title: 'Funding Justification Generator - AI Readiness',
  description: 'Generate grant narratives and funding justifications for AI initiatives aligned with federal education funding guidelines.'
}
