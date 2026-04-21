import { cn } from '../../lib/cn';

export const MEDIA_OVERLAY_CLASS =
  'absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.16)_42%,rgba(15,23,42,0.6)_100%)]';

export const CARD_BASE_CLASS =
  'rounded-[32px] border border-slate-200/70 bg-slate-50/90 text-slate-700 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.24)]';

export const CARD_GLASS_LIGHT_CLASS = cn(
  CARD_BASE_CLASS,
  'relative overflow-hidden bg-white/70 backdrop-blur-xl'
);

export const CARD_MEDIA_CLASS =
  'relative overflow-hidden rounded-[32px] border border-white/20 bg-slate-950/88 text-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.42)]';

export const CARD_FEATURED_CLASS = cn(
  CARD_GLASS_LIGHT_CLASS,
  'border-sky-200/80 bg-white/82 shadow-[0_28px_72px_-34px_rgba(37,99,235,0.22)]'
);

export const CARD_INSET_CLASS =
  'rounded-[22px] border border-slate-200/65 bg-white/72';

export const CARD_INSET_MUTED_CLASS =
  'rounded-[22px] border border-slate-200/60 bg-slate-50/92';

export const PILL_CLASS =
  'rounded-[20px] border border-slate-200/70 bg-white/78 px-4 py-2 backdrop-blur-xl';

export function MediaOverlay({ className }: { className?: string }) {
  return <div className={cn(MEDIA_OVERLAY_CLASS, className)} />;
}
