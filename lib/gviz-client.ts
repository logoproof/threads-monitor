// ============================================================
// Fallback sheet client using Google Visualization (Public gviz)
// Digunakan saat Service Account belum dikonfigurasi di local/dev
// ============================================================

export async function fetchSheetGviz<T = any>(
  spreadsheetId: string,
  sheetName: string
): Promise<T[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet ${sheetName}: HTTP ${res.status}`);
  }

  const text = await res.text();
  // gviz returns: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error(`Invalid gviz response format for sheet ${sheetName}`);
  }

  const parsed = JSON.parse(jsonMatch[1]);
  const cols = parsed.table?.cols || [];
  const rows = parsed.table?.rows || [];

  return rows.map((r: any) => {
    return (r.c || []).map((cell: any) => (cell ? (cell.v !== undefined ? cell.v : null) : null));
  });
}
