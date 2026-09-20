# Shared layouts

## StudentLayout

Path: `src/layouts/StudentLayout.jsx`

The student shell renders a fixed 80px top bar, AppThesis/Student wordmark, horizontally scrollable animated pill navigation, notification button, account menu, and a main content region with `pt-24` and responsive horizontal padding. The complete source is 204 lines and is passed directly to design generation when a page-level target needs its shell.

Rendered hierarchy:

```jsx
<div className="app-shell student-shell font-sans text-gray-900">
  <UnreadNotificationsPopup />
  <div className="relative z-10 flex flex-col min-h-screen">
    <header className="app-topbar fixed top-0 z-50 w-full rounded-none">
      <div className="flex min-h-20 w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="hidden min-w-0 flex-col sm:flex">
          <span className="text-sm font-black tracking-[-0.01em] text-slate-950 heading-ubuntu">AppThesis</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">Student</span>
        </div>
        <AnimatedTopNav items={navItems} />
        <div className="flex items-center gap-3 relative">
          <NotificationsBell />
          <button className="app-icon-button flex h-10 w-10 items-center justify-center rounded-full"><UserIcon /></button>
        </div>
      </div>
    </header>
    <main className="w-full px-4 sm:px-8 flex-1 pt-24"><Outlet /></main>
  </div>
</div>
```

## AnimatedTopNav

Path: `src/components/navigation/AnimatedTopNav.jsx`

Shared horizontal navigation. It measures the active `NavLink` and animates a pill beneath it. It accepts `ariaLabel`, `className`, `items`, `linkClassName`, and `navClassName`. The full 151-line source is passed directly for page-shell designs.

## Other application layouts

- `src/layouts/AdvisorLayout.jsx`: advisor role top navigation and account shell.
- `src/layouts/AdminLayout.jsx`: administrator top navigation and account shell.
- `src/pages/auth/AuthLayout.jsx`: centered authentication shell.
