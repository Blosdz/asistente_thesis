import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const emptyPill = {
  height: 0,
  left: 0,
  ready: false,
  top: 0,
  width: 0,
};

const isCurrentPath = (pathname, itemPath) =>
  pathname === itemPath || pathname.startsWith(`${itemPath}/`);

export default function AnimatedTopNav({
  ariaLabel = 'Navegación principal',
  className,
  items,
  linkClassName,
  navClassName,
}) {
  const location = useLocation();
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const frameRef = useRef(null);
  const hasMeasuredRef = useRef(false);
  const [pill, setPill] = useState(emptyPill);

  const activeIndex = useMemo(() => {
    const exactIndex = items.findIndex((item) => isCurrentPath(location.pathname, item.path));
    return exactIndex >= 0 ? exactIndex : 0;
  }, [items, location.pathname]);

  const measurePill = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const nav = navRef.current;
      const activeItem = itemRefs.current[activeIndex];

      if (!nav || !activeItem) return;

      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const nextPill = {
        height: itemRect.height,
        left: itemRect.left - navRect.left + nav.scrollLeft,
        ready: hasMeasuredRef.current,
        top: itemRect.top - navRect.top + nav.scrollTop,
        width: itemRect.width,
      };

      setPill((current) => {
        const unchanged =
          Math.abs(current.left - nextPill.left) < 0.5 &&
          Math.abs(current.top - nextPill.top) < 0.5 &&
          Math.abs(current.width - nextPill.width) < 0.5 &&
          Math.abs(current.height - nextPill.height) < 0.5 &&
          current.ready === nextPill.ready;

        return unchanged ? current : nextPill;
      });

      if (!hasMeasuredRef.current) {
        hasMeasuredRef.current = true;
        requestAnimationFrame(() => {
          setPill((current) => ({ ...current, ready: true }));
        });
      }
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    measurePill();
  }, [measurePill, items.length, location.pathname]);

  useEffect(() => {
    const nav = navRef.current;
    const activeItem = itemRefs.current[activeIndex];

    if (!nav || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measurePill);
      return () => window.removeEventListener('resize', measurePill);
    }

    const observer = new ResizeObserver(measurePill);
    observer.observe(nav);
    if (activeItem) observer.observe(activeItem);

    window.addEventListener('resize', measurePill);
    nav.addEventListener('scroll', measurePill, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measurePill);
      nav.removeEventListener('scroll', measurePill);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [activeIndex, measurePill]);

  return (
    <div className={cn('app-nav-cluster animated-nav-shell', className)}>
      <nav
        ref={navRef}
        aria-label={ariaLabel}
        className={cn('animated-top-nav relative flex gap-1 overflow-x-auto md:overflow-visible', navClassName)}
      >
        <span
          aria-hidden="true"
          className="animated-nav-pill"
          style={{
            height: `${pill.height}px`,
            left: `${pill.left}px`,
            opacity: pill.ready ? 1 : 0,
            top: `${pill.top}px`,
            transform: pill.ready ? 'scaleX(1)' : 'scaleX(0)',
            width: `${pill.width}px`,
          }}
        />

        {items.map((item, index) => (
          <NavLink
            key={item.path}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'top-nav-link app-nav-item animated-nav-item',
                linkClassName,
                isActive ? 'app-nav-item-active' : '',
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
