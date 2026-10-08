'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/queue', label: 'Content Queue', icon: '📝' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/health', label: 'System Health', icon: '🩺' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col shrink-0 min-h-screen">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-2xl">🧵</span>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white leading-tight">Threads Monitor</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Keluarga Publisher</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
        <p className="font-semibold text-slate-600 dark:text-slate-400">Live Data Source</p>
        <p className="truncate mt-0.5">Google Sheets v4 API</p>
      </div>
    </aside>
  );
}
