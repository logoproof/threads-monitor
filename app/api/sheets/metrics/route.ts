// ============================================================
// API Route: GET /api/sheets/metrics
// Returns aggregated metrics for all published content
// ============================================================
import { NextResponse } from 'next/server';
import { getAggregatedMetrics, getAllMetrics } from '@/lib/sheets/metrics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('raw') === 'true';

    if (raw) {
      const allRaw = await getAllMetrics();
      return NextResponse.json({ data: allRaw });
    }

    const summaries = await getAggregatedMetrics();
    return NextResponse.json({
      data: summaries,
      total: summaries.length,
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] /api/sheets/metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
