import { useEffect, useState } from 'react';

function LauncherButton({ onClick, onPointerEnter, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onFocus={onPointerEnter}
      disabled={disabled}
      className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#334155_55%,#0ea5e9_100%)] text-lg font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] transition duration-300 hover:scale-105 disabled:cursor-wait"
      aria-label="Abrir asistente"
    >
      ?
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
