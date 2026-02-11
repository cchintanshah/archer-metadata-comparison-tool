// ==========================================
// Mock Data Service for Testing
// Generates realistic Archer metadata with GUIDs
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
  CollectedMetadata,
  ArcherEnvironment,
  ComparisonType,
  FieldType,
  ReportType,
} from '../types';

// Stable GUIDs for cross-environment matching
const STABLE_GUIDS = {
  modules: [
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
  ],
  fields: Array.from({ length: 50 }, () => uuidv4()),
  valuesLists: Array.from({ length: 10 }, () => uuidv4()),
  ddeRules: Array.from({ length: 15 }, () => uuidv4()),
  ddeActions: Array.from({ length: 30 }, () => uuidv4()),
};

// Make some fields shared between environments
const SHARED_FIELD_GUIDS = STABLE_GUIDS.fields.slice(0, 35);
const SOURCE_ONLY_FIELD_GUIDS = Array.from({ length: 5 }, () => uuidv4());
const TARGET_ONLY_FIELD_GUIDS = Array.from({ length: 5 }, () => uuidv4());

const MODULE_NAMES = [
  'Incident Management',
  'Risk Register',
  'Policy Management',
  'Vendor Assessment',
  'Business Continuity',
];

const FIELD_NAMES = [
  'Record ID', 'Title', 'Description', 'Status', 'Priority',
  'Owner', 'Created Date', 'Due Date', 'Risk Score', 'Impact',
  'Likelihood', 'Control Effectiveness', 'Residual Risk', 'Comments',
  'Attachments', 'Related Records', 'Approval Status', 'Reviewer',
  'Last Modified', 'Category', 'Sub-Category', 'Department',
  'Location', 'Compliance Status', 'Audit Trail',
];

const FIELD_TYPES: FieldType[] = [
  FieldType.Text,
  FieldType.NumericField,
  FieldType.DateField,
  FieldType.ValuesList,
  FieldType.CrossReference,
  FieldType.Attachment,
  FieldType.UsersGroups,
];

const CALCULATION_FORMULAS = [
  'IF([Status]="Open", "Active", "Closed")',
  'DATEDIFF([Due Date], NOW(), "days")',
  '[Impact] * [Likelihood]',
  'IF([Risk Score] > 15, "High", IF([Risk Score] > 8, "Medium", "Low"))',
  'CONCATENATE([First Name], " ", [Last Name])',
  'SUM([Related Records].[Amount])',
  'COUNT([Related Records])',
  'IF(ISBLANK([Owner]), "Unassigned", [Owner])',
  'AVERAGE([Related Records].[Score])',
  'MAX([Related Records].[Date])',
];

function getFieldTypeName(fieldType: FieldType): string {
  const typeNames: Record<FieldType, string> = {
    [FieldType.Text]: 'Text',
    [FieldType.NumericField]: 'Numeric',
    [FieldType.DateField]: 'Date',
    [FieldType.ValuesList]: 'Values List',
    [FieldType.CrossReference]: 'Cross-Reference',
    [FieldType.Attachment]: 'Attachment',
    [FieldType.Image]: 'Image',
    [FieldType.ExternalLinks]: 'External Links',
    [FieldType.UsersGroups]: 'Users/Groups',
    [FieldType.RecordPermissions]: 'Record Permissions',
    [FieldType.TrackingField]: 'Tracking',
    [FieldType.SubForm]: 'Sub-Form',
    [FieldType.RelatedRecords]: 'Related Records',
    [FieldType.History]: 'History Log',
    [FieldType.SchedulerField]: 'Scheduler',
    [FieldType.Matrix]: 'Matrix',
    [FieldType.IPAddress]: 'IP Address',
    [FieldType.CalculatedField]: 'Calculated',
  };
  return typeNames[fieldType] || 'Unknown';
}

interface GenerationOptions {
  isSource: boolean;
  introduceMismatches: boolean;
  introduceFormulaDifferences: boolean;
}

export function generateMockModules(options: GenerationOptions): Module[] {
  return MODULE_NAMES.map((name, index) => ({
    id: index + 1,
    name: options.isSource ? name : name,
    guid: STABLE_GUIDS.modules[index],
    alias: name.replace(/\s+/g, '_'),
    description: `${name} application for GRC management`,
    type: ComparisonType.Module,
    levelId: 100 + index,
    isSubform: index === 4,
    parentModuleId: index === 4 ? 1 : undefined,
    fieldCount: 15 + index * 3,
  }));
}

export function generateMockFields(
  modules: Module[],
  options: GenerationOptions
): { fields: Field[]; calculatedFields: Field[] } {
  const fields: Field[] = [];
  const calculatedFields: Field[] = [];
  let fieldIndex = 0;

  for (const module of modules) {
    const fieldsPerModule = 8 + Math.floor(Math.random() * 5);

    for (let i = 0; i < fieldsPerModule; i++) {
      const isCalculated = i >= fieldsPerModule - 2; // Last 2 fields are calculated
      const fieldType = isCalculated 
        ? FieldType.CalculatedField 
        : FIELD_TYPES[fieldIndex % FIELD_TYPES.length];
      
      // Determine GUID based on whether this is a shared, source-only, or target-only field
      let guid: string;
      if (fieldIndex < SHARED_FIELD_GUIDS.length) {
        guid = SHARED_FIELD_GUIDS[fieldIndex];
      } else if (options.isSource) {
        guid = SOURCE_ONLY_FIELD_GUIDS[fieldIndex % SOURCE_ONLY_FIELD_GUIDS.length] + `-${fieldIndex}`;
      } else {
        guid = TARGET_ONLY_FIELD_GUIDS[fieldIndex % TARGET_ONLY_FIELD_GUIDS.length] + `-${fieldIndex}`;
      }

      const fieldName = FIELD_NAMES[i % FIELD_NAMES.length];
      
      // Introduce mismatches for some fields
      let calculationFormula = isCalculated 
        ? CALCULATION_FORMULAS[i % CALCULATION_FORMULAS.length] 
        : undefined;
      
      // Modify formula for target to create mismatches
      if (isCalculated && !options.isSource && options.introduceFormulaDifferences && i % 3 === 0) {
        calculationFormula = calculationFormula?.replace('IF(', 'IIF(') + ' /* modified */';
      }

      const field: Field = {
        id: fieldIndex + 1,
        name: fieldName,
        guid,
        alias: `${module.alias}_${fieldName.replace(/\s+/g, '_')}`,
        description: `${fieldName} for ${module.name}`,
        type: isCalculated ? ComparisonType.CalculatedField : ComparisonType.Field,
        moduleId: module.id,
        moduleName: module.name,
        moduleGuid: module.guid,
        fieldType,
        fieldTypeName: getFieldTypeName(fieldType),
        isRequired: i < 3,
        isKey: i === 0,
        isCalculated,
        maxLength: fieldType === FieldType.Text ? 500 : undefined,
        defaultValue: undefined,
        relatedValuesListId: fieldType === FieldType.ValuesList ? 1 : undefined,
        relatedValuesListGuid: fieldType === FieldType.ValuesList 
          ? STABLE_GUIDS.valuesLists[0] 
          : undefined,
        calculationFormula,
        calculationReturnType: isCalculated ? 'Text' : undefined,
        calculationSourceFields: isCalculated 
          ? [SHARED_FIELD_GUIDS[0], SHARED_FIELD_GUIDS[1]] 
          : undefined,
      };

      if (isCalculated) {
        calculatedFields.push(field);
      } else {
        fields.push(field);
      }

      fieldIndex++;
    }
  }

  return { fields, calculatedFields };
}

export function generateMockLayouts(modules: Module[], fields: Field[]): Layout[] {
  const layouts: Layout[] = [];

  for (const module of modules) {
    const moduleFields = fields.filter(f => f.moduleId === module.id);
    
    layouts.push({
      id: module.id,
      name: `${module.name} Default Layout`,
      guid: uuidv4(),
      alias: `${module.alias}_default_layout`,
      description: `Default layout for ${module.name}`,
      type: ComparisonType.Layout,
      moduleId: module.id,
      moduleName: module.name,
      moduleGuid: module.guid,
      isDefault: true,
      fieldIds: moduleFields.map(f => f.id),
      fieldGuids: moduleFields.map(f => f.guid),
    });
  }

  return layouts;
}

export function generateMockValuesLists(options: GenerationOptions): ValuesList[] {
  const listNames = [
    'Status', 'Priority', 'Risk Level', 'Department', 'Region',
    'Category', 'Impact Level', 'Likelihood', 'Control Type', 'Frequency',
  ];

  return listNames.map((name, index) => ({
    id: index + 1,
    name: options.isSource || index < 8 ? name : `${name} (Updated)`,
    guid: STABLE_GUIDS.valuesLists[index],
    alias: name.replace(/\s+/g, '_'),
    description: `${name} values list`,
    type: ComparisonType.ValuesList,
    valuesCount: 5 + index,
    isHierarchical: index > 5,
  }));
}

export function generateMockValuesListValues(valuesLists: ValuesList[]): ValuesListValue[] {
  const values: ValuesListValue[] = [];
  let valueId = 1;

  for (const list of valuesLists) {
    const valueNames = ['Low', 'Medium', 'High', 'Critical', 'N/A'];
    
    for (let i = 0; i < Math.min(list.valuesCount, 5); i++) {
      values.push({
        id: valueId++,
        name: valueNames[i],
        guid: uuidv4(),
        type: ComparisonType.ValuesListValue,
        valuesListId: list.id,
        valuesListGuid: list.guid,
        valuesListName: list.name,
        numericValue: i + 1,
        sortOrder: i,
        isSelectable: true,
      });
    }
  }

  return values;
}

export function generateMockDDERules(modules: Module[], options: GenerationOptions): DDERule[] {
  const rules: DDERule[] = [];
  let ruleIndex = 0;

  for (const module of modules) {
    const rulesPerModule = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < rulesPerModule; i++) {
      rules.push({
        id: ruleIndex + 1,
        name: `${module.name} Rule ${i + 1}`,
        guid: STABLE_GUIDS.ddeRules[ruleIndex % STABLE_GUIDS.ddeRules.length],
        alias: `${module.alias}_rule_${i + 1}`,
        description: `Data driven event rule for ${module.name}`,
        type: ComparisonType.DDERule,
        moduleId: module.id,
        moduleName: module.name,
        moduleGuid: module.guid,
        isEnabled: options.isSource || i % 2 === 0,
        triggerType: i % 2 === 0 ? 'OnSave' : 'OnCreate',
        conditionLogic: `[Status] = "Active"`,
        actionsCount: 1 + i,
      });
      ruleIndex++;
    }
  }

  return rules;
}

export function generateMockDDEActions(rules: DDERule[]): DDEAction[] {
  const actions: DDEAction[] = [];
  let actionIndex = 0;

  for (const rule of rules) {
    for (let i = 0; i < rule.actionsCount; i++) {
      actions.push({
        id: actionIndex + 1,
        name: `${rule.name} Action ${i + 1}`,
        guid: STABLE_GUIDS.ddeActions[actionIndex % STABLE_GUIDS.ddeActions.length],
        alias: `${rule.alias}_action_${i + 1}`,
        description: `Action for ${rule.name}`,
        type: ComparisonType.DDEAction,
        ruleId: rule.id,
        ruleGuid: rule.guid,
        ruleName: rule.name,
        actionType: i % 2 === 0 ? 'SetFieldValue' : 'SendNotification',
        order: i,
      });
      actionIndex++;
    }
  }

  return actions;
}

export function generateMockReports(modules: Module[]): Report[] {
  const reports: Report[] = [];
  let reportIndex = 0;

  for (const module of modules) {
    reports.push({
      id: reportIndex + 1,
      name: `${module.name} Summary Report`,
      guid: uuidv4(),
      alias: `${module.alias}_summary_report`,
      description: `Summary report for ${module.name}`,
      type: ComparisonType.Report,
      reportType: ReportType.Statistical,
      moduleId: module.id,
      moduleName: module.name,
      moduleGuid: module.guid,
      isShared: true,
      owner: 'admin',
    });
    reportIndex++;
  }

  return reports;
}

export function generateMockDashboards(): Dashboard[] {
  return [
    {
      id: 1,
      name: 'Executive Dashboard',
      guid: uuidv4(),
      alias: 'executive_dashboard',
      description: 'Executive summary dashboard',
      type: ComparisonType.Dashboard,
      iViewsCount: 5,
      iViewGuids: [],
      isShared: true,
      owner: 'admin',
    },
    {
      id: 2,
      name: 'Risk Overview',
      guid: uuidv4(),
      alias: 'risk_overview',
      description: 'Risk management overview',
      type: ComparisonType.Dashboard,
      iViewsCount: 3,
      iViewGuids: [],
      isShared: true,
      owner: 'admin',
    },
  ];
}

export function generateMockWorkspaces(): Workspace[] {
  return [
    {
      id: 1,
      name: 'GRC Workspace',
      guid: uuidv4(),
      alias: 'grc_workspace',
      description: 'Main GRC workspace',
      type: ComparisonType.Workspace,
      dashboardsCount: 2,
      dashboardGuids: [],
      order: 1,
    },
  ];
}

export function generateMockIViews(): IView[] {
  return [
    {
      id: 1,
      name: 'Risk Heat Map',
      guid: uuidv4(),
      alias: 'risk_heat_map',
      description: 'Visual risk heat map',
      type: ComparisonType.IView,
      iViewType: 'Chart',
    },
    {
      id: 2,
      name: 'Incident Trend',
      guid: uuidv4(),
      alias: 'incident_trend',
      description: 'Incident trend over time',
      type: ComparisonType.IView,
      iViewType: 'LineChart',
    },
  ];
}

export function generateMockRoles(): Role[] {
  return [
    {
      id: 1,
      name: 'Administrator',
      guid: uuidv4(),
      alias: 'administrator',
      description: 'Full system access',
      type: ComparisonType.Role,
      usersCount: 3,
      groupsCount: 1,
      isSystemRole: true,
      permissionGuids: [],
    },
    {
      id: 2,
      name: 'Risk Manager',
      guid: uuidv4(),
      alias: 'risk_manager',
      description: 'Risk management access',
      type: ComparisonType.Role,
      usersCount: 10,
      groupsCount: 2,
      isSystemRole: false,
      permissionGuids: [],
    },
    {
      id: 3,
      name: 'Auditor',
      guid: uuidv4(),
      alias: 'auditor',
      description: 'Read-only audit access',
      type: ComparisonType.Role,
      usersCount: 5,
      groupsCount: 1,
      isSystemRole: false,
      permissionGuids: [],
    },
  ];
}

export function generateMockSecurityParameters(): SecurityParameter[] {
  return [
    {
      id: 1,
      name: 'Record-Level Security',
      guid: uuidv4(),
      alias: 'record_level_security',
      description: 'Record-level access control',
      type: ComparisonType.SecurityParameter,
      securityType: 'RecordPermissions',
    },
  ];
}

export function generateMockNotifications(modules: Module[]): Notification[] {
  const notifications: Notification[] = [];

  for (const module of modules.slice(0, 3)) {
    notifications.push({
      id: module.id,
      name: `${module.name} Alert`,
      guid: uuidv4(),
      alias: `${module.alias}_alert`,
      description: `Alert notification for ${module.name}`,
      type: ComparisonType.Notification,
      moduleId: module.id,
      moduleName: module.name,
      moduleGuid: module.guid,
      isEnabled: true,
      triggerType: 'OnCreate',
    });
  }

  return notifications;
}

export function generateMockDataFeeds(modules: Module[]): DataFeed[] {
  return [
    {
      id: 1,
      name: 'Vulnerability Import',
      guid: uuidv4(),
      alias: 'vulnerability_import',
      description: 'Import vulnerability data',
      type: ComparisonType.DataFeed,
      feedType: 'Import',
      targetModuleId: modules[0].id,
      targetModuleName: modules[0].name,
      targetModuleGuid: modules[0].guid,
      isEnabled: true,
      schedule: 'Daily at 2:00 AM',
    },
  ];
}

export function generateMockSchedules(): Schedule[] {
  return [
    {
      id: 1,
      name: 'Daily Report Schedule',
      guid: uuidv4(),
      alias: 'daily_report',
      description: 'Daily report generation',
      type: ComparisonType.Schedule,
      scheduleType: 'Report',
      frequency: 'Daily',
      cronExpression: '0 6 * * *',
      isEnabled: true,
      lastRunDate: new Date().toISOString(),
      nextRunDate: new Date(Date.now() + 86400000).toISOString(),
    },
  ];
}

/**
 * Generate complete mock metadata for an environment
 */
export function generateMockMetadata(
  environment: ArcherEnvironment,
  options: GenerationOptions
): CollectedMetadata {
  const modules = generateMockModules(options);
  const { fields, calculatedFields } = generateMockFields(modules, options);
  const layouts = generateMockLayouts(modules, fields);
  const valuesLists = generateMockValuesLists(options);
  const valuesListValues = generateMockValuesListValues(valuesLists);
  const ddeRules = generateMockDDERules(modules, options);
  const ddeActions = generateMockDDEActions(ddeRules);
  const reports = generateMockReports(modules);
  const dashboards = generateMockDashboards();
  const workspaces = generateMockWorkspaces();
  const iViews = generateMockIViews();
  const roles = generateMockRoles();
  const securityParameters = generateMockSecurityParameters();
  const notifications = generateMockNotifications(modules);
  const dataFeeds = generateMockDataFeeds(modules);
  const schedules = generateMockSchedules();

  return {
    environment,
    collectedAt: new Date().toISOString(),
    modules,
    fields,
    calculatedFields,
    layouts,
    valuesLists,
    valuesListValues,
    ddeRules,
    ddeActions,
    reports,
    dashboards,
    workspaces,
    iViews,
    roles,
    securityParameters,
    notifications,
    dataFeeds,
    schedules,
  };
}
