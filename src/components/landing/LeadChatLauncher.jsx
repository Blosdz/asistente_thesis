import { useEffect, useState } from 'react';
import { CircleQuestionMark } from 'lucide-react';

function LauncherButton({ onClick, onPointerEnter, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onFocus={onPointerEnter}
      disabled={disabled}
      className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(239,246,255,0.78)_100%)] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_42px_rgba(148,163,184,0.28)] backdrop-blur-2xl transition duration-300 hover:scale-105 hover:border-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_22px_48px_rgba(148,163,184,0.34)] disabled:cursor-wait disabled:opacity-80"
      aria-label="Abrir asistente"
    >
      <CircleQuestionMark className="h-6 w-6" />
    </button>
  );
}

export default function LeadChatLauncher() {
  const [Widget, setWidget] = useState(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [shouldOpen, setShouldOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!shouldLoad || Widget || isLoading) {
      return undefined;
    }

    setIsLoading(true);

    import('./LeadChatWidget')
      .then((module) => {
        if (!cancelled) {
          setWidget(() => module.default);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [Widget, isLoading, shouldLoad]);

  const preloadWidget = () => {
    if (!Widget && !isLoading) {
      setShouldLoad(true);
    }
  };

  if (Widget) {
    return <Widget initiallyOpen={shouldOpen} />;
  }

  return (
    <LauncherButton
      onClick={() => {
        setShouldLoad(true);
        setShouldOpen(true);
      }}
      onPointerEnter={preloadWidget}
      disabled={isLoading}
    />
  );
}
