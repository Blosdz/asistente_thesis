import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const blocksGlassEffect = (className) =>
  /^bg-(?:white|slate-\d+)(?:\/\S+)?$/.test(className);

const cleanCardClassName = (className = '') =>
  className
    .split(/\s+/)
    .filter((item) => item && !blocksGlassEffect(item))
    .join(' ');

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(' border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 shadow-[0_14px_40px_rgba(15,23,42,0.05) p-6', cleanCardClassName(className))} {...props} />
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
