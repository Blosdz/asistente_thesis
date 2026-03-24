import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('select-pro', className)} {...props}>
    {children}
  </select>
));

Select.displayName = 'Select';

export const SelectItem = ({ children, ...props }) => (
  <option {...props}>{children}</option>
);
