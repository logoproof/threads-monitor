// ============================================================
// Fetch helper: Sheet "Live Content"
// Columns: id | ttema | tnaskah | tcatatan_editor | tstatus |
//          tscheduled_at | tformat_publish | tthreads_post_id | terror
// ============================================================
import { getSheetRows, updateSheetCell } from '@/lib/google-auth';
import { ThreadsPost, PostStatus, DashboardStats } from '@/lib/types';
import { timestampWIB } from '@/lib/date-utils';

function parseRow(row: any[]): ThreadsPost {
  let scheduledAt: string | null = null;
  if (row[5]) {
    // If gviz returned Date(y,m,d,h,m,s) string or ISO
    scheduledAt = String(row[5]);
  }

  return {
    id: String(row[0] ?? ''),
    ttema: String(row[1] ?? ''),
    tnaskah: String(row[2] ?? ''),
    tcatatan_editor: String(row[3] ?? ''),
    tstatus: (String(row[4] ?? 'draft')) as PostStatus,
    tscheduled_at: scheduledAt,
    tformat_publish: String(row[6] ?? 'reply_chain'),
    tthreads_post_id: row[7] ? String(row[7]) : null,
    terror: row[8] ? String(row[8]) : null,
  };
}

export async function getAllPosts(): Promise<ThreadsPost[]> {
  const rows = await getSheetRows('Live Content', 'A2:I');
  return rows
    .filter(row => row && row[0])
    .map(parseRow);
}

export async function getPostById(id: string): Promise<ThreadsPost | null> {
  const posts = await getAllPosts();
  return posts.find(p => p.id === id) ?? null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const posts = await getAllPosts();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

  const byStatus: Record<PostStatus, number> = {
    draft: 0,
    approved: 0,
    processing: 0,
    published: 0,
  };

  for (const p of posts) {
    if (p.tstatus in byStatus) {
      byStatus[p.tstatus]++;
    }
  }

  const publishedToday = posts.filter(p => {
    if (p.tstatus !== 'published' || !p.tscheduled_at) return false;
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(timestampWIB(p.tscheduled_at))) === today;
    } catch {
      return false;
    }
  }).length;

  const errorsCount = posts.filter(
    p => p.terror && p.terror.trim() !== ''
  ).length;

  const lastPublished = posts
    .filter(p => p.tstatus === 'published' && p.tscheduled_at)
    .sort((a, b) => {
      try {
        return timestampWIB(b.tscheduled_at) - timestampWIB(a.tscheduled_at);
      } catch {
        return 0;
      }
    })[0];

  return {
    total: posts.length,
    byStatus,
    publishedToday,
    errorsCount,
    partsWithErrors: 0,
    lastPublishedAt: lastPublished?.tscheduled_at ?? null,
    topPost: null,
  };
}

export async function updatePostStatus(id: string, newStatus: PostStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const rows = await getSheetRows('Live Content', 'A2:A');
    const rowIndex = rows.findIndex(r => r && String(r[0]).trim() === id.trim());
    if (rowIndex === -1) {
      return { success: false, error: `Konten ${id} tidak ditemukan di sheet.` };
    }

    const actualRow = rowIndex + 2;
    const targetCell = `'Live Content'!E${actualRow}`;
    await updateSheetCell(targetCell, newStatus);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah status.' };
  }
}
