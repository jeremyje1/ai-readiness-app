/* Thin Radix Select wrapper with typed helpers */
import * as Radix from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

export const Select      = Radix.Root
export const SelectValue = Radix.Value

export const SelectTrigger = ({ children, className, ...rest }: Radix.SelectTriggerProps & { children?: React.ReactNode }) => (
  <Radix.Trigger
    {...rest}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white',
      'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300',
      className
    )}
  >
    {children}
    <Radix.Icon asChild>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-50"
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

export const SelectContent = ({ className, children, ...rest }: Radix.SelectContentProps) => (
  <Radix.Portal>
    <Radix.Content
      {...rest}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      position="popper"
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
      'focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'hover:bg-gray-100',
      className
    )}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Radix.ItemIndicator>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m11.4669 3.72684-6.46166 6.46165L2.72684 7.91083"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Radix.ItemIndicator>
    </span>
    <Radix.ItemText>{children}</Radix.ItemText>
  </Radix.Item>
)