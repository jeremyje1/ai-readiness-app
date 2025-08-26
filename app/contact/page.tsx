"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useRef, useState } from 'react';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '', company_website: '' });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const successRef = useRef<HTMLParagraphElement | null>(null);

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
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
    if (status && successRef.current) successRef.current.focus();
  }, [error, status]);

  const hasErrors = Object.values(fieldErrors).some(error => error);
  const isFormValid = form.name.trim() &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
    form.message.trim().length >= 10;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Expert Support Options */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-4 text-gray-900 text-center'>Get Expert Support</h1>
          <p className='text-gray-600 mb-8 text-center max-w-2xl mx-auto'>
            Choose the best way to connect with our AI governance experts. From quick questions to strategic planning, we're here to help your institution succeed.
          </p>

          <div className='grid md:grid-cols-2 gap-6 mb-12'>
            {/* Schedule Consultation */}
            <div className='bg-white shadow-sm rounded-lg p-6 border-l-4 border-blue-500'>
              <div className='flex items-center mb-4'>
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className='text-xl font-semibold text-gray-900'>Schedule a Consultation</h2>
              </div>
              <p className='text-gray-600 mb-4'>
                Book a personalized 30-minute session with our AI governance expert Jeremy Estrella to discuss your institution's specific needs and strategy.
              </p>
              <a
                href="https://calendly.com/jeremyestrella/30min"
                target="_blank"
                rel="noopener noreferrer"
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Book Now
              </a>
              <div className='mt-3 text-sm text-gray-500'>
                ✓ Strategic planning guidance<br />
                ✓ Policy development support<br />
                ✓ Implementation best practices
              </div>
            </div>

            {/* Join Community */}
            <div className='bg-white shadow-sm rounded-lg p-6 border-l-4 border-green-500'>
              <div className='flex items-center mb-4'>
                <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1z" />
                </svg>
                <h2 className='text-xl font-semibold text-gray-900'>Join Our Community</h2>
              </div>
              <p className='text-gray-600 mb-4'>
                Connect with peer institutions, ask questions, and get real-time guidance from our experts and community members.
              </p>
              <a
                href="https://northpath-strategies.slack.com/archives/C09CZFF6URE"
                target="_blank"
                rel="noopener noreferrer"
                className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Join Slack
              </a>
              <div className='mt-3 text-sm text-gray-500'>
                ✓ Peer-to-peer learning<br />
                ✓ Expert Q&A sessions<br />
                ✓ Resource sharing
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className='bg-white shadow-sm rounded-lg p-8'>
          <h2 className='text-2xl font-bold mb-2 text-gray-900'>Send Us a Message</h2>
          <p className='text-gray-600 mb-8 text-sm'>
            Prefer to send a detailed message? Use the form below and our team will respond promptly during business hours.
          </p>
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
    </div>
  );
}
