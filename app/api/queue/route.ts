import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/sheets/live-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc';
    const searchQuery = searchParams.get('q') || '';
    const statusFilter = searchParams.get('status') || undefined;

    const { posts, total } = await getAllPosts({
      limit,
      offset,
      sortBy,
      sortDir,
      searchQuery,
      statusFilter,
    });

    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error('[API] /api/queue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue data' },
      { status: 500 }
    );
  }
}