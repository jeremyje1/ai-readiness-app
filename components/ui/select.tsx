/* Thin Radix Select wrapper with typed helpers */
import * as Radix from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

export const Select      = Radix.Root
export const SelectValue = Radix.Value

export const SelectTrigger = ({ className, ...rest }: Radix.SelectTriggerProps) => (
  <Radix.Trigger
    {...rest}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm',
      className
    )}
  >
    <SelectValue placeholder="Select…" />
  </Radix.Trigger>
)

export const SelectContent = ({ className, ...rest }: Radix.SelectContentProps) => (
  <Radix.Portal>
    <Radix.Content
      {...rest}
      className={cn('rounded-md border bg-white p-1 shadow-md', className)}
    />
  </Radix.Portal>
)

export const SelectItem = ({ className, ...rest }: Radix.SelectItemProps) => (
  <Radix.Item
    {...rest}
    className={cn(
      'cursor-pointer select-none rounded px-3 py-1.5 text-sm outline-none',
      'data-[state=checked]:bg-neutral-100',
      'data-[disabled]:opacity-40',
      className
    )}
  >
    <Radix.ItemText>{rest.children}</Radix.ItemText>
  </Radix.Item>
)