// ============================================================
// API Route: GET /api/sheets/stats
// Returns aggregated dashboard statistics
// ============================================================
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/sheets/live-content';
import { countPartsWithErrors } from '@/lib/sheets/parts';
import { getAggregatedMetrics } from '@/lib/sheets/metrics';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const [stats, partsErrors, metrics] = await Promise.all([
      getDashboardStats(),
      countPartsWithErrors(),
      getAggregatedMetrics(),
    ]);

    const enrichedStats = {
      ...stats,
      partsWithErrors: partsErrors,
      topPost: metrics[0] ?? null,
      cached_at: new Date().toISOString(),
    };

    return NextResponse.json({ data: enrichedStats });
  } catch (error) {
    console.error('[API] /api/sheets/stats error:', error);
    return NextResponse.json(
      { error: 'Failed to compute dashboard stats' },
      { status: 500 }
    );
  }
}
