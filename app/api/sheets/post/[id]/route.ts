// ============================================================
// API Route: GET /api/sheets/post/[id]
// Returns a single post with its associated PARTS
// ============================================================
import { NextResponse } from 'next/server';
import { getPostById } from '@/lib/sheets/live-content';
import { getPartsByContentId } from '@/lib/sheets/parts';
import { getMetricsByContentId } from '@/lib/sheets/metrics';

export const revalidate = 300;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const [post, parts, metrics] = await Promise.all([
      getPostById(id),
      getPartsByContentId(id),
      getMetricsByContentId(id),
    ]);

    if (!post) {
      return NextResponse.json(
        { error: `Post with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...post,
        parts,
        metrics,
      },
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[API] /api/sheets/post/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch post details' },
      { status: 500 }
    );
  }
}
