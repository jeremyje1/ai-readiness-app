import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Blueprint - Authentication',
  description: 'Sign in to your AI readiness assessment platform',
};

// Force dynamic rendering and no caching for auth pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}