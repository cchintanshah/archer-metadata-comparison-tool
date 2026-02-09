# Archer Comparison Tool

A professional-grade application for comparing metadata between two RSA Archer GRC environments. This tool allows you to connect to multiple Archer instances, select specific metadata types, perform deep comparisons, and export results to styled Excel reports.

![Archer Comparison Tool](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.x-61DAFB)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)

## Features

- **Multi-Environment Support**: Connect to multiple Archer instances (Production, UAT, Development, etc.)
- **Comprehensive Metadata Comparison**: Compare Modules, Fields, Layouts, Values Lists, DDE Rules, Reports, Dashboards, Roles, and more
- **Deep Property Analysis**: Identify property-level differences between matching items
- **Four-Category Results**:
  - ✅ **Matched**: Items present in both environments with identical properties
  - ⚠️ **Mismatched**: Items present in both but with property differences
  - 🔴 **Missing in Target**: Items only in source environment
  - 🟠 **Missing in Source**: Items only in target environment
- **Excel Export**: Generate professional Excel reports with color-coded results and summary statistics
- **Secure Credentials**: Password encryption using Windows DPAPI

## Architecture

This application uses a modern full-stack architecture:

### Frontend (React)
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **SheetJS (xlsx)** for client-side Excel export

### Backend (.NET)
- **.NET 8.0 Web API**
- **EPPlus** for server-side Excel generation
- **Serilog** for logging
- **Windows DPAPI** for password encryption

## Quick Start

### Running the Frontend (Demo Mode)

The React frontend includes mock data services for demonstration:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 to use the application with mock data.

### Setting Up the Backend

See [DOTNET_BACKEND_SETUP.md](./DOTNET_BACKEND_SETUP.md) for complete Visual Studio setup instructions.

## Usage Guide

### 1. Configure Environments

1. Click **"Add Environment"** to add Archer instances
2. Enter the display name, base URL, instance name, and credentials
3. Click **"Test Connection"** to verify connectivity
4. Add both source and target environments

### 2. Select Environments

1. Choose a **Source Environment** from the dropdown
2. Choose a **Target Environment** from the dropdown

### 3. Configure Collection Options

1. Click **"Configure Collection"**
2. Select which metadata types to compare:
   - **Core Metadata**: Modules, Fields, Layouts, Values Lists
   - **Content & Reporting**: Reports, Dashboards, Workspaces, iViews
   - **Security**: Roles, Security Parameters
   - **Automation**: DDE Rules, Notifications, Data Feeds, Schedules

### 4. Run Comparison

1. Click **"Compare Environments"**
2. Watch the progress as metadata is collected and compared
3. Review results in the tabbed interface

### 5. Export Results

1. Click **"Export to Excel"** to download a detailed report
2. The Excel file includes:
   - Summary sheet with statistics
   - Separate sheets for each result category
   - Type-specific breakdown sheets

## Metadata Types Compared

| Type | Description | Key Properties |
|------|-------------|----------------|
| **Modules** | Applications and subforms | Name, Alias, IsSubform, FieldCount |
| **Fields** | Field definitions | FieldType, IsRequired, IsKey, MaxLength |
| **Layouts** | Form layouts | IsDefault, Field arrangement |
| **Values Lists** | Dropdown options | ValuesCount, IsHierarchical |
| **DDE Rules** | Automation rules | IsEnabled, TriggerType, ActionsCount |
| **Reports** | Report definitions | ReportType, IsShared, Owner |
| **Dashboards** | Dashboard configs | iViewsCount, IsShared |
| **Roles** | Security roles | UsersCount, GroupsCount, IsSystemRole |
| **Data Feeds** | Import configurations | FeedType, IsEnabled, Schedule |
| **Schedules** | Scheduled jobs | Frequency, IsEnabled |

## Comparison Logic

### Matching Algorithm

Items are matched across environments using composite keys:
- **Simple items** (Modules, Reports, Roles): Matched by name
- **Nested items** (Fields, Layouts): Matched by `ParentName::ItemName`

### Property Comparison

All public properties are compared except technical IDs:
- Excluded: `Id`, `Guid`, `ModuleId`, `FieldIds`, etc.
- Boolean values formatted as "Yes"/"No"
- Arrays shown as "[N items]"

### Severity Levels

- **Critical**: Missing items or changes to `IsRequired`, `IsEnabled`, `FieldType`
- **Warning**: Changes to `IsDefault`, `IsShared`, or other properties
- **Info**: Matched items

## Project Structure

```
archer-comparison-tool/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── Header.tsx
│   │   ├── EnvironmentSelector.tsx
│   │   ├── ActionBar.tsx
│   │   ├── ResultsSummary.tsx
│   │   ├── ResultsTabs.tsx
│   │   ├── EnvironmentDialog.tsx
│   │   └── CollectionDialog.tsx
│   ├── services/                 # Business logic
│   │   ├── apiClient.ts          # Backend API client
│   │   ├── mockDataService.ts    # Mock data generator
│   │   ├── comparisonEngine.ts   # Comparison logic
│   │   ├── metadataCollector.ts  # Data collection
│   │   └── excelExporter.ts      # Excel export
│   ├── store/                    # State management
│   │   └── appStore.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   └── App.tsx                   # Main component
├── DOTNET_BACKEND_SETUP.md       # Backend setup guide
└── README.md                     # This file
```

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.x | State Management |
| Lucide React | 0.5x | Icons |
| SheetJS | 0.18.x | Excel Export |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | Runtime |
| ASP.NET Core | 8.0 | Web API |
| EPPlus | 7.x | Excel Generation |
| Serilog | 3.x | Logging |
| Swashbuckle | 6.x | API Documentation |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is provided for educational and demonstration purposes.

## Acknowledgments

- RSA Archer GRC Platform
- React Team
- .NET Team
- Tailwind CSS Team
