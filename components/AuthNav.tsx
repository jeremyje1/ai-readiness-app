'use client';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/browser-client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// CACHE BUST MARKER - Force chunk regeneration
// Build: October 4, 2025 12:58 PM - Breaking persistent cache issue
const AUTH_NAV_VERSION = 'cache-bust-v4-' + Date.now();
const DEPLOYMENT_ID = 'deployment-1759600750-' + Math.random().toString(36).slice(2);

export default function AuthNav() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();
  const { hasPremiumAccess, isLoading: subLoading } = useSubscription();

  // Log version on mount for verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[AuthNav] Cache Bust Active:', {
        version: AUTH_NAV_VERSION,
        deployment: DEPLOYMENT_ID,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[AuthNav] Session error (expected if not logged in):', error.message);
          setUserEmail(null);
        } else {
          setUserEmail(data.session?.user?.email || null);
        }
      } catch (error) {
        console.error('[AuthNav] Error loading session:', error);
        setUserEmail(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_evt: AuthChangeEvent, session: Session | null) => {
      setUserEmail(session?.user?.email || null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase.auth]);

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all auth-related storage to prevent cache issues
      if (typeof window !== 'undefined') {
        // Clear local storage
        localStorage.clear();

        // Clear session storage
        sessionStorage.clear();

        // Clear cookies (client-side accessible ones)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Force reload to ensure clean state
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/';
    }
  };

  const linkBase = 'hover:text-gray-900 px-2 py-1 rounded transition-colors';
  const activeClasses = 'text-indigo-600 font-semibold';
  const links = [
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' }
  ];

  const dashboardLinks = [
    { href: '/dashboard/personalized', label: 'Dashboard', description: 'Your personalized AI readiness dashboard' },
    { href: '/assessment', label: 'Assessment', description: 'Take or review your AI readiness assessment' },
    { href: '/blueprint', label: 'Blueprints', description: 'View and manage your AI implementation blueprints' },
    { href: '/resources/templates', label: 'Resources', description: 'Access templates and guides' }
  ];

  const premiumLinks = [
    { href: '/dashboard/premium', label: 'Premium Dashboard', description: 'Advanced metrics and ROI tracking' },
    { href: '/reports/ai-trends', label: 'AI Trends', description: 'Monthly insights and competitive analysis' },
    { href: '/resources/policies', label: 'Policy Library', description: '50+ AI policy templates' },
    { href: '/team', label: 'Team Workspace', description: 'Collaborate with your team' },
    { href: '/expert-sessions/schedule', label: 'Expert Sessions', description: 'Book 1-on-1 strategy calls' }
  ];
  return (
    <header className='w-full bg-white/70 backdrop-blur border-b border-gray-200 text-sm sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 py-2 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='font-semibold text-gray-800'>AI Blueprint™</Link>
          <button aria-label='Toggle navigation menu' aria-expanded={open} onClick={() => setOpen(o => !o)} className='md:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-indigo-500'>
            <span className='sr-only'>Menu</span>
            <svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              {open ? <><line x1='4' y1='4' x2='16' y2='16' /><line x1='16' y1='4' x2='4' y2='16' /></> : <><line x1='3' y1='6' x2='17' y2='6' /><line x1='3' y1='12' x2='17' y2='12' /><line x1='3' y1='18' x2='17' y2='18' /></>}
            </svg>
          </button>
        </div>
        <nav className='hidden md:flex items-center gap-2 text-gray-600'>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`${linkBase} ${pathname === l.href ? activeClasses : ''}`}>{l.label}</Link>
          ))}
          {userEmail && (
            <>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              {dashboardLinks.map(l => (
                <Link key={l.href} href={l.href} className={`${linkBase} ${pathname === l.href ? activeClasses : ''}`} title={l.description}>{l.label}</Link>
              ))}
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <details className="relative group">
                <summary className={`${linkBase} cursor-pointer flex items-center gap-1`}>
                  Premium
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  {premiumLinks.map(l => (
                    <Link key={l.href} href={l.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <div className="font-medium">{l.label}</div>
                      <div className="text-xs text-gray-500">{l.description}</div>
                    </Link>
                  ))}
                </div>
              </details>
            </>
          )}
        </nav>
        <div className='hidden md:flex items-center gap-3'>
          {!loading && userEmail && (
            <>
              {!subLoading && !hasPremiumAccess && (
                <Link
                  href='/pricing'
                  className='flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl'
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Premium
                </Link>
              )}
              <Link
                href='/dashboard/personalized'
                className='flex items-center gap-2 text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors'
                title='Go to Dashboard'
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className='truncate max-w-[120px]'>{userEmail}</span>
              </Link>
              <Button variant='outline' size='sm' onClick={logout}>Logout</Button>
            </>
          )}
          {!loading && !userEmail && (
            <>
              <Link href='/auth/login' className='text-gray-700 hover:text-black'>Login</Link>
              <Link href='/get-started' className='text-blue-600 hover:underline'>Get Started</Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile panel */}
      {open && (
        <div className='md:hidden border-t border-gray-200 bg-white px-4 pb-4 animate-fadeIn'>
          <div className='flex flex-col gap-2 py-3'>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`${linkBase} ${pathname === l.href ? activeClasses : 'text-gray-600'}`}>{l.label}</Link>
            ))}
            {userEmail && (
              <>
                <div className='border-t border-gray-100 my-2'></div>
                <div className="text-xs text-gray-500 font-medium mb-1">DASHBOARDS</div>
                {dashboardLinks.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`${linkBase} ${pathname === l.href ? activeClasses : 'text-gray-600'}`}>
                    <div>
                      <div className="font-medium">{l.label}</div>
                      <div className="text-xs text-gray-500">{l.description}</div>
                    </div>
                  </Link>
                ))}
                <div className='border-t border-gray-100 my-2'></div>
                {hasPremiumAccess ? (
                  <>
                    <div className="text-xs text-gray-500 font-medium mb-1">PREMIUM FEATURES ✨</div>
                    {premiumLinks.map(l => (
                      <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`${linkBase} ${pathname === l.href ? activeClasses : 'text-gray-600'}`}>
                        <div>
                          <div className="font-medium">{l.label}</div>
                          <div className="text-xs text-gray-500">{l.description}</div>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href='/pricing'
                    onClick={() => setOpen(false)}
                    className='flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl mx-2 my-2'
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade to Premium - $199/month
                  </Link>
                )}
              </>
            )}
            <div className='border-t border-gray-100 my-2'></div>
            {!loading && userEmail && (
              <>
                <Link
                  href='/dashboard/personalized'
                  onClick={() => setOpen(false)}
                  className='flex items-center gap-2 text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors'
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <div>
                    <div className="font-medium">Dashboard</div>
                    <div className="text-xs text-gray-500">{userEmail}</div>
                  </div>
                </Link>
                <Button variant='outline' size='sm' onClick={logout}>Logout</Button>
              </>
            )}
            {!loading && !userEmail && (
              <>
                <Link href='/auth/login' onClick={() => setOpen(false)} className='text-gray-700 hover:text-black'>Login</Link>
                <Link href='/get-started' onClick={() => setOpen(false)} className='text-blue-600 hover:underline'>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
