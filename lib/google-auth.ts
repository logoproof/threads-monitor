// ============================================================
// Google Sheets API Wrapper
// Mendukung Google Service Account (Production/Private)
// dan auto-fallback ke gviz API (Development/Public sheet)
// ============================================================
import { google } from 'googleapis';
import { fetchSheetGviz } from '@/lib/gviz-client';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

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
      });
      return res.data.values || [];
    } catch (err) {
      console.warn(`[Sheets API] Service account fetch failed, falling back to gviz:`, err);
    }
  }

  // Fallback to gviz public fetch
  return fetchSheetGviz(spreadsheetId, sheetName);
}
