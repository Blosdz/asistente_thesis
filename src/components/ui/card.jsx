import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('glass p-6', className)} {...props} />
));
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mb-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold text-slate-900', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm text-slate-700', className)} {...props} />
));
CardContent.displayName = 'CardContent';
