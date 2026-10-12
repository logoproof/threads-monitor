'use client';

import { formatDateTimeWIB } from '@/lib/date-utils';
import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllPosts } from '@/lib/sheets/live-content';
import { ThreadsPost } from '@/lib/types';
import { StatusSelector } from '@/components/ui/StatusSelector';
import { ScheduleEditor } from '@/components/ui/ScheduleEditor';
import { SkeletonTable, SkeletonGrid } from '@/components/ui/SkeletonLoader';
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

const STATUSES = ['all', 'published', 'approved', 'processing', 'draft'];
const SORT_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'ttema', label: 'Tema' },
  { key: 'tstatus', label: 'Status' },
  { key: 'tscheduled_at', label: 'Jadwal' },
];
const PAGE_SIZE = 10;

export default function QueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? Math.max(1, Number(pageParam)) : 1;
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(searchParams.get('status'));
  const [sortKey, setSortKey] = useState<string>(searchParams.get('sort') || 'id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(searchParams.get('sortdir') === 'asc' ? 'asc' : 'desc');

  const debouncedSearch = useMemo(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      params.set('sort', sortKey);
      params.set('sortdir', sortDir);
      params.set('page', '1');
      router.push(`/queue?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, statusFilter, sortKey, sortDir, router]);

  React.useEffect(() => {
    debouncedSearch();
  }, [searchQuery, statusFilter, sortKey, sortDir]);

  const offset = (currentPage - 1) * PAGE_SIZE;
  const { data, error, isLoading } = useAwaitData(searchQuery, statusFilter, sortKey, sortDir, PAGE_SIZE, offset);

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

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID atau tema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(statusFilter === st ? null : st);
                router.push(`/queue?status=${st ? st : ''}&q=${searchQuery}&sort=${sortKey}&sortdir=${sortDir}&page=1`, { scroll: false });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                statusFilter === st || (statusFilter === null && st === 'all')
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        {isLoading ? (
          <SkeletonTable rows={PAGE_SIZE} cols={6} />
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center text-rose-900 dark:text-rose-200">
            <p className="text-sm font-medium">Gagal memuat data</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
          </div>
        ) : data.posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Tidak ada konten yang ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter.</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      {SORT_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => {
                            if (sortKey === col.key) {
                              setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                              router.push(`/queue?sort=${col.key}&sortdir=${sortDir === 'asc' ? 'desc' : 'asc'}&page=${currentPage}`, { scroll: false });
                            } else {
                              setSortKey(col.key);
                              setSortDir('desc');
                              router.push(`/queue?sort=${col.key}&sortdir=desc&page=${currentPage}`, { scroll: false });
                            }
                          }}
                          className="py-3.5 px-4 font-semibold cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {sortKey === col.key ? (
                              sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronUp className="w-3 h-3 opacity-25" />
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{post.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">{post.ttema}</div>
                          {post.terror && <div className="text-xs text-rose-500 font-mono mt-0.5 truncate max-w-sm">{post.terror}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusSelector id={post.id} currentStatus={post.tstatus} />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>{post.tscheduled_at ? formatDateTimeWIB(post.tscheduled_at) : 'Belum dijadwalkan'}</span>
                            <ScheduleEditor id={post.id} scheduledAt={post.tscheduled_at} compact />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                          {post.tthreads_post_id ? (
                            <a href={`https://threads.net/t/${post.tthreads_post_id}`} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{post.tthreads_post_id} ↗</a>
                          ) : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/queue/${post.id}`} className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 mt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan {Math.min(offset + 1, data.total)} - {Math.min(offset + PAGE_SIZE, data.total)} dari {data.total} konten
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/queue?page=${currentPage - 1}&q=${searchQuery}&status=${statusFilter || ''}&sort=${sortKey}&sortdir=${sortDir}`, { scroll: false })}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2">
                  Halaman {currentPage}
                </span>
                <button
                  onClick={() => router.push(`/queue?page=${currentPage + 1}&q=${searchQuery}&status=${statusFilter || ''}&sort=${sortKey}&sortdir=${sortDir}`, { scroll: false })}
                  disabled={offset + PAGE_SIZE >= data.total}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <SkeletonGrid count={PAGE_SIZE} />
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center text-rose-900 dark:text-rose-200">
            <p className="text-sm font-medium">Gagal memuat data</p>
          </div>
        ) : data.posts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-sm text-slate-500">Tidak ada konten yang sesuai dengan filter.</div>
        ) : (
          <>
            {data.posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-500">{post.id}</span>
                      <span className="text-[10px] text-slate-400">ANTREAN</span>
                    </div>
                    <h2 className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{post.ttema}</h2>
                  </div>
                  <Link href={`/queue/${post.id}`} className="shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">Detail</Link>
                </div>

                {post.terror && <div className="mt-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-[10px] text-rose-600 dark:text-rose-300 break-words">{post.terror}</div>}

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">Status</span>
                    <StatusSelector id={post.id} currentStatus={post.tstatus} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">Jadwal</span>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{post.tscheduled_at ? formatDateTimeWIB(post.tscheduled_at) : 'Belum dijadwalkan'}</div>
                    <ScheduleEditor id={post.id} scheduledAt={post.tscheduled_at} compact />
                  </div>
                </div>

                {post.tthreads_post_id && (
                  <a href={`https://threads.net/t/${post.tthreads_post_id}`} target="_blank" rel="noreferrer" className="mt-3 block truncate rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[10px] font-mono text-blue-600 dark:text-blue-400">
                    Threads: {post.tthreads_post_id} ↗
                  </a>
                )}
              </article>
            ))}
            <div className="flex items-center justify-between gap-4 pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan {Math.min(offset + 1, data.total)} - {Math.min(offset + PAGE_SIZE, data.total)} dari {data.total} konten
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/queue?page=${currentPage - 1}&q=${searchQuery}&status=${statusFilter || ''}&sort=${sortKey}&sortdir=${sortDir}`, { scroll: false })}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2">
                  Halaman {currentPage}
                </span>
                <button
                  onClick={() => router.push(`/queue?page=${currentPage + 1}&q=${searchQuery}&status=${statusFilter || ''}&sort=${sortKey}&sortdir=${sortDir}`, { scroll: false })}
                  disabled={offset + PAGE_SIZE >= data.total}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function useAwaitData(
  searchQuery: string,
  statusFilter: string | null,
  sortKey: string,
  sortDir: 'asc' | 'desc',
  limit: number,
  offset: number
) {
  const [data, setData] = useState<{ posts: ThreadsPost[]; total: number }>({ posts: [], total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getAllPosts({
      limit,
      offset,
      sortBy: sortKey,
      sortDir,
      searchQuery,
      statusFilter: statusFilter || undefined,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Terjadi kesalahan');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, statusFilter, sortKey, sortDir, limit, offset]);

  return { data, error, isLoading };
}
