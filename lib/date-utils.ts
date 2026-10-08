// ============================================================
// Date/time helpers — Google Sheets timestamps → display in WIB
// ============================================================
//
// Google Sheets stores date/time values in the spreadsheet's timezone.
// The gviz fallback represents datetime cells as:
//   Date(2026,9,8,8,30,0)
// That is a WALL-CLOCK value from the spreadsheet — it is NOT UTC.
// Parse it explicitly in the spreadsheet timezone before formatting.
// ============================================================

const DEFAULT_SHEET_TIMEZONE = 'Asia/Jakarta';
const DISPLAY_TIMEZONE = 'Asia/Jakarta';

function getSheetTimezone(): string {
  return process.env.GOOGLE_SHEETS_TIMEZONE || DEFAULT_SHEET_TIMEZONE;
}

function timezoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return asUtc - date.getTime();
}

/**
 * Interpret a wall-clock date/time as belonging to a named timezone.
 * This avoids depending on the Next.js server's own timezone.
 */
function fromSheetWallClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): Date | null {
  const timeZone = getSheetTimezone();
  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute, second);

  // First pass gets the timezone offset near the target date.
  const firstGuess = new Date(wallClockUtc);
  const firstOffset = timezoneOffsetMs(firstGuess, timeZone);
  let timestamp = wallClockUtc - firstOffset;

  // Recalculate at the resulting instant (important for DST zones).
  const secondOffset = timezoneOffsetMs(new Date(timestamp), timeZone);
  timestamp = wallClockUtc - secondOffset;

  const result = new Date(timestamp);
  return Number.isNaN(result.getTime()) ? null : result;
}

function parseSheetDate(value: string | null | undefined): Date | null {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  // Google Visualization datetime:
  // Date(2026,9,8,13,30,0) — month is zero-based.
  const gviz = raw.match(
    /^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,(\d{1,2}),(\d{1,2}),(\d{1,2}))?\)$/
  );

  if (gviz) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = gviz;
    return fromSheetWallClock(
      Number(year),
      Number(month) + 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  // ISO values carrying an explicit timezone/offset are already absolute.
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Values returned as formatted strings by the Sheets API, e.g.
  // "2026-10-07 16:30:00". Treat them as spreadsheet-local wall time.
  const match = raw.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (match) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
    return fromSheetWallClock(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  // Last resort for other valid date strings.
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateTimeWIB(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = parseSheetDate(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: DISPLAY_TIMEZONE,
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
  return parseSheetDate(value)?.getTime() ?? 0;
}
