// ==========================================
// Metadata Collector - Orchestrates Data Collection
// ==========================================

import {
  ArcherEnvironment,
  CollectedMetadata,
  CollectionOptions,
} from '@/types';
import {
  generateModules,
  generateFields,
  generateLayouts,
  generateValuesLists,
  generateValuesListValues,
  generateDDERules,
  generateDDEActions,
  generateReports,
  generateDashboards,
  generateWorkspaces,
  generateIViews,
  generateRoles,
  generateSecurityParameters,
  generateNotifications,
  generateDataFeeds,
  generateSchedules,
} from './mockDataService';

export type ProgressCallback = (message: string, progress: number) => void;

// Simulate API delay
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Collect metadata from an environment
export async function collectMetadata(
  environment: ArcherEnvironment,
  options: CollectionOptions,
  isSource: boolean,
  onProgress?: ProgressCallback
): Promise<CollectedMetadata> {
  const metadata: CollectedMetadata = {
    environment,
    modules: [],
    fields: [],
    layouts: [],
    valuesLists: [],
    valuesListValues: [],
    ddeRules: [],
    ddeActions: [],
    reports: [],
    dashboards: [],
    workspaces: [],
    iViews: [],
    roles: [],
    securityParameters: [],
    notifications: [],
    dataFeeds: [],
    schedules: [],
  };

  const totalSteps = Object.values(options).filter(v => v === true).length;
  let currentStep = 0;

  const reportProgress = (message: string) => {
    currentStep++;
    const progress = Math.round((currentStep / totalSteps) * 100);
    onProgress?.(message, progress);
  };

  // Collect modules (always needed for module-specific items)
  if (options.includeModules || options.includeFields || options.includeLayouts || 
      options.includeDDERules || options.includeNotifications) {
    await delay(300 + Math.random() * 200);
    metadata.modules = generateModules(10, isSource);
    
    // Filter by selected modules if specified
    if (options.selectedModuleIds.length > 0) {
      metadata.modules = metadata.modules.filter(m => 
        options.selectedModuleIds.includes(m.id)
      );
    }
    
    if (options.includeModules) {
      reportProgress(`Collecting modules from ${environment.displayName}...`);
    }
  }

  // Collect fields
  if (options.includeFields) {
    await delay(400 + Math.random() * 300);
    metadata.fields = generateFields(metadata.modules, isSource);
    reportProgress(`Collecting fields from ${environment.displayName}...`);
  }

  // Collect layouts
  if (options.includeLayouts) {
    await delay(200 + Math.random() * 200);
    metadata.layouts = generateLayouts(metadata.modules, isSource);
    reportProgress(`Collecting layouts from ${environment.displayName}...`);
  }

  // Collect values lists
  if (options.includeValuesLists) {
    await delay(300 + Math.random() * 200);
    metadata.valuesLists = generateValuesLists(12, isSource);
    reportProgress(`Collecting values lists from ${environment.displayName}...`);
  }

  // Collect values list values
  if (options.includeValuesListValues && metadata.valuesLists.length > 0) {
    await delay(500 + Math.random() * 300);
    metadata.valuesListValues = generateValuesListValues(metadata.valuesLists);
    reportProgress(`Collecting values list values from ${environment.displayName}...`);
  }

  // Collect DDE rules
  if (options.includeDDERules) {
    await delay(300 + Math.random() * 200);
    metadata.ddeRules = generateDDERules(metadata.modules, isSource);
    reportProgress(`Collecting DDE rules from ${environment.displayName}...`);
  }

  // Collect DDE actions
  if (options.includeDDEActions && metadata.ddeRules.length > 0) {
    await delay(400 + Math.random() * 300);
    metadata.ddeActions = generateDDEActions(metadata.ddeRules);
    reportProgress(`Collecting DDE actions from ${environment.displayName}...`);
  }

  // Collect reports
  if (options.includeReports) {
    await delay(300 + Math.random() * 200);
    metadata.reports = generateReports(10, isSource);
    reportProgress(`Collecting reports from ${environment.displayName}...`);
  }

  // Collect dashboards
  if (options.includeDashboards) {
    await delay(250 + Math.random() * 150);
    metadata.dashboards = generateDashboards(5, isSource);
    reportProgress(`Collecting dashboards from ${environment.displayName}...`);
  }

  // Collect workspaces
  if (options.includeWorkspaces) {
    await delay(200 + Math.random() * 100);
    metadata.workspaces = generateWorkspaces(3);
    reportProgress(`Collecting workspaces from ${environment.displayName}...`);
  }

  // Collect iViews
  if (options.includeIViews) {
    await delay(300 + Math.random() * 200);
    metadata.iViews = generateIViews(15);
    reportProgress(`Collecting iViews from ${environment.displayName}...`);
  }

  // Collect roles
  if (options.includeRoles) {
    await delay(250 + Math.random() * 150);
    metadata.roles = generateRoles(isSource);
    reportProgress(`Collecting roles from ${environment.displayName}...`);
  }

  // Collect security parameters
  if (options.includeSecurityParameters) {
    await delay(350 + Math.random() * 250);
    metadata.securityParameters = generateSecurityParameters(metadata.modules, isSource);
    reportProgress(`Collecting security parameters from ${environment.displayName}...`);
  }

  // Collect notifications
  if (options.includeNotifications) {
    await delay(200 + Math.random() * 150);
    metadata.notifications = generateNotifications(metadata.modules, isSource);
    reportProgress(`Collecting notifications from ${environment.displayName}...`);
  }

  // Collect data feeds
  if (options.includeDataFeeds) {
    await delay(300 + Math.random() * 200);
    metadata.dataFeeds = generateDataFeeds(metadata.modules, isSource);
    reportProgress(`Collecting data feeds from ${environment.displayName}...`);
  }

  // Collect schedules
  if (options.includeSchedules) {
    await delay(200 + Math.random() * 100);
    metadata.schedules = generateSchedules(8);
    reportProgress(`Collecting schedules from ${environment.displayName}...`);
  }

  return metadata;
}
