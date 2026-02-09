// ==========================================
// Excel Exporter - Generate Styled Reports
// ==========================================

import * as XLSX from 'xlsx';
import {
  ComparisonResult,
  ComparisonSummary,
  ComparisonStatus,
  ComparisonType,
} from '@/types';

interface ExportOptions {
  sourceName: string;
  targetName: string;
  results: ComparisonResult[];
  summary: ComparisonSummary;
}

// Color constants (RGB hex)
const COLORS = {
  headerBg: '1E40AF', // Blue
  headerText: 'FFFFFF', // White
  match: 'DCFCE7', // Light green
  mismatch: 'FEF9C3', // Light yellow
  missingInSource: 'FFEDD5', // Light orange
  missingInTarget: 'FEE2E2', // Light red
};

// Get status color (for future styling enhancements)
export function getStatusColor(status: ComparisonStatus): string {
  switch (status) {
    case ComparisonStatus.Match:
      return COLORS.match;
    case ComparisonStatus.Mismatch:
      return COLORS.mismatch;
    case ComparisonStatus.MissingInSource:
      return COLORS.missingInSource;
    case ComparisonStatus.MissingInTarget:
      return COLORS.missingInTarget;
    default:
      return '';
  }
}

// Create summary sheet
function createSummarySheet(summary: ComparisonSummary, sourceName: string, targetName: string): XLSX.WorkSheet {
  const data: (string | number)[][] = [
    ['Archer Metadata Comparison Report'],
    [''],
    ['Source Environment:', sourceName],
    ['Target Environment:', targetName],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Overall Summary'],
    ['Metric', 'Count', 'Percentage'],
    ['Total Items', summary.totalItems, '100%'],
    ['Matched', summary.matchedCount, `${((summary.matchedCount / summary.totalItems) * 100).toFixed(1)}%`],
    ['Mismatched', summary.mismatchedCount, `${((summary.mismatchedCount / summary.totalItems) * 100).toFixed(1)}%`],
    [`Missing in Source (${targetName})`, summary.missingInSourceCount, `${((summary.missingInSourceCount / summary.totalItems) * 100).toFixed(1)}%`],
    [`Missing in Target (${sourceName})`, summary.missingInTargetCount, `${((summary.missingInTargetCount / summary.totalItems) * 100).toFixed(1)}%`],
    [''],
    ['Breakdown by Type'],
    ['Type', 'Total', 'Matched', 'Mismatched', 'Missing in Source', 'Missing in Target'],
  ];

  // Add breakdown by type
  for (const type of Object.values(ComparisonType)) {
    const typeStats = summary.byType[type];
    if (typeStats.total > 0) {
      data.push([
        type,
        typeStats.total,
        typeStats.matched,
        typeStats.mismatched,
        typeStats.missingInSource,
        typeStats.missingInTarget,
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
  ];

  return ws;
}

// Create results sheet for a specific status
function createResultsSheet(
  results: ComparisonResult[],
  status: ComparisonStatus,
  sourceName: string,
  targetName: string
): XLSX.WorkSheet {
  const headers = status === ComparisonStatus.Mismatch
    ? ['Type', 'Parent', 'Item Name', 'Property', `${sourceName} Value`, `${targetName} Value`, 'Severity']
    : ['Type', 'Parent', 'Item Name', 'Severity'];

  const data: (string | undefined)[][] = [headers];

  for (const result of results) {
    if (status === ComparisonStatus.Mismatch) {
      data.push([
        result.comparisonType,
        result.parentName || '-',
        result.itemName,
        result.propertyName || '-',
        result.sourceValue || '-',
        result.targetValue || '-',
        result.severity,
      ]);
    } else {
      data.push([
        result.comparisonType,
        result.parentName || '-',
        result.itemName,
        result.severity,
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  if (status === ComparisonStatus.Mismatch) {
    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 30 },
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 12 },
    ];
  } else {
    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 40 },
      { wch: 12 },
    ];
  }

  // Enable auto-filter
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }) };

  return ws;
}

// Create type-specific sheet
function createTypeSheet(
  results: ComparisonResult[],
  _type: ComparisonType,
  sourceName: string,
  targetName: string
): XLSX.WorkSheet {
  const headers = ['Item Name', 'Parent', 'Status', 'Property', `${sourceName}`, `${targetName}`, 'Severity'];
  const data: (string | undefined)[][] = [headers];

  for (const result of results) {
    data.push([
      result.itemName,
      result.parentName || '-',
      result.status,
      result.propertyName || '-',
      result.sourceValue || (result.status === ComparisonStatus.MissingInSource ? '<Not Present>' : '<Present>'),
      result.targetValue || (result.status === ComparisonStatus.MissingInTarget ? '<Not Present>' : '<Present>'),
      result.severity,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 30 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 12 },
  ];

  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }) };

  return ws;
}

// Main export function
export function exportToExcel(options: ExportOptions): void {
  const { sourceName, targetName, results, summary } = options;
  
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summarySheet = createSummarySheet(summary, sourceName, targetName);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Filter results by status
  const matchedResults = results.filter(r => r.status === ComparisonStatus.Match);
  const mismatchedResults = results.filter(r => r.status === ComparisonStatus.Mismatch);
  const missingInSourceResults = results.filter(r => r.status === ComparisonStatus.MissingInSource);
  const missingInTargetResults = results.filter(r => r.status === ComparisonStatus.MissingInTarget);

  // Add status-based sheets
  if (missingInTargetResults.length > 0) {
    const sheet = createResultsSheet(missingInTargetResults, ComparisonStatus.MissingInTarget, sourceName, targetName);
    XLSX.utils.book_append_sheet(wb, sheet, `Not in ${targetName.slice(0, 20)}`);
  }

  if (missingInSourceResults.length > 0) {
    const sheet = createResultsSheet(missingInSourceResults, ComparisonStatus.MissingInSource, sourceName, targetName);
    XLSX.utils.book_append_sheet(wb, sheet, `Not in ${sourceName.slice(0, 20)}`);
  }

  if (mismatchedResults.length > 0) {
    const sheet = createResultsSheet(mismatchedResults, ComparisonStatus.Mismatch, sourceName, targetName);
    XLSX.utils.book_append_sheet(wb, sheet, 'Mismatches');
  }

  if (matchedResults.length > 0) {
    const sheet = createResultsSheet(matchedResults, ComparisonStatus.Match, sourceName, targetName);
    XLSX.utils.book_append_sheet(wb, sheet, 'Matched');
  }

  // Add type-specific sheets for types with data
  for (const compType of Object.values(ComparisonType)) {
    const typeResults = results.filter(r => r.comparisonType === compType);
    if (typeResults.length > 0) {
      const sheet = createTypeSheet(typeResults, compType, sourceName, targetName);
      XLSX.utils.book_append_sheet(wb, sheet, compType.slice(0, 31)); // Sheet names max 31 chars
    }
  }

  // Generate and download
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `Archer_Comparison_${sourceName}_vs_${targetName}_${timestamp}.xlsx`;
  
  XLSX.writeFile(wb, filename);
}
