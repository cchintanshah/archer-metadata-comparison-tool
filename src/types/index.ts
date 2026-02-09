// ==========================================
// Archer Comparison Tool - Core Types
// ==========================================

import { v4 as uuidv4 } from 'uuid';

// Enums
export enum ComparisonType {
  Module = 'Module',
  Field = 'Field',
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
  Text = 'Text',
  NumericField = 'NumericField',
  DateField = 'DateField',
  ValuesList = 'ValuesList',
  CrossReference = 'CrossReference',
  Attachment = 'Attachment',
  Image = 'Image',
  ExternalLinks = 'ExternalLinks',
  UsersGroups = 'UsersGroups',
  RecordPermissions = 'RecordPermissions',
  TrackingField = 'TrackingField',
  SubForm = 'SubForm',
  RelatedRecords = 'RelatedRecords',
  History = 'History',
  SchedulerField = 'SchedulerField',
  Matrix = 'Matrix',
  IPAddress = 'IPAddress',
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

// Base Metadata Interface
export interface BaseMetadata {
  id: number;
  name: string;
  guid: string;
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

// Field
export interface Field extends BaseMetadata {
  type: ComparisonType.Field;
  moduleId: number;
  moduleName: string;
  fieldType: FieldType;
  isRequired: boolean;
  isKey: boolean;
  isCalculated: boolean;
  maxLength?: number;
  defaultValue?: string;
  relatedValuesListId?: number;
}

// Layout
export interface Layout extends BaseMetadata {
  type: ComparisonType.Layout;
  moduleId: number;
  moduleName: string;
  isDefault: boolean;
  fieldIds: number[];
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
  valuesListName: string;
  numericValue: number;
  sortOrder: number;
  parentValueId?: number;
  isSelectable: boolean;
}

// DDE Rule
export interface DDERule extends BaseMetadata {
  type: ComparisonType.DDERule;
  moduleId: number;
  moduleName: string;
  isEnabled: boolean;
  triggerType: string;
  actionsCount: number;
}

// DDE Action
export interface DDEAction extends BaseMetadata {
  type: ComparisonType.DDEAction;
  ruleId: number;
  ruleName: string;
  actionType: string;
  order: number;
}

// Report
export interface Report extends BaseMetadata {
  type: ComparisonType.Report;
  reportType: ReportType;
  moduleId?: number;
  moduleName?: string;
  isShared: boolean;
  owner: string;
}

// Dashboard
export interface Dashboard extends BaseMetadata {
  type: ComparisonType.Dashboard;
  iViewsCount: number;
  isShared: boolean;
  owner: string;
}

// Workspace
export interface Workspace extends BaseMetadata {
  type: ComparisonType.Workspace;
  dashboardsCount: number;
  order: number;
}

// iView
export interface IView extends BaseMetadata {
  type: ComparisonType.IView;
  iViewType: string;
  reportId?: number;
  reportName?: string;
}

// Role
export interface Role extends BaseMetadata {
  type: ComparisonType.Role;
  usersCount: number;
  groupsCount: number;
  isSystemRole: boolean;
}

// Security Parameter
export interface SecurityParameter extends BaseMetadata {
  type: ComparisonType.SecurityParameter;
  securityType: string;
  moduleId?: number;
  moduleName?: string;
}

// Notification
export interface Notification extends BaseMetadata {
  type: ComparisonType.Notification;
  moduleId: number;
  moduleName: string;
  isEnabled: boolean;
  triggerType: string;
}

// Data Feed
export interface DataFeed extends BaseMetadata {
  type: ComparisonType.DataFeed;
  feedType: string;
  targetModuleId: number;
  targetModuleName: string;
  isEnabled: boolean;
  schedule?: string;
}

// Schedule
export interface Schedule extends BaseMetadata {
  type: ComparisonType.Schedule;
  scheduleType: string;
  frequency: string;
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

// Comparison Result
export interface ComparisonResult {
  id: string;
  comparisonType: ComparisonType;
  itemName: string;
  itemIdentifier: string;
  parentName?: string;
  propertyName?: string;
  sourceValue?: string;
  targetValue?: string;
  status: ComparisonStatus;
  severity: Severity;
  sourceItem?: MetadataItem;
  targetItem?: MetadataItem;
}

// Collection Options
export interface CollectionOptions {
  includeModules: boolean;
  includeFields: boolean;
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
}

// Collected Metadata
export interface CollectedMetadata {
  environment: ArcherEnvironment;
  modules: Module[];
  fields: Field[];
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

// Comparison Summary
export interface ComparisonSummary {
  totalItems: number;
  matchedCount: number;
  mismatchedCount: number;
  missingInSourceCount: number;
  missingInTargetCount: number;
  byType: Record<ComparisonType, {
    total: number;
    matched: number;
    mismatched: number;
    missingInSource: number;
    missingInTarget: number;
  }>;
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
    includeLayouts: true,
    includeValuesLists: true,
    includeValuesListValues: false,
    includeDDERules: true,
    includeDDEActions: false,
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
  };
}
