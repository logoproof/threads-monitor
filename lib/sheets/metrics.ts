// ============================================================
// Fetch helper: Sheet "METRICS"
// Columns: checked_at | content_id | part_no | threads_post_id |
//          views | likes | replies | reposts | quotes |
//          total_interactions | error
// ============================================================
import { getSheetRows } from '@/lib/google-auth';
import { ThreadsMetric, ContentMetricsSummary } from '@/lib/types';
import { getAllPosts } from '@/lib/sheets/live-content';
import { timestampWIB } from '@/lib/date-utils';

function parseRow(row: any[]): ThreadsMetric {
  return {
    checked_at: String(row[0] ?? ''),
    content_id: String(row[1] ?? ''),
    part_no: parseInt(String(row[2] ?? '0'), 10),
    threads_post_id: String(row[3] ?? ''),
    views: parseFloat(String(row[4] ?? '0')) || 0,
    likes: parseFloat(String(row[5] ?? '0')) || 0,
    replies: parseFloat(String(row[6] ?? '0')) || 0,
    reposts: parseFloat(String(row[7] ?? '0')) || 0,
    quotes: parseFloat(String(row[8] ?? '0')) || 0,
    total_interactions: parseFloat(String(row[9] ?? '0')) || 0,
    error: row[10] ? String(row[10]) : null,
  };
}

export async function getAllMetrics(): Promise<ThreadsMetric[]> {
  const rows = await getSheetRows('METRICS', 'A2:K');
  return rows
    .filter(row => row && row[0] && row[1])
    .map(parseRow);
}

export async function getMetricsByContentId(contentId: string): Promise<ThreadsMetric[]> {
  const metrics = await getAllMetrics();
  return metrics
    .filter(m => m.content_id === contentId)
    .sort((a, b) => a.part_no - b.part_no);
}

export async function getAggregatedMetrics(): Promise<ContentMetricsSummary[]> {
  const [metrics, posts] = await Promise.all([getAllMetrics(), getAllPosts()]);
  const postMap = new Map(posts.map(p => [p.id, p.ttema]));

  const grouped = new Map<string, ThreadsMetric[]>();
  for (const m of metrics) {
    if (!grouped.has(m.content_id)) grouped.set(m.content_id, []);
    grouped.get(m.content_id)!.push(m);
  }

  const summaries: ContentMetricsSummary[] = [];

  for (const [content_id, rows] of grouped.entries()) {
    const latestCheckedAt = rows.reduce((latest, row) =>
      timestampWIB(row.checked_at) > timestampWIB(latest) ? row.checked_at : latest,
      ''
    );

    const latestTimestamp = timestampWIB(latestCheckedAt);
    const latestRows = rows.filter(r => timestampWIB(r.checked_at) === latestTimestamp);

    summaries.push({
      content_id,
      ttema: postMap.get(content_id) ?? content_id,
      total_views: latestRows.reduce((s, r) => s + r.views, 0),
      total_likes: latestRows.reduce((s, r) => s + r.likes, 0),
      total_replies: latestRows.reduce((s, r) => s + r.replies, 0),
      total_reposts: latestRows.reduce((s, r) => s + r.reposts, 0),
      total_quotes: latestRows.reduce((s, r) => s + r.quotes, 0),
      total_interactions: latestRows.reduce((s, r) => s + r.total_interactions, 0),
      checked_at: latestCheckedAt,
    });
  }

  return summaries.sort((a, b) => b.total_interactions - a.total_interactions);
}
