// ==========================================
// Mock Metadata Service - Generates Sample Data
// ==========================================

import { v4 as uuidv4 } from 'uuid';
import {
  Module,
  Field,
  Layout,
  ValuesList,
  ValuesListValue,
  DDERule,
  DDEAction,
  Report,
  Dashboard,
  Workspace,
  IView,
  Role,
  SecurityParameter,
  Notification,
  DataFeed,
  Schedule,
  ComparisonType,
  FieldType,
  ReportType,
  ArcherEnvironment,
} from '@/types';

// Sample module names for GRC context
const moduleNames = [
  'Applications', 'Business Processes', 'Risks', 'Controls', 'Policies',
  'Incidents', 'Findings', 'Audits', 'Compliance', 'Vendors',
  'Assets', 'Threats', 'Vulnerabilities', 'Exceptions', 'Tasks'
];

const fieldNames = [
  'Name', 'Description', 'Status', 'Owner', 'Created Date',
  'Modified Date', 'Risk Score', 'Control Type', 'Category',
  'Priority', 'Due Date', 'Completion Date', 'Notes', 'Attachments',
  'Related Items', 'Rating', 'Frequency', 'Impact', 'Likelihood'
];

const valuesListNames = [
  'Risk Ratings', 'Control Types', 'Status Values', 'Priority Levels',
  'Impact Ratings', 'Likelihood Ratings', 'Frequency Options', 'Categories',
  'Regions', 'Departments', 'Yes/No', 'Approval Status', 'Compliance Status'
];

const reportNames = [
  'Risk Summary Report', 'Control Effectiveness', 'Compliance Dashboard',
  'Audit Findings', 'Incident Trends', 'Vendor Risk Overview',
  'Policy Compliance', 'Asset Inventory', 'Open Tasks', 'Exception Report'
];

const roleNames = [
  'System Administrator', 'Application Owner', 'Risk Manager', 'Auditor',
  'Compliance Officer', 'Read Only User', 'Power User', 'Report Viewer',
  'Content Administrator', 'Security Administrator'
];

// Utility functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function randomFieldType(): FieldType {
  const types = Object.values(FieldType);
  return randomElement(types);
}

function randomReportType(): ReportType {
  const types = Object.values(ReportType);
  return randomElement(types);
}

// Generate mock modules
export function generateModules(count: number = 10, isSource: boolean = true): Module[] {
  const modules: Module[] = [];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let name = randomElement(moduleNames);
    if (usedNames.has(name)) {
      name = `${name} ${i + 1}`;
    }
    usedNames.add(name);
    
    // Introduce some variation for comparison testing
    const variation = isSource ? 0 : randomInt(0, 2);
    
    modules.push({
      id: 1000 + i,
      name: variation === 1 && i % 5 === 0 ? `${name} (Modified)` : name,
      guid: uuidv4(),
      type: ComparisonType.Module,
      alias: name.toLowerCase().replace(/\s+/g, '_'),
      description: `This module manages ${name.toLowerCase()} for the organization.`,
      levelId: 100 + i,
      isSubform: randomBoolean(0.2),
      parentModuleId: undefined,
      fieldCount: randomInt(10, 50),
    });
  }
  
  // For target, skip some modules to simulate missing items
  if (!isSource) {
    const skipIndex = randomInt(0, modules.length - 1);
    modules.splice(skipIndex, 1);
  }
  
  return modules;
}

// Generate mock fields
export function generateFields(modules: Module[], isSource: boolean = true): Field[] {
  const fields: Field[] = [];
  let fieldId = 5000;
  
  for (const module of modules) {
    const fieldCount = randomInt(5, 15);
    const usedFieldNames = new Set<string>();
    
    for (let i = 0; i < fieldCount; i++) {
      let name = randomElement(fieldNames);
      if (usedFieldNames.has(name)) {
        name = `${name} ${i + 1}`;
      }
      usedFieldNames.add(name);
      
      const fieldType = randomFieldType();
      const variation = isSource ? 0 : randomInt(0, 3);
      
      fields.push({
        id: fieldId++,
        name: name,
        guid: uuidv4(),
        type: ComparisonType.Field,
        alias: name.toLowerCase().replace(/\s+/g, '_'),
        moduleId: module.id,
        moduleName: module.name,
        fieldType: fieldType,
        isRequired: variation === 1 ? !randomBoolean(0.3) : randomBoolean(0.3),
        isKey: name === 'Name',
        isCalculated: randomBoolean(0.1),
        maxLength: fieldType === FieldType.Text ? randomInt(50, 500) : undefined,
        defaultValue: randomBoolean(0.2) ? 'Default Value' : undefined,
        relatedValuesListId: fieldType === FieldType.ValuesList ? randomInt(1, 10) : undefined,
      });
    }
  }
  
  // Remove some fields for target to simulate missing
  if (!isSource) {
    const removeCount = randomInt(2, 5);
    for (let i = 0; i < removeCount; i++) {
      const removeIndex = randomInt(0, fields.length - 1);
      fields.splice(removeIndex, 1);
    }
  }
  
  return fields;
}

// Generate mock layouts
export function generateLayouts(modules: Module[], _isSource: boolean = true): Layout[] {
  const layouts: Layout[] = [];
  let layoutId = 2000;
  
  for (const module of modules) {
    const layoutCount = randomInt(1, 3);
    
    for (let i = 0; i < layoutCount; i++) {
      const layoutName = i === 0 ? 'Default Layout' : `Layout ${i + 1}`;
      
      layouts.push({
        id: layoutId++,
        name: layoutName,
        guid: uuidv4(),
        type: ComparisonType.Layout,
        moduleId: module.id,
        moduleName: module.name,
        isDefault: i === 0,
        fieldIds: Array.from({ length: randomInt(5, 15) }, () => randomInt(5000, 5200)),
      });
    }
  }
  
  return layouts;
}

// Generate mock values lists
export function generateValuesLists(count: number = 12, isSource: boolean = true): ValuesList[] {
  const lists: ValuesList[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = valuesListNames[i % valuesListNames.length];
    const variation = isSource ? '' : (i % 4 === 0 ? ' (Updated)' : '');
    
    lists.push({
      id: 3000 + i,
      name: `${name}${variation}`,
      guid: uuidv4(),
      type: ComparisonType.ValuesList,
      alias: name.toLowerCase().replace(/\s+/g, '_'),
      description: `Values list for ${name.toLowerCase()}`,
      valuesCount: randomInt(3, 20),
      isHierarchical: randomBoolean(0.2),
    });
  }
  
  if (!isSource) {
    lists.splice(randomInt(0, lists.length - 1), 1);
  }
  
  return lists;
}

// Generate mock values list values
export function generateValuesListValues(valuesLists: ValuesList[]): ValuesListValue[] {
  const values: ValuesListValue[] = [];
  let valueId = 4000;
  
  for (const list of valuesLists) {
    const sampleValues = ['Low', 'Medium', 'High', 'Critical', 'N/A', 'Yes', 'No', 'Pending', 'Approved', 'Rejected'];
    const count = Math.min(list.valuesCount, sampleValues.length);
    
    for (let i = 0; i < count; i++) {
      values.push({
        id: valueId++,
        name: sampleValues[i],
        guid: uuidv4(),
        type: ComparisonType.ValuesListValue,
        valuesListId: list.id,
        valuesListName: list.name,
        numericValue: i + 1,
        sortOrder: i + 1,
        isSelectable: true,
      });
    }
  }
  
  return values;
}

// Generate mock DDE rules
export function generateDDERules(modules: Module[], _isSource: boolean = true): DDERule[] {
  const rules: DDERule[] = [];
  let ruleId = 6000;
  
  for (const module of modules) {
    const ruleCount = randomInt(0, 3);
    
    for (let i = 0; i < ruleCount; i++) {
      rules.push({
        id: ruleId++,
        name: `${module.name} Rule ${i + 1}`,
        guid: uuidv4(),
        type: ComparisonType.DDERule,
        moduleId: module.id,
        moduleName: module.name,
        isEnabled: randomBoolean(0.8),
        triggerType: randomElement(['On Create', 'On Update', 'On Delete', 'Scheduled']),
        actionsCount: randomInt(1, 5),
      });
    }
  }
  
  return rules;
}

// Generate mock DDE actions
export function generateDDEActions(rules: DDERule[]): DDEAction[] {
  const actions: DDEAction[] = [];
  let actionId = 7000;
  
  for (const rule of rules) {
    const actionCount = rule.actionsCount;
    
    for (let i = 0; i < actionCount; i++) {
      actions.push({
        id: actionId++,
        name: `Action ${i + 1}`,
        guid: uuidv4(),
        type: ComparisonType.DDEAction,
        ruleId: rule.id,
        ruleName: rule.name,
        actionType: randomElement(['Set Field', 'Send Notification', 'Create Record', 'Update Record']),
        order: i + 1,
      });
    }
  }
  
  return actions;
}

// Generate mock reports
export function generateReports(count: number = 10, isSource: boolean = true): Report[] {
  const reports: Report[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = reportNames[i % reportNames.length];
    
    reports.push({
      id: 8000 + i,
      name: i >= reportNames.length ? `${name} ${i + 1}` : name,
      guid: uuidv4(),
      type: ComparisonType.Report,
      description: `Report for ${name.toLowerCase()}`,
      reportType: randomReportType(),
      moduleId: randomInt(1000, 1010),
      isShared: randomBoolean(0.7),
      owner: randomElement(['admin', 'risk_manager', 'auditor', 'compliance_officer']),
    });
  }
  
  if (!isSource) {
    reports.splice(randomInt(0, reports.length - 1), 1);
  }
  
  return reports;
}

// Generate mock dashboards
export function generateDashboards(count: number = 5, _isSource: boolean = true): Dashboard[] {
  const dashboards: Dashboard[] = [];
  const dashboardNames = ['Executive Dashboard', 'Risk Overview', 'Compliance Status', 'Audit Summary', 'Operational Metrics'];
  
  for (let i = 0; i < count; i++) {
    dashboards.push({
      id: 9000 + i,
      name: dashboardNames[i % dashboardNames.length],
      guid: uuidv4(),
      type: ComparisonType.Dashboard,
      description: `Dashboard showing ${dashboardNames[i % dashboardNames.length].toLowerCase()}`,
      iViewsCount: randomInt(2, 8),
      isShared: randomBoolean(0.8),
      owner: randomElement(['admin', 'executive', 'manager']),
    });
  }
  
  return dashboards;
}

// Generate mock workspaces
export function generateWorkspaces(count: number = 3): Workspace[] {
  const workspaces: Workspace[] = [];
  const names = ['Risk Management', 'Compliance Center', 'Security Operations'];
  
  for (let i = 0; i < count; i++) {
    workspaces.push({
      id: 10000 + i,
      name: names[i % names.length],
      guid: uuidv4(),
      type: ComparisonType.Workspace,
      description: `Workspace for ${names[i % names.length].toLowerCase()}`,
      dashboardsCount: randomInt(1, 5),
      order: i + 1,
    });
  }
  
  return workspaces;
}

// Generate mock iViews
export function generateIViews(count: number = 15): IView[] {
  const iViews: IView[] = [];
  const types = ['Report', 'Statistics', 'Chart', 'Quick Links', 'RSS Feed'];
  
  for (let i = 0; i < count; i++) {
    const type = randomElement(types);
    iViews.push({
      id: 11000 + i,
      name: `iView ${i + 1}`,
      guid: uuidv4(),
      type: ComparisonType.IView,
      iViewType: type,
      reportId: type === 'Report' ? randomInt(8000, 8010) : undefined,
    });
  }
  
  return iViews;
}

// Generate mock roles
export function generateRoles(isSource: boolean = true): Role[] {
  const roles: Role[] = [];
  
  for (let i = 0; i < roleNames.length; i++) {
    roles.push({
      id: 12000 + i,
      name: roleNames[i],
      guid: uuidv4(),
      type: ComparisonType.Role,
      description: `Role for ${roleNames[i].toLowerCase()}`,
      usersCount: randomInt(0, 50),
      groupsCount: randomInt(0, 10),
      isSystemRole: i < 3,
    });
  }
  
  if (!isSource) {
    roles.splice(randomInt(0, roles.length - 1), 1);
  }
  
  return roles;
}

// Generate mock security parameters
export function generateSecurityParameters(modules: Module[], _isSource: boolean = true): SecurityParameter[] {
  const params: SecurityParameter[] = [];
  let paramId = 13000;
  
  for (const module of modules) {
    params.push({
      id: paramId++,
      name: `${module.name} Read Access`,
      guid: uuidv4(),
      type: ComparisonType.SecurityParameter,
      securityType: 'Read',
      moduleId: module.id,
      moduleName: module.name,
    });
    
    params.push({
      id: paramId++,
      name: `${module.name} Write Access`,
      guid: uuidv4(),
      type: ComparisonType.SecurityParameter,
      securityType: 'Write',
      moduleId: module.id,
      moduleName: module.name,
    });
  }
  
  return params;
}

// Generate mock notifications
export function generateNotifications(modules: Module[], _isSource: boolean = true): Notification[] {
  const notifications: Notification[] = [];
  let notifId = 14000;
  
  for (const module of modules.slice(0, 5)) {
    notifications.push({
      id: notifId++,
      name: `${module.name} Alert`,
      guid: uuidv4(),
      type: ComparisonType.Notification,
      moduleId: module.id,
      moduleName: module.name,
      isEnabled: randomBoolean(0.8),
      triggerType: randomElement(['On Create', 'On Update', 'Status Change']),
    });
  }
  
  return notifications;
}

// Generate mock data feeds
export function generateDataFeeds(modules: Module[], _isSource: boolean = true): DataFeed[] {
  const feeds: DataFeed[] = [];
  let feedId = 15000;
  
  for (const module of modules.slice(0, 3)) {
    feeds.push({
      id: feedId++,
      name: `${module.name} Import`,
      guid: uuidv4(),
      type: ComparisonType.DataFeed,
      feedType: randomElement(['File', 'Database', 'API']),
      targetModuleId: module.id,
      targetModuleName: module.name,
      isEnabled: randomBoolean(0.7),
      schedule: randomElement(['Daily', 'Weekly', 'Monthly', 'On Demand']),
    });
  }
  
  return feeds;
}

// Generate mock schedules
export function generateSchedules(count: number = 8): Schedule[] {
  const schedules: Schedule[] = [];
  const types = ['Report', 'Data Feed', 'Notification', 'Calculation'];
  
  for (let i = 0; i < count; i++) {
    schedules.push({
      id: 16000 + i,
      name: `Schedule ${i + 1}`,
      guid: uuidv4(),
      type: ComparisonType.Schedule,
      scheduleType: randomElement(types),
      frequency: randomElement(['Hourly', 'Daily', 'Weekly', 'Monthly']),
      isEnabled: randomBoolean(0.8),
      lastRunDate: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      nextRunDate: new Date(Date.now() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return schedules;
}

// Mock connection test
export async function testConnection(_environment: ArcherEnvironment): Promise<{ success: boolean; message: string; version?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, randomInt(500, 1500)));
  
  // Simulate random success/failure
  if (randomBoolean(0.9)) {
    return {
      success: true,
      message: 'Connection successful',
      version: `6.${randomInt(8, 12)}.0.${randomInt(1, 5)}`,
    };
  } else {
    return {
      success: false,
      message: 'Failed to connect: Network timeout',
    };
  }
}
