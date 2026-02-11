// ==========================================
// Metadata Collector Service
// Orchestrates data collection from Archer environments
// ==========================================

import {
  ArcherEnvironment,
  CollectedMetadata,
  CollectionOptions,
} from '../types';
import { generateMockMetadata } from './mockDataService';

export interface CollectionProgress {
  currentStep: string;
  currentItem: string;
  progress: number;
  totalSteps: number;
  currentStepNumber: number;
}

export type ProgressCallback = (progress: CollectionProgress) => void;

/**
 * Simulate async delay for mock data generation
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Collect metadata from an Archer environment
 * Uses mock data service in development mode
 */
export async function collectMetadata(
  environment: ArcherEnvironment,
  options: CollectionOptions,
  onProgress?: ProgressCallback,
  isSource: boolean = true
): Promise<CollectedMetadata> {
  const steps = [
    { name: 'Connecting', item: environment.displayName },
    { name: 'Collecting Modules', item: 'Modules' },
    { name: 'Collecting Fields', item: 'Fields' },
    { name: 'Collecting Calculated Fields', item: 'Calculated Fields' },
    { name: 'Collecting Layouts', item: 'Layouts' },
    { name: 'Collecting Values Lists', item: 'Values Lists' },
    { name: 'Collecting DDE Rules', item: 'DDE Rules' },
    { name: 'Collecting DDE Actions', item: 'DDE Actions' },
    { name: 'Collecting Reports', item: 'Reports' },
    { name: 'Collecting Dashboards', item: 'Dashboards' },
    { name: 'Collecting Other Metadata', item: 'Roles, Notifications, etc.' },
    { name: 'Finalizing', item: 'Processing data' },
  ];

  // Simulate progress for each step
  for (let i = 0; i < steps.length; i++) {
    if (onProgress) {
      onProgress({
        currentStep: steps[i].name,
        currentItem: steps[i].item,
        progress: Math.round((i / steps.length) * 100),
        totalSteps: steps.length,
        currentStepNumber: i + 1,
      });
    }
    await delay(200 + Math.random() * 300);
  }

  // Generate mock data with appropriate options
  const metadata = generateMockMetadata(environment, {
    isSource,
    introduceMismatches: !isSource,
    introduceFormulaDifferences: !isSource,
  });

  // Filter based on collection options
  if (!options.includeModules) metadata.modules = [];
  if (!options.includeFields) metadata.fields = [];
  if (!options.includeCalculatedFields) metadata.calculatedFields = [];
  if (!options.includeLayouts) metadata.layouts = [];
  if (!options.includeValuesLists) metadata.valuesLists = [];
  if (!options.includeValuesListValues) metadata.valuesListValues = [];
  if (!options.includeDDERules) metadata.ddeRules = [];
  if (!options.includeDDEActions) metadata.ddeActions = [];
  if (!options.includeReports) metadata.reports = [];
  if (!options.includeDashboards) metadata.dashboards = [];
  if (!options.includeWorkspaces) metadata.workspaces = [];
  if (!options.includeIViews) metadata.iViews = [];
  if (!options.includeRoles) metadata.roles = [];
  if (!options.includeSecurityParameters) metadata.securityParameters = [];
  if (!options.includeNotifications) metadata.notifications = [];
  if (!options.includeDataFeeds) metadata.dataFeeds = [];
  if (!options.includeSchedules) metadata.schedules = [];

  // Apply module filter if specified
  if (options.selectedModuleGuids.length > 0) {
    const selectedGuids = new Set(options.selectedModuleGuids);
    metadata.modules = metadata.modules.filter(m => selectedGuids.has(m.guid));
    metadata.fields = metadata.fields.filter(f => selectedGuids.has(f.moduleGuid));
    metadata.calculatedFields = metadata.calculatedFields.filter(f => selectedGuids.has(f.moduleGuid));
    metadata.layouts = metadata.layouts.filter(l => selectedGuids.has(l.moduleGuid));
    metadata.ddeRules = metadata.ddeRules.filter(r => selectedGuids.has(r.moduleGuid));
    metadata.notifications = metadata.notifications.filter(n => selectedGuids.has(n.moduleGuid));
  }

  if (onProgress) {
    onProgress({
      currentStep: 'Complete',
      currentItem: 'Done',
      progress: 100,
      totalSteps: steps.length,
      currentStepNumber: steps.length,
    });
  }

  return metadata;
}

/**
 * Test connection to an Archer environment
 */
export async function testConnection(environment: ArcherEnvironment): Promise<{
  success: boolean;
  message: string;
  version?: string;
}> {
  // Simulate connection test
  await delay(1000);
  
  // In real implementation, this would make an API call to Archer
  if (!environment.baseUrl || !environment.username) {
    return {
      success: false,
      message: 'Invalid configuration: URL and username are required',
    };
  }

  // Simulate successful connection
  return {
    success: true,
    message: 'Connection successful',
    version: '6.14.0.1',
  };
}
