/**
 * Unified Checkout URL Builder
 */
export interface UnifiedCheckoutOptions {
  product: string;
  billing?: 'monthly' | 'yearly' | 'annual';
  trialDays?: number;
  returnTo?: string;
  contactEmail?: string;
  contactName?: string;
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
}
export function buildUnifiedCheckoutUrl(opts: UnifiedCheckoutOptions): string {
  const { product, billing = 'monthly', trialDays, returnTo, contactEmail, contactName, priceId, successUrl, cancelUrl } = opts;
  if (!product) throw new Error('product required');
  const params = new URLSearchParams({ product, billing });
  if (trialDays && trialDays > 0) params.set('trial_days', String(trialDays));
  if (returnTo) params.set('return_to', returnTo);
  if (contactEmail) params.set('contact_email', contactEmail);
  if (contactName) params.set('contact_name', contactName);
  if (priceId) params.set('price_id', priceId);
  if (successUrl) params.set('success_url', successUrl);
  if (cancelUrl) params.set('cancel_url', cancelUrl);
  return `/api/stripe/unified-checkout?${params.toString()}`;
}
