// ==========================================
// GUID-Based Comparison Engine with CSV Verification
// ==========================================

import { v4 as uuidv4 } from 'uuid';
import {
  ComparisonResult,
  ComparisonStatus,
  ComparisonType,
  Severity,
  CollectedMetadata,
  MetadataItem,
  Field,
  ComparisonSummary,
  PropertyDifference,
  TabResults,
  CategorizedResults,
  createEmptyTabResults,
  CSVRow,
} from '../types';

// Properties to exclude from comparison (technical IDs that differ between environments)
const EXCLUDED_PROPERTIES = new Set([
  'id',
  'moduleId',
  'levelId',
  'ruleId',
  'valuesListId',
  'parentValueId',
  'reportId',
  'targetModuleId',
  'parentModuleId',
  'relatedValuesListId',
  'fieldIds',
]);

/**
 * Convert metadata item to CSV row for comparison verification
 */
export function metadataToCSV(item: MetadataItem): CSVRow {
  const { id, ...propsWithoutId } = item as unknown as Record<string, unknown>;
  
  // Remove all numeric IDs, keep GUIDs
  const cleanProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(propsWithoutId)) {
    if (!EXCLUDED_PROPERTIES.has(key)) {
      cleanProps[key] = value;
    }
  }

  const field = item as Field;
  return {
    guid: item.guid,
    type: item.type as ComparisonType,
    name: item.name,
    properties: JSON.stringify(cleanProps, Object.keys(cleanProps).sort()),
    calculationFormula: field.isCalculated ? field.calculationFormula : undefined,
  };
}

/**
 * Normalize string for comparison (trim, lowercase, normalize whitespace)
 */
function normalizeString(value: string | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Compare calculation formulas with detailed diff
 */
function compareCalculationFormulas(
  sourceFormula: string | undefined,
  targetFormula: string | undefined
): { isMatch: boolean; normalizedSource: string; normalizedTarget: string } {
  const normalizedSource = normalizeString(sourceFormula);
  const normalizedTarget = normalizeString(targetFormula);
  
  return {
    isMatch: normalizedSource === normalizedTarget,
    normalizedSource,
    normalizedTarget,
  };
}

/**
 * Compare two values and return if they match
 */
function valuesMatch(sourceValue: unknown, targetValue: unknown): boolean {
  // Handle null/undefined
  if (sourceValue === null || sourceValue === undefined) {
    return targetValue === null || targetValue === undefined;
  }
  if (targetValue === null || targetValue === undefined) {
    return false;
  }

  // Handle arrays (like fieldGuids, permissionGuids)
  if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
    if (sourceValue.length !== targetValue.length) return false;
    const sortedSource = [...sourceValue].sort();
    const sortedTarget = [...targetValue].sort();
    return sortedSource.every((val, idx) => val === sortedTarget[idx]);
  }

  // Handle objects
  if (typeof sourceValue === 'object' && typeof targetValue === 'object') {
    return JSON.stringify(sourceValue) === JSON.stringify(targetValue);
  }

  // Handle strings with normalization
  if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
    return normalizeString(sourceValue) === normalizeString(targetValue);
  }

  // Direct comparison for primitives
  return sourceValue === targetValue;
}

/**
 * Compare two metadata items property by property
 * Returns array of differences
 */
function compareMetadataItems(
  sourceItem: MetadataItem,
  targetItem: MetadataItem
): PropertyDifference[] {
  const differences: PropertyDifference[] = [];
  
  const sourceObj = sourceItem as unknown as Record<string, unknown>;
  const targetObj = targetItem as unknown as Record<string, unknown>;
  
  // Get all property keys from both items
  const allKeys = new Set([
    ...Object.keys(sourceObj),
    ...Object.keys(targetObj),
  ]);

  for (const key of allKeys) {
    // Skip excluded properties (numeric IDs)
    if (EXCLUDED_PROPERTIES.has(key)) continue;
    
    // Skip type property (we know they're the same type)
    if (key === 'type') continue;
    
    // Skip GUID (used for matching, not comparison)
    if (key === 'guid') continue;

    const sourceValue = sourceObj[key];
    const targetValue = targetObj[key];

    if (!valuesMatch(sourceValue, targetValue)) {
      const isCalculation = key === 'calculationFormula';
      
      differences.push({
        propertyName: key,
        sourceValue: formatValue(sourceValue),
        targetValue: formatValue(targetValue),
        isCalculationDifference: isCalculation,
      });
    }
  }

  // Special handling for calculated fields - compare formula text
  const sourceField = sourceItem as Field;
  const targetField = targetItem as Field;
  
  if (sourceField.isCalculated && targetField.isCalculated) {
    const formulaComparison = compareCalculationFormulas(
      sourceField.calculationFormula,
      targetField.calculationFormula
    );
    
    if (!formulaComparison.isMatch) {
      // Check if we already have this difference
      const hasFormulaDiff = differences.some(d => d.propertyName === 'calculationFormula');
      if (!hasFormulaDiff) {
        differences.push({
          propertyName: 'calculationFormula',
          sourceValue: sourceField.calculationFormula || '(empty)',
          targetValue: targetField.calculationFormula || '(empty)',
          isCalculationDifference: true,
        });
      }
    }
  }

  return differences;
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Determine severity based on comparison type and status
 */
function determineSeverity(
  type: ComparisonType,
  status: ComparisonStatus,
  differences?: PropertyDifference[]
): Severity {
  // Missing items are critical
  if (status === ComparisonStatus.MissingInSource || status === ComparisonStatus.MissingInTarget) {
    // Calculated fields and DDE rules are critical
    if (type === ComparisonType.CalculatedField || 
        type === ComparisonType.DDERule || 
        type === ComparisonType.DDEAction) {
      return Severity.Critical;
    }
    return Severity.Warning;
  }
  
  // Mismatches
  if (status === ComparisonStatus.Mismatch) {
    // Calculation formula differences are critical
    if (differences?.some(d => d.isCalculationDifference)) {
      return Severity.Critical;
    }
    // Name or key property differences are warnings
    if (differences?.some(d => ['name', 'alias', 'isRequired', 'isKey'].includes(d.propertyName))) {
      return Severity.Warning;
    }
    return Severity.Info;
  }
  
  return Severity.Info;
}

/**
 * Categorize a comparison result into the appropriate category
 */
function categorizeResult(result: ComparisonResult, categories: CategorizedResults): void {
  switch (result.comparisonType) {
    case ComparisonType.CalculatedField:
      categories.calculatedFields.push(result);
      break;
    case ComparisonType.Field:
      categories.fields.push(result);
      break;
    case ComparisonType.Module:
      categories.modules.push(result);
      break;
    case ComparisonType.Layout:
      categories.layouts.push(result);
      break;
    case ComparisonType.ValuesList:
      categories.valuesLists.push(result);
      break;
    case ComparisonType.ValuesListValue:
      categories.valuesListValues.push(result);
      break;
    case ComparisonType.DDERule:
      categories.ddeRules.push(result);
      break;
    case ComparisonType.DDEAction:
      categories.ddeActions.push(result);
      break;
    case ComparisonType.Report:
      categories.reports.push(result);
      break;
    case ComparisonType.Dashboard:
      categories.dashboards.push(result);
      break;
    case ComparisonType.Workspace:
      categories.workspaces.push(result);
      break;
    case ComparisonType.IView:
      categories.iViews.push(result);
      break;
    case ComparisonType.Role:
      categories.roles.push(result);
      break;
    case ComparisonType.SecurityParameter:
      categories.securityParameters.push(result);
      break;
    case ComparisonType.Notification:
      categories.notifications.push(result);
      break;
    case ComparisonType.DataFeed:
      categories.dataFeeds.push(result);
      break;
    case ComparisonType.Schedule:
      categories.schedules.push(result);
      break;
  }
}

/**
 * Compare a single type of metadata using GUID matching
 */
function compareMetadataByGuid<T extends MetadataItem>(
  sourceItems: T[],
  targetItems: T[],
  type: ComparisonType
): ComparisonResult[] {
  const results: ComparisonResult[] = [];
  
  // Build GUID maps for O(1) lookup
  const sourceByGuid = new Map<string, T>();
  const targetByGuid = new Map<string, T>();
  
  for (const item of sourceItems) {
    sourceByGuid.set(item.guid, item);
  }
  
  for (const item of targetItems) {
    targetByGuid.set(item.guid, item);
  }

  // Track processed GUIDs
  const processedGuids = new Set<string>();

  // Compare items found in source
  for (const [guid, sourceItem] of sourceByGuid) {
    processedGuids.add(guid);
    const targetItem = targetByGuid.get(guid);
    
    if (!targetItem) {
      // Item exists in source but not in target
      const sourceCSV = metadataToCSV(sourceItem);
      results.push({
        id: uuidv4(),
        comparisonType: type,
        itemName: sourceItem.name,
        itemGuid: guid,
        parentName: getParentName(sourceItem),
        parentGuid: getParentGuid(sourceItem),
        status: ComparisonStatus.MissingInTarget,
        severity: determineSeverity(type, ComparisonStatus.MissingInTarget),
        sourceItem,
        csvSourceRow: sourceCSV.properties,
      });
    } else {
      // Item exists in both - compare properties
      const differences = compareMetadataItems(sourceItem, targetItem);
      const sourceCSV = metadataToCSV(sourceItem);
      const targetCSV = metadataToCSV(targetItem);
      
      if (differences.length > 0) {
        // Mismatch
        results.push({
          id: uuidv4(),
          comparisonType: type,
          itemName: sourceItem.name,
          itemGuid: guid,
          parentName: getParentName(sourceItem),
          parentGuid: getParentGuid(sourceItem),
          status: ComparisonStatus.Mismatch,
          severity: determineSeverity(type, ComparisonStatus.Mismatch, differences),
          sourceItem,
          targetItem,
          propertyDifferences: differences,
          csvSourceRow: sourceCSV.properties,
          csvTargetRow: targetCSV.properties,
        });
      } else {
        // Match
        results.push({
          id: uuidv4(),
          comparisonType: type,
          itemName: sourceItem.name,
          itemGuid: guid,
          parentName: getParentName(sourceItem),
          parentGuid: getParentGuid(sourceItem),
          status: ComparisonStatus.Match,
          severity: Severity.Info,
          sourceItem,
          targetItem,
          csvSourceRow: sourceCSV.properties,
          csvTargetRow: targetCSV.properties,
        });
      }
    }
  }

  // Find items only in target
  for (const [guid, targetItem] of targetByGuid) {
    if (!processedGuids.has(guid)) {
      const targetCSV = metadataToCSV(targetItem);
      results.push({
        id: uuidv4(),
        comparisonType: type,
        itemName: targetItem.name,
        itemGuid: guid,
        parentName: getParentName(targetItem),
        parentGuid: getParentGuid(targetItem),
        status: ComparisonStatus.MissingInSource,
        severity: determineSeverity(type, ComparisonStatus.MissingInSource),
        targetItem,
        csvTargetRow: targetCSV.properties,
      });
    }
  }

  return results;
}

/**
 * Get parent name from metadata item
 */
function getParentName(item: MetadataItem): string | undefined {
  const anyItem = item as unknown as Record<string, unknown>;
  return (anyItem.moduleName as string) || 
         (anyItem.valuesListName as string) || 
         (anyItem.ruleName as string) ||
         undefined;
}

/**
 * Get parent GUID from metadata item
 */
function getParentGuid(item: MetadataItem): string | undefined {
  const anyItem = item as unknown as Record<string, unknown>;
  return (anyItem.moduleGuid as string) || 
         (anyItem.valuesListGuid as string) || 
         (anyItem.ruleGuid as string) ||
         undefined;
}

/**
 * Main comparison function - GUID based with CSV verification
 */
export function compareEnvironments(
  source: CollectedMetadata,
  target: CollectedMetadata
): { results: ComparisonResult[]; tabResults: TabResults; summary: ComparisonSummary } {
  const allResults: ComparisonResult[] = [];
  const tabResults = createEmptyTabResults();

  // Compare each metadata type
  const comparisons: Array<{ items: ComparisonResult[] }> = [
    { items: compareMetadataByGuid(source.modules, target.modules, ComparisonType.Module) },
    { items: compareMetadataByGuid(source.calculatedFields, target.calculatedFields, ComparisonType.CalculatedField) },
    { items: compareMetadataByGuid(source.fields, target.fields, ComparisonType.Field) },
    { items: compareMetadataByGuid(source.layouts, target.layouts, ComparisonType.Layout) },
    { items: compareMetadataByGuid(source.valuesLists, target.valuesLists, ComparisonType.ValuesList) },
    { items: compareMetadataByGuid(source.valuesListValues, target.valuesListValues, ComparisonType.ValuesListValue) },
    { items: compareMetadataByGuid(source.ddeRules, target.ddeRules, ComparisonType.DDERule) },
    { items: compareMetadataByGuid(source.ddeActions, target.ddeActions, ComparisonType.DDEAction) },
    { items: compareMetadataByGuid(source.reports, target.reports, ComparisonType.Report) },
    { items: compareMetadataByGuid(source.dashboards, target.dashboards, ComparisonType.Dashboard) },
    { items: compareMetadataByGuid(source.workspaces, target.workspaces, ComparisonType.Workspace) },
    { items: compareMetadataByGuid(source.iViews, target.iViews, ComparisonType.IView) },
    { items: compareMetadataByGuid(source.roles, target.roles, ComparisonType.Role) },
    { items: compareMetadataByGuid(source.securityParameters, target.securityParameters, ComparisonType.SecurityParameter) },
    { items: compareMetadataByGuid(source.notifications, target.notifications, ComparisonType.Notification) },
    { items: compareMetadataByGuid(source.dataFeeds, target.dataFeeds, ComparisonType.DataFeed) },
    { items: compareMetadataByGuid(source.schedules, target.schedules, ComparisonType.Schedule) },
  ];

  // Categorize all results
  for (const comparison of comparisons) {
    for (const result of comparison.items) {
      allResults.push(result);
      
      // Add to appropriate tab
      switch (result.status) {
        case ComparisonStatus.Match:
          categorizeResult(result, tabResults.matched);
          break;
        case ComparisonStatus.Mismatch:
          categorizeResult(result, tabResults.mismatched);
          break;
        case ComparisonStatus.MissingInSource:
          categorizeResult(result, tabResults.notInSource);
          break;
        case ComparisonStatus.MissingInTarget:
          categorizeResult(result, tabResults.notInTarget);
          break;
      }
    }
  }

  // Calculate summary
  const summary = calculateSummary(allResults);

  return { results: allResults, tabResults, summary };
}

/**
 * Calculate comparison summary statistics
 */
function calculateSummary(results: ComparisonResult[]): ComparisonSummary {
  const summary: ComparisonSummary = {
    totalItems: results.length,
    matchedCount: 0,
    mismatchedCount: 0,
    missingInSourceCount: 0,
    missingInTargetCount: 0,
    calculatedFieldStats: {
      matched: 0,
      mismatched: 0,
      formulaDifferences: 0,
    },
    byType: {} as ComparisonSummary['byType'],
  };

  // Initialize byType for all comparison types
  for (const type of Object.values(ComparisonType)) {
    summary.byType[type] = {
      total: 0,
      matched: 0,
      mismatched: 0,
      missingInSource: 0,
      missingInTarget: 0,
    };
  }

  // Count results
  for (const result of results) {
    const typeStats = summary.byType[result.comparisonType];
    typeStats.total++;

    switch (result.status) {
      case ComparisonStatus.Match:
        summary.matchedCount++;
        typeStats.matched++;
        if (result.comparisonType === ComparisonType.CalculatedField) {
          summary.calculatedFieldStats.matched++;
        }
        break;
      case ComparisonStatus.Mismatch:
        summary.mismatchedCount++;
        typeStats.mismatched++;
        if (result.comparisonType === ComparisonType.CalculatedField) {
          summary.calculatedFieldStats.mismatched++;
          if (result.propertyDifferences?.some(d => d.isCalculationDifference)) {
            summary.calculatedFieldStats.formulaDifferences++;
          }
        }
        break;
      case ComparisonStatus.MissingInSource:
        summary.missingInSourceCount++;
        typeStats.missingInSource++;
        break;
      case ComparisonStatus.MissingInTarget:
        summary.missingInTargetCount++;
        typeStats.missingInTarget++;
        break;
    }
  }

  return summary;
}

/**
 * Export comparison results to CSV format for verification
 */
export function exportToCSV(results: ComparisonResult[]): string {
  const headers = [
    'GUID',
    'Type',
    'Name',
    'Status',
    'Severity',
    'Parent',
    'Differences',
    'Source CSV',
    'Target CSV',
  ];

  const rows = results.map(r => [
    r.itemGuid,
    r.comparisonType,
    r.itemName,
    r.status,
    r.severity,
    r.parentName || '',
    r.propertyDifferences?.map(d => `${d.propertyName}: "${d.sourceValue}" vs "${d.targetValue}"`).join('; ') || '',
    r.csvSourceRow || '',
    r.csvTargetRow || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Compare two CSV strings for exact match verification
 */
export function compareCSVs(sourceCSV: string, targetCSV: string): {
  isMatch: boolean;
  sourceRows: number;
  targetRows: number;
  differences: string[];
} {
  const sourceLines = sourceCSV.split('\n').filter(l => l.trim());
  const targetLines = targetCSV.split('\n').filter(l => l.trim());
  
  const differences: string[] = [];
  
  // Build maps by GUID (first column)
  const sourceMap = new Map<string, string>();
  const targetMap = new Map<string, string>();
  
  for (const line of sourceLines.slice(1)) { // Skip header
    const guid = line.split(',')[0]?.replace(/"/g, '');
    if (guid) sourceMap.set(guid, line);
  }
  
  for (const line of targetLines.slice(1)) { // Skip header
    const guid = line.split(',')[0]?.replace(/"/g, '');
    if (guid) targetMap.set(guid, line);
  }
  
  // Compare
  for (const [guid, sourceLine] of sourceMap) {
    const targetLine = targetMap.get(guid);
    if (!targetLine) {
      differences.push(`GUID ${guid}: Missing in target`);
    } else if (sourceLine !== targetLine) {
      differences.push(`GUID ${guid}: Content differs`);
    }
  }
  
  for (const guid of targetMap.keys()) {
    if (!sourceMap.has(guid)) {
      differences.push(`GUID ${guid}: Missing in source`);
    }
  }
  
  return {
    isMatch: differences.length === 0,
    sourceRows: sourceMap.size,
    targetRows: targetMap.size,
    differences,
  };
}
