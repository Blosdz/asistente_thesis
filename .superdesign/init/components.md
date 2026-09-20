# Shared UI components

Framework: React 19 with Tailwind CSS 4 utility classes and custom CSS in `src/index.css`.

## Button

Path: `src/components/ui/button.jsx`

Reusable button with primary, secondary, danger, ghost, link and outline variants.

```jsx
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

const sizeClass = { md: '', sm: 'btn-mini' };

export const Button = forwardRef(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    const base = variant === 'link' ? variantClass.link : cn(variantClass[variant], sizeClass[size]);
    return <button ref={ref} className={cn(base, className)} {...props} />;
  },
);

Button.displayName = 'Button';
```

## Input

Path: `src/components/ui/input.jsx`

```jsx
import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('input-pro', className)} {...props} />
));

Input.displayName = 'Input';
```

## Card

Path: `src/components/ui/card.jsx`

```jsx
import { forwardRef } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');
const blocksGlassEffect = (className) => /^bg-(?:white|slate-\d+)(?:\/\S+)?$/.test(className);
const cleanCardClassName = (className = '') => className.split(/\s+/).filter((item) => item && !blocksGlassEffect(item)).join(' ');

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
```

## Modal

Path: `src/components/ui/modal.jsx`

The full implementation is a React portal with Escape and backdrop dismissal, body scroll locking, initial focus on the close button, responsive width variants, fixed header, scrollable content, and optional footer actions. Its rendered structure uses a slate overlay, white 28px-radius panel, compact header, and neutral/blue actions. This source file is passed directly to design generation.

## AccessManagementModal

Path: `src/components/student/workspace/AccessManagementModal.jsx`

Feature modal with two panes: assigned advisors on the left and searchable available advisors on the right. It uses Lucide `Loader2`, `Search`, `ShieldCheck`, and `UserRound`, and the shared `Modal` portal. The source file is passed directly in full to design generation.
