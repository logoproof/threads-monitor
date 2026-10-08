// ============================================================
// Fetch helper: Sheet "HEALTH_LOG"
// Columns: checked_at | component | status | message
// ============================================================
import { getSheetRows } from '@/lib/google-auth';
import { HealthLogEntry, HealthStatus } from '@/lib/types';

function parseRow(row: any[]): HealthLogEntry {
  return {
    checked_at: String(row[0] ?? ''),
    component: String(row[1] ?? ''),
    status: (String(row[2] ?? 'unknown')) as HealthStatus,
    message: String(row[3] ?? ''),
  };
}

export async function getHealthLog(): Promise<HealthLogEntry[]> {
  try {
    const rows = await getSheetRows('HEALTH_LOG', 'A2:D');
    return rows
      .filter(row => row && row[0] && row[0] !== 'checked_at')
      .map(parseRow)
      .sort((a, b) => b.checked_at.localeCompare(a.checked_at));
  } catch (err) {
    return [];
  }
}

export async function getLatestHealthByComponent(): Promise<
  Record<string, HealthLogEntry>
> {
  const entries = await getHealthLog();
  const latest: Record<string, HealthLogEntry> = {};

  for (const entry of entries) {
    if (!latest[entry.component]) {
      latest[entry.component] = entry;
    }
  }

  return latest;
}
