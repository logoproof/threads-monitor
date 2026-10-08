import React from 'react';

interface ErrorBannerProps {
  errorsCount: number;
  partsWithErrors?: number;
}

export function ErrorBanner({ errorsCount, partsWithErrors }: ErrorBannerProps) {
  if (errorsCount === 0 && (!partsWithErrors || partsWithErrors === 0)) {
    return null;
  }

  return (
    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-6 text-rose-900 dark:text-rose-200">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Perhatian Diperlukan pada Pipeline Publish
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
            Terdeteksi {errorsCount} postingan master dan {partsWithErrors || 0} bagian thread dengan status error/gagal publish.
            Periksa detail konten untuk melihat pesan error spesifik dari Apps Script / Threads API.
          </p>
        </div>
      </div>
    </div>
  );
}
