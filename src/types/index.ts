// ==========================================
// Archer Comparison Tool - Core Types
// GUID-Based Matching with CSV Comparison
// ==========================================

import { v4 as uuidv4 } from 'uuid';

// Enums
export enum ComparisonType {
  Module = 'Module',
  Field = 'Field',
  CalculatedField = 'CalculatedField',
  Layout = 'Layout',
  ValuesList = 'ValuesList',
  ValuesListValue = 'ValuesListValue',
  DDERule = 'DDERule',
  DDEAction = 'DDEAction',
  Report = 'Report',
  Dashboard = 'Dashboard',
  Workspace = 'Workspace',
  IView = 'iView',
  Role = 'Role',
  SecurityParameter = 'SecurityParameter',
  Notification = 'Notification',
  DataFeed = 'DataFeed',
  Schedule = 'Schedule',
}

export enum ComparisonStatus {
  Match = 'Match',
  Mismatch = 'Mismatch',
  MissingInSource = 'MissingInSource',
  MissingInTarget = 'MissingInTarget',
}

export enum Severity {
  Info = 'Info',
  Warning = 'Warning',
  Critical = 'Critical',
}

export enum FieldType {
  Text = 1,
  NumericField = 2,
  DateField = 3,
  ValuesList = 4,
  CrossReference = 5,
  Attachment = 6,
  Image = 7,
  ExternalLinks = 8,
  UsersGroups = 9,
  RecordPermissions = 10,
  TrackingField = 11,
  SubForm = 12,
  RelatedRecords = 13,
  History = 14,
  SchedulerField = 15,
  Matrix = 16,
  IPAddress = 17,
  CalculatedField = 21,
}

export enum ReportType {
  Statistical = 'Statistical',
  CardReport = 'CardReport',
  RecordSearch = 'RecordSearch',
  QuickSearch = 'QuickSearch',
}

// Environment
export interface ArcherEnvironment {
  id: string;
  displayName: string;
  baseUrl: string;
  instanceName: string;
  username: string;
  encryptedPassword: string;
}

// Base Metadata Interface - GUID is the primary identifier
export interface BaseMetadata {
  id: number;
  name: string;
  guid: string; // PRIMARY IDENTIFIER for matching across environments
  alias?: string;
  description?: string;
}

// Module
export interface Module extends BaseMetadata {
  type: ComparisonType.Module;
  levelId: number;
  isSubform: boolean;
  parentModuleId?: number;
  fieldCount: number;
}

// Field - Base field with calculated field support
export interface Field extends BaseMetadata {
  type: ComparisonType.Field | ComparisonType.CalculatedField;
  moduleId: number;
  moduleName: string;
  moduleGuid: string;
  fieldType: FieldType;
  fieldTypeName: string;
  isRequired: boolean;
  isKey: boolean;
  isCalculated: boolean;
  maxLength?: number;
  defaultValue?: string;
  relatedValuesListId?: number;
  relatedValuesListGuid?: string;
  // Calculated Field specific properties
  calculationFormula?: string; // The actual calculation text/formula
  calculationReturnType?: string;
  calculationSourceFields?: string[]; // GUIDs of fields used in calculation
}

// Layout
export interface Layout extends BaseMetadata {
  type: ComparisonType.Layout;
  moduleId: number;
  moduleName: string;
  moduleGuid: string;
  isDefault: boolean;
  fieldIds: number[];
  fieldGuids: string[];
}

// Values List
export interface ValuesList extends BaseMetadata {
  type: ComparisonType.ValuesList;
  valuesCount: number;
  isHierarchical: boolean;
}

// Values List Value
export interface ValuesListValue extends BaseMetadata {
  type: ComparisonType.ValuesListValue;
  valuesListId: number;
  valuesListGuid: string;
  valuesListName: string;
  numericValue: number;
  sortOrder: number;
  parentValueId?: number;
  parentValueGuid?: string;
  isSelectable: boolean;
}

// DDE Rule
export interface DDERule extends BaseMetadata {
  type: ComparisonType.DDERule;
  moduleId: number;
  moduleName: string;
  moduleGuid: string;
  isEnabled: boolean;
  triggerType: string;
  triggerFieldGuid?: string;
  conditionLogic?: string;
  actionsCount: number;
}

// DDE Action
export interface DDEAction extends BaseMetadata {
  type: ComparisonType.DDEAction;
  ruleId: number;
  ruleGuid: string;
  ruleName: string;
  actionType: string;
  targetFieldGuid?: string;
  setValue?: string;
  order: number;
}

// Report
export interface Report extends BaseMetadata {
  type: ComparisonType.Report;
  reportType: ReportType;
  moduleId?: number;
  moduleName?: string;
  moduleGuid?: string;
  isShared: boolean;
  owner: string;
  filterCriteria?: string;
  sortOrder?: string;
}

// Dashboard
export interface Dashboard extends BaseMetadata {
  type: ComparisonType.Dashboard;
  iViewsCount: number;
  iViewGuids: string[];
  isShared: boolean;
  owner: string;
}

// Workspace
export interface Workspace extends BaseMetadata {
  type: ComparisonType.Workspace;
  dashboardsCount: number;
  dashboardGuids: string[];
  order: number;
}

// iView
export interface IView extends BaseMetadata {
  type: ComparisonType.IView;
  iViewType: string;
  reportId?: number;
  reportGuid?: string;
  reportName?: string;
}

// Role
export interface Role extends BaseMetadata {
  type: ComparisonType.Role;
  usersCount: number;
  groupsCount: number;
  isSystemRole: boolean;
  permissionGuids: string[];
}

// Security Parameter
export interface SecurityParameter extends BaseMetadata {
  type: ComparisonType.SecurityParameter;
  securityType: string;
  moduleId?: number;
  moduleName?: string;
  moduleGuid?: string;
}

// Notification
export interface Notification extends BaseMetadata {
  type: ComparisonType.Notification;
  moduleId: number;
  moduleName: string;
  moduleGuid: string;
  isEnabled: boolean;
  triggerType: string;
  templateContent?: string;
}

// Data Feed
export interface DataFeed extends BaseMetadata {
  type: ComparisonType.DataFeed;
  feedType: string;
  targetModuleId: number;
  targetModuleName: string;
  targetModuleGuid: string;
  isEnabled: boolean;
  schedule?: string;
  fieldMappings?: string;
}

// Schedule
export interface Schedule extends BaseMetadata {
  type: ComparisonType.Schedule;
  scheduleType: string;
  frequency: string;
  cronExpression?: string;
  isEnabled: boolean;
  lastRunDate?: string;
  nextRunDate?: string;
}

// Union Type for all metadata
export type MetadataItem = 
  | Module 
  | Field 
  | Layout 
  | ValuesList 
  | ValuesListValue 
  | DDERule 
  | DDEAction 
  | Report 
  | Dashboard 
  | Workspace 
  | IView 
  | Role 
  | SecurityParameter 
  | Notification 
  | DataFeed 
  | Schedule;

// Property Difference for detailed mismatch tracking
export interface PropertyDifference {
  propertyName: string;
  sourceValue: string;
  targetValue: string;
  isCalculationDifference?: boolean;
}

// Comparison Result - Enhanced with GUID matching
export interface ComparisonResult {
  id: string;
  comparisonType: ComparisonType;
  itemName: string;
  itemGuid: string; // The GUID used for matching
  parentName?: string;
  parentGuid?: string;
  status: ComparisonStatus;
  severity: Severity;
  sourceItem?: MetadataItem;
  targetItem?: MetadataItem;
  propertyDifferences?: PropertyDifference[]; // Detailed differences for mismatches
  csvSourceRow?: string; // CSV representation for verification
  csvTargetRow?: string;
}

// Categorized Results for UI Display
export interface CategorizedResults {
  calculatedFields: ComparisonResult[];
  fields: ComparisonResult[];
  modules: ComparisonResult[];
  layouts: ComparisonResult[];
  valuesLists: ComparisonResult[];
  valuesListValues: ComparisonResult[];
  ddeRules: ComparisonResult[];
  ddeActions: ComparisonResult[];
  reports: ComparisonResult[];
  dashboards: ComparisonResult[];
  workspaces: ComparisonResult[];
  iViews: ComparisonResult[];
  roles: ComparisonResult[];
  securityParameters: ComparisonResult[];
  notifications: ComparisonResult[];
  dataFeeds: ComparisonResult[];
  schedules: ComparisonResult[];
}

// Collection Options
export interface CollectionOptions {
  includeModules: boolean;
  includeFields: boolean;
  includeCalculatedFields: boolean;
  includeLayouts: boolean;
  includeValuesLists: boolean;
  includeValuesListValues: boolean;
  includeDDERules: boolean;
  includeDDEActions: boolean;
  includeReports: boolean;
  includeDashboards: boolean;
  includeWorkspaces: boolean;
  includeIViews: boolean;
  includeRoles: boolean;
  includeSecurityParameters: boolean;
  includeNotifications: boolean;
  includeDataFeeds: boolean;
  includeSchedules: boolean;
  selectedModuleIds: number[];
  selectedModuleGuids: string[];
}

// Collected Metadata
export interface CollectedMetadata {
  environment: ArcherEnvironment;
  collectedAt: string;
  modules: Module[];
  fields: Field[];
  calculatedFields: Field[];
  layouts: Layout[];
  valuesLists: ValuesList[];
  valuesListValues: ValuesListValue[];
  ddeRules: DDERule[];
  ddeActions: DDEAction[];
  reports: Report[];
  dashboards: Dashboard[];
  workspaces: Workspace[];
  iViews: IView[];
  roles: Role[];
  securityParameters: SecurityParameter[];
  notifications: Notification[];
  dataFeeds: DataFeed[];
  schedules: Schedule[];
}

// CSV Export Row for comparison verification
export interface CSVRow {
  guid: string;
  type: ComparisonType;
  name: string;
  properties: string; // JSON stringified properties
  calculationFormula?: string;
}

// Comparison Summary
export interface ComparisonSummary {
  totalItems: number;
  matchedCount: number;
  mismatchedCount: number;
  missingInSourceCount: number;
  missingInTargetCount: number;
  calculatedFieldStats: {
    matched: number;
    mismatched: number;
    formulaDifferences: number;
  };
  byType: Record<ComparisonType, {
    total: number;
    matched: number;
    mismatched: number;
    missingInSource: number;
    missingInTarget: number;
  }>;
}

// Tab Results for UI
export interface TabResults {
  matched: CategorizedResults;
  mismatched: CategorizedResults;
  notInSource: CategorizedResults;
  notInTarget: CategorizedResults;
}

// Helper function to create new environment
export function createEnvironment(data: Omit<ArcherEnvironment, 'id'>): ArcherEnvironment {
  return {
    id: uuidv4(),
    ...data,
  };
}

// Default collection options
export function getDefaultCollectionOptions(): CollectionOptions {
  return {
    includeModules: true,
    includeFields: true,
    includeCalculatedFields: true,
    includeLayouts: true,
    includeValuesLists: true,
    includeValuesListValues: false,
    includeDDERules: true,
    includeDDEActions: true,
    includeReports: true,
    includeDashboards: true,
    includeWorkspaces: true,
    includeIViews: true,
    includeRoles: true,
    includeSecurityParameters: true,
    includeNotifications: true,
    includeDataFeeds: true,
    includeSchedules: true,
    selectedModuleIds: [],
    selectedModuleGuids: [],
  };
}

// Create empty categorized results
export function createEmptyCategorizedResults(): CategorizedResults {
  return {
    calculatedFields: [],
    fields: [],
    modules: [],
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
}

// Create empty tab results
export function createEmptyTabResults(): TabResults {
  return {
    matched: createEmptyCategorizedResults(),
    mismatched: createEmptyCategorizedResults(),
    notInSource: createEmptyCategorizedResults(),
    notInTarget: createEmptyCategorizedResults(),
  };
}
