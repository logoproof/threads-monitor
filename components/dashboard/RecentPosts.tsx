import { formatDateTimeWIB } from '@/lib/date-utils';
import React from 'react';
import Link from 'next/link';
import { ThreadsPost } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function RecentPosts({ posts }: { posts: ThreadsPost[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Postingan Terbaru</h2>
        <Link href="/queue" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Lihat semua queue →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <th className="pb-2.5 font-medium">ID</th>
              <th className="pb-2.5 font-medium">Tema / Topik</th>
              <th className="pb-2.5 font-medium">Status</th>
              <th className="pb-2.5 font-medium">Jadwal Publish</th>
              <th className="pb-2.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {posts.slice(0, 6).map((post) => (
              <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {post.id}
                </td>
                <td className="py-3">
                  <div className="font-medium text-slate-900 dark:text-white">{post.ttema}</div>
                  {post.terror && (
                    <div className="text-xs text-rose-500 truncate max-w-xs mt-0.5 font-mono">
                      {post.terror}
                    </div>
                  )}
                </td>
                <td className="py-3">
                  <StatusBadge status={post.tstatus} />
                </td>
                <td className="py-3 text-xs text-slate-500">
                  {post.tscheduled_at ? formatDateTimeWIB(post.tscheduled_at) : '—'}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/queue/${post.id}`}
                    className="inline-flex items-center text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
