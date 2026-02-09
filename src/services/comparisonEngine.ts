// ==========================================
// Comparison Engine - Core Comparison Logic
// ==========================================

import { v4 as uuidv4 } from 'uuid';
import {
  MetadataItem,
  ComparisonResult,
  ComparisonStatus,
  ComparisonType,
  Severity,
  CollectedMetadata,
  ComparisonSummary,
} from '@/types';

// Properties to exclude from comparison
const EXCLUDED_PROPERTIES = new Set([
  'id',
  'guid',
  'moduleId',
  'valuesListId',
  'ruleId',
  'reportId',
  'levelId',
  'parentModuleId',
  'parentValueId',
  'relatedValuesListId',
  'targetModuleId',
  'fieldIds',
]);

// Get composite key for matching items
function getCompositeKey(item: MetadataItem): string {
  const baseKey = item.name.toLowerCase().trim();
  
  // Add parent context for nested items
  switch (item.type) {
    case ComparisonType.Field:
      return `${item.moduleName}::${baseKey}`;
    case ComparisonType.Layout:
      return `${item.moduleName}::${baseKey}`;
    case ComparisonType.ValuesListValue:
      return `${item.valuesListName}::${baseKey}`;
    case ComparisonType.DDERule:
      return `${item.moduleName}::${baseKey}`;
    case ComparisonType.DDEAction:
      return `${item.ruleName}::${baseKey}`;
    case ComparisonType.Notification:
      return `${item.moduleName}::${baseKey}`;
    case ComparisonType.SecurityParameter:
      return `${item.moduleName || 'global'}::${baseKey}`;
    default:
      return baseKey;
  }
}

// Get parent name for an item
function getParentName(item: MetadataItem): string | undefined {
  switch (item.type) {
    case ComparisonType.Field:
    case ComparisonType.Layout:
    case ComparisonType.DDERule:
    case ComparisonType.Notification:
      return item.moduleName;
    case ComparisonType.ValuesListValue:
      return item.valuesListName;
    case ComparisonType.DDEAction:
      return item.ruleName;
    case ComparisonType.SecurityParameter:
      return item.moduleName;
    default:
      return undefined;
  }
}

// Compare two values and return formatted strings
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '<empty>';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Determine severity based on property
function getSeverity(propertyName: string, status: ComparisonStatus): Severity {
  if (status === ComparisonStatus.Match) {
    return Severity.Info;
  }
  
  const criticalProperties = ['isRequired', 'isEnabled', 'isKey', 'fieldType'];
  const warningProperties = ['isDefault', 'isShared', 'isCalculated'];
  
  if (criticalProperties.includes(propertyName)) {
    return Severity.Critical;
  }
  if (warningProperties.includes(propertyName)) {
    return Severity.Warning;
  }
  
  if (status === ComparisonStatus.MissingInSource || status === ComparisonStatus.MissingInTarget) {
    return Severity.Critical;
  }
  
  return Severity.Warning;
}

// Compare properties of two items
function compareProperties(
  sourceItem: MetadataItem,
  targetItem: MetadataItem
): ComparisonResult[] {
  const results: ComparisonResult[] = [];
  const allProperties = new Set([
    ...Object.keys(sourceItem),
    ...Object.keys(targetItem),
  ]);
  
  let hasAnyMismatch = false;
  const propertyDiffs: ComparisonResult[] = [];
  
  for (const prop of allProperties) {
    if (EXCLUDED_PROPERTIES.has(prop)) continue;
    if (prop === 'type') continue; // Skip the type property
    
    const sourceValue = (sourceItem as unknown as Record<string, unknown>)[prop];
    const targetValue = (targetItem as unknown as Record<string, unknown>)[prop];
    
    const sourceFormatted = formatValue(sourceValue);
    const targetFormatted = formatValue(targetValue);
    
    if (sourceFormatted !== targetFormatted) {
      hasAnyMismatch = true;
      propertyDiffs.push({
        id: uuidv4(),
        comparisonType: sourceItem.type,
        itemName: sourceItem.name,
        itemIdentifier: getCompositeKey(sourceItem),
        parentName: getParentName(sourceItem),
        propertyName: prop,
        sourceValue: sourceFormatted,
        targetValue: targetFormatted,
        status: ComparisonStatus.Mismatch,
        severity: getSeverity(prop, ComparisonStatus.Mismatch),
        sourceItem,
        targetItem,
      });
    }
  }
  
  if (hasAnyMismatch) {
    results.push(...propertyDiffs);
  } else {
    // Items match completely
    results.push({
      id: uuidv4(),
      comparisonType: sourceItem.type,
      itemName: sourceItem.name,
      itemIdentifier: getCompositeKey(sourceItem),
      parentName: getParentName(sourceItem),
      status: ComparisonStatus.Match,
      severity: Severity.Info,
      sourceItem,
      targetItem,
    });
  }
  
  return results;
}

// Compare arrays of items
function compareItemArrays(
  sourceItems: MetadataItem[],
  targetItems: MetadataItem[],
  comparisonType: ComparisonType
): ComparisonResult[] {
  const results: ComparisonResult[] = [];
  
  // Build maps for quick lookup
  const sourceMap = new Map<string, MetadataItem>();
  const targetMap = new Map<string, MetadataItem>();
  
  for (const item of sourceItems) {
    sourceMap.set(getCompositeKey(item), item);
  }
  
  for (const item of targetItems) {
    targetMap.set(getCompositeKey(item), item);
  }
  
  // Find items in source
  for (const [key, sourceItem] of sourceMap) {
    const targetItem = targetMap.get(key);
    
    if (targetItem) {
      // Item exists in both - compare properties
      results.push(...compareProperties(sourceItem, targetItem));
    } else {
      // Missing in target
      results.push({
        id: uuidv4(),
        comparisonType,
        itemName: sourceItem.name,
        itemIdentifier: key,
        parentName: getParentName(sourceItem),
        status: ComparisonStatus.MissingInTarget,
        severity: Severity.Critical,
        sourceItem,
      });
    }
  }
  
  // Find items only in target (missing in source)
  for (const [key, targetItem] of targetMap) {
    if (!sourceMap.has(key)) {
      results.push({
        id: uuidv4(),
        comparisonType,
        itemName: targetItem.name,
        itemIdentifier: key,
        parentName: getParentName(targetItem),
        status: ComparisonStatus.MissingInSource,
        severity: Severity.Warning,
        targetItem,
      });
    }
  }
  
  return results;
}

// Main comparison function
export function compareMetadata(
  source: CollectedMetadata,
  target: CollectedMetadata
): ComparisonResult[] {
  const allResults: ComparisonResult[] = [];
  
  // Compare each type
  allResults.push(...compareItemArrays(source.modules, target.modules, ComparisonType.Module));
  allResults.push(...compareItemArrays(source.fields, target.fields, ComparisonType.Field));
  allResults.push(...compareItemArrays(source.layouts, target.layouts, ComparisonType.Layout));
  allResults.push(...compareItemArrays(source.valuesLists, target.valuesLists, ComparisonType.ValuesList));
  allResults.push(...compareItemArrays(source.valuesListValues, target.valuesListValues, ComparisonType.ValuesListValue));
  allResults.push(...compareItemArrays(source.ddeRules, target.ddeRules, ComparisonType.DDERule));
  allResults.push(...compareItemArrays(source.ddeActions, target.ddeActions, ComparisonType.DDEAction));
  allResults.push(...compareItemArrays(source.reports, target.reports, ComparisonType.Report));
  allResults.push(...compareItemArrays(source.dashboards, target.dashboards, ComparisonType.Dashboard));
  allResults.push(...compareItemArrays(source.workspaces, target.workspaces, ComparisonType.Workspace));
  allResults.push(...compareItemArrays(source.iViews, target.iViews, ComparisonType.IView));
  allResults.push(...compareItemArrays(source.roles, target.roles, ComparisonType.Role));
  allResults.push(...compareItemArrays(source.securityParameters, target.securityParameters, ComparisonType.SecurityParameter));
  allResults.push(...compareItemArrays(source.notifications, target.notifications, ComparisonType.Notification));
  allResults.push(...compareItemArrays(source.dataFeeds, target.dataFeeds, ComparisonType.DataFeed));
  allResults.push(...compareItemArrays(source.schedules, target.schedules, ComparisonType.Schedule));
  
  return allResults;
}

// Generate summary statistics
export function generateSummary(results: ComparisonResult[]): ComparisonSummary {
  const summary: ComparisonSummary = {
    totalItems: 0,
    matchedCount: 0,
    mismatchedCount: 0,
    missingInSourceCount: 0,
    missingInTargetCount: 0,
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
  
  // Count unique items (group mismatches by item)
  const processedItems = new Set<string>();
  
  for (const result of results) {
    const itemKey = `${result.comparisonType}::${result.itemIdentifier}`;
    
    if (processedItems.has(itemKey)) {
      // Already counted this item (multiple property mismatches)
      continue;
    }
    
    processedItems.add(itemKey);
    summary.totalItems++;
    summary.byType[result.comparisonType].total++;
    
    switch (result.status) {
      case ComparisonStatus.Match:
        summary.matchedCount++;
        summary.byType[result.comparisonType].matched++;
        break;
      case ComparisonStatus.Mismatch:
        summary.mismatchedCount++;
        summary.byType[result.comparisonType].mismatched++;
        break;
      case ComparisonStatus.MissingInSource:
        summary.missingInSourceCount++;
        summary.byType[result.comparisonType].missingInSource++;
        break;
      case ComparisonStatus.MissingInTarget:
        summary.missingInTargetCount++;
        summary.byType[result.comparisonType].missingInTarget++;
        break;
    }
  }
  
  return summary;
}
