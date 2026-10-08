import React from 'react';
import { getAggregatedMetrics } from '@/lib/sheets/metrics';

export const revalidate = 60;

export default async function AnalyticsPage() {
  const summaries = await getAggregatedMetrics();

  const totalViews = summaries.reduce((s, m) => s + m.total_views, 0);
  const totalLikes = summaries.reduce((s, m) => s + m.total_likes, 0);
  const totalReplies = summaries.reduce((s, m) => s + m.total_replies, 0);
  const totalInteractions = summaries.reduce((s, m) => s + m.total_interactions, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics & Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Performa konten berdasarkan snapshot data dari Apps Script (Sheet: METRICS).
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400">Total Views</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalViews}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400">Total Likes</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalLikes}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400">Total Replies</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalReplies}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs text-slate-400">Total Interaksi</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {totalInteractions}
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
          Performa Konten Individual
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Tema</th>
                <th className="py-3 px-4 font-semibold text-right">Views</th>
                <th className="py-3 px-4 font-semibold text-right">Likes</th>
                <th className="py-3 px-4 font-semibold text-right">Replies</th>
                <th className="py-3 px-4 font-semibold text-right">Interaksi</th>
                <th className="py-3 px-4 font-semibold text-right">Waktu Cek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    Belum ada data metrik tersimpan di sheet METRICS.
                  </td>
                </tr>
              ) : (
                summaries.map((m) => (
                  <tr key={m.content_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                      {m.content_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {m.ttema}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{m.total_views}</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{m.total_likes}</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{m.total_replies}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {m.total_interactions}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      {m.checked_at ? m.checked_at.replace('Date(', '').replace(')', '') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
