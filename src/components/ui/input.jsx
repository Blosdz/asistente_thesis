import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('input-pro', className)} {...props} />
));

Input.displayName = 'Input';
