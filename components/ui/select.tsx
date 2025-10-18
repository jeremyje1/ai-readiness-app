/* Thin Radix Select wrapper with typed helpers */
import * as Radix from '@radix-ui/react-select'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export const Select      = Radix.Root
export const SelectValue = Radix.Value

export const SelectTrigger = ({ className, children, ...rest }: Radix.SelectTriggerProps) => (
  <Radix.Trigger
    {...rest}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
  >
    {children}
    <Radix.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Radix.Icon>
  </Radix.Trigger>
)

export const SelectContent = ({ className, children, ...rest }: Radix.SelectContentProps) => (
  <Radix.Portal>
    <Radix.Content
      {...rest}
      position="popper"
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-950 shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
    >
      <Radix.Viewport className="p-1">
        {children}
      </Radix.Viewport>
    </Radix.Content>
  </Radix.Portal>
)

export const SelectItem = ({ className, children, ...rest }: Radix.SelectItemProps) => (
  <Radix.Item
    {...rest}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-neutral-100 focus:text-neutral-900',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Radix.ItemIndicator>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </Radix.ItemIndicator>
    </span>
    <Radix.ItemText>{children}</Radix.ItemText>
  </Radix.Item>
)