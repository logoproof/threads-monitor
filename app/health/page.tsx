import { formatDateTimeWIB } from '@/lib/date-utils';
import React from 'react';
import { getHealthLog, getLatestHealthByComponent } from '@/lib/sheets/health-log';

export const revalidate = 30;

export default async function HealthPage() {
  const [logs, components] = await Promise.all([
    getHealthLog(),
    getLatestHealthByComponent(),
  ]);

  const componentNames = Object.keys(components);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Health Log
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Status kesehatan komponen otomatisasi (Apps Script, Scheduler, Gemini, Threads API).
        </p>
      </div>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {componentNames.length === 0 ? (
          <div className="col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm shadow-sm">
            🩺 Belum ada data status komponen di sheet HEALTH_LOG.
            <div className="text-xs text-slate-400 mt-1">
              Apps Script dapat menuliskan log kesehatan sistem ke sheet ini secara berkala.
            </div>
          </div>
        ) : (
          componentNames.map((name) => {
            const comp = components[name];
            const isOk = comp.status === 'ok';
            return (
              <div
                key={name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {name}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      isOk
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}
                  >
                    {comp.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-mono truncate">
                  {comp.message || 'Running normally'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Health Log History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
          Riwayat Log Aktivitas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Waktu Cek</th>
                <th className="py-3 px-4 font-semibold">Komponen</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Pesan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    Sheet HEALTH_LOG masih kosong (siap digunakan saat Apps Script mulai menuliskan log).
                  </td>
                </tr>
              ) : (
                logs.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {formatDateTimeWIB(entry.checked_at)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {entry.component}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {entry.status}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {entry.message}
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
