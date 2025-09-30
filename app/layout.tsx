import AuthNav from '@/components/AuthNav'
import { PasswordSetupGuard } from '@/components/PasswordSetupGuard'
import TutorialProvider from '@/components/TutorialProvider'
import UserProvider from '@/components/UserProvider'
import { AudienceProvider } from '@/lib/audience/AudienceContext'
import { deriveAudience } from '@/lib/audience/deriveAudience'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Readiness Assessment Platform',
  description: 'Comprehensive AI readiness assessments for organizations',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Derive initial audience from server context
  const headersList = headers();
  const host = headersList.get('host') || undefined;
  const referer = headersList.get('referer') || undefined;

  const derivation = deriveAudience({ host, referer });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiblueprint.k12aiblueprint.com';

  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={baseUrl} />
      </head>
      <body className={inter.className}>
        <AudienceProvider initialAudience={derivation.audience}>
          <UserProvider>
            <TutorialProvider>
              <AuthNav />
              <PasswordSetupGuard>
                {children}
              </PasswordSetupGuard>
            </TutorialProvider>
          </UserProvider>
        </AudienceProvider>
      </body>
    </html>
  )
}
