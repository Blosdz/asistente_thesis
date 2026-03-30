import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('block text-sm font-semibold text-slate-700 mb-1', className)}
    {...props}
  />
));

Label.displayName = 'Label';
