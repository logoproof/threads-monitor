import React from 'react';
import { getAllPosts, getDashboardStats } from '@/lib/sheets/live-content';
import { countPartsWithErrors } from '@/lib/sheets/parts';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ErrorBanner } from '@/components/dashboard/ErrorBanner';
import { RecentPosts } from '@/components/dashboard/RecentPosts';

export const revalidate = 60; // Auto-refresh data tiap 1 menit

export default async function DashboardPage() {
  const [stats, partsErrors, posts] = await Promise.all([
    getDashboardStats(),
    countPartsWithErrors(),
    getAllPosts(),
  ]);

  const fullStats = {
    ...stats,
    partsWithErrors: partsErrors,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Monitoring
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Status real-time konten Threads Publisher keluarga dari Google Sheets.
          </p>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg w-fit">
          🔄 Diperbarui tiap 1 menit
        </div>
      </div>

      <ErrorBanner
        errorsCount={fullStats.errorsCount}
        partsWithErrors={fullStats.partsWithErrors}
      />

      <StatsCards stats={fullStats} />

      <RecentPosts posts={posts} />
    </div>
  );
}
