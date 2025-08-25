'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function AuthNav() {
  const [userEmail, setUserEmail] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      setUserEmail(data.session?.user?.email || null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session)=>{
      setUserEmail(session?.user?.email || null);
    });
    return ()=> listener.subscription.unsubscribe();
  },[]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const linkBase = 'hover:text-gray-900 px-2 py-1 rounded transition-colors';
  const activeClasses = 'text-indigo-600 font-semibold';
  const links = [
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' }
  ];

  const dashboardLinks = [
    { href: '/executive', label: 'Executive Dashboard', description: 'Readiness scorecards & metrics' },
    { href: '/executive/compliance', label: 'Compliance Watch', description: 'Track policies & vendor renewals' },
    { href: '/executive/funding', label: 'Funding Justification', description: 'Generate grant narratives' },
    { href: '/community', label: 'Community Hub', description: 'Monthly briefings, templates & benchmarks' }
  ];
  return (
    <header className='w-full bg-white/70 backdrop-blur border-b border-gray-200 text-sm sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 py-2 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='font-semibold text-gray-800'>AI Blueprint™</Link>
          <button aria-label='Toggle navigation menu' aria-expanded={open} onClick={()=>setOpen(o=>!o)} className='md:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-indigo-500'>
            <span className='sr-only'>Menu</span>
            <svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              {open ? <><line x1='4' y1='4' x2='16' y2='16'/><line x1='16' y1='4' x2='4' y2='16'/></> : <><line x1='3' y1='6' x2='17' y2='6'/><line x1='3' y1='12' x2='17' y2='12'/><line x1='3' y1='18' x2='17' y2='18'/></>}
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
            </>
          )}
        </nav>
        <div className='hidden md:flex items-center gap-3'>
          {!loading && userEmail && (
            <>
              <Link href='/ai-readiness/dashboard' className='text-gray-700 hover:text-black truncate max-w-[160px]' title={userEmail}>{userEmail}</Link>
              <Button variant='outline' size='sm' onClick={logout}>Logout</Button>
            </>
          )}
          {!loading && !userEmail && (
            <>
              <Link href='/auth/login' className='text-gray-700 hover:text-black'>Login</Link>
              <Link href='/start?billing=monthly' className='text-blue-600 hover:underline'>Start</Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile panel */}
      {open && (
        <div className='md:hidden border-t border-gray-200 bg-white px-4 pb-4 animate-fadeIn'>
          <div className='flex flex-col gap-2 py-3'>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className={`${linkBase} ${pathname === l.href ? activeClasses : 'text-gray-600'}`}>{l.label}</Link>
            ))}
            {userEmail && (
              <>
                <div className='border-t border-gray-100 my-2'></div>
                <div className="text-xs text-gray-500 font-medium mb-1">DASHBOARDS</div>
                {dashboardLinks.map(l => (
                  <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className={`${linkBase} ${pathname === l.href ? activeClasses : 'text-gray-600'}`}>
                    <div>
                      <div className="font-medium">{l.label}</div>
                      <div className="text-xs text-gray-500">{l.description}</div>
                    </div>
                  </Link>
                ))}
              </>
            )}
            <div className='border-t border-gray-100 my-2'></div>
            {!loading && userEmail && (
              <>
                <Link href='/ai-readiness/dashboard' onClick={()=>setOpen(false)} className='text-gray-700 hover:text-black'>{userEmail}</Link>
                <Button variant='outline' size='sm' onClick={logout}>Logout</Button>
              </>
            )}
            {!loading && !userEmail && (
              <>
                <Link href='/auth/login' onClick={()=>setOpen(false)} className='text-gray-700 hover:text-black'>Login</Link>
                <Link href='/start?billing=monthly' onClick={()=>setOpen(false)} className='text-blue-600 hover:underline'>Start</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
