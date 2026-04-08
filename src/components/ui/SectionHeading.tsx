import { cn } from '../../lib/cn';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl space-y-4',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 backdrop-blur-xl',
            align === 'center' && 'mx-auto',
          )}
        >
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
          {eyebrow}
        </div>
      ) : null}
      <h2 className="font-display text-3xl leading-tight text-slate-950 sm:text-4xl lg:text-[3.2rem]">
        {title}
      </h2>
      <p className="text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
    </div>
  );
}
