'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StatusSelectorProps {
  id: string;
  currentStatus: string;
}

export function StatusSelector({ id, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus.toLowerCase());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    const confirmChange = window.confirm(
      `Apakah kamu yakin ingin mengubah status ${id} menjadi "${newStatus.toUpperCase()}"? Perubahan ini akan langsung dicatat di Google Sheets.`
    );
    if (!confirmChange) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/sheets/post/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah status');
      }

      setStatus(newStatus);
      setMessage({ type: 'success', text: `Berhasil diubah ke ${newStatus}!` });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border transition cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${
            status === 'published'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : status === 'approved'
              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              : status === 'processing'
              ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="processing">Processing</option>
          <option value="published">Published</option>
        </select>
        {loading && (
          <span className="text-[10px] text-slate-400 animate-spin">⏳</span>
        )}
      </div>

      {message && (
        <span
          className={`text-[10px] font-medium leading-none mt-0.5 ${
            message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
