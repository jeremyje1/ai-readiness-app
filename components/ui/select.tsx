/* Thin Radix Select wrapper with typed helpers */
import * as Radix from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

export const Select      = Radix.Root
export const SelectValue = Radix.Value

export const SelectTrigger = ({ children, className, ...rest }: Radix.SelectTriggerProps & { children?: React.ReactNode }) => (
  <Radix.Trigger
    {...rest}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm',
      className
    )}
  >
    {children}
    <Radix.Icon className="h-4 w-4 opacity-50">
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m4.93179 5.43179 2.56817 2.56817 2.56817-2.56817"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Radix.Icon>
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