'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/queue', label: 'Queue', icon: '📝' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/health', label: 'Health', icon: '🩺' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: compact icon rail */}
      <aside className="hidden md:flex w-16 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex-col items-center shrink-0 min-h-screen">
        <Link
          href="/dashboard"
          title="Threads Monitor"
          className="h-16 w-full flex items-center justify-center border-b border-slate-200 dark:border-slate-800 text-xl"
        >
          🧵
        </Link>

        <nav className="flex-1 w-full p-2 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`group relative flex h-11 w-11 mx-auto items-center justify-center rounded-xl text-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="pb-4 text-[10px] text-slate-400" title="Google Sheets v4 API">
          ●
        </div>
      </aside>

      {/* Mobile: compact bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="text-base leading-5">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
