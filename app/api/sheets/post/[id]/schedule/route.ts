import { NextResponse } from 'next/server';
import { updatePostSchedule } from '@/lib/sheets/live-content';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { scheduledAt } = body as { scheduledAt?: unknown };

    if (scheduledAt === null || scheduledAt === '') {
      const result = await updatePostSchedule(params.id, null);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ success: true, message: \`Jadwal \${params.id} dihapus.\` });
    }

    if (typeof scheduledAt !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(scheduledAt)) {
      return NextResponse.json({ error: 'Format jadwal tidak valid. Gunakan tanggal dan jam yang valid.' }, { status: 400 });
    }

    const result = await updatePostSchedule(params.id, scheduledAt);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ success: true, message: \`Jadwal \${params.id} berhasil diubah.\` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan server saat update jadwal' }, { status: 500 });
  }
}
