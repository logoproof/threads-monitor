import { formatDateTimeWIB } from '@/lib/date-utils';
import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/sheets/live-content';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusSelector } from '@/components/ui/StatusSelector';

export const revalidate = 60;

export default async function QueuePage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const allPosts = await getAllPosts();

  const selectedStatus = searchParams?.status?.toLowerCase();
  const searchQuery = searchParams?.q?.toLowerCase();

  const filteredPosts = allPosts.filter((post) => {
    if (selectedStatus && post.tstatus.toLowerCase() !== selectedStatus) {
      return false;
    }
    if (searchQuery) {
      const matchTema = post.ttema.toLowerCase().includes(searchQuery);
      const matchId = post.id.toLowerCase().includes(searchQuery);
      if (!matchTema && !matchId) return false;
    }
    return true;
  });

  const statuses = ['all', 'published', 'approved', 'processing', 'draft'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Content Queue & Pipeline
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Daftar seluruh draft, konten terjadwal, dan riwayat publikasi (Sheet: ANTREAN).
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {statuses.map((st) => {
          const isActive = (!selectedStatus && st === 'all') || selectedStatus === st;
          const href = st === 'all' ? '/queue' : `/queue?status=${st}`;
          return (
            <Link
              key={st}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </Link>
          );
        })}
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Tema / Judul</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Jadwal Publish</th>
                <th className="py-3 px-4 font-semibold">Post ID Threads</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    Tidak ada konten yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {post.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {post.ttema}
                      </div>
                      {post.terror && (
                        <div className="text-xs text-rose-500 font-mono mt-0.5 truncate max-w-sm">
                          {post.terror}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusSelector id={post.id} currentStatus={post.tstatus} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {post.tscheduled_at ? formatDateTimeWIB(post.tscheduled_at) : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {post.tthreads_post_id ? (
                        <a
                          href={`https://threads.net/t/${post.tthreads_post_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {post.tthreads_post_id} ↗
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/queue/${post.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        Detail
                      </Link>
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
