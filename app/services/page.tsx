import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-static';

const services = [
  {
    slug: 'ai-readiness-assessment',
    title: 'K-12 & Higher-Ed AI Readiness Assessments',
    blurb: 'Comprehensive multi-domain diagnostic using our AIRIX™, AIRS™, AICS™, AIMS™, AIPS™ and AIBS™ algorithms.'
  },
  {
    slug: 'implementation-blueprints',
    title: 'District Implementation Blueprints',
    blurb: 'Strategic sequencing of AI initiatives with prioritized roadmap & governance alignment.'
  },
  {
    slug: 'professional-development',
    title: 'Teacher Professional Development',
    blurb: 'Faculty & staff capability building: AI literacy, policy adoption, and instructional integration.'
  }
];

export default function ServicesIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
        <p className="text-gray-600 mb-10 max-w-3xl">
          Explore AI Blueprint™ service pillars supporting responsible, outcomes‑aligned AI transformation across K‑12 districts and higher education institutions.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="group">
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 mb-2">{s.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{s.blurb}</p>
                <span className="text-indigo-600 text-xs font-medium inline-block mt-4">Learn more →</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
