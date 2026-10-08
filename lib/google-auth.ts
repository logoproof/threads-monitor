// ============================================================
// Google Sheets API Wrapper
// Mendukung Google Service Account (Production/Private)
// dan auto-fallback ke gviz API (Development/Public sheet)
// ============================================================
import { google } from 'googleapis';
import { fetchSheetGviz } from '@/lib/gviz-client';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export function getSpreadsheetId(): string {
  return (
    process.env.GOOGLE_SHEETS_ID ||
    '1loINEp0XL7oQIj6tno31eRPCabMHoYYyO5xu4TPPDWw'
  );
}

export function hasServiceAccount(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}

export async function getSheetRows(sheetName: string, rangeA1: string): Promise<any[][]> {
  const spreadsheetId = getSpreadsheetId();

  if (hasServiceAccount()) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!${rangeA1}`,
        // Keep Google Sheets' own formatted datetime representation.
        // The date-utils layer interprets it in the spreadsheet timezone.
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });
      return res.data.values || [];
    } catch (err) {
      console.warn(`[Sheets API] Service account fetch failed, falling back to gviz:`, err);
    }
  }

  // Fallback to gviz public fetch
  return fetchSheetGviz(spreadsheetId, sheetName);
}

export async function updateSheetCell(
  sheetName: string,
  rowNumber: number,
  columnNumber: number,
  value: string
): Promise<boolean> {
  const spreadsheetId = getSpreadsheetId();

  if (!hasServiceAccount()) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_JSON belum dikonfigurasi. Penulisan ke Google Sheets memerlukan Service Account.'
    );
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Resolve the tab's numeric sheetId first, then write using GridRange.
  // This avoids A1 parser issues with sheet names containing spaces.
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  });

  const normalizeSheetTitle = (title: string) =>
    title.trim().replace(/\\s+/g, ' ').toLowerCase();

  const requestedTitle = normalizeSheetTitle(sheetName);
  const sheet = (metadata.data.sheets || []).find(
    (item) =>
      item.properties?.title &&
      normalizeSheetTitle(item.properties.title) === requestedTitle
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    const availableSheets = (metadata.data.sheets || [])
      .map((item) => item.properties?.title)
      .filter(Boolean)
      .join(', ');

    throw new Error(
      `Sheet "${sheetName}" tidak ditemukan pada spreadsheet ${spreadsheetId}. Tab yang terlihat oleh Service Account: ${availableSheets || '(tidak ada)'}`
    );
  }

  const sheetId = sheet.properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: columnNumber - 1,
              endColumnIndex: columnNumber,
            },
            rows: [
              {
                values: [
                  {
                    userEnteredValue: {
                      stringValue: value,
                    },
                  },
                ],
              },
            ],
            fields: 'userEnteredValue',
          },
        },
      ],
    },
  });

  return true;
}
