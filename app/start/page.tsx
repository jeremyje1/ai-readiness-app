'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/get-started');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Redirecting...</div>
    </div>
  );
}