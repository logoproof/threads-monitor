import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
    published: {
      label: 'Published',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    approved: {
      label: 'Approved',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
    processing: {
      label: 'Processing',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    draft: {
      label: 'Draft',
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
    },
    formatted: {
      label: 'Formatted',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    needs_review: {
      label: 'Needs Review',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
    },
  };

  const style = config[normalized] || {
    label: status,
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          normalized === 'published'
            ? 'bg-emerald-500'
            : normalized === 'processing'
            ? 'bg-blue-500 animate-pulse'
            : normalized === 'approved'
            ? 'bg-amber-500'
            : normalized === 'needs_review'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {style.label}
    </span>
  );
}
