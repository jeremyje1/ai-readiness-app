/* shadcn/ui-style button with a typed `variant` prop
   (outline | default | ghost) — extend as you like                                */
import { cn } from '@/lib/utils'
import { Slot } from "@radix-ui/react-slot"
import * as React from 'react'

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
        // Variants
        variant === 'default' && 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg',
        variant === 'outline' && 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white',
        variant === 'ghost' && 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant === 'link' && 'text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline bg-transparent shadow-none',
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