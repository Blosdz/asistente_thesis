import { cn } from '../../lib/cn';

export default function GlassCard({
  as: Component = 'div',
  className,
  children,
  hover = false,
  ...props
}) {
  return (
    <Component
      className={cn(
        'group relative overflow-hidden rounded-[32px] border border-white/80 bg-white/62 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.08)]',
        hover &&
          'transition-[transform,box-shadow,background-color,border-color] duration-500 hover:-translate-y-1.5 hover:border-white/80 hover:bg-white/68 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]',
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.2)_42%,transparent_72%)] opacity-90" />
      <div className="pointer-events-none absolute inset-px rounded-[30px] border border-white/55" />
      <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12),transparent_72%)] blur-xl transition-opacity duration-500 group-hover:opacity-90" />
      <div className="relative">{children}</div>
    </Component>
  );
}
