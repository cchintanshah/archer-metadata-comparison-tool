# Archer Comparison Tool - .NET Backend Setup Guide

This guide walks you through setting up the .NET 8.0 Web API backend in Visual Studio to work with the React frontend.

## Prerequisites

- **Visual Studio 2022** (version 17.8 or later)
- **.NET 8.0 SDK**
- **SQL Server** (optional, for persistent storage)

---

## Step 1: Create the Solution in Visual Studio

1. Open **Visual Studio 2022**
2. Click **"Create a new project"**
3. Search for and select **"Blank Solution"**
4. Name it: `ArcherComparisonTool`
5. Choose a location and click **Create**

---

## Step 2: Add Projects to the Solution

### 2.1 Add Core Class Library

1. Right-click the solution → **Add** → **New Project**
2. Select **"Class Library"** (.NET 8.0)
3. Name: `ArcherComparisonTool.Core`
4. Click **Create**

### 2.2 Add Web API Project

1. Right-click the solution → **Add** → **New Project**
2. Select **"ASP.NET Core Web API"**
3. Name: `ArcherComparisonTool.Api`
4. Framework: **.NET 8.0**
5. Check **"Configure for HTTPS"**
6. Check **"Enable OpenAPI support"**
7. Click **Create**

### 2.3 Set Project Dependencies

1. Right-click `ArcherComparisonTool.Api` → **Add** → **Project Reference**
2. Check `ArcherComparisonTool.Core`
3. Click **OK**

---

## Step 3: Install NuGet Packages

### For ArcherComparisonTool.Core:
```
Install-Package EPPlus
Install-Package Serilog
Install-Package Serilog.Sinks.File
Install-Package Newtonsoft.Json
```

### For ArcherComparisonTool.Api:
```
Install-Package Serilog.AspNetCore
Install-Package Swashbuckle.AspNetCore
Install-Package Microsoft.AspNetCore.Cors
```

---

## Step 4: Create Core Project Files

Create the following folder structure in `ArcherComparisonTool.Core`:

```
ArcherComparisonTool.Core/
├── Models/
│   ├── ArcherEnvironment.cs
│   ├── Metadata/
│   │   ├── BaseMetadata.cs
│   │   ├── Module.cs
│   │   ├── Field.cs
│   │   ├── Layout.cs
│   │   ├── ValuesList.cs
│   │   ├── ValuesListValue.cs
│   │   ├── DDERule.cs
│   │   ├── DDEAction.cs
│   │   ├── Report.cs
│   │   ├── Dashboard.cs
│   │   ├── Workspace.cs
│   │   ├── IView.cs
│   │   ├── Role.cs
│   │   ├── SecurityParameter.cs
│   │   ├── Notification.cs
│   │   ├── DataFeed.cs
│   │   └── Schedule.cs
│   ├── CollectionOptions.cs
│   ├── CollectedMetadata.cs
│   ├── ComparisonResult.cs
│   └── ComparisonSummary.cs
├── Enums/
│   ├── ComparisonType.cs
│   ├── ComparisonStatus.cs
│   ├── Severity.cs
│   ├── FieldType.cs
│   └── ReportType.cs
├── Interfaces/
│   ├── IMetadataService.cs
│   ├── IComparisonEngine.cs
│   └── IExcelExporter.cs
└── Services/
    ├── ArcherApiClient.cs
    ├── MockMetadataService.cs
    ├── MetadataCollector.cs
    ├── ComparisonEngine.cs
    ├── ExcelExporter.cs
    └── EncryptionService.cs
```

---

## Step 5: Core Model Files

### Models/ArcherEnvironment.cs
```csharp
using System;

namespace ArcherComparisonTool.Core.Models
{
    public class ArcherEnvironment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string DisplayName { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = string.Empty;
        public string InstanceName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string EncryptedPassword { get; set; } = string.Empty;
    }
}
```

### Models/Metadata/BaseMetadata.cs
```csharp
namespace ArcherComparisonTool.Core.Models.Metadata
{
    public abstract class BaseMetadata
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid Guid { get; set; } = Guid.NewGuid();
        public string? Alias { get; set; }
        public string? Description { get; set; }
    }
}
```

### Models/Metadata/Module.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Module : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Module;
        public int LevelId { get; set; }
        public bool IsSubform { get; set; }
        public int? ParentModuleId { get; set; }
        public int FieldCount { get; set; }
    }
}
```

### Models/Metadata/Field.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Field : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Field;
        public int ModuleId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public FieldType FieldType { get; set; }
        public bool IsRequired { get; set; }
        public bool IsKey { get; set; }
        public bool IsCalculated { get; set; }
        public int? MaxLength { get; set; }
        public string? DefaultValue { get; set; }
        public int? RelatedValuesListId { get; set; }
    }
}
```

### Models/Metadata/Layout.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Layout : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Layout;
        public int ModuleId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public List<int> FieldIds { get; set; } = new();
    }
}
```

### Models/Metadata/ValuesList.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class ValuesList : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.ValuesList;
        public int ValuesCount { get; set; }
        public bool IsHierarchical { get; set; }
    }
}
```

### Models/Metadata/ValuesListValue.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class ValuesListValue : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.ValuesListValue;
        public int ValuesListId { get; set; }
        public string ValuesListName { get; set; } = string.Empty;
        public int NumericValue { get; set; }
        public int SortOrder { get; set; }
        public int? ParentValueId { get; set; }
        public bool IsSelectable { get; set; }
    }
}
```

### Models/Metadata/DDERule.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class DDERule : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.DDERule;
        public int ModuleId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public string TriggerType { get; set; } = string.Empty;
        public int ActionsCount { get; set; }
    }
}
```

### Models/Metadata/DDEAction.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class DDEAction : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.DDEAction;
        public int RuleId { get; set; }
        public string RuleName { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public int Order { get; set; }
    }
}
```

### Models/Metadata/Report.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Report : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Report;
        public ReportType ReportType { get; set; }
        public int? ModuleId { get; set; }
        public string? ModuleName { get; set; }
        public bool IsShared { get; set; }
        public string Owner { get; set; } = string.Empty;
    }
}
```

### Models/Metadata/Dashboard.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Dashboard : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Dashboard;
        public int IViewsCount { get; set; }
        public bool IsShared { get; set; }
        public string Owner { get; set; } = string.Empty;
    }
}
```

### Models/Metadata/Workspace.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Workspace : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Workspace;
        public int DashboardsCount { get; set; }
        public int Order { get; set; }
    }
}
```

### Models/Metadata/IView.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class IView : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.IView;
        public string IViewType { get; set; } = string.Empty;
        public int? ReportId { get; set; }
        public string? ReportName { get; set; }
    }
}
```

### Models/Metadata/Role.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Role : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Role;
        public int UsersCount { get; set; }
        public int GroupsCount { get; set; }
        public bool IsSystemRole { get; set; }
    }
}
```

### Models/Metadata/SecurityParameter.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class SecurityParameter : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.SecurityParameter;
        public string SecurityType { get; set; } = string.Empty;
        public int? ModuleId { get; set; }
        public string? ModuleName { get; set; }
    }
}
```

### Models/Metadata/Notification.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Notification : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Notification;
        public int ModuleId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public string TriggerType { get; set; } = string.Empty;
    }
}
```

### Models/Metadata/DataFeed.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class DataFeed : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.DataFeed;
        public string FeedType { get; set; } = string.Empty;
        public int TargetModuleId { get; set; }
        public string TargetModuleName { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public string? Schedule { get; set; }
    }
}
```

### Models/Metadata/Schedule.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata
{
    public class Schedule : BaseMetadata
    {
        public ComparisonType Type => ComparisonType.Schedule;
        public string ScheduleType { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public DateTime? LastRunDate { get; set; }
        public DateTime? NextRunDate { get; set; }
    }
}
```

---

## Step 6: Enums

### Enums/ComparisonType.cs
```csharp
namespace ArcherComparisonTool.Core.Enums
{
    public enum ComparisonType
    {
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
        Schedule
    }
}
```

### Enums/ComparisonStatus.cs
```csharp
namespace ArcherComparisonTool.Core.Enums
{
    public enum ComparisonStatus
    {
        Match,
        Mismatch,
        MissingInSource,
        MissingInTarget
    }
}
```

### Enums/Severity.cs
```csharp
namespace ArcherComparisonTool.Core.Enums
{
    public enum Severity
    {
        Info,
        Warning,
        Critical
    }
}
```

### Enums/FieldType.cs
```csharp
namespace ArcherComparisonTool.Core.Enums
{
    public enum FieldType
    {
        Text,
        NumericField,
        DateField,
        ValuesList,
        CrossReference,
        Attachment,
        Image,
        ExternalLinks,
        UsersGroups,
        RecordPermissions,
        TrackingField,
        SubForm,
        RelatedRecords,
        History,
        SchedulerField,
        Matrix,
        IPAddress
    }
}
```

### Enums/ReportType.cs
```csharp
namespace ArcherComparisonTool.Core.Enums
{
    public enum ReportType
    {
        Statistical,
        CardReport,
        RecordSearch,
        QuickSearch
    }
}
```

---

## Step 7: Collection & Comparison Models

### Models/CollectionOptions.cs
```csharp
namespace ArcherComparisonTool.Core.Models
{
    public class CollectionOptions
    {
        public bool IncludeModules { get; set; } = true;
        public bool IncludeFields { get; set; } = true;
        public bool IncludeLayouts { get; set; } = true;
        public bool IncludeValuesLists { get; set; } = true;
        public bool IncludeValuesListValues { get; set; } = false;
        public bool IncludeDDERules { get; set; } = true;
        public bool IncludeDDEActions { get; set; } = false;
        public bool IncludeReports { get; set; } = true;
        public bool IncludeDashboards { get; set; } = true;
        public bool IncludeWorkspaces { get; set; } = true;
        public bool IncludeIViews { get; set; } = true;
        public bool IncludeRoles { get; set; } = true;
        public bool IncludeSecurityParameters { get; set; } = true;
        public bool IncludeNotifications { get; set; } = true;
        public bool IncludeDataFeeds { get; set; } = true;
        public bool IncludeSchedules { get; set; } = true;
        public List<int> SelectedModuleIds { get; set; } = new();
    }
}
```

### Models/CollectedMetadata.cs
```csharp
using ArcherComparisonTool.Core.Models.Metadata;

namespace ArcherComparisonTool.Core.Models
{
    public class CollectedMetadata
    {
        public ArcherEnvironment Environment { get; set; } = new();
        public List<Module> Modules { get; set; } = new();
        public List<Field> Fields { get; set; } = new();
        public List<Layout> Layouts { get; set; } = new();
        public List<ValuesList> ValuesLists { get; set; } = new();
        public List<ValuesListValue> ValuesListValues { get; set; } = new();
        public List<DDERule> DDERules { get; set; } = new();
        public List<DDEAction> DDEActions { get; set; } = new();
        public List<Report> Reports { get; set; } = new();
        public List<Dashboard> Dashboards { get; set; } = new();
        public List<Workspace> Workspaces { get; set; } = new();
        public List<IView> IViews { get; set; } = new();
        public List<Role> Roles { get; set; } = new();
        public List<SecurityParameter> SecurityParameters { get; set; } = new();
        public List<Notification> Notifications { get; set; } = new();
        public List<DataFeed> DataFeeds { get; set; } = new();
        public List<Schedule> Schedules { get; set; } = new();
    }
}
```

### Models/ComparisonResult.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models
{
    public class ComparisonResult
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public ComparisonType ComparisonType { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string ItemIdentifier { get; set; } = string.Empty;
        public string? ParentName { get; set; }
        public string? PropertyName { get; set; }
        public string? SourceValue { get; set; }
        public string? TargetValue { get; set; }
        public ComparisonStatus Status { get; set; }
        public Severity Severity { get; set; }
    }
}
```

### Models/ComparisonSummary.cs
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models
{
    public class ComparisonSummary
    {
        public int TotalItems { get; set; }
        public int MatchedCount { get; set; }
        public int MismatchedCount { get; set; }
        public int MissingInSourceCount { get; set; }
        public int MissingInTargetCount { get; set; }
        public Dictionary<ComparisonType, TypeSummary> ByType { get; set; } = new();
    }

    public class TypeSummary
    {
        public int Total { get; set; }
        public int Matched { get; set; }
        public int Mismatched { get; set; }
        public int MissingInSource { get; set; }
        public int MissingInTarget { get; set; }
    }
}
```

---

## Step 8: Services

### Services/ComparisonEngine.cs
```csharp
using ArcherComparisonTool.Core.Enums;
using ArcherComparisonTool.Core.Models;
using ArcherComparisonTool.Core.Models.Metadata;
using System.Reflection;

namespace ArcherComparisonTool.Core.Services
{
    public interface IComparisonEngine
    {
        List<ComparisonResult> Compare(CollectedMetadata source, CollectedMetadata target);
        ComparisonSummary GenerateSummary(List<ComparisonResult> results);
    }

    public class ComparisonEngine : IComparisonEngine
    {
        private static readonly HashSet<string> ExcludedProperties = new()
        {
            "Id", "Guid", "ModuleId", "ValuesListId", "RuleId", "ReportId",
            "LevelId", "ParentModuleId", "ParentValueId", "RelatedValuesListId",
            "TargetModuleId", "FieldIds", "Type"
        };

        public List<ComparisonResult> Compare(CollectedMetadata source, CollectedMetadata target)
        {
            var results = new List<ComparisonResult>();

            results.AddRange(CompareItems(source.Modules, target.Modules, ComparisonType.Module));
            results.AddRange(CompareItems(source.Fields, target.Fields, ComparisonType.Field));
            results.AddRange(CompareItems(source.Layouts, target.Layouts, ComparisonType.Layout));
            results.AddRange(CompareItems(source.ValuesLists, target.ValuesLists, ComparisonType.ValuesList));
            results.AddRange(CompareItems(source.ValuesListValues, target.ValuesListValues, ComparisonType.ValuesListValue));
            results.AddRange(CompareItems(source.DDERules, target.DDERules, ComparisonType.DDERule));
            results.AddRange(CompareItems(source.DDEActions, target.DDEActions, ComparisonType.DDEAction));
            results.AddRange(CompareItems(source.Reports, target.Reports, ComparisonType.Report));
            results.AddRange(CompareItems(source.Dashboards, target.Dashboards, ComparisonType.Dashboard));
            results.AddRange(CompareItems(source.Workspaces, target.Workspaces, ComparisonType.Workspace));
            results.AddRange(CompareItems(source.IViews, target.IViews, ComparisonType.IView));
            results.AddRange(CompareItems(source.Roles, target.Roles, ComparisonType.Role));
            results.AddRange(CompareItems(source.SecurityParameters, target.SecurityParameters, ComparisonType.SecurityParameter));
            results.AddRange(CompareItems(source.Notifications, target.Notifications, ComparisonType.Notification));
            results.AddRange(CompareItems(source.DataFeeds, target.DataFeeds, ComparisonType.DataFeed));
            results.AddRange(CompareItems(source.Schedules, target.Schedules, ComparisonType.Schedule));

            return results;
        }

        private List<ComparisonResult> CompareItems<T>(List<T> sourceItems, List<T> targetItems, ComparisonType type) 
            where T : BaseMetadata
        {
            var results = new List<ComparisonResult>();
            
            var sourceDict = sourceItems.ToDictionary(GetCompositeKey);
            var targetDict = targetItems.ToDictionary(GetCompositeKey);

            foreach (var (key, sourceItem) in sourceDict)
            {
                if (targetDict.TryGetValue(key, out var targetItem))
                {
                    results.AddRange(CompareProperties(sourceItem, targetItem, type));
                }
                else
                {
                    results.Add(new ComparisonResult
                    {
                        ComparisonType = type,
                        ItemName = sourceItem.Name,
                        ItemIdentifier = key,
                        ParentName = GetParentName(sourceItem),
                        Status = ComparisonStatus.MissingInTarget,
                        Severity = Severity.Critical
                    });
                }
            }

            foreach (var (key, targetItem) in targetDict)
            {
                if (!sourceDict.ContainsKey(key))
                {
                    results.Add(new ComparisonResult
                    {
                        ComparisonType = type,
                        ItemName = targetItem.Name,
                        ItemIdentifier = key,
                        ParentName = GetParentName(targetItem),
                        Status = ComparisonStatus.MissingInSource,
                        Severity = Severity.Warning
                    });
                }
            }

            return results;
        }

        private static string GetCompositeKey<T>(T item) where T : BaseMetadata
        {
            var baseName = item.Name.ToLower().Trim();
            
            return item switch
            {
                Field f => $"{f.ModuleName}::{baseName}",
                Layout l => $"{l.ModuleName}::{baseName}",
                ValuesListValue v => $"{v.ValuesListName}::{baseName}",
                DDERule d => $"{d.ModuleName}::{baseName}",
                DDEAction a => $"{a.RuleName}::{baseName}",
                Notification n => $"{n.ModuleName}::{baseName}",
                SecurityParameter s => $"{s.ModuleName ?? "global"}::{baseName}",
                _ => baseName
            };
        }

        private static string? GetParentName<T>(T item) where T : BaseMetadata
        {
            return item switch
            {
                Field f => f.ModuleName,
                Layout l => l.ModuleName,
                ValuesListValue v => v.ValuesListName,
                DDERule d => d.ModuleName,
                DDEAction a => a.RuleName,
                Notification n => n.ModuleName,
                SecurityParameter s => s.ModuleName,
                _ => null
            };
        }

        private List<ComparisonResult> CompareProperties<T>(T source, T target, ComparisonType type) 
            where T : BaseMetadata
        {
            var results = new List<ComparisonResult>();
            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var hasMismatch = false;

            foreach (var prop in properties)
            {
                if (ExcludedProperties.Contains(prop.Name)) continue;

                var sourceValue = FormatValue(prop.GetValue(source));
                var targetValue = FormatValue(prop.GetValue(target));

                if (sourceValue != targetValue)
                {
                    hasMismatch = true;
                    results.Add(new ComparisonResult
                    {
                        ComparisonType = type,
                        ItemName = source.Name,
                        ItemIdentifier = GetCompositeKey(source),
                        ParentName = GetParentName(source),
                        PropertyName = prop.Name,
                        SourceValue = sourceValue,
                        TargetValue = targetValue,
                        Status = ComparisonStatus.Mismatch,
                        Severity = GetSeverity(prop.Name)
                    });
                }
            }

            if (!hasMismatch)
            {
                results.Add(new ComparisonResult
                {
                    ComparisonType = type,
                    ItemName = source.Name,
                    ItemIdentifier = GetCompositeKey(source),
                    ParentName = GetParentName(source),
                    Status = ComparisonStatus.Match,
                    Severity = Severity.Info
                });
            }

            return results;
        }

        private static string FormatValue(object? value)
        {
            return value switch
            {
                null => "<empty>",
                bool b => b ? "Yes" : "No",
                IEnumerable<object> list => $"[{list.Count()} items]",
                _ => value.ToString() ?? "<empty>"
            };
        }

        private static Severity GetSeverity(string propertyName)
        {
            var criticalProps = new[] { "IsRequired", "IsEnabled", "IsKey", "FieldType" };
            var warningProps = new[] { "IsDefault", "IsShared", "IsCalculated" };

            if (criticalProps.Contains(propertyName)) return Severity.Critical;
            if (warningProps.Contains(propertyName)) return Severity.Warning;
            return Severity.Warning;
        }

        public ComparisonSummary GenerateSummary(List<ComparisonResult> results)
        {
            var summary = new ComparisonSummary();
            var processedItems = new HashSet<string>();

            foreach (var type in Enum.GetValues<ComparisonType>())
            {
                summary.ByType[type] = new TypeSummary();
            }

            foreach (var result in results)
            {
                var itemKey = $"{result.ComparisonType}::{result.ItemIdentifier}";
                if (processedItems.Contains(itemKey)) continue;
                processedItems.Add(itemKey);

                summary.TotalItems++;
                summary.ByType[result.ComparisonType].Total++;

                switch (result.Status)
                {
                    case ComparisonStatus.Match:
                        summary.MatchedCount++;
                        summary.ByType[result.ComparisonType].Matched++;
                        break;
                    case ComparisonStatus.Mismatch:
                        summary.MismatchedCount++;
                        summary.ByType[result.ComparisonType].Mismatched++;
                        break;
                    case ComparisonStatus.MissingInSource:
                        summary.MissingInSourceCount++;
                        summary.ByType[result.ComparisonType].MissingInSource++;
                        break;
                    case ComparisonStatus.MissingInTarget:
                        summary.MissingInTargetCount++;
                        summary.ByType[result.ComparisonType].MissingInTarget++;
                        break;
                }
            }

            return summary;
        }
    }
}
```

### Services/ExcelExporter.cs
```csharp
using ArcherComparisonTool.Core.Enums;
using ArcherComparisonTool.Core.Models;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace ArcherComparisonTool.Core.Services
{
    public interface IExcelExporter
    {
        byte[] Export(string sourceName, string targetName, List<ComparisonResult> results, ComparisonSummary summary);
    }

    public class ExcelExporter : IExcelExporter
    {
        public ExcelExporter()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public byte[] Export(string sourceName, string targetName, List<ComparisonResult> results, ComparisonSummary summary)
        {
            using var package = new ExcelPackage();

            // Summary Sheet
            CreateSummarySheet(package, sourceName, targetName, summary);

            // Results by Status
            var missingInTarget = results.Where(r => r.Status == ComparisonStatus.MissingInTarget).ToList();
            var missingInSource = results.Where(r => r.Status == ComparisonStatus.MissingInSource).ToList();
            var mismatches = results.Where(r => r.Status == ComparisonStatus.Mismatch).ToList();
            var matched = results.Where(r => r.Status == ComparisonStatus.Match).ToList();

            if (missingInTarget.Any())
                CreateResultsSheet(package, $"Not in {targetName}", missingInTarget, false, sourceName, targetName);
            if (missingInSource.Any())
                CreateResultsSheet(package, $"Not in {sourceName}", missingInSource, false, sourceName, targetName);
            if (mismatches.Any())
                CreateResultsSheet(package, "Mismatches", mismatches, true, sourceName, targetName);
            if (matched.Any())
                CreateResultsSheet(package, "Matched", matched, false, sourceName, targetName);

            return package.GetAsByteArray();
        }

        private void CreateSummarySheet(ExcelPackage package, string sourceName, string targetName, ComparisonSummary summary)
        {
            var ws = package.Workbook.Worksheets.Add("Summary");

            ws.Cells[1, 1].Value = "Archer Metadata Comparison Report";
            ws.Cells[1, 1].Style.Font.Bold = true;
            ws.Cells[1, 1].Style.Font.Size = 16;

            ws.Cells[3, 1].Value = "Source Environment:";
            ws.Cells[3, 2].Value = sourceName;
            ws.Cells[4, 1].Value = "Target Environment:";
            ws.Cells[4, 2].Value = targetName;
            ws.Cells[5, 1].Value = "Generated:";
            ws.Cells[5, 2].Value = DateTime.Now.ToString("g");

            // Summary Table
            var row = 7;
            ws.Cells[row, 1].Value = "Metric";
            ws.Cells[row, 2].Value = "Count";
            ws.Cells[row, 3].Value = "Percentage";
            StyleHeaderRow(ws, row, 1, 3);

            row++;
            ws.Cells[row, 1].Value = "Total Items";
            ws.Cells[row, 2].Value = summary.TotalItems;
            ws.Cells[row, 3].Value = "100%";

            row++;
            ws.Cells[row, 1].Value = "Matched";
            ws.Cells[row, 2].Value = summary.MatchedCount;
            ws.Cells[row, 3].Value = $"{(summary.MatchedCount * 100.0 / summary.TotalItems):F1}%";
            ws.Cells[row, 1, row, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[row, 1, row, 3].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(220, 252, 231));

            row++;
            ws.Cells[row, 1].Value = "Mismatched";
            ws.Cells[row, 2].Value = summary.MismatchedCount;
            ws.Cells[row, 3].Value = $"{(summary.MismatchedCount * 100.0 / summary.TotalItems):F1}%";
            ws.Cells[row, 1, row, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[row, 1, row, 3].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(254, 249, 195));

            row++;
            ws.Cells[row, 1].Value = $"Missing in Target ({targetName})";
            ws.Cells[row, 2].Value = summary.MissingInTargetCount;
            ws.Cells[row, 3].Value = $"{(summary.MissingInTargetCount * 100.0 / summary.TotalItems):F1}%";
            ws.Cells[row, 1, row, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[row, 1, row, 3].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(254, 226, 226));

            row++;
            ws.Cells[row, 1].Value = $"Missing in Source ({sourceName})";
            ws.Cells[row, 2].Value = summary.MissingInSourceCount;
            ws.Cells[row, 3].Value = $"{(summary.MissingInSourceCount * 100.0 / summary.TotalItems):F1}%";
            ws.Cells[row, 1, row, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[row, 1, row, 3].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 237, 213));

            ws.Columns[1].Width = 30;
            ws.Columns[2].Width = 15;
            ws.Columns[3].Width = 15;
        }

        private void CreateResultsSheet(ExcelPackage package, string sheetName, List<ComparisonResult> results, bool isMismatch, string sourceName, string targetName)
        {
            var ws = package.Workbook.Worksheets.Add(sheetName.Length > 31 ? sheetName[..31] : sheetName);

            var headers = isMismatch
                ? new[] { "Type", "Parent", "Item Name", "Property", $"{sourceName} Value", $"{targetName} Value", "Severity" }
                : new[] { "Type", "Parent", "Item Name", "Severity" };

            for (int i = 0; i < headers.Length; i++)
            {
                ws.Cells[1, i + 1].Value = headers[i];
            }
            StyleHeaderRow(ws, 1, 1, headers.Length);

            var row = 2;
            foreach (var result in results)
            {
                var col = 1;
                ws.Cells[row, col++].Value = result.ComparisonType.ToString();
                ws.Cells[row, col++].Value = result.ParentName ?? "-";
                ws.Cells[row, col++].Value = result.ItemName;
                
                if (isMismatch)
                {
                    ws.Cells[row, col++].Value = result.PropertyName ?? "-";
                    ws.Cells[row, col++].Value = result.SourceValue ?? "-";
                    ws.Cells[row, col++].Value = result.TargetValue ?? "-";
                }
                
                ws.Cells[row, col].Value = result.Severity.ToString();
                row++;
            }

            ws.Cells[1, 1, row - 1, headers.Length].AutoFitColumns();
            ws.View.FreezePanes(2, 1);
        }

        private void StyleHeaderRow(ExcelWorksheet ws, int row, int startCol, int endCol)
        {
            var range = ws.Cells[row, startCol, row, endCol];
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(30, 64, 175));
            range.Style.Font.Color.SetColor(Color.White);
            range.Style.Font.Bold = true;
        }
    }
}
```

### Services/EncryptionService.cs
```csharp
using System.Security.Cryptography;
using System.Text;

namespace ArcherComparisonTool.Core.Services
{
    public interface IEncryptionService
    {
        string Encrypt(string plainText);
        string Decrypt(string encryptedText);
    }

    public class EncryptionService : IEncryptionService
    {
        public string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return string.Empty;
            
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var encryptedBytes = ProtectedData.Protect(plainBytes, null, DataProtectionScope.CurrentUser);
            return Convert.ToBase64String(encryptedBytes);
        }

        public string Decrypt(string encryptedText)
        {
            if (string.IsNullOrEmpty(encryptedText)) return string.Empty;
            
            var encryptedBytes = Convert.FromBase64String(encryptedText);
            var decryptedBytes = ProtectedData.Unprotect(encryptedBytes, null, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(decryptedBytes);
        }
    }
}
```

---

## Step 9: API Project Setup

### Program.cs
```csharp
using ArcherComparisonTool.Core.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register services
builder.Services.AddSingleton<IComparisonEngine, ComparisonEngine>();
builder.Services.AddSingleton<IExcelExporter, ExcelExporter>();
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
```

### Controllers/EnvironmentsController.cs
```csharp
using ArcherComparisonTool.Core.Models;
using ArcherComparisonTool.Core.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ArcherComparisonTool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnvironmentsController : ControllerBase
    {
        private readonly IEncryptionService _encryptionService;
        private readonly ILogger<EnvironmentsController> _logger;
        private readonly string _environmentsFilePath;

        public EnvironmentsController(IEncryptionService encryptionService, ILogger<EnvironmentsController> logger)
        {
            _encryptionService = encryptionService;
            _logger = logger;
            _environmentsFilePath = Path.Combine(AppContext.BaseDirectory, "environments.json");
        }

        [HttpGet]
        public async Task<ActionResult<List<ArcherEnvironment>>> GetAll()
        {
            var environments = await LoadEnvironments();
            return Ok(environments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArcherEnvironment>> Get(Guid id)
        {
            var environments = await LoadEnvironments();
            var env = environments.FirstOrDefault(e => e.Id == id);
            
            if (env == null)
                return NotFound();
            
            return Ok(env);
        }

        [HttpPost]
        public async Task<ActionResult<ArcherEnvironment>> Create([FromBody] ArcherEnvironment environment)
        {
            environment.Id = Guid.NewGuid();
            
            if (!string.IsNullOrEmpty(environment.EncryptedPassword))
            {
                environment.EncryptedPassword = _encryptionService.Encrypt(environment.EncryptedPassword);
            }

            var environments = await LoadEnvironments();
            environments.Add(environment);
            await SaveEnvironments(environments);

            _logger.LogInformation("Created environment: {Name}", environment.DisplayName);
            
            return CreatedAtAction(nameof(Get), new { id = environment.Id }, environment);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ArcherEnvironment>> Update(Guid id, [FromBody] ArcherEnvironment environment)
        {
            var environments = await LoadEnvironments();
            var index = environments.FindIndex(e => e.Id == id);
            
            if (index == -1)
                return NotFound();

            environment.Id = id;
            
            if (!string.IsNullOrEmpty(environment.EncryptedPassword) && 
                environment.EncryptedPassword != environments[index].EncryptedPassword)
            {
                environment.EncryptedPassword = _encryptionService.Encrypt(environment.EncryptedPassword);
            }
            else
            {
                environment.EncryptedPassword = environments[index].EncryptedPassword;
            }

            environments[index] = environment;
            await SaveEnvironments(environments);

            _logger.LogInformation("Updated environment: {Name}", environment.DisplayName);
            
            return Ok(environment);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var environments = await LoadEnvironments();
            var removed = environments.RemoveAll(e => e.Id == id);
            
            if (removed == 0)
                return NotFound();

            await SaveEnvironments(environments);
            
            _logger.LogInformation("Deleted environment: {Id}", id);
            
            return NoContent();
        }

        [HttpGet("{id}/test")]
        public async Task<ActionResult<object>> TestConnection(Guid id)
        {
            var environments = await LoadEnvironments();
            var env = environments.FirstOrDefault(e => e.Id == id);
            
            if (env == null)
                return NotFound();

            // For demo, return mock success
            // In production, actually test the Archer API connection
            await Task.Delay(500); // Simulate network delay
            
            return Ok(new 
            { 
                success = true, 
                message = "Connection successful",
                version = "6.12.0.1"
            });
        }

        private async Task<List<ArcherEnvironment>> LoadEnvironments()
        {
            if (!System.IO.File.Exists(_environmentsFilePath))
                return new List<ArcherEnvironment>();

            var json = await System.IO.File.ReadAllTextAsync(_environmentsFilePath);
            return JsonSerializer.Deserialize<List<ArcherEnvironment>>(json) ?? new List<ArcherEnvironment>();
        }

        private async Task SaveEnvironments(List<ArcherEnvironment> environments)
        {
            var json = JsonSerializer.Serialize(environments, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_environmentsFilePath, json);
        }
    }
}
```

### Controllers/ComparisonController.cs
```csharp
using ArcherComparisonTool.Core.Models;
using ArcherComparisonTool.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace ArcherComparisonTool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComparisonController : ControllerBase
    {
        private readonly IComparisonEngine _comparisonEngine;
        private readonly ILogger<ComparisonController> _logger;

        public ComparisonController(IComparisonEngine comparisonEngine, ILogger<ComparisonController> logger)
        {
            _comparisonEngine = comparisonEngine;
            _logger = logger;
        }

        [HttpPost("compare")]
        public async Task<ActionResult<ComparisonResponse>> Compare([FromBody] ComparisonRequest request)
        {
            _logger.LogInformation("Starting comparison: {Source} vs {Target}", 
                request.SourceEnvironmentId, request.TargetEnvironmentId);

            // In production, use actual API client to collect metadata
            // For demo, generate mock data
            var sourceMetadata = GenerateMockMetadata(request.SourceEnvironmentId, request.Options, true);
            var targetMetadata = GenerateMockMetadata(request.TargetEnvironmentId, request.Options, false);

            await Task.Delay(1000); // Simulate processing time

            var results = _comparisonEngine.Compare(sourceMetadata, targetMetadata);
            var summary = _comparisonEngine.GenerateSummary(results);

            _logger.LogInformation("Comparison complete: {Total} items, {Matched} matched, {Mismatched} mismatched",
                summary.TotalItems, summary.MatchedCount, summary.MismatchedCount);

            return Ok(new ComparisonResponse
            {
                Results = results,
                Summary = summary,
                SourceMetadata = sourceMetadata,
                TargetMetadata = targetMetadata
            });
        }

        private CollectedMetadata GenerateMockMetadata(string environmentId, CollectionOptions options, bool isSource)
        {
            // This would be replaced with actual Archer API calls
            // For now, return empty metadata
            return new CollectedMetadata
            {
                Environment = new ArcherEnvironment { DisplayName = isSource ? "Source" : "Target" }
            };
        }
    }

    public class ComparisonRequest
    {
        public string SourceEnvironmentId { get; set; } = string.Empty;
        public string TargetEnvironmentId { get; set; } = string.Empty;
        public CollectionOptions Options { get; set; } = new();
    }

    public class ComparisonResponse
    {
        public List<ComparisonResult> Results { get; set; } = new();
        public ComparisonSummary Summary { get; set; } = new();
        public CollectedMetadata SourceMetadata { get; set; } = new();
        public CollectedMetadata TargetMetadata { get; set; } = new();
    }
}
```

### Controllers/ExportController.cs
```csharp
using ArcherComparisonTool.Core.Models;
using ArcherComparisonTool.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace ArcherComparisonTool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly IExcelExporter _excelExporter;
        private readonly ILogger<ExportController> _logger;

        public ExportController(IExcelExporter excelExporter, ILogger<ExportController> logger)
        {
            _excelExporter = excelExporter;
            _logger = logger;
        }

        [HttpPost("excel")]
        public ActionResult<byte[]> ExportToExcel([FromBody] ExportRequest request)
        {
            _logger.LogInformation("Exporting comparison to Excel: {Source} vs {Target}",
                request.SourceName, request.TargetName);

            var excelBytes = _excelExporter.Export(
                request.SourceName,
                request.TargetName,
                request.Results,
                request.Summary
            );

            var filename = $"Archer_Comparison_{request.SourceName}_vs_{request.TargetName}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                filename);
        }
    }

    public class ExportRequest
    {
        public string SourceName { get; set; } = string.Empty;
        public string TargetName { get; set; } = string.Empty;
        public List<ComparisonResult> Results { get; set; } = new();
        public ComparisonSummary Summary { get; set; } = new();
    }
}
```

---

## Step 10: Running the Application

### Start the Backend

1. Set `ArcherComparisonTool.Api` as the startup project
2. Press **F5** or click **Start Debugging**
3. The API will start on `https://localhost:7001`
4. Swagger UI available at `https://localhost:7001/swagger`

### Start the Frontend

1. Open a terminal in the React project directory
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser

### Configure API URL

Update `src/services/apiClient.ts` in the React project:
```typescript
const API_BASE_URL = 'https://localhost:7001/api';
```

---

## Step 11: Connecting to Real Archer API

To connect to actual RSA Archer instances, implement `IArcherApiClient`:

```csharp
public interface IArcherApiClient
{
    Task<string> LoginAsync(ArcherEnvironment environment);
    Task LogoutAsync(string sessionToken);
    Task<List<Module>> GetModulesAsync(string sessionToken);
    Task<List<Field>> GetFieldsAsync(string sessionToken, int moduleId);
    Task<List<ValuesList>> GetValuesListsAsync(string sessionToken);
    // ... other methods
}
```

The Archer REST API endpoints you'll need:
- `POST /platformapi/core/security/login` - Authentication
- `GET /platformapi/core/system/application` - Get modules
- `GET /platformapi/core/system/fielddefinition/application/{id}` - Get fields
- `GET /platformapi/core/system/valueslist` - Get values lists

---

## Troubleshooting

### CORS Issues
Ensure the React dev server origin is in the CORS policy in `Program.cs`.

### SSL Certificate Issues
For development, trust the .NET dev certificate:
```bash
dotnet dev-certs https --trust
```

### Port Conflicts
Change the API port in `Properties/launchSettings.json`.

---

## Next Steps

1. Implement actual Archer API client with authentication
2. Add SQL Server storage for environments
3. Implement SignalR for real-time progress updates
4. Add user authentication
5. Create unit tests for comparison engine
