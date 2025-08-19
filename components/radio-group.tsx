'use client';

import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface RadioGroupContextType {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  name?: string;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, name, className }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div className={cn('space-y-2', className)} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  className?: string;
  disabled?: boolean;
}

export function RadioGroupItem({ value, id, className, disabled }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext);
  
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const { value: selectedValue, onValueChange, name } = context;
  const isSelected = selectedValue === value;

  return (
    <input
      type="radio"
      id={id}
      name={name}
      value={value}
      checked={isSelected}
      onChange={() => onValueChange(value)}
      disabled={disabled}
      className={cn(
        'h-4 w-4 border border-gray-300 rounded-full',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'checked:bg-blue-600 checked:border-blue-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    />
  );
}
