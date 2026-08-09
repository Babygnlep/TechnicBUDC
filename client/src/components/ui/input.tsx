import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn('flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500', className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
