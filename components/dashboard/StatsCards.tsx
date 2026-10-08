import React from 'react';
import { DashboardStats } from '@/lib/types';

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: 'Total Konten Master',
      value: stats.total,
      sub: `${stats.byStatus.published} telah tayang`,
      icon: '📚',
      border: 'border-slate-200 dark:border-slate-800',
    },
    {
      title: 'Siap & Terjadwal',
      value: stats.byStatus.approved,
      sub: 'Menunggu trigger Apps Script',
      icon: '⏳',
      border: 'border-amber-200/60 dark:border-amber-800/60',
    },
    {
      title: 'Dalam Antrean / Proses',
      value: stats.byStatus.processing,
      sub: `${stats.byStatus.draft} masih berstatus draft`,
      icon: '⚙️',
      border: 'border-blue-200/60 dark:border-blue-800/60',
    },
    {
      title: 'Konten dengan Kendala',
      value: stats.errorsCount,
      sub: `${stats.partsWithErrors} part memerlukan review`,
      icon: '🚨',
      border: stats.errorsCount > 0 ? 'border-rose-300 dark:border-rose-800' : 'border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`bg-white dark:bg-slate-900 border ${c.border} rounded-xl p-5 shadow-sm flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{c.title}</span>
            <span className="text-lg">{c.icon}</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
