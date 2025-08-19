// Replaced SSR-heavy dashboard page with client component
import DashboardClient from '@/components/DashboardClient';

export const metadata = {
  title: 'Dashboard | Northpath Strategies',
  description: 'Your private organizational dashboard',
};

export default function DashboardPage() {
  return <DashboardClient />;
}