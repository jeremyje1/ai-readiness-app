"use client";
import React from 'react';
import { buildUnifiedCheckoutUrl, UnifiedCheckoutOptions } from '@/lib/unifiedCheckout';
import { Button, ButtonProps } from './button';

export interface UnifiedCheckoutButtonProps extends Omit<UnifiedCheckoutOptions, 'contactEmail' | 'contactName'> {
  label?: string;
  email?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
  onBuildingUrl?: (url: string) => void;
}

export const UnifiedCheckoutButton: React.FC<UnifiedCheckoutButtonProps> = (props: UnifiedCheckoutButtonProps) => {
  const {
    product,
    billing,
    trialDays,
    returnTo,
    email,
    name,
    priceId,
    successUrl,
    cancelUrl,
    label = 'Subscribe',
    className,
    disabled,
    onBuildingUrl
  } = props;
  const handleClick = () => {
    try {
      const url = buildUnifiedCheckoutUrl({
        product,
        billing,
        trialDays,
        returnTo,
        contactEmail: email,
        contactName: name,
        priceId,
        successUrl,
        cancelUrl
      });
      onBuildingUrl?.(url);
      window.location.href = url;
    } catch (e) {
      console.error('Failed to build checkout URL', e);
    }
  };
  return (
    <Button {...({ onClick: handleClick, disabled, className } as any)}>
      {label}
    </Button>
  );
};
