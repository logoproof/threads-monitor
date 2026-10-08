'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Pencil, X } from 'lucide-react';

interface ScheduleEditorProps {
  id: string;
  scheduledAt: string | null;
  compact?: boolean;
}

function toInputValue(value: string | null): string {
  if (!value) return '';
  const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!match) return '';
  const [, y, m, d, h = '0', min = '0'] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${min}`;
}

export function ScheduleEditor({ id, scheduledAt, compact = false }: ScheduleEditorProps) {
  const router = useRouter();
  const initialValue = useMemo(() => toInputValue(scheduledAt), [scheduledAt]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openEditor = () => { setValue(initialValue); setMessage(null); setOpen(true); };

  const save = async () => {
    if (!value) { setMessage('Pilih tanggal dan jam terlebih dahulu.'); return; }
    setSaving(true); setMessage(null);
    try {
      const res = await fetch(`/api/sheets/post/${id}/schedule`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan jadwal.');
      setOpen(false); router.refresh();
    } catch (err: any) { setMessage(err.message || 'Gagal menyimpan jadwal.'); }
    finally { setSaving(false); }
  };

  const clearSchedule = async () => {
    if (!window.confirm('Hapus jadwal publish untuk konten ini?')) return;
    setSaving(true); setMessage(null);
    try {
      const res = await fetch(`/api/sheets/post/${id}/schedule`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus jadwal.');
      setOpen(false); router.refresh();
    } catch (err: any) { setMessage(err.message || 'Gagal menghapus jadwal.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="relative">
      <button type="button" onClick={openEditor}
        className={compact ? 'inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline' : 'inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600'}>
        <CalendarClock className="w-3.5 h-3.5" />{scheduledAt ? 'Edit jadwal' : 'Atur jadwal'}<Pencil className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[1px] sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-80 sm:bg-transparent sm:backdrop-blur-none">
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:static sm:rounded-xl sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Edit Jadwal Publish</h3><p className="text-[10px] text-slate-500 mt-0.5">Waktu Indonesia Barat (WIB)</p></div>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} disabled={saving}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30" />
          {message && <p className="mt-2 text-xs text-rose-600">{message}</p>}
          <div className="flex items-center justify-between gap-2 mt-4">
            <button type="button" onClick={clearSchedule} disabled={saving || !scheduledAt} className="text-xs text-rose-600 hover:underline disabled:opacity-40">Hapus jadwal</button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
              <button type="button" onClick={save} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan'}</button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
