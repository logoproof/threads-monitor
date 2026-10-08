// ============================================================
// Fetch helper: Sheet "PARTS"
// Columns: content_id | tpart_no | tteks | tjumlah_karakter |
//          tstatus | tthreads_post_id | terror
// ============================================================
import { getSheetRows } from '@/lib/google-auth';
import { ThreadsPart, PartStatus } from '@/lib/types';

function parseRow(row: any[]): ThreadsPart {
  return {
    content_id: String(row[0] ?? ''),
    tpart_no: parseInt(String(row[1] ?? '0'), 10),
    tteks: String(row[2] ?? ''),
    tjumlah_karakter: parseInt(String(row[3] ?? '0'), 10),
    tstatus: (String(row[4] ?? 'formatted')) as PartStatus,
    tthreads_post_id: row[5] ? String(row[5]) : null,
    terror: row[6] ? String(row[6]) : null,
  };
}

export async function getAllParts(): Promise<ThreadsPart[]> {
  const rows = await getSheetRows('PARTS', 'A2:G');
  return rows
    .filter(row => row && row[0])
    .map(parseRow);
}

export async function getPartsByContentId(contentId: string): Promise<ThreadsPart[]> {
  const parts = await getAllParts();
  return parts
    .filter(p => p.content_id === contentId)
    .sort((a, b) => a.tpart_no - b.tpart_no);
}

export async function countPartsWithErrors(): Promise<number> {
  const parts = await getAllParts();
  return parts.filter(p => p.terror && String(p.terror).trim() !== '').length;
}
