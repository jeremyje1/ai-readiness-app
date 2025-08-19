'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function AuthNav() {
  const [userEmail, setUserEmail] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className='w-full bg-white/70 backdrop-blur border-b border-gray-200 text-sm'>
      <div className='max-w-7xl mx-auto px-4 py-2 flex items-center justify-between'>
        <Link href='/' className='font-semibold text-gray-800'>AI Blueprint™</Link>
        <div className='flex items-center gap-3'>
          {!loading && userEmail && (
            <>
              <Link href='/ai-readiness/dashboard' className='text-gray-700 hover:text-black'>{userEmail}</Link>
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
    </div>
  );
}
