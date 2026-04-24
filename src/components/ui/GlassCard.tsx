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
} as const;

const shineClasses = {
  light:
    'bg-[linear-gradient(145deg,rgba(255,255,255,0.42),rgba(255,255,255,0.14)_38%,transparent_72%)] opacity-80',
  media:
    'bg-[linear-gradient(145deg,rgba(255,255,255,0.34),rgba(255,255,255,0.10)_42%,transparent_72%)] opacity-75',
  featured:
    'bg-[linear-gradient(145deg,rgba(255,255,255,0.46),rgba(255,255,255,0.14)_42%,transparent_74%)] opacity-80',
} as const;

const innerBorderClasses = {
  light: 'border-white/55',
  media: 'border-white/20',
  featured: 'border-white/45',
} as const;

const innerBorderHoverClasses = {
  light: 'group-hover:border-white/75',
  media: 'group-hover:border-white/40',
  featured: 'group-hover:border-white/70',
} as const;

const accentClasses = {
  light:
    'bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(255,255,255,0.10)_42%,transparent_72%)] opacity-80 blur-2xl',
  media:
    'bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.08)_42%,transparent_72%)] opacity-75 blur-2xl',
  featured:
    'bg-[radial-gradient(circle,rgba(255,255,255,0.32),rgba(255,255,255,0.10)_42%,transparent_72%)] opacity-85 blur-2xl',
} as const;

type GlassCardProps = React.ElementType extends infer T
  ? {
      as?: T;
      className?: string;
      children: React.ReactNode;
      hover?: boolean;
      variant?: keyof typeof variantClasses;
    } & React.ComponentPropsWithoutRef<any>
  : never;

export default function GlassCard({
  as: Component = 'div',
  className,
  children,
  hover = false,
  variant = 'media',
  ...props
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        'group relative overflow-hidden rounded-[32px]',
        variantClasses[variant] ?? variantClasses.media,
        hover &&
          'transition-[transform,box-shadow,background-color,border-color,color] duration-500 ease-out hover:-translate-y-1.5',
        hover &&
          variant === 'media' &&
          'hover:border-white/35 hover:text-white hover:shadow-[0_28px_70px_rgba(255,255,255,0.08)]',
        hover &&
          variant === 'light' &&
          'hover:border-white/70 hover:bg-white/85 hover:text-slate-900 hover:shadow-[0_24px_62px_-34px_rgba(255,255,255,0.24)]',
        hover &&
          variant === 'featured' &&
          'hover:border-white/75 hover:bg-white/90 hover:text-slate-950 hover:shadow-[0_34px_80px_-38px_rgba(255,255,255,0.20)]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          shineClasses[variant] ?? shineClasses.media,
          hover && 'transition-opacity duration-500 group-hover:opacity-100'
        )}
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-px rounded-[31px] border',
          innerBorderClasses[variant] ?? innerBorderClasses.media,
          hover && 'transition-colors duration-500',
          hover &&
            (innerBorderHoverClasses[variant] ??
              innerBorderHoverClasses.media)
        )}
      />

      <div
        className={cn(
          'pointer-events-none absolute -right-14 top-0 h-40 w-40 rounded-full',
          accentClasses[variant] ?? accentClasses.media,
          hover && 'transition-opacity duration-500 group-hover:opacity-100'
        )}
      />

      <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-white/[0.03]" />

      <div className="relative z-10">{children}</div>
    </Component>
  );
}
