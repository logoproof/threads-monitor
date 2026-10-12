import React from 'react';
import { getAllPosts, getDashboardStats } from '@/lib/sheets/live-content';
import { countPartsWithErrors } from '@/lib/sheets/parts';
import { DashboardSearch } from '@/components/dashboard/DashboardSearch';

export const revalidate = 60;

export default async function DashboardPage() {
  const [stats, partsErrors, posts] = await Promise.all([
    getDashboardStats(),
    countPartsWithErrors(),
    getAllPosts({ limit: 1000 }),
  ]);

  return (
    <DashboardSearch
      initialStats={stats}
      initialPosts={posts.posts}
      initialPartsErrors={partsErrors}
    />
  );
}
