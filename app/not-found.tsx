import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="mt-4">
            <Search className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>

          <Link href="/get-started">
            <Button variant="outline" className="w-full sm:w-auto">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}