import * as XLSX from 'xlsx';
import { query } from './db';

// Helper to normalize strings exactly as Spring Boot does:
// strip BOM, trim, lowercase, keep only alphanumeric
export function normalizeHeader(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/\uFEFF/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function cleanValue(s: any): string {
  if (s === null || s === undefined) return '';
  return String(s).replace(/\uFEFF/g, '').trim();
}

interface ParsedResult {
  records: Array<Record<string, any>>;
  errors: string[];
}

export async function parseExcelOrCsv(
  fileBuffer: Buffer,
  fileName: string,
  entityName: string,
  sheetNameConfig?: string
): Promise<ParsedResult> {
  const records: Array<Record<string, any>> = [];
  const errors: string[] = [];

  try {
    // 1. Fetch active mappings from DB
    const mappingResult = await query(
      'SELECT header_name, entity_field_name FROM pmo.header_field_mapping WHERE entity_name = $1 AND active = true',
      [entityName]
    );

    const normalizedFieldMap: Record<string, string> = {};
    mappingResult.rows.forEach(row => {
      normalizedFieldMap[normalizeHeader(row.header_name)] = row.entity_field_name;
    });

    // 2. Read workbook using xlsx
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    
    // Choose sheet: use configured sheet name, or fallback to first sheet
    let sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (sheetNameConfig && workbook.SheetNames.includes(sheetNameConfig)) {
      sheet = workbook.Sheets[sheetNameConfig];
    }

    // Convert sheet to 2D array of raw values
    const sheetData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (sheetData.length === 0) {
      throw new Error('The uploaded spreadsheet is empty.');
    }

    // Process header row (row 0)
    const headerRow = sheetData[0];
    const indexToField: Record<number, string> = {};

    for (let i = 0; i < headerRow.length; i++) {
      const rawHeader = cleanValue(headerRow[i]);
      const normalized = normalizeHeader(rawHeader);
      if (normalizedFieldMap[normalized]) {
        indexToField[i] = normalizedFieldMap[normalized];
      }
    }

    // Process data rows
    for (let rowIndex = 1; rowIndex < sheetData.length; rowIndex++) {
      const row = sheetData[rowIndex];
      if (row.length === 0 || row.every(val => cleanValue(val) === '')) {
        continue; // Skip empty rows
      }

      try {
        const record: Record<string, any> = {};
        
        // Loop through cells in this row and map to entity fields
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const fieldName = indexToField[colIndex];
          if (fieldName) {
            record[fieldName] = cleanValue(row[colIndex]);
          }
        }

        // Add the index-0 value as primary key fallback/reference if it's there
        if (row[0]) {
          record._primaryId = cleanValue(row[0]);
        }

        records.push(record);
      } catch (rowErr: any) {
        errors.push(`Row ${rowIndex}: ${rowErr.message || rowErr}`);
      }
    }

  } catch (err: any) {
    errors.push(`Spreadsheet parse error: ${err.message || err}`);
  }

  return { records, errors };
}
