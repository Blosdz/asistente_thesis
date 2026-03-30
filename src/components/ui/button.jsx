import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const variantClass = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger: 'btn btn-danger',
  ghost: 'btn btn-secondary bg-white/0 border-transparent hover:bg-white/60',
  link: 'px-0 py-0 rounded-none text-sky-700 hover:text-sky-800 font-semibold',
  outline: 'btn btn-secondary bg-white/70 hover:bg-white border border-slate-200 text-slate-900',
};

const sizeClass = {
  md: '',
  sm: 'btn-mini',
};

export const Button = forwardRef(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    const base =
      variant === 'link'
        ? variantClass.link
        : cn(variantClass[variant], sizeClass[size]);
    return <button ref={ref} className={cn(base, className)} {...props} />;
  },
);

Button.displayName = 'Button';
