// ============================================================
// Date/time helpers — display consistently in Indonesia (WIB)
// ============================================================

const INDONESIA_TIMEZONE = 'Asia/Jakarta';

function parseSheetDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  // Google Visualization can return: Date(2026,9,8,13,30,0)
  const gviz = raw.match(
    /^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,(\d{1,2}),(\d{1,2}),(\d{1,2}))?\)$/
  );

  if (gviz) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = gviz;
    // Google Visualization months are zero-based.
    // Treat sheet values as local spreadsheet time; the monitor displays them as WIB.
    return new Date(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  // ISO values with timezone/offset are safe to parse directly.
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Common date strings without timezone should be interpreted as WIB,
  // rather than depending on the server's timezone.
  const local = raw.replace(' ', 'T');
  const parsed = new Date(local + (local.includes('T') ? '+07:00' : ''));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateTimeWIB(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = parseSheetDate(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: INDONESIA_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
}

export function formatDateWIB(value: string | null | undefined): string {
  return formatDateTimeWIB(value, {
    hour: undefined,
    minute: undefined,
  });
}

export function formatTimeWIB(value: string | null | undefined): string {
  return formatDateTimeWIB(value, {
    day: undefined,
    month: undefined,
    year: undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timestampWIB(value: string | null | undefined): number {
  const date = parseSheetDate(value);
  return date?.getTime() ?? 0;
}
