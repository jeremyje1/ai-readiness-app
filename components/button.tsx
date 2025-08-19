/* shadcn/ui-style button with a typed `variant` prop
   (outline | default | ghost) — extend as you like                                */
import * as React from 'react'
import { Slot } from "@radix-ui/react-slot"
import { cn } from '@/lib/utils'

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

// Export simple Button to avoid complex forwardRef issues during SSR
export function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-variant={variant}
      data-size={size}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        // Variants - Updated with NorthPath brand colors
        variant === 'default' && 'bg-gradient-to-r from-np-primary-blue to-np-bright-blue text-white hover:from-np-deep-blue hover:to-np-primary-blue shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300',
        variant === 'outline' && 'border-2 border-np-primary-blue text-np-primary-blue hover:bg-np-primary-blue hover:text-white transition-all duration-300',
        variant === 'ghost' && 'text-np-primary-blue hover:bg-np-bright-blue/10 hover:text-np-deep-blue transition-all duration-300',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300',
        variant === 'link' && 'text-np-primary-blue hover:text-np-deep-blue underline-offset-4 hover:underline transition-all duration-300 bg-transparent shadow-none',
        // Sizes
        size === 'default' && 'h-10 py-2 px-4',
        size === 'sm' && 'h-9 px-3 text-xs',
        size === 'lg' && 'h-11 px-8 text-base font-semibold',
        size === 'icon' && 'h-10 w-10',
        className
      )}
      {...props}
    />
  )
}