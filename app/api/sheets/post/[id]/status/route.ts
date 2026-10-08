import { NextResponse } from 'next/server';
import { updatePostStatus } from '@/lib/sheets/live-content';
import { PostStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body as { status: PostStatus };

    const validStatuses: PostStatus[] = ['draft', 'approved', 'processing', 'published'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid. Pilihan: draft, approved, processing, published' },
        { status: 400 }
      );
    }

    const result = await updatePostStatus(id, status);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status ${id} berhasil diubah ke ${status}`,
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan server saat update status' },
      { status: 500 }
    );
  }
}
