import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthNav from '@/components/AuthNav'

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthNav />
        {children}
      </body>
    </html>
  )
}
