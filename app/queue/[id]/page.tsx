import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/sheets/live-content';
import { getPartsByContentId } from '@/lib/sheets/parts';
import { getMetricsByContentId } from '@/lib/sheets/metrics';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const revalidate = 60;

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [post, parts, metrics] = await Promise.all([
    getPostById(params.id),
    getPartsByContentId(params.id),
    getMetricsByContentId(params.id),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/queue" className="hover:underline">
          ← Kembali ke Queue
        </Link>
        <span>/</span>
        <span className="font-mono">{post.id}</span>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-500">{post.id}</span>
              <StatusBadge status={post.tstatus} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              {post.ttema}
            </h1>
          </div>
          {post.tthreads_post_id && (
            <a
              href={`https://threads.net/t/${post.tthreads_post_id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:opacity-90 transition w-fit"
            >
              Lihat di Threads ↗
            </a>
          )}
        </div>

        {post.terror && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-mono text-rose-700 dark:text-rose-300">
            <strong>Error:</strong> {post.terror}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Jadwal Publish</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {post.tscheduled_at ? post.tscheduled_at.replace('Date(', '').replace(')', '') : 'Belum dijadwalkan'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Format Publish</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {post.tformat_publish || 'reply_chain'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Jumlah Parts</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {parts.length} reply parts
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Metrik Views</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {metrics.reduce((s, m) => s + m.views, 0)} views
            </span>
          </div>
        </div>
      </div>

      {/* Editor Note (Gemini Sparks) */}
      {post.tcatatan_editor && (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
            <span>✨</span> Catatan Editor & Referensi (Gemini Sparks)
          </h2>
          <div className="text-xs text-amber-950 dark:text-amber-200 whitespace-pre-line leading-relaxed">
            {post.tcatatan_editor}
          </div>
        </div>
      )}

      {/* PARTS Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Thread Parts Breakdown ({parts.length} Paragraf)
        </h2>

        {parts.map((part) => (
          <div
            key={part.tpart_no}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                  {part.tpart_no}
                </span>
                <span className="text-xs text-slate-400">
                  {part.tjumlah_karakter} karakter
                </span>
              </div>
              <StatusBadge status={part.tstatus} />
            </div>

            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {part.tteks}
            </p>

            {part.terror && (
              <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded text-xs font-mono text-rose-600 dark:text-rose-400">
                Part Error: {part.terror}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
