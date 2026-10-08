// ============================================================
// API Route: GET /api/sheets/health
// Returns entries from HEALTH_LOG sheet
// ============================================================
import { NextResponse } from 'next/server';
import { getHealthLog, getLatestHealthByComponent } from '@/lib/sheets/health-log';

export const revalidate = 60; // 1 minute

export async function GET() {
  try {
    const [log, latest] = await Promise.all([
      getHealthLog(),
      getLatestHealthByComponent(),
    ]);

    return NextResponse.json({
      data: {
        recent: log.slice(0, 50),
        components: latest,
      },
      total: log.length,
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] /api/sheets/health error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health log' },
      { status: 500 }
    );
  }
}
