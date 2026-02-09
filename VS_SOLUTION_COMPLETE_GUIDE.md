# Archer Comparison Tool - Complete Visual Studio Solution Guide

This comprehensive guide provides step-by-step instructions to create the complete Archer Comparison Tool solution in Visual Studio 2022 with .NET 8.0 backend and React frontend.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Solution Architecture](#solution-architecture)
3. [Part 1: Create the Solution](#part-1-create-the-solution)
4. [Part 2: Core Class Library](#part-2-core-class-library)
5. [Part 3: Web API Project](#part-3-web-api-project)
6. [Part 4: React Frontend Integration](#part-4-react-frontend-integration)
7. [Part 5: Running the Application](#part-5-running-the-application)
8. [Appendix: Complete Code Files](#appendix-complete-code-files)

---

## Prerequisites

- **Visual Studio 2022** (Community, Professional, or Enterprise) - Version 17.8+
- **.NET 8.0 SDK** - Download from https://dotnet.microsoft.com/download
- **Node.js 18+** - Download from https://nodejs.org/
- **Git** (optional) - For version control

---

## Solution Architecture

```
ArcherComparisonTool/
├── ArcherComparisonTool.sln
├── src/
│   ├── ArcherComparisonTool.Core/          # Class Library - Business Logic
│   │   ├── Enums/
│   │   ├── Models/
│   │   ├── Interfaces/
│   │   └── Services/
│   ├── ArcherComparisonTool.Api/           # ASP.NET Core Web API
│   │   ├── Controllers/
│   │   ├── DTOs/
│   │   └── Program.cs
│   └── ArcherComparisonTool.Web/           # React Frontend (copied from this project)
```

**NuGet Packages Used (Minimal):**
- `DocumentFormat.OpenXml` - Native Microsoft library for Excel (no EPPlus needed)
- `System.Security.Cryptography.ProtectedData` - Built-in .NET for encryption

---

## Part 1: Create the Solution

### Step 1.1: Create Blank Solution

1. Open **Visual Studio 2022**
2. Click **"Create a new project"**
3. Search for **"Blank Solution"**
4. Click **Next**
5. Configure:
   - **Solution name:** `ArcherComparisonTool`
   - **Location:** Choose your preferred folder (e.g., `C:\Projects\`)
6. Click **Create**

### Step 1.2: Create Solution Folders

1. Right-click the Solution → **Add** → **New Solution Folder**
2. Name it: `src`

---

## Part 2: Core Class Library

### Step 2.1: Create the Project

1. Right-click `src` folder → **Add** → **New Project**
2. Search for **"Class Library"**
3. Select **Class Library** (with C# icon, targeting .NET)
4. Click **Next**
5. Configure:
   - **Project name:** `ArcherComparisonTool.Core`
   - **Location:** Should be inside solution folder
   - **Framework:** `.NET 8.0`
6. Click **Create**
7. Delete the default `Class1.cs` file

### Step 2.2: Add NuGet Package

1. Right-click project → **Manage NuGet Packages**
2. Search and install: `DocumentFormat.OpenXml` (version 3.0+)
3. Search and install: `System.Security.Cryptography.ProtectedData` (version 8.0+)

### Step 2.3: Create Folder Structure

Right-click the project and create these folders:
- `Enums`
- `Models`
- `Models/Metadata`
- `Interfaces`
- `Services`

### Step 2.4: Create Enum Files

**File: Enums/ComparisonType.cs**
```csharp
namespace ArcherComparisonTool.Core.Enums;

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
```

**File: Enums/ComparisonStatus.cs**
```csharp
namespace ArcherComparisonTool.Core.Enums;

public enum ComparisonStatus
{
    Match,
    Mismatch,
    MissingInSource,
    MissingInTarget
}
```

**File: Enums/Severity.cs**
```csharp
namespace ArcherComparisonTool.Core.Enums;

public enum Severity
{
    Info,
    Warning,
    Critical
}
```

**File: Enums/FieldType.cs**
```csharp
namespace ArcherComparisonTool.Core.Enums;

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
```

**File: Enums/ReportType.cs**
```csharp
namespace ArcherComparisonTool.Core.Enums;

public enum ReportType
{
    Statistical,
    CardReport,
    RecordSearch,
    QuickSearch
}
```

### Step 2.5: Create Model Files

**File: Models/ArcherEnvironment.cs**
```csharp
namespace ArcherComparisonTool.Core.Models;

public class ArcherEnvironment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayName { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string InstanceName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string EncryptedPassword { get; set; } = string.Empty;
}
```

**File: Models/Metadata/BaseMetadata.cs**
```csharp
namespace ArcherComparisonTool.Core.Models.Metadata;

public abstract class BaseMetadata
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid Guid { get; set; } = Guid.NewGuid();
    public string? Alias { get; set; }
    public string? Description { get; set; }
}
```

**File: Models/Metadata/Module.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Module : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Module;
    public int LevelId { get; set; }
    public bool IsSubform { get; set; }
    public int? ParentModuleId { get; set; }
    public int FieldCount { get; set; }
}
```

**File: Models/Metadata/Field.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

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
```

**File: Models/Metadata/Layout.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Layout : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Layout;
    public int ModuleId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public List<int> FieldIds { get; set; } = new();
}
```

**File: Models/Metadata/ValuesList.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class ValuesList : BaseMetadata
{
    public ComparisonType Type => ComparisonType.ValuesList;
    public int ValuesCount { get; set; }
    public bool IsHierarchical { get; set; }
}
```

**File: Models/Metadata/ValuesListValue.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

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
```

**File: Models/Metadata/DDERule.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class DDERule : BaseMetadata
{
    public ComparisonType Type => ComparisonType.DDERule;
    public int ModuleId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public int ActionsCount { get; set; }
}
```

**File: Models/Metadata/DDEAction.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class DDEAction : BaseMetadata
{
    public ComparisonType Type => ComparisonType.DDEAction;
    public int RuleId { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public int Order { get; set; }
}
```

**File: Models/Metadata/Report.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Report : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Report;
    public ReportType ReportType { get; set; }
    public int? ModuleId { get; set; }
    public string? ModuleName { get; set; }
    public bool IsShared { get; set; }
    public string Owner { get; set; } = string.Empty;
}
```

**File: Models/Metadata/Dashboard.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Dashboard : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Dashboard;
    public int IViewsCount { get; set; }
    public bool IsShared { get; set; }
    public string Owner { get; set; } = string.Empty;
}
```

**File: Models/Metadata/Workspace.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Workspace : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Workspace;
    public int DashboardsCount { get; set; }
    public int Order { get; set; }
}
```

**File: Models/Metadata/IView.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class IView : BaseMetadata
{
    public ComparisonType Type => ComparisonType.IView;
    public string IViewType { get; set; } = string.Empty;
    public int? ReportId { get; set; }
    public string? ReportName { get; set; }
}
```

**File: Models/Metadata/Role.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Role : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Role;
    public int UsersCount { get; set; }
    public int GroupsCount { get; set; }
    public bool IsSystemRole { get; set; }
}
```

**File: Models/Metadata/SecurityParameter.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class SecurityParameter : BaseMetadata
{
    public ComparisonType Type => ComparisonType.SecurityParameter;
    public string SecurityType { get; set; } = string.Empty;
    public int? ModuleId { get; set; }
    public string? ModuleName { get; set; }
}
```

**File: Models/Metadata/Notification.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Notification : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Notification;
    public int ModuleId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string TriggerType { get; set; } = string.Empty;
}
```

**File: Models/Metadata/DataFeed.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class DataFeed : BaseMetadata
{
    public ComparisonType Type => ComparisonType.DataFeed;
    public string FeedType { get; set; } = string.Empty;
    public int TargetModuleId { get; set; }
    public string TargetModuleName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string? Schedule { get; set; }
}
```

**File: Models/Metadata/Schedule.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models.Metadata;

public class Schedule : BaseMetadata
{
    public ComparisonType Type => ComparisonType.Schedule;
    public string ScheduleType { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime? LastRunDate { get; set; }
    public DateTime? NextRunDate { get; set; }
}
```

### Step 2.6: Create Collection and Comparison Models

**File: Models/CollectionOptions.cs**
```csharp
namespace ArcherComparisonTool.Core.Models;

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
```

**File: Models/CollectedMetadata.cs**
```csharp
using ArcherComparisonTool.Core.Models.Metadata;

namespace ArcherComparisonTool.Core.Models;

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
```

**File: Models/ComparisonResult.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models;

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
```

**File: Models/ComparisonSummary.cs**
```csharp
using ArcherComparisonTool.Core.Enums;

namespace ArcherComparisonTool.Core.Models;

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
```

### Step 2.7: Create Interface Files

**File: Interfaces/IComparisonEngine.cs**
```csharp
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Core.Interfaces;

public interface IComparisonEngine
{
    List<ComparisonResult> Compare(CollectedMetadata source, CollectedMetadata target);
    ComparisonSummary GenerateSummary(List<ComparisonResult> results);
}
```

**File: Interfaces/IExcelExporter.cs**
```csharp
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Core.Interfaces;

public interface IExcelExporter
{
    byte[] Export(string sourceName, string targetName, List<ComparisonResult> results, ComparisonSummary summary);
}
```

**File: Interfaces/IEncryptionService.cs**
```csharp
namespace ArcherComparisonTool.Core.Interfaces;

public interface IEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string encryptedText);
}
```

**File: Interfaces/IEnvironmentRepository.cs**
```csharp
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Core.Interfaces;

public interface IEnvironmentRepository
{
    Task<List<ArcherEnvironment>> GetAllAsync();
    Task<ArcherEnvironment?> GetByIdAsync(Guid id);
    Task<ArcherEnvironment> AddAsync(ArcherEnvironment environment);
    Task<ArcherEnvironment> UpdateAsync(ArcherEnvironment environment);
    Task<bool> DeleteAsync(Guid id);
}
```

### Step 2.8: Create Service Files

**File: Services/EncryptionService.cs**
```csharp
using System.Security.Cryptography;
using System.Text;
using ArcherComparisonTool.Core.Interfaces;

namespace ArcherComparisonTool.Core.Services;

public class EncryptionService : IEncryptionService
{
    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) 
            return string.Empty;
        
        try
        {
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var encryptedBytes = ProtectedData.Protect(
                plainBytes, 
                null, 
                DataProtectionScope.CurrentUser
            );
            return Convert.ToBase64String(encryptedBytes);
        }
        catch
        {
            // Fallback for non-Windows platforms: simple base64
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(plainText));
        }
    }

    public string Decrypt(string encryptedText)
    {
        if (string.IsNullOrEmpty(encryptedText)) 
            return string.Empty;
        
        try
        {
            var encryptedBytes = Convert.FromBase64String(encryptedText);
            var decryptedBytes = ProtectedData.Unprotect(
                encryptedBytes, 
                null, 
                DataProtectionScope.CurrentUser
            );
            return Encoding.UTF8.GetString(decryptedBytes);
        }
        catch
        {
            // Fallback: assume it's simple base64
            try
            {
                return Encoding.UTF8.GetString(Convert.FromBase64String(encryptedText));
            }
            catch
            {
                return encryptedText;
            }
        }
    }
}
```

**File: Services/ComparisonEngine.cs**
```csharp
using System.Reflection;
using ArcherComparisonTool.Core.Enums;
using ArcherComparisonTool.Core.Interfaces;
using ArcherComparisonTool.Core.Models;
using ArcherComparisonTool.Core.Models.Metadata;

namespace ArcherComparisonTool.Core.Services;

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
            DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
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
```

**File: Services/ExcelExporter.cs**
```csharp
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using ArcherComparisonTool.Core.Enums;
using ArcherComparisonTool.Core.Interfaces;
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Core.Services;

public class ExcelExporter : IExcelExporter
{
    public byte[] Export(string sourceName, string targetName, List<ComparisonResult> results, ComparisonSummary summary)
    {
        using var stream = new MemoryStream();
        using var document = SpreadsheetDocument.Create(stream, SpreadsheetDocumentType.Workbook);

        var workbookPart = document.AddWorkbookPart();
        workbookPart.Workbook = new Workbook();

        var sheets = document.WorkbookPart!.Workbook.AppendChild(new Sheets());

        // Add stylesheets
        var stylesPart = workbookPart.AddNewPart<WorkbookStylesPart>();
        stylesPart.Stylesheet = CreateStylesheet();
        stylesPart.Stylesheet.Save();

        uint sheetId = 1;

        // Summary Sheet
        AddSheet(workbookPart, sheets, "Summary", sheetId++, 
            CreateSummarySheetData(summary, sourceName, targetName));

        // Missing in Target
        var missingInTarget = results.Where(r => r.Status == ComparisonStatus.MissingInTarget).ToList();
        if (missingInTarget.Any())
        {
            AddSheet(workbookPart, sheets, $"Not in {TruncateName(targetName)}", sheetId++,
                CreateResultsSheetData(missingInTarget, false, sourceName, targetName));
        }

        // Missing in Source
        var missingInSource = results.Where(r => r.Status == ComparisonStatus.MissingInSource).ToList();
        if (missingInSource.Any())
        {
            AddSheet(workbookPart, sheets, $"Not in {TruncateName(sourceName)}", sheetId++,
                CreateResultsSheetData(missingInSource, false, sourceName, targetName));
        }

        // Mismatches
        var mismatches = results.Where(r => r.Status == ComparisonStatus.Mismatch).ToList();
        if (mismatches.Any())
        {
            AddSheet(workbookPart, sheets, "Mismatches", sheetId++,
                CreateResultsSheetData(mismatches, true, sourceName, targetName));
        }

        // Matched
        var matched = results.Where(r => r.Status == ComparisonStatus.Match).ToList();
        if (matched.Any())
        {
            AddSheet(workbookPart, sheets, "Matched", sheetId++,
                CreateResultsSheetData(matched, false, sourceName, targetName));
        }

        workbookPart.Workbook.Save();
        document.Dispose();

        return stream.ToArray();
    }

    private static string TruncateName(string name) => name.Length > 20 ? name[..20] : name;

    private static void AddSheet(WorkbookPart workbookPart, Sheets sheets, string name, uint sheetId, SheetData sheetData)
    {
        var worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
        worksheetPart.Worksheet = new Worksheet(sheetData);

        var sheet = new Sheet
        {
            Id = workbookPart.GetIdOfPart(worksheetPart),
            SheetId = sheetId,
            Name = name.Length > 31 ? name[..31] : name
        };
        sheets.Append(sheet);

        worksheetPart.Worksheet.Save();
    }

    private static SheetData CreateSummarySheetData(ComparisonSummary summary, string sourceName, string targetName)
    {
        var sheetData = new SheetData();

        // Title
        sheetData.Append(CreateRow(new[] { "Archer Metadata Comparison Report" }));
        sheetData.Append(CreateRow(Array.Empty<string>()));
        sheetData.Append(CreateRow(new[] { "Source Environment:", sourceName }));
        sheetData.Append(CreateRow(new[] { "Target Environment:", targetName }));
        sheetData.Append(CreateRow(new[] { "Generated:", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") }));
        sheetData.Append(CreateRow(Array.Empty<string>()));

        // Summary headers
        sheetData.Append(CreateRow(new[] { "Metric", "Count", "Percentage" }));
        sheetData.Append(CreateRow(new[] { "Total Items", summary.TotalItems.ToString(), "100%" }));
        
        var matchPct = summary.TotalItems > 0 ? (summary.MatchedCount * 100.0 / summary.TotalItems).ToString("F1") + "%" : "0%";
        var mismatchPct = summary.TotalItems > 0 ? (summary.MismatchedCount * 100.0 / summary.TotalItems).ToString("F1") + "%" : "0%";
        var missingTargetPct = summary.TotalItems > 0 ? (summary.MissingInTargetCount * 100.0 / summary.TotalItems).ToString("F1") + "%" : "0%";
        var missingSourcePct = summary.TotalItems > 0 ? (summary.MissingInSourceCount * 100.0 / summary.TotalItems).ToString("F1") + "%" : "0%";

        sheetData.Append(CreateRow(new[] { "Matched", summary.MatchedCount.ToString(), matchPct }));
        sheetData.Append(CreateRow(new[] { "Mismatched", summary.MismatchedCount.ToString(), mismatchPct }));
        sheetData.Append(CreateRow(new[] { $"Missing in {targetName}", summary.MissingInTargetCount.ToString(), missingTargetPct }));
        sheetData.Append(CreateRow(new[] { $"Missing in {sourceName}", summary.MissingInSourceCount.ToString(), missingSourcePct }));
        sheetData.Append(CreateRow(Array.Empty<string>()));

        // Breakdown by type
        sheetData.Append(CreateRow(new[] { "Type", "Total", "Matched", "Mismatched", "Missing Source", "Missing Target" }));
        
        foreach (var (type, stats) in summary.ByType.Where(kv => kv.Value.Total > 0))
        {
            sheetData.Append(CreateRow(new[]
            {
                type.ToString(),
                stats.Total.ToString(),
                stats.Matched.ToString(),
                stats.Mismatched.ToString(),
                stats.MissingInSource.ToString(),
                stats.MissingInTarget.ToString()
            }));
        }

        return sheetData;
    }

    private static SheetData CreateResultsSheetData(List<ComparisonResult> results, bool isMismatch, string sourceName, string targetName)
    {
        var sheetData = new SheetData();

        // Headers
        if (isMismatch)
        {
            sheetData.Append(CreateRow(new[] { "Type", "Parent", "Item Name", "Property", $"{sourceName} Value", $"{targetName} Value", "Severity" }));
        }
        else
        {
            sheetData.Append(CreateRow(new[] { "Type", "Parent", "Item Name", "Severity" }));
        }

        // Data rows
        foreach (var result in results)
        {
            if (isMismatch)
            {
                sheetData.Append(CreateRow(new[]
                {
                    result.ComparisonType.ToString(),
                    result.ParentName ?? "-",
                    result.ItemName,
                    result.PropertyName ?? "-",
                    result.SourceValue ?? "-",
                    result.TargetValue ?? "-",
                    result.Severity.ToString()
                }));
            }
            else
            {
                sheetData.Append(CreateRow(new[]
                {
                    result.ComparisonType.ToString(),
                    result.ParentName ?? "-",
                    result.ItemName,
                    result.Severity.ToString()
                }));
            }
        }

        return sheetData;
    }

    private static Row CreateRow(string[] values)
    {
        var row = new Row();
        foreach (var value in values)
        {
            var cell = new Cell
            {
                DataType = CellValues.String,
                CellValue = new CellValue(value)
            };
            row.Append(cell);
        }
        return row;
    }

    private static Stylesheet CreateStylesheet()
    {
        return new Stylesheet(
            new Fonts(
                new Font( // Default font
                    new FontSize { Val = 11 },
                    new FontName { Val = "Calibri" }
                ),
                new Font( // Bold font
                    new Bold(),
                    new FontSize { Val = 11 },
                    new FontName { Val = "Calibri" }
                )
            ),
            new Fills(
                new Fill(new PatternFill { PatternType = PatternValues.None }),
                new Fill(new PatternFill { PatternType = PatternValues.Gray125 })
            ),
            new Borders(
                new Border(
                    new LeftBorder(),
                    new RightBorder(),
                    new TopBorder(),
                    new BottomBorder(),
                    new DiagonalBorder()
                )
            ),
            new CellFormats(
                new CellFormat { FontId = 0, FillId = 0, BorderId = 0 },
                new CellFormat { FontId = 1, FillId = 0, BorderId = 0 }
            )
        );
    }
}
```

**File: Services/FileEnvironmentRepository.cs**
```csharp
using System.Text.Json;
using ArcherComparisonTool.Core.Interfaces;
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Core.Services;

public class FileEnvironmentRepository : IEnvironmentRepository
{
    private readonly string _filePath;
    private readonly IEncryptionService _encryptionService;
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    public FileEnvironmentRepository(string filePath, IEncryptionService encryptionService)
    {
        _filePath = filePath;
        _encryptionService = encryptionService;
    }

    public async Task<List<ArcherEnvironment>> GetAllAsync()
    {
        if (!File.Exists(_filePath))
            return new List<ArcherEnvironment>();

        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<ArcherEnvironment>>(json) ?? new List<ArcherEnvironment>();
    }

    public async Task<ArcherEnvironment?> GetByIdAsync(Guid id)
    {
        var environments = await GetAllAsync();
        return environments.FirstOrDefault(e => e.Id == id);
    }

    public async Task<ArcherEnvironment> AddAsync(ArcherEnvironment environment)
    {
        environment.Id = Guid.NewGuid();
        
        if (!string.IsNullOrEmpty(environment.EncryptedPassword))
        {
            environment.EncryptedPassword = _encryptionService.Encrypt(environment.EncryptedPassword);
        }

        var environments = await GetAllAsync();
        environments.Add(environment);
        await SaveAsync(environments);

        return environment;
    }

    public async Task<ArcherEnvironment> UpdateAsync(ArcherEnvironment environment)
    {
        var environments = await GetAllAsync();
        var index = environments.FindIndex(e => e.Id == environment.Id);

        if (index == -1)
            throw new KeyNotFoundException($"Environment with ID {environment.Id} not found.");

        // Only re-encrypt if password changed
        var existing = environments[index];
        if (!string.IsNullOrEmpty(environment.EncryptedPassword) && 
            environment.EncryptedPassword != existing.EncryptedPassword)
        {
            environment.EncryptedPassword = _encryptionService.Encrypt(environment.EncryptedPassword);
        }
        else
        {
            environment.EncryptedPassword = existing.EncryptedPassword;
        }

        environments[index] = environment;
        await SaveAsync(environments);

        return environment;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var environments = await GetAllAsync();
        var removed = environments.RemoveAll(e => e.Id == id);
        
        if (removed > 0)
        {
            await SaveAsync(environments);
            return true;
        }

        return false;
    }

    private async Task SaveAsync(List<ArcherEnvironment> environments)
    {
        var json = JsonSerializer.Serialize(environments, JsonOptions);
        await File.WriteAllTextAsync(_filePath, json);
    }
}
```

**File: Services/MockMetadataService.cs**
```csharp
using ArcherComparisonTool.Core.Enums;
using ArcherComparisonTool.Core.Models;
using ArcherComparisonTool.Core.Models.Metadata;

namespace ArcherComparisonTool.Core.Services;

public static class MockMetadataService
{
    private static readonly Random Random = new();

    private static readonly string[] ModuleNames = 
    {
        "Applications", "Business Processes", "Risks", "Controls", "Policies",
        "Incidents", "Findings", "Audits", "Compliance", "Vendors",
        "Assets", "Threats", "Vulnerabilities", "Exceptions", "Tasks"
    };

    private static readonly string[] FieldNames =
    {
        "Name", "Description", "Status", "Owner", "Created Date",
        "Modified Date", "Risk Score", "Control Type", "Category",
        "Priority", "Due Date", "Completion Date", "Notes", "Attachments"
    };

    private static readonly string[] RoleNames =
    {
        "System Administrator", "Application Owner", "Risk Manager", "Auditor",
        "Compliance Officer", "Read Only User", "Power User", "Report Viewer"
    };

    public static CollectedMetadata GenerateMockMetadata(ArcherEnvironment environment, CollectionOptions options, bool isSource)
    {
        var metadata = new CollectedMetadata { Environment = environment };

        if (options.IncludeModules)
            metadata.Modules = GenerateModules(10, isSource);

        if (options.IncludeFields)
            metadata.Fields = GenerateFields(metadata.Modules, isSource);

        if (options.IncludeLayouts)
            metadata.Layouts = GenerateLayouts(metadata.Modules);

        if (options.IncludeValuesLists)
            metadata.ValuesLists = GenerateValuesLists(12, isSource);

        if (options.IncludeRoles)
            metadata.Roles = GenerateRoles(isSource);

        if (options.IncludeReports)
            metadata.Reports = GenerateReports(10, isSource);

        if (options.IncludeDashboards)
            metadata.Dashboards = GenerateDashboards(5);

        return metadata;
    }

    private static List<Module> GenerateModules(int count, bool isSource)
    {
        var modules = new List<Module>();
        var usedNames = new HashSet<string>();

        for (int i = 0; i < count; i++)
        {
            var name = ModuleNames[i % ModuleNames.Length];
            if (usedNames.Contains(name)) name = $"{name} {i + 1}";
            usedNames.Add(name);

            modules.Add(new Module
            {
                Id = 1000 + i,
                Name = name,
                Guid = Guid.NewGuid(),
                Alias = name.ToLower().Replace(" ", "_"),
                Description = $"Module for {name}",
                LevelId = 100 + i,
                IsSubform = Random.NextDouble() < 0.2,
                FieldCount = Random.Next(10, 50)
            });
        }

        // Remove one module for target to simulate missing
        if (!isSource && modules.Count > 0)
            modules.RemoveAt(Random.Next(modules.Count));

        return modules;
    }

    private static List<Field> GenerateFields(List<Module> modules, bool isSource)
    {
        var fields = new List<Field>();
        var fieldId = 5000;

        foreach (var module in modules)
        {
            var usedNames = new HashSet<string>();
            var fieldCount = Random.Next(5, 12);

            for (int i = 0; i < fieldCount; i++)
            {
                var name = FieldNames[i % FieldNames.Length];
                if (usedNames.Contains(name)) name = $"{name} {i + 1}";
                usedNames.Add(name);

                var fieldType = (FieldType)Random.Next(Enum.GetValues<FieldType>().Length);
                var variation = !isSource && Random.NextDouble() < 0.2;

                fields.Add(new Field
                {
                    Id = fieldId++,
                    Name = name,
                    Guid = Guid.NewGuid(),
                    ModuleId = module.Id,
                    ModuleName = module.Name,
                    FieldType = fieldType,
                    IsRequired = variation ? !Random.NextDouble() < 0.3 : Random.NextDouble() < 0.3,
                    IsKey = name == "Name",
                    IsCalculated = Random.NextDouble() < 0.1,
                    MaxLength = fieldType == FieldType.Text ? Random.Next(50, 500) : null
                });
            }
        }

        // Remove some fields for target
        if (!isSource)
        {
            var removeCount = Random.Next(2, 4);
            for (int i = 0; i < removeCount && fields.Count > 0; i++)
                fields.RemoveAt(Random.Next(fields.Count));
        }

        return fields;
    }

    private static List<Layout> GenerateLayouts(List<Module> modules)
    {
        var layouts = new List<Layout>();
        var layoutId = 2000;

        foreach (var module in modules)
        {
            layouts.Add(new Layout
            {
                Id = layoutId++,
                Name = "Default Layout",
                Guid = Guid.NewGuid(),
                ModuleId = module.Id,
                ModuleName = module.Name,
                IsDefault = true,
                FieldIds = Enumerable.Range(5000, Random.Next(5, 15)).ToList()
            });
        }

        return layouts;
    }

    private static List<ValuesList> GenerateValuesLists(int count, bool isSource)
    {
        var listNames = new[] { "Risk Ratings", "Control Types", "Status Values", "Priority Levels", 
            "Impact Ratings", "Frequency Options", "Categories", "Regions", "Departments" };
        
        var lists = listNames.Take(count).Select((name, i) => new ValuesList
        {
            Id = 3000 + i,
            Name = name,
            Guid = Guid.NewGuid(),
            ValuesCount = Random.Next(3, 15),
            IsHierarchical = Random.NextDouble() < 0.2
        }).ToList();

        if (!isSource && lists.Count > 0)
            lists.RemoveAt(Random.Next(lists.Count));

        return lists;
    }

    private static List<Role> GenerateRoles(bool isSource)
    {
        var roles = RoleNames.Select((name, i) => new Role
        {
            Id = 12000 + i,
            Name = name,
            Guid = Guid.NewGuid(),
            Description = $"Role for {name}",
            UsersCount = Random.Next(0, 50),
            GroupsCount = Random.Next(0, 10),
            IsSystemRole = i < 3
        }).ToList();

        if (!isSource && roles.Count > 0)
            roles.RemoveAt(Random.Next(roles.Count));

        return roles;
    }

    private static List<Report> GenerateReports(int count, bool isSource)
    {
        var reportNames = new[] { "Risk Summary", "Control Effectiveness", "Compliance Dashboard",
            "Audit Findings", "Incident Trends", "Vendor Risk Overview", "Policy Compliance" };

        var reports = reportNames.Take(count).Select((name, i) => new Report
        {
            Id = 8000 + i,
            Name = name,
            Guid = Guid.NewGuid(),
            ReportType = (ReportType)Random.Next(4),
            IsShared = Random.NextDouble() < 0.7,
            Owner = "admin"
        }).ToList();

        if (!isSource && reports.Count > 0)
            reports.RemoveAt(Random.Next(reports.Count));

        return reports;
    }

    private static List<Dashboard> GenerateDashboards(int count)
    {
        var dashboardNames = new[] { "Executive Dashboard", "Risk Overview", "Compliance Status", 
            "Audit Summary", "Operational Metrics" };

        return dashboardNames.Take(count).Select((name, i) => new Dashboard
        {
            Id = 9000 + i,
            Name = name,
            Guid = Guid.NewGuid(),
            IViewsCount = Random.Next(2, 8),
            IsShared = Random.NextDouble() < 0.8,
            Owner = "admin"
        }).ToList();
    }
}
```

---

## Part 3: Web API Project

### Step 3.1: Create the API Project

1. Right-click `src` folder → **Add** → **New Project**
2. Search for **"ASP.NET Core Web API"**
3. Select it and click **Next**
4. Configure:
   - **Project name:** `ArcherComparisonTool.Api`
   - **Framework:** `.NET 8.0`
   - **Authentication type:** None
   - **Configure for HTTPS:** ✓ Checked
   - **Enable OpenAPI support:** ✓ Checked
   - **Use controllers:** ✓ Checked
5. Click **Create**

### Step 3.2: Add Project Reference

1. Right-click `ArcherComparisonTool.Api` → **Add** → **Project Reference**
2. Check `ArcherComparisonTool.Core`
3. Click **OK**

### Step 3.3: Delete Default Files

Delete these default files:
- `Controllers/WeatherForecastController.cs`
- `WeatherForecast.cs`

### Step 3.4: Create Program.cs

Replace the content of `Program.cs`:

```csharp
using ArcherComparisonTool.Core.Interfaces;
using ArcherComparisonTool.Core.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Archer Comparison Tool API", Version = "v1" });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Register services
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();
builder.Services.AddSingleton<IComparisonEngine, ComparisonEngine>();
builder.Services.AddSingleton<IExcelExporter, ExcelExporter>();
builder.Services.AddSingleton<IEnvironmentRepository>(sp =>
{
    var encryptionService = sp.GetRequiredService<IEncryptionService>();
    var filePath = Path.Combine(AppContext.BaseDirectory, "environments.json");
    return new FileEnvironmentRepository(filePath, encryptionService);
});

// Configure JSON options
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

var app = builder.Build();

// Configure the HTTP request pipeline
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
app.MapGet("/api/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
}));

app.Run();
```

### Step 3.5: Create DTO Models

Create a folder named `DTOs` and add:

**File: DTOs/ComparisonRequest.cs**
```csharp
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Api.DTOs;

public class ComparisonRequest
{
    public Guid SourceEnvironmentId { get; set; }
    public Guid TargetEnvironmentId { get; set; }
    public CollectionOptions Options { get; set; } = new();
}
```

**File: DTOs/ComparisonResponse.cs**
```csharp
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Api.DTOs;

public class ComparisonResponse
{
    public List<ComparisonResult> Results { get; set; } = new();
    public ComparisonSummary Summary { get; set; } = new();
}
```

**File: DTOs/ExportRequest.cs**
```csharp
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Api.DTOs;

public class ExportRequest
{
    public string SourceName { get; set; } = string.Empty;
    public string TargetName { get; set; } = string.Empty;
    public List<ComparisonResult> Results { get; set; } = new();
    public ComparisonSummary Summary { get; set; } = new();
}
```

**File: DTOs/EnvironmentDto.cs**
```csharp
namespace ArcherComparisonTool.Api.DTOs;

public class CreateEnvironmentDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string InstanceName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateEnvironmentDto
{
    public string? DisplayName { get; set; }
    public string? BaseUrl { get; set; }
    public string? InstanceName { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}
```

### Step 3.6: Create Controllers

**File: Controllers/EnvironmentsController.cs**
```csharp
using Microsoft.AspNetCore.Mvc;
using ArcherComparisonTool.Api.DTOs;
using ArcherComparisonTool.Core.Interfaces;
using ArcherComparisonTool.Core.Models;

namespace ArcherComparisonTool.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnvironmentsController : ControllerBase
{
    private readonly IEnvironmentRepository _repository;
    private readonly ILogger<EnvironmentsController> _logger;

    public EnvironmentsController(IEnvironmentRepository repository, ILogger<EnvironmentsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ArcherEnvironment>>> GetAll()
    {
        var environments = await _repository.GetAllAsync();
        return Ok(environments);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ArcherEnvironment>> GetById(Guid id)
    {
        var environment = await _repository.GetByIdAsync(id);
        if (environment == null)
            return NotFound();

        return Ok(environment);
    }

    [HttpPost]
    public async Task<ActionResult<ArcherEnvironment>> Create([FromBody] CreateEnvironmentDto dto)
    {
        var environment = new ArcherEnvironment
        {
            DisplayName = dto.DisplayName,
            BaseUrl = dto.BaseUrl,
            InstanceName = dto.InstanceName,
            Username = dto.Username,
            EncryptedPassword = dto.Password
        };

        var created = await _repository.AddAsync(environment);
        _logger.LogInformation("Created environment: {Name}", created.DisplayName);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ArcherEnvironment>> Update(Guid id, [FromBody] UpdateEnvironmentDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        existing.DisplayName = dto.DisplayName ?? existing.DisplayName;
        existing.BaseUrl = dto.BaseUrl ?? existing.BaseUrl;
        existing.InstanceName = dto.InstanceName ?? existing.InstanceName;
        existing.Username = dto.Username ?? existing.Username;
        
        if (!string.IsNullOrEmpty(dto.Password))
            existing.EncryptedPassword = dto.Password;

        var updated = await _repository.UpdateAsync(existing);
        _logger.LogInformation("Updated environment: {Name}", updated.DisplayName);

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted)
            return NotFound();

        _logger.LogInformation("Deleted environment: {Id}", id);
        return NoContent();
    }

    [HttpGet("{id:guid}/test")]
    public async Task<ActionResult> TestConnection(Guid id)
    {
        var environment = await _repository.GetByIdAsync(id);
        if (environment == null)
            return NotFound();

        // Simulate connection test
        await Task.Delay(500);

        return Ok(new
        {
            success = true,
            message = "Connection successful",
            version = "6.12.0.1"
        });
    }
}
```

**File: Controllers/ComparisonController.cs**
```csharp
using Microsoft.AspNetCore.Mvc;
using ArcherComparisonTool.Api.DTOs;
using ArcherComparisonTool.Core.Interfaces;
using ArcherComparisonTool.Core.Services;

namespace ArcherComparisonTool.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComparisonController : ControllerBase
{
    private readonly IEnvironmentRepository _repository;
    private readonly IComparisonEngine _comparisonEngine;
    private readonly ILogger<ComparisonController> _logger;

    public ComparisonController(
        IEnvironmentRepository repository,
        IComparisonEngine comparisonEngine,
        ILogger<ComparisonController> logger)
    {
        _repository = repository;
        _comparisonEngine = comparisonEngine;
        _logger = logger;
    }

    [HttpPost("compare")]
    public async Task<ActionResult<ComparisonResponse>> Compare([FromBody] ComparisonRequest request)
    {
        _logger.LogInformation("Starting comparison: {Source} vs {Target}",
            request.SourceEnvironmentId, request.TargetEnvironmentId);

        var sourceEnv = await _repository.GetByIdAsync(request.SourceEnvironmentId);
        var targetEnv = await _repository.GetByIdAsync(request.TargetEnvironmentId);

        if (sourceEnv == null || targetEnv == null)
            return BadRequest("Invalid environment ID(s)");

        // Generate mock metadata for demo
        var sourceMetadata = MockMetadataService.GenerateMockMetadata(sourceEnv, request.Options, true);
        var targetMetadata = MockMetadataService.GenerateMockMetadata(targetEnv, request.Options, false);

        // Simulate processing time
        await Task.Delay(1000);

        // Compare
        var results = _comparisonEngine.Compare(sourceMetadata, targetMetadata);
        var summary = _comparisonEngine.GenerateSummary(results);

        _logger.LogInformation("Comparison complete: {Total} items, {Matched} matched",
            summary.TotalItems, summary.MatchedCount);

        return Ok(new ComparisonResponse
        {
            Results = results,
            Summary = summary
        });
    }
}
```

**File: Controllers/ExportController.cs**
```csharp
using Microsoft.AspNetCore.Mvc;
using ArcherComparisonTool.Api.DTOs;
using ArcherComparisonTool.Core.Interfaces;

namespace ArcherComparisonTool.Api.Controllers;

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
    public ActionResult ExportToExcel([FromBody] ExportRequest request)
    {
        _logger.LogInformation("Exporting to Excel: {Source} vs {Target}",
            request.SourceName, request.TargetName);

        var bytes = _excelExporter.Export(
            request.SourceName,
            request.TargetName,
            request.Results,
            request.Summary
        );

        var filename = $"Archer_Comparison_{request.SourceName}_vs_{request.TargetName}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename);
    }
}
```

### Step 3.7: Configure launchSettings.json

Update `Properties/launchSettings.json`:

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "profiles": {
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "https://localhost:7001;http://localhost:5001",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

---

## Part 4: React Frontend Integration

### Step 4.1: Copy React Files

1. Create a folder `ArcherComparisonTool.Web` in your solution folder
2. Copy all frontend files from this project into that folder
3. The structure should be:
   ```
   ArcherComparisonTool.Web/
   ├── src/
   ├── public/
   ├── index.html
   ├── package.json
   ├── vite.config.ts
   └── ...
   ```

### Step 4.2: Update API Client Configuration

Edit `src/services/apiClient.ts` to point to your backend:

```typescript
const API_BASE_URL = 'https://localhost:7001/api';
```

### Step 4.3: Install Dependencies

Open terminal in `ArcherComparisonTool.Web` folder:

```bash
npm install
```

---

## Part 5: Running the Application

### Step 5.1: Set Startup Project

1. Right-click `ArcherComparisonTool.Api` → **Set as Startup Project**

### Step 5.2: Start the Backend

1. Press **F5** or click **Start Debugging** in Visual Studio
2. Swagger UI will open at `https://localhost:7001/swagger`
3. Keep Visual Studio running

### Step 5.3: Start the Frontend

1. Open a terminal in `ArcherComparisonTool.Web` folder
2. Run:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser

### Step 5.4: Verify Connection

1. The frontend should connect to the backend
2. Try adding an environment via the UI
3. Check the backend logs in Visual Studio

---

## Troubleshooting

### CORS Errors
Ensure `Program.cs` includes your React dev server URL in the CORS policy.

### Certificate Errors
Run: `dotnet dev-certs https --trust`

### Port Conflicts
Change ports in `launchSettings.json` and update `apiClient.ts`.

### Build Errors
1. Clean solution: **Build** → **Clean Solution**
2. Rebuild: **Build** → **Rebuild Solution**

---

## Next Steps

1. **Real Archer API Integration**: Replace `MockMetadataService` with actual RSA Archer API calls
2. **Authentication**: Add JWT authentication
3. **Database**: Replace file storage with SQL Server
4. **SignalR**: Add real-time progress updates during comparison
5. **Unit Tests**: Add test project with xUnit

---

## Summary

You now have a complete Visual Studio solution with:

- ✅ **Core Library** - All models, interfaces, and services
- ✅ **Web API** - RESTful endpoints for environments, comparison, and export
- ✅ **React Frontend** - Modern UI with Tailwind CSS
- ✅ **Excel Export** - Using native OpenXML (no third-party dependencies)
- ✅ **Password Encryption** - Using Windows DPAPI
- ✅ **Mock Data** - For testing without real Archer connection
