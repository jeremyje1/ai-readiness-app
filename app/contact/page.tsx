"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '', company_website: '' });
  const [status, setStatus] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const errorRef = useRef<HTMLParagraphElement|null>(null);
  const successRef = useRef<HTMLParagraphElement|null>(null);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return undefined;
  };

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear field errors when user starts typing
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldError = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: fieldError });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null); setError(null); setLoading(true);
    
    // Validate all fields
    const errors: FormErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (['name', 'email', 'message'].includes(key)) {
        const fieldError = validateField(key, value);
        if (fieldError) errors[key as keyof FormErrors] = fieldError;
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed');
      setStatus('Message sent successfully. We will follow up shortly.');
      setForm({ name: '', email: '', organization: '', message: '', company_website: '' });
      setFieldErrors({});
      setTouched({});
    } catch (e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(()=>{
    if (error && errorRef.current) errorRef.current.focus();
    if (status && successRef.current) successRef.current.focus();
  },[error,status]);

  const hasErrors = Object.values(fieldErrors).some(error => error);
  const isFormValid = form.name.trim() && 
                     /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && 
                     form.message.trim().length >= 10;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-6'>
      <div className='max-w-2xl mx-auto bg-white shadow-sm rounded-lg p-8'>
        <h1 className='text-3xl font-bold mb-2 text-gray-900'>Contact Us</h1>
        <p className='text-gray-600 mb-8 text-sm'>Have a question about AI Blueprint™ services, pricing, or implementation? Send us a message and our team will respond promptly.</p>
        <form onSubmit={submit} className='space-y-5' noValidate>
          <div>
            <label htmlFor='name' className='block text-sm font-medium mb-1'>Name *</label>
            <Input 
              id='name'
              name='name' 
              aria-required='true' 
              aria-invalid={fieldErrors.name ? 'true' : 'false'}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              value={form.name} 
              onChange={update}
              onBlur={handleBlur}
              className={fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              required 
            />
            {fieldErrors.name && (
              <span id='name-error' role='alert' className='text-sm text-red-600 mt-1 block'>
                {fieldErrors.name}
              </span>
            )}
          </div>
          <div>
            <label htmlFor='email' className='block text-sm font-medium mb-1'>Email *</label>
            <Input 
              id='email'
              type='email' 
              name='email' 
              aria-required='true' 
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              value={form.email} 
              onChange={update}
              onBlur={handleBlur}
              className={fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              required 
            />
            {fieldErrors.email && (
              <span id='email-error' role='alert' className='text-sm text-red-600 mt-1 block'>
                {fieldErrors.email}
              </span>
            )}
          </div>
          <div>
            <label htmlFor='organization' className='block text-sm font-medium mb-1'>Organization (optional)</label>
            <Input 
              id='organization'
              name='organization' 
              value={form.organization} 
              onChange={update} 
            />
          </div>
          <div>
            <label htmlFor='message' className='block text-sm font-medium mb-1'>Message *</label>
            <Textarea 
              id='message'
              name='message' 
              aria-required='true' 
              aria-invalid={fieldErrors.message ? 'true' : 'false'}
              aria-describedby={fieldErrors.message ? 'message-error' : undefined}
              value={form.message} 
              onChange={update}
              onBlur={handleBlur}
              className={fieldErrors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              rows={5} 
              required 
            />
            {fieldErrors.message && (
              <span id='message-error' role='alert' className='text-sm text-red-600 mt-1 block'>
                {fieldErrors.message}
              </span>
            )}
          </div>
          {/* Honeypot field (hidden from users) */}
          <div className='hidden' aria-hidden='true'>
            <label>Company Website (leave blank)</label>
            <input type='text' name='company_website' value={form.company_website} onChange={update} tabIndex={-1} autoComplete='off' />
          </div>
          {error && (
            <div role='alert' aria-live='polite'>
              <p ref={errorRef} tabIndex={-1} className='text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3'>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
          {status && (
            <div role='alert' aria-live='polite'>
              <p ref={successRef} tabIndex={-1} className='text-sm text-green-600 bg-green-50 border border-green-200 rounded p-3'>
                <strong>Success:</strong> {status}
              </p>
            </div>
          )}
          <Button 
            type='submit' 
            disabled={!isFormValid || hasErrors || loading} 
            className='w-full'
            aria-describedby='submit-help'
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
          <p id='submit-help' className='text-xs text-gray-500 text-center'>
            All required fields must be completed. We respect your privacy. See our <a href='/privacy' className='underline text-blue-600 hover:text-blue-800'>Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
