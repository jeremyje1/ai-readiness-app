"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '', company_website: '' });
  const [status, setStatus] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLParagraphElement|null>(null);
  const successRef = useRef<HTMLParagraphElement|null>(null);

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null); setError(null); setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed');
      setStatus('Message sent. We will follow up shortly.');
      setForm({ name: '', email: '', organization: '', message: '', company_website: '' });
    } catch (e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(()=>{
    if (error && errorRef.current) errorRef.current.focus();
    if (status && successRef.current) successRef.current.focus();
  },[error,status]);

  const disabled = !form.name || !form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || !form.message;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-6'>
      <div className='max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-8'>
        <h1 className='text-3xl font-bold mb-2 text-gray-900'>Contact Us</h1>
        <p className='text-gray-600 mb-8 text-sm'>Have a question about AI Blueprint™ services, pricing, or implementation? Send us a message and our team will respond promptly.</p>
        <form onSubmit={submit} className='space-y-5'>
          <div>
            <label className='block text-sm font-medium mb-1'>Name *</label>
            <Input name='name' aria-required='true' aria-invalid={!form.name ? 'true':'false'} value={form.name} onChange={update} required />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Email *</label>
            <Input type='email' name='email' aria-required='true' aria-invalid={form.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? 'false':'true'} value={form.email} onChange={update} required />
          </div>
            <div>
            <label className='block text-sm font-medium mb-1'>Organization (optional)</label>
            <Input name='organization' value={form.organization} onChange={update} />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Message *</label>
            <Textarea name='message' aria-required='true' aria-invalid={!form.message ? 'true':'false'} value={form.message} onChange={update} rows={5} required />
          </div>
          {/* Honeypot field (hidden from users) */}
          <div className='hidden'>
            <label>Company Website (leave blank)</label>
            <input type='text' name='company_website' value={form.company_website} onChange={update} tabIndex={-1} autoComplete='off' />
          </div>
          {error && <p ref={errorRef} tabIndex={-1} className='text-sm text-red-600'>{error}</p>}
          {status && <p ref={successRef} tabIndex={-1} className='text-sm text-green-600'>{status}</p>}
          <Button type='submit' disabled={disabled || loading} className='w-full'>
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
          <p className='text-xs text-gray-500 text-center'>We respect your privacy. See our <a href='/privacy' className='underline'>Privacy Policy</a>.</p>
        </form>
      </div>
    </div>
  );
}
