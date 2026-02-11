// ==========================================
// Excel Exporter Service
// Generates styled Excel reports from comparison results
// ==========================================

import {
  ComparisonResult,
  ComparisonSummary,
  ComparisonStatus,
  TabResults,
  CategorizedResults,
} from '../types';

/**
 * Generate CSV content from comparison results
 */
export function generateCSVReport(
  results: ComparisonResult[],
  summary: ComparisonSummary,
  sourceEnvName: string,
  targetEnvName: string
): string {
  const lines: string[] = [];

  // Summary section
  lines.push('ARCHER COMPARISON REPORT');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Source Environment: ${sourceEnvName}`);
  lines.push(`Target Environment: ${targetEnvName}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push(`Total Items: ${summary.totalItems}`);
  lines.push(`Matched: ${summary.matchedCount}`);
  lines.push(`Mismatched: ${summary.mismatchedCount}`);
  lines.push(`Missing in Source: ${summary.missingInSourceCount}`);
  lines.push(`Missing in Target: ${summary.missingInTargetCount}`);
  lines.push('');
  
  // Calculated field stats
  lines.push('CALCULATED FIELD STATISTICS');
  lines.push(`Matched: ${summary.calculatedFieldStats.matched}`);
  lines.push(`Mismatched: ${summary.calculatedFieldStats.mismatched}`);
  lines.push(`Formula Differences: ${summary.calculatedFieldStats.formulaDifferences}`);
  lines.push('');

  // Detail section headers
  lines.push('DETAILED RESULTS');
  lines.push('');
  lines.push([
    'Status',
    'Type',
    'GUID',
    'Name',
    'Parent',
    'Severity',
    'Differences',
  ].join(','));

  // Results rows
  for (const result of results) {
    const differences = result.propertyDifferences
      ?.map(d => `${d.propertyName}: "${d.sourceValue}" vs "${d.targetValue}"`)
      .join('; ') || '';

    lines.push([
      result.status,
      result.comparisonType,
      result.itemGuid,
      `"${result.itemName.replace(/"/g, '""')}"`,
      result.parentName ? `"${result.parentName.replace(/"/g, '""')}"` : '',
      result.severity,
      `"${differences.replace(/"/g, '""')}"`,
    ].join(','));
  }

  return lines.join('\n');
}

/**
 * Generate a formatted text report
 */
export function generateTextReport(
  tabResults: TabResults,
  summary: ComparisonSummary,
  sourceEnvName: string,
  targetEnvName: string
): string {
  const lines: string[] = [];
  const divider = '='.repeat(80);
  const subDivider = '-'.repeat(80);

  lines.push(divider);
  lines.push('ARCHER METADATA COMPARISON REPORT');
  lines.push(divider);
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Source: ${sourceEnvName}`);
  lines.push(`Target: ${targetEnvName}`);
  lines.push('');
  lines.push(subDivider);
  lines.push('SUMMARY');
  lines.push(subDivider);
  lines.push(`Total Items Compared: ${summary.totalItems}`);
  lines.push(`  ✓ Matched:            ${summary.matchedCount} (${((summary.matchedCount / summary.totalItems) * 100).toFixed(1)}%)`);
  lines.push(`  ✗ Mismatched:         ${summary.mismatchedCount} (${((summary.mismatchedCount / summary.totalItems) * 100).toFixed(1)}%)`);
  lines.push(`  ◀ Not in Source:      ${summary.missingInSourceCount}`);
  lines.push(`  ▶ Not in Target:      ${summary.missingInTargetCount}`);
  lines.push('');
  lines.push('Calculated Fields:');
  lines.push(`  Matched:              ${summary.calculatedFieldStats.matched}`);
  lines.push(`  Mismatched:           ${summary.calculatedFieldStats.mismatched}`);
  lines.push(`  Formula Differences:  ${summary.calculatedFieldStats.formulaDifferences}`);
  lines.push('');

  // Function to format a category
  const formatCategory = (title: string, items: ComparisonResult[]) => {
    if (items.length === 0) return;
    
    lines.push('');
    lines.push(`  ${title} (${items.length})`);
    for (const item of items) {
      lines.push(`    - ${item.itemName} [${item.itemGuid}]`);
      if (item.parentName) {
        lines.push(`      Parent: ${item.parentName}`);
      }
      if (item.propertyDifferences && item.propertyDifferences.length > 0) {
        for (const diff of item.propertyDifferences) {
          lines.push(`      ${diff.propertyName}: "${diff.sourceValue}" → "${diff.targetValue}"`);
        }
      }
    }
  };

  // Function to format tab results
  const formatTab = (title: string, categories: CategorizedResults) => {
    const totalCount = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
    if (totalCount === 0) return;

    lines.push('');
    lines.push(subDivider);
    lines.push(`${title} (${totalCount} items)`);
    lines.push(subDivider);

    formatCategory('Calculated Fields', categories.calculatedFields);
    formatCategory('Fields', categories.fields);
    formatCategory('Modules', categories.modules);
    formatCategory('Layouts', categories.layouts);
    formatCategory('Values Lists', categories.valuesLists);
    formatCategory('Values List Values', categories.valuesListValues);
    formatCategory('DDE Rules', categories.ddeRules);
    formatCategory('DDE Actions', categories.ddeActions);
    formatCategory('Reports', categories.reports);
    formatCategory('Dashboards', categories.dashboards);
    formatCategory('Workspaces', categories.workspaces);
    formatCategory('iViews', categories.iViews);
    formatCategory('Roles', categories.roles);
    formatCategory('Security Parameters', categories.securityParameters);
    formatCategory('Notifications', categories.notifications);
    formatCategory('Data Feeds', categories.dataFeeds);
    formatCategory('Schedules', categories.schedules);
  };

  formatTab(`NOT IN TARGET (${targetEnvName})`, tabResults.notInTarget);
  formatTab(`NOT IN SOURCE (${sourceEnvName})`, tabResults.notInSource);
  formatTab('MISMATCHED', tabResults.mismatched);
  formatTab('MATCHED', tabResults.matched);

  lines.push('');
  lines.push(divider);
  lines.push('END OF REPORT');
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export comparison results to CSV file
 */
export function exportToCSV(
  results: ComparisonResult[],
  summary: ComparisonSummary,
  sourceEnvName: string,
  targetEnvName: string
): void {
  const csvContent = generateCSVReport(results, summary, sourceEnvName, targetEnvName);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `archer_comparison_${timestamp}.csv`, 'text/csv');
}

/**
 * Export comparison results to text report
 */
export function exportToText(
  tabResults: TabResults,
  summary: ComparisonSummary,
  sourceEnvName: string,
  targetEnvName: string
): void {
  const textContent = generateTextReport(tabResults, summary, sourceEnvName, targetEnvName);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(textContent, `archer_comparison_${timestamp}.txt`, 'text/plain');
}

/**
 * Export source and target metadata to CSV for manual verification
 */
export function exportMetadataToCSV(
  sourceData: Array<{ guid: string; type: string; name: string; properties: string }>,
  targetData: Array<{ guid: string; type: string; name: string; properties: string }>,
  envName: string
): void {
  const headers = ['GUID', 'Type', 'Name', 'Properties'];
  
  const formatRows = (data: typeof sourceData) => {
    return data.map(row => 
      [row.guid, row.type, `"${row.name}"`, `"${row.properties.replace(/"/g, '""')}"`].join(',')
    );
  };

  const content = [
    headers.join(','),
    ...formatRows(sourceData.length > 0 ? sourceData : targetData),
  ].join('\n');

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(content, `archer_metadata_${envName}_${timestamp}.csv`, 'text/csv');
}

/**
 * Get status color for styling
 */
export function getStatusColor(status: ComparisonStatus): string {
  switch (status) {
    case ComparisonStatus.Match:
      return '#22c55e'; // green-500
    case ComparisonStatus.Mismatch:
      return '#eab308'; // yellow-500
    case ComparisonStatus.MissingInSource:
      return '#f97316'; // orange-500
    case ComparisonStatus.MissingInTarget:
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Get status background color for table rows
 */
export function getStatusBgColor(status: ComparisonStatus): string {
  switch (status) {
    case ComparisonStatus.Match:
      return '#dcfce7'; // green-100
    case ComparisonStatus.Mismatch:
      return '#fef9c3'; // yellow-100
    case ComparisonStatus.MissingInSource:
      return '#ffedd5'; // orange-100
    case ComparisonStatus.MissingInTarget:
      return '#fee2e2'; // red-100
    default:
      return '#f3f4f6'; // gray-100
  }
}
