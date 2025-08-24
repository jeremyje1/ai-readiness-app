import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const headersList = headers();
  const domainContext = headersList.get('x-domain-context') || 'k12';
  
  // Route to domain-specific marketing pages
  if (domainContext === 'higher-ed') {
    redirect('/higher-ed');
  } else {
    redirect('/ai-readiness');
  }
}
