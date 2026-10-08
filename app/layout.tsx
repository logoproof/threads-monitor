import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import '@/app/globals.css';

export const metadata = {
  title: 'Threads Family Monitor',
  description: 'Monitoring dashboard untuk otomatisasi Threads Publisher keluarga',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 pb-20 md:p-6 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
