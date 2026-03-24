import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Alert = forwardRef(({ tone = 'info', className, ...props }, ref) => {
  const toneCls = tone === 'danger' ? 'alert-pro alert-danger' : 'alert-pro alert-info';
  return <div ref={ref} role="alert" className={cn(toneCls, className)} {...props} />;
});

Alert.displayName = 'Alert';

export const AlertDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('leading-relaxed', className)} {...props} />
));

AlertDescription.displayName = 'AlertDescription';
