function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-[28px] bg-slate-200/80 ${className}`} />;
}

function LandingLoadingSkeleton() {
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_52%,#edf4fb_100%)] px-4 py-4 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/75 bg-white/75 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-11 w-11 rounded-2xl" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-24 rounded-full" />
                <SkeletonBlock className="h-3 w-32 rounded-full" />
              </div>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <SkeletonBlock className="h-10 w-20 rounded-full" />
              <SkeletonBlock className="h-10 w-24 rounded-full" />
              <SkeletonBlock className="h-10 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-11 w-28 rounded-full" />
              <SkeletonBlock className="h-11 w-32 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 pb-12 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pt-12">
          <div className="space-y-5">
            <SkeletonBlock className="h-4 w-36 rounded-full" />
            <SkeletonBlock className="h-16 w-full max-w-xl rounded-[30px]" />
            <SkeletonBlock className="h-5 w-full max-w-2xl rounded-full" />
            <SkeletonBlock className="h-5 w-4/5 max-w-xl rounded-full" />
            <div className="flex flex-wrap gap-3 pt-2">
              <SkeletonBlock className="h-12 w-40 rounded-full" />
              <SkeletonBlock className="h-12 w-36 rounded-full" />
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              <SkeletonBlock className="h-24 w-full" />
              <SkeletonBlock className="h-24 w-full" />
              <SkeletonBlock className="h-24 w-full" />
            </div>
          </div>

          <SkeletonBlock className="h-[420px] w-full rounded-[36px]" />
        </div>

        <div className="space-y-6">
          <SkeletonBlock className="h-[280px] w-full rounded-[36px]" />
          <div className="grid gap-6 lg:grid-cols-3">
            <SkeletonBlock className="h-[220px] w-full" />
            <SkeletonBlock className="h-[220px] w-full" />
            <SkeletonBlock className="h-[220px] w-full" />
          </div>
          <SkeletonBlock className="h-[240px] w-full rounded-[36px]" />
        </div>
      </div>
    </div>
  );
}

function AppShellLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-2xl" />
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="h-3 w-36 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-24 rounded-full" />
            <SkeletonBlock className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm lg:block">
            <div className="space-y-3">
              <SkeletonBlock className="h-10 w-full rounded-2xl" />
              <SkeletonBlock className="h-10 w-5/6 rounded-2xl" />
              <SkeletonBlock className="h-10 w-full rounded-2xl" />
              <SkeletonBlock className="h-10 w-4/5 rounded-2xl" />
              <SkeletonBlock className="h-10 w-full rounded-2xl" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-28 rounded-full" />
                <SkeletonBlock className="h-11 w-72 max-w-full rounded-[24px]" />
                <SkeletonBlock className="h-4 w-full rounded-full" />
                <SkeletonBlock className="h-4 w-3/4 rounded-full" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SkeletonBlock className="h-32 w-full" />
              <SkeletonBlock className="h-32 w-full" />
              <SkeletonBlock className="h-32 w-full" />
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <SkeletonBlock className="h-4 w-32 rounded-full" />
                <SkeletonBlock className="h-16 w-full rounded-[22px]" />
                <SkeletonBlock className="h-16 w-full rounded-[22px]" />
                <SkeletonBlock className="h-16 w-11/12 rounded-[22px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-4">
          <SkeletonBlock className="mx-auto h-12 w-12 rounded-2xl" />
          <SkeletonBlock className="mx-auto h-6 w-40 rounded-full" />
          <SkeletonBlock className="mx-auto h-4 w-56 rounded-full" />
        </div>

        <div className="mt-8 space-y-4">
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
        </div>

        <SkeletonBlock className="mt-6 h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'app' }) {
  if (variant === 'landing') {
    return <LandingLoadingSkeleton />;
  }

  if (variant === 'auth') {
    return <AuthLoadingSkeleton />;
  }

  return <AppShellLoadingSkeleton />;
}
