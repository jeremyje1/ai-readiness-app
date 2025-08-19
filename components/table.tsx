// components/ui/table.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          'w-full border-collapse text-left text-sm [&_th]:border-b [&_th]:px-4 [&_th]:py-2 [&_td]:border-b [&_td]:px-4 [&_td]:py-2',
          className,
        )}
        {...props}
      />
    </div>
  );
}