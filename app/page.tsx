import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the start page where users can choose K-12 or Higher Ed
  redirect('/start');
}
