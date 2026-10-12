'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DashboardStats, ThreadsPost } from '@/lib/types';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ErrorBanner } from '@/components/dashboard/ErrorBanner';
import { RecentPosts } from '@/components/dashboard/RecentPosts';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';

interface DashboardSearchProps {
  initialStats: DashboardStats;
  initialPosts: ThreadsPost[];
  initialPartsErrors: number;
}

export function DashboardSearch({ initialStats, initialPosts, initialPartsErrors }: DashboardSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<ThreadsPost[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(initialPosts.slice(0, 6));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = initialPosts.filter(post =>
        post.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.ttema.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);
      setFilteredPosts(filtered);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, initialPosts]);

  const fullStats = {
    ...initialStats,
    partsWithErrors: initialPartsErrors,
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID atau tema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <ErrorBanner
        errorsCount={fullStats.errorsCount}
        partsWithErrors={fullStats.partsWithErrors}
      />

      <StatsCards stats={fullStats} />

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <SkeletonCard />
        </div>
      ) : (
        <RecentPosts posts={filteredPosts} emptyMessage="Tidak ada postingan yang sesuai" />
      )}
    </div>
  );
}