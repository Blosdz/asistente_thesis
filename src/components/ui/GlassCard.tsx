import { cn } from '../../lib/cn';
import {
  CARD_FEATURED_CLASS,
  CARD_GLASS_LIGHT_CLASS,
  CARD_MEDIA_CLASS,
} from './cardPrimitives';

const variantClasses = {
  light: CARD_GLASS_LIGHT_CLASS,
  media: CARD_MEDIA_CLASS,
  featured: CARD_FEATURED_CLASS,
};

const shineClasses = {
  light:
    'bg-[linear-gradient(145deg,rgba(255,255,255,0.28),rgba(255,255,255,0.08)_38%,transparent_72%)] opacity-60',
  media:
    'bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05)_42%,transparent_72%)] opacity-70',
  featured:
    'bg-[linear-gradient(145deg,rgba(255,255,255,0.36),rgba(255,255,255,0.08)_42%,transparent_74%)] opacity-70',
};

const innerBorderClasses = {
  light: 'border-slate-200/60',
  media: 'border-white/12',
  featured: 'border-sky-100/80',
};

const innerBorderHoverClasses = {
  light: 'group-hover:border-slate-300/70',
  media: 'group-hover:border-white/35',
  featured: 'group-hover:border-sky-200/90',
};

const accentClasses = {
  light:
    'bg-[radial-gradient(circle,rgba(148,163,184,0.14),transparent_72%)] opacity-60 blur-xl',
  media:
    'bg-[radial-gradient(circle,rgba(56,189,248,0.12),transparent_72%)] opacity-80 blur-xl',
  featured:
    'bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_72%)] opacity-85 blur-xl',
};

export default function GlassCard({
  as: Component = 'div',
  className,
  children,
  hover = false,
  variant = 'media',
  ...props
}) {
  return (
    <Component
      className={cn(
        'group relative overflow-hidden rounded-[32px]',
        variantClasses[variant] ?? variantClasses.media,
        hover &&
          'transition-[transform,box-shadow,background-color,border-color,color] duration-500 hover:-translate-y-1.5 hover:border-white/40 hover:text-white hover:shadow-[0_28px_70px_rgba(2,6,23,0.36)]',
        hover &&
          variant === 'light' &&
          'hover:border-slate-300/80 hover:bg-white/82 hover:text-slate-800 hover:shadow-[0_24px_62px_-34px_rgba(15,23,42,0.28)]',
        hover &&
          variant === 'featured' &&
          'hover:border-sky-300/90 hover:bg-white/88 hover:text-slate-900 hover:shadow-[0_34px_80px_-38px_rgba(37,99,235,0.24)]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          shineClasses[variant] ?? shineClasses.media,
          hover && 'transition-opacity duration-500 group-hover:opacity-35'
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-px rounded-[31px] border',
          innerBorderClasses[variant] ?? innerBorderClasses.media,
          hover &&
            'transition-colors duration-500',
          hover &&
            (innerBorderHoverClasses[variant] ??
              innerBorderHoverClasses.media)
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full',
          accentClasses[variant] ?? accentClasses.media,
          hover && 'transition-opacity duration-500 group-hover:opacity-90'
        )}
      />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
