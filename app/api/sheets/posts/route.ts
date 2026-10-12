// ============================================================
// API Route: GET /api/sheets/posts
// Returns all posts from Live Content sheet, with optional ?status= filter
// Revalidates every 5 minutes (ISR)
// ============================================================
import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/sheets/live-content';
import { PostStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as PostStatus | null;
    const search = searchParams.get('q')?.toLowerCase();

    let { posts } = await getAllPosts();

    if (statusFilter) {
      posts = posts.filter(p => p.tstatus === statusFilter);
    }

    if (search) {
      posts = posts.filter(p =>
        p.ttema.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      data: posts,
      total: posts.length,
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] /api/sheets/posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts from Google Sheets' },
      { status: 500 }
    );
  }
}
